const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const ACCESS_TOKEN_KEY = "cloud_access_token";
const REFRESH_TOKEN_KEY = "cloud_refresh_token";
const USER_KEY = "cloud_user";

export interface AuthUser {
  id: string;
  email: string | null;
  created_at?: string;
}

interface AuthResponse {
  user: AuthUser | null;
  session: {
    access_token?: string;
    refresh_token?: string;
  } | null;
}

function setStoredAuth(data: AuthResponse) {
  const accessToken = data.session?.access_token;
  const refreshToken = data.session?.refresh_token;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function getAuthHeaders(extra?: HeadersInit) {
  const token = getAccessToken();
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(res: Response) {
  try {
    const body = await res.json();
    return body?.error ?? "Neočakávaná chyba";
  } catch {
    return "Neočakávaná chyba";
  }
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as AuthResponse;
  setStoredAuth(data);
  return data;
}

export async function signUp(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as AuthResponse;
  setStoredAuth(data);
  return data;
}

export async function getMe() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const message = await parseError(res);
    clearStoredAuth();
    throw new Error(message);
  }

  const body = (await res.json()) as { user: AuthUser };
  localStorage.setItem(USER_KEY, JSON.stringify(body.user));
  return body.user;
}

export async function signOut() {
  await fetch(`${API_URL}/api/auth/signout`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  clearStoredAuth();
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirectTo }),
  });

  if (!res.ok) throw new Error(await parseError(res));
}

export async function changePassword(password: string) {
  const res = await fetch(`${API_URL}/api/auth/update-password`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ password }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
