---
name: storage-setup
description: R2 object storage setup for server-side file uploads. Triggers - "image upload", "photo upload", "file upload", "save image", "save file", "upload feature", "storage", or any time a file/image upload is requested.
---

## Workflow

- [ ] Make sure the user has run `pnpm wrangler login` at least once (the setup script needs Cloudflare credentials).
- [ ] `bash -c '.agents/skills/storage-setup/scripts/setup.sh'`
- [ ] Add to the `## Project Structure` section in AGENTS.md:
  ```
  server/storage/ - R2 storage (uses the R2 binding from wrangler.jsonc)
    - uploadFile(file, path?): upload a File and return { publicUrl }
  ```
- [ ] `rm -rf .agents/skills/storage-setup`

## Notes

- Uploads use the Cloudflare R2 **binding** (`env.R2` from `getCloudflareContext`), not the S3 API. No access keys, no bucket name leaks into the source — the bucket is wired through `wrangler.jsonc` and named via `cg.plugins.r2` in `package.json`.
- The exposed API is intentionally minimal — `uploadFile(file: File, path?: string)` returning `{ publicUrl }`.
- Call it from a Server Action: receive `FormData` from the client, extract the `File`, pass it to `uploadFile`.
