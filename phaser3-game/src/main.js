import Phaser from "phaser";
import { TowerBootScene } from "./scenes/TowerBootScene.js";
import { TowerGameScene } from "./scenes/TowerGameScene.js";
import { TowerMenuScene } from "./scenes/TowerMenuScene.js";
import { TowerResultScene } from "./scenes/TowerResultScene.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./tower/constants.js";
import "./style.css";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#080d13",
  pixelArt: true,
  roundPixels: true,
  scene: [TowerBootScene, TowerMenuScene, TowerGameScene, TowerResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

if (import.meta.env.DEV) {
  window.__PHASER_GAME__ = game;
}
