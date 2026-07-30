export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;
export const TILE_SIZE = 48;
export const MAP_COLS = 11;
export const MAP_ROWS = 11;
export const BOARD_X = 28;
export const BOARD_Y = 76;
export const PANEL_X = 580;

export const FONT_FAMILY =
  'Arial, "PingFang SC", "Microsoft YaHei", sans-serif';

export const COLORS = {
  background: 0x080d13,
  panel: 0x111923,
  panelLight: 0x1b2934,
  cream: "#f3ead8",
  muted: "#91a0a8",
  gold: "#e7b85d",
  cyan: "#67d7d0",
  red: "#e56862",
  blue: "#5ba8e6",
};

export const SAVE_KEY = "phaser-mini-magic-tower-save-v1";

export const INITIAL_HERO = {
  hp: 1000,
  atk: 18,
  def: 8,
  gold: 0,
  keys: { yellow: 0, blue: 0, red: 0 },
  shopLevel: 0,
};

export const SYMBOL_INFO = {
  Y: { type: "door", key: "yellow", name: "黄门" },
  B: { type: "door", key: "blue", name: "蓝门" },
  R: { type: "door", key: "red", name: "红门" },
  y: { type: "item", name: "黄钥匙" },
  b: { type: "item", name: "蓝钥匙" },
  r: { type: "item", name: "红钥匙" },
  p: { type: "item", name: "红药水" },
  P: { type: "item", name: "蓝药水" },
  a: { type: "item", name: "攻击宝石" },
  d: { type: "item", name: "防御宝石" },
  s: { type: "shop", name: "神秘商人" },
  U: { type: "stairs", direction: 1, name: "上楼" },
  D: { type: "stairs", direction: -1, name: "下楼" },
};
