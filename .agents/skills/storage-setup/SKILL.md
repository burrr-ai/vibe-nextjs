---
name: storage-setup
description: R2 object storage setup for server-side file uploads. Triggers - "image upload", "photo upload", "file upload", "save image", "save file", "upload feature", "storage", or any time a file/image upload is requested.
---

## Workflow

- [ ] `bash -c '.agents/skills/storage-setup/scripts/setup.sh'`
- [ ] Ensure `src/server/config.ts` exposes the required env vars (read via `process.env`):
  ```ts
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
  ```
- [ ] Tell the user (verbally) to add these to `.env.local` — they cannot see files, so phrase it as "I need three Cloudflare values: account ID, R2 access key, and R2 secret. Paste them in chat and I'll wire them up."
- [ ] Add to the `## Project Structure` section in AGENTS.md:
  ```
  server/storage/ - R2 storage (direct server-side upload)
    - uploadFile(file, path?): upload a File and return { publicUrl }
  ```
- [ ] `rm -rf .agents/skills/storage-setup`

## Notes

- Uploads happen entirely server-side via `@aws-sdk/client-s3` against the R2 S3-compatible endpoint. No presigned URLs, no browser-side PUT.
- The exposed API is intentionally minimal — `uploadFile(file: File, path?: string)` returning `{ publicUrl }`.
- Call it from a Server Action: receive `FormData` from the client, extract the `File`, pass it to `uploadFile`.
