import { IValidation } from "./types";
import { BaseClient } from "./BaseClient";

const invalidHeadersValidation: IValidation = {
  "app-id": ["app-id must match formant/*"],
};

export abstract class FormantBaseClient extends BaseClient {
  public static headers: { [_: string]: string } = {};

  constructor(
    protected endpoint: string,
    options: { timeoutMs?: number } = {}
  ) {
    super(endpoint, {
      validateHeaders: (headers) =>
        !`${headers.get("app-id")}`.startsWith("formant/")
          ? invalidHeadersValidation
          : {},
      ...options,
    });
  }

  protected getHeaders(): { [_: string]: string } {
    return {
      ...FormantBaseClient.headers,
      //   "App-ID": `formant/${app}`,
      //   "App-Version": version,
    };
  }
}
