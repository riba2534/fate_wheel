import type { Metadata, Viewport } from "next";
// 字体加载（通过 @fontsource 打包）
import "@fontsource/zcool-xiaowei/400.css";
import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "命轮 · FateWheel",
  description: "古老东方占卜遇见现代 AI，探索你的命运之轮。",
  applicationName: "命轮",
  appleWebApp: {
    capable: true,
    title: "命轮",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-icon-180.png",
  },
  openGraph: {
    title: "命轮 · FateWheel",
    description: "古老东方占卜遇见现代 AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0618",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
