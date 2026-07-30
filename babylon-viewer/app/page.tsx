import type { Metadata } from "next";
import { BabylonViewer } from "./BabylonViewer";

export const metadata: Metadata = {
  title: "TRELLIS 施工场区 × Babylon.js",
  description: "使用 Babylon.js 构建施工场区，加载并驱动 TRELLIS.2 GLB 模型。",
};

export default function Home() {
  return <BabylonViewer />;
}
