import Phaser from "phaser";
import {
  BOARD_X,
  BOARD_Y,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  INITIAL_HERO,
  MAP_COLS,
  MAP_ROWS,
  PANEL_X,
  SAVE_KEY,
  SYMBOL_INFO,
  TILE_SIZE,
} from "../tower/constants.js";
import { ENEMIES, isEnemy } from "../tower/enemies.js";
import {
  FLOOR_DEFINITIONS,
  createFloorMaps,
  findSymbol,
} from "../tower/maps.js";
import {
  applyItem,
  buyShopUpgrade,
  calculateBattle,
  getShopOffer,
} from "../tower/rules.js";
import { createSmallButton } from "../tower/ui.js";

const SYMBOL_TEXTURES = {
  Y: "door-yellow",
  B: "door-blue",
  R: "door-red",
  y: "key-yellow",
  b: "key-blue",
  r: "key-red",
  p: "potion-red",
  P: "potion-blue",
  a: "gem-atk",
  d: "gem-def",
  s: "merchant",
  U: "stairs-up",
  D: "stairs-down",
};

export class TowerGameScene extends Phaser.Scene {
  constructor() {
    super("tower");
  }

  init(data) {
    this.shouldLoad = Boolean(data.load);
  }

  create() {
    this.busy = false;
    this.overlayOpen = false;
    this.shopOpen = false;
    this.objectSprites = new Map();

    this.createShell();
    this.restoreOrCreateState();
    this.createHud();
    this.renderFloor();
    this.createHero();
    this.createControls();
    this.updatePanel();
    this.showMessage("找到通往第三层的领主，并活着击败它。", COLORS.cyan);
  }

  createShell() {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      COLORS.background,
    );

