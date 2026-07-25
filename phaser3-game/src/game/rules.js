export function getPickupScore(remainingSeconds) {
  return 100 + Math.max(remainingSeconds, 0) * 2;
}

export function getWinBonus(remainingSeconds, health) {
  return Math.max(remainingSeconds, 0) * 25 + Math.max(health, 0) * 200;
}

export function getEnemySpeed(collected, randomBoost = 0) {
  return 92 + Math.max(collected, 0) * 7 + Math.max(randomBoost, 0);
}

export function getDashCooldownSeconds(dashReadyAt, now) {
  const remainingMilliseconds = Math.max(0, dashReadyAt - now);
  return Math.ceil(remainingMilliseconds / 100) / 10;
}
