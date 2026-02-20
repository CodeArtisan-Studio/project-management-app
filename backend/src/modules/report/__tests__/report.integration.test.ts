import request from 'supertest';
import { app } from '@/app';
import { testPrisma } from '@/tests/helpers/test-db';
import { Role } from '@/generated/prisma/client';

// ─── Test Fixtures ────────────────────────────────────────────────────────────
const TEST_PASSWORD = 'TestPass123!';

const TEST_EMAILS = {
  admin:       'report-admin@test.local',
  maintainer:  'report-maintainer@test.local',
  member:      'report-member@test.local',
  outsider:    'report-outsider@test.local',
} as const;

// ─── Shared State ─────────────────────────────────────────────────────────────
let adminToken:      string;
let maintainerToken: string;
let memberToken:     string;
let outsiderToken:   string;

let adminUserId:      string;
let maintainerUserId: string;
let memberUserId:     string;

// Two projects — member is added to projectId, not to otherProjectId
let projectId:      string;
let otherProjectId: string;

// Status IDs for the main project (auto-created with project)
let todoStatusId:       string;
let inProgressStatusId: string;
let doneStatusId:       string;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Registers a user via the public API, elevates the role via testPrisma,
 * then re-logs-in so the JWT carries the updated role claim.
 */
async function registerUser(
  email:      string,
  firstName:  string,
  targetRole: Role,
): Promise<{ userId: string; token: string }> {
  await request(app).post('/api/auth/register').send({
    email,
    password:  TEST_PASSWORD,
    firstName,
    lastName:  'Test',
  });

  const user = await testPrisma.user.update({
    where: { email },
    data:  { role: targetRole },
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: TEST_PASSWORD });

  return { userId: user.id, token: loginRes.body.data.token };
}

