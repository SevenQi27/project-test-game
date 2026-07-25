# 数据核心保卫战

使用 Phaser 3.90.0 和 Vite 制作的完整 2D 街机小游戏，也是作业中“做一款
Phaser 2D 游戏”的实现。

## 游戏目标

在 55 秒内收集 8 枚绿色数据芯片。收集完成后，右下角会开启传送门；在生命值
归零或倒计时结束前进入传送门即可获胜。

## 操作

- 方向键或 `WASD`：移动
- `SPACE`：冲刺，冲刺期间可以击毁病毒
- `P`：暂停或继续
- `ENTER`：开始游戏或重新开始
- `M`：结算界面返回主菜单

## 运行

```bash
npm install
npm run dev
```

## 代码结构

```text
src/
├── main.js                 # Phaser.Game 配置和 Scene 注册
├── game/
│   ├── constants.js       # 尺寸、时间、颜色等公共配置
│   └── ui.js              # 背景、按钮和文本等公共方法
└── scenes/
    ├── BootScene.js        # preload 生命周期和代码生成贴图
    ├── MenuScene.js        # 开始界面
    ├── GameScene.js        # 移动、碰撞、计时、敌人和胜负规则
    └── ResultScene.js      # 结算、最高分和重新开始
```

## 建议学习顺序

1. 从 `main.js` 看 Phaser 如何注册和启动多个 Scene。
2. 看 `BootScene.js` 的 `preload` 和 `create`，理解资源准备阶段。
3. 看 `GameScene.js` 的 `create`，理解游戏对象、物理组、碰撞和计时器。
4. 看 `GameScene.js` 的 `update`，理解每一帧如何读取输入和追踪玩家。
5. 最后看 `MenuScene.js` 和 `ResultScene.js`，理解 Scene 之间如何传递数据。

## 已实现的 Phaser 知识点

- Scene 生命周期与 Scene 切换
- Arcade Physics、世界边界和 Overlap 碰撞
- Keyboard 输入和 `JustDown`
- Group 管理多个游戏对象
- Time Event 定时生成敌人和倒计时
- Tween、Camera Shake、Camera Flash 等反馈效果
- 本地最高分保存
