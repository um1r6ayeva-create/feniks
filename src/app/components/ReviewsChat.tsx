"use client";

import { useEffect, useState, useRef } from "react";

type Review = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

export default function ReviewsChat({ onClose, isAdmin }: { onClose: () => void; isAdmin?: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
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

  async function handleDelete(id: number) {
    if (!confirm("Удалить сообщение?")) return;
    try {
      await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  }

  async function handleEdit(id: number) {
    if (!editText.trim()) return;
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, message: editText.trim() }),
      });
      const data = await res.json();
      if (!data.error) {
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, message: data.message } : r));
        setEditingId(null);
        setEditText("");
      }
    } catch {}
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "70vh", maxHeight: "500px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #eee" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#222" }}>Пожелания и отзывы</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.1rem", color: "#666", cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ background: "#f5f5f5", borderRadius: "0.75rem", padding: "0.75rem 1rem", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#d4818a" }}>{r.name}</span>
              <span style={{ fontSize: "0.6rem", color: "#999" }}>{new Date(r.created_at).toLocaleDateString("ru")}</span>
            </div>
            {editingId === r.id ? (
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
                <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus
                  style={{ flex: 1, padding: "0.3rem 0.5rem", borderRadius: "0.4rem", border: "1px solid #ddd", fontSize: "0.8rem", outline: "none" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleEdit(r.id); if (e.key === "Escape") setEditingId(null); }} />
                <button onClick={() => handleEdit(r.id)} style={{ background: "#d4818a", color: "white", border: "none", borderRadius: "0.4rem", padding: "0.3rem 0.6rem", fontSize: "0.7rem", cursor: "pointer" }}>✓</button>
                <button onClick={() => setEditingId(null)} style={{ background: "#ccc", color: "white", border: "none", borderRadius: "0.4rem", padding: "0.3rem 0.6rem", fontSize: "0.7rem", cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.5, color: "#333" }}>{r.message}</p>
            )}
            {isAdmin && editingId !== r.id && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
                <button onClick={() => { setEditingId(r.id); setEditText(r.message); }} style={{ background: "none", border: "none", color: "#999", fontSize: "0.65rem", cursor: "pointer", padding: 0 }}>✎ Ред.</button>
                <button onClick={() => handleDelete(r.id)} style={{ background: "none", border: "none", color: "#e74c3c", fontSize: "0.65rem", cursor: "pointer", padding: 0 }}>✕ Удал.</button>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #eee", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {error && <div style={{ color: "#e74c3c", fontSize: "0.7rem" }}>{error}</div>}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" maxLength={50}
          style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd", fontSize: "0.8rem", outline: "none", background: "#fff", color: "#222" }} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Напишите пожелание или отзыв..." maxLength={500}
            style={{ flex: 1, padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd", fontSize: "0.8rem", outline: "none", background: "#fff", color: "#222" }} />
          <button type="submit" disabled={sending || !name.trim() || !message.trim()}
            style={{ padding: "0.6rem 1.2rem", borderRadius: "0.5rem", background: "#d4818a", color: "white", border: "none", fontSize: "0.8rem", fontWeight: 500, cursor: sending ? "default" : "pointer", opacity: sending || !name.trim() || !message.trim() ? 0.5 : 1 }}>
            {sending ? "..." : "➤"}
          </button>
        </div>
      </form>
    </div>
  );
}
