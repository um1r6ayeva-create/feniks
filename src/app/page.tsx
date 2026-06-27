"use client";

import { useEffect, useState } from "react";
import AIQuiz from "./components/AIQuiz";
import MemoryGame from "./components/MemoryGame";

type Theme = { background: string; foreground: string; accent: string; accentLight: string };
type Section = { id: string; title: string; content: string; images: string[] };
type Card = { id: string; title: string; type: "like" | "dislike"; category: string; images: string[]; reason: string };
type SiteContent = {
  profile: { name: string; avatar: string; bio: string; email: string; phone: string; location: string };
  site: { title: string; description: string; footer: string };
  theme: Theme;
  social: { platform: string; url: string; icon: string }[];
  sections: Section[];
  cards: Card[];
};

const defaultTheme: Theme = {
  background: "#2a2522",
  foreground: "#e8dfd4",
  accent: "#e899a0",
  accentLight: "#f4c8d6",
};

const sectionIcons = [
  { icon: "🌸", kanji: "桜", sub: "История" },
  { icon: "🦋", kanji: "蝶", sub: "Вдохновение" },
  { icon: "🌙", kanji: "月", sub: "Тени" },
  { icon: "✉", kanji: "風", sub: "Связь" },
];

export default function Home() {
  const [data, setData] = useState<SiteContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [gamesTab, setGamesTab] = useState<"quiz" | "memory">("quiz");
  const [gallery, setGallery] = useState<string[] | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  // Gallery keyboard navigation
  useEffect(() => {
    if (!gallery) return;
    const g = gallery;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setGallery(null);
      if (e.key === "ArrowLeft") setGalleryIdx(i => (i - 1 + g.length) % g.length);
      if (e.key === "ArrowRight") setGalleryIdx(i => (i + 1) % g.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gallery]);
  const [petals, setPetals] = useState<{ id: number; x: number; d: number; s: number; r: number }[]>([]);
  const [embers, setEmbers] = useState<{ id: number; x: number; d: number; s: number }[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then(setData);
    fetch("/api/admin/check").then((r) => r.json()).then((d) => setIsAdmin(d.authenticated));
    setPetals(Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, d: 5 + Math.random() * 10, s: 6 + Math.random() * 10, r: Math.random() * 360,
    })));
    setEmbers(Array.from({ length: 15 }, (_, i) => ({
      id: i, x: Math.random() * 100, d: 3 + Math.random() * 5, s: 2 + Math.random() * 4,
    })));
  }, []);

  function update(path: string[], value: any) {
    if (!data) return;
    setData((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      let obj = copy;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return copy;
    });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false); setEditId(null);
  }

  if (!data) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: defaultTheme.background }}>
      <div style={{ color: defaultTheme.accent, fontSize: "1.25rem", fontWeight: 500, letterSpacing: "0.2em" }}>Загрузка...</div>
    </div>
  );

  const { profile, sections, social, site, theme: t, cards } = data;
  const editing = isAdmin && editId === "all";
  const c = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;

  return (
    <div style={{ background: `linear-gradient(180deg, ${t.background} 0%, ${c(t.background, 0.98)} 100%)`, color: t.foreground, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes petalFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.4; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }
        @keyframes emberRise { 0% { transform: translateY(0) scale(1); opacity: 0; } 15% { opacity: 0.8; } 80% { opacity: 0.5; } 100% { transform: translateY(-60vh) scale(0.2); opacity: 0; } }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(2deg); }
          75% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes borderGlow { 0%, 100% { border-color: ${c(t.accent, 0.1)}; } 50% { border-color: ${c(t.accent, 0.25)}; } }
        .fade { animation: fadeUp 0.8s ease-out forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.2s; } .d3 { animation-delay: 0.35s; }
        .d4 { animation-delay: 0.5s; } .d5 { animation-delay: 0.65s; } .d6 { animation-delay: 0.8s; }
      `}</style>

      {/* Sakura petals */}
      {petals.map((p) => (
        <div key={p.id} style={{
          position: "fixed", top: "-10%", left: `${p.x}%`, zIndex: 0, pointerEvents: "none",
          width: `${p.s}px`, height: `${p.s}px`, opacity: 0,
          background: `radial-gradient(ellipse at 30% 30%, ${c(t.accent, 0.25)}, ${c(t.accent, 0.08)})`,
          borderRadius: "50% 0 50% 0",
          animation: `petalFall ${p.d}s ease-in infinite`,
          animationDelay: `${Math.random() * 12}s`,
          transform: `rotate(${p.r}deg)`,
        }} />
      ))}

      {/* Fire embers */}
      {embers.map((e) => (
        <div key={e.id} style={{
          position: "fixed", bottom: "0", left: `${e.x}%`, zIndex: 0, pointerEvents: "none",
          width: `${e.s}px`, height: `${e.s}px`, opacity: 0,
          background: c(t.accent, 0.5),
          borderRadius: "50%",
          boxShadow: `0 0 ${e.s * 3}px ${c(t.accent, 0.3)}, 0 0 ${e.s * 6}px ${c(t.accent, 0.1)}`,
          animation: `emberRise ${e.d}s ease-out infinite`,
          animationDelay: `${Math.random() * 6}s`,
        }} />
      ))}

      {/* Phoenix SVG background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.07 }}>
        <svg viewBox="0 0 400 400" width="70%" height="70%" style={{ maxWidth: "500px", animation: "float 10s ease-in-out infinite" }}>
          <defs>
            <linearGradient id="phx" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={t.accent} />
              <stop offset="50%" stopColor={t.accentLight} />
              <stop offset="100%" stopColor="#e8c4d0" />
            </linearGradient>
          </defs>
          <g fill="url(#phx)" opacity="0.7">
            <path d="M200 320 Q180 370 155 395 Q175 375 195 340 Q200 350 192 385 Q208 368 205 340 Q215 358 222 390 Q220 370 215 340 Q228 348 248 395 Q230 370 212 332 Z" />
            <ellipse cx="200" cy="230" rx="22" ry="40" transform="rotate(-8 200 230)" />
            <path d="M182 212 Q135 185 100 130 Q125 148 142 165 Q115 138 102 100 Q132 125 153 155 Q140 122 132 88 Q158 122 172 168 Q168 138 164 105 Q182 140 184 192" />
            <path d="M218 212 Q265 185 300 130 Q275 148 258 165 Q285 138 298 100 Q268 125 247 155 Q260 122 268 88 Q242 122 228 168 Q232 138 236 105 Q218 140 216 192" />
            <path d="M196 195 Q191 177 187 163 Q183 150 181 138 Q187 146 193 158 Q196 148 194 132 Q200 145 200 162 Q206 145 206 132 Q207 148 207 158 Q213 146 219 138 Q217 150 213 163 Q209 177 204 195" />
            <circle cx="200" cy="125" r="16" />
            <circle cx="196" cy="121" r="2" fill={t.background} />
            <circle cx="195" cy="120" r="0.8" fill={t.foreground} />
            <path d="M196 110 Q192 92 188 78 Q194 87 198 100 Q200 85 201 72 Q202 85 204 100 Q208 87 214 78 Q210 92 206 110" />
          </g>
        </svg>
      </div>

      {/* Decorative rings */}
      <div style={{ position: "fixed", top: "15%", right: "5%", width: "200px", height: "200px", borderRadius: "50%", border: `1px solid ${c(t.accent, 0.06)}`, zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "20%", left: "3%", width: "120px", height: "120px", borderRadius: "50%", border: `1px solid ${c(t.accent, 0.04)}`, zIndex: 0, pointerEvents: "none" }} />

      {/* HERO */}
      {sections.filter(s => s.id === "hero").map((section) => (
        <section id={section.id} key={section.id} style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "44rem", width: "100%", textAlign: "center" }}>

            {/* Phoenix emblem */}
            <div className="fade d1" style={{ marginBottom: "2rem", display: "inline-block" }}>
              <div style={{
                width: "88px", height: "88px", borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${c(t.accentLight, 0.3)}, ${c(t.accent, 0.12)})`,
                boxShadow: `0 0 60px ${c(t.accent, 0.2)}, 0 0 120px ${c(t.accent, 0.06)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto", animation: "float 6s ease-in-out infinite",
                position: "relative",
              }}>
                <svg viewBox="0 0 40 40" width="36" height="36">
                  <defs>
                    <linearGradient id="plogo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={t.accentLight} />
                      <stop offset="100%" stopColor="white" />
                    </linearGradient>
                  </defs>
                  <g fill="url(#plogo)" opacity="1">
                    <path d="M20 33 Q18 37 16 39 Q18 37 20 35 Q22 37 24 39 Q22 37 20 33 Z" />
                    <ellipse cx="20" cy="23" rx="3" ry="6" transform="rotate(-8 20 23)" />
                    <path d="M18 21 Q13 18 10 13 Q12 15 14 16 Q11 14 10 10 Q13 12 15 15 Q14 12 13 9 Q16 12 17 17 Q17 14 16 10 Q18 14 18 19" />
                    <path d="M22 21 Q27 18 30 13 Q28 15 26 16 Q29 14 30 10 Q27 12 25 15 Q26 12 27 9 Q24 12 23 17 Q23 14 24 10 Q22 14 22 19" />
                    <path d="M20 20 Q19 18 18.5 16 Q18 14 18 13 Q18.5 14 19 15 Q19.5 14 19 12 Q20 14 20 16 Q21 14 21 12 Q20.5 14 21 15 Q21.5 14 22 13 Q22 14 21.5 16 Q21 18 20 20" />
                    <circle cx="20" cy="12.5" r="2.5" />
                    <circle cx="19.5" cy="12" r="0.6" fill={t.background} />
                  </g>
                </svg>
                {/* Glow rings */}
                <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", border: `1px solid ${c(t.accent, 0.15)}`, animation: "borderGlow 3s ease-in-out infinite" }} />
                <div style={{ position: "absolute", inset: "-14px", borderRadius: "50%", border: `1px solid ${c(t.accent, 0.06)}` }} />
              </div>
            </div>

            {/* Name */}
            <div className="fade d2">
              {editing ? (
                <input value={profile.name} onChange={(e) => update(["profile", "name"], e.target.value)}
                  style={{ width: "100%", textAlign: "center", background: "transparent", fontSize: "clamp(2.5rem, 8vw, 4.5rem)", fontWeight: 400, color: t.accent, border: "none", outline: "none", letterSpacing: "0.1em" }} />
              ) : (
                <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)", fontWeight: 400, color: t.accent, letterSpacing: "0.2em", marginBottom: "0.25rem", fontFamily: "'Hiragino Mincho', 'Noto Serif JP', serif" }}>
                  {profile.name}
                </h1>
              )}
              {!editing && <div style={{ fontSize: "0.8rem", color: c(t.foreground, 0.2), letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "2.5rem" }}>— 桜のように —</div>}
            </div>

            {/* Quote */}
            <div className="fade d3">
              {editing ? (
                <textarea value={section.content} onChange={(e) => { const s = [...data.sections]; const i = s.findIndex((x) => x.id === section.id); if (i >= 0) { s[i] = { ...s[i], content: e.target.value }; update(["sections"], s); } }} rows={3}
                  style={{ width: "100%", textAlign: "center", background: c(t.foreground, 0.03), borderRadius: "1rem", padding: "1rem", fontSize: "0.95rem", lineHeight: "1.8", color: c(t.foreground, 0.6), border: `1px solid ${c(t.foreground, 0.06)}`, outline: "none", resize: "none", fontStyle: "italic" }} />
              ) : (
                <div style={{ maxWidth: "36rem", margin: "0 auto", padding: "1.5rem 2rem" }}>
                  <p style={{ fontSize: "0.95rem", lineHeight: 2.2, color: c(t.foreground, 0.55), fontStyle: "italic", letterSpacing: "0.03em" }}>
                    {section.content}
                  </p>
                  <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                    <div style={{ width: "2rem", height: "1px", background: c(t.accent, 0.2) }} />
                    <span style={{ fontSize: "0.75rem", color: t.accent, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 400 }}>Будь как Феникс</span>
                    <div style={{ width: "2rem", height: "1px", background: c(t.accent, 0.2) }} />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="fade d4" style={{ marginTop: "1.5rem" }}>

              {editing && (
                <div style={{ maxWidth: "24rem", margin: "0 auto 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {(["email", "phone", "location"] as const).map((f) => (
                    <div key={f} style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.65rem", color: c(t.foreground, 0.3), width: "3.5rem", textAlign: "right", textTransform: "uppercase", letterSpacing: "0.1em" }}>{f === "email" ? "Email" : f === "phone" ? "Тел" : "Лок"}</span>
                      <input value={(profile as any)[f]} onChange={(e) => update(["profile", f], e.target.value)}
                        style={{ flex: 1, background: c(t.foreground, 0.03), borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: t.foreground, border: `1px solid ${c(t.foreground, 0.08)}`, outline: "none" }} />
                    </div>
                  ))}
                  {/* Hero section images */}
                  {section.images?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                      {section.images.map((img, imgIdx) => (
                        <div key={imgIdx} style={{ position: "relative", width: "4rem", height: "4rem", borderRadius: "0.75rem", overflow: "hidden", border: `1px solid ${c(t.accent, 0.1)}` }}>
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={() => { const s = [...data.sections]; const i = s.findIndex((x) => x.id === section.id); if (i >= 0) { s[i] = { ...s[i], images: s[i].images.filter((_, j) => j !== imgIdx) }; update(["sections"], s); } }}
                            style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.5)", color: "white", borderRadius: "50%", width: "1rem", height: "1rem", fontSize: "0.5rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", color: c(t.accent, 0.5), cursor: "pointer", padding: "0.3rem 0.75rem", borderRadius: "0.5rem", border: `1px dashed ${c(t.accent, 0.15)}`, justifyContent: "center" }}>
                    + Фото
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const form = new FormData(); form.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: form });
                      const json = await res.json(); if (json.url) { const s = [...data.sections]; const i = s.findIndex((x) => x.id === section.id); if (i >= 0) { s[i] = { ...s[i], images: [...(s[i].images || []), json.url] }; update(["sections"], s); } }
                    }} />
                  </label>
                </div>
              )}

              {editing ? (
                <div style={{ maxWidth: "24rem", margin: "0 auto" }}>
                  <p style={{ fontSize: "0.65rem", color: c(t.foreground, 0.3), marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Соцсети</p>
                  {social.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <input value={s.platform} onChange={(e) => update(["social", String(i), "platform"], e.target.value)} placeholder="Название"
                        style={{ flex: 1, background: c(t.foreground, 0.03), borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem", color: t.foreground, border: `1px solid ${c(t.foreground, 0.08)}`, outline: "none" }} />
                      <input value={s.url} onChange={(e) => update(["social", String(i), "url"], e.target.value)} placeholder="https://"
                        style={{ flex: 2, background: c(t.foreground, 0.03), borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem", color: t.foreground, border: `1px solid ${c(t.foreground, 0.08)}`, outline: "none" }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.7rem", color: c(t.foreground, 0.3), cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "4px", textDecorationColor: c(t.accent, 0.3) }}>
                      {profile.avatar ? "✎ Сменить фото" : "+ Добавить фото"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const form = new FormData(); form.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: form });
                        const json = await res.json(); if (json.url) update(["profile", "avatar"], json.url);
                      }} />
                    </label>
                  </div>
                </div>
              ) : social.filter((s) => s.url).length > 0 && (
                <div className="fade d5" style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1.5rem" }}>
                  {social.filter((s) => s.url).map((s) => (
                    <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "0.5rem 1.5rem", borderRadius: "2rem", background: "white", color: t.accent, fontSize: "0.8rem", textDecoration: "none", border: `1px solid ${c(t.accent, 0.15)}`, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", transition: "all 0.3s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${c(t.accent, 0.1)}`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.03)"; }}>
                      {s.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {!editing && (
              <div className="fade d6" style={{ marginTop: "3rem", opacity: 0.15 }}>
                <svg style={{ width: "1.25rem", height: "1.25rem", margin: "0 auto" }} fill="none" viewBox="0 0 24 24" stroke={t.accent}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            )}
          </div>
        </section>
      ))}



      {/* Cards: like/dislike grouped by category */}
      {(cards.length > 0 || editing) && (
        <section style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "7rem 1.5rem 8rem", borderTop: `1px solid ${c(t.accent, 0.05)}` }}>
          <div style={{ maxWidth: "56rem", width: "100%" }}>
            <div className="fade d1" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: c(t.accent, 0.06), border: `1px solid ${c(t.accent, 0.1)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🔥</div>
              <h2 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 500, color: t.foreground, letterSpacing: "0.02em", margin: 0 }}>Что питает и гасит пламя</h2>
            </div>
            <div className="fade d2" style={{ width: "2.5rem", height: "1.5px", background: c(t.accent, 0.3), marginBottom: "2rem", marginLeft: "0.5rem" }} />

            {Array.from(new Set(cards.map(c => c.category || "Общее"))).map((cat) => {
              const catCards = cards.filter(c => (c.category || "Общее") === cat);
              return (
                <div key={cat} style={{ marginBottom: "2.5rem" }}>
                  {/* Category header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "1.2rem", opacity: 0.4 }}>{cat === "Еда" ? "🍜" : cat === "Цвета" ? "🎨" : cat === "Цветы" ? "🌸" : "✦"}</span>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 500, color: c(t.foreground, 0.3), letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>{cat}</h3>
                    <div style={{ flex: 1, height: "1px", background: c(t.accent, 0.06) }} />
                  </div>
                  {/* Cards: side by side for food */}
                  {cat === "Еда" ? (
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                      {catCards.map((card) => (
                        <div key={card.id} style={{
                          width: "22rem", maxWidth: "49%",
                          background: c(t.background, 0.6), borderRadius: "1rem", overflow: "hidden",
                          border: `1px solid ${c(t.accent, 0.08)}`, boxShadow: `0 4px 24px ${c(t.background, 0.3)}`,
                        }}>
                          <div style={{ height: "5rem", position: "relative", cursor: card.images?.length ? "pointer" : "default", overflow: "hidden", background: `linear-gradient(135deg, ${c(t.accent, 0.15)}, ${c(t.accentLight, 0.08)})`, display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => card.images?.length > 0 && (setGallery(card.images), setGalleryIdx(0))}>
                            {card.images?.length > 0 ? (
                              <div style={{ display: "flex", height: "100%", width: "100%", gap: "1px" }}>
                                {card.images.slice(0, 3).map((img, ii) => (
                                  <div key={ii} style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  </div>
                                ))}
                                {card.images.length > 3 && (
                                  <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)", color: "white", fontSize: "1rem", fontWeight: 500 }}>
                                    +{card.images.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: "1.5rem", opacity: 0.15 }}>{card.type === "like" ? "❤" : "✖"}</span>
                            )}
                            <div style={{ position: "absolute", top: "0.35rem", left: "0.35rem", padding: "0.15rem 0.5rem", borderRadius: "2rem", fontSize: "0.5rem", fontWeight: 600, background: card.type === "like" ? "rgba(76,175,80,0.85)" : "rgba(239,83,80,0.85)", color: "white", textTransform: "uppercase", letterSpacing: "0.08em", backdropFilter: "blur(4px)", pointerEvents: "none" }}>
                              {card.type === "like" ? "❤" : "✖"}
                            </div>
                          </div>
                          <div style={{ padding: "0.6rem 0.9rem 0.9rem" }}>
                            <h3 style={{ margin: "0 0 0.2rem", fontSize: "0.9rem", fontWeight: 500, color: t.foreground }}>{card.title}</h3>
                            <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.5, color: c(t.foreground, 0.7) }}>{card.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "1rem" }}>
                      {catCards.map((card) => (
                        <div key={card.id} style={{
                          background: c(t.background, 0.6), borderRadius: "1.25rem", overflow: "hidden",
                          border: `1px solid ${c(t.accent, 0.08)}`, boxShadow: `0 4px 24px ${c(t.background, 0.3)}`,
                          transition: "transform 0.3s, box-shadow 0.3s",
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${c(t.accent, 0.1)}`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${c(t.background, 0.3)}`; }}
                        >
                          <div style={{ height: "6rem", position: "relative", cursor: card.images?.length ? "pointer" : "default", overflow: "hidden", background: `linear-gradient(135deg, ${c(t.accent, 0.15)}, ${c(t.accentLight, 0.08)})`, display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => card.images?.length > 0 && (setGallery(card.images), setGalleryIdx(0))}>
                            {card.images?.length > 0 ? (
                              <div style={{ display: "flex", height: "100%", width: "100%", gap: "1px" }}>
                                {card.images.slice(0, 3).map((img, ii) => (
                                  <div key={ii} style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  </div>
                                ))}
                                {card.images.length > 3 && (
                                  <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)", color: "white", fontSize: "1rem", fontWeight: 500 }}>
                                    +{card.images.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: "1.5rem", opacity: 0.15 }}>{card.type === "like" ? "❤" : "✖"}</span>
                            )}
                            <div style={{ position: "absolute", top: "0.35rem", left: "0.35rem", padding: "0.15rem 0.5rem", borderRadius: "2rem", fontSize: "0.5rem", fontWeight: 600, background: card.type === "like" ? "rgba(76,175,80,0.85)" : "rgba(239,83,80,0.85)", color: "white", textTransform: "uppercase", letterSpacing: "0.08em", backdropFilter: "blur(4px)", pointerEvents: "none" }}>
                              {card.type === "like" ? "❤" : "✖"}
                            </div>
                          </div>
                          <div style={{ padding: "0.6rem 0.9rem 0.9rem" }}>
                            <h3 style={{ margin: "0 0 0.2rem", fontSize: "0.9rem", fontWeight: 500, color: t.foreground }}>{card.title}</h3>
                            <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.5, color: c(t.foreground, 0.7) }}>{card.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Edit toolbar */}
      {editing && (
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", gap: "0.75rem", background: "white", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.06)", padding: "0.75rem", boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "0.75rem 2rem", borderRadius: "0.75rem", background: t.accent, color: "white", fontWeight: 500, fontSize: "0.85rem", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}>
            {saving ? "..." : "Сохранить"}
          </button>
          <button onClick={() => setEditId(null)}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "0.75rem", background: "#f8f5f2", color: c(t.foreground, 0.4), border: "1px solid #e8e0da", cursor: "pointer", fontSize: "0.85rem" }}>
            Отмена
          </button>
        </div>
      )}

      {/* Floating games button */}
      <button onClick={() => { setGamesTab("quiz"); setShowGames(true); }}
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 40,
          width: "3rem", height: "3rem", borderRadius: "50%",
          background: `linear-gradient(135deg, ${c(t.accent, 0.2)}, ${c(t.accentLight, 0.15)})`,
          border: `1px solid ${c(t.accent, 0.2)}`,
          cursor: "pointer", fontSize: "1.2rem",
          boxShadow: `0 4px 20px ${c(t.accent, 0.15)}`,
          transition: "all 0.3s",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = `0 6px 30px ${c(t.accent, 0.25)}`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${c(t.accent, 0.15)}`; }}
        title="Игры и викторины">
        🎮
      </button>

      {/* Gallery modal */}
      {gallery && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
          onClick={() => setGallery(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <img src={gallery[galleryIdx]} alt="" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "1rem", objectFit: "contain" }} />
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button onClick={() => setGalleryIdx(i => (i - 1 + gallery.length) % gallery.length)}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: "50%", width: "2.5rem", height: "2.5rem", cursor: "pointer", fontSize: "1rem", backdropFilter: "blur(4px)" }}>‹</button>
                <span style={{ color: "white", fontSize: "0.8rem", opacity: 0.6 }}>{galleryIdx + 1} / {gallery.length}</span>
                <button onClick={() => setGalleryIdx(i => (i + 1) % gallery.length)}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: "50%", width: "2.5rem", height: "2.5rem", cursor: "pointer", fontSize: "1rem", backdropFilter: "blur(4px)" }}>›</button>
              </div>
            )}
            <button onClick={() => setGallery(null)}
              style={{ position: "absolute", top: "-2.5rem", right: "0", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem", opacity: 0.6 }}>✕</button>
          </div>
        </div>
      )}

      {/* Games modal */}
      {showGames && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowGames(false)}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: "1.25rem", width: "100%", maxWidth: "26rem", maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #f0ebe6" }}>
              {([{ id: "quiz", label: "🧠 Викторина" }, { id: "memory", label: "🃏 Мемори" }] as const).map((tab) => (
                <button key={tab.id} onClick={() => setGamesTab(tab.id)}
                  style={{
                    flex: 1, padding: "0.9rem 1rem", background: gamesTab === tab.id ? "white" : "#faf8f6",
                    border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: gamesTab === tab.id ? 500 : 400,
                    color: gamesTab === tab.id ? "#d4818a" : "#aaa",
                    borderBottom: gamesTab === tab.id ? "2px solid #d4818a" : "2px solid transparent",
                    transition: "all 0.2s", letterSpacing: "0.03em",
                  }}>
                  {tab.label}
                </button>
              ))}
              <button onClick={() => setShowGames(false)}
                style={{ padding: "0.9rem 1.2rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "#ccc" }}>
                ✕
              </button>
            </div>
            {/* Content */}
            {gamesTab === "quiz" && <AIQuiz sections={sections} profile={profile} onClose={() => setShowGames(false)} />}
            {gamesTab === "memory" && <MemoryGame onClose={() => setShowGames(false)} />}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2.5rem 1.5rem", fontSize: "0.7rem", color: c(t.foreground, 0.15), borderTop: `1px solid ${c(t.accent, 0.04)}` }}>
        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center", gap: "0.5rem", fontSize: "0.75rem", color: c(t.accent, 0.15) }}>
          <span>✦</span>
          <span style={{ fontFamily: "serif" }}>鳳</span>
          <span>✦</span>
          <span style={{ fontFamily: "serif", fontSize: "0.35rem" }}>火</span>
          <span>✦</span>
        </div>
        {site.footer}
      </footer>
    </div>
  );
}
