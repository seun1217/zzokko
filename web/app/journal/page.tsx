"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  NICKNAME,
  formatDateKo,
  gestationAt,
  parseISODate,
  todayLocal,
} from "@/lib/pregnancy";

interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  author: "dad" | "mom";
  body: string;
}

const AUTHOR = {
  dad: { label: "아빠", emoji: "👨", bubble: "bg-latte" },
  mom: { label: "엄마", emoji: "👩", bubble: "bg-peach-light" },
} as const;

function isoToday(): string {
  const t = todayLocal();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${mm}-${dd}`;
}

export default function JournalPage() {
  const [entries, setEntries, loaded] = useLocalStorage<Entry[]>(
    "zzokko:journal:v1",
    [],
  );
  const [author, setAuthor] = useState<"dad" | "mom">("dad");
  const [body, setBody] = useState("");

  const save = () => {
    const text = body.trim();
    if (!text) return;
    setEntries((prev) => [
      { id: crypto.randomUUID(), date: isoToday(), author, body: text },
      ...prev,
    ]);
    setBody("");
  };

  const remove = (id: string) => {
    if (!window.confirm("이 일기를 삭제할까요?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-extrabold text-choco">태담 일기 💬</h1>
        <p className="mt-1 text-sm text-choco-light">
          {NICKNAME}에게 남기는 엄마·아빠의 한마디 — 나중에 그대로 선물이 돼요
        </p>
      </header>

      {/* 작성 */}
      <section className="rounded-3xl bg-white/70 p-4 shadow-sm">
        <div className="flex gap-2">
          {(Object.keys(AUTHOR) as Array<keyof typeof AUTHOR>).map((k) => (
            <button
              key={k}
              onClick={() => setAuthor(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                author === k
                  ? "bg-choco text-cream"
                  : "bg-cream text-choco-light"
              }`}
            >
              {AUTHOR[k].emoji} {AUTHOR[k].label}
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`${NICKNAME}야, 오늘은…`}
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-latte bg-cream p-3 text-sm outline-none placeholder:text-choco-light/60 focus:border-peach"
        />
        <button
          onClick={save}
          disabled={!body.trim()}
          className="mt-2 w-full rounded-2xl bg-choco py-3 text-sm font-bold text-cream disabled:opacity-40"
        >
          {NICKNAME}에게 남기기
        </button>
      </section>

      {/* 목록 */}
      <section className="flex flex-col gap-3">
        {loaded && entries.length === 0 && (
          <p className="py-8 text-center text-sm text-choco-light">
            첫 태담을 남겨보세요 ✍️
          </p>
        )}
        {entries.map((e) => {
          const d = parseISODate(e.date);
          const g = gestationAt(d);
          const a = AUTHOR[e.author];
          return (
            <article
              key={e.id}
              className={`rounded-3xl p-4 shadow-sm ${a.bubble}`}
            >
              <div className="flex items-center justify-between text-xs text-choco-light">
                <span className="font-semibold text-choco">
                  {a.emoji} {a.label}
                </span>
                <span>
                  {formatDateKo(d)} · {g.week}주 {g.day}일
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                {e.body}
              </p>
              <div className="mt-2 text-right">
                <button
                  onClick={() => remove(e.id)}
                  className="text-[11px] text-choco-light underline"
                >
                  삭제
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
