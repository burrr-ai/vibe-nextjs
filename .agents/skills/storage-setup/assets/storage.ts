"use server";
import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

const R2_PUBLIC_URL = "{{PUBLIC_URL}}";

export async function uploadFile(
  file: File,
  path: string = "uploads"
): Promise<{ publicUrl: string }> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const key = `${path}/${timestamp}-${randomStr}.${fileExtension}`;

  const { env } = await getCloudflareContext({ async: true });
  await env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
    },
  });

  return { publicUrl: `${R2_PUBLIC_URL}/${key}` };
}
