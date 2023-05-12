import {
  IBeginUploadRequest,
  IBeginUploadResponse,
  ICompleteUploadRequest,
  ICloudFile,
  IQueryFilesResponse,
  Uuid,
} from "./types";
import { UploadPartClient } from "./UploadPartClient";
import { BaseModelClient } from "./BaseModelClient";

export class FileClient extends BaseModelClient<ICloudFile> {
  private uploadPartClient = new UploadPartClient();

  constructor(endpoint: string) {
    super(endpoint, "files");
  }

  public async uploadFile(
    token: string,
    file: File // TODO: nodejs compatibility
  ): Promise<Uuid> {
    const beginRequest: IBeginUploadRequest = {
      fileName: file.name,
      fileSize: file.size,
    };

    const { fileId, partSize, partUrls, uploadId } =
      await this.fetch<IBeginUploadResponse>("files/begin-upload", {
        token,
        method: "POST",
        body: JSON.stringify(beginRequest),
      });

    const eTags: string[] = [];
    for (let index = 0; index < partUrls.length; index++) {
      const blob = file.slice(index * partSize, index * partSize + partSize);
      const eTag = await this.uploadPartClient.upload(partUrls[index], blob);
      eTags.push(eTag);
    }

    const completeRequest: ICompleteUploadRequest = {
      fileId,
      uploadId,
      eTags,
    };

    await this.fetch<void>("files/complete-upload", {
      token,
      method: "POST",
      body: JSON.stringify(completeRequest),
    });

    return fileId;
  }

  public async query(token: string, fileIds: Uuid[]): Promise<string[]> {
    const { fileUrls } = await this.fetch<IQueryFilesResponse>("files/query", {
      token,
      method: "POST",
      body: JSON.stringify({ fileIds }),
    });
    return fileUrls;
  }

  public async getUrl(token: string, fileId: Uuid): Promise<string> {
    const fileUrl = await this.fetch<string>(`files/${fileId}/url`, {
      token,
      method: "GET",
    });
    return fileUrl;
  }
}
