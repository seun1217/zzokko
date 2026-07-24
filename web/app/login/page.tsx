"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useFamily, type Role } from "@/lib/family";
import { NICKNAME } from "@/lib/pregnancy";

function RolePicker({
  value,
  onChange,
}: {
  value: Role;
  onChange: (r: Role) => void;
}) {
  return (
    <div className="flex gap-2">
      {(
        [
          ["dad", "👨 아빠"],
          ["mom", "👩 엄마"],
        ] as const
      ).map(([r, label]) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold ${
            value === r ? "bg-choco text-cream" : "bg-cream text-choco-light"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const { status, session, family, members, myRole, refresh, signOut } =
    useFamily();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("dad");
  const [inviteCode, setInviteCode] = useState("");
  const [surname, setSurname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const inputCls =
    "w-full rounded-xl border border-latte bg-cream px-3 py-2.5 text-sm outline-none focus:border-peach";

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  const submitAuth = () =>
    run(async () => {
      if (!supabase) return;
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      }
      await refresh();
    });

  const createFamily = () =>
    run(async () => {
      if (!supabase) return;
      const { error: err } = await supabase.rpc("create_family", {
        member_role: role,
        p_surname: surname.trim(),
      });
      if (err) throw err;
      await refresh();
      router.push("/");
    });

  const joinFamily = () =>
    run(async () => {
      if (!supabase) return;
      const { error: err } = await supabase.rpc("join_family", {
        code: inviteCode.trim().toUpperCase(),
        member_role: role,
      });
      if (err) throw new Error("초대 코드를 확인해주세요.");
      await refresh();
      router.push("/");
    });

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-extrabold text-choco">공유 설정 💑</h1>
        <p className="mt-1 text-sm text-choco-light">
          부부가 같은 {NICKNAME} 데이터를 실시간으로 함께 봐요
        </p>
      </header>

      {status === "local" && (
        <section className="rounded-3xl bg-white/70 p-5 text-sm leading-relaxed text-choco-dark/90 shadow-sm">
          아직 서버(Supabase)가 연결되지 않아 <b>이 기기에만 저장</b>되고
          있어요. 배포 환경변수에 Supabase 키가 설정되면 이 화면에서 로그인과
          부부 공유를 켤 수 있어요.
          <p className="mt-2 text-xs text-choco-light">
            설정 방법: 저장소의 docs/SUPABASE.md 참고
          </p>
        </section>
      )}

      {status === "loading" && (
        <p className="py-8 text-center text-sm text-choco-light">
          확인 중…
        </p>
      )}

      {status === "signedOut" && (
        <section className="rounded-3xl bg-white/70 p-5 shadow-sm">
          <div className="flex gap-2">
            {(
              [
                ["signin", "로그인"],
                ["signup", "회원가입"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold ${
                  mode === m
                    ? "bg-choco text-cream"
                    : "bg-cream text-choco-light"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <input
              className={inputCls}
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={inputCls}
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={submitAuth}
            disabled={busy || !email || password.length < 6}
            className="mt-3 w-full rounded-2xl bg-choco py-3 text-sm font-bold text-cream disabled:opacity-40"
          >
            {mode === "signup" ? "가입하기" : "로그인"}
          </button>
          {mode === "signup" && (
            <p className="mt-2 text-xs text-choco-light">
              가입 후 이메일 확인이 필요할 수 있어요 (Supabase 설정에 따름).
            </p>
          )}
        </section>
      )}

      {status === "noFamily" && (
        <>
          <section className="rounded-3xl bg-white/70 p-5 shadow-sm">
            <h2 className="font-bold text-choco">나는 누구인가요?</h2>
            <div className="mt-2">
              <RolePicker value={role} onChange={setRole} />
            </div>
          </section>

          <section className="rounded-3xl bg-white/70 p-5 shadow-sm">
            <h2 className="font-bold text-choco">새 가족 공간 만들기</h2>
            <p className="mt-1 text-xs text-choco-light">
              먼저 만드는 사람이 초대 코드를 받아 배우자에게 알려주세요.
            </p>
            <input
              className={`${inputCls} mt-2`}
              placeholder="성(姓) — 선택, 예: 박"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
            <button
              onClick={createFamily}
              disabled={busy}
              className="mt-2 w-full rounded-2xl bg-choco py-3 text-sm font-bold text-cream disabled:opacity-40"
            >
              만들기
            </button>
          </section>

          <section className="rounded-3xl bg-peach-light p-5">
            <h2 className="font-bold text-choco">초대 코드로 참여하기</h2>
            <input
              className={`${inputCls} mt-2 uppercase tracking-widest`}
              placeholder="6자리 코드"
              maxLength={6}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <button
              onClick={joinFamily}
              disabled={busy || inviteCode.trim().length !== 6}
              className="mt-2 w-full rounded-2xl bg-choco py-3 text-sm font-bold text-cream disabled:opacity-40"
            >
              참여하기
            </button>
          </section>
        </>
      )}

      {status === "ready" && family && (
        <>
          <section className="rounded-3xl bg-white/70 p-5 shadow-sm">
            <h2 className="font-bold text-choco">
              {family.surname ? `${family.surname}씨네 ` : ""}
              {NICKNAME} 가족 공간
            </h2>
            <p className="mt-1 text-sm text-choco-dark/80">
              나: {myRole === "dad" ? "👨 아빠" : "👩 엄마"} ·{" "}
              {session?.user.email}
            </p>
            <p className="mt-0.5 text-xs text-choco-light">
              멤버 {members.length}명
              {members.length < 2 && " — 배우자를 초대해보세요!"}
            </p>
          </section>

          <section className="rounded-3xl bg-peach-light p-5 text-center">
            <p className="text-xs font-semibold text-choco">초대 코드</p>
            <p className="mt-1 text-3xl font-extrabold tracking-[0.3em] text-choco">
              {family.invite_code}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(family.invite_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="mt-2 rounded-full bg-choco px-4 py-1.5 text-xs font-bold text-cream"
            >
              {copied ? "복사됨 ✓" : "코드 복사"}
            </button>
            <p className="mt-2 text-xs text-choco-dark/70">
              배우자가 가입 후 이 코드로 참여하면 모든 기록이 실시간 공유돼요.
            </p>
          </section>

          <button
            onClick={() => run(signOut)}
            className="text-center text-xs text-choco-light underline"
          >
            로그아웃
          </button>
        </>
      )}

      {error && (
        <p className="rounded-2xl bg-peach-light p-3 text-center text-xs text-choco-dark">
          {error}
        </p>
      )}
    </main>
  );
}
