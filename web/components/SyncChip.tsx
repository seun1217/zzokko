"use client";

import Link from "next/link";
import { useFamily } from "@/lib/family";

/** 현재 저장 모드를 보여주는 작은 상태 칩 (탭하면 공유 설정으로 이동) */
export default function SyncChip() {
  const { status, members } = useFamily();

  const label =
    status === "local"
      ? "📱 이 기기에만 저장 중"
      : status === "loading"
        ? "⏳ 확인 중"
        : status === "signedOut"
          ? "🔒 로그인하고 부부 공유 켜기"
          : status === "noFamily"
            ? "💑 가족 공간 만들기"
            : members.length >= 2
              ? "💑 부부 공유 중"
              : "💌 배우자 초대하기";

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1 self-start rounded-full bg-latte px-3 py-1 text-[11px] font-semibold text-choco"
    >
      {label}
      <span aria-hidden>›</span>
    </Link>
  );
}
