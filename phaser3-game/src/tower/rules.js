export function calculateBattle(hero, enemy) {
  const heroDamage = hero.atk - enemy.def;
  if (heroDamage <= 0) {
    return { canWin: false, damage: Infinity, rounds: Infinity };
  }

  const rounds = Math.ceil(enemy.hp / heroDamage);
  const enemyDamage = Math.max(enemy.atk - hero.def, 0);
  const damage = Math.max(rounds - 1, 0) * enemyDamage;

  return {
    canWin: damage < hero.hp,
    damage,
    rounds,
  };
}

export function applyItem(hero, symbol) {
  const next = {
    ...hero,
    keys: { ...hero.keys },
  };

  const effects = {
    y: () => {
      next.keys.yellow += 1;
      return "获得黄钥匙";
    },
    b: () => {
      next.keys.blue += 1;
      return "获得蓝钥匙";
    },
    r: () => {
      next.keys.red += 1;
      return "获得红钥匙";
    },
    p: () => {
      next.hp += 200;
      return "生命 +200";
    },
    P: () => {
      next.hp += 500;
      return "生命 +500";
    },
    a: () => {
      next.atk += 4;
      return "攻击 +4";
    },
    d: () => {
      next.def += 4;
      return "防御 +4";
    },
  };

  const effect = effects[symbol];
  return effect ? { hero: next, message: effect() } : { hero, message: "" };
}

export function getShopOffer(shopLevel) {
  const price = 20 + shopLevel * 10;
  return {
    price,
    hp: 300 + shopLevel * 50,
    atk: 3,
    def: 3,
  };
}

export function buyShopUpgrade(hero, choice) {
  const offer = getShopOffer(hero.shopLevel);
  if (hero.gold < offer.price) {
    return { hero, success: false, message: `金币不足，需要 ${offer.price}` };
  }

  const next = { ...hero, keys: { ...hero.keys } };
  next.gold -= offer.price;
  next.shopLevel += 1;

  if (choice === "hp") {
    next.hp += offer.hp;
    return { hero: next, success: true, message: `生命 +${offer.hp}` };
  }
  if (choice === "atk") {
    next.atk += offer.atk;
    return { hero: next, success: true, message: `攻击 +${offer.atk}` };
  }
  if (choice === "def") {
    next.def += offer.def;
    return { hero: next, success: true, message: `防御 +${offer.def}` };
  }

  return { hero, success: false, message: "未知选项" };
}
