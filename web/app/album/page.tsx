import { NICKNAME } from "@/lib/pregnancy";

const PLANNED = [
  { emoji: "🖼", text: "검진마다 초음파 사진 업로드 + 주수·크기 태깅" },
  { emoji: "🗓", text: "시간순 타임라인으로 쪼꼬의 성장 한눈에" },
  { emoji: "👨‍👩‍👧", text: "부부 공유 — 나중엔 조부모 보기 전용 초대" },
  { emoji: "👶", text: "출산 후엔 성장 앨범으로 자동 전환" },
];

export default function AlbumPage() {
  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-extrabold text-choco">앨범 📸</h1>
        <p className="mt-1 text-sm text-choco-light">
          {NICKNAME}의 초음파 앨범 — 준비 중이에요
        </p>
      </header>

      <section className="rounded-3xl bg-white/70 p-6 text-center shadow-sm">
        <p className="text-5xl">🚧</p>
        <h2 className="mt-3 font-bold text-choco">
          사진 보관함(Supabase) 연동 후 열려요
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-choco-light">
          사진은 기기 하나에만 저장하면 잃어버리기 쉬워서,
          <br />
          안전한 클라우드 저장소 연결과 함께 공개할 예정이에요.
        </p>
      </section>

      <section className="rounded-3xl bg-peach-light p-5">
        <h2 className="text-sm font-bold text-choco">이렇게 만들어질 거예요</h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-choco-dark/90">
          {PLANNED.map((p) => (
            <li key={p.text} className="flex gap-2">
              <span>{p.emoji}</span>
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-xs text-choco-light">
        그동안은 휴대폰 갤러리에 &lsquo;{NICKNAME}&rsquo; 앨범을 만들어 모아두면
        나중에 한 번에 올리기 편해요 💛
      </p>
    </main>
  );
}
