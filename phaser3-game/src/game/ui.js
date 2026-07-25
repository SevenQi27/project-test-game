import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH } from "./constants.js";

export function createBackdrop(scene) {
  scene.cameras.main.setBackgroundColor(COLORS.background);
  scene.add.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    GAME_WIDTH,
    GAME_HEIGHT,
    COLORS.background,
  );

  scene.add
    .grid(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      48,
      48,
      COLORS.panel,
      0.42,
      COLORS.grid,
      0.36,
    )
    .setDepth(0);

  const glow = scene.add.graphics().setDepth(0);
  glow.fillStyle(0x1f6659, 0.12);
  glow.fillCircle(130, 440, 180);
  glow.fillStyle(0xd09235, 0.08);
  glow.fillCircle(850, 90, 150);

  scene.add
    .text(24, GAME_HEIGHT - 22, "NODE 27 · SECURE SIMULATION", {
      fontFamily: FONT_FAMILY,
      fontSize: "10px",
      color: "#53716a",
      letterSpacing: 2,
    })
    .setOrigin(0, 1)
    .setDepth(1);
}

export function createButton(scene, x, y, label, onPress) {
  const background = scene.add
    .rectangle(x, y, 250, 58, 0x173b36, 1)
    .setStrokeStyle(2, 0x7de2c4, 0.75)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(x, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: "18px",
      fontStyle: "bold",
      color: COLORS.cream,
    })
    .setOrigin(0.5);

  background.on("pointerover", () => {
    background.setFillStyle(0x23564e);
    scene.tweens.add({
      targets: [background, text],
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 110,
    });
  });

  background.on("pointerout", () => {
    background.setFillStyle(0x173b36);
    scene.tweens.add({
      targets: [background, text],
      scaleX: 1,
      scaleY: 1,
      duration: 110,
    });
  });

  background.on("pointerdown", onPress);
  return scene.add.container(0, 0, [background, text]);
}

export function pulseText(scene, x, y, label, color = COLORS.gold) {
  const text = scene.add
    .text(x, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: "18px",
      fontStyle: "bold",
      color,
    })
    .setOrigin(0.5)
    .setDepth(30);

  scene.tweens.add({
    targets: text,
    y: y - 34,
    alpha: 0,
    duration: 650,
    ease: "Cubic.Out",
    onComplete: () => text.destroy(),
  });
}

export function formatTime(seconds) {
  return `00:${String(Math.max(seconds, 0)).padStart(2, "0")}`;
}

export function randomEdgePoint() {
  const margin = 34;
  const edge = Phaser.Math.Between(0, 3);

  if (edge === 0) return { x: Phaser.Math.Between(70, 890), y: margin };
  if (edge === 1) return { x: GAME_WIDTH - margin, y: Phaser.Math.Between(100, 500) };
  if (edge === 2) return { x: Phaser.Math.Between(70, 890), y: GAME_HEIGHT - margin };
  return { x: margin, y: Phaser.Math.Between(100, 500) };
}
