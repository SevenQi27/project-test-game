import Phaser from "phaser";
import { COLORS, FONT_FAMILY } from "../game/constants.js";
import { createBackdrop, createButton } from "../game/ui.js";

const HIGH_SCORE_KEY = "phaser-data-core-high-score";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("result");
  }

  init(data) {
    this.result = data;
  }

  create() {
    createBackdrop(this);
    const { won, message, score, collected, health, remaining } = this.result;
    const bestScore = this.saveBestScore(score);

    this.add
      .text(480, 75, won ? "MISSION COMPLETE" : "MISSION FAILED", {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        fontStyle: "bold",
        color: won ? COLORS.cyan : COLORS.red,
        letterSpacing: 5,
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.add
      .text(480, 108, won ? "传输成功" : "任务失败", {
        fontFamily: FONT_FAMILY,
        fontSize: "54px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.add
      .text(480, 176, message, {
        fontFamily: FONT_FAMILY,
        fontSize: "17px",
        color: COLORS.muted,
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.add
      .rectangle(480, 281, 600, 142, 0x0b1c1c, 0.92)
      .setStrokeStyle(1, 0x345c54)
      .setDepth(2);

    this.add
      .text(
        480,
        238,
        `本局得分  ${score}\n收集数据  ${collected}\n剩余核心  ${health}    剩余时间  ${remaining}s`,
        {
          fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
          fontSize: "17px",
          lineSpacing: 10,
          align: "center",
          color: COLORS.cream,
        },
      )
      .setOrigin(0.5, 0)
      .setDepth(3);

    this.add
      .text(480, 359, `历史最高分  ${bestScore}`, {
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        color: COLORS.gold,
      })
      .setOrigin(0.5)
      .setDepth(2);

    const restart = () => this.scene.start("game");
    createButton(this, 480, 416, "再来一次  ENTER", restart).setDepth(3);

    this.add
      .text(480, 466, "按 M 返回主菜单", {
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        color: COLORS.muted,
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.input.keyboard.once("keydown-ENTER", restart);
    this.input.keyboard.once("keydown-M", () => this.scene.start("menu"));
  }

  saveBestScore(score) {
    try {
      const previous = Number(window.localStorage.getItem(HIGH_SCORE_KEY)) || 0;
      const best = Math.max(previous, score);
      window.localStorage.setItem(HIGH_SCORE_KEY, String(best));
      return best;
    } catch {
      return score;
    }
  }
}
