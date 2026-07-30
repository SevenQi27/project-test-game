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

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Babylon.js GLB viewer", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>TRELLIS × Babylon\.js<\/title>/i);
  assert.match(html, /<h1>GLB 模型查看器<\/h1>/);
  assert.match(html, /aria-label="Babylon\.js 3D 模型查看器：推土机"/);
  assert.match(html, /推土机/);
  assert.match(html, /挖掘机/);
  assert.match(html, /直升机/);
  assert.match(html, /火车头/);
  assert.match(html, /建筑/);
  assert.match(html, /货箱/);
  assert.match(html, /拖拽旋转 · 滚轮缩放/);
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("packages all six TRELLIS GLB models", async () => {
  const modelRoot = new URL("../dist/client/models/", import.meta.url);
  const files = (await readdir(modelRoot))
    .filter((file) => file.endsWith(".glb"))
    .sort();

  assert.deepEqual(files, [...expectedModels].sort());

  for (const file of expectedModels) {
    const metadata = await stat(new URL(file, modelRoot));
    assert.ok(metadata.size > 100_000, `${file} should contain a real GLB model`);
  }
});

test("loads models through Babylon SceneLoader", async () => {
  const source = await readFile(
    new URL("../app/BabylonViewer.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /@babylonjs\/loaders\/glTF/);
  assert.match(source, /SceneLoader\.ImportMeshAsync/);
  for (const file of expectedModels) {
    assert.match(source, new RegExp(`models/${file.replaceAll(".", "\\.")}`));
  }
});
