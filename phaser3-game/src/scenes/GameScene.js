import Phaser from "phaser";
import {
  COLORS,
  DATA_GOAL,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_SECONDS,
  GAME_WIDTH,
} from "../game/constants.js";
import {
  getDashCooldownSeconds,
  getEnemySpeed,
  getPickupScore,
  getWinBonus,
} from "../game/rules.js";
import {
  createBackdrop,
  formatTime,
  pulseText,
  randomEdgePoint,
} from "../game/ui.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
    createBackdrop(this);
    this.physics.world.setBounds(24, 82, GAME_WIDTH - 48, GAME_HEIGHT - 106);

    this.score = 0;
    this.health = 3;
    this.collected = 0;
    this.remaining = GAME_SECONDS;
    this.isFinished = false;
    this.isPaused = false;
    this.portalOpened = false;
    this.invulnerableUntil = 0;
    this.dashReadyAt = 0;
    this.dashEndsAt = 0;
    this.lastDirection = new Phaser.Math.Vector2(0, -1);

    this.createPlayer();
    this.createGroups();
    this.createPortal();
    this.createHud();
    this.createControls();
    this.createPauseOverlay();
    this.createCollisions();
    this.createTimers();

    for (let index = 0; index < 4; index += 1) this.spawnShard();
    this.spawnEnemy();
    this.updateHud(this.time.now);
  }

  createPlayer() {
    this.player = this.physics.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, "player-core")
      .setDepth(10)
      .setCollideWorldBounds(true);
    this.player.body.setCircle(18, 6, 6);
  }

  createGroups() {
    this.shards = this.physics.add.group();
    this.enemies = this.physics.add.group();
  }

  createPortal() {
    this.portal = this.physics.add
      .image(852, 440, "portal")
      .setDepth(5)
      .setVisible(false)
      .setActive(false);
    this.portal.body.setCircle(26, 10, 10);
    this.portal.body.enable = false;
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
      pause: Phaser.Input.Keyboard.KeyCodes.P,
    });
  }

  createCollisions() {
    this.physics.add.overlap(
      this.player,
      this.shards,
      this.collectShard,
      null,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.portal,
      this.enterPortal,
      null,
      this,
    );
  }

  createTimers() {
    this.shardTimer = this.time.addEvent({
      delay: 1450,
      callback: this.spawnShard,
      callbackScope: this,
      loop: true,
    });

    this.enemyTimer = this.time.addEvent({
      delay: 2450,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.clockTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.remaining -= 1;
        this.updateHud(this.time.now);
        if (this.remaining <= 0) {
          this.finishGame(false, "数据通道已关闭");
        }
      },
      loop: true,
    });
  }

  createHud() {
    this.add
      .rectangle(GAME_WIDTH / 2, 38, GAME_WIDTH, 76, 0x071314, 0.94)
      .setDepth(20);
    this.add
      .rectangle(GAME_WIDTH / 2, 76, GAME_WIDTH, 2, 0x345c54, 0.8)
      .setDepth(20);

    this.scoreText = this.add
      .text(28, 18, "SCORE 0000", {
        fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
        fontSize: "14px",
        fontStyle: "bold",
        color: COLORS.gold,
      })
      .setDepth(21);

    this.goalText = this.add
      .text(28, 43, `DATA 0 / ${DATA_GOAL}`, {
        fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
        fontSize: "13px",
        color: COLORS.cyan,
      })
      .setDepth(21);

    this.timeText = this.add
      .text(GAME_WIDTH / 2, 16, formatTime(this.remaining), {
        fontFamily: 'Menlo, Consolas, monospace',
        fontSize: "28px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5, 0)
      .setDepth(21);

    this.healthText = this.add
      .text(930, 18, "CORE  ◆ ◆ ◆", {
        fontFamily: 'Menlo, Consolas, "PingFang SC", monospace',
        fontSize: "14px",
        fontStyle: "bold",
        color: COLORS.red,
      })
      .setOrigin(1, 0)
      .setDepth(21);

    this.statusText = this.add
      .text(930, 44, "SPACE 冲刺就绪", {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: COLORS.muted,
      })
      .setOrigin(1, 0)
      .setDepth(21);

    this.progressGraphics = this.add.graphics().setDepth(21);
  }

  createPauseOverlay() {
    const shade = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x020808,
      0.78,
    );
    const title = this.add
      .text(GAME_WIDTH / 2, 238, "任务已暂停", {
        fontFamily: FONT_FAMILY,
        fontSize: "38px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(GAME_WIDTH / 2, 292, "按 P 继续", {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: COLORS.cyan,
      })
      .setOrigin(0.5);

    this.pauseOverlay = this.add
      .container(0, 0, [shade, title, hint])
      .setDepth(80)
      .setVisible(false);
  }

  update(time) {
    if (this.isFinished) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
    }
    if (this.isPaused) return;

    const direction = this.readDirection();
    if (direction.lengthSq() > 0) {
      direction.normalize();
      this.lastDirection.copy(direction);
      this.player.setRotation(direction.angle() + Math.PI / 2);
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.keys.dash) &&
      time >= this.dashReadyAt
    ) {
      this.dashEndsAt = time + 180;
      this.dashReadyAt = time + 1850;
      this.player.setTint(0xd7fff2);
      this.cameras.main.shake(70, 0.0025);
    }

    const isDashing = time < this.dashEndsAt;
    const movement = direction.lengthSq() > 0 ? direction : this.lastDirection;
    const speed = isDashing ? 525 : 225;

    if (!isDashing && direction.lengthSq() === 0) {
      this.player.body.setVelocity(0, 0);
    } else {
      this.player.body.setVelocity(movement.x * speed, movement.y * speed);
    }

    if (!isDashing && this.player.isTinted) this.player.clearTint();

    this.enemies.children.iterate((enemy) => {
      if (!enemy?.active) return;
      this.physics.moveToObject(
        enemy,
        this.player,
        enemy.getData("speed"),
      );
      enemy.rotation += 0.025;
    });

    this.shards.children.iterate((shard) => {
      if (shard?.active) shard.rotation += 0.02;
    });

    this.updateHud(time);
  }

  readDirection() {
    const direction = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left.isDown || this.keys.left.isDown) direction.x -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown) direction.x += 1;
    if (this.cursors.up.isDown || this.keys.up.isDown) direction.y -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown) direction.y += 1;
    return direction;
  }

  spawnShard() {
    if (this.isFinished || this.shards.countActive(true) >= 5) return;

    let x;
    let y;
    let attempts = 0;
    do {
      x = Phaser.Math.Between(70, 890);
      y = Phaser.Math.Between(112, 490);
      attempts += 1;
    } while (
      Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 130 &&
      attempts < 8
    );

    const shard = this.shards.create(x, y, "data-shard").setDepth(4);
    shard.body.setCircle(10, 5, 5);
    shard.setAngle(Phaser.Math.Between(0, 360));

    this.tweens.add({
      targets: shard,
      scale: { from: 0.4, to: 1 },
      duration: 240,
      ease: "Back.Out",
    });
  }

  spawnEnemy() {
    if (this.isFinished || this.enemies.countActive(true) >= 12) return;
    const point = randomEdgePoint();
    const enemy = this.enemies
      .create(point.x, point.y, "hunter")
      .setDepth(8)
      .setData(
        "speed",
        getEnemySpeed(this.collected, Phaser.Math.Between(0, 18)),
      );
    enemy.body.setCircle(16, 6, 6);
  }

  collectShard(_player, shard) {
    const { x, y } = shard;
    shard.destroy();
    this.collected += 1;
    this.score += getPickupScore(this.remaining);
    pulseText(this, x, y, "+ DATA", COLORS.cyan);
    this.cameras.main.flash(80, 125, 226, 196, false);

    if (this.collected >= DATA_GOAL && !this.portalOpened) {
      this.openPortal();
    }
    this.updateHud(this.time.now);
  }

  hitEnemy(_player, enemy) {
    const now = this.time.now;
    if (now < this.invulnerableUntil) return;

    if (now < this.dashEndsAt) {
      pulseText(this, enemy.x, enemy.y, "+50", COLORS.gold);
      enemy.destroy();
      this.score += 50;
      return;
    }

    const { x, y } = enemy;
    enemy.destroy();
    this.health -= 1;
    this.invulnerableUntil = now + 1200;
    pulseText(this, x, y, "CORE -1", COLORS.red);
    this.cameras.main.shake(180, 0.012);
    this.cameras.main.flash(120, 240, 107, 104, false);

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 110,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.player.setAlpha(1),
    });

    if (this.health <= 0) {
      this.finishGame(false, "核心完整度归零");
    }
    this.updateHud(now);
  }

  openPortal() {
    this.portalOpened = true;
    this.portal.setActive(true).setVisible(true).setScale(0.2);
    this.portal.body.enable = true;
    this.tweens.add({
      targets: this.portal,
      scale: 1,
      duration: 420,
      ease: "Back.Out",
    });
    this.tweens.add({
      targets: this.portal,
      angle: 360,
      duration: 3200,
      repeat: -1,
    });
    pulseText(this, this.portal.x, this.portal.y - 52, "通道已开启", COLORS.cyan);
  }

  enterPortal() {
    if (!this.portalOpened || this.isFinished) return;
    this.score += getWinBonus(this.remaining, this.health);
    this.finishGame(true, "数据核心传输完成");
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);
    this.player.body.setVelocity(0, 0);
    this.shardTimer.paused = this.isPaused;
    this.enemyTimer.paused = this.isPaused;
    this.clockTimer.paused = this.isPaused;

    if (this.isPaused) this.physics.world.pause();
    else this.physics.world.resume();
  }

  updateHud(time) {
    this.scoreText.setText(`SCORE ${String(this.score).padStart(4, "0")}`);
    this.goalText.setText(
      this.portalOpened
        ? "DATA COMPLETE · 前往传送门"
        : `DATA ${this.collected} / ${DATA_GOAL}`,
    );
    this.timeText.setText(formatTime(this.remaining));
    this.timeText.setColor(this.remaining <= 10 ? COLORS.red : COLORS.cream);
    this.healthText.setText(
      `CORE  ${"◆ ".repeat(this.health)}${"◇ ".repeat(3 - this.health)}`.trim(),
    );

    const cooldown = getDashCooldownSeconds(this.dashReadyAt, time);
    this.statusText.setText(
      cooldown === 0
        ? "SPACE 冲刺就绪"
        : `冲刺充能 ${cooldown}s`,
    );
    this.statusText.setColor(cooldown === 0 ? COLORS.cyan : COLORS.muted);

    const ratio = Phaser.Math.Clamp(this.collected / DATA_GOAL, 0, 1);
    this.progressGraphics.clear();
    this.progressGraphics.fillStyle(0x17302d, 1);
    this.progressGraphics.fillRoundedRect(248, 54, 464, 6, 3);
    this.progressGraphics.fillStyle(0x7de2c4, 1);
    this.progressGraphics.fillRoundedRect(248, 54, 464 * ratio, 6, 3);
  }

  finishGame(won, message) {
    if (this.isFinished) return;
    this.isFinished = true;
    this.physics.world.pause();
    this.player.body.setVelocity(0, 0);

    this.time.delayedCall(420, () => {
      this.scene.start("result", {
        won,
        message,
        score: this.score,
        collected: this.collected,
        health: this.health,
        remaining: this.remaining,
      });
    });
  }
}
