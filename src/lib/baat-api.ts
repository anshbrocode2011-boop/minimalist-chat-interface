const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000";

export type BaatUser = {
  id: string;
  chatId: string;
  username: string;
  displayName?: string;
  bio?: string;
  status?: string;
  avatarUrl?: string;
  accent?: string;
};

export type AuthResponse = {
  token: string;
  user: BaatUser;
};

export type ChatSummary = {
  id: number;
  chatId?: string;
  userId?: string;
  updatedAt?: string;
  displayName?: string;
  username?: string;
  chat_id?: string;
  name?: string;
  preview?: string;
  time?: string;
  online?: boolean;
  unread?: number;
};

export type ChatMessage = {
  id: number;
  body: string;
  mine: boolean;
  time: string;
  read?: boolean;
};

function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parsing failures and keep the fallback error.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function registerUser(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function loginUser(chatId: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ chatId: chatId.toUpperCase(), password }),
  });
}

export async function searchPeople(query: string, token: string): Promise<BaatUser[]> {
  if (!query.trim()) return [];
  const payload = await request<{ users?: BaatUser[]; results?: BaatUser[] }>(`/api/users/search?q=${encodeURIComponent(query)}`, { method: "GET" }, token);
  const users = payload.users ?? payload.results ?? [];
  return users;
}

export async function getChats(token: string): Promise<ChatSummary[]> {
  const payload = await request<{ chats?: ChatSummary[] }>("/api/chats", { method: "GET" }, token);
  return payload.chats ?? [];
}

export async function getMessages(chatId: number, token: string): Promise<ChatMessage[]> {
  const payload = await request<{ messages?: ChatMessage[] }>(`/api/chats/${chatId}/messages`, { method: "GET" }, token);
  return payload.messages ?? [];
}

export async function sendMessage(chatId: number, body: string, token: string): Promise<void> {
  await request(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  }, token);
}

export function readStoredSession(): { token: string; user: BaatUser } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("baat-token");
  const user = localStorage.getItem("baat-user");
  if (!token || !user) return null;

  try {
    return { token, user: JSON.parse(user) as BaatUser };
  } catch {
    localStorage.removeItem("baat-token");
    localStorage.removeItem("baat-user");
    return null;
  }
}

export function persistSession(token: string, user: BaatUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("baat-token", token);
  localStorage.setItem("baat-user", JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("baat-token");
  localStorage.removeItem("baat-user");
}
