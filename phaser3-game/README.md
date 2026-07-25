# Phaser 3 学习游戏

这是作业中“做一款 Phaser 2D 游戏”的独立项目。目前先搭好最小可运行骨架：

- Phaser 3.90.0
- Vite 开发环境
- Arcade Physics 物理系统
- Scene 的 `preload`、`create`、`update` 生命周期
- 方向键和 WASD 控制

## 运行

```bash
npm install
npm run dev
```

打开终端显示的地址后，用方向键或 WASD 移动黄色方块。

## 学习顺序

1. 阅读 `src/main.js` 中三个生命周期方法。
2. 在 `create` 中修改玩家的颜色、尺寸和初始位置。
3. 在 `update` 中修改移动速度。
4. 确认理解后，再加入正式的角色、美术资源、碰撞和胜负规则。