/** POST a task into the project and return its ID. */
async function createTask(
  statusId: string,
  title:    string,
  assigneeId?: string,
): Promise<string> {
  const res = await request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${maintainerToken}`)
    .send({ title, statusId, ...(assigneeId ? { assigneeId } : {}) });
  return res.body.data.id as string;
}

// ─── Suite Setup ──────────────────────────────────────────────────────────────

beforeAll(async () => {
  // ── Pre-cleanup: purge any leftover data from aborted prior runs ──────────
  // This ensures we start from a clean slate even if afterAll never ran.
  const testEmails = Object.values(TEST_EMAILS);
  const leftoverUsers = await testPrisma.user.findMany({
    where: { email: { in: testEmails } },
    select: { id: true },
  });
  const leftoverUserIds = leftoverUsers.map((u) => u.id);

  if (leftoverUserIds.length > 0) {
    const leftoverProjects = await testPrisma.project.findMany({
      where: { ownerId: { in: leftoverUserIds } },
      select: { id: true },
    });
    const leftoverProjectIds = leftoverProjects.map((p) => p.id);

    if (leftoverProjectIds.length > 0) {
      await testPrisma.activity.deleteMany({ where: { projectId: { in: leftoverProjectIds } } });
      await testPrisma.task.deleteMany({ where: { projectId: { in: leftoverProjectIds } } });
      await testPrisma.taskStatus.deleteMany({ where: { projectId: { in: leftoverProjectIds } } });
      await testPrisma.projectMember.deleteMany({ where: { projectId: { in: leftoverProjectIds } } });
      await testPrisma.project.deleteMany({ where: { id: { in: leftoverProjectIds } } });
    }
    await testPrisma.user.deleteMany({ where: { id: { in: leftoverUserIds } } });
  }

  // ── Create fresh test users and data ─────────────────────────────────────
  const [adminResult, maintainerResult, memberResult, outsiderResult] =
    await Promise.all([
      registerUser(TEST_EMAILS.admin,      'Admin',      Role.ADMIN),
      registerUser(TEST_EMAILS.maintainer, 'Maintainer', Role.MAINTAINER),
      registerUser(TEST_EMAILS.member,     'Member',     Role.MEMBER),
      registerUser(TEST_EMAILS.outsider,   'Outsider',   Role.MEMBER),
    ]);

  adminToken      = adminResult.token;
  adminUserId     = adminResult.userId;
  maintainerToken = maintainerResult.token;
  maintainerUserId = maintainerResult.userId;
  memberToken     = memberResult.token;
  memberUserId    = memberResult.userId;
  outsiderToken   = outsiderResult.token;

  // Create two projects owned by maintainer
  const [projRes, otherProjRes] = await Promise.all([
    request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${maintainerToken}`)
      .send({ name: 'Report Test Project', description: 'Main test project for reports' }),
    request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${maintainerToken}`)
      .send({ name: 'Other Report Project', description: 'Secondary project' }),
  ]);

  projectId      = projRes.body.data.id as string;
  otherProjectId = otherProjRes.body.data.id as string;

  // Fetch statuses auto-created with the main project
  const statusesRes = await request(app)
    .get(`/api/projects/${projectId}/statuses`)
    .set('Authorization', `Bearer ${maintainerToken}`);

  const statuses: { id: string; name: string }[] = statusesRes.body.data;
  todoStatusId       = statuses.find((s) => s.name === 'TODO')!.id;
  inProgressStatusId = statuses.find((s) => s.name === 'IN_PROGRESS')!.id;
  doneStatusId       = statuses.find((s) => s.name === 'DONE')!.id;

  // Add member to the main project
  await request(app)
    .post(`/api/projects/${projectId}/members`)
    .set('Authorization', `Bearer ${maintainerToken}`)
    .send({ userId: memberUserId });

  // Create tasks in various statuses / assignees
  // 2 TODO (unassigned), 2 IN_PROGRESS (assigned to member), 3 DONE (assigned to admin)
  await Promise.all([
    createTask(todoStatusId,       'TODO Task 1'),
    createTask(todoStatusId,       'TODO Task 2'),
    createTask(inProgressStatusId, 'WIP Task 1',  memberUserId),
    createTask(inProgressStatusId, 'WIP Task 2',  memberUserId),
    createTask(doneStatusId,       'Done Task 1', adminUserId),
    createTask(doneStatusId,       'Done Task 2', adminUserId),
    createTask(doneStatusId,       'Done Task 3', adminUserId),
  ]);
});

afterAll(async () => {
  // FK-safe cleanup order: activities → tasks → taskStatuses → projectMembers → projects → users.
  //
  // Note: jest.setup.ts registers a global afterAll (via setupFilesAfterEnv) that calls
  // disconnectTestDb() which ends the test pg pool. Due to the FIFO registration order,
  // the global afterAll may race with this per-suite afterAll. We swallow pool-after-end
  // errors here since beforeAll already performs a pre-cleanup at the start of each run.
  try {
    const projects = [projectId, otherProjectId].filter(Boolean);

    if (projects.length > 0) {
      await testPrisma.activity.deleteMany({
        where: { projectId: { in: projects } },
      });
      await testPrisma.task.deleteMany({
        where: { projectId: { in: projects } },
      });
      await testPrisma.taskStatus.deleteMany({
        where: { projectId: { in: projects } },
      });
      await testPrisma.projectMember.deleteMany({
        where: { projectId: { in: projects } },
      });
      await testPrisma.project.deleteMany({
        where: { id: { in: projects } },
      });
    }

    const testEmails = Object.values(TEST_EMAILS);
    await testPrisma.user.deleteMany({
      where: { email: { in: testEmails } },
    });
  } catch (err) {
    // Suppress pool-already-ended errors that occur when jest.setup.ts's global
    // afterAll races with this cleanup. The beforeAll pre-cleanup handles stale data.
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('pool after calling end')) throw err;
  }
});

// ─── Shared auth guard tests ───────────────────────────────────────────────────

const ENDPOINTS = [
  '/api/reports/summary',
  '/api/reports/tasks-by-project',
  '/api/reports/tasks-by-assignee',
  '/api/reports/activity-over-time',
  '/api/reports/completion-rate',
] as const;

describe.each(ENDPOINTS)('GET %s — auth guard', (endpoint) => {
  it('401 — rejects unauthenticated requests', async () => {
    const res = await request(app).get(endpoint);
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });
});

// ─── GET /api/reports/summary ─────────────────────────────────────────────────

describe('GET /api/reports/summary', () => {
  it('200 — ADMIN gets aggregated summary with correct shape', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const { data } = res.body;
    expect(data).toBeDefined();
    expect(typeof data.totalProjects).toBe('number');
    expect(typeof data.totalTasks).toBe('number');
    expect(Array.isArray(data.tasksByStatus)).toBe(true);
    expect(typeof data.tasksCompletedThisWeek).toBe('number');
    expect(typeof data.tasksCreatedLast30Days).toBe('number');

    // At least 7 tasks were created for the main project
    expect(data.totalTasks).toBeGreaterThanOrEqual(7);
    expect(data.totalProjects).toBeGreaterThanOrEqual(2);

    // tasksCreatedLast30Days should include all freshly created tasks
    expect(data.tasksCreatedLast30Days).toBeGreaterThanOrEqual(7);
  });

  it('200 — MAINTAINER sees only their own projects', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${maintainerToken}`);

    expect(res.status).toBe(200);
    const { data } = res.body;
    // Maintainer owns both test projects
    expect(data.totalProjects).toBeGreaterThanOrEqual(2);
    expect(data.totalTasks).toBeGreaterThanOrEqual(7);
  });

  it('200 — MEMBER sees only projects they belong to', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    const { data } = res.body;
    // Member belongs to only one project (projectId)
    expect(data.totalProjects).toBe(1);
    expect(data.totalTasks).toBeGreaterThanOrEqual(7);
  });

  it('200 — OUTSIDER (no project access) gets zeros', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(200);
    const { data } = res.body;
    expect(data.totalProjects).toBe(0);
    expect(data.totalTasks).toBe(0);
    expect(data.tasksByStatus).toHaveLength(0);
  });

  it('200 — tasksByStatus contains expected status names and counts', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${memberToken}`); // member → single project

    expect(res.status).toBe(200);
    const { tasksByStatus } = res.body.data;

    // Should have at least TODO, IN_PROGRESS, DONE entries
    const names = tasksByStatus.map((s: { statusName: string }) => s.statusName);
    expect(names).toContain('TODO');
    expect(names).toContain('IN_PROGRESS');
    expect(names).toContain('DONE');

    // Each entry has correct shape
    for (const entry of tasksByStatus) {
      expect(typeof entry.statusName).toBe('string');
      expect(typeof entry.count).toBe('number');
      expect(entry.count).toBeGreaterThan(0);
    }

    // Verify individual counts (TODO:2, IN_PROGRESS:2, DONE:3)
    const doneEntry = tasksByStatus.find((s: { statusName: string }) => s.statusName === 'DONE');
    expect(doneEntry?.count).toBe(3);
    const todoEntry = tasksByStatus.find((s: { statusName: string }) => s.statusName === 'TODO');
    expect(todoEntry?.count).toBe(2);
  });
});

// ─── GET /api/reports/tasks-by-project ───────────────────────────────────────

describe('GET /api/reports/tasks-by-project', () => {
  it('200 — returns array of project breakdowns with correct shape', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-project')
      .set('Authorization', `Bearer ${maintainerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const entry = res.body.data.find((p: { projectId: string }) => p.projectId === projectId);
    expect(entry).toBeDefined();
    expect(entry.projectName).toBe('Report Test Project');
    expect(entry.total).toBe(7);
    expect(Array.isArray(entry.byStatus)).toBe(true);
  });

  it('200 — MEMBER only sees their project', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-project')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].projectId).toBe(projectId);
  });

  it('200 — OUTSIDER gets empty array', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-project')
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('200 — date range filter narrows tasks', async () => {
    // Filter to a future date range where no tasks exist
    const res = await request(app)
      .get('/api/reports/tasks-by-project')
      .set('Authorization', `Bearer ${maintainerToken}`)
      .query({ from: '2099-01-01T00:00:00.000Z', to: '2099-12-31T23:59:59.999Z' });

    expect(res.status).toBe(200);
    // Projects still appear but with 0 tasks
    const entry = res.body.data.find((p: { projectId: string }) => p.projectId === projectId);
    expect(entry?.total).toBe(0);
    expect(entry?.byStatus).toHaveLength(0);
  });

  it('400 — rejects invalid date format', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-project')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ from: 'not-a-date' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

// ─── GET /api/reports/tasks-by-assignee ──────────────────────────────────────

describe('GET /api/reports/tasks-by-assignee', () => {
  it('200 — returns array of assignee breakdowns with correct shape', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-assignee')
      .set('Authorization', `Bearer ${maintainerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    for (const entry of res.body.data) {
      expect(typeof entry.total).toBe('number');
      expect(Array.isArray(entry.byStatus)).toBe(true);
      // assigneeId and assigneeName are either strings or null
      expect(entry.assigneeId === null || typeof entry.assigneeId === 'string').toBe(true);
      expect(entry.assigneeName === null || typeof entry.assigneeName === 'string').toBe(true);
    }
  });

  it('200 — unassigned tasks appear under null entry', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-assignee')
      .set('Authorization', `Bearer ${maintainerToken}`)
      .query({ projectId });

    expect(res.status).toBe(200);
    const unassigned = res.body.data.find(
      (e: { assigneeId: string | null }) => e.assigneeId === null,
    );
    expect(unassigned).toBeDefined();
    expect(unassigned.total).toBe(2); // 2 unassigned TODO tasks
  });

  it('200 — projectId filter narrows scope', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-assignee')
      .set('Authorization', `Bearer ${maintainerToken}`)
      .query({ projectId });

    expect(res.status).toBe(200);
    // otherProjectId has no tasks so results should only be from projectId
    const totalTasks = (res.body.data as { total: number }[]).reduce((sum, e) => sum + e.total, 0);
    expect(totalTasks).toBe(7);
  });

  it('403 — projectId filter with inaccessible project returns 403', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-assignee')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .query({ projectId });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
  });

  it('404 — non-existent projectId returns 404', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-assignee')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ projectId: '00000000-0000-0000-0000-000000000000' });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });

  it('400 — invalid projectId UUID format returns 400', async () => {
    const res = await request(app)
      .get('/api/reports/tasks-by-assignee')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ projectId: 'not-a-uuid' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

// ─── GET /api/reports/activity-over-time ─────────────────────────────────────

describe('GET /api/reports/activity-over-time', () => {
  it('200 — returns array of time-series data points', async () => {
    const res = await request(app)
      .get('/api/reports/activity-over-time')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    // Activity was generated during setup (project creation, task creation, member add)
    expect(res.body.data.length).toBeGreaterThan(0);

    for (const point of res.body.data) {
      expect(typeof point.date).toBe('string');
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
      expect(typeof point.count).toBe('number');
      expect(point.count).toBeGreaterThan(0);
    }
  });

  it('200 — OUTSIDER gets empty array (no accessible projects)', async () => {
    const res = await request(app)
      .get('/api/reports/activity-over-time')
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('200 — future date range returns empty array', async () => {
    const res = await request(app)
      .get('/api/reports/activity-over-time')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ from: '2099-01-01T00:00:00.000Z', to: '2099-12-31T23:59:59.999Z' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('200 — week granularity returns bucketed data', async () => {
    const res = await request(app)
      .get('/api/reports/activity-over-time')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ granularity: 'week' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Week granularity should produce fewer or equal buckets than day granularity
    // Just verify the shape is correct
    for (const point of res.body.data) {
      expect(typeof point.date).toBe('string');
      expect(typeof point.count).toBe('number');
    }
  });

  it('200 — projectId filter narrows to that project', async () => {
    const res = await request(app)
      .get('/api/reports/activity-over-time')
      .set('Authorization', `Bearer ${maintainerToken}`)
      .query({ projectId });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Activity was generated for projectId during setup
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('403 — inaccessible projectId returns 403', async () => {
    const res = await request(app)
      .get('/api/reports/activity-over-time')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .query({ projectId });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
  });

  it('400 — invalid granularity returns 400', async () => {
    const res = await request(app)
      .get('/api/reports/activity-over-time')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ granularity: 'month' }); // not in enum

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

// ─── GET /api/reports/completion-rate ────────────────────────────────────────

describe('GET /api/reports/completion-rate', () => {
  it('200 — returns completion rate with correct shape', async () => {
    const res = await request(app)
      .get('/api/reports/completion-rate')
      .set('Authorization', `Bearer ${memberToken}`); // member → 1 project, 7 tasks (3 done)

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const { data } = res.body;
    expect(typeof data.totalTasks).toBe('number');
    expect(typeof data.completedTasks).toBe('number');
    expect(typeof data.completionRate).toBe('number');
    expect(data.completionRate).toBeGreaterThanOrEqual(0);
    expect(data.completionRate).toBeLessThanOrEqual(100);
  });

  it('200 — MEMBER: 3 out of 7 tasks done → ~42.86%', async () => {
    const res = await request(app)
      .get('/api/reports/completion-rate')
      .set('Authorization', `Bearer ${memberToken}`)
      .query({ projectId });

    expect(res.status).toBe(200);
    const { data } = res.body;
    expect(data.totalTasks).toBe(7);
    expect(data.completedTasks).toBe(3);
    expect(data.completionRate).toBeCloseTo(42.86, 1);
  });

  it('200 — OUTSIDER gets 0% with no tasks', async () => {
    const res = await request(app)
      .get('/api/reports/completion-rate')
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(200);
    const { data } = res.body;
    expect(data.totalTasks).toBe(0);
    expect(data.completedTasks).toBe(0);
    expect(data.completionRate).toBe(0);
  });

  it('200 — future date range returns 0 total and 0 rate', async () => {
    const res = await request(app)
      .get('/api/reports/completion-rate')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ from: '2099-01-01T00:00:00.000Z', to: '2099-12-31T23:59:59.999Z' });

    expect(res.status).toBe(200);
    const { data } = res.body;
    expect(data.totalTasks).toBe(0);
    expect(data.completionRate).toBe(0);
  });

  it('403 — inaccessible projectId returns 403', async () => {
    const res = await request(app)
      .get('/api/reports/completion-rate')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .query({ projectId });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
  });

  it('404 — non-existent projectId returns 404', async () => {
    const res = await request(app)
      .get('/api/reports/completion-rate')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ projectId: '00000000-0000-0000-0000-000000000000' });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});
