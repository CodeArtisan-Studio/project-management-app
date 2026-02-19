# Project Management API

A production-ready REST API backend built with **Express.js 5** and **TypeScript**, demonstrating senior-level
architecture patterns including clean module separation, role-based access control, per-project custom workflows, and a
full integration test suite.

Built as a freelance SaaS template — designed to be cloned, extended, and deployed.

---

## Tech Stack

| Layer            | Technology                         |
|------------------|------------------------------------|
| Runtime          | Node.js + TypeScript (strict mode) |
| Framework        | Express.js 5                       |
| ORM              | Prisma 7 (driver adapter pattern)  |
| Database         | PostgreSQL 16                      |
| Validation       | Zod 4                              |
| Authentication   | JWT (jsonwebtoken) + bcrypt        |
| API Docs         | Swagger UI — OpenAPI 3.0.3         |
| Testing          | Jest 30 + Supertest + ts-jest      |
| Containerisation | Docker Compose                     |

---

## Features

- **Authentication** — register and login with JWT issuance; password never exposed in any response
- **Role-based access control** — three roles (`ADMIN`, `MAINTAINER`, `MEMBER`) enforced at both route and service
  layers
- **Project management** — full CRUD, ownership enforcement, soft deletes, pagination, search, and filtering
- **Project membership** — owners manage which `MEMBER` users have access to each project
- **Custom task workflows** — each project defines its own status pipeline (e.g.
  `BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → DEPLOYED`); four defaults are seeded on project creation
- **Task management** — create, assign, reorder, and move tasks across statuses; only owners/admins may delete
- **Soft deletes** — users, projects, and tasks are never hard-deleted; `deletedAt` timestamps allow recovery
- **Swagger UI** — interactive API documentation served at `/api-docs` with full request/response schemas and in-browser
  JWT authentication
- **Integration tests** — real-database test suite with isolated test environment, automatic migrations, and per-test
  cleanup

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database models and enums
│   ├── seed.ts                # Demo dataset (6 users, 4 projects, 26 tasks)
│   └── migrations/            # Versioned SQL migrations
│
├── src/
│   ├── server.ts              # Bootstrap, graceful shutdown
│   ├── app.ts                 # Express setup, middleware, route mounting
│   │
│   ├── config/
│   │   ├── env.ts             # Typed env with required/optional helpers
│   │   ├── prisma.ts          # Singleton Prisma client + pg pool
│   │   └── swagger.ts         # OpenAPI spec + shared component schemas
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # requireAuth, requireRole
│   │   └── error.middleware.ts # Centralised error handler, Prisma error mapping
│   │
│   ├── utils/
│   │   ├── appError.ts        # Custom AppError with factory methods
│   │   └── validate.ts        # Zod validation middleware (body / query / params)
│   │
│   ├── types/index.ts         # ApiResponse<T>, PaginatedResponse<T>, req.user augmentation
│   │
│   ├── modules/
│   │   ├── auth/              # Register, login
│   │   ├── user/              # Profile, admin user list, soft delete
│   │   ├── project/           # Project CRUD + member management
│   │   └── task/              # Task CRUD + per-project status management
│   │
│   └── tests/
│       ├── jest.setup-env.ts  # Loads .env.test before any module is imported
│       ├── jest.setup.ts      # Global afterAll disconnect hooks
│       ├── global.setup.ts    # Runs prisma migrate deploy on test DB
│       └── helpers/test-db.ts # Standalone test Prisma client
│
├── docker-compose.yml
├── jest.config.ts
├── tsconfig.json              # Production build (excludes test files)
└── tsconfig.test.json         # Test build (includes test files, noEmit)
```

Each module follows the same four-layer pattern:

```
routes → controller → service → repository
```

- **Routes** — middleware chain, Zod validation, no business logic
- **Controller** — HTTP plumbing only (parse params, call service, format response)
- **Service** — all authorization guards and business rules
- **Repository** — all Prisma queries, typed via `Prisma.ModelGetPayload`

---

## Data Model

```
User ──< Project          (owner)
User ──< ProjectMember >── Project   (membership)
User ──< Task             (assignee)

