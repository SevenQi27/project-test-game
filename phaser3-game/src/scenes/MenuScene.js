import Phaser from "phaser";
import { COLORS, FONT_FAMILY } from "../game/constants.js";
import { createBackdrop, createButton } from "../game/ui.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    createBackdrop(this);

    this.add
      .text(70, 74, "DATA CORE", {
        fontFamily: FONT_FAMILY,
        fontSize: "15px",
        fontStyle: "bold",
        color: COLORS.gold,
        letterSpacing: 5,
      })
      .setDepth(2);

    this.add
      .text(66, 103, "数据核心保卫战", {
        fontFamily: FONT_FAMILY,
        fontSize: "48px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setDepth(2);

    this.add
      .text(
        70,
        172,
        "收集 8 枚数据芯片，躲开追踪病毒，\n在通道关闭前进入传送门。",
        {
          fontFamily: FONT_FAMILY,
          fontSize: "18px",
          lineSpacing: 9,
          color: COLORS.muted,
        },
      )
      .setDepth(2);

    this.createMissionCard();

    const start = () => this.scene.start("game");
    createButton(this, 715, 396, "启动任务  ENTER", start).setDepth(3);

    this.add
      .text(715, 440, "最高分会保存在当前浏览器", {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: "#6f8c85",
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.input.keyboard.once("keydown-ENTER", start);

    const player = this.add.image(758, 182, "player-core").setScale(1.75).setDepth(3);
    this.tweens.add({
      targets: player,
      y: player.y - 12,
      angle: 8,
      duration: 1350,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.add
      .image(830, 235, "data-shard")
      .setScale(1.3)
      .setAngle(18)
      .setDepth(3);
    this.add.image(670, 250, "hunter").setScale(1.2).setDepth(3);
  }

  createMissionCard() {
    this.add
      .rectangle(236, 369, 340, 176, 0x0b1c1c, 0.9)
      .setStrokeStyle(1, 0x345c54, 0.8)
      .setDepth(2);

    this.add
      .text(92, 302, "操作协议", {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        fontStyle: "bold",
        color: COLORS.cyan,
      })
      .setDepth(3);

    this.add
      .text(
        92,
        334,
        "方向键 / WASD   移动\nSPACE              冲刺\nP                  暂停",
        {
          fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
          fontSize: "16px",
          lineSpacing: 12,
          color: COLORS.cream,
        },
      )
      .setDepth(3);
  }
}
