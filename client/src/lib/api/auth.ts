import { apiBaseUrl } from "@/lib/api/base";

const base = apiBaseUrl;

async function parseErr(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  return `HTTP ${res.status}`;
}

export type AuthUser = {
  email: string;
};

export async function loginAdmin(body: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch(`${base()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { email: string };
  return { email: data.email };
}

export async function logoutAdmin(): Promise<void> {
  const res = await fetch(`${base()}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseErr(res));
}

export async function fetchCurrentAdmin(): Promise<AuthUser | null> {
  const res = await fetch(`${base()}/api/v1/auth/me`, {
    credentials: "include",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { email: string };
  return { email: data.email };
}
