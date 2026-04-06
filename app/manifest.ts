import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "命轮 · FateWheel",
    short_name: "命轮",
    description: "古老东方占卜遇见现代 AI，探索你的命运之轮。",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0618",
    theme_color: "#0A0618",
    orientation: "portrait",
    lang: "zh-CN",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
