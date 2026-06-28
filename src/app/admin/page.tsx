"use client";

import { useEffect, useState, useRef } from "react";
import type { SiteContent, Section, SocialLink } from "@/lib/data";

type Tab = "profile" | "sections" | "social" | "cards" | "site" | "password";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [data, setData] = useState<SiteContent | null>(null);
  const dataRef = useRef<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((d) => {
        if (d.authenticated) {
          fetch("/api/content").then((r) => r.json()).then(setData).catch(() => {});
          setAuth(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuth(true);
      const d = await fetch("/api/content").then((r) => r.json());
      setData(d);
    } else {
      setError("Неверный пароль");
    }
  }

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth(false);
    setData(null);
  }

  async function handleSave() {
    const d = dataRef.current;
    if (!d) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const json = await res.json().catch(() => ({}));
        setSaveError(json.error || `Ошибка ${res.status}`);
      }
    } catch (e: any) {
      setSaveError(e.message || "Ошибка сети");
    }
    setSaving(false);
  }

  function updateData(path: string[], value: any) {
    if (!data) return;
    setData((prev) => {
      if (!prev) return prev;
      const copy = structuredClone(prev);
      let obj: any = copy;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = value;
      return copy;
    });
  }

  function updateSection(id: string, field: "title" | "content", value: string) {
    if (!data) return;
    setData({
      ...data,
      sections: data.sections.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  }

  function addSection() {
    if (!data) return;
    const newId = `section-${Date.now()}`;
    setData({
      ...data,
      sections: [
        ...data.sections,
        { id: newId, title: "Новый раздел", content: "" },
      ],
    });
  }

  function removeSection(id: string) {
    if (!data || id === "hero") return;
    setData({
      ...data,
      sections: data.sections.filter((s) => s.id !== id),
    });
  }

  function moveSection(idx: number, dir: -1 | 1) {
    if (!data) return;
    const sections = [...data.sections];
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    setData({ ...data, sections });
  }

  function updateSocial(idx: number, field: keyof SocialLink, value: string) {
    if (!data) return;
    const social = [...data.social];
    social[idx] = { ...social[idx], [field]: value };
    setData({ ...data, social });
  }

  function addSocial() {
    if (!data) return;
    setData({
      ...data,
      social: [...data.social, { platform: "", url: "", icon: "link" }],
    });
  }

  function removeSocial(idx: number) {
    if (!data) return;
    setData({
      ...data,
      social: data.social.filter((_, i) => i !== idx),
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Профиль" },
    { id: "sections", label: "Разделы" },
    { id: "social", label: "Соцсети" },
    { id: "cards", label: "Нравится/Нет" },
    { id: "site", label: "Сайт" },
    { id: "password", label: "Пароль" },
  ];

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl text-[var(--accent,#d4a574)] font-semibold text-center mb-4">
            ✦ Феникс
          </h1>
          <div className="relative">
            <input
              type={showLoginPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent,#d4a574)]"
            />
            <button type="button" onClick={() => setShowLoginPwd(!showLoginPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-lg leading-none cursor-pointer bg-transparent border-none">
              {showLoginPwd ? "🙈" : "👁"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="rounded-lg px-4 py-3 font-medium text-black transition-colors"
            style={{ background: "var(--accent, #d4a574)" }}
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-semibold" style={{ color: "var(--accent, #d4a574)" }}>
            ✦ Админ-панель
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg font-medium text-sm text-black transition-colors disabled:opacity-50"
              style={{ background: "var(--accent, #d4a574)" }}
            >
              {saving ? "..." : saved ? "✓ Сохранено" : "Сохранить"}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Выйти
            </button>
          </div>
          {saveError && (
            <p className="text-red-400 text-sm mt-1">{saveError}</p>
          )}
        </div>

        <div className="flex gap-1 mb-6 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? "text-black font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              style={tab === t.id ? { background: "var(--accent, #d4a574)" } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 md:p-6">
          {tab === "profile" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-medium text-white mb-2">Профиль</h2>

              {([
                ["name", "Имя", "profile", "name"],
                ["bio", "Био", "profile", "bio"],
                ["email", "Email", "profile", "email"],
                ["phone", "Телефон", "profile", "phone"],
                ["location", "Локация", "profile", "location"],
              ] as const).map(([key, label, ...path]) => (
                <div key={key}>
                  <label className="text-sm text-zinc-400 mb-1 block">{label}</label>
                  {key === "bio" ? (
                    <textarea
                      value={(data.profile as any)[key]}
                      onChange={(e) => updateData(path as string[], e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 resize-y"
                      style={{ accentColor: "var(--accent, #d4a574)" }}
                    />
                  ) : (
                    <input
                      value={(data.profile as any)[key]}
                      onChange={(e) => updateData(path as string[], e.target.value)}
                      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent,#d4a574)]"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "sections" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Разделы</h2>
                <button
                  onClick={addSection}
                  className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  + Добавить
                </button>
              </div>

              {data.sections.map((section, idx) => (
                <div key={section.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                      {section.id}
                    </span>
                    <div className="flex gap-2">
                      {idx > 0 && (
                        <button onClick={() => moveSection(idx, -1)} className="text-xs text-zinc-500 hover:text-zinc-300">↑</button>
                      )}
                      {idx < data.sections.length - 1 && (
                        <button onClick={() => moveSection(idx, 1)} className="text-xs text-zinc-500 hover:text-zinc-300">↓</button>
                      )}
                      {section.id !== "hero" && (
                        <button onClick={() => removeSection(section.id)} className="text-xs text-red-400 hover:text-red-300">✕</button>
                      )}
                    </div>
                  </div>
                  <input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, "title", e.target.value)}
                    className="w-full bg-transparent text-base font-medium text-white mb-3 focus:outline-none border-b border-transparent focus:border-[var(--accent,#d4a574)] pb-1"
                  />
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, "content", e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-900 text-zinc-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 resize-y text-sm"
                      style={{ accentColor: "var(--accent, #d4a574)" }}
                    />
                </div>
              ))}
            </div>
          )}

          {tab === "social" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Социальные сети</h2>
                <button
                  onClick={addSocial}
                  className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  + Добавить
                </button>
              </div>

              {data.social.map((s, idx) => (
                <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex flex-col md:flex-row gap-3">
                  <input
                    value={s.platform}
                    onChange={(e) => updateSocial(idx, "platform", e.target.value)}
                    placeholder="Название (Telegram, GitHub...)"
                    className="flex-1 bg-zinc-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 text-sm"
                  />
                  <input
                    value={s.url}
                    onChange={(e) => updateSocial(idx, "url", e.target.value)}
                    placeholder="https://..."
                    className="flex-[2] bg-zinc-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 text-sm"
                  />
                  <div className="flex gap-2 items-center">
                    <button onClick={() => removeSocial(idx)}
                      className="px-3 py-2 rounded-lg text-sm bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">
                      ✕
                    </button>
                    <button onClick={handleSave}
                      className="px-3 py-2 rounded-lg text-sm bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors">
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "cards" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Что нравится / не нравится</h2>
                <button onClick={() => {
                  const id = "card-" + Date.now();
                  updateData(["cards"], [...data.cards, { id, title: "", type: "like", category: "", images: [], reason: "" }]);
                }}
                  className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
                  + Добавить
                </button>
              </div>

              {data.cards.length === 0 && (
                <p className="text-zinc-500 text-sm">Нет карточек. Нажмите «+ Добавить».</p>
              )}

              {data.cards.map((card, idx) => (
                <div key={card.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${card.type === "like" ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300"}`}>
                      {card.type === "like" ? "Нравится" : "Не нравится"}
                    </span>
                    <button onClick={() => updateData(["cards"], data.cards.filter((_, i) => i !== idx))}
                      className="text-xs text-red-400 hover:text-red-300">✕</button>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <button onClick={() => updateData(["cards", String(idx), "type"], card.type === "like" ? "dislike" : "like")}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${card.type === "like" ? "border-green-700 text-green-300" : "border-red-700 text-red-300"}`}>
                      {card.type === "like" ? "❤ Нравится" : "✖ Не нравится"}
                    </button>
                  </div>
                  <input value={card.title} onChange={(e) => updateData(["cards", String(idx), "title"], e.target.value)}
                    placeholder="Название"
                    className="w-full bg-zinc-900 text-white rounded-lg px-4 py-3 mb-2 focus:outline-none focus:ring-1 text-sm" />
                  <div className="flex gap-2 mb-3">
                    <input value={card.category} onChange={(e) => updateData(["cards", String(idx), "category"], e.target.value)}
                      placeholder="Категория (Еда, Цвета, Цветы...)"
                      className="flex-1 bg-zinc-900 text-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 text-sm" />
                    <label className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer underline underline-offset-4 decoration-zinc-600 self-center">
                      + Фото
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        let url: string | null = null;
                        try {
                          const form = new FormData(); form.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: form });
                          const json = await res.json();
                          if (json.url) {
                            url = json.url;
                          } else {
                            throw new Error(json.error || "Upload failed");
                          }
                        } catch {
                          const reader = new FileReader();
                          url = await new Promise<string>((resolve) => {
                            reader.onload = () => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const max = 800;
                                let w = img.width, h = img.height;
                                if (w > max || h > max) { if (w > h) { h = Math.round(h * max / w); w = max; } else { w = Math.round(w * max / h); h = max; } }
                                canvas.width = w; canvas.height = h;
                                canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                                resolve(canvas.toDataURL("image/jpeg", 0.8));
                              };
                              img.src = reader.result as string;
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                        if (url) {
                          try {
                            const latest = await fetch("/api/content").then(r => r.json());
                            const cardId = card.id;
                            const target = latest.cards.find((c: any) => c.id === cardId);
                            if (target) {
                              target.images = [...(target.images || []), url];
                            }
                            setData(latest);
                            dataRef.current = latest;
                            await fetch("/api/content", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(latest),
                            });
                          } catch (err) {
                            console.error("Auto-save failed:", err);
                          }
                        }
                      }} />
                    </label>
                  </div>
                  {(card.images?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {card.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-700">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => updateData(["cards", String(idx), "images"], card.images.filter((_, j) => j !== imgIdx))}
                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 text-[0.4rem] flex items-center justify-center cursor-pointer border-none">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea value={card.reason} onChange={(e) => updateData(["cards", String(idx), "reason"], e.target.value)}
                    placeholder="Почему нравится / не нравится..."
                    rows={2}
                    className="w-full bg-zinc-900 text-zinc-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 text-sm resize-y" />
                </div>
              ))}
            </div>
          )}

          {tab === "site" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-medium text-white">Настройки сайта</h2>

              {([
                ["title", "Название сайта"],
                ["description", "Описание"],
                ["footer", "Текст в подвале"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm text-zinc-400 mb-1 block">{label}</label>
                  <input
                    value={(data.site as any)[key]}
                    onChange={(e) => updateData(["site", key], e.target.value)}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1"
                  />
                </div>
              ))}
            </div>
          )}

          {tab === "password" && (
            <ChangePassword />
          )}
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
            ← На сайт
          </a>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-1"
      />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-lg leading-none cursor-pointer bg-transparent border-none"
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}

function ChangePassword() {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (newPwd !== confirmPwd) {
      setMsg({ type: "error", text: "Пароли не совпадают" });
      return;
    }
    if (newPwd.length < 4) {
      setMsg({ type: "error", text: "Пароль должен быть минимум 4 символа" });
      return;
    }

    const res = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
    });

    if (res.ok) {
      setMsg({ type: "ok", text: "Пароль изменён" });
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } else {
      const json = await res.json();
      setMsg({ type: "error", text: json.error || "Ошибка" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <h2 className="text-lg font-medium text-white">Смена пароля</h2>
      <PasswordField value={oldPwd} onChange={setOldPwd} placeholder="Старый пароль" />
      <PasswordField value={newPwd} onChange={setNewPwd} placeholder="Новый пароль" />
      <PasswordField value={confirmPwd} onChange={setConfirmPwd} placeholder="Повторите новый пароль" />
      {msg && (
        <p className={msg.type === "ok" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
          {msg.text}
        </p>
      )}
      <button
        type="submit"
        className="rounded-lg px-4 py-3 font-medium text-sm text-black transition-colors"
        style={{ background: "var(--accent, #d4a574)" }}
      >
        Изменить пароль
      </button>
    </form>
  );
}
