import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const expectedModels = [
  "typical_vehicle_bulldozer.glb",
  "typical_vehicle_excavator.glb",
  "typical_vehicle_helicopter.glb",
  "typical_vehicle_locomotive.glb",
  "typical_building_building.glb",
  "typical_misc_crate.glb",
];

test("builds an AWS static entry under the Babylon base path", async () => {
  const html = await readFile(
    new URL("../dist-aws/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<title>TRELLIS × Babylon\.js<\/title>/);
  assert.match(html, /src="\/babylon\/assets\/[^\"]+\.js"/);
  assert.match(html, /href="\/babylon\/assets\/[^\"]+\.css"/);
});

test("copies all six GLB models into the AWS build", async () => {
  const modelRoot = new URL("../dist-aws/models/", import.meta.url);
  const files = (await readdir(modelRoot))
    .filter((file) => file.endsWith(".glb"))
    .sort();

  assert.deepEqual(files, [...expectedModels].sort());

  for (const file of expectedModels) {
    const metadata = await stat(new URL(file, modelRoot));
    assert.ok(metadata.size > 100_000, `${file} should contain a real GLB model`);
  }
});
