import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRELLIS × Babylon.js",
  description: "在浏览器中查看 TRELLIS.2 生成的 GLB 模型。",
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
