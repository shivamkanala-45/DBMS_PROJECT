# API Documentation — Campus Gardening Management System

Internal Client API Engine (`js/api.js`).

All request/response payloads are JSON objects. List endpoints return:
```json
{ "data": [ ... ], "pagination": { "page": 1, "limit": 6, "totalCount": 42, "totalPages": 7 } }
```
Lookup endpoints (categories, vendors, irrigation-types) return arrays directly.

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/login` | — | `{ username, password }` | Returns `{ token, user }` |
| GET | `/auth/me` | ✅ | — | Returns the current logged-in user |

---

## Dashboard

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | — | `{ total_plants, total_workers, total_areas, open_tasks, low_stock_items }` |
| GET | `/dashboard/low-stock` | — | Inventory rows at/below reorder level |
| GET | `/dashboard/overdue-tasks` | — | Tasks past due_date, not completed |
| GET | `/dashboard/plants-per-area` | — | `[{ area_name, plant_count }]` |
| GET | `/dashboard/task-status-breakdown` | — | `[{ status, count }]` |

---

## Plants

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| GET | `/plants` | — | — | Query params: `search, category_id, area_id, status, sort, order, page, limit` |
| GET | `/plants/:id` | — | — | Single plant, with resolved category/area/worker/irrigation names + their raw IDs |
| POST | `/plants` | ✅ | `{ name, category_id, area_id, assigned_worker_id, irrigation_type_id, date_planted, status }` | `name` required |
| PUT | `/plants/:id` | ✅ | same as POST | Full update |
| DELETE | `/plants/:id` | ✅ | — | Cascades to that plant's health records / schedules |

`status` must be one of: `Healthy`, `Needs Attention`, `Diseased`, `Dead`.

---

## Workers

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/workers` | — | Query: `search, role, sort, order, page, limit` |
| GET | `/workers/:id` | — | — |
| POST | `/workers` | ✅ | `{ full_name, role, is_volunteer, date_of_birth, contact_phone, email, salary, hire_date, is_active }` |
| PUT | `/workers/:id` | ✅ | same as POST |
| DELETE | `/workers/:id` | ✅ | — |

---

## Garden Areas

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/garden-areas` | — | Query: `search, has_signboard, sort, order, page, limit` |
| GET | `/garden-areas/:id` | — | Includes live `plant_count` |
| POST | `/garden-areas` | ✅ | `{ name, area_sqft, has_signboard, description }` — `name` unique |
| PUT | `/garden-areas/:id` | ✅ | same as POST |
| DELETE | `/garden-areas/:id` | ✅ | — |

---

## Gardening Tasks

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/tasks` | — | Query: `search, status, priority, area_id, assigned_worker_id, sort, order, page, limit` |
| GET | `/tasks/:id` | — | — |
| POST | `/tasks` | ✅ | `{ title, description, area_id, assigned_worker_id, status, priority, due_date }` |
| PUT | `/tasks/:id` | ✅ | same as POST |
| PATCH | `/tasks/:id/status` | ✅ | `{ status }` — lightweight status-only update for the Kanban board |
| DELETE | `/tasks/:id` | ✅ | — |

`status`: `Pending`, `In Progress`, `Completed`, `Overdue`.
`priority`: `Low`, `Medium`, `High`.

---

## Plant Inventory

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/inventory` | — | Query: `category_id, area_id, low_stock=true, sort, order, page, limit` |
| GET | `/inventory/:id` | — | — |
| POST | `/inventory` | ✅ | `{ category_id, area_id, quantity, unit, reorder_level, last_restocked }` |
| PUT | `/inventory/:id` | ✅ | same as POST |
| DELETE | `/inventory/:id` | ✅ | — |

---

## Tools

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/tools` | — | Query: `search, condition, vendor_id, sort, order, page, limit` |
| GET | `/tools/:id` | — | Includes `assignment_history` |
| POST | `/tools` | ✅ | `{ name, material, vendor_id, cost, warranty_months, purchase_date, condition }` |
| PUT | `/tools/:id` | ✅ | same as POST |
| DELETE | `/tools/:id` | ✅ | — |
| POST | `/tools/:id/assign` | ✅ | `{ worker_id }` — calls the `sp_assign_tool` stored procedure |

`condition`: `Good`, `Needs Repair`, `Retired`.

---

## Events

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/events` | — | Query: `search, area_id, upcoming=true|false, sort, order, page, limit` |
| GET | `/events/:id` | — | — |
| POST | `/events` | ✅ | `{ title, description, area_id, event_date, duration_hours, fee }` |
| PUT | `/events/:id` | ✅ | same as POST |
| DELETE | `/events/:id` | ✅ | — |

---

## Lookup tables (for populating dropdowns)

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/categories` | — | Plain array of `{ category_id, name, description }` |
| POST | `/categories` | ✅ | `{ name, description }` |
| GET | `/vendors` | — | Plain array |
| POST | `/vendors` | ✅ | `{ name, contact_phone, city, performance_rating }` |
| GET | `/irrigation-types` | — | Plain array of `{ irrigation_type_id, type_name, water_usage_level }` |

---

## Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | ✅ | Latest 50 for the logged-in user |
| PATCH | `/notifications/:id/read` | ✅ | Marks one notification as read |

Notifications are mostly generated automatically by database triggers
(low stock, task assigned) — this is a read/acknowledge API, not a
create API.

---

## Error format

Every error response looks like:
```json
{ "error": "Human-readable message" }
```

| Status | Meaning |
|---|---|
| 400 | Validation failed (missing required field, bad value) |
| 401 | Missing/invalid/expired token |
| 403 | Valid token, but account deactivated |
| 404 | Resource not found |
| 409 | Unique constraint violation (e.g. duplicate garden area name) |
| 500 | Unexpected server/database error |

---

## Not yet implemented

These tables exist in the schema but don't have REST endpoints yet
(planned for a future pass): `tool_assignments` (direct CRUD — currently
only reachable via `/tools/:id/assign`), `watering_schedules`,
`fertilizers`, `fertilizer_schedules`, `maintenance_logs`,
`plant_health_records`. Hitting these paths currently returns `501 Not
Implemented`.
