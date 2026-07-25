# TRELLIS.2 × Babylon.js GLB 查看器

这个页面使用 Babylon.js 加载并展示 `asset/trellis-sample` 中由 TRELLIS.2
生成的 GLB 模型。

## 功能

- GLB 2.0 模型加载
- 六个模型在线切换
- ArcRotateCamera 鼠标旋转和滚轮缩放
- 模型自动居中、统一缩放和落地
- 环境光、方向光、地面阴影
- 自动旋转控制

## 本地运行

```bash
npm install
npm run dev
```

访问终端输出的本地地址。

## 关键代码

模型加载逻辑位于 `app/BabylonViewer.tsx`：

```ts
const result = await SceneLoader.ImportMeshAsync(
  null,
  "",
  "/models/typical_vehicle_bulldozer.glb",
  scene,
);
```

Babylon.js 通过 `@babylonjs/loaders/glTF` 注册 GLB/glTF 加载器，再由
`SceneLoader.ImportMeshAsync` 将文件中的网格、材质和贴图加入当前场景。
