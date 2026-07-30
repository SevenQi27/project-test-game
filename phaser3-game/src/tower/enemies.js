export const ENEMIES = {
  m: {
    id: "slime",
    name: "青苔史莱姆",
    hp: 45,
    atk: 18,
    def: 2,
    gold: 5,
    texture: "enemy-slime",
  },
  g: {
    id: "bat",
    name: "洞穴蝙蝠",
    hp: 70,
    atk: 24,
    def: 5,
    gold: 8,
    texture: "enemy-bat",
  },
  k: {
    id: "skeleton",
    name: "骸骨守卫",
    hp: 110,
    atk: 32,
    def: 8,
    gold: 12,
    texture: "enemy-skeleton",
  },
  K: {
    id: "knight",
    name: "黑铁骑士",
    hp: 160,
    atk: 42,
    def: 12,
    gold: 20,
    texture: "enemy-knight",
  },
  M: {
    id: "mage",
    name: "深塔法师",
    hp: 130,
    atk: 48,
    def: 10,
    gold: 25,
    texture: "enemy-mage",
  },
  X: {
    id: "boss",
    name: "高塔领主",
    hp: 300,
    atk: 58,
    def: 18,
    gold: 100,
    texture: "enemy-boss",
    boss: true,
  },
};

export function isEnemy(symbol) {
  return Object.hasOwn(ENEMIES, symbol);
}
