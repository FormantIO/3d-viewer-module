import { createRoot } from "react-dom/client";
import { Viewer } from "./Viewer";
import { Demo } from "./Demo";
import { ViewerApp } from "./ViewerApp";

const query = new URLSearchParams(window.location.search);
const demoMode = query.get("auth") === null;
const standAloneMode = query.get("standalone") === "true";
const app = document.getElementById("root");
if (app) {
  createRoot(app).render(
    standAloneMode ? <ViewerApp /> : demoMode ? <Demo /> : <Viewer />
  );
}
