import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { ResultScene } from "./scenes/ResultScene.js";
import "./style.css";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 960,
  height: 540,
  backgroundColor: "#071314",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

// 开发环境保留一个只用于调试的入口，方便在浏览器控制台观察 Scene 状态。
if (import.meta.env.DEV) {
  window.__PHASER_GAME__ = game;
}
