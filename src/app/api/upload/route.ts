import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const maxDuration = 30;

async function resizeImage(buffer: ArrayBuffer, maxSize = 800, quality = 80): Promise<string> {
  const { default: sharp } = await import("sharp");
  const resized = await sharp(Buffer.from(buffer))
    .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}

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

    const buffer = await file.arrayBuffer();

    if (buffer.byteLength > 5 * 1024 * 1024) {
      return Response.json({ error: "Файл слишком большой (макс 5MB)" }, { status: 400 });
    }

    const base64 = await resizeImage(buffer);

    return Response.json({ url: base64 });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
