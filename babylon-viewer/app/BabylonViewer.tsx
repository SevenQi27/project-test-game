"use client";

import { useEffect, useRef, useState } from "react";
import { MODELS, MODEL_FILES } from "./modelCatalog";
import {
  createConstructionSite,
  type CameraPreset,
} from "./world/createConstructionSite";

type ViewMode = "site" | "model";

const SITE_ASSETS = [
  ["推土机", "环路巡检"],
  ["挖掘机", "工位作业"],
  ["火车头", "轨道运输"],
  ["直升机", "空中巡航"],
] as const;

export function BabylonViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(true);
  const speedRef = useRef(1);
  const cameraActionRef = useRef<(preset: CameraPreset) => void>(() => {});
  const [viewMode, setViewMode] = useState<ViewMode>("site");
  const [activeId, setActiveId] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(true);
  const [loadingLabel, setLoadingLabel] = useState("正在搭建场区");
  const [progress, setProgress] = useState({ completed: 0, total: 6 });
  const [error, setError] = useState("");
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);

  const activeModel =
    MODELS.find((model) => model.id === activeId) ?? MODELS[0];

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;
    setLoading(true);
    setError("");
    setProgress({ completed: 0, total: viewMode === "site" ? 6 : 1 });
    setLoadingLabel(viewMode === "site" ? "正在搭建场区" : `正在载入 ${activeModel.label}`);

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
      let updateScene = () => {};

      const resize = () => engine.resize();
      window.addEventListener("resize", resize);
      engine.runRenderLoop(() => scene.render());

      cleanup = () => {
        window.removeEventListener("resize", resize);
        scene.dispose();
        engine.dispose();
      };

      if (viewMode === "site") {
        const site = createConstructionSite({
          BABYLON,
          scene,
          canvas,
          modelFiles: MODEL_FILES,
          onProgress: ({ completed, total, label }) => {
            if (!disposed) {
              setProgress({ completed, total });
              setLoadingLabel(`正在布置：${label}`);
            }
          },
        });

        cameraActionRef.current = site.setCameraPreset;
        updateScene = () => {
          if (runningRef.current) {
            site.update(engine.getDeltaTime() / 1000, speedRef.current);
          }
        };

        const errors = await site.ready;
        if (!disposed) {
          setError(errors.join("；"));
          setLoading(false);
        }
      } else {
        scene.clearColor = new Color4(0.035, 0.055, 0.075, 1);
        scene.environmentIntensity = 0.85;

        const camera = new ArcRotateCamera(
          "modelCamera",
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

        cameraActionRef.current = () => {
          camera.alpha = -Math.PI / 2.25;
          camera.beta = Math.PI / 3.1;
          camera.radius = activeModel.id === "building" ? 6.2 : 5.2;
        };

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
          setProgress({ completed: 1, total: 1 });
          setLoading(false);
        } catch (reason: unknown) {
          if (!disposed) {
            const message =
              reason instanceof Error ? reason.message : "GLB 模型加载失败";
            setError(message);
            setLoading(false);
          }
        }

        updateScene = () => {
          if (runningRef.current) {
            modelRoot.rotation.y += engine.getDeltaTime() * 0.00016 * speedRef.current;
          }
        };
      }

      scene.onBeforeRenderObservable.add(() => updateScene());
    };

    void start();

    return () => {
      disposed = true;
      cameraActionRef.current = () => {};
      cleanup?.();
    };
  }, [viewMode, activeId, activeModel]);

  const cycleSpeed = () => {
    setSpeed((current) => (current === 0.5 ? 1 : current === 1 ? 2 : 0.5));
  };

  return (
    <main className={viewMode === "site" ? "viewer-shell site-mode" : "viewer-shell model-mode"}>
      <canvas
        ref={canvasRef}
        className="render-canvas"
        aria-label={
          viewMode === "site"
            ? "Babylon.js 3D 施工场区"
            : `Babylon.js 3D 模型查看器：${activeModel.label}`
        }
      />

      <header className="viewer-header">
        <div>
          <p className="eyebrow">TRELLIS.2 × BABYLON.JS</p>
          <h1>{viewMode === "site" ? "自动化施工场区" : "GLB 模型查看器"}</h1>
        </div>
        <div className="engine-badge">
          <span />
          Babylon Engine
        </div>
      </header>

      <nav className="mode-switch" aria-label="展示模式">
        <button
          type="button"
          className={viewMode === "site" ? "active" : ""}
          onClick={() => setViewMode("site")}
          aria-pressed={viewMode === "site"}
        >
          施工场区
        </button>
        <button
          type="button"
          className={viewMode === "model" ? "active" : ""}
          onClick={() => setViewMode("model")}
          aria-pressed={viewMode === "model"}
        >
          单模型
        </button>
      </nav>

      {viewMode === "site" ? (
        <>
          <aside className="site-panel" aria-label="自动运行设备">
            <p className="panel-label">运行设备</p>
            <div className="asset-status-list">
              {SITE_ASSETS.map(([label, task]) => (
                <div key={label} className="asset-status">
                  <span className="status-dot" />
                  <div>
                    <strong>{label}</strong>
                    <small>{task}</small>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="site-info">
            <p className="panel-label">场区说明</p>
            <h2>智能施工示范区</h2>
            <p>道路、铁路、停机坪由 Babylon.js 生成，设备来自 TRELLIS GLB。</p>
            <dl>
              <div>
                <dt>场区</dt>
                <dd>60 × 40m</dd>
              </div>
              <div>
                <dt>模型</dt>
                <dd>6 个 GLB</dd>
              </div>
              <div>
                <dt>状态</dt>
                <dd>{running ? "运行中" : "已暂停"}</dd>
              </div>
            </dl>
          </section>
        </>
      ) : (
        <>
          <aside className="model-panel" aria-label="选择模型">
            <p className="panel-label">模型资产</p>
            <div className="model-list">
              {MODELS.map((model, index) => (
                <button
                  key={model.id}
                  type="button"
                  className={
                    model.id === activeId ? "model-button active" : "model-button"
                  }
                  onClick={() => setActiveId(model.id)}
                  aria-pressed={model.id === activeId}
                >
                  <span className="model-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
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
        </>
      )}

      <div className="viewer-controls">
        <button
          type="button"
          className="control-button primary"
          onClick={() => setRunning((value) => !value)}
          aria-pressed={running}
        >
          {running ? "暂停运动" : "继续运动"}
        </button>
        <button type="button" className="control-button" onClick={cycleSpeed}>
          速度 {speed}×
        </button>
        {viewMode === "site" && (
          <>
            <button
              type="button"
              className="control-button desktop-control"
              onClick={() => cameraActionRef.current("overview")}
            >
              全景
            </button>
            <button
              type="button"
              className="control-button desktop-control"
              onClick={() => cameraActionRef.current("bird")}
            >
              俯瞰
            </button>
          </>
        )}
        <p>拖拽旋转 · 滚轮缩放</p>
      </div>

      {loading && (
        <div className="loading-card" role="status">
          <span className="loader" />
          <div>
            <strong>{loadingLabel}</strong>
            <small>
              {progress.completed} / {progress.total}
            </small>
          </div>
        </div>
      )}

      {error && (
        <div className="error-card" role="alert">
          <strong>部分模型没有成功载入</strong>
          <span>{error}</span>
        </div>
      )}
    </main>
  );
}
