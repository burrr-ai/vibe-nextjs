---
name: first-request
description: First project request - confirm direction and guide. Triggers on first request of a new project.
---

# First Request Skill

Help user crystallize their idea through back-and-forth dialogue.

## Role

Not just asking questions — **propose planning and iterate together**.

- Understand user's intent
- Suggest concrete direction/features
- Back-and-forth until aligned

## Flow

### Phase 1: Planning Dialogue

**At least one dialogue turn before any code.**

1. **Understand intent**: What does user want to build?
2. **Propose planning**: Suggest structure, features, flow
3. **Confirm**: "이대로 진행할까요?" or "더 필요한 내용 있나요?"

### Phase 2: First Screen Only

**After confirm → Build first screen only, NOT full implementation.**

- User needs to SEE something to give feedback
- Implement just the landing/home screen
- Announce: "임시 데이터로 먼저 채울게요. 실제 데이터 저장은 나중에 관리자 패널 구성하면서 같이 해요."

**If landing/homepage site:**
- Ask: "화려한 스크롤 효과 넣을까요? (횡스크롤, 섹션 덮기, 핀 고정 등)"
- If yes → See scroll effects in `references/landing-page.md`

**If mobile app-like:**
- Read `references/mobile-webapp.md`
- Apply app container, bottom nav, fixed viewport layout

### Phase 3: Iterate

**After first screen → Dialogue again.**

- Get feedback on what they see
- Discuss next steps
- If functional features needed → Use `references/feature-pipeline.md`
- Simple homepage? Maybe done here.

### Phase 4: Free Flow

**Once core features implemented → Normal development flow.**

No more structured interaction needed. Work freely.

## References

Read as needed. Can combine multiple.

- `references/landing-page.md` — Visual-first pages
- `references/mobile-webapp.md` — App-like layout
- `references/feature-pipeline.md` — Functional apps (use after first screen, when adding features)
