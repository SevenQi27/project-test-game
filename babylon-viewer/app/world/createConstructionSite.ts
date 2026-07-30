import type { Scene, ShadowGenerator, TransformNode } from "@babylonjs/core";
import type { ModelId } from "../modelCatalog";

type BabylonRuntime = typeof import("@babylonjs/core");

type SiteProgress = {
  completed: number;
  total: number;
  label: string;
};

type CreateConstructionSiteOptions = {
  BABYLON: BabylonRuntime;
  scene: Scene;
  canvas: HTMLCanvasElement;
  modelFiles: Record<ModelId, string>;
  onProgress: (progress: SiteProgress) => void;
};

export type CameraPreset = "overview" | "bird";

export type ConstructionSite = {
  ready: Promise<string[]>;
  update: (deltaSeconds: number, speedScale: number) => void;
  setCameraPreset: (preset: CameraPreset) => void;
};

type RouteController = {
  update: (deltaSeconds: number, speedScale: number) => void;
};

type LoadedAsset = {
  root: TransformNode;
};

type AssetDefinition = {
  id: ModelId;
  label: string;
  targetSize: number;
  position: [number, number, number];
  rotationY?: number;
};

const ASSETS: AssetDefinition[] = [
  {
    id: "building",
    label: "办公建筑",
    targetSize: 11,
    position: [-13, 0.12, -5],
    rotationY: Math.PI * 0.08,
  },
  {
    id: "crate",
    label: "施工货箱",
    targetSize: 2.8,
    position: [-7, 0.12, 7.5],
    rotationY: -Math.PI * 0.1,
  },
  {
    id: "bulldozer",
    label: "巡检推土机",
    targetSize: 5.2,
    position: [-21.5, 0.12, -12.5],
  },
  {
    id: "excavator",
    label: "作业挖掘机",
    targetSize: 5.3,
    position: [3, 0.12, 6],
  },
  {
    id: "locomotive",
    label: "运输火车头",
    targetSize: 5.4,
    position: [-25, 0.2, 16],
  },
  {
    id: "helicopter",
    label: "巡航直升机",
    targetSize: 6,
    position: [20, 8, -4],
  },
];

