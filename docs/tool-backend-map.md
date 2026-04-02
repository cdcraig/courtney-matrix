# Tool → Backend Map

Documents how frontend actions map to server-side API endpoints.

## Active Endpoints

| Tool / Action | Method | Endpoint | Description |
|---|---|---|---|
| Load tasks | `GET` | `/api/tasks` | Fetch all task data |
| Update task status | `PATCH` | `/api/tasks/:id` | Update a single task's RAG status or metadata |

## Removed Tools

### `pause` / `resume` — Removed 2026-04-01

**Reason:** Incompatible with v3 API. These tools were pointing to stale v1/v2 endpoints that no longer exist in the current server.

**Previous mappings (no longer valid):**

| Tool | Method | Stale Endpoint |
|---|---|---|
| `pause` | `POST` | `/api/v1/tasks/:id/pause` |
| `resume` | `POST` | `/api/v2/tasks/:id/resume` |

**Details:**
- The v1/v2 pause and resume endpoints were never migrated to v3. The v3 API uses a unified `PATCH /api/tasks/:id` with a `status` field instead of discrete pause/resume actions.
- Calls to these removed endpoints would return `404` from the current Express server.
- Any code referencing these tools should be updated to use `PATCH /api/tasks/:id` with `{ status: "paused" }` or `{ status: "active" }`.
