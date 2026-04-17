---
name: storage-setup
description: R2 object storage setup for file uploads via presigned URLs. Triggers - "이미지 업로드", "사진 업로드", "파일 업로드", "이미지 저장", "파일 저장", "업로드 기능", "스토리지", or when file/image upload needed.
---

## Workflow

- [ ] `bash -c '.claude/skills/storage-setup/scripts/setup.sh'`
- [ ] Add to `## Project Structure & Architecture` section in CLAUDE.md:
  ```
  server/storage/ - R2 storage (presigned URL 방식)
    - createPresignedUploadUrl(fileName, contentType, path): presigned PUT URL 생성
    - createPresignedDeleteUrl(key): presigned DELETE URL 생성
  ```
- [ ] `rm -rf .claude/skills/storage-setup`
