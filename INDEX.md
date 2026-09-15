# Project Index — Leadership Training Dashboard

A Food Court FY2025 team-member survey dashboard: a FastAPI backend serving hardcoded
survey data, and a React frontend that renders it as a leadership coaching tool
(scores, strengths/weaknesses, action plans, coaching guides).

## Stack

- **Backend**: FastAPI + Motor (async MongoDB client, currently unused by any endpoint —
  all data is hardcoded in `SURVEY_DATA`), Pydantic models. Entry point: [backend/server.py](backend/server.py).
- **Frontend**: React 19 + react-router-dom, axios, Tailwind, shadcn/ui (Radix-based)
  components under `frontend/src/components/ui/`. Entry point: [frontend/src/App.js](frontend/src/App.js).
  Built/served via CRACO ([frontend/craco.config.js](frontend/craco.config.js)).

## Backend — [backend/server.py](backend/server.py)

All routes are under `/api` (`api_router`, prefix set at [backend/server.py:26](backend/server.py#L26)).

| Route | Purpose |
|---|---|
| `GET /api/` | Health/welcome message |
| `GET /api/survey/overview` | Aggregate metrics: engagement score, top strengths/concerns |
| `GET /api/survey/categories` | All survey categories with questions + coaching data |
| `GET /api/survey/category/{category_id}` | Single category detail |
| `GET /api/survey/strengths` | Categories flagged `strength`, sorted by score |
| `GET /api/survey/weaknesses` | Categories flagged `critical`/`moderate`, with critical questions |
| `GET /api/survey/action-plans` | Static leadership action-plan framework (daily/weekly/monthly habits) |
| `GET /api/survey/coaching-guides` | Static conversation-guide content per focus area |

Data models: `SurveyQuestion`, `CategoryData`, `OverviewMetrics`, `CoachingGuide` ([backend/server.py:33-68](backend/server.py#L33-L68)).
Survey content lives in the `SURVEY_DATA` dict ([backend/server.py:75-574](backend/server.py#L75-L574)) — 10 categories
(pride_in_company, teamwork_collaboration, performance_management, growth_development,
manager_relationship, empowerment, resources_support, recognition_reward, trust).

Requires env vars `MONGO_URL`, `DB_NAME` (loaded from `backend/.env`, not committed),
`CORS_ORIGINS` optional. See [backend/requirements.txt](backend/requirements.txt).

## Frontend — [frontend/src/App.js](frontend/src/App.js)

Single-file app with 5 routed pages, all in `App.js`:

| Route | Component | Purpose |
|---|---|---|
| `/` | `Dashboard` | Hero stats + top strengths/concerns + category grid |
| `/category/:categoryId` | `CategoryDetail` | Per-category questions, scores vs. norms, coaching tips, action items |
| `/analysis` | `Analysis` | Full strengths vs. weaknesses breakdown |
| `/action-plans` | `ActionPlans` | Coaching framework tabs (daily/weekly/monthly) + priority actions |
| `/coaching-guides` | `CoachingGuides` | Conversation-starter guides per focus area |

Talks to the backend via `axios` using `REACT_APP_BACKEND_URL` env var + `/api` suffix
([frontend/src/App.js:29-30](frontend/src/App.js#L29-L30)).

UI primitives: `frontend/src/components/ui/*.jsx` (shadcn/ui set — card, button, badge,
tabs, alert, progress, separator, etc.). Shared utility: [frontend/src/lib/utils.js](frontend/src/lib/utils.js).
Toast hook: [frontend/src/hooks/use-toast.js](frontend/src/hooks/use-toast.js).

## Other

- [test_result.md](test_result.md) — test run notes (check before assuming test coverage).
- [tests/__init__.py](tests/__init__.py) — empty test package placeholder, no tests written yet.
- `.emergent/emergent.yml` — config from the Emergent.sh scaffold this project was generated from.
- `frontend/plugins/` — custom CRACO plugins for health-check endpoints and visual-edit dev tooling.

## Running locally

```bash
# backend
cd backend && pip install -r requirements.txt && uvicorn server:app --reload

# frontend
cd frontend && yarn install && yarn start
```

Needs `backend/.env` (MONGO_URL, DB_NAME) and `frontend/.env` (REACT_APP_BACKEND_URL) —
neither is committed.
