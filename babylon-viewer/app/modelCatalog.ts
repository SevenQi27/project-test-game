export type ModelId =
  | "bulldozer"
  | "excavator"
  | "helicopter"
  | "locomotive"
  | "building"
  | "crate";

export type ModelOption = {
  id: ModelId;
  label: string;
  file: string;
  triangles: string;
};

const MODEL_BASE_URL = (
  import.meta as ImportMeta & { env: { BASE_URL: string } }
).env.BASE_URL;

export const MODELS: ModelOption[] = [
  {
    id: "bulldozer",
    label: "推土机",
    file: `${MODEL_BASE_URL}models/typical_vehicle_bulldozer.glb`,
    triangles: "28,864",
  },
  {
    id: "excavator",
    label: "挖掘机",
    file: `${MODEL_BASE_URL}models/typical_vehicle_excavator.glb`,
    triangles: "29,882",
  },
  {
    id: "helicopter",
    label: "直升机",
    file: `${MODEL_BASE_URL}models/typical_vehicle_helicopter.glb`,
    triangles: "5,538",
  },
  {
    id: "locomotive",
    label: "火车头",
    file: `${MODEL_BASE_URL}models/typical_vehicle_locomotive.glb`,
    triangles: "22,032",
  },
  {
    id: "building",
    label: "建筑",
    file: `${MODEL_BASE_URL}models/typical_building_building.glb`,
    triangles: "50,130",
  },
  {
    id: "crate",
    label: "货箱",
    file: `${MODEL_BASE_URL}models/typical_misc_crate.glb`,
    triangles: "34,812",
  },
];

export const MODEL_FILES = Object.fromEntries(
  MODELS.map((model) => [model.id, model.file]),
) as Record<ModelId, string>;