export function createConstructionSite({
  BABYLON,
  scene,
  canvas,
  modelFiles,
  onProgress,
}: CreateConstructionSiteOptions): ConstructionSite {
  const {
    ArcRotateCamera,
    Color3,
    Color4,
    DirectionalLight,
    HemisphericLight,
    MeshBuilder,
    ShadowGenerator,
    StandardMaterial,
    Vector3,
  } = BABYLON;

  scene.clearColor = new Color4(0.7, 0.8, 0.82, 1);
  scene.ambientColor = new Color3(0.22, 0.25, 0.27);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0045;
  scene.fogColor = new Color3(0.7, 0.8, 0.82);

  const camera = new ArcRotateCamera(
    "siteCamera",
    -Math.PI / 3.4,
    Math.PI / 3.25,
    54,
    new Vector3(0, 1.8, 0),
    scene,
  );
  camera.lowerRadiusLimit = 15;
  camera.upperRadiusLimit = 80;
  camera.lowerBetaLimit = 0.16;
  camera.upperBetaLimit = Math.PI / 2.03;
  camera.wheelDeltaPercentage = 0.015;
  camera.panningSensibility = 85;
  camera.attachControl(canvas, true);

  const skyLight = new HemisphericLight(
    "siteSkyLight",
    new Vector3(0.25, 1, 0.1),
    scene,
  );
  skyLight.intensity = 1.5;
  skyLight.groundColor = new Color3(0.22, 0.26, 0.24);

  const sun = new DirectionalLight(
    "siteSun",
    new Vector3(-0.52, -1, 0.38),
    scene,
  );
  sun.position = new Vector3(22, 34, -18);
  sun.intensity = 2.25;

  const shadowGenerator = new ShadowGenerator(2048, sun);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 28;
  shadowGenerator.bias = 0.0005;

  const material = (
    name: string,
    color: [number, number, number],
    specular: [number, number, number] = [0.04, 0.04, 0.04],
    emissive: [number, number, number] = [0, 0, 0],
  ) => {
    const result = new StandardMaterial(name, scene);
    result.diffuseColor = new Color3(...color);
    result.specularColor = new Color3(...specular);
    result.emissiveColor = new Color3(...emissive);
    return result;
  };

  const groundMaterial = material("groundMaterial", [0.27, 0.34, 0.27]);
  const roadMaterial = material("roadMaterial", [0.12, 0.145, 0.15]);
  const roadEdgeMaterial = material("roadEdgeMaterial", [0.68, 0.62, 0.37]);
  const concreteMaterial = material("concreteMaterial", [0.43, 0.46, 0.45]);
  const steelMaterial = material("steelMaterial", [0.17, 0.2, 0.21]);
  const railMaterial = material("railMaterial", [0.25, 0.27, 0.27], [0.2, 0.2, 0.2]);
  const safetyMaterial = material("safetyMaterial", [0.87, 0.48, 0.08]);
  const helipadMaterial = material("helipadMaterial", [0.16, 0.22, 0.22]);
  const helipadMarkMaterial = material(
    "helipadMarkMaterial",
    [0.05, 0.24, 0.24],
    [0, 0, 0],
    [0.08, 0.55, 0.52],
  );
  const dirtMaterial = material("dirtMaterial", [0.42, 0.29, 0.16]);

  const ground = MeshBuilder.CreateGround(
    "constructionGround",
    { width: 60, height: 40, subdivisions: 2 },
    scene,
  );
  ground.material = groundMaterial;
  ground.receiveShadows = true;

  const createSlab = (
    name: string,
    width: number,
    depth: number,
    x: number,
    z: number,
    height = 0.08,
  ) => {
    const slab = MeshBuilder.CreateBox(
      name,
      { width, height, depth },
      scene,
    );
    slab.position.set(x, height / 2, z);
    slab.material = roadMaterial;
    slab.receiveShadows = true;
    return slab;
  };

  createSlab("northRoad", 50, 5.2, 0, -12.5);
  createSlab("southRoad", 50, 5.2, 0, 12.5);
  createSlab("westRoad", 5.2, 20, -22.4, 0);
  createSlab("eastRoad", 5.2, 20, 22.4, 0);
  createSlab("serviceRoad", 25, 3.6, 9.5, 4.5);

  for (let x = -21; x <= 21; x += 6) {
    const northDash = MeshBuilder.CreateBox(
      `northDash-${x}`,
      { width: 2.8, height: 0.025, depth: 0.12 },
      scene,
    );
    northDash.position.set(x, 0.095, -12.5);
    northDash.material = roadEdgeMaterial;

    const southDash = northDash.clone(`southDash-${x}`);
    southDash.position.z = 12.5;
  }

  for (let z = -8; z <= 8; z += 5.2) {
    const westDash = MeshBuilder.CreateBox(
      `westDash-${z}`,
      { width: 0.12, height: 0.025, depth: 2.4 },
      scene,
    );
    westDash.position.set(-22.4, 0.095, z);
    westDash.material = roadEdgeMaterial;

    const eastDash = westDash.clone(`eastDash-${z}`);
    eastDash.position.x = 22.4;
  }

  const railBed = createSlab("railBed", 58, 3.3, 0, 16, 0.1);
  railBed.material = dirtMaterial;

  for (let x = -28; x <= 28; x += 1.4) {
    const sleeper = MeshBuilder.CreateBox(
      `railSleeper-${x}`,
      { width: 0.32, height: 0.12, depth: 2.6 },
      scene,
    );
    sleeper.position.set(x, 0.14, 16);
    sleeper.material = steelMaterial;
    sleeper.receiveShadows = true;
  }

  [-0.72, 0.72].forEach((offset, index) => {
    const rail = MeshBuilder.CreateBox(
      `rail-${index}`,
      { width: 58, height: 0.14, depth: 0.14 },
      scene,
    );
    rail.position.set(0, 0.25, 16 + offset);
    rail.material = railMaterial;
  });

  const officePad = MeshBuilder.CreateBox(
    "officePad",
    { width: 15.5, height: 0.12, depth: 12 },
    scene,
  );
  officePad.position.set(-13, 0.06, -5);
  officePad.material = concreteMaterial;
  officePad.receiveShadows = true;

  const helipad = MeshBuilder.CreateCylinder(
    "helipad",
    { diameter: 10.5, height: 0.12, tessellation: 64 },
    scene,
  );
  helipad.position.set(12, 0.06, -4);
  helipad.material = helipadMaterial;
  helipad.receiveShadows = true;

  const helipadRing = MeshBuilder.CreateTorus(
    "helipadRing",
    { diameter: 7.4, thickness: 0.16, tessellation: 64 },
    scene,
  );
  helipadRing.position.set(12, 0.14, -4);
  helipadRing.material = helipadMarkMaterial;

  [-1, 1].forEach((direction) => {
    const hStem = MeshBuilder.CreateBox(
      `helipadStem-${direction}`,
      { width: 0.32, height: 0.06, depth: 3.5 },
      scene,
    );
    hStem.position.set(12 + direction * 1.35, 0.16, -4);
    hStem.material = helipadMarkMaterial;
  });
  const hBar = MeshBuilder.CreateBox(
    "helipadBar",
    { width: 2.8, height: 0.06, depth: 0.32 },
    scene,
  );
  hBar.position.set(12, 0.16, -4);
  hBar.material = helipadMarkMaterial;

  const storagePad = MeshBuilder.CreateBox(
    "storagePad",
    { width: 13, height: 0.1, depth: 7 },
    scene,
  );
  storagePad.position.set(-5, 0.05, 7.7);
  storagePad.material = concreteMaterial;
  storagePad.receiveShadows = true;

  for (let index = 0; index < 3; index += 1) {
    const mound = MeshBuilder.CreateSphere(
      `dirtMound-${index}`,
      { diameter: 3.8, segments: 20, slice: 0.52 },
      scene,
    );
    mound.scaling.set(1 + index * 0.12, 0.55 + index * 0.06, 0.8);
    mound.position.set(4 + index * 3.2, 0.1, 8.5 + (index % 2) * 1.3);
    mound.material = dirtMaterial;
    mound.receiveShadows = true;
    shadowGenerator.addShadowCaster(mound);
  }

  for (let x = -28; x <= 28; x += 4) {
    createFencePost(BABYLON, scene, shadowGenerator, steelMaterial, x, -19);
    createFencePost(BABYLON, scene, shadowGenerator, steelMaterial, x, 19);
  }
  for (let z = -15; z <= 15; z += 4) {
    createFencePost(BABYLON, scene, shadowGenerator, steelMaterial, -29, z);
    createFencePost(BABYLON, scene, shadowGenerator, steelMaterial, 29, z);
  }

  for (let index = 0; index < 6; index += 1) {
    const cone = MeshBuilder.CreateCylinder(
      `safetyCone-${index}`,
      { diameterTop: 0.08, diameterBottom: 0.58, height: 1.1, tessellation: 24 },
      scene,
    );
    cone.position.set(3 + index * 1.4, 0.55, 2.25);
    cone.material = safetyMaterial;
    shadowGenerator.addShadowCaster(cone);
  }

  const controllers: RouteController[] = [];
  let helicopterAngle = 0;
  let completedAssets = 0;

  const ready = Promise.all(
    ASSETS.map(async (definition) => {
      try {
        const asset = await loadAsset(
          BABYLON,
          scene,
          shadowGenerator,
          modelFiles[definition.id],
          definition,
        );

        if (definition.id === "bulldozer") {
          controllers.push(
            createRouteController(
              BABYLON,
              asset.root,
              [
                [-22.4, 0.12, -12.5],
                [22.4, 0.12, -12.5],
                [22.4, 0.12, 12.5],
                [-22.4, 0.12, 12.5],
              ],
              3.3,
            ),
          );
        }

        if (definition.id === "excavator") {
          controllers.push(
            createRouteController(
              BABYLON,
              asset.root,
              [
                [3, 0.12, 5],
                [15, 0.12, 5],
                [17, 0.12, 9],
                [5, 0.12, 9],
              ],
              1.7,
            ),
          );
        }

        if (definition.id === "locomotive") {
          controllers.push(
            createRouteController(
              BABYLON,
              asset.root,
              [
                [-26, 0.26, 16],
                [26, 0.26, 16],
              ],
              4.5,
            ),
          );
        }

        if (definition.id === "helicopter") {
          controllers.push({
            update(deltaSeconds, speedScale) {
              helicopterAngle += deltaSeconds * 0.22 * speedScale;
              const radius = 13;
              asset.root.position.set(
                12 + Math.cos(helicopterAngle) * radius,
                8.2 + Math.sin(helicopterAngle * 2) * 0.45,
                -4 + Math.sin(helicopterAngle) * radius,
              );
              asset.root.rotation.y = -helicopterAngle + Math.PI / 2;
            },
          });
        }

        return "";
      } catch (reason: unknown) {
        const message = reason instanceof Error ? reason.message : "未知错误";
        return `${definition.label}：${message}`;
      } finally {
        completedAssets += 1;
        onProgress({
          completed: completedAssets,
          total: ASSETS.length,
          label: definition.label,
        });
      }
    }),
  ).then((messages) => messages.filter(Boolean));

  const setCameraPreset = (preset: CameraPreset) => {
    if (preset === "bird") {
      camera.alpha = -Math.PI / 2;
      camera.beta = 0.22;
      camera.radius = 62;
      camera.setTarget(new Vector3(0, 0, 0));
      return;
    }

    camera.alpha = -Math.PI / 3.4;
    camera.beta = Math.PI / 3.25;
    camera.radius = 54;
    camera.setTarget(new Vector3(0, 1.8, 0));
  };

  return {
    ready,
    setCameraPreset,
    update(deltaSeconds, speedScale) {
      controllers.forEach((controller) => {
        controller.update(deltaSeconds, speedScale);
      });
    },
  };
}

