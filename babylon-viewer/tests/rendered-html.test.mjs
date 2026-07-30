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

test("server-renders the Babylon.js construction site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>TRELLIS 施工场区 × Babylon\.js<\/title>/i);
  assert.match(html, /<h1>自动化施工场区<\/h1>/);
  assert.match(html, /aria-label="Babylon\.js 3D 施工场区"/);
  assert.match(html, /施工场区/);
  assert.match(html, /单模型/);
  assert.match(html, /推土机/);
  assert.match(html, /挖掘机/);
  assert.match(html, /直升机/);
  assert.match(html, /火车头/);
  assert.match(html, /道路、铁路、停机坪由 Babylon\.js 生成/);
  assert.match(html, /暂停运动/);
  assert.match(html, /速度/);
  assert.match(html, /1<!-- -->×/);
  assert.match(html, /全景/);
  assert.match(html, /俯瞰/);
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

test("loads all models and defines automatic movement routes", async () => {
  const [catalogSource, siteSource] = await Promise.all([
    readFile(new URL("../app/modelCatalog.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../app/world/createConstructionSite.ts", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(siteSource, /SceneLoader\.ImportMeshAsync/);
  assert.match(siteSource, /createRouteController/);
  assert.match(siteSource, /helicopterAngle/);
  assert.match(siteSource, /constructionGround/);
  assert.match(siteSource, /helipad/);
  assert.match(siteSource, /railSleeper/);
  for (const file of expectedModels) {
    assert.match(
      catalogSource,
      new RegExp(`models/${file.replaceAll(".", "\\.")}`),
    );
  }
});
