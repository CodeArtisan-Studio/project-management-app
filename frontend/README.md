# ProjectFlow — Frontend

A production-grade project management SaaS frontend built with **Next.js 15 (App Router)**, **React 19**, and **TypeScript**. Designed as a portfolio-quality reference implementation demonstrating senior-level architecture, clean layering, and real-world SaaS patterns.

> **Monorepo context:** This is the `frontend/` workspace. The companion backend (Express + Prisma + PostgreSQL) lives in `backend/`.

---

## Business Purpose

ProjectFlow is a multi-tenant project management platform that gives teams visibility into their work across three dimensions:

- **Execution** — Kanban boards with custom statuses and drag-and-drop task management
- **Collaboration** — per-project member management with role-based access (Admin / Maintainer / Member)
- **Intelligence** — analytics dashboards and filterable reports surfacing completion rates, activity trends, and workload distribution

The codebase is architected as a reusable SaaS template for freelance client delivery and is optimised for maintainability over time.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI Library | React | 19 |
| Language | TypeScript (strict) | 5 |
| Styling | Tailwind CSS | 3 |
| Server state | TanStack React Query | 5 |
| HTTP client | Axios | 1.7 |
| Forms | React Hook Form + Zod | 7 / 3 |
| Charts | Recharts | 3 |
| Drag and drop | @hello-pangea/dnd | 18 |
| Linting | ESLint + TypeScript ESLint | 9 / 8 |
| Formatting | Prettier + prettier-plugin-tailwindcss | 3 |

---

## Features

### Authentication
- Registration and login with JWT
- Dual token storage: `localStorage` for Axios interceptor, same-site cookie for Next.js middleware
- Global 401 handler — automatic logout and redirect on token expiry
- Server-side route protection via `src/middleware.ts`

### Dashboard
- KPI summary cards: total projects, total tasks, tasks completed this week, tasks created last 30 days, completion rate
- Task status donut chart with custom HTML legend (avoids SVG clipping)
- 30-day activity trend area chart
- 7-day daily activity bar chart (zero-filled for missing days)
- Recent projects grid

### Projects
- Paginated project list with search, status filter, and sort controls
- Create / update / delete projects
- Project status lifecycle: `ACTIVE → COMPLETED → ARCHIVED`
- Per-project member management: add and remove members by email search

### Tasks
- Drag-and-drop Kanban board per project (`@hello-pangea/dnd`)
- Custom task statuses — create, reorder, and delete columns per project
- Task detail modal: edit title, description, assignee, status, and priority
- Optimistic updates on drag-and-drop reorder

### Activity
- Workspace-wide activity timeline with infinite scroll
- Filterable by project and action type
- Relative timestamps with human-readable labels

### Reports
- Date range filter (from / to) and project scope dropdown
- Completion rate ring gauge with animated SVG `stroke-dasharray`
- Activity over time line chart (day granularity, scoped to filter range)
- Tasks by project horizontal bar chart (top 10, sorted by total)
- Tasks by assignee horizontal bar chart with Unassigned fallback

---

## Architecture

The frontend follows a **feature-based, layered architecture**. Code is organised by domain rather than file type, with a strict separation between data fetching, business logic, and presentation.

```
┌─────────────────────────────────────┐
│             Next.js Pages           │  app/(dashboard)/**  app/(auth)/**
├─────────────────────────────────────┤
│          Page Containers            │  features/**/components/*Container.tsx
│   (hooks composition, no JSX logic) │
├─────────────────────────────────────┤
│      Presentation Components        │  features/**/components/*.tsx
│    (pure UI, props-driven, tested)  │  components/ui/**   components/layout/**
├─────────────────────────────────────┤
│           Custom Hooks              │  features/**/hooks/**   hooks/**
│    (React Query, form state, UI)    │
├─────────────────────────────────────┤
│           Services Layer            │  services/*.service.ts
│      (all Axios calls live here)    │
├─────────────────────────────────────┤
│          Axios Instance             │  services/api.ts
│  (base URL, JWT interceptor, 401)   │
└─────────────────────────────────────┘
```

### Key Principles

- **No API calls in components.** All network requests go through `services/` and are consumed via React Query hooks.
- **Container / Presentation split.** `*Container.tsx` files own data fetching and state. Sibling presentational components receive typed props only.
- **React Query for all server state.** Local `useState` is reserved for UI-only state (modals open, form toggles). No custom fetch logic or `useEffect` data fetching.
- **TypeScript strict mode, zero `any`.** All API response shapes are explicitly typed and match backend DTO contracts.
- **Zod at the boundary.** Form schemas are defined with Zod, validated by `@hookform/resolvers`, and shared between client-side validation and type inference.

---

## Folder Structure

