import Phaser from "phaser";
import "./style.css";

class LearningScene extends Phaser.Scene {
  constructor() {
    super("learning-scene");
  }

  // preload 会在场景创建前执行，以后可以在这里加载图片、音效和地图。
  preload() {}

  // create 只执行一次，用来创建游戏对象和初始化输入。
  create() {
    this.add
      .text(32, 28, "移动训练", {
        fontFamily: "Arial, sans-serif",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#f6f2e7",
      })
      .setDepth(1);

    this.add.text(32, 62, "方向键 / WASD", {
      fontFamily: "Arial, sans-serif",
      fontSize: "15px",
      color: "#9ed7c5",
    }).setDepth(1);

    this.add.grid(480, 270, 960, 540, 48, 48, 0x102522, 1, 0x24443e, 0.45);

    this.player = this.add.rectangle(480, 285, 42, 42, 0xf2bd5a);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
  }

  // update 会在每一帧执行，适合持续读取输入和更新游戏状态。
  update() {
    const speed = 230;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = 1;

    const direction = new Phaser.Math.Vector2(velocityX, velocityY)
      .normalize()
      .scale(speed);

    this.player.body.setVelocity(direction.x, direction.y);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 960,
  height: 540,
  backgroundColor: "#102522",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: LearningScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
