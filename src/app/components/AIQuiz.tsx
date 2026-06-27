"use client";
import { useState, useMemo } from "react";

type Question = { q: string; options: string[]; correct: number };

function extractKeywords(text: string, minLen = 4): string[] {
  const words = text.match(/[а-яёА-ЯЁa-zA-Z]{4,}/g) || [];
  const freq: Record<string, number> = {};
  words.forEach((w) => { const l = w.toLowerCase(); freq[l] = (freq[l] || 0) + 1; });
  return Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([w]) => w);
}

function generateQuestions(sections: { title: string; content: string }[], profile: { name: string; bio: string; location: string }): Question[] {
  const qs: Question[] = [];
  const allText = sections.map(s => s.content).join(" ");
  const keywords = extractKeywords(allText);
  const used = new Set<number>();

  // Questions from profile
  if (profile.name) {
    qs.push({
      q: "Как зовут создателя сайта?",
      options: shuffle([profile.name, "Феникс", "Сакура", "Харуки"]),
      correct: 0,
    });
  }
  if (profile.location) {
    const locs = ["Токио", "Киото", "Осака", profile.location];
    qs.push({
      q: "Где находится создатель сайта?",
      options: shuffle(locs),
      correct: locs.indexOf(profile.location),
    });
  }

  // Questions from section content
  sections.forEach((sec) => {
    const sentences = sec.content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    if (!sentences.length) return;

    sentences.forEach((sent) => {
      const words = sent.match(/[а-яёА-ЯЁa-zA-Z]{4,}/g) || [];
      if (words.length < 3 || qs.length >= 10) return;

      const pickIdx = Math.floor(Math.random() * words.length);
      const answer = words[pickIdx];
      if (used.has(answer.toLowerCase().charCodeAt(0))) return;
      used.add(answer.toLowerCase().charCodeAt(0));

      const distractors = keywords.filter(k => k.toLowerCase() !== answer.toLowerCase()).sort(() => Math.random() - 0.5).slice(0, 3);
      if (distractors.length < 2) return;

      const blanked = sent.replace(new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "______");
      const opts = shuffle([answer, ...distractors.slice(0, 3)]);
      qs.push({
        q: `Заполните пропуск: «${blanked.trim()}»`,
        options: opts,
        correct: opts.indexOf(answer),
      });
    });

    // Section context question
    if (sec.title && keywords.length > 3) {
      const kw = keywords.filter(k => sec.content.toLowerCase().includes(k.toLowerCase())).sort(() => Math.random() - 0.5);
      if (kw.length > 2) {
        const answer = kw[0];
        const opts = shuffle([answer, ...kw.slice(1, 4)]);
        qs.push({
          q: `Какое слово связано с разделом «${sec.title}»?`,
          options: opts.slice(0, 4),
          correct: opts.indexOf(answer),
        });
      }
    }
  });

  return shuffle(qs).slice(0, 8);
}

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function AIQuiz({ sections, profile, onClose }: {
  sections: { title: string; content: string }[];
  profile: { name: string; bio: string; location: string };
  onClose: () => void;
}) {
  const questions = useMemo(() => generateQuestions(sections, profile), [sections, profile]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  if (!q || questions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
        <p>Недостаточно контента для викторины. Добавьте больше текста в разделы.</p>
        <button onClick={onClose} style={btnStyle}>Закрыть</button>
      </div>
    );
  }

  function handleAnswer(optIdx: number) {
    if (selected !== null) return;
    setSelected(optIdx);
    if (optIdx === q.correct) setScore(s => s + 1);
  }

  function next() {
    if (idx + 1 < questions.length) {
      setIdx(i => i + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</div>
        <h3 style={{ margin: "0 0 0.5rem", fontWeight: 400, fontSize: "1.1rem" }}>Викторина завершена!</h3>
        <p style={{ fontSize: "2rem", color: "#d4818a", margin: "1rem 0" }}>{score} / {questions.length}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button onClick={() => { setIdx(0); setSelected(null); setScore(0); setDone(false); }} style={btnStyle}>Заново</button>
          <button onClick={onClose} style={{ ...btnStyle, background: "#f0ebe6", color: "#666" }}>Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ fontSize: "0.75rem", color: "#aaa", marginBottom: "1rem", textAlign: "center" }}>
        Вопрос {idx + 1} из {questions.length}
      </div>
      <p style={{ fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem", textAlign: "center" }}>{q.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {q.options.map((opt, oi) => {
          let bg = "rgba(212,129,138,0.04)";
          let border = "1px solid rgba(212,129,138,0.12)";
          if (selected !== null) {
            if (oi === q.correct) { bg = "#e8f5e9"; border = "1px solid #a5d6a7"; }
            else if (oi === selected) { bg = "#fce4e4"; border = "1px solid #ef9a9a"; }
            else { bg = "rgba(212,129,138,0.02)"; border = "1px solid rgba(212,129,138,0.05)"; }
          }
          return (
            <button key={oi} onClick={() => handleAnswer(oi)}
              style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: bg, border, cursor: selected !== null ? "default" : "pointer", fontSize: "0.85rem", color: "#333", textAlign: "left", transition: "all 0.2s" }}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <button onClick={next} style={{ ...btnStyle, display: "block", margin: "1.25rem auto 0" }}>
          {idx + 1 < questions.length ? "Далее" : "Результат"}
        </button>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.6rem 1.5rem", borderRadius: "0.75rem",
  background: "#d4818a", color: "white", fontWeight: 500,
  border: "none", cursor: "pointer", fontSize: "0.85rem",
  letterSpacing: "0.05em",
};