```
frontend/src/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, Register — public route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Protected route group
│   │   ├── layout.tsx            # Auth guard + Sidebar shell
│   │   ├── dashboard/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── reports/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx                # Root layout: QueryProvider + AuthProvider
│   └── globals.css
│
├── features/                     # Feature modules (domain-scoped)
│   ├── auth/
│   │   ├── components/           # LoginForm, RegisterForm (presentation)
│   │   ├── hooks/                # useLoginForm, useRegisterForm
│   │   ├── schemas/              # Zod schemas
│   │   └── types/
│   ├── dashboard/
│   │   ├── components/           # DashboardPageContainer, ChartCard, charts
│   │   └── hooks/                # useDashboardStats
│   ├── project/
│   │   ├── components/           # ProjectListContainer, ProjectCard, modals
│   │   ├── hooks/                # useProjects, useCreateProject, etc.
│   │   ├── schemas/
│   │   └── types/
│   ├── task/
│   │   ├── components/           # KanbanBoardContainer, KanbanCard, modals
│   │   ├── hooks/                # useTasks, useKanbanBoard, useStatusManager
│   │   ├── schemas/
│   │   └── types/
│   ├── activity/
│   │   ├── components/           # ActivityTimelineContainer, ActivityItem
│   │   ├── hooks/
│   │   └── types/
│   └── report/
│       ├── components/           # ReportsPageContainer, chart components
│       ├── hooks/                # useReport (all report queries)
│       └── types/                # Typed API response interfaces
│
├── components/
│   ├── layout/                   # Header, Sidebar, PageContainer
│   └── ui/                       # Button, Input, Modal, Badge, Skeleton, Spinner
│
├── services/                     # API layer — one file per backend module
│   ├── api.ts                    # Axios instance, JWT interceptor, 401 handler
│   ├── auth.service.ts
│   ├── project.service.ts
│   ├── task.service.ts
│   ├── activity.service.ts
│   ├── report.service.ts
│   ├── dashboard.service.ts
│   └── user.service.ts
│
├── providers/
│   ├── AuthProvider.tsx           # Global auth state (user, isAuthenticated)
│   ├── QueryProvider.tsx          # TanStack React Query client
│   └── SidebarProvider.tsx        # Sidebar open/collapsed state
│
├── hooks/                         # Shared hooks (not feature-specific)
│   ├── useDebounce.ts
│   └── useUsers.ts
│
├── constants/
│   ├── query-keys.ts              # Centralised React Query key factory
│   └── routes.ts                  # Typed route constants
│
├── lib/
│   ├── token.ts                   # localStorage read/write helpers
│   └── utils.ts                   # cn(), getInitials(), getApiErrorMessage()
│
├── types/
│   ├── api.types.ts               # ApiResponse, PaginatedResponse
│   ├── user.types.ts
│   └── globals.d.ts               # JSX namespace shim (React 19 compat)
│
└── middleware.ts                  # Server-side auth cookie check
```

---

## Authentication Flow

```
1. User submits login form
       │
2. POST /api/auth/login → { user, token }
       │
3. Token written to:
   ├── localStorage         (read by Axios interceptor on every request)
   └── auth_token cookie    (read by Next.js middleware for SSR route protection)
       │
4. AuthProvider stores user object in React context
       │
5. Protected routes: middleware.ts checks auth_token cookie
   └── Missing → redirect to /login (server-side, no client flash)
       │
6. On 401 response: Axios interceptor clears token + redirects to /login
```

Token storage uses the dual-storage pattern intentionally: Axios cannot read `httpOnly` cookies, so the token is also kept in `localStorage` for the request interceptor. The cookie is `same-site` (not `httpOnly`) so the middleware can inspect it without a round-trip to the API.

---

## Dashboard & Reports

### Dashboard (`/dashboard`)

Fetches three independent React Query subscriptions (summary report, completion rate, 30-day activity trend) and renders them in parallel. Charts use Recharts inside `ChartCard` wrappers that handle loading skeletons and error states declaratively.

### Reports (`/reports`)

Filter state is held in a single `ReportFilters` object (`useState`) and memoised into query params via `useMemo` before being passed to four React Query hooks. When any filter changes, only queries whose key has changed refetch — unaffected charts remain cached.

| Chart | API endpoint | Visualisation |
|---|---|---|
| Completion rate | `GET /reports/completion-rate` | SVG ring gauge (stroke-dasharray) |
| Activity over time | `GET /reports/activity-over-time` | Area chart |
| Tasks by project | `GET /reports/tasks-by-project` | Horizontal bar chart |
| Tasks by assignee | `GET /reports/tasks-by-assignee` | Horizontal bar chart |

---

## Environment Setup

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

The backend must be running on port `3000`. The frontend runs on port `3001`.

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format with Prettier
npm run format
```

---

## React Query Key Conventions

All query keys are defined in `src/constants/query-keys.ts` using a factory pattern. This ensures consistent cache invalidation across mutations and prevents key drift.

```ts
// Parameterised keys include their params for automatic re-fetch on filter change
QUERY_KEYS.reports.tasksByProject({ from, to, projectId })
QUERY_KEYS.projects.list({ page, limit, search, status })
```

---

## Type Safety Notes

- **`src/types/globals.d.ts`** re-declares the global `JSX` namespace from `React.JSX`. Required because React 19 removed the global namespace; without it, `JSX.Element` return type annotations fail with TS2503.
- All service functions return fully typed promises. The `apiGet<T>` / `apiPost<T>` helpers in `services/api.ts` extract `response.data.data` from the backend envelope `{ status, data }` before returning.
- Form types are inferred from Zod schemas via `z.infer<typeof Schema>` — no manual duplication of field types.
