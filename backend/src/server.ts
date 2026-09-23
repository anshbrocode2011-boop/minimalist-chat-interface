import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";

const app = express();
const server = http.createServer(app);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT ?? 3000);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET is required");
const clients = new Map<string, Set<WebSocket>>();
const dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendCandidates = [path.resolve(dirname, "../../dist"), path.resolve(dirname, "../../.output/public")];
const frontendDir = frontendCandidates.find((candidate) => fs.existsSync(path.join(candidate, "index.html"))) ?? frontendCandidates[0];

type Identity = { id: string; chatId: string };
type AuthRequest = Request & { user?: Identity };
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "").split(",").map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json({ limit: "64kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true }));
const auth = (req: AuthRequest, res: Response, next: NextFunction) => { try { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ""); if (!token) throw new Error(); req.user = jwt.verify(token, jwtSecret) as Identity; next(); } catch { res.status(401).json({ error: "Authentication required" }); } };
const sendTo = (userId: string, event: unknown) => clients.get(userId)?.forEach((socket) => { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event)); });
const createChatId = async () => { for (;;) { const id = `BAAT-${Math.floor(10000 + Math.random() * 90000)}`; const result = await pool.query("SELECT 1 FROM users WHERE chat_id=$1", [id]); if (!result.rowCount) return id; } };
const safeUser = (row: Record<string, unknown>) => ({ id: row.id, chatId: row.chat_id, username: row.username, displayName: row.display_name ?? row.username, bio: row.bio ?? "", status: row.status ?? "Available", avatarUrl: row.avatar_url ?? null, accent: row.accent ?? "#9bf6ff" });

