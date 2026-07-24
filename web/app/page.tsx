"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import tasks from "@/data/tasks.json";
import SyncChip from "@/components/SyncChip";
import { weeklyInfo } from "@/data/weekly";
import {
  EDD,
  NICKNAME,
  formatDateKo,
  gestationAt,
  parseISODate,
  todayLocal,
} from "@/lib/pregnancy";

const CATEGORY_COLOR: Record<string, string> = {
  "행정·지원금": "bg-peach-light text-choco",
  "병원·검진": "bg-latte text-choco",
  마일스톤: "bg-peach text-choco-dark",
  준비물: "bg-cream text-choco border border-latte",
  "보험·돈": "bg-latte text-choco",
};

export default function Home() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(todayLocal()), []);

  if (!today) {
    return (
      <main className="flex flex-1 items-center justify-center text-choco-light">
        쪼꼬 불러오는 중… 💛
      </main>
    );
  }

  const g = gestationAt(today);
  const info = weeklyInfo(g.week);
  const upcoming = tasks
    .filter((t) => parseISODate(t.date) >= today)
    .slice(0, 3);

  return (
    <main className="flex flex-col gap-4">
      <header className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-extrabold text-choco">쪼꼬 💛</h1>
          <span className="text-sm text-choco-light">
            {formatDateKo(today)}
          </span>
        </div>
        <SyncChip />
      </header>

      {/* D-day 히어로 */}
      <section className="rounded-3xl bg-choco p-6 text-cream shadow-lg">
        <p className="text-sm opacity-80">{NICKNAME} 만나기까지</p>
        <p className="mt-1 text-5xl font-extrabold tracking-tight">
          D-{g.dday}
        </p>
        <p className="mt-2 text-sm">
          임신 <b>{g.week}주 {g.day}일</b> · {g.trimester}분기
        </p>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-choco-dark/60">
          <div
            className="h-full rounded-full bg-peach transition-all"
            style={{ width: `${Math.round(g.progress * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs opacity-80">
          <span>{Math.round(g.progress * 100)}%</span>
          <span>
            예정일 {EDD.getFullYear()}.{EDD.getMonth() + 1}.{EDD.getDate()}
          </span>
        </div>
      </section>

      {/* 이번 주 쪼꼬 */}
      {info && (
        <section className="flex items-center gap-4 rounded-3xl bg-peach-light p-5">
          <span className="text-5xl">{info.emoji}</span>
          <div className="min-w-0">
            <p className="font-bold text-choco">
              이번 주 {NICKNAME}는 {info.compare}만 해요
            </p>
            <p className="mt-0.5 text-sm text-choco-dark/80">{info.note}</p>
            <p className="mt-1 text-xs text-choco-light">
              약 {info.length} · {info.week}주차
            </p>
          </div>
        </section>
      )}

      {/* 다가오는 일정 */}
      <section className="rounded-3xl bg-white/70 p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold text-choco">다가오는 일정</h2>
          <Link href="/checklist" className="text-xs text-choco-light">
            전체 보기 →
          </Link>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {upcoming.map((t) => {
            const d = parseISODate(t.date);
            return (
              <li key={t.id} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-sm font-semibold text-choco">
                  {formatDateKo(d)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm">{t.title}</p>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] ${
                      CATEGORY_COLOR[t.category] ?? "bg-latte text-choco"
                    }`}
                  >
                    {t.category}
                  </span>
                </div>
              </li>
            );
          })}
          {upcoming.length === 0 && (
            <li className="text-sm text-choco-light">
              남은 일정이 없어요. 쪼꼬 만날 준비 완료! 👶
            </li>
          )}
        </ul>
      </section>

      {/* 바로가기 */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { href: "/journal", emoji: "💬", label: "태담 일기" },
          { href: "/names", emoji: "✍️", label: "이름 후보" },
          { href: "/album", emoji: "📸", label: "앨범" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex flex-col items-center gap-1 rounded-2xl bg-white/70 py-4 shadow-sm"
          >
            <span className="text-2xl">{q.emoji}</span>
            <span className="text-xs font-semibold text-choco">{q.label}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
