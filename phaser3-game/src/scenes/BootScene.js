import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  // preload 会在 create 之前执行。以后有图片、音效、地图时放在这里加载。
  preload() {}

  create() {
    this.createPlayerTexture();
    this.createShardTexture();
    this.createEnemyTexture();
    this.createPortalTexture();
    this.scene.start("menu");
  }

  createPlayerTexture() {
    const graphics = this.make.graphics({ add: false });
    graphics.fillStyle(0x0b1718);
    graphics.fillCircle(24, 24, 21);
    graphics.lineStyle(3, 0xf2bd5a);
    graphics.strokeCircle(24, 24, 20);
    graphics.fillStyle(0xf2bd5a);
    graphics.fillTriangle(24, 6, 40, 34, 24, 29);
    graphics.fillStyle(0x7de2c4);
    graphics.fillCircle(24, 24, 5);
    graphics.generateTexture("player-core", 48, 48);
    graphics.destroy();
  }

  createShardTexture() {
    const graphics = this.make.graphics({ add: false });
    graphics.fillStyle(0x7de2c4);
    graphics.fillTriangle(15, 1, 29, 15, 15, 29);
    graphics.fillTriangle(15, 1, 15, 29, 1, 15);
    graphics.lineStyle(2, 0xd7fff2);
    graphics.strokeTriangle(15, 2, 28, 15, 15, 28);
    graphics.strokeTriangle(15, 2, 15, 28, 2, 15);
    graphics.generateTexture("data-shard", 30, 30);
    graphics.destroy();
  }

  createEnemyTexture() {
    const graphics = this.make.graphics({ add: false });
    graphics.fillStyle(0x35191a);
    graphics.fillCircle(22, 22, 19);
    graphics.lineStyle(3, 0xf06b68);
    graphics.strokeCircle(22, 22, 18);
    graphics.fillStyle(0xf06b68);
    graphics.fillTriangle(22, 7, 37, 31, 7, 31);
    graphics.fillStyle(0xffd2ce);
    graphics.fillCircle(22, 23, 4);
    graphics.generateTexture("hunter", 44, 44);
    graphics.destroy();
  }

  createPortalTexture() {
    const graphics = this.make.graphics({ add: false });
    graphics.lineStyle(6, 0x7de2c4, 0.35);
    graphics.strokeCircle(36, 36, 29);
    graphics.lineStyle(3, 0x7de2c4, 1);
    graphics.strokeCircle(36, 36, 23);
    graphics.lineStyle(2, 0xf2bd5a, 0.85);
    graphics.strokeCircle(36, 36, 14);
    graphics.generateTexture("portal", 72, 72);
    graphics.destroy();
  }
}
