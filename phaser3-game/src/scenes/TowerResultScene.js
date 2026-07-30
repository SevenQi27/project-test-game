import Phaser from "phaser";
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  SAVE_KEY,
} from "../tower/constants.js";
import { createMenuButton } from "../tower/ui.js";

export class TowerResultScene extends Phaser.Scene {
  constructor() {
    super("result");
  }

  init(data) {
    this.hero = data.hero;
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
      0x03070a,
      0.76,
    );

    this.add
      .text(480, 92, "TOWER CLEARED", {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        fontStyle: "bold",
        color: COLORS.gold,
        letterSpacing: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 128, "试炼完成", {
        fontFamily: FONT_FAMILY,
        fontSize: "60px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 214, "高塔领主倒下，封锁的大门终于开启。", {
        fontFamily: FONT_FAMILY,
        fontSize: "17px",
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    this.add
      .rectangle(480, 324, 480, 126, 0x101922, 0.94)
      .setStrokeStyle(1, 0x6c5b38);
    this.add
      .text(
        480,
        276,
        `剩余生命  ${this.hero.hp}\n攻击  ${this.hero.atk}    防御  ${this.hero.def}    金币  ${this.hero.gold}`,
        {
          fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
          fontSize: "17px",
          lineSpacing: 16,
          align: "center",
          color: COLORS.cream,
        },
      )
      .setOrigin(0.5, 0);

    createMenuButton(this, 480, 438, "重新挑战", () => this.restart()).setDepth(3);
    this.add
      .text(480, 492, "按 ENTER 重新开始 · 按 M 返回菜单", {
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-ENTER", () => this.restart());
    this.input.keyboard.once("keydown-M", () => this.scene.start("menu"));
  }

  restart() {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      // 忽略不可用的本地存储，直接开始新游戏。
    }
    this.scene.start("tower", { load: false });
  }
}
