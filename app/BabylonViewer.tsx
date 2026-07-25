"use client";

import { useEffect, useRef, useState } from "react";

type ModelOption = {
  id: string;
  label: string;
  file: string;
  triangles: string;
};

const MODELS: ModelOption[] = [
  {
    id: "bulldozer",
    label: "推土机",
    file: "/models/typical_vehicle_bulldozer.glb",
    triangles: "28,864",
  },
  {
    id: "excavator",
    label: "挖掘机",
    file: "/models/typical_vehicle_excavator.glb",
    triangles: "29,882",
  },
  {
    id: "helicopter",
    label: "直升机",
    file: "/models/typical_vehicle_helicopter.glb",
    triangles: "5,538",
  },
  {
    id: "locomotive",
    label: "火车头",
    file: "/models/typical_vehicle_locomotive.glb",
    triangles: "22,032",
  },
  {
    id: "building",
    label: "建筑",
    file: "/models/typical_building_building.glb",
    triangles: "50,130",
  },
  {
    id: "crate",
    label: "货箱",
    file: "/models/typical_misc_crate.glb",
    triangles: "34,812",
  },
];

export function BabylonViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotateRef = useRef(true);
  const [activeId, setActiveId] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);

  const activeModel =
    MODELS.find((model) => model.id === activeId) ?? MODELS[0];

  useEffect(() => {
    rotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;
    setLoading(true);
    setError("");

    const start = async () => {
      const BABYLON = await import("@babylonjs/core");
      await import("@babylonjs/loaders/glTF");

      if (disposed) {
        return;
      }

      const {
        ArcRotateCamera,
        Color3,
        Color4,
        DirectionalLight,
        Engine,
        HemisphericLight,
        MeshBuilder,
        Scene,
        SceneLoader,
        ShadowGenerator,
        StandardMaterial,
        TransformNode,
        Vector3,
      } = BABYLON;

      const engine = new Engine(canvas, true, {
        antialias: true,
        preserveDrawingBuffer: true,
        stencil: true,
      });
      engine.setHardwareScalingLevel(
        Math.max(1, window.devicePixelRatio / 1.5),
      );

      const scene = new Scene(engine);
      scene.clearColor = new Color4(0.035, 0.055, 0.075, 1);
      scene.environmentIntensity = 0.85;

      const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2.25,
        Math.PI / 3.1,
        5.4,
        new Vector3(0, 0.85, 0),
        scene,
      );
      camera.lowerRadiusLimit = 2.4;
      camera.upperRadiusLimit = 10;
      camera.lowerBetaLimit = 0.2;
      camera.upperBetaLimit = Math.PI / 2.05;
      camera.wheelPrecision = 35;
      camera.panningSensibility = 0;
      camera.attachControl(canvas, true);

      const ambient = new HemisphericLight(
        "ambient",
        new Vector3(0.2, 1, 0.1),
        scene,
      );
      ambient.intensity = 1.45;
      ambient.groundColor = new Color3(0.09, 0.12, 0.16);

      const keyLight = new DirectionalLight(
        "key",
        new Vector3(-0.6, -1, 0.45),
        scene,
      );
      keyLight.position = new Vector3(5, 8, -6);
      keyLight.intensity = 2.2;

      const shadowGenerator = new ShadowGenerator(1024, keyLight);
      shadowGenerator.useBlurExponentialShadowMap = true;
      shadowGenerator.blurKernel = 24;
      shadowGenerator.bias = 0.0004;

      const platform = MeshBuilder.CreateCylinder(
        "platform",
        { diameter: 4.4, height: 0.14, tessellation: 96 },
        scene,
      );
      platform.position.y = -0.07;
      platform.receiveShadows = true;

      const platformMaterial = new StandardMaterial(
        "platformMaterial",
        scene,
      );
      platformMaterial.diffuseColor = new Color3(0.11, 0.145, 0.17);
      platformMaterial.specularColor = new Color3(0.08, 0.1, 0.12);
      platformMaterial.emissiveColor = new Color3(0.012, 0.02, 0.025);
      platform.material = platformMaterial;

      const ring = MeshBuilder.CreateTorus(
        "ring",
        { diameter: 4.1, thickness: 0.025, tessellation: 128 },
        scene,
      );
      ring.position.y = 0.012;
      const ringMaterial = new StandardMaterial("ringMaterial", scene);
      ringMaterial.emissiveColor = new Color3(0.22, 0.67, 0.73);
      ringMaterial.diffuseColor = new Color3(0.05, 0.18, 0.2);
      ring.material = ringMaterial;

      const modelRoot = new TransformNode("modelRoot", scene);

      try {
        const result = await SceneLoader.ImportMeshAsync(
          null,
          "",
          activeModel.file,
          scene,
        );

        if (disposed) {
          return;
        }

        const roots = result.meshes.filter((mesh) => !mesh.parent);
        roots.forEach((mesh) => {
          mesh.parent = modelRoot;
        });

        const sourceRoot = result.meshes[0];
        sourceRoot.computeWorldMatrix(true);
        const bounds = sourceRoot.getHierarchyBoundingVectors(true);
        const size = bounds.max.subtract(bounds.min);
        const center = bounds.min.add(bounds.max).scale(0.5);
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 2.55 / Math.max(maxDimension, 0.001);

        modelRoot.scaling.setAll(scale);
        modelRoot.position = new Vector3(
          -center.x * scale,
          -bounds.min.y * scale + 0.03,
          -center.z * scale,
        );

        result.meshes.forEach((mesh) => {
          mesh.receiveShadows = true;
          shadowGenerator.addShadowCaster(mesh, true);
        });

        camera.radius = activeModel.id === "building" ? 6.2 : 5.2;
        camera.setTarget(
          new Vector3(0, Math.min(1.15, size.y * scale * 0.48), 0),
        );
        setLoading(false);
      } catch (reason: unknown) {
        if (!disposed) {
          const message =
            reason instanceof Error ? reason.message : "GLB 模型加载失败";
          setError(message);
          setLoading(false);
        }
      }

      scene.onBeforeRenderObservable.add(() => {
        if (rotateRef.current) {
          modelRoot.rotation.y += engine.getDeltaTime() * 0.00016;
        }
      });

      engine.runRenderLoop(() => {
        scene.render();
      });

      const resize = () => engine.resize();
      window.addEventListener("resize", resize);

      cleanup = () => {
        window.removeEventListener("resize", resize);
        scene.dispose();
        engine.dispose();
      };
    };

    void start();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [activeModel]);

  return (
    <main className="viewer-shell">
      <canvas
        ref={canvasRef}
        className="render-canvas"
        aria-label={`Babylon.js 3D 模型查看器：${activeModel.label}`}
      />

      <header className="viewer-header">
        <div>
          <p className="eyebrow">TRELLIS.2 × BABYLON.JS</p>
          <h1>GLB 模型查看器</h1>
        </div>
        <div className="engine-badge">
          <span />
          Babylon Engine
        </div>
      </header>

      <aside className="model-panel" aria-label="选择模型">
        <p className="panel-label">模型资产</p>
        <div className="model-list">
          {MODELS.map((model, index) => (
            <button
              key={model.id}
              type="button"
              className={model.id === activeId ? "model-button active" : "model-button"}
              onClick={() => setActiveId(model.id)}
              aria-pressed={model.id === activeId}
            >
              <span className="model-index">{String(index + 1).padStart(2, "0")}</span>
              <span>{model.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="model-info" aria-live="polite">
        <div>
          <p className="panel-label">当前模型</p>
          <h2>{activeModel.label}</h2>
        </div>
        <dl>
          <div>
            <dt>格式</dt>
            <dd>GLB 2.0</dd>
          </div>
          <div>
            <dt>三角面</dt>
            <dd>{activeModel.triangles}</dd>
          </div>
          <div>
            <dt>贴图</dt>
            <dd>1024²</dd>
          </div>
        </dl>
      </section>

      <div className="viewer-controls">
        <button
          type="button"
          className="control-button"
          onClick={() => setAutoRotate((value) => !value)}
          aria-pressed={autoRotate}
        >
          {autoRotate ? "暂停旋转" : "自动旋转"}
        </button>
        <p>拖拽旋转 · 滚轮缩放</p>
      </div>

      {loading && (
        <div className="loading-card" role="status">
          <span className="loader" />
          正在载入 {activeModel.label}
        </div>
      )}

      {error && (
        <div className="error-card" role="alert">
          <strong>模型没有成功载入</strong>
          <span>{error}</span>
        </div>
      )}
    </main>
  );
}