app.get("/health", (_req, res) => res.json({ ok: true, service: "baat" }));
app.post("/api/auth/register", async (req, res) => { const parsed = z.object({ username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/), password: z.string().min(8).max(128) }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Username or password is invalid" }); try { const chatId = await createChatId(); const hash = await argon2.hash(parsed.data.password); const result = await pool.query("INSERT INTO users(chat_id,username,password_hash) VALUES($1,$2,$3) RETURNING id,chat_id,username", [chatId, parsed.data.username, hash]); await pool.query("INSERT INTO profiles(user_id,display_name) VALUES($1,$2)", [result.rows[0].id, parsed.data.username]); return res.status(201).json({ token: jwt.sign({ id: result.rows[0].id, chatId }, jwtSecret, { expiresIn: "30d" }), user: { ...result.rows[0], chatId, displayName: parsed.data.username } }); } catch (error) { const code = (error as { code?: string }).code; return res.status(code === "23505" ? 409 : 500).json({ error: code === "23505" ? "Username already taken" : "Could not create account" }); } });
app.post("/api/auth/login", async (req, res) => { const parsed = z.object({ chatId: z.string().trim().toUpperCase(), password: z.string() }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Invalid credentials" }); const result = await pool.query("SELECT u.*,p.* FROM users u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.chat_id=$1", [parsed.data.chatId]); if (!result.rowCount || !(await argon2.verify(result.rows[0].password_hash, parsed.data.password))) return res.status(401).json({ error: "Invalid Chat ID or password" }); const user = result.rows[0]; return res.json({ token: jwt.sign({ id: user.id, chatId: user.chat_id }, jwtSecret, { expiresIn: "30d" }), user: safeUser(user) }); });
app.post("/api/auth/logout", auth, (_req, res) => res.json({ ok: true }));
app.get("/api/users/search", auth, async (req: AuthRequest, res) => { const q = String(req.query.q ?? "").trim().slice(0, 32); if (!q) return res.json({ users: [] }); const result = await pool.query("SELECT u.*,p.* FROM users u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.chat_id ILIKE $1 OR u.username ILIKE $1 OR p.display_name ILIKE $1 LIMIT 20", [`%${q}%`]); res.json({ users: result.rows.filter((row) => row.id !== req.user!.id).map(safeUser) }); });
app.get("/api/chats", auth, async (req: AuthRequest, res) => { const result = await pool.query(`SELECT c.id,c.updated_at,u.chat_id,u.username,p.display_name,p.avatar_url,p.accent FROM chats c JOIN chat_members own ON own.chat_id=c.id AND own.user_id=$1 JOIN chat_members other ON other.chat_id=c.id AND other.user_id<>$1 JOIN users u ON u.id=other.user_id LEFT JOIN profiles p ON p.user_id=u.id ORDER BY c.updated_at DESC`, [req.user!.id]); res.json({ chats: result.rows.map((row) => ({ id: row.id, chatId: row.chat_id, username: row.username, displayName: row.display_name, avatarUrl: row.avatar_url, accent: row.accent, updatedAt: row.updated_at })) }); });
app.post("/api/chats", auth, async (req: AuthRequest, res) => { const target = await pool.query("SELECT id FROM users WHERE chat_id=$1", [String(req.body.chatId ?? "").toUpperCase()]); if (!target.rowCount || target.rows[0].id === req.user!.id) return res.status(404).json({ error: "User not found" }); const existing = await pool.query("SELECT c.id FROM chats c JOIN chat_members a ON a.chat_id=c.id AND a.user_id=$1 JOIN chat_members b ON b.chat_id=c.id AND b.user_id=$2", [req.user!.id, target.rows[0].id]); if (existing.rowCount) return res.json({ id: existing.rows[0].id }); const chat = await pool.query("INSERT INTO chats DEFAULT VALUES RETURNING id"); await pool.query("INSERT INTO chat_members(chat_id,user_id) VALUES($1,$2),($1,$3)", [chat.rows[0].id, req.user!.id, target.rows[0].id]); res.status(201).json({ id: chat.rows[0].id }); });
app.get("/api/chats/:id/messages", auth, async (req: AuthRequest, res) => { const member = await pool.query("SELECT 1 FROM chat_members WHERE chat_id=$1 AND user_id=$2", [req.params.id, req.user!.id]); if (!member.rowCount) return res.status(403).json({ error: "Not a chat member" }); const messages = await pool.query("SELECT id,body,sender_id,created_at,read_at FROM messages WHERE chat_id=$1 AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 200", [req.params.id]); res.json({ messages: messages.rows.map((message) => ({ id: message.id, body: message.body, mine: message.sender_id === req.user!.id, time: message.created_at, read: Boolean(message.read_at) })) }); });
app.post("/api/chats/:id/messages", auth, async (req: AuthRequest, res) => { const body = z.string().trim().min(1).max(4000).safeParse(req.body.body); if (!body.success) return res.status(400).json({ error: "Message is invalid" }); const member = await pool.query("SELECT user_id FROM chat_members WHERE chat_id=$1", [req.params.id]); if (!member.rows.some((row) => row.user_id === req.user!.id)) return res.status(403).json({ error: "Not a chat member" }); const message = await pool.query("INSERT INTO messages(chat_id,sender_id,body) VALUES($1,$2,$3) RETURNING id,body,created_at", [req.params.id, req.user!.id, body.data]); await pool.query("UPDATE chats SET updated_at=now() WHERE id=$1", [req.params.id]); const event = { type: "message.created", chatId: req.params.id, message: { id: message.rows[0].id, body: message.rows[0].body, time: message.rows[0].created_at, mine: false } }; member.rows.forEach((row) => sendTo(row.user_id, event)); res.status(201).json({ id: message.rows[0].id, body: message.rows[0].body, time: message.rows[0].created_at, mine: true }); });

const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (socket, request) => { try { const token = new URL(request.url ?? "", "http://localhost").searchParams.get("token"); const identity = jwt.verify(token ?? "", jwtSecret) as Identity; const connections = clients.get(identity.id) ?? new Set<WebSocket>(); connections.add(socket); clients.set(identity.id, connections); socket.on("close", () => { connections.delete(socket); if (!connections.size) clients.delete(identity.id); }); } catch { socket.close(1008, "Unauthorized"); } });

app.use(express.static(frontendDir));
app.get("*", (req, res, next) => { if (req.path.startsWith("/api/") || req.path === "/health") return next(); res.sendFile(path.join(frontendDir, "index.html"), (error) => { if (error) next(error); }); });
async function start() { if (process.env.DATABASE_URL) { const schema = await fs.promises.readFile(path.resolve(dirname, "../schema.sql"), "utf8"); await pool.query(schema); } server.listen(port, "0.0.0.0", () => console.log(`Baat listening on port ${port}`)); }
start().catch((error) => { console.error("Startup failed", error); process.exit(1); });
