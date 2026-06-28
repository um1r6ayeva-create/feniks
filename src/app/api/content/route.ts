import { NextRequest } from "next/server";
import { getContent, saveContent } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export const maxDuration = 30;

export async function GET() {
  return Response.json(await getContent());
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await saveContent(body);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Content save error:", err);
    return Response.json({ error: err.message || "Ошибка сохранения" }, { status: 500 });
  }
}
