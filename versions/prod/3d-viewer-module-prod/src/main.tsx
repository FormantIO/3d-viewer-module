import { createRoot } from "react-dom/client";
import { Viewer } from "./Viewer";
import { Demo } from "./Demo";

const query = new URLSearchParams(window.location.search);
const demoMode = query.get("auth") === null;
const app = document.getElementById("root");
if (app) {
  createRoot(app).render(demoMode ? <Demo /> : <Viewer />);
}
