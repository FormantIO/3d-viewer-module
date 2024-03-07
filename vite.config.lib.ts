import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/lib.ts"),
      name: "Formant3dViewer",
      // the proper extensions will be added
      fileName: "formant-3d-viewer",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        "@dimforge/rapier3d",
        "@formant/data-sdk",
        "@formant/ui-sdk",
        "@react-three/drei",
        "@react-three/fiber",
        "@react-three/postprocessing",
        "@react-three/xr",
        "color-rgba",
        "geolib",
        "jq-web",
        "postprocessing",
        "react",
        "react-dom",
        "seedrandom",
        "three",
        "uuid",
        "uuid-by-string",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          three: "THREE",
          uuid: "uuid",
          geolib: "geolib",
          "uuid-by-string": "getUuid",
          "@react-three/drei": "ReactThreeDrei",
          "@react-three/fiber": "ReactThreeFiber",
        },
      },
    },
  },
});
