import { FileClient } from "./FileClient";

export const upload = async (token: string, jsonData: Object) => {
  // admin API
  const fileClient = new FileClient("https://api.formant.io");

  const blob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  const file = new File([blob], "data.json");

  const fileID = await fileClient.uploadFile("token", file);

  return fileID;
};
