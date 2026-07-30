import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRELLIS 施工场区 × Babylon.js",
  description: "在 Babylon.js 施工场区中查看自动运行的 TRELLIS.2 GLB 模型。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
