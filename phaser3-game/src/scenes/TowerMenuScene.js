import Phaser from "phaser";
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  SAVE_KEY,
} from "../tower/constants.js";
import { createMenuButton } from "../tower/ui.js";

export class TowerMenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "tower-cover").setDisplaySize(
      GAME_WIDTH,
      GAME_HEIGHT,
    );
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x04070b,
      0.48,
    );
    this.add.rectangle(730, 320, 390, 640, 0x071018, 0.82);

    this.add
      .text(570, 82, "PHASER 3 · MINI RPG", {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        fontStyle: "bold",
        color: COLORS.gold,
        letterSpacing: 4,
      })
      .setDepth(2);

    this.add
      .text(566, 114, "深塔试炼", {
        fontFamily: FONT_FAMILY,
        fontSize: "58px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setDepth(2);

    this.add
      .text(
        570,
        192,
        "三层原创迷你魔塔\n每一步，都是一次数值选择。",
        {
          fontFamily: FONT_FAMILY,
          fontSize: "18px",
          lineSpacing: 10,
          color: "#b5c0c3",
        },
      )
      .setDepth(2);

    const hasSave = this.hasSave();
    createMenuButton(this, 748, 324, "开始新的试炼", () => this.startNewGame())
      .setDepth(3);
    createMenuButton(
      this,
      748,
      392,
      hasSave ? "继续上次进度" : "暂无存档",
      () => this.scene.start("tower", { load: true }),
      hasSave,
    ).setDepth(3);

    this.add
      .text(
        570,
        456,
        "方向键 / WASD  移动一格\nH  怪物图鉴    Q  存档    L  读档",
        {
          fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
          fontSize: "14px",
          lineSpacing: 9,
          color: COLORS.muted,
        },
      )
      .setDepth(2);

    this.add
      .text(570, 552, "目标：击败第三层的高塔领主", {
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        color: COLORS.cyan,
      })
      .setDepth(2);

    this.input.keyboard.once("keydown-ENTER", () => this.startNewGame());
  }

  hasSave() {
    try {
      return Boolean(window.localStorage.getItem(SAVE_KEY));
    } catch {
      return false;
    }
  }

  startNewGame() {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      // 浏览器禁用 localStorage 时仍允许新游戏运行。
    }
    this.scene.start("tower", { load: false });
  }
}
