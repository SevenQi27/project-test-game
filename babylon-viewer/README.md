# TRELLIS.2 × Babylon.js 自动化施工场区

这个子项目使用 Babylon.js 构建一个 60 × 40 米的施工场区，并把 TRELLIS.2
生成的六个 GLB 模型加载到同一场景中。

## 功能

- “施工场区”和“单模型”两种展示模式
- Babylon.js 程序化生成地面、环形道路、铁路、停机坪、围栏和施工设施
- 同时加载建筑、货箱、推土机、挖掘机、火车头、直升机六个 GLB
- 推土机沿环路巡检、挖掘机在作业区移动、火车头沿铁轨运输
- 直升机绕停机坪巡航并上下浮动
- 暂停/继续、0.5×/1×/2× 调速、全景和俯瞰视角
- ArcRotateCamera 鼠标旋转、滚轮缩放和拖动视角
- 单模型模式保留自动居中、统一缩放、灯光和阴影

## 代码结构

- `app/BabylonViewer.tsx`：React 界面、模式切换和 Babylon 引擎生命周期
- `app/modelCatalog.ts`：六个 GLB 模型清单和部署路径
- `app/world/createConstructionSite.ts`：场区搭建、GLB 加载和运动控制

场区中的道路等基础设施由 `MeshBuilder` 创建；GLB 通过
`SceneLoader.ImportMeshAsync` 加载。每台运动设备外层包裹一个
`TransformNode`，每帧更新这个节点的位置和朝向，因此不需要修改原始 GLB。

这些 TRELLIS 模型当前不包含骨骼或关键帧动画，所以现阶段实现的是整车、整机
运动。若要让挖掘机机械臂、铲斗或直升机旋翼独立运动，需要先在 Blender 中拆分、
绑定或制作动画，再重新导出 GLB。

## 本地运行

```bash
npm install
npm run dev
```

访问终端输出的本地地址。

## 构建与测试

```bash
npm test
npm run test:aws
```

## AWS 在线地址

<https://d1hy0fie0bnfbl.cloudfront.net/babylon/index.html>

AWS 使用独立的静态 Vite 构建。整个项目的上传和 CloudFront 缓存刷新由根目录的
`infra/deploy.sh` 完成。
