"use client";
import { useState, useEffect } from "react";

const PAIRS = [
  { emoji: "🌸", label: "Сакура" },
  { emoji: "🦋", label: "Бабочка" },
  { emoji: "🌙", label: "Луна" },
  { emoji: "✦", label: "Феникс" },
  { emoji: "🔥", label: "Огонь" },
  { emoji: "🎋", label: "Бамбук" },
];

type Card = { id: number; pairId: number; emoji: string; label: string; flipped: boolean; matched: boolean };

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initCards(): Card[] {
  const cards: Card[] = [];
  PAIRS.forEach((p, i) => {
    cards.push({ id: i * 2, pairId: i, emoji: p.emoji, label: p.label, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, pairId: i, emoji: p.emoji, label: p.label, flipped: false, matched: false });
  });
  return shuffle(cards);
}

export default function MemoryGame({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<Card[]>(initCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (cards.every(c => c.matched)) setWon(true);
  }, [cards]);

  function handleClick(id: number) {
    if (locked || won) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [first, second] = newFlipped.map(fid => newCards.find(c => c.id === fid)!);
      if (first.pairId === second.pairId) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.pairId === first.pairId ? { ...c, matched: true } : c));
          setFlipped([]);
          setLocked(false);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 800);
      }
    }
  }

  function restart() {
    setCards(initCards());
    setFlipped([]);
    setLocked(false);
    setMoves(0);
    setWon(false);
  }

  const accent = "#d4818a";

  return (
    <div style={{ padding: "1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "0.75rem" }}>
        Ходы: {moves}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.6rem", maxWidth: "20rem", margin: "0 auto" }}>
        {cards.map((card) => (
          <button key={card.id} onClick={() => handleClick(card.id)}
            style={{
              aspectRatio: "1", borderRadius: "0.75rem", border: `1px solid ${card.matched ? accent : card.flipped ? accent : "#e8e0da"}`,
              background: card.matched ? `linear-gradient(135deg, ${accent}15, ${accent}08)` : card.flipped ? "white" : `linear-gradient(135deg, ${accent}20, ${accent}08)`,
              cursor: card.matched || card.flipped ? "default" : "pointer",
              fontSize: card.flipped || card.matched ? "1.5rem" : "0",
              transition: "all 0.3s",
              boxShadow: card.matched ? `0 0 12px ${accent}20` : "none",
              opacity: card.matched ? 0.6 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: accent,
              fontWeight: card.flipped ? 400 : "bold",
            }}>
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
      {won && (
        <div style={{ marginTop: "1.25rem" }}>
          <p style={{ color: accent, fontSize: "1rem", margin: "0 0 0.75rem" }}>Пара найдена! 🎉</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button onClick={restart} style={btnStyle(accent)}>Заново</button>
            <button onClick={onClose} style={{ ...btnStyle(accent), background: "#f0ebe6", color: "#666" }}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = (accent: string): React.CSSProperties => ({
  padding: "0.6rem 1.5rem", borderRadius: "0.75rem",
  background: accent, color: "white", fontWeight: 500,
  border: "none", cursor: "pointer", fontSize: "0.85rem",
  letterSpacing: "0.05em",
});
