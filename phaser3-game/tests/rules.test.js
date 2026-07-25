import test from "node:test";
import assert from "node:assert/strict";
import {
  getDashCooldownSeconds,
  getEnemySpeed,
  getPickupScore,
  getWinBonus,
} from "../src/game/rules.js";

test("收集数据的基础分和剩余时间奖励计算正确", () => {
  assert.equal(getPickupScore(55), 210);
  assert.equal(getPickupScore(0), 100);
  assert.equal(getPickupScore(-3), 100);
});

test("胜利奖励包含时间和剩余生命值", () => {
  assert.equal(getWinBonus(20, 3), 1100);
  assert.equal(getWinBonus(-1, -1), 0);
});

test("收集数据越多，敌人的基础追踪速度越快", () => {
  assert.equal(getEnemySpeed(0, 0), 92);
  assert.equal(getEnemySpeed(8, 18), 166);
});

test("冲刺冷却时间以十分之一秒向上取整", () => {
  assert.equal(getDashCooldownSeconds(1850, 0), 1.9);
  assert.equal(getDashCooldownSeconds(1850, 851), 1);
  assert.equal(getDashCooldownSeconds(1850, 1900), 0);
});
