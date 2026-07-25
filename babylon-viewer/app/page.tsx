import type { Metadata } from "next";
import { BabylonViewer } from "./BabylonViewer";

export const metadata: Metadata = {
  title: "TRELLIS × Babylon.js",
  description: "在 Babylon.js 中查看 TRELLIS.2 生成的 GLB 模型。",
};

export default function Home() {
  return <BabylonViewer />;
}
