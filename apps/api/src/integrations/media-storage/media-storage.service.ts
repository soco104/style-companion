import { Injectable } from "@nestjs/common";

import { getIntegrationMode, productionBehaviorDisabled, requireEnv } from "../common/integration-config";

export type PresignedUploadRequest = {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
};

export type PresignedUpload = {
  provider: "s3-compatible";
  key: string;
  uploadUrl: string;
  publicUrl?: string;
  expiresAt: string;
};

@Injectable()
export class MediaStorageService {
  private readonly mode = getIntegrationMode("MEDIA_STORAGE_MODE");

  async createPresignedUpload(request: PresignedUploadRequest): Promise<PresignedUpload> {
    const expiresInSeconds = request.expiresInSeconds ?? 900;

    if (this.mode === "mock") {
      return {
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
        key: request.key,
        provider: "s3-compatible",
        publicUrl: `http://localhost:3000/mock-media/${encodeURIComponent(request.key)}`,
        uploadUrl: `http://localhost:3000/mock-upload/${encodeURIComponent(request.key)}?contentType=${encodeURIComponent(
          request.contentType
        )}`
      };
    }

    requireEnv(["S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]);
    throw productionBehaviorDisabled("S3-compatible media storage");
  }

  async deleteObject(key: string) {
    if (this.mode === "mock") {
      return {
        deleted: true,
        key,
        provider: "s3-compatible"
      };
    }

    requireEnv(["S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]);
    throw productionBehaviorDisabled("S3-compatible media storage");
  }

  getStatus() {
    return {
      mode: this.mode,
      provider: "s3-compatible-media-storage",
      productionEnabled: false
    };
  }
}
