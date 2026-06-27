import { NextRequest } from "next/server";
import { getContent, saveContent } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  return Response.json(getContent());
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  saveContent(body);
  return Response.json({ success: true });
}
