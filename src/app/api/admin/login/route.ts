import { NextRequest } from "next/server";
import { verifyPassword, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!(await verifyPassword(password))) {
    return Response.json({ error: "Неверный пароль" }, { status: 401 });
  }

  await setSession();
  return Response.json({ success: true });
}
