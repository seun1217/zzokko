"use client";

import { useEffect, useMemo, useState } from "react";
import tasks from "@/data/tasks.json";
import { useChecklist } from "@/lib/hooks";
import {
  formatDateKo,
  formatMonthKo,
  parseISODate,
  todayLocal,
} from "@/lib/pregnancy";

type Filter = "all" | "todo" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "todo", label: "남은 일" },
  { key: "done", label: "완료" },
];

export default function ChecklistPage() {
  const { done, toggle, shared } = useChecklist();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(todayLocal()), []);

  const doneCount = Object.keys(done).length;

  const groups = useMemo(() => {
    const visible = tasks.filter((t) =>
      filter === "all" ? true : filter === "done" ? done[t.id] : !done[t.id],
    );
    const byMonth = new Map<string, typeof visible>();
    for (const t of visible) {
      const month = t.date.slice(0, 7);
      if (!byMonth.has(month)) byMonth.set(month, []);
      byMonth.get(month)!.push(t);
    }
    return [...byMonth.entries()];
  }, [filter, done]);

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-extrabold text-choco">체크리스트 ✅</h1>
        <p className="mt-1 text-sm text-choco-light">
          검진·행정·준비물 일정 —{" "}
          {shared ? "부부가 실시간으로 함께 체크해요" : "캘린더와 같은 데이터예요"}
        </p>
      </header>

      {/* 진행률 */}
      <section className="rounded-3xl bg-white/70 p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-choco">
            {doneCount} / {tasks.length} 완료
          </span>
          <span className="text-xs text-choco-light">
            {Math.round((doneCount / tasks.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-latte">
          <div
            className="h-full rounded-full bg-peach transition-all"
            style={{ width: `${(doneCount / tasks.length) * 100}%` }}
          />
        </div>
      </section>

      {/* 필터 */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              filter === f.key
                ? "bg-choco text-cream"
                : "bg-white/70 text-choco-light"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 월별 그룹 */}
      {groups.map(([month, list]) => (
        <section key={month}>
          <h2 className="sticky top-0 z-[1] -mx-4 bg-cream/95 px-4 py-2 text-sm font-bold text-choco backdrop-blur">
            {formatMonthKo(month)}
          </h2>
          <ul className="flex flex-col gap-2">
            {list.map((t) => {
              const d = parseISODate(t.date);
              const isDone = !!done[t.id];
              const isPast = today !== null && d < today && !isDone;
              const isOpen = openId === t.id;
              return (
                <li
                  key={t.id}
                  className={`rounded-2xl bg-white/70 p-3.5 shadow-sm ${
                    isDone ? "opacity-55" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggle(t.id)}
                      aria-label={isDone ? "완료 해제" : "완료"}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                        isDone
                          ? "border-choco bg-choco text-cream"
                          : "border-choco-light bg-transparent text-transparent"
                      }`}
                    >
                      ✓
                    </button>
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setOpenId(isOpen ? null : t.id)}
                    >
                      <p
                        className={`text-sm font-medium ${
                          isDone ? "line-through" : ""
                        }`}
                      >
                        {t.title}
                      </p>
                      <p className="mt-0.5 text-xs text-choco-light">
                        {formatDateKo(d)} · {t.category}
                        {isPast && (
                          <span className="ml-1.5 rounded-full bg-peach px-1.5 py-px text-[10px] font-bold text-choco-dark">
                            지남
                          </span>
                        )}
                      </p>
                      {isOpen && (
                        <p className="mt-2 whitespace-pre-line rounded-xl bg-cream p-3 text-xs leading-relaxed text-choco-dark/90">
                          {t.description}
                        </p>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {groups.length === 0 && (
        <p className="py-8 text-center text-sm text-choco-light">
          {filter === "done"
            ? "아직 완료한 일이 없어요"
            : "남은 일이 없어요! 🎉"}
        </p>
      )}
    </main>
  );
}
