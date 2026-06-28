"use client";

import { useEffect, useState, useRef } from "react";

type Review = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

export default function ReviewsChat({ onClose }: { onClose: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reviews]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setReviews((prev) => [data, ...prev]);
        setMessage("");
      }
    } catch {
      setError("Ошибка отправки");
    }
    setSending(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "70vh", maxHeight: "500px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #f0ebe6" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#333" }}>Пожелания и отзывы</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.1rem", color: "#999", cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {reviews.length === 0 && (
          <div style={{ textAlign: "center", color: "#aaa", fontSize: "0.8rem", padding: "2rem 0" }}>
            Будьте первым! Оставьте пожелание или отзыв ✨
          </div>
        )}
        {reviews.map((r) => (
          <div key={r.id} style={{ background: "#faf8f6", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#d4818a" }}>{r.name}</span>
              <span style={{ fontSize: "0.6rem", color: "#ccc" }}>{new Date(r.created_at).toLocaleDateString("ru")}</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.5, color: "#555" }}>{r.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #f0ebe6", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {error && <div style={{ color: "#e74c3c", fontSize: "0.7rem" }}>{error}</div>}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" maxLength={50}
          style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e8e0da", fontSize: "0.8rem", outline: "none", background: "#faf8f6" }} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Напишите пожелание или отзыв..." maxLength={500}
            style={{ flex: 1, padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e8e0da", fontSize: "0.8rem", outline: "none", background: "#faf8f6" }} />
          <button type="submit" disabled={sending || !name.trim() || !message.trim()}
            style={{ padding: "0.6rem 1.2rem", borderRadius: "0.5rem", background: "#d4818a", color: "white", border: "none", fontSize: "0.8rem", fontWeight: 500, cursor: sending ? "default" : "pointer", opacity: sending || !name.trim() || !message.trim() ? 0.5 : 1 }}>
            {sending ? "..." : "➤"}
          </button>
        </div>
      </form>
    </div>
  );
}