async function loadAsset(
  BABYLON: BabylonRuntime,
  scene: Scene,
  shadowGenerator: ShadowGenerator,
  file: string,
  definition: AssetDefinition,
): Promise<LoadedAsset> {
  const { SceneLoader, TransformNode, Vector3 } = BABYLON;
  const result = await SceneLoader.ImportMeshAsync(null, "", file, scene);
  const motionRoot = new TransformNode(`${definition.id}MotionRoot`, scene);
  const contentRoot = new TransformNode(`${definition.id}ContentRoot`, scene);
  contentRoot.parent = motionRoot;

  const roots = result.meshes.filter((mesh) => !mesh.parent);
  roots.forEach((mesh) => {
    mesh.parent = contentRoot;
  });

  result.meshes.forEach((mesh) => {
    mesh.receiveShadows = true;
    shadowGenerator.addShadowCaster(mesh, true);
  });

  const sourceRoot = result.meshes[0];
  sourceRoot.computeWorldMatrix(true);
  const bounds = sourceRoot.getHierarchyBoundingVectors(true);
  const size = bounds.max.subtract(bounds.min);
  const center = bounds.min.add(bounds.max).scale(0.5);
  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
  const scale = definition.targetSize / maxDimension;

  contentRoot.scaling.setAll(scale);
  contentRoot.position = new Vector3(
    -center.x * scale,
    -bounds.min.y * scale,
    -center.z * scale,
  );
  motionRoot.position = new Vector3(...definition.position);
  motionRoot.rotation.y = definition.rotationY ?? 0;

  return { root: motionRoot };
}