    this.add
      .rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 60, 0x0c141c, 1)
      .setStrokeStyle(1, 0x2a3944);
    this.add
      .rectangle(
        PANEL_X + 176,
        BOARD_Y + (MAP_ROWS * TILE_SIZE) / 2,
        352,
        MAP_ROWS * TILE_SIZE,
        COLORS.panel,
        0.98,
      )
      .setStrokeStyle(1, 0x344550);
    this.add
      .rectangle(
        BOARD_X + (MAP_COLS * TILE_SIZE) / 2,
        BOARD_Y + (MAP_ROWS * TILE_SIZE) / 2,
        MAP_COLS * TILE_SIZE + 6,
        MAP_ROWS * TILE_SIZE + 6,
        0x060a0e,
        1,
      )
      .setStrokeStyle(2, 0x80683e);

    this.add.text(744, 17, "H 图鉴   Q 存档   L 读档", {
      fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
      fontSize: "12px",
      color: COLORS.muted,
    });
  }

  restoreOrCreateState() {
    const save = this.shouldLoad ? this.readSave() : null;
    if (save) {
      this.hero = save.hero;
      this.maps = save.maps;
      this.floorIndex = save.floorIndex;
      this.playerPos = save.playerPos;
      return;
    }

    this.hero = {
      ...INITIAL_HERO,
      keys: { ...INITIAL_HERO.keys },
    };
    this.maps = createFloorMaps();
    this.floorIndex = 0;
    this.playerPos = findSymbol(this.maps[0], "@");
    this.maps[0][this.playerPos.y][this.playerPos.x] = ".";
  }

  createHud() {
    this.floorTitle = this.add.text(28, 14, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "24px",
      fontStyle: "bold",
      color: COLORS.cream,
    });

    this.add.text(PANEL_X + 24, 98, "勇者状态", {
      fontFamily: FONT_FAMILY,
      fontSize: "13px",
      fontStyle: "bold",
      color: COLORS.gold,
      letterSpacing: 2,
    });

    this.statText = this.add.text(PANEL_X + 24, 132, "", {
      fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
      fontSize: "18px",
      lineSpacing: 13,
      color: COLORS.cream,
    });

    this.keyText = this.add.text(PANEL_X + 24, 274, "", {
      fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
      fontSize: "15px",
      lineSpacing: 9,
      color: COLORS.cream,
    });

    this.add
      .rectangle(PANEL_X + 176, 387, 304, 92, 0x0a1016, 0.9)
      .setStrokeStyle(1, 0x2e404b);
    this.messageText = this.add.text(PANEL_X + 36, 355, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      lineSpacing: 7,
      color: COLORS.muted,
      wordWrap: { width: 280 },
    });

    createSmallButton(this, PANEL_X + 64, 465, "图鉴 H", () =>
      this.toggleHandbook(),
    );
    createSmallButton(this, PANEL_X + 176, 465, "存档 Q", () =>
      this.saveGame(),
    );
    createSmallButton(this, PANEL_X + 288, 465, "读档 L", () =>
      this.loadGame(),
    );

    this.add.text(
      PANEL_X + 24,
      505,
      "方向键 / WASD  每次移动一格\n门会消耗同色钥匙\n战斗前可在图鉴查看预计损伤",
      {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        lineSpacing: 8,
        color: "#71828b",
      },
    );
  }

  createHero() {
    this.heroSprite = this.add
      .image(this.tileX(this.playerPos.x), this.tileY(this.playerPos.y), "hero")
      .setDepth(30);
    this.tweens.add({
      targets: this.heroSprite,
      scaleY: 0.96,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  createControls() {
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]);
    this.input.keyboard.on("keydown", this.handleKeyDown, this);
    this.events.once("shutdown", () => {
      this.input.keyboard.off("keydown", this.handleKeyDown, this);
    });
  }

  handleKeyDown(event) {
    if (event.code === "KeyH") {
      this.toggleHandbook();
      return;
    }
    if (event.code === "Escape") {
      if (this.overlayOpen) this.closeHandbook();
      if (this.shopOpen) this.closeShop();
      return;
    }
    if (this.overlayOpen) return;

    if (this.shopOpen) {
      if (event.code === "Digit1") this.buyUpgrade("hp");
      if (event.code === "Digit2") this.buyUpgrade("atk");
      if (event.code === "Digit3") this.buyUpgrade("def");
      return;
    }

    if (event.code === "KeyQ") {
      this.saveGame();
      return;
    }
    if (event.code === "KeyL") {
      this.loadGame();
      return;
    }
    if (this.busy) return;

    const moves = {
      ArrowUp: [0, -1],
      KeyW: [0, -1],
      ArrowDown: [0, 1],
      KeyS: [0, 1],
      ArrowLeft: [-1, 0],
      KeyA: [-1, 0],
      ArrowRight: [1, 0],
      KeyD: [1, 0],
    };
    const move = moves[event.code];
    if (move) this.attemptMove(move[0], move[1]);
  }

  renderFloor() {
    if (this.mapLayer) this.mapLayer.destroy(true);
    this.mapLayer = this.add.container(0, 0).setDepth(10);
    this.objectSprites.clear();
    const map = this.maps[this.floorIndex];

    for (let y = 0; y < MAP_ROWS; y += 1) {
      for (let x = 0; x < MAP_COLS; x += 1) {
        const symbol = map[y][x];
        const worldX = this.tileX(x);
        const worldY = this.tileY(y);

        if (symbol === "#") {
          this.mapLayer.add(this.add.image(worldX, worldY, "wall"));
          continue;
        }

        this.mapLayer.add(this.add.image(worldX, worldY, "floor"));
        const texture = isEnemy(symbol)
          ? ENEMIES[symbol].texture
          : SYMBOL_TEXTURES[symbol];
        if (!texture) continue;

        const sprite = this.add.image(worldX, worldY, texture);
        this.mapLayer.add(sprite);
        this.objectSprites.set(this.positionKey(x, y), sprite);

        if (isEnemy(symbol) || ["y", "b", "r", "a", "d"].includes(symbol)) {
          this.tweens.add({
            targets: sprite,
            y: worldY - 3,
            duration: 650 + (x + y) * 12,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });
        }
      }
    }

    this.floorTitle.setText(
      `${this.floorIndex + 1}F  ·  ${FLOOR_DEFINITIONS[this.floorIndex].name}`,
    );
  }

  attemptMove(dx, dy) {
    const targetX = this.playerPos.x + dx;
    const targetY = this.playerPos.y + dy;
    if (
      targetX < 0 ||
      targetX >= MAP_COLS ||
      targetY < 0 ||
      targetY >= MAP_ROWS
    ) {
      return;
    }

    const symbol = this.maps[this.floorIndex][targetY][targetX];
    if (symbol === "#") {
      this.bumpHero(dx, dy);
      return;
    }
    if (["Y", "B", "R"].includes(symbol)) {
      this.openDoor(targetX, targetY, symbol);
      return;
    }
    if (isEnemy(symbol)) {
      this.fightEnemy(targetX, targetY, symbol);
      return;
    }
    if (["y", "b", "r", "p", "P", "a", "d"].includes(symbol)) {
      this.collectItem(targetX, targetY, symbol);
      return;
    }
    if (symbol === "s") {
      this.openShop();
      return;
    }

    const stairs = SYMBOL_INFO[symbol];
    this.moveHeroTo(targetX, targetY, () => {
      if (stairs?.type === "stairs") this.changeFloor(stairs.direction);
    });
  }

  openDoor(x, y, symbol) {
    const info = SYMBOL_INFO[symbol];
    if (this.hero.keys[info.key] <= 0) {
      this.showMessage(`缺少${info.name}对应的钥匙。`, COLORS.red);
      this.bumpHero(x - this.playerPos.x, y - this.playerPos.y);
      return;
    }

    this.hero.keys[info.key] -= 1;
    const sprite = this.getObjectSprite(x, y);
    this.busy = true;
    this.tweens.add({
      targets: sprite,
      scaleY: 0,
      alpha: 0.2,
      duration: 160,
      onComplete: () => {
        this.removeMapObject(x, y);
        this.showMessage(`${info.name}已开启。`, COLORS.gold);
        this.updatePanel();
        this.moveHeroTo(x, y);
      },
    });
  }

  collectItem(x, y, symbol) {
    const sprite = this.getObjectSprite(x, y);
    const result = applyItem(this.hero, symbol);
    this.hero = result.hero;
    this.maps[this.floorIndex][y][x] = ".";
    this.objectSprites.delete(this.positionKey(x, y));
    this.busy = true;

    this.tweens.add({
      targets: sprite,
      x: this.heroSprite.x,
      y: this.heroSprite.y,
      scale: 0.2,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        sprite.destroy();
        this.showMessage(result.message, COLORS.cyan);
        this.showFloatingText(result.message);
        this.updatePanel();
        this.moveHeroTo(x, y);
      },
    });
  }

  fightEnemy(x, y, symbol) {
    const enemy = ENEMIES[symbol];
    const forecast = calculateBattle(this.hero, enemy);
    if (!forecast.canWin) {
      const damage = Number.isFinite(forecast.damage) ? forecast.damage : "∞";
      this.showMessage(
        `${enemy.name}预计造成 ${damage} 伤害，现在还无法战胜。`,
        COLORS.red,
      );
      this.bumpHero(x - this.playerPos.x, y - this.playerPos.y);
      return;
    }

    const sprite = this.getObjectSprite(x, y);
    this.busy = true;
    this.showMessage(
      `${enemy.name} · ${forecast.rounds} 回合 · 损失 ${forecast.damage} HP`,
      COLORS.gold,
    );
    this.cameras.main.shake(120, 0.006);
    sprite.setTint(0xffffff);

    this.tweens.add({
      targets: [sprite, this.heroSprite],
      alpha: 0.35,
      duration: 70,
      yoyo: true,
      repeat: 2,
    });

    this.time.delayedCall(260, () => {
      this.hero.hp -= forecast.damage;
      this.hero.gold += enemy.gold;
      this.removeMapObject(x, y);
      this.showFloatingText(`-${forecast.damage} HP`, COLORS.red);
      this.updatePanel();

      if (enemy.boss) {
        this.playerPos = { x, y };
        this.heroSprite.setPosition(this.tileX(x), this.tileY(y));
        this.time.delayedCall(360, () => {
          this.scene.start("result", { hero: this.hero });
        });
        return;
      }

      this.moveHeroTo(x, y);
    });
  }

  moveHeroTo(x, y, onComplete) {
    this.busy = true;
    this.playerPos = { x, y };
    this.tweens.add({
      targets: this.heroSprite,
      x: this.tileX(x),
      y: this.tileY(y),
      duration: 105,
      ease: "Quad.Out",
      onComplete: () => {
        this.busy = false;
        onComplete?.();
      },
    });
  }

  changeFloor(direction) {
    const nextFloor = this.floorIndex + direction;
    if (nextFloor < 0 || nextFloor >= this.maps.length) return;

    this.floorIndex = nextFloor;
    const arrivalSymbol = direction > 0 ? "D" : "U";
    this.playerPos = findSymbol(this.maps[this.floorIndex], arrivalSymbol);
    this.cameras.main.flash(180, 231, 184, 93, false);
    this.renderFloor();
    this.heroSprite.setPosition(
      this.tileX(this.playerPos.x),
      this.tileY(this.playerPos.y),
    );
    this.updatePanel();
    this.showMessage(
      `抵达 ${this.floorIndex + 1}F · ${FLOOR_DEFINITIONS[this.floorIndex].name}`,
      COLORS.gold,
    );
    this.saveGame(false);
  }

  openShop() {
    if (this.shopOpen || this.overlayOpen) return;
    this.shopOpen = true;
    const offer = getShopOffer(this.hero.shopLevel);
    const elements = [];
    this.shopFeedback = this.add
      .text(480, 382, "", {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        fontStyle: "bold",
        color: COLORS.cyan,
      })
      .setOrigin(0.5);
    elements.push(
      this.add.rectangle(480, 320, 720, 430, 0x080e14, 0.97).setStrokeStyle(
        2,
        0xe7b85d,
      ),
      this.add
        .text(480, 142, "神秘商人的交易", {
          fontFamily: FONT_FAMILY,
          fontSize: "30px",
          fontStyle: "bold",
          color: COLORS.cream,
        })
        .setOrigin(0.5),
      this.add
        .text(480, 190, `本次强化需要 ${offer.price} 金币`, {
          fontFamily: FONT_FAMILY,
          fontSize: "16px",
          color: COLORS.gold,
        })
        .setOrigin(0.5),
      this.add
        .text(
          480,
          238,
          `1  生命 +${offer.hp}      2  攻击 +${offer.atk}      3  防御 +${offer.def}`,
          {
            fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
            fontSize: "17px",
            color: COLORS.cream,
          },
        )
        .setOrigin(0.5),
      this.add
        .text(480, 424, "按 1 / 2 / 3 购买 · ESC 离开", {
          fontFamily: FONT_FAMILY,
          fontSize: "14px",
          color: COLORS.muted,
        })
        .setOrigin(0.5),
      this.shopFeedback,
    );

    const hpButton = createSmallButton(this, 330, 330, `生命 +${offer.hp}`, () =>
      this.buyUpgrade("hp"),
    );
    const atkButton = createSmallButton(this, 480, 330, `攻击 +${offer.atk}`, () =>
      this.buyUpgrade("atk"),
    );
    const defButton = createSmallButton(this, 630, 330, `防御 +${offer.def}`, () =>
      this.buyUpgrade("def"),
    );
    elements.push(hpButton, atkButton, defButton);
    this.shopOverlay = this.add.container(0, 0, elements).setDepth(100);
  }

  buyUpgrade(choice) {
    const result = buyShopUpgrade(this.hero, choice);
    this.hero = result.hero;
    this.showMessage(result.message, result.success ? COLORS.cyan : COLORS.red);
    this.updatePanel();
    if (result.success) {
      this.closeShop();
      this.openShop();
      this.shopFeedback.setText(result.message).setColor(COLORS.cyan);
    } else {
      this.shopFeedback?.setText(result.message).setColor(COLORS.red);
    }
  }

  closeShop() {
    this.shopOverlay?.destroy(true);
    this.shopOverlay = null;
    this.shopFeedback = null;
    this.shopOpen = false;
  }

  toggleHandbook() {
    if (this.shopOpen) return;
    if (this.overlayOpen) this.closeHandbook();
    else this.openHandbook();
  }

  openHandbook() {
    this.overlayOpen = true;
    const elements = [
      this.add.rectangle(480, 320, 880, 570, 0x070d13, 0.98).setStrokeStyle(
        2,
        0x67d7d0,
      ),
      this.add
        .text(82, 61, "怪物图鉴 · 当前属性下的预计损伤", {
          fontFamily: FONT_FAMILY,
          fontSize: "24px",
          fontStyle: "bold",
          color: COLORS.cream,
        }),
      this.add
        .text(854, 69, "H / ESC 关闭", {
          fontFamily: FONT_FAMILY,
          fontSize: "12px",
          color: COLORS.muted,
        })
        .setOrigin(1, 0),
    ];

    Object.values(ENEMIES).forEach((enemy, index) => {
      const y = 132 + index * 72;
      const forecast = calculateBattle(this.hero, enemy);
      const damage = Number.isFinite(forecast.damage) ? forecast.damage : "∞";
      elements.push(
        this.add.image(112, y, enemy.texture).setScale(0.9),
        this.add.text(154, y - 23, enemy.name, {
          fontFamily: FONT_FAMILY,
          fontSize: "17px",
          fontStyle: "bold",
          color: enemy.boss ? COLORS.gold : COLORS.cream,
        }),
        this.add.text(
          154,
          y + 5,
          `HP ${enemy.hp}  ATK ${enemy.atk}  DEF ${enemy.def}  GOLD ${enemy.gold}`,
          {
            fontFamily: "Menlo, Consolas, monospace",
            fontSize: "13px",
            color: COLORS.muted,
          },
        ),
        this.add
          .text(830, y - 8, forecast.canWin ? `损伤 ${damage}` : "无法战胜", {
            fontFamily: FONT_FAMILY,
            fontSize: "16px",
            fontStyle: "bold",
            color: forecast.canWin ? COLORS.cyan : COLORS.red,
          })
          .setOrigin(1, 0),
      );
    });

    this.handbookOverlay = this.add.container(0, 0, elements).setDepth(110);
  }

  closeHandbook() {
    this.handbookOverlay?.destroy(true);
    this.handbookOverlay = null;
    this.overlayOpen = false;
  }

  updatePanel() {
    this.statText.setText(
      `HP     ${this.hero.hp}\nATK    ${this.hero.atk}\nDEF    ${this.hero.def}\nGOLD   ${this.hero.gold}`,
    );
    this.keyText.setText(
      `黄钥匙  ${this.hero.keys.yellow}\n蓝钥匙  ${this.hero.keys.blue}\n红钥匙  ${this.hero.keys.red}`,
    );
  }

  saveGame(showNotice = true) {
    try {
      const save = {
        version: 1,
        hero: this.hero,
        maps: this.maps,
        floorIndex: this.floorIndex,
        playerPos: this.playerPos,
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      if (showNotice) this.showMessage("进度已保存。", COLORS.cyan);
    } catch {
      if (showNotice) this.showMessage("当前浏览器无法保存进度。", COLORS.red);
    }
  }

  readSave() {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const save = JSON.parse(raw);
      if (save.version !== 1 || !Array.isArray(save.maps)) return null;
      return save;
    } catch {
      return null;
    }
  }

  loadGame() {
    const save = this.readSave();
    if (!save) {
      this.showMessage("还没有可读取的存档。", COLORS.red);
      return;
    }

    this.closeHandbook();
    this.closeShop();
    this.hero = save.hero;
    this.maps = save.maps;
    this.floorIndex = save.floorIndex;
    this.playerPos = save.playerPos;
    this.busy = false;
    this.renderFloor();
    this.heroSprite.setPosition(
      this.tileX(this.playerPos.x),
      this.tileY(this.playerPos.y),
    );
    this.updatePanel();
    this.showMessage("存档已读取。", COLORS.cyan);
  }

  showMessage(message, color = COLORS.muted) {
    this.messageText.setText(message).setColor(color).setAlpha(1);
  }

  showFloatingText(message, color = COLORS.cyan) {
    const text = this.add
      .text(this.heroSprite.x, this.heroSprite.y - 30, message, {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        fontStyle: "bold",
        color,
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.tweens.add({
      targets: text,
      y: text.y - 28,
      alpha: 0,
      duration: 720,
      onComplete: () => text.destroy(),
    });
  }

  bumpHero(dx, dy) {
    if (this.busy) return;
    this.busy = true;
    this.tweens.add({
      targets: this.heroSprite,
      x: this.heroSprite.x + dx * 7,
      y: this.heroSprite.y + dy * 7,
      duration: 55,
      yoyo: true,
      onComplete: () => {
        this.busy = false;
      },
    });
  }

  removeMapObject(x, y) {
    this.maps[this.floorIndex][y][x] = ".";
    const key = this.positionKey(x, y);
    this.objectSprites.get(key)?.destroy();
    this.objectSprites.delete(key);
  }

  getObjectSprite(x, y) {
    return this.objectSprites.get(this.positionKey(x, y));
  }

  positionKey(x, y) {
    return `${x},${y}`;
  }

  tileX(x) {
    return BOARD_X + x * TILE_SIZE + TILE_SIZE / 2;
  }

  tileY(y) {
    return BOARD_Y + y * TILE_SIZE + TILE_SIZE / 2;
  }
}
