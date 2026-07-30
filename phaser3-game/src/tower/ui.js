import { COLORS, FONT_FAMILY } from "./constants.js";

export function createMenuButton(scene, x, y, label, onPress, enabled = true) {
  const fill = enabled ? 0x253743 : 0x1a2228;
  const stroke = enabled ? 0xe7b85d : 0x465158;
  const background = scene.add
    .rectangle(x, y, 264, 52, fill, 0.94)
    .setStrokeStyle(2, stroke, 0.9);

  const text = scene.add
    .text(x, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: "17px",
      fontStyle: "bold",
      color: enabled ? COLORS.cream : "#667077",
    })
    .setOrigin(0.5);

  if (enabled) {
    background.setInteractive({ useHandCursor: true });
    background.on("pointerover", () => background.setFillStyle(0x385160));
    background.on("pointerout", () => background.setFillStyle(fill));
    background.on("pointerdown", onPress);
  }

  return scene.add.container(0, 0, [background, text]);
}

export function createSmallButton(scene, x, y, label, onPress) {
  const background = scene.add
    .rectangle(x, y, 96, 30, 0x1a2932, 1)
    .setStrokeStyle(1, 0x50636e)
    .setInteractive({ useHandCursor: true });
  const text = scene.add
    .text(x, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: "12px",
      color: COLORS.cream,
    })
    .setOrigin(0.5);

  background.on("pointerover", () => background.setFillStyle(0x304754));
  background.on("pointerout", () => background.setFillStyle(0x1a2932));
  background.on("pointerdown", onPress);
  return scene.add.container(0, 0, [background, text]);
}
