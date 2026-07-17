"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { NICKNAME } from "@/lib/pregnancy";

interface NameCandidate {
  id: string;
  hangul: string;
  hanja: string;
  meaning: string;
  dadScore: number; // 0~5
  momScore: number; // 0~5
}

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n}점`}
          className={`px-0.5 text-base ${
            n <= value ? "" : "opacity-25 grayscale"
          }`}
        >
          ⭐
        </button>
      ))}
    </span>
  );
}

export default function NamesPage() {
  const [names, setNames, loaded] = useLocalStorage<NameCandidate[]>(
    "zzokko:names:v1",
    [],
  );
  const [surname, setSurname] = useLocalStorage<string>("zzokko:surname", "");
  const [hangul, setHangul] = useState("");
  const [hanja, setHanja] = useState("");
  const [meaning, setMeaning] = useState("");

  const add = () => {
    const name = hangul.trim();
    if (!name) return;
    if (names.some((n) => n.hangul === name)) {
      window.alert("이미 등록된 이름이에요!");
      return;
    }
    setNames((prev) => [
      {
        id: crypto.randomUUID(),
        hangul: name,
        hanja: hanja.trim(),
        meaning: meaning.trim(),
        dadScore: 0,
        momScore: 0,
      },
      ...prev,
    ]);
    setHangul("");
    setHanja("");
    setMeaning("");
  };

  const setScore = (id: string, who: "dadScore" | "momScore", v: number) =>
    setNames((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [who]: v } : n)),
    );

  const remove = (id: string) => {
    if (!window.confirm("이 후보를 삭제할까요?")) return;
    setNames((prev) => prev.filter((n) => n.id !== id));
  };

  const ranked = [...names].sort(
    (a, b) => b.dadScore + b.momScore - (a.dadScore + a.momScore),
  );

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-extrabold text-choco">이름 후보 ✍️</h1>
        <p className="mt-1 text-sm text-choco-light">
          {NICKNAME}의 진짜 이름 — 둘이 별점을 매겨 함께 정해요
        </p>
      </header>

      {/* 성 입력 */}
      <section className="flex items-center gap-3 rounded-3xl bg-white/70 p-4 shadow-sm">
        <label className="text-sm font-semibold text-choco">성(姓)</label>
        <input
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          placeholder="예: 김"
          className="w-20 rounded-xl border border-latte bg-cream px-3 py-2 text-center text-sm outline-none focus:border-peach"
        />
        <span className="text-xs text-choco-light">
          입력하면 풀네임으로 미리 볼 수 있어요
        </span>
      </section>

      {/* 후보 추가 */}
      <section className="rounded-3xl bg-white/70 p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={hangul}
            onChange={(e) => setHangul(e.target.value)}
            placeholder="이름 (예: 하윤)"
            className="min-w-0 flex-1 rounded-xl border border-latte bg-cream px-3 py-2.5 text-sm outline-none focus:border-peach"
          />
          <input
            value={hanja}
            onChange={(e) => setHanja(e.target.value)}
            placeholder="한자 (선택)"
            className="w-28 rounded-xl border border-latte bg-cream px-3 py-2.5 text-sm outline-none focus:border-peach"
          />
        </div>
        <input
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="뜻·메모 (선택) — 예: 여름 하늘처럼 맑게"
          className="mt-2 w-full rounded-xl border border-latte bg-cream px-3 py-2.5 text-sm outline-none focus:border-peach"
        />
        <button
          onClick={add}
          disabled={!hangul.trim()}
          className="mt-2 w-full rounded-2xl bg-choco py-3 text-sm font-bold text-cream disabled:opacity-40"
        >
          후보 추가
        </button>
      </section>

      {/* 랭킹 */}
      <section className="flex flex-col gap-3">
        {loaded && ranked.length === 0 && (
          <p className="py-8 text-center text-sm text-choco-light">
            첫 이름 후보를 올려보세요 💛
          </p>
        )}
        {ranked.map((n, i) => (
          <article key={n.id} className="rounded-3xl bg-white/70 p-4 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-peach">{i + 1}위</span>
              <h2 className="text-lg font-extrabold text-choco">
                {surname.trim()}
                {n.hangul}
              </h2>
              {n.hanja && (
                <span className="text-sm text-choco-light">{n.hanja}</span>
              )}
              <span className="ml-auto text-sm font-bold text-choco">
                {n.dadScore + n.momScore}점
              </span>
            </div>
            {n.meaning && (
              <p className="mt-1 text-xs text-choco-light">{n.meaning}</p>
            )}
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-choco">👨 아빠</span>
                <Stars
                  value={n.dadScore}
                  onChange={(v) => setScore(n.id, "dadScore", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-choco">👩 엄마</span>
                <Stars
                  value={n.momScore}
                  onChange={(v) => setScore(n.id, "momScore", v)}
                />
              </div>
            </div>
            <div className="mt-1 text-right">
              <button
                onClick={() => remove(n.id)}
                className="text-[11px] text-choco-light underline"
              >
                삭제
              </button>
            </div>
          </article>
        ))}
      </section>

      {names.length > 0 && (
        <p className="text-center text-xs text-choco-light">
          출생신고는 출생 후 1개월 이내 — 그때까지 천천히 골라도 돼요
        </p>
      )}
    </main>
  );
}
