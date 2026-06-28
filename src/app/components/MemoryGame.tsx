"use client";
import { useState, useEffect, useCallback } from "react";

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

const LEVELS = [
  { pairs: 4,  cols: 4 },
  { pairs: 6,  cols: 4 },
  { pairs: 8,  cols: 4 },
  { pairs: 10, cols: 5 },
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

function initCards(level: number): Card[] {
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
  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState<Card[]>(() => initCards(0));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState("");

  const cols = LEVELS[level].cols;
  const allMatched = cards.every(c => c.matched);
  const isMaxLevel = level === LEVELS.length - 1;

  useEffect(() => {
    if (allMatched && !won) {
      setWon(true);
      setMsg(isMaxLevel ? "Максимум! 🎉" : "Отлично! Следующий уровень...");
      const t = setTimeout(() => {
        if (isMaxLevel) {
          setLevel(0);
          setCards(initCards(0));
        } else {
          const next = level + 1;
          setLevel(next);
          setCards(initCards(next));
        }
        setFlipped([]);
        setLocked(false);
        setMoves(0);
        setWon(false);
        setMsg("");
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [allMatched, won, isMaxLevel, level]);

  const handleClick = useCallback((id: number) => {
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
  }, [cards, flipped, locked, won]);

  const accent = "#d4818a";

  return (
    <div style={{ padding: "1.5rem", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "0.75rem" }}>✕ Закрыть</button>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: accent, fontWeight: 600 }}>Уровень {level + 1}</span>
          <span style={{ fontSize: "0.7rem", color: "#aaa" }}>Ходы: {moves}</span>
        </div>
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
      {msg && (
        <p style={{ marginTop: "1rem", color: accent, fontSize: "1rem", fontWeight: 600 }}>{msg}</p>
      )}
    </div>
  );
}
