import * as React from "react";
import { createRoot } from "react-dom/client";
import { FormantProvider } from "@formant/ui-sdk";
import { Authentication, Fleet, App } from "@formant/data-sdk";
import { LiveUniverseData } from "@formant/universe-connector";
import { defined, LayerRegistry, TeleportLayer, Universe } from "../src/main";
import { SimulatedUniverseData } from "./SimulatedUniverseData";
import { createScene } from "./createScene";
import { TestLayer } from "./TestLayer";
import configTest from "./configTest.json";

// get query parameter demo
const urlParams = new URLSearchParams(window.location.search);
const demo = urlParams.get("demo");
// let moduleConfiguration = configTest;

LayerRegistry.register(TeleportLayer);
LayerRegistry.register(TestLayer);



function ViewerApp() {
  const [config, setConfig] = React.useState(configTest);
  React.useEffect(() => {
    const getDevice = async () => {
      await Authentication.waitTilAuthenticated();
      console.log(Authentication.token)
      const moduleConfiguration = JSON.parse(defined(await App.getCurrentModuleConfiguration()));
      setConfig(moduleConfiguration);
      console.log(moduleConfiguration)
    };
    getDevice();
  }, [])
  const data =
    demo === "true" ? new SimulatedUniverseData(config) : new LiveUniverseData();
  window.setInterval(() => {
    data.setTime(new Date());
  }, 60 / 12);

  return (
    <Universe
      initialSceneGraph={createScene(config)}
      universeData={data}
      mode="edit"
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
