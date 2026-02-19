import request from 'supertest';
import { app } from '@/app';
import { testPrisma } from '@/tests/helpers/test-db';
import { Role } from '@/generated/prisma/client';

// ─── Test Fixtures ───────────────────────────────────────────────────────────
const TEST_PASSWORD = 'TestPass123!';

const TEST_EMAILS = {
  admin: 'task-admin@test.local',
  maintainer: 'task-maintainer@test.local',
  anotherMaintainer: 'task-other-maint@test.local',
  member: 'task-member@test.local',
  outsider: 'task-outsider@test.local',
} as const;

// ─── Shared State ────────────────────────────────────────────────────────────
let adminToken: string;
let maintainerToken: string;
let anotherMaintainerToken: string;
let memberToken: string;
let outsiderToken: string;

let adminUserId: string;
let maintainerUserId: string;
let memberUserId: string;

// Single project owned by maintainer; member is added, outsider is not.
let projectId: string;

// Four statuses auto-created with the project
let todoStatusId: string;
let inProgressStatusId: string;
let codeReviewStatusId: string;
let doneStatusId: string;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Registers a user via the public API (defaults to MEMBER), elevates the
 * role via testPrisma, then re-logs-in so the JWT carries the updated role.
 */
async function registerUser(
  email: string,
  firstName: string,
  targetRole: Role,
): Promise<{ userId: string; token: string }> {
  await request(app).post('/api/auth/register').send({
    email,
    password: TEST_PASSWORD,
    firstName,
    lastName: 'Test',
  });

  const user = await testPrisma.user.update({
    where: { email },
    data: { role: targetRole },
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: TEST_PASSWORD });

  return { userId: user.id, token: loginRes.body.data.token };
}

/** Base URL for task operations on the main test project. */
function tasksUrl(pid = projectId) {
  return `/api/projects/${pid}/tasks`;
}

/** Base URL for status operations on the main test project. */
function statusesUrl(pid = projectId) {
  return `/api/projects/${pid}/statuses`;
}

/** Shorthand for POST /api/projects/:id/tasks */
function createTask(
  token: string,
  payload: {
    title: string;
    statusId: string;
    description?: string;
    assigneeId?: string | null;
    order?: number;
  },
  pid = projectId,
) {
  return request(app)
    .post(tasksUrl(pid))
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
}

/**
 * Creates a throwaway project owned by admin, returns its first status ID,
 * then immediately tears down the project so it does not pollute the suite.
 * Used to obtain a valid statusId that belongs to a *different* project.
 */