function createRouteController(
  BABYLON: BabylonRuntime,
  root: TransformNode,
  points: Array<[number, number, number]>,
  speed: number,
): RouteController {
  const { Vector3 } = BABYLON;
  const route = points.map((point) => new Vector3(...point));
  let targetIndex = 1;
  root.position.copyFrom(route[0]);

  return {
    update(deltaSeconds, speedScale) {
      const target = route[targetIndex];
      const offset = target.subtract(root.position);
      const distance = offset.length();

      if (distance < 0.08) {
        root.position.copyFrom(target);
        targetIndex = (targetIndex + 1) % route.length;
        return;
      }

      const direction = offset.scale(1 / distance);
      root.position.addInPlace(
        direction.scale(Math.min(distance, speed * speedScale * deltaSeconds)),
      );
      root.rotation.y = Math.atan2(direction.x, direction.z);
    },
  };
}

function createFencePost(
  BABYLON: BabylonRuntime,
  scene: Scene,
  shadowGenerator: ShadowGenerator,
  fenceMaterial: import("@babylonjs/core").StandardMaterial,
  x: number,
  z: number,
) {
  const post = BABYLON.MeshBuilder.CreateCylinder(
    `fencePost-${x}-${z}`,
    { diameter: 0.18, height: 1.7, tessellation: 12 },
    scene,
  );
  post.position.set(x, 0.85, z);
  post.material = fenceMaterial;
  shadowGenerator.addShadowCaster(post);
}
