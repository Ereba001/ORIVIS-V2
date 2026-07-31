# ORIVIS V2 — Agent Instructions

## Context
We are building ORIVIS V2, a full UI redesign of the Orivis platform. It is a **Vite + React SPA** living in `ORIVIS-V2-UI/`, consuming a Laravel backend in `../backend/`.

## Key References
- `../backend/` — Laravel API (Served at `http://localhost:8000/api/v1`)
- `../backend/docs/` — Backend architecture and phase summaries
- `../backend/routes/api.php` → `api_v1.php` — API route definitions
- `src/constants/api.ts` — API endpoint definitions
- `src/constants/routes.ts` — Route definitions

## Development Workflow

**Layer 1 — Directives (`directives/`)**
SOPs in Markdown defining goals, inputs, outputs, edge cases.

**Layer 2 — Orchestration (this agent)**
Read directives, call tools in order, handle errors, self-anneal.

**Layer 3 — Execution**
Deterministic scripts when available. Prefer tools over manual work.

## Context Management
This project uses:
- `opencode.json` — auto-compaction at 20 tail turns
- `context-watch` MCP server — session tracking & checkpoints
- `context-management` skill — guidelines for long sessions

Use `save_checkpoint` at phase boundaries. Run `session_status` every ~15-20 messages.
