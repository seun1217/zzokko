"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", emoji: "🏠", label: "홈" },
  { href: "/checklist", emoji: "✅", label: "체크" },
  { href: "/journal", emoji: "💬", label: "일기" },
  { href: "/names", emoji: "✍️", label: "이름" },
  { href: "/album", emoji: "📸", label: "앨범" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-latte bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                active ? "font-bold text-choco" : "text-choco-light"
              }`}
            >
              <span className="text-lg leading-none">{tab.emoji}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
