import { getReviews, addReview } from "@/lib/db";

export async function GET() {
  const reviews = await getReviews();
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

  const review = await addReview(name.trim(), message.trim());
  return Response.json(review);
}
