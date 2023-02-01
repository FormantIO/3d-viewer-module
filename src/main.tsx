import { createRoot } from "react-dom/client";
import { App } from "./App";

const app = document.getElementById("root");
if (app) {
  createRoot(app).render(<App />);
}
