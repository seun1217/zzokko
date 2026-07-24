import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { FamilyProvider } from "@/lib/family";

export const metadata: Metadata = {
  title: "쪼꼬",
  description: "쪼꼬와 함께하는 출산 준비 — D-day, 검진 체크리스트, 태담 일기, 작명",
  appleWebApp: {
    capable: true,
    title: "쪼꼬",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6b4226",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <FamilyProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-24 pt-6">
            {children}
          </div>
          <BottomNav />
        </FamilyProvider>
      </body>
    </html>
  );
}
