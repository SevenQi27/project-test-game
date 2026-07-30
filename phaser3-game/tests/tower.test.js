import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_HERO,
  MAP_COLS,
  MAP_ROWS,
  SYMBOL_INFO,
} from "../src/tower/constants.js";
import { ENEMIES, isEnemy } from "../src/tower/enemies.js";
import {
  FLOOR_DEFINITIONS,
  createFloorMaps,
  findSymbol,
} from "../src/tower/maps.js";
import {
  applyItem,
  buyShopUpgrade,
  calculateBattle,
  getShopOffer,
} from "../src/tower/rules.js";

test("三层地图全部保持 11 x 11，并包含正确的楼梯和最终领主", () => {
  assert.equal(FLOOR_DEFINITIONS.length, 3);
  for (const floor of FLOOR_DEFINITIONS) {
    assert.equal(floor.map.length, MAP_ROWS);
    for (const row of floor.map) assert.equal(row.length, MAP_COLS);
  }
  assert.equal(FLOOR_DEFINITIONS[0].map.join("").match(/@/g)?.length, 1);
  assert.equal(FLOOR_DEFINITIONS[0].map.join("").match(/U/g)?.length, 1);
  assert.equal(FLOOR_DEFINITIONS[1].map.join("").match(/[UD]/g)?.length, 2);
  assert.equal(FLOOR_DEFINITIONS[2].map.join("").match(/X/g)?.length, 1);
  assert.equal(FLOOR_DEFINITIONS[0].map[4][1], "Y");
  assert.equal(FLOOR_DEFINITIONS[1].map[8][3], "Y");
  assert.equal(FLOOR_DEFINITIONS[1].map[9][1], "D");
  assert.equal(FLOOR_DEFINITIONS[2].map[8][3], ".");
});

test("钥匙数量足以开启设计中的同色门", () => {
  const tower = FLOOR_DEFINITIONS.map((floor) => floor.map.join("")).join("");
  assert.ok((tower.match(/y/g) || []).length >= (tower.match(/Y/g) || []).length);
  assert.ok((tower.match(/b/g) || []).length >= (tower.match(/B/g) || []).length);
  assert.ok((tower.match(/r/g) || []).length >= (tower.match(/R/g) || []).length);
});

test("战斗公式会计算回合、损伤并阻止无法获胜的战斗", () => {
  const slime = calculateBattle(INITIAL_HERO, ENEMIES.m);
  assert.deepEqual(slime, { canWin: true, damage: 20, rounds: 3 });

  const weakHero = { ...INITIAL_HERO, atk: 5, hp: 10 };
  const boss = calculateBattle(weakHero, ENEMIES.X);
  assert.equal(boss.canWin, false);
  assert.equal(boss.damage, Infinity);
});

test("药水、宝石和钥匙会更新独立的英雄状态", () => {
  const potion = applyItem(INITIAL_HERO, "p").hero;
  const attack = applyItem(potion, "a").hero;
  const key = applyItem(attack, "y").hero;
  assert.equal(key.hp, 1200);
  assert.equal(key.atk, 22);
  assert.equal(key.keys.yellow, 1);
  assert.equal(INITIAL_HERO.keys.yellow, 0);
});

test("商店价格递增且金币不足时不会改变属性", () => {
  assert.deepEqual(getShopOffer(0), { price: 20, hp: 300, atk: 3, def: 3 });
  const failed = buyShopUpgrade(INITIAL_HERO, "atk");
  assert.equal(failed.success, false);

  const richHero = { ...INITIAL_HERO, gold: 30 };
  const bought = buyShopUpgrade(richHero, "def");
  assert.equal(bought.success, true);
  assert.equal(bought.hero.def, 11);
  assert.equal(bought.hero.gold, 10);
  assert.equal(bought.hero.shopLevel, 1);
});

test("一条完整路线可以从第一层走到第三层并击败领主", () => {
  const maps = createFloorMaps();
  let floorIndex = 0;
  let position = findSymbol(maps[0], "@");
  let hero = { ...INITIAL_HERO, keys: { ...INITIAL_HERO.keys } };
  let bossDefeated = false;
  maps[0][position.y][position.x] = ".";

  const routes = [
    "U".repeat(2) +
      "D".repeat(2) +
      "R".repeat(8) +
      "U".repeat(8),
    "R".repeat(8) +
      "U".repeat(2) +
      "L" +
      "R" +
      "U".repeat(2) +
      "L".repeat(2) +
      "R".repeat(2) +
      "U".repeat(4) +
      "L".repeat(2) +
      "R".repeat(2) +
      "D".repeat(8) +
      "L".repeat(6) +
      "U".repeat(4) +
      "L".repeat(2) +
      "R".repeat(2) +
      "U".repeat(4) +
      "R".repeat(2) +
      "L".repeat(2) +
      "D".repeat(2) +
      "L".repeat(2) +
      "U".repeat(2),
    "U".repeat(2) +
      "R".repeat(2) +
      "U".repeat(2) +
      "L".repeat(2) +
      "R".repeat(2) +
      "D".repeat(4) +
      "R".repeat(6) +
      "U".repeat(8),
  ];

  const vectors = {
    U: [0, -1],
    D: [0, 1],
    L: [-1, 0],
    R: [1, 0],
  };

  for (const route of routes) {
    for (const step of route) {
      const [dx, dy] = vectors[step];
      const x = position.x + dx;
      const y = position.y + dy;
      const symbol = maps[floorIndex][y][x];
      assert.notEqual(symbol, "#", `路线撞墙：${floorIndex + 1}F (${x},${y})`);

      if (["Y", "B", "R"].includes(symbol)) {
        const key = SYMBOL_INFO[symbol].key;
        assert.ok(hero.keys[key] > 0, `缺少 ${key} 钥匙`);
        hero.keys[key] -= 1;
        maps[floorIndex][y][x] = ".";
      } else if (isEnemy(symbol)) {
        const enemy = ENEMIES[symbol];
        const battle = calculateBattle(hero, enemy);
        assert.equal(battle.canWin, true, `无法击败 ${enemy.name}`);
        hero.hp -= battle.damage;
        hero.gold += enemy.gold;
        maps[floorIndex][y][x] = ".";
        if (enemy.boss) bossDefeated = true;
      } else if (["y", "b", "r", "p", "P", "a", "d"].includes(symbol)) {
        hero = applyItem(hero, symbol).hero;
        maps[floorIndex][y][x] = ".";
      }

      position = { x, y };
      const stairs = SYMBOL_INFO[symbol];
      if (stairs?.type === "stairs") {
        floorIndex += stairs.direction;
        position = findSymbol(
          maps[floorIndex],
          stairs.direction > 0 ? "D" : "U",
        );
      }
    }
  }

  assert.equal(floorIndex, 2);
  assert.equal(bossDefeated, true);
  assert.ok(hero.hp > 0);
});
