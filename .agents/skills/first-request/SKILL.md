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
3. **Confirm**: "Shall we move forward with this?" or "Is there anything else you'd like to add?"

### Phase 2: First Screen Only

**After confirm → Build first screen only, NOT full implementation.**

- User needs to SEE something to give feedback
- Implement just the landing/home screen
- Announce: "I'll fill it in with placeholder data first. We'll handle real data storage later when we build out the admin panel together."

**If landing/homepage site:**
- Ask: "Would you like to add fancy scroll effects? (horizontal scroll, section overlay, pin & reveal, etc.)"
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
