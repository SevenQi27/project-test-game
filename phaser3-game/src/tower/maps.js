export const FLOOR_DEFINITIONS = [
  {
    name: "沉睡的入口",
    map: [
      "###########",
      "#..m#...#U#",
      "#.#.#.#.#Y#",
      "#y#...#.g.#",
      "#Y#####.#.#",
      "#..p.m#.#.#",
      "###.#.#.#.#",
      "#a..#...#d#",
      "#.#####.#B#",
      "#@..y..mb.#",
      "###########",
    ],
  },
  {
    name: "回廊与商人",
    map: [
      "###########",
      "#U#..d#P.r#",
      "#R#k#.#m#Y#",
      "#.....#...#",
      "###B#.###.#",
      "#b..#s#Py.#",
      "#.#.###.#.#",
      "#.#g...#a.#",
      "###Y###.#.#",
      "#D..y..m..#",
      "###########",
    ],
  },
  {
    name: "王座之前",
    map: [
      "###########",
      "#..a#P..#X#",
      "#k#.#M#.#R#",
      "#.#...#...#",
      "#.###.#.#.#",
      "#P..K.#.#a#",
      "###.#.#.#.#",
      "#d..#...#r#",
      "#.#.###.#Y#",
      "#D..y..g..#",
      "###########",
    ],
  },
];

export function createFloorMaps() {
  return FLOOR_DEFINITIONS.map((floor) =>
    floor.map.map((row) => row.split("")),
  );
}

export function findSymbol(map, symbol) {
  for (let y = 0; y < map.length; y += 1) {
    const x = map[y].indexOf(symbol);
    if (x !== -1) return { x, y };
  }
  return null;
}
