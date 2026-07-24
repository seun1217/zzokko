"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useFamily } from "@/lib/family";
import {
  NICKNAME,
  formatDateKo,
  gestationAt,
  parseISODate,
  todayLocal,
} from "@/lib/pregnancy";

interface Photo {
  id: string;
  taken_on: string;
  week: number | null;
  memo: string;
  storage_path: string;
  url?: string;
}

const BUCKET = "ultrasounds";

function isoToday(): string {
  const t = todayLocal();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${mm}-${dd}`;
}

export default function AlbumPage() {
  const { status, family, session } = useFamily();
  const ready = status === "ready";

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [takenOn, setTakenOn] = useState(isoToday());
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refetch = useCallback(async () => {
    if (!ready || !supabase || !family) return;
    const { data } = await supabase
      .from("ultrasound_photos")
      .select("id, taken_on, week, memo, storage_path")
      .eq("family_id", family.id)
      .order("taken_on", { ascending: false });
    const rows = (data ?? []) as Photo[];
    if (rows.length > 0) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(
          rows.map((r) => r.storage_path),
          60 * 60,
        );
      const urlByPath = new Map<string, string>();
      for (const s of signed ?? []) {
        if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
      }
      for (const row of rows) row.url = urlByPath.get(row.storage_path);
    }
    setPhotos(rows);
  }, [ready, family]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !supabase || !family || !session || busy) return;
    setBusy(true);
    setError("");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${family.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const week = gestationAt(parseISODate(takenOn)).week;
      const { error: insErr } = await supabase
        .from("ultrasound_photos")
        .insert({
          family_id: family.id,
          taken_on: takenOn,
          week,
          memo: memo.trim(),
          storage_path: path,
          created_by: session.user.id,
        });
      if (insErr) throw insErr;
      setMemo("");
      if (fileRef.current) fileRef.current.value = "";
      await refetch();
    } catch {
      setError("업로드에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (photo: Photo) => {
    if (!supabase || !window.confirm("이 사진을 삭제할까요?")) return;
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    await supabase.from("ultrasound_photos").delete().eq("id", photo.id);
    await refetch();
  };

  // ── 미연동/미로그인 상태 ─────────────────────────────────────────
  if (!ready) {
    return (
      <main className="flex flex-col gap-4">
        <header>
          <h1 className="text-2xl font-extrabold text-choco">앨범 📸</h1>
          <p className="mt-1 text-sm text-choco-light">
            {NICKNAME}의 초음파 앨범
          </p>
        </header>
        <section className="rounded-3xl bg-white/70 p-6 text-center shadow-sm">
          <p className="text-5xl">🔒</p>
          <h2 className="mt-3 font-bold text-choco">
            {supabaseConfigured
              ? "로그인하면 앨범이 열려요"
              : "서버 연동 후 열려요"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-choco-light">
            사진은 부부 계정에만 공개되는 비공개 저장소에 안전하게 보관돼요.
          </p>
          {supabaseConfigured && (
            <Link
              href="/login"
              className="mt-4 inline-block rounded-full bg-choco px-6 py-2.5 text-sm font-bold text-cream"
            >
              공유 설정으로 가기
            </Link>
          )}
        </section>
        <p className="text-center text-xs text-choco-light">
          그동안은 휴대폰 갤러리에 &lsquo;{NICKNAME}&rsquo; 앨범을 만들어
          모아두면 나중에 한 번에 올리기 편해요 💛
        </p>
      </main>
    );
  }

  // ── 앨범 본편 ────────────────────────────────────────────────────
  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-extrabold text-choco">앨범 📸</h1>
        <p className="mt-1 text-sm text-choco-light">
          {NICKNAME}의 초음파 타임라인 — 부부만 볼 수 있어요
        </p>
      </header>

      {/* 업로드 */}
      <section className="rounded-3xl bg-white/70 p-4 shadow-sm">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="w-full text-sm text-choco-light file:mr-3 file:rounded-full file:border-0 file:bg-latte file:px-4 file:py-2 file:text-sm file:font-semibold file:text-choco"
        />
        <div className="mt-2 flex gap-2">
          <input
            type="date"
            value={takenOn}
            onChange={(e) => setTakenOn(e.target.value)}
            className="rounded-xl border border-latte bg-cream px-3 py-2.5 text-sm outline-none focus:border-peach"
          />
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 (예: GS 0.75cm)"
            className="min-w-0 flex-1 rounded-xl border border-latte bg-cream px-3 py-2.5 text-sm outline-none focus:border-peach"
          />
        </div>
        <button
          onClick={upload}
          disabled={busy}
          className="mt-2 w-full rounded-2xl bg-choco py-3 text-sm font-bold text-cream disabled:opacity-40"
        >
          {busy ? "올리는 중…" : "사진 올리기"}
        </button>
        {error && (
          <p className="mt-2 text-center text-xs text-choco-dark">{error}</p>
        )}
      </section>

      {/* 타임라인 */}
      <section className="flex flex-col gap-3">
        {photos.length === 0 && (
          <p className="py-8 text-center text-sm text-choco-light">
            첫 초음파 사진을 올려보세요 🖤 (7/15 아기집 사진부터!)
          </p>
        )}
        {photos.map((p) => {
          const d = parseISODate(p.taken_on);
          return (
            <article
              key={p.id}
              className="overflow-hidden rounded-3xl bg-white/70 shadow-sm"
            >
              {p.url && (
                // eslint-disable-next-line @next/next/no-img-element -- 서명 URL은 만료가 있어 next/image 최적화 대상이 아님
                <img
                  src={p.url}
                  alt={`${p.taken_on} 초음파`}
                  className="max-h-96 w-full bg-choco-dark/5 object-contain"
                />
              )}
              <div className="flex items-center justify-between p-3.5">
                <div>
                  <p className="text-sm font-bold text-choco">
                    {formatDateKo(d)}
                    {p.week !== null && ` · ${p.week}주`}
                  </p>
                  {p.memo && (
                    <p className="mt-0.5 text-xs text-choco-light">{p.memo}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(p)}
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
