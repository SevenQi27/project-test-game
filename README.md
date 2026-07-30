# AI 游戏开发作业

这个目录把作业中的 Babylon.js 3D 展示和 Phaser 3 2D 游戏拆成了两个互不干扰的项目：

```text
project_test_game/
├── babylon-viewer/  # Babylon.js 加载 TRELLIS 生成的 GLB 模型
└── phaser3-game/    # Phaser 3 三层迷你魔塔《深塔试炼》
```

## Babylon.js 项目

```bash
cd babylon-viewer
npm install
npm run dev
```

## Phaser 3 项目

```bash
cd phaser3-game
npm install
npm run dev
```

两个项目都有自己的 `package.json` 和依赖，可以分别学习、运行和构建。

## 在线部署

Phaser 游戏通过本机脚本手动构建，并部署到私有 S3 Bucket 和 CloudFront。基础设施模板和部署说明见 [`infra/README.md`](infra/README.md)。
