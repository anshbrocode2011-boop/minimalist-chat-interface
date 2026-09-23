const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export type BaatUser = { id: string; chatId: string; username: string; displayName?: string; bio?: string; status?: string; avatarUrl?: string; accent?: string };
export type AuthResponse = { token: string; user: BaatUser };
export type ChatSummary = { id: string; chatId?: string; userId?: string; updatedAt?: string; displayName?: string; username?: string; avatarUrl?: string; accent?: string; preview?: string; time?: string; online?: boolean; unread?: number };
export type ChatMessage = { id: string; body: string; mine: boolean; time: string; read?: boolean };
function getAuthHeaders(token?: string) { const headers: Record<string, string> = { "Content-Type": "application/json" }; if (token) headers.Authorization = `Bearer ${token}`; return headers; }
async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> { const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...getAuthHeaders(token), ...(options.headers ?? {}) } }); if (!response.ok) { let message = "Request failed"; try { const payload = await response.json(); if (typeof payload?.error === "string") message = payload.error; } catch {} throw new Error(message); } return response.status === 204 ? (undefined as T) : response.json() as Promise<T>; }
export const registerUser = (username: string, password: string) => request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password }) });
export const loginUser = (chatId: string, password: string) => request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ chatId: chatId.toUpperCase(), password }) });
export const logoutUser = (token: string) => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }, token);
export async function searchPeople(query: string, token: string) { if (!query.trim()) return []; const payload = await request<{ users?: BaatUser[] }>(`/api/users/search?q=${encodeURIComponent(query)}`, { method: "GET" }, token); return payload.users ?? []; }
export async function getChats(token: string) { const payload = await request<{ chats?: ChatSummary[] }>("/api/chats", { method: "GET" }, token); return payload.chats ?? []; }
export async function createChat(chatId: string, token: string) { return request<{ id: string }>("/api/chats", { method: "POST", body: JSON.stringify({ chatId }) }, token); }
export async function getMessages(chatId: string, token: string) { const payload = await request<{ messages?: ChatMessage[] }>(`/api/chats/${chatId}/messages`, { method: "GET" }, token); return payload.messages ?? []; }
export async function sendMessage(chatId: string, body: string, token: string) { return request<ChatMessage>(`/api/chats/${chatId}/messages`, { method: "POST", body: JSON.stringify({ body }) }, token); }
export function readStoredSession(): { token: string; user: BaatUser } | null { if (typeof window === "undefined") return null; const token = localStorage.getItem("baat-token"); const user = localStorage.getItem("baat-user"); if (!token || !user) return null; try { return { token, user: JSON.parse(user) as BaatUser }; } catch { clearSession(); return null; } }
export function persistSession(token: string, user: BaatUser) { if (typeof window !== "undefined") { localStorage.setItem("baat-token", token); localStorage.setItem("baat-user", JSON.stringify(user)); } }
export function clearSession() { if (typeof window !== "undefined") { localStorage.removeItem("baat-token"); localStorage.removeItem("baat-user"); } }
