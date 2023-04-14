import { FileClient } from "./FileClient";
import * as uuid from "uuid";

export const upload = async (token: string, jsonData: Object) => {
  const devMode = window.location.href.includes("dev=true");
  const fileClient = new FileClient(
    `https://api${devMode ? "-dev" : ""}.formant.io/v1/admin`
  );
  const blob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  const file = new File([blob], `waypoints-${uuid.v1()}.json`);
  const fileID = await fileClient.uploadFile(token, file);
  return fileID;
};
