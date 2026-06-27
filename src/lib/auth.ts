import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const SESSION_COOKIE = "phoenix_session";
const SESSION_VALUE = "authenticated";

const passwordFile = path.join(
  process.env.NODE_ENV === "development" ? process.cwd() : "/tmp/data",
  "password.txt"
);

function getStoredPassword(): string {
  try {
    if (fs.existsSync(passwordFile)) {
      return fs.readFileSync(passwordFile, "utf-8").trim();
    }
  } catch {}
  return process.env.ADMIN_PASSWORD || "admin123";
}

function storePassword(password: string): void {
  const dir = path.dirname(passwordFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(passwordFile, password, "utf-8");
}

export function verifyPassword(password: string): boolean {
  return password === getStoredPassword();
}

export function changePassword(oldPassword: string, newPassword: string): boolean {
  if (!verifyPassword(oldPassword)) return false;
  storePassword(newPassword);
  return true;
}

export async function setSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
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
