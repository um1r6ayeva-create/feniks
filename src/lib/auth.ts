import { cookies } from "next/headers";
import { getData, setData } from "./db";

const SESSION_COOKIE = "phoenix_session";
const SESSION_VALUE = "authenticated";

async function getStoredPassword(): Promise<string> {
  try {
    const stored = await getData("password");
    if (stored) return stored;
  } catch {}
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function verifyPassword(password: string): Promise<boolean> {
  return password === (await getStoredPassword());
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
  if (!(await verifyPassword(oldPassword))) return false;
  await setData("password", newPassword);
  return true;
}

export async function setSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
