import { getData, setData } from "@/lib/db";

export async function GET() {
  const raw = await getData("reviews");
  const reviews = raw ? JSON.parse(raw) : [];
  return Response.json(reviews);
}

export async function POST(request: Request) {
  const { name, message } = await request.json();

  if (!name || !message) {
    return Response.json({ error: "Имя и сообщение обязательны" }, { status: 400 });
  }

  if (name.length > 50) {
    return Response.json({ error: "Имя слишком длинное" }, { status: 400 });
  }

  if (message.length > 500) {
    return Response.json({ error: "Сообщение слишком длинное" }, { status: 400 });
  }

  const raw = await getData("reviews");
  const reviews = raw ? JSON.parse(raw) : [];
  const newReview = {
    id: Date.now(),
    name: name.trim(),
    message: message.trim(),
    created_at: new Date().toISOString(),
  };
  reviews.unshift(newReview);
  await setData("reviews", JSON.stringify(reviews));
  return Response.json(newReview);
}

export async function PUT(request: Request) {
  const { id, message } = await request.json();

  if (!id || !message) {
    return Response.json({ error: "ID и сообщение обязательны" }, { status: 400 });
  }

  if (message.length > 500) {
    return Response.json({ error: "Сообщение слишком длинное" }, { status: 400 });
  }

  const raw = await getData("reviews");
  const reviews = raw ? JSON.parse(raw) : [];
  const idx = reviews.findIndex((r: { id: number }) => r.id === id);
  if (idx === -1) return Response.json({ error: "Не найдено" }, { status: 404 });
  reviews[idx].message = message.trim();
  await setData("reviews", JSON.stringify(reviews));
  return Response.json(reviews[idx]);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID обязателен" }, { status: 400 });
  }

  const raw = await getData("reviews");
  const reviews = raw ? JSON.parse(raw) : [];
  const filtered = reviews.filter((r: { id: number }) => r.id !== Number(id));
  await setData("reviews", JSON.stringify(filtered));
  return Response.json({ success: true });
}
