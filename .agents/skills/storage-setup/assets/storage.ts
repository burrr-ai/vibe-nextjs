"use server";
import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "@/server/config";

const R2_PUBLIC_URL = "{{PUBLIC_URL}}";
const R2_BUCKET = "{{BUCKET_NAME}}";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${config.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(
  file: File,
  path: string = "uploads"
): Promise<{ publicUrl: string }> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const key = `${path}/${timestamp}-${randomStr}.${fileExtension}`;

  const body = new Uint8Array(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return { publicUrl: `${R2_PUBLIC_URL}/${key}` };
}
