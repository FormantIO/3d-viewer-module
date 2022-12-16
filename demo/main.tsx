import * as React from "react";
import { createRoot } from "react-dom/client";
import { FormantProvider } from "@formant/ui-sdk";
import { Authentication, Fleet, App } from "@formant/data-sdk";
import { LiveUniverseData } from "@formant/universe-connector";
import { LayerRegistry, TeleportLayer, Universe } from "../src/main";
import { SimulatedUniverseData } from "./SimulatedUniverseData";
import { createScene } from "./createScene";
import { TestLayer } from "./TestLayer";

// get query parameter demo
const urlParams = new URLSearchParams(window.location.search);
const demo = urlParams.get("demo");

LayerRegistry.register(TeleportLayer);
LayerRegistry.register(TestLayer);


const getDevice = async () => {
  if (demo === "true") {
    return;
  }
  await Authentication.waitTilAuthenticated();
  const configuration = await App.getCurrentModuleConfiguration();
  console.log(configuration)
};

function ViewerApp() {
  const data =
    demo === "true" ? new SimulatedUniverseData() : new LiveUniverseData();
  getDevice();
  window.setInterval(() => {
    data.setTime(new Date());
  }, 60 / 12);
  return (
    <Universe
      initialSceneGraph={createScene()}
      universeData={data}
      mode="edit"
      vr
      onSceneGraphChange={(_) => {
        console.log(JSON.stringify(_));
        console.log(_);
      }}
    />
  );
}

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(
    <FormantProvider>
      <ViewerApp />
    </FormantProvider>
  );
}
