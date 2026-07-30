import Phaser from "phaser";

const SIZE = 48;

export class TowerBootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    this.load.image("tower-cover", "/assets/magic-tower-cover.png");
  }

  create() {
    this.createTerrainTextures();
    this.createDoorTextures();
    this.createItemTextures();
    this.createCharacterTextures();
    this.scene.start("menu");
  }

  makeTexture(key, draw) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    draw(graphics);
    graphics.generateTexture(key, SIZE, SIZE);
    graphics.destroy();
  }

  createTerrainTextures() {
    this.makeTexture("floor", (g) => {
      g.fillStyle(0x17212a);
      g.fillRect(0, 0, SIZE, SIZE);
      g.lineStyle(1, 0x263641, 0.8);
      g.strokeRect(1, 1, SIZE - 2, SIZE - 2);
      g.fillStyle(0x1d2a34, 0.8);
      g.fillRect(5, 6, 14, 3);
      g.fillRect(29, 31, 12, 3);
    });

    this.makeTexture("wall", (g) => {
      g.fillStyle(0x27333c);
      g.fillRect(0, 0, SIZE, SIZE);
      g.fillStyle(0x34434e);
      g.fillRect(2, 2, 20, 12);
      g.fillRect(25, 2, 21, 12);
      g.fillRect(2, 17, 12, 12);
      g.fillRect(17, 17, 28, 12);
      g.fillRect(2, 32, 24, 13);
      g.fillRect(29, 32, 16, 13);
      g.lineStyle(2, 0x111a21, 0.8);
      g.strokeRect(1, 1, 46, 46);
    });

    this.makeTexture("stairs-up", (g) => {
      g.fillStyle(0x121a21);
      g.fillRect(0, 0, SIZE, SIZE);
      for (let index = 0; index < 5; index += 1) {
        g.fillStyle(0xc9a45b - index * 0x111111);
        g.fillRect(7 + index * 5, 34 - index * 6, 34 - index * 5, 5);
      }
      g.fillStyle(0xe7c778);
      g.fillTriangle(24, 6, 17, 16, 31, 16);
    });

    this.makeTexture("stairs-down", (g) => {
      g.fillStyle(0x121a21);
      g.fillRect(0, 0, SIZE, SIZE);
      for (let index = 0; index < 5; index += 1) {
        g.fillStyle(0x8b7449 + index * 0x080808);
        g.fillRect(7 + index * 5, 9 + index * 6, 34 - index * 5, 5);
      }
      g.fillStyle(0xe7c778);
      g.fillTriangle(24, 42, 17, 32, 31, 32);
    });
  }

  createDoorTextures() {
    const createDoor = (key, color, highlight) => {
      this.makeTexture(key, (g) => {
        g.fillStyle(0x11171d);
        g.fillRect(5, 3, 38, 44);
        g.fillStyle(color);
        g.fillRect(8, 5, 32, 42);
        g.fillStyle(highlight, 0.7);
        g.fillRect(11, 7, 5, 37);
        g.fillRect(32, 7, 5, 37);
        g.lineStyle(2, 0x101418);
        g.strokeRect(8, 5, 32, 42);
        g.fillStyle(0x16120d);
        g.fillCircle(24, 25, 4);
        g.fillRect(22, 26, 4, 8);
      });
    };

    createDoor("door-yellow", 0xa87824, 0xe4bc58);
    createDoor("door-blue", 0x28618e, 0x61b7e8);
    createDoor("door-red", 0x84343a, 0xdc6a68);
  }

  createItemTextures() {
    const createKey = (key, color) => {
      this.makeTexture(key, (g) => {
        g.lineStyle(6, color);
        g.strokeCircle(17, 17, 8);
        g.fillStyle(color);
        g.fillRect(22, 15, 18, 6);
        g.fillRect(34, 20, 5, 7);
        g.fillRect(28, 20, 5, 5);
      });
    };
    createKey("key-yellow", 0xf0c75c);
    createKey("key-blue", 0x66baf0);
    createKey("key-red", 0xea716c);

    const createPotion = (key, color) => {
      this.makeTexture(key, (g) => {
        g.fillStyle(0xc8d2d0);
        g.fillRect(19, 6, 10, 8);
        g.fillStyle(0x66727a);
        g.fillRect(17, 12, 14, 5);
        g.fillStyle(color, 0.9);
        g.fillRoundedRect(11, 16, 26, 27, 7);
        g.fillStyle(0xffffff, 0.35);
        g.fillRect(16, 20, 4, 15);
      });
    };
    createPotion("potion-red", 0xd84f50);
    createPotion("potion-blue", 0x4c9bd8);

    const createGem = (key, color) => {
      this.makeTexture(key, (g) => {
        g.fillStyle(color, 0.35);
        g.fillCircle(24, 24, 19);
        g.fillStyle(color);
        g.fillTriangle(24, 5, 42, 21, 24, 44);
        g.fillTriangle(24, 5, 24, 44, 6, 21);
        g.fillStyle(0xffffff, 0.45);
        g.fillTriangle(24, 9, 31, 21, 24, 32);
      });
    };
    createGem("gem-atk", 0xd95c56);
    createGem("gem-def", 0x58a8df);

    this.makeTexture("merchant", (g) => {
      g.fillStyle(0x342539);
      g.fillTriangle(24, 3, 43, 43, 5, 43);
      g.fillStyle(0xd5b07a);
      g.fillCircle(24, 19, 8);
      g.fillStyle(0x171319);
      g.fillRect(16, 9, 16, 6);
      g.fillStyle(0xe7b85d);
      g.fillCircle(18, 19, 2);
      g.fillCircle(30, 19, 2);
    });
  }

  createCharacterTextures() {
    this.makeTexture("hero", (g) => {
      g.fillStyle(0xd4d9d8);
      g.fillCircle(24, 14, 10);
      g.fillStyle(0x394b5a);
      g.fillRect(16, 8, 16, 8);
      g.fillStyle(0x9e3139);
      g.fillTriangle(14, 23, 34, 23, 38, 45);
      g.fillStyle(0xbfc8c8);
      g.fillRect(18, 22, 12, 16);
      g.fillStyle(0xe7b85d);
      g.fillRect(29, 24, 4, 18);
      g.fillStyle(0x61513c);
      g.fillRect(13, 40, 9, 6);
      g.fillRect(27, 40, 9, 6);
    });

    this.makeTexture("enemy-slime", (g) => {
      g.fillStyle(0x4c9b6a);
      g.fillRoundedRect(7, 14, 34, 29, 13);
      g.fillStyle(0x93d69a);
      g.fillCircle(17, 25, 4);
      g.fillCircle(31, 25, 4);
      g.fillStyle(0x17241b);
      g.fillCircle(17, 25, 2);
      g.fillCircle(31, 25, 2);
    });

    this.makeTexture("enemy-bat", (g) => {
      g.fillStyle(0x6c4a83);
      g.fillTriangle(23, 19, 2, 8, 8, 36);
      g.fillTriangle(25, 19, 46, 8, 40, 36);
      g.fillStyle(0x9c6db1);
      g.fillCircle(24, 25, 10);
      g.fillStyle(0xe36b68);
      g.fillCircle(20, 23, 2);
      g.fillCircle(28, 23, 2);
    });

    this.makeTexture("enemy-skeleton", (g) => {
      g.fillStyle(0xd9d2b9);
      g.fillCircle(24, 15, 11);
      g.fillStyle(0x20242a);
      g.fillCircle(19, 14, 3);
      g.fillCircle(29, 14, 3);
      g.fillRect(21, 21, 6, 4);
      g.fillStyle(0xc8c0a8);
      g.fillRect(20, 25, 8, 19);
      g.fillRect(10, 28, 28, 5);
    });

    this.makeTexture("enemy-knight", (g) => {
      g.fillStyle(0x3c4651);
      g.fillRoundedRect(12, 5, 24, 38, 7);
      g.fillStyle(0x707d86);
      g.fillRect(15, 9, 18, 12);
      g.fillStyle(0xd45652);
      g.fillRect(17, 14, 14, 3);
      g.fillStyle(0x1b2228);
      g.fillTriangle(10, 23, 38, 23, 24, 45);
    });

    this.makeTexture("enemy-mage", (g) => {
      g.fillStyle(0x4d3568);
      g.fillTriangle(24, 3, 42, 42, 6, 42);
      g.fillStyle(0xd2a975);
      g.fillCircle(24, 21, 8);
      g.fillStyle(0x61d7cf);
      g.fillCircle(24, 21, 4);
      g.lineStyle(3, 0xe2b65a);
      g.lineBetween(37, 9, 37, 43);
    });

    this.makeTexture("enemy-boss", (g) => {
      g.fillStyle(0x5e2630);
      g.fillRoundedRect(8, 9, 32, 36, 6);
      g.fillStyle(0xb54748);
      g.fillTriangle(9, 12, 3, 2, 19, 10);
      g.fillTriangle(39, 12, 45, 2, 29, 10);
      g.fillStyle(0xd8b25b);
      g.fillRect(13, 13, 22, 14);
      g.fillStyle(0x251317);
      g.fillCircle(18, 19, 3);
      g.fillCircle(30, 19, 3);
      g.fillStyle(0xd8b25b);
      g.fillTriangle(9, 42, 24, 28, 39, 42);
    });
  }
}