async function foreignStatusId(): Promise<string> {
  const projectRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Foreign Status Donor Project' });
  const pid: string = projectRes.body.data.id;

  const statusesRes = await request(app)
    .get(`/api/projects/${pid}/statuses`)
    .set('Authorization', `Bearer ${adminToken}`);
  const sid: string = statusesRes.body.data[0].id;

  // Soft-delete the donor project so it is invisible to the application,
  // but keep its task_status rows intact — findStatusById must be able to
  // locate the record so the service can detect the cross-project mismatch
  // and throw badRequest (400) rather than notFound (404).
  await testPrisma.project.update({
    where: { id: pid },
    data: { deletedAt: new Date() },
  });

  return sid;
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Task Integration Tests', () => {
  beforeAll(async () => {
    // Wipe any residual data from a previous interrupted run (FK-ordered).
    const residualUsers = await testPrisma.user.findMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
      select: { id: true },
    });
    const residualOwnerIds = residualUsers.map((u) => u.id);
    const residualProjects = await testPrisma.project.findMany({
      where: { ownerId: { in: residualOwnerIds } },
      select: { id: true },
    });
    const residualProjectIds = residualProjects.map((p) => p.id);
    await testPrisma.task.deleteMany({ where: { projectId: { in: residualProjectIds } } });
    await testPrisma.taskStatus.deleteMany({ where: { projectId: { in: residualProjectIds } } });
    await testPrisma.projectMember.deleteMany({ where: { projectId: { in: residualProjectIds } } });
    await testPrisma.project.deleteMany({ where: { id: { in: residualProjectIds } } });
    await testPrisma.user.deleteMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
    });

    // ── Users ────────────────────────────────────────────────────────────────
    const admin = await registerUser(TEST_EMAILS.admin, 'Admin', Role.ADMIN);
    adminToken = admin.token;
    adminUserId = admin.userId;

    const maintainer = await registerUser(
      TEST_EMAILS.maintainer,
      'Maintainer',
      Role.MAINTAINER,
    );
    maintainerToken = maintainer.token;
    maintainerUserId = maintainer.userId;

    const anotherMaintainer = await registerUser(
      TEST_EMAILS.anotherMaintainer,
      'OtherMaint',
      Role.MAINTAINER,
    );
    anotherMaintainerToken = anotherMaintainer.token;

    const member = await registerUser(TEST_EMAILS.member, 'Member', Role.MEMBER);
    memberToken = member.token;
    memberUserId = member.userId;

    const outsider = await registerUser(TEST_EMAILS.outsider, 'Outsider', Role.MEMBER);
    outsiderToken = outsider.token;

    // ── Project (owned by maintainer) ────────────────────────────────────────
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${maintainerToken}`)
      .send({ name: 'Task Integration Project' });
    projectId = projectRes.body.data.id;

    // Add member to project — outsider deliberately excluded.
    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${maintainerToken}`)
      .send({ userId: memberUserId });

    // ── Resolve default status IDs ────────────────────────────────────────────
    const statusesRes = await request(app)
      .get(statusesUrl())
      .set('Authorization', `Bearer ${maintainerToken}`);

    const statuses: Array<{ id: string; name: string }> = statusesRes.body.data;
    todoStatusId        = statuses.find((s) => s.name === 'TODO')!.id;
    inProgressStatusId  = statuses.find((s) => s.name === 'IN_PROGRESS')!.id;
    codeReviewStatusId  = statuses.find((s) => s.name === 'CODE_REVIEW')!.id;
    doneStatusId        = statuses.find((s) => s.name === 'DONE')!.id;
  });

  afterAll(async () => {
    if (!projectId) return;

    // Collect all projects owned by test users — this covers the main project
    // AND any soft-deleted donor projects created by foreignStatusId().
    const testUsers = await testPrisma.user.findMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
      select: { id: true },
    });
    const ownerIds = testUsers.map((u) => u.id);
    const allProjects = await testPrisma.project.findMany({
      where: { ownerId: { in: ownerIds } },
      select: { id: true },
    });
    const allProjectIds = allProjects.map((p) => p.id);

    // Delete in FK dependency order across all collected projects.
    await testPrisma.task.deleteMany({ where: { projectId: { in: allProjectIds } } });
    await testPrisma.taskStatus.deleteMany({ where: { projectId: { in: allProjectIds } } });
    await testPrisma.projectMember.deleteMany({ where: { projectId: { in: allProjectIds } } });
    await testPrisma.project.deleteMany({ where: { id: { in: allProjectIds } } });
    await testPrisma.user.deleteMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
    });
  });

  // ── GET /api/projects/:id/statuses ──────────────────────────────────────────
  describe('GET /api/projects/:id/statuses — list task statuses', () => {
    it('200 — owner receives the 4 default statuses in ascending order', async () => {
      const res = await request(app)
        .get(statusesUrl())
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(4);

      const names: string[] = res.body.data.map((s: { name: string }) => s.name);
      expect(names).toEqual(['TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'DONE']);
    });

    it('200 — ADMIN can list statuses for any project', async () => {
      const res = await request(app)
        .get(statusesUrl())
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(4);
    });

    it('200 — project member can list statuses', async () => {
      const res = await request(app)
        .get(statusesUrl())
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
    });

    it('403 — outsider (non-member MEMBER) cannot list statuses', async () => {
      const res = await request(app)
        .get(statusesUrl())
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — non-owner MAINTAINER cannot list statuses', async () => {
      const res = await request(app)
        .get(statusesUrl())
        .set('Authorization', `Bearer ${anotherMaintainerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app).get(statusesUrl());
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/projects/:id/statuses ─────────────────────────────────────────
  describe('POST /api/projects/:id/statuses — create task status', () => {
    it('201 — owner creates a custom status with name and hex color', async () => {
      const res = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'BLOCKED', color: '#FF5733', order: 10 });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Task status created successfully.');
      expect(res.body.data.name).toBe('BLOCKED');
      expect(res.body.data.color).toBe('#FF5733');
      expect(res.body.data.projectId).toBe(projectId);
      expect(res.body.data.id).toBeDefined();
    });

    it('201 — ADMIN can create a status on any project', async () => {
      const res = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'ADMIN_CUSTOM' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('ADMIN_CUSTOM');
    });

    it('403 — project member cannot create a status', async () => {
      const res = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'MEMBER_STATUS' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — outsider cannot create a status', async () => {
      const res = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ name: 'OUTSIDER_STATUS' });

      expect(res.status).toBe(403);
    });

    it('400 — rejects an empty name', async () => {
      const res = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a color that is not a valid 6-digit hex', async () => {
      const res = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'VALID_NAME', color: 'red' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app).post(statusesUrl()).send({ name: 'NO_AUTH' });
      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /api/projects/:id/statuses/:statusId ──────────────────────────────
  describe('PATCH /api/projects/:id/statuses/:statusId — update task status', () => {
    let patchTargetId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'PATCH_TARGET', order: 99 });
      patchTargetId = res.body.data.id;
    });

    it('200 — owner can rename and recolor a custom status', async () => {
      const res = await request(app)
        .patch(`${statusesUrl()}/${patchTargetId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'PATCHED', color: '#00FF00' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Task status updated successfully.');
      expect(res.body.data.name).toBe('PATCHED');
      expect(res.body.data.color).toBe('#00FF00');
    });

    it('200 — ADMIN can update any status', async () => {
      const res = await request(app)
        .patch(`${statusesUrl()}/${patchTargetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ order: 50 });

      expect(res.status).toBe(200);
      expect(res.body.data.order).toBe(50);
    });

    it('403 — project member cannot update a status', async () => {
      const res = await request(app)
        .patch(`${statusesUrl()}/${patchTargetId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'MEMBER_RENAME' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — outsider cannot update a status', async () => {
      const res = await request(app)
        .patch(`${statusesUrl()}/${patchTargetId}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ name: 'OUTSIDER_RENAME' });

      expect(res.status).toBe(403);
    });

    it('400 — rejects an empty update body', async () => {
      const res = await request(app)
        .patch(`${statusesUrl()}/${patchTargetId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('404 — returns 404 for a non-existent status ID', async () => {
      const res = await request(app)
        .patch(`${statusesUrl()}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'GHOST' });

      expect(res.status).toBe(404);
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app)
        .patch(`${statusesUrl()}/${patchTargetId}`)
        .send({ name: 'NO_AUTH' });

      expect(res.status).toBe(401);
    });
  });

  // ── DELETE /api/projects/:id/statuses/:statusId ─────────────────────────────
  describe('DELETE /api/projects/:id/statuses/:statusId — delete task status', () => {
    let unusedStatusId: string;
    let inUseStatusId: string;

    beforeAll(async () => {
      // An unused status — will be deleted successfully.
      const unusedRes = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'DELETE_ME_STATUS' });
      unusedStatusId = unusedRes.body.data.id;

      // A status that will be referenced by an active task.
      const inUseRes = await request(app)
        .post(statusesUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'IN_USE_STATUS' });
      inUseStatusId = inUseRes.body.data.id;

      // Create a task that locks the in-use status.
      await createTask(maintainerToken, {
        title: 'In-Use Status Anchor Task',
        statusId: inUseStatusId,
      });
    });

    it('403 — project member cannot delete a status', async () => {
      const res = await request(app)
        .delete(`${statusesUrl()}/${unusedStatusId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — outsider cannot delete a status', async () => {
      const res = await request(app)
        .delete(`${statusesUrl()}/${unusedStatusId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it('409 — owner cannot delete a status that is in use by an active task', async () => {
      const res = await request(app)
        .delete(`${statusesUrl()}/${inUseStatusId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toMatch(/in use/i);
    });

    it('204 — owner can delete an unused custom status', async () => {
      const res = await request(app)
        .delete(`${statusesUrl()}/${unusedStatusId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(204);
    });

    it('404 — returns 404 after the status is already deleted', async () => {
      // unusedStatusId was just permanently deleted above.
      const res = await request(app)
        .delete(`${statusesUrl()}/${unusedStatusId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(404);
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app).delete(`${statusesUrl()}/${inUseStatusId}`);
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/projects/:id/tasks — create task ──────────────────────────────
  describe('POST /api/projects/:id/tasks — create task within project', () => {
    it('201 — project owner creates a minimal task (title + statusId)', async () => {
      const res = await createTask(maintainerToken, {
        title: 'Owner Minimal Task',
        statusId: todoStatusId,
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Task created successfully.');

      const { data } = res.body;
      expect(data.id).toBeDefined();
      expect(data.title).toBe('Owner Minimal Task');
      expect(data.projectId).toBe(projectId);
      expect(data.statusId).toBe(todoStatusId);
      expect(data.status.name).toBe('TODO');
      expect(data.assignee).toBeNull();
      expect(data.createdAt).toBeDefined();
    });

    it('201 — ADMIN creates a task with all optional fields populated', async () => {
      const res = await createTask(adminToken, {
        title: 'Admin Full Task',
        description: 'A detailed description of the task.',
        statusId: inProgressStatusId,
        assigneeId: memberUserId,
        order: 5,
      });

      expect(res.status).toBe(201);

      const { data } = res.body;
      expect(data.title).toBe('Admin Full Task');
      expect(data.description).toBe('A detailed description of the task.');
      expect(data.statusId).toBe(inProgressStatusId);
      expect(data.status.name).toBe('IN_PROGRESS');
      expect(data.assigneeId).toBe(memberUserId);
      expect(data.assignee.email).toBe(TEST_EMAILS.member);
      expect(data.assignee.password).toBeUndefined(); // never exposed
      expect(data.order).toBe(5);
    });

    it('201 — project member can create a task (any accessor may create)', async () => {
      const res = await createTask(memberToken, {
        title: 'Member Created Task',
        statusId: todoStatusId,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.projectId).toBe(projectId);
    });

    it('403 — outsider (non-member MEMBER) cannot create a task', async () => {
      const res = await createTask(outsiderToken, {
        title: 'Outsider Task',
        statusId: todoStatusId,
      });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — non-owner MAINTAINER cannot create a task in a project they do not own', async () => {
      const res = await createTask(anotherMaintainerToken, {
        title: 'Non-Owner Maintainer Task',
        statusId: todoStatusId,
      });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a missing title', async () => {
      const res = await request(app)
        .post(tasksUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ statusId: todoStatusId });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a title exceeding 200 characters', async () => {
      const res = await createTask(maintainerToken, {
        title: 'T'.repeat(201),
        statusId: todoStatusId,
      });

      expect(res.status).toBe(400);
    });

    it('400 — rejects a description exceeding 2000 characters', async () => {
      const res = await createTask(maintainerToken, {
        title: 'Long Desc Task',
        statusId: todoStatusId,
        description: 'D'.repeat(2001),
      });

      expect(res.status).toBe(400);
    });

    it('400 — rejects a missing statusId', async () => {
      const res = await request(app)
        .post(tasksUrl())
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ title: 'No Status Task' });

      expect(res.status).toBe(400);
    });

    it('400 — rejects a non-UUID statusId', async () => {
      const res = await createTask(maintainerToken, {
        title: 'Bad Status ID',
        statusId: 'not-a-uuid',
      });

      expect(res.status).toBe(400);
    });

    it('400 — rejects a statusId that belongs to a different project', async () => {
      const sid = await foreignStatusId();

      const res = await createTask(maintainerToken, {
        title: 'Foreign Status Task',
        statusId: sid,
      });

      // Service throws AppError.badRequest when the status exists but belongs
      // to a different project — HTTP 400, not 404.
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('404 — returns 404 when the project does not exist', async () => {
      const res = await request(app)
        .post('/api/projects/00000000-0000-0000-0000-000000000000/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Ghost Project Task', statusId: todoStatusId });

      expect(res.status).toBe(404);
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app)
        .post(tasksUrl())
        .send({ title: 'No Auth Task', statusId: todoStatusId });

      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/projects/:id/tasks — list tasks ────────────────────────────────
  describe('GET /api/projects/:id/tasks — list tasks with pagination', () => {
    beforeAll(async () => {
      await Promise.all([
        createTask(maintainerToken, { title: 'List Task Alpha', statusId: todoStatusId }),
        createTask(maintainerToken, { title: 'List Task Beta', statusId: inProgressStatusId }),
        createTask(maintainerToken, { title: 'List Task Gamma', statusId: todoStatusId }),
      ]);
    });

    it('200 — returns a paginated ApiResponse with correct meta shape', async () => {
      const res = await request(app)
        .get(tasksUrl())
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.meta).toMatchObject({ page: 1, limit: 10 });
      expect(typeof res.body.data.meta.total).toBe('number');
      expect(typeof res.body.data.meta.totalPages).toBe('number');
      expect(typeof res.body.data.meta.hasNextPage).toBe('boolean');
      expect(typeof res.body.data.meta.hasPreviousPage).toBe('boolean');
    });

    it('200 — ADMIN can list tasks', async () => {
      const res = await request(app)
        .get(tasksUrl())
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeGreaterThan(0);
    });

    it('200 — project member can list tasks', async () => {
      const res = await request(app)
        .get(tasksUrl())
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
    });

    it('403 — outsider cannot list tasks', async () => {
      const res = await request(app)
        .get(tasksUrl())
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — non-owner MAINTAINER cannot list tasks in a project they do not own', async () => {
      const res = await request(app)
        .get(tasksUrl())
        .set('Authorization', `Bearer ${anotherMaintainerToken}`);

      expect(res.status).toBe(403);
    });

    it('200 — ?search=alpha filters by title (case-insensitive)', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}?search=alpha`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeGreaterThan(0);

      const titles: string[] = res.body.data.data.map((t: { title: string }) =>
        t.title.toLowerCase(),
      );
      titles.forEach((t) => expect(t).toContain('alpha'));
    });

    it('200 — ?statusId filter returns only tasks with the specified status', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}?statusId=${inProgressStatusId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeGreaterThan(0);

      const statusIds: string[] = res.body.data.data.map((t: { statusId: string }) => t.statusId);
      statusIds.forEach((s) => expect(s).toBe(inProgressStatusId));
    });

    it('200 — ?limit=2 constrains page size and meta reflects it', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}?limit=2`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeLessThanOrEqual(2);
      expect(res.body.data.meta.limit).toBe(2);
    });

    it('401 — rejects an unauthenticated list request', async () => {
      const res = await request(app).get(tasksUrl());
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/projects/:id/tasks/:taskId ─────────────────────────────────────
  describe('GET /api/projects/:id/tasks/:taskId — get single task', () => {
    let taskId: string;

    beforeAll(async () => {
      const res = await createTask(maintainerToken, {
        title: 'Visibility Test Task',
        statusId: todoStatusId,
      });
      taskId = res.body.data.id;
    });

    it('200 — project owner can retrieve a single task with full shape', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBe(taskId);
      expect(res.body.data.status).toBeDefined();
      expect(res.body.data.status.name).toBe('TODO');
    });

    it('200 — ADMIN can retrieve any task', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(taskId);
    });

    it('200 — project member can retrieve a task', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
    });

    it('403 — outsider cannot retrieve a task', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — non-owner MAINTAINER cannot retrieve a task', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${anotherMaintainerToken}`);

      expect(res.status).toBe(403);
    });

    it('404 — returns 404 for a non-existent task ID', async () => {
      const res = await request(app)
        .get(`${tasksUrl()}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app).get(`${tasksUrl()}/${taskId}`);
      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /api/projects/:id/tasks/:taskId — update / status workflow ─────────
  describe('PATCH /api/projects/:id/tasks/:taskId — update task and status workflow', () => {
    // A single task is mutated by successive tests to verify the full
    // status transition chain: TODO → IN_PROGRESS → CODE_REVIEW → DONE → TODO.
    let workflowTaskId: string;

    beforeAll(async () => {
      const res = await createTask(maintainerToken, {
        title: 'Workflow Task',
        statusId: todoStatusId,
      });
      workflowTaskId = res.body.data.id;
    });

    it('200 — owner advances task from TODO → IN_PROGRESS (first status transition)', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ statusId: inProgressStatusId });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Task updated successfully.');
      expect(res.body.data.statusId).toBe(inProgressStatusId);
      expect(res.body.data.status.name).toBe('IN_PROGRESS');
    });

    it('200 — owner advances task from IN_PROGRESS → CODE_REVIEW', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ statusId: codeReviewStatusId });

      expect(res.status).toBe(200);
      expect(res.body.data.status.name).toBe('CODE_REVIEW');
    });

    it('200 — project member can advance task status CODE_REVIEW → DONE (any accessor may update)', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ statusId: doneStatusId });

      expect(res.status).toBe(200);
      expect(res.body.data.status.name).toBe('DONE');
    });

    it('200 — ADMIN can regress task status back to TODO', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ statusId: todoStatusId });

      expect(res.status).toBe(200);
      expect(res.body.data.status.name).toBe('TODO');
    });

    it('200 — owner can update title and description independently of status', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ title: 'Renamed Workflow Task', description: 'Added description.' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Renamed Workflow Task');
      expect(res.body.data.description).toBe('Added description.');
      // Status unchanged
      expect(res.body.data.status.name).toBe('TODO');
    });

    it('200 — owner assigns a task to the project member', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ assigneeId: memberUserId });

      expect(res.status).toBe(200);
      expect(res.body.data.assigneeId).toBe(memberUserId);
      expect(res.body.data.assignee.email).toBe(TEST_EMAILS.member);
      expect(res.body.data.assignee.password).toBeUndefined();
    });

    it('200 — owner unassigns a task by setting assigneeId to null', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ assigneeId: null });

      expect(res.status).toBe(200);
      expect(res.body.data.assigneeId).toBeNull();
      expect(res.body.data.assignee).toBeNull();
    });

    it('403 — outsider cannot update a task', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ title: 'Hostile Update' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — non-owner MAINTAINER cannot update a task', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${anotherMaintainerToken}`)
        .send({ title: 'Non-Owner Update Attempt' });

      expect(res.status).toBe(403);
    });

    it('400 — rejects an empty update body', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a statusId that belongs to a different project', async () => {
      const sid = await foreignStatusId();

      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ statusId: sid });

      // AppError.badRequest: status exists but belongs to the wrong project.
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('404 — returns 404 for a non-existent task ID', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ title: 'Ghost Update' });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated update request', async () => {
      const res = await request(app)
        .patch(`${tasksUrl()}/${workflowTaskId}`)
        .send({ title: 'No Auth' });

      expect(res.status).toBe(401);
    });
  });

  // ── DELETE /api/projects/:id/tasks/:taskId — soft delete validation ──────────
  describe('DELETE /api/projects/:id/tasks/:taskId — soft delete validation', () => {
    it('403 — project member cannot delete a task (create/read/update only)', async () => {
      const createRes = await createTask(maintainerToken, {
        title: 'Member Delete Guard Task',
        statusId: todoStatusId,
      });
      const taskId: string = createRes.body.data.id;

      const res = await request(app)
        .delete(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — outsider cannot delete a task', async () => {
      const createRes = await createTask(maintainerToken, {
        title: 'Outsider Delete Guard Task',
        statusId: todoStatusId,
      });
      const taskId: string = createRes.body.data.id;

      const res = await request(app)
        .delete(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it('403 — non-owner MAINTAINER cannot delete a task', async () => {
      const createRes = await createTask(maintainerToken, {
        title: 'Non-Owner Delete Guard Task',
        statusId: todoStatusId,
      });
      const taskId: string = createRes.body.data.id;

      const res = await request(app)
        .delete(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${anotherMaintainerToken}`);

      expect(res.status).toBe(403);
    });

    it('204 — project owner soft-deletes a task; task is no longer accessible', async () => {
      const createRes = await createTask(maintainerToken, {
        title: 'Owner Soft Delete Target',
        statusId: todoStatusId,
      });
      const taskId: string = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(deleteRes.status).toBe(204);

      // findById filters deletedAt: null — soft-deleted task must return 404.
      const getRes = await request(app)
        .get(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);
      expect(getRes.status).toBe(404);
    });

    it('204 — ADMIN soft-deletes a task; task is excluded from list results', async () => {
      const createRes = await createTask(maintainerToken, {
        title: 'Admin Soft Delete Target',
        statusId: todoStatusId,
      });
      const taskId: string = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`${tasksUrl()}/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);

      // Verify the task is absent from the paginated list.
      const listRes = await request(app)
        .get(`${tasksUrl()}?search=Admin+Soft+Delete+Target`)
        .set('Authorization', `Bearer ${adminToken}`);

      const ids: string[] = listRes.body.data.data.map((t: { id: string }) => t.id);
      expect(ids).not.toContain(taskId);
    });

    it('404 — returns 404 for a non-existent task ID', async () => {
      const res = await request(app)
        .delete(`${tasksUrl()}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated delete request', async () => {
      const res = await request(app).delete(
        `${tasksUrl()}/00000000-0000-0000-0000-000000000001`,
      );

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });
});
