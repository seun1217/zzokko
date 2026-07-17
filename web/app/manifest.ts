import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "쪼꼬 — 출산 준비",
    short_name: "쪼꼬",
    description: "쪼꼬와 함께하는 출산 준비 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ef",
    theme_color: "#6b4226",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
