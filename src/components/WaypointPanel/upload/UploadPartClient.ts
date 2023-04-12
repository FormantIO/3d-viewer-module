import { BaseClient } from "./BaseClient";
import { duration } from "./types";

export class UploadPartClient extends BaseClient {
  constructor() {
    super(undefined, {
      retries: 3,
      timeoutMs: 10 * duration.second,
    });
  }

  public async upload(partUrl: string, blob: Blob): Promise<string> {
    const result = await this.fetchVerbose<void>(partUrl, {
      method: "PUT",
      body: blob,
      json: false,
    });
    const eTag = result.headers.get("etag");
    if (!eTag) {
      throw new Error(`Invalid ETag from upload part response: ${eTag}`);
    }
    return eTag;
  }
}
