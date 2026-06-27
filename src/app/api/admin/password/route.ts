import { NextRequest } from "next/server";
import { changePassword, isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await request.json();

  if (!changePassword(oldPassword, newPassword)) {
    return Response.json({ error: "Неверный старый пароль" }, { status: 400 });
  }

  return Response.json({ success: true });
}