Project ──< TaskStatus    (custom per-project pipeline)
Project ──< Task
Task >── TaskStatus
```

### Roles

| Role         | Capabilities                                                 |
|--------------|--------------------------------------------------------------|
| `ADMIN`      | Full access to all resources                                 |
| `MAINTAINER` | Creates and owns projects; manages members and task statuses |
| `MEMBER`     | Reads and creates/updates tasks in projects they belong to   |

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path             | Access | Description                 |
|--------|------------------|--------|-----------------------------|
| `POST` | `/auth/register` | Public | Create account, returns JWT |
| `POST` | `/auth/login`    | Public | Authenticate, returns JWT   |

### Users

| Method   | Path         | Access   | Description                 |
|----------|--------------|----------|-----------------------------|
| `GET`    | `/users/me`  | Any auth | Get own profile             |
| `PATCH`  | `/users/me`  | Any auth | Update own profile          |
| `GET`    | `/users`     | ADMIN    | Paginated list of all users |
| `DELETE` | `/users/:id` | ADMIN    | Soft-delete a user          |

### Projects

| Method   | Path            | Access            | Description                               |
|----------|-----------------|-------------------|-------------------------------------------|
| `POST`   | `/projects`     | MAINTAINER, ADMIN | Create project (seeds 4 default statuses) |
| `GET`    | `/projects`     | Any auth          | Paginated list (scoped by role)           |
| `GET`    | `/projects/:id` | Any auth          | Get project (scoped by role)              |
| `PATCH`  | `/projects/:id` | Owner, ADMIN      | Update project                            |
| `DELETE` | `/projects/:id` | Owner, ADMIN      | Soft-delete project                       |

### Project Members

| Method   | Path                            | Access               | Description            |
|----------|---------------------------------|----------------------|------------------------|
| `GET`    | `/projects/:id/members`         | Owner, ADMIN, Member | List members           |
| `POST`   | `/projects/:id/members`         | Owner, ADMIN         | Add a MEMBER-role user |
| `DELETE` | `/projects/:id/members/:userId` | Owner, ADMIN         | Remove a member        |

### Task Statuses

| Method   | Path                               | Access               | Description                      |
|----------|------------------------------------|----------------------|----------------------------------|
| `GET`    | `/projects/:id/statuses`           | Owner, ADMIN, Member | List statuses (ordered)          |
| `POST`   | `/projects/:id/statuses`           | Owner, ADMIN         | Add a custom status              |
| `PATCH`  | `/projects/:id/statuses/:statusId` | Owner, ADMIN         | Rename, recolour, reorder        |
| `DELETE` | `/projects/:id/statuses/:statusId` | Owner, ADMIN         | Delete (blocked if tasks use it) |

### Tasks

| Method   | Path                          | Access               | Description                 |
|----------|-------------------------------|----------------------|-----------------------------|
| `GET`    | `/projects/:id/tasks`         | Owner, ADMIN, Member | Paginated list with filters |
| `POST`   | `/projects/:id/tasks`         | Owner, ADMIN, Member | Create task                 |
| `GET`    | `/projects/:id/tasks/:taskId` | Owner, ADMIN, Member | Get task                    |
| `PATCH`  | `/projects/:id/tasks/:taskId` | Owner, ADMIN, Member | Update task or move status  |
| `DELETE` | `/projects/:id/tasks/:taskId` | Owner, ADMIN         | Soft-delete task            |

### Pagination & Filtering

List endpoints accept query parameters:

```
GET /api/projects?page=1&limit=10&search=platform&status=ACTIVE&sortBy=createdAt&sortOrder=desc
GET /api/projects/:id/tasks?page=1&limit=20&statusId=<uuid>&assigneeId=<uuid>&sortBy=order&sortOrder=asc
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### 1. Clone and install

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Start databases

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port `5432` and MongoDB 7 on port `27017`.

### 3. Configure environment

```bash
cp .env.example .env
```

The defaults in `.env.example` match the Docker Compose credentials — no changes needed for local development.

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Seed demo data

```bash
npm run seed
```

Creates 6 users, 4 projects, custom task status pipelines, and 26 tasks.

### 6. Start the dev server

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

---

## Environment Variables

