"use server";
import "server-only";
import { AwsClient } from "aws4fetch";

const R2_PUBLIC_URL = "{{PUBLIC_URL}}"
const R2_BUCKET_NAME = "{{BUCKET_NAME}}"

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error(
    "R2 환경변수가 설정되지 않았습니다. .env에 CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY를 추가하세요."
  )
}

const R2_S3_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

let _r2Client: AwsClient | null = null

function getR2Client() {
  if (!_r2Client) {
    _r2Client = new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    })
  }
  return _r2Client
}

// ── Presigned URL (클라이언트 직접 업로드용) ──

export async function createPresignedUploadUrl(
  fileName: string,
  contentType: string,
  path: string = "uploads"
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "bin"
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const key = `${path}/${timestamp}-${randomStr}.${fileExtension}`

  const url = new URL(`${R2_S3_ENDPOINT}/${R2_BUCKET_NAME}/${key}`)
  url.searchParams.set("X-Amz-Expires", "3600")

  const signed = await getR2Client().sign(
    new Request(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": contentType },
    }),
    { aws: { signQuery: true } }
  )

  return {
    uploadUrl: signed.url,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
  }
}

// ── Presigned URL 삭제 ──

export async function createPresignedDeleteUrl(
  key: string
): Promise<string> {
  const url = new URL(`${R2_S3_ENDPOINT}/${R2_BUCKET_NAME}/${key}`)
  url.searchParams.set("X-Amz-Expires", "3600")

  const signed = await getR2Client().sign(
    new Request(url.toString(), { method: "DELETE" }),
    { aws: { signQuery: true } }
  )

  return signed.url
}
