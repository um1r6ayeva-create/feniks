"use client";
import { useState } from "react";

const ALL_PAIRS = [
  { emoji: "🌸", label: "Сакура" },
  { emoji: "🦋", label: "Бабочка" },
  { emoji: "🌙", label: "Луна" },
  { emoji: "✦", label: "Феникс" },
  { emoji: "🔥", label: "Огонь" },
  { emoji: "🎋", label: "Бамбук" },
  { emoji: "🌺", label: "Гибискус" },
  { emoji: "🍃", label: "Лист" },
  { emoji: "⭐", label: "Звезда" },
  { emoji: "🪷", label: "Лотос" },
];

type Difficulty = "easy" | "medium" | "hard";

const LEVELS: Record<Difficulty, { pairs: number; cols: number; label: string; desc: string }> = {
  easy:   { pairs: 6,  cols: 4, label: "Легко",   desc: "4×3 · 6 пар" },
  medium: { pairs: 8,  cols: 4, label: "Средне",  desc: "4×4 · 8 пар" },
  hard:   { pairs: 10, cols: 5, label: "Сложно",  desc: "5×4 · 10 пар" },
};

type Card = { id: number; pairId: number; emoji: string; label: string; flipped: boolean; matched: boolean };

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initCards(level: Difficulty): Card[] {
  const { pairs } = LEVELS[level];
  const selected = shuffle(ALL_PAIRS).slice(0, pairs);
  const cards: Card[] = [];
  selected.forEach((p, i) => {
    cards.push({ id: i * 2, pairId: i, emoji: p.emoji, label: p.label, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, pairId: i, emoji: p.emoji, label: p.label, flipped: false, matched: false });
  });
  return shuffle(cards);
}

export default function MemoryGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  function startGame(lvl: Difficulty) {
    setLevel(lvl);
    setCards(initCards(lvl));
    setFlipped([]);
    setLocked(false);
    setMoves(0);
    setWon(false);
  }

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
    if (level) {
      setCards(initCards(level));
      setFlipped([]);
      setLocked(false);
      setMoves(0);
      setWon(false);
    }
  }

  const accent = "#d4818a";
  const cols = level ? LEVELS[level].cols : 4;

  if (!level) {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.9rem", color: "#333", marginBottom: "1rem", fontWeight: 500 }}>Выберите сложность</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "18rem", margin: "0 auto" }}>
          {(["easy", "medium", "hard"] as Difficulty[]).map((lvl) => (
            <button key={lvl} onClick={() => startGame(lvl)}
              style={{
                padding: "1rem", borderRadius: "0.75rem", border: `1px solid ${accent}30`,
                background: `linear-gradient(135deg, ${accent}10, ${accent}05)`,
                cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accent}30`; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#333" }}>{LEVELS[lvl].label}</div>
              <div style={{ fontSize: "0.7rem", color: "#999", marginTop: "0.2rem" }}>{LEVELS[lvl].desc}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: "1rem", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "0.8rem" }}>Закрыть</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <button onClick={() => setLevel(null)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "0.75rem" }}>← Назад</button>
        <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Ходы: {moves}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "0.5rem", maxWidth: "22rem", margin: "0 auto" }}>
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
            }}>
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
      {won && (
        <div style={{ marginTop: "1.25rem" }}>
          <p style={{ color: accent, fontSize: "1rem", margin: "0 0 0.75rem" }}>Победа! 🎉</p>
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