| Variable               | Required | Default       | Description                           |
|------------------------|----------|---------------|---------------------------------------|
| `DATABASE_URL`         | Yes      | —             | PostgreSQL connection string          |
| `JWT_SECRET`           | Yes      | —             | Secret used to sign tokens            |
| `JWT_EXPIRES_IN`       | No       | `1d`          | Token lifetime                        |
| `PORT`                 | No       | `3000`        | HTTP port                             |
| `NODE_ENV`             | No       | `development` | `development` / `production` / `test` |
| `CORS_ORIGIN`          | No       | `*`           | Allowed CORS origin                   |
| `RATE_LIMIT_WINDOW_MS` | No       | `900000`      | Rate limit window (ms)                |
| `RATE_LIMIT_MAX`       | No       | `100`         | Max requests per window               |
| `MONGO_URI`            | No       | —             | MongoDB URI (optional)                |

---

## Demo Accounts

After running the seed, these accounts are available:

| Role       | Email           | Password    |
|------------|-----------------|-------------|
| ADMIN      | `admin@pma.dev` | `Admin123!` |
| MAINTAINER | `alice@pma.dev` | `Alice123!` |
| MAINTAINER | `bob@pma.dev`   | `Bob123!`   |
| MEMBER     | `carol@pma.dev` | `Carol123!` |
| MEMBER     | `dave@pma.dev`  | `Dave123!`  |
| MEMBER     | `eve@pma.dev`   | `Eve123!`   |

---

## API Documentation

Swagger UI is served at **`http://localhost:3000/api-docs`**.

To test protected endpoints:

1. Call `POST /api/auth/login` with any demo account
2. Copy the `token` from the response
3. Click **Authorize** in Swagger UI and enter `Bearer <token>`

All endpoints, request bodies, response schemas, and error codes are documented interactively.

---

## Scripts

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript to dist/
npm run start            # Run compiled build

npm test                 # Run integration tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report

npm run migration:generate -- <Name>   # Create a new migration
npm run migration:run                  # Apply pending migrations
npm run migration:revert               # Reset all migrations
npm run seed                           # Seed demo data

npm run lint             # Lint source files
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format with Prettier
npm run prisma:generate  # Regenerate Prisma client
```

---

## Testing

Integration tests run against a real, isolated `project_management_test` database.

### One-time setup

```bash
# Create the test database
docker exec pma_postgres psql -U pma_user -d project_management -c "CREATE DATABASE project_management_test;"
```

### Run tests

```bash
npm test
```

Jest automatically applies Prisma migrations to the test database before the suite runs. Each test cleans up only the
rows it creates — the rest of the test database is left intact for fast re-runs.

```
PASS src/modules/auth/__tests__/auth.integration.test.ts
  Auth Integration Tests
    POST /api/auth/register
      ✓ 201 — registers user and returns ApiResponse with user + token
      ✓ 409 — rejects duplicate email
      ✓ 400 — rejects missing required fields
      ✓ 400 — rejects invalid email format
      ✓ 400 — rejects password shorter than 8 characters
      ✓ 400 — rejects empty firstName
    POST /api/auth/login
      ✓ 200 — authenticates with valid credentials
      ✓ 401 — rejects incorrect password
      ✓ 401 — rejects non-existent email
      ✓ 400 — rejects missing password
      ✓ 400 — rejects invalid email format

Tests: 11 passed, 11 total
```

---

## Architecture Notes

**Authorization is enforced at the service layer**, not just at the route level. Routes handle middleware composition;
services own all business rules and guard checks. This prevents authorization from being bypassed by internal
service-to-service calls.

**IDOR protection** — every task operation cross-checks that `task.projectId === projectId` from the route parameter to
prevent a user from accessing tasks in a project they have access to by guessing task IDs from other projects.

**Prisma type safety** — repository types are derived with `Prisma.ModelGetPayload<{ select: typeof select }>` rather
than manual interface duplication. Changing a select shape updates the type automatically.

**Test env isolation** — `setupFiles` in Jest loads `.env.test` before any module is imported. When `env.ts` later calls
`dotenv.config()`, all variables are already set and dotenv's no-override behaviour preserves the test values throughout
the suite.
