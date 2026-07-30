import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BabylonViewer } from "../app/BabylonViewer";
import "../app/globals.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Babylon viewer root element was not found");
}

createRoot(container).render(
  <StrictMode>
    <BabylonViewer />
  </StrictMode>,
);
