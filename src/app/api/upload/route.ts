import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { put } from "@vercel/blob";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "Файл не выбран" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `feniks/${Date.now()}.${ext}`;

    const blob = await put(fileName, file, {
      access: "public",
    });

    return Response.json({ url: blob.url });
  } catch (err: any) {
    console.error("Upload error:", err?.message || err);
    return Response.json({ error: err?.message || "Ошибка загрузки" }, { status: 500 });
  }
}
