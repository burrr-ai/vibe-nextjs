# Feature Pipeline

Functional apps (shopping mall, dashboard, CRUD) — use 4 subagents.

## Flow

1. **Orchestrator defines types** in `src/api/_mock/{domain}/types.ts`
2. **Spawn 3 subagents in parallel:**
   - MOCK → `src/api/_mock/{domain}/`
   - API → `src/api/{domain}/`
   - STATE → `src/state/{domain}/`
3. **After all complete, spawn PAGE subagent** → `src/page/{domain}/`

## Subagent Prompts

Phase 2 (parallel):
```
Task(subagent_type: "general-purpose", prompt: "MOCK: Implement mock data for {domain}. Types: {types}")
Task(subagent_type: "general-purpose", prompt: "API: Implement API layer for {domain}. Types: {types}")
Task(subagent_type: "general-purpose", prompt: "STATE: Implement state for {domain}. Types: {types}")
```

Phase 3 (after phase 2):
```
Task(subagent_type: "general-purpose", prompt: "PAGE: Implement UI for {domain}. Use hooks from state/{domain}")
```

## Rules

- Types first — subagents only need types, not implementations
- Parallel where possible — Mock/API/State have no dependencies on each other
- Page waits — needs state hooks to exist
