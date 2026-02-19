import request from 'supertest';
import { app } from '@/app';
import { testPrisma } from '@/tests/helpers/test-db';
import { Role } from '@/generated/prisma/client';

// ─── Test Fixtures ──────────────────────────────────────────────────────────
const TEST_PASSWORD = 'TestPass123!';

const TEST_EMAILS = {
  admin: 'proj-admin@test.local',
  maintainer: 'proj-maintainer@test.local',
  anotherMaintainer: 'proj-another-maint@test.local',
  member: 'proj-member@test.local',
} as const;

// ─── Shared State ───────────────────────────────────────────────────────────
let adminToken: string;
let maintainerToken: string;
let anotherMaintainerToken: string;
let memberToken: string;

let adminUserId: string;
let maintainerUserId: string;
let anotherMaintainerUserId: string;
let memberUserId: string;

// ─── Helpers ────────────────────────────────────────────────────────────────
/**
 * Registers a user via the public API (role defaults to MEMBER),
 * elevates the role via the test Prisma client, then logs in again
 * so the returned JWT carries the correct role claim.
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

/**
 * Convenience wrapper for POST /api/projects.
 */
function createProject(
  token: string,
  payload: { name: string; description?: string; status?: string },
) {
  return request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
}

// ─── Suite ──────────────────────────────────────────────────────────────────
describe('Project Integration Tests', () => {
  beforeAll(async () => {
    // Purge any residual data from a previous interrupted run.
    await testPrisma.user.deleteMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
    });

    const admin = await registerUser(TEST_EMAILS.admin, 'Admin', Role.ADMIN);
    adminToken = admin.token;
    adminUserId = admin.userId;

    const maintainer = await registerUser(TEST_EMAILS.maintainer, 'Maintainer', Role.MAINTAINER);
    maintainerToken = maintainer.token;
    maintainerUserId = maintainer.userId;

    const anotherMaintainer = await registerUser(
      TEST_EMAILS.anotherMaintainer,
      'AnotherMaint',
      Role.MAINTAINER,
    );
    anotherMaintainerToken = anotherMaintainer.token;
    anotherMaintainerUserId = anotherMaintainer.userId;

    const member = await registerUser(TEST_EMAILS.member, 'Member', Role.MEMBER);
    memberToken = member.token;
    memberUserId = member.userId;
  });

  afterAll(async () => {
    // Delete in FK-safe order: leaf nodes first, then parents, then users.
    const ownerIds = [adminUserId, maintainerUserId, anotherMaintainerUserId].filter(Boolean);

    await testPrisma.task.deleteMany({
      where: { project: { ownerId: { in: ownerIds } } },
    });
    await testPrisma.taskStatus.deleteMany({
      where: { project: { ownerId: { in: ownerIds } } },
    });
    await testPrisma.projectMember.deleteMany({
      where: { project: { ownerId: { in: ownerIds } } },
    });
    await testPrisma.project.deleteMany({ where: { ownerId: { in: ownerIds } } });
    await testPrisma.user.deleteMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
    });
  });

  // ── POST /api/projects ─────────────────────────────────────────────────────
  describe('POST /api/projects — create project', () => {
    it('201 — MAINTAINER creates a project and receives the full project shape', async () => {
      const res = await createProject(maintainerToken, {
        name: 'Maintainer Project',
        description: 'Created by maintainer',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Project created successfully.');

      const { data } = res.body;
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Maintainer Project');
      expect(data.description).toBe('Created by maintainer');
      expect(data.status).toBe('ACTIVE'); // default
      expect(data.ownerId).toBe(maintainerUserId);
      expect(data.owner.email).toBe(TEST_EMAILS.maintainer);
      expect(data.owner.password).toBeUndefined(); // never exposed
      expect(data.createdAt).toBeDefined();
    });

    it('201 — ADMIN creates a project with an explicit status', async () => {
      const res = await createProject(adminToken, {
        name: 'Admin Project',
        status: 'ARCHIVED',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('ARCHIVED');
      expect(res.body.data.ownerId).toBe(adminUserId);
    });

    it('403 — MEMBER is forbidden from creating a project (role guard)', async () => {
      const res = await createProject(memberToken, { name: 'Member Project' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects a request with no Authorization header', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ name: 'No Auth Project' });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects a malformed / invalid Bearer token', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer this.is.not.valid')
        .send({ name: 'Bad Token Project' });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a missing name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ description: 'No name here' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a name exceeding 100 characters', async () => {
      const res = await createProject(maintainerToken, { name: 'A'.repeat(101) });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a description exceeding 500 characters', async () => {
      const res = await createProject(maintainerToken, {
        name: 'Valid Name',
        description: 'D'.repeat(501),
      });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects an invalid status enum value', async () => {
      const res = await createProject(maintainerToken, {
        name: 'Bad Status Project',
        status: 'INVALID_STATUS',
      });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });

  // ── GET /api/projects ──────────────────────────────────────────────────────
  describe('GET /api/projects — list projects with pagination', () => {
    // Seed a predictable set of projects so assertions on counts and scoping
    // have a stable baseline.
    beforeAll(async () => {
      await Promise.all([
        createProject(maintainerToken, { name: 'Maintainer Owned Alpha' }),
        createProject(maintainerToken, { name: 'Maintainer Owned Beta' }),
        createProject(maintainerToken, { name: 'Maintainer Owned Gamma' }),
        createProject(anotherMaintainerToken, { name: 'Another Maintainer Project' }),
        createProject(adminToken, { name: 'Admin Seeded Project' }),
      ]);
    });

    it('200 — returns a paginated ApiResponse with correct meta shape', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.meta).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(typeof res.body.data.meta.total).toBe('number');
      expect(typeof res.body.data.meta.totalPages).toBe('number');
      expect(typeof res.body.data.meta.hasNextPage).toBe('boolean');
      expect(typeof res.body.data.meta.hasPreviousPage).toBe('boolean');
    });

    it('200 — ADMIN receives projects from all owners', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const ownerIds: string[] = res.body.data.data.map((p: { ownerId: string }) => p.ownerId);
      expect(ownerIds).toContain(maintainerUserId);
      expect(ownerIds).toContain(anotherMaintainerUserId);
      expect(ownerIds).toContain(adminUserId);
    });

    it('200 — MAINTAINER sees only projects they own (not other maintainers\')', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);

      const projects = res.body.data.data as Array<{ ownerId: string }>;
      expect(projects.length).toBeGreaterThan(0);
      projects.forEach((p) => expect(p.ownerId).toBe(maintainerUserId));
    });

    it('200 — MEMBER sees only projects they are a member of (empty before any membership)', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(0);
      expect(res.body.data.meta.total).toBe(0);
    });

    it('200 — ?limit=2 restricts page size and meta reflects it', async () => {
      const res = await request(app)
        .get('/api/projects?page=1&limit=2')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeLessThanOrEqual(2);
      expect(res.body.data.meta.limit).toBe(2);
      expect(res.body.data.meta.page).toBe(1);
    });

    it('200 — ?search=alpha filters results by name (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/projects?search=alpha')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeGreaterThan(0);

      const names: string[] = res.body.data.data.map((p: { name: string }) => p.name.toLowerCase());
      names.forEach((n) => expect(n).toContain('alpha'));
    });

    it('200 — ?status=ARCHIVED returns only archived projects', async () => {
      await createProject(maintainerToken, { name: 'Archived Filter Project', status: 'ARCHIVED' });

      const res = await request(app)
        .get('/api/projects?status=ARCHIVED')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeGreaterThan(0);

      const statuses: string[] = res.body.data.data.map((p: { status: string }) => p.status);
      statuses.forEach((s) => expect(s).toBe('ARCHIVED'));
    });

    it('200 — second page returns the next slice when total > limit', async () => {
      // maintainer has at least 3 owned projects + the archived one = 4+
      const res = await request(app)
        .get('/api/projects?page=2&limit=2')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.meta.page).toBe(2);
      expect(res.body.data.meta.hasPreviousPage).toBe(true);
    });

    it('401 — rejects an unauthenticated list request', async () => {
      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  // ── GET /api/projects/:id ──────────────────────────────────────────────────
  describe('GET /api/projects/:id — get single project', () => {
    let projectId: string;

    beforeAll(async () => {
      const res = await createProject(maintainerToken, { name: 'Single Project Visibility Test' });
      projectId = res.body.data.id;
    });

    it('200 — project owner can view their project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(projectId);
    });

    it('200 — ADMIN can view any project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(projectId);
    });

    it('403 — another MAINTAINER cannot view a project they do not own', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${anotherMaintainerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — MEMBER cannot view a project they are not a member of', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('200 — MEMBER can view a project after being added as a member', async () => {
      // Grant membership via owner
      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ userId: memberUserId });

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(projectId);
    });

    it('404 — returns 404 for a non-existent project ID', async () => {
      const res = await request(app)
        .get('/api/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app).get(`/api/projects/${projectId}`);

      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /api/projects/:id — ownership enforcement ────────────────────────
  describe('PATCH /api/projects/:id — update project (ownership enforcement)', () => {
    let projectId: string;

    beforeAll(async () => {
      const res = await createProject(maintainerToken, { name: 'Ownership Patch Test' });
      projectId = res.body.data.id;
    });

    it('200 — project owner (MAINTAINER) can update their own project', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'Updated By Owner', status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Project updated successfully.');
      expect(res.body.data.name).toBe('Updated By Owner');
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('200 — ADMIN can update any project regardless of ownership', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Override Update' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Admin Override Update');
    });

    it('403 — another MAINTAINER is forbidden from updating a project they do not own', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${anotherMaintainerToken}`)
        .send({ name: 'Hostile Update Attempt' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — MEMBER is forbidden from updating any project', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Member Update Attempt' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects an empty update body', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('404 — returns 404 when targeting a non-existent project', async () => {
      const res = await request(app)
        .patch('/api/projects/00000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ name: 'Ghost Update' });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated update request', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ name: 'No Auth Update' });

      expect(res.status).toBe(401);
    });
  });

  // ── DELETE /api/projects/:id — ownership enforcement ───────────────────────
  describe('DELETE /api/projects/:id — delete project (ownership enforcement)', () => {
    it('403 — another MAINTAINER cannot delete a project they do not own', async () => {
      const createRes = await createProject(maintainerToken, {
        name: 'Project — Cross-Maintainer Delete Check',
      });
      const projectId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${anotherMaintainerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — MEMBER cannot delete any project', async () => {
      const createRes = await createProject(maintainerToken, {
        name: 'Project — Member Delete Check',
      });
      const projectId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('204 — ADMIN can soft-delete any project', async () => {
      const createRes = await createProject(maintainerToken, { name: 'Admin Delete Target' });
      const projectId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);

      // Soft-deleted project must no longer be reachable
      const getRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(404);
    });

    it('204 — project owner can soft-delete their own project', async () => {
      const createRes = await createProject(maintainerToken, { name: 'Owner Delete Target' });
      const projectId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(deleteRes.status).toBe(204);

      // Soft-deleted project must no longer be reachable
      const getRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);
      expect(getRes.status).toBe(404);
    });

    it('404 — returns 404 when targeting a non-existent project', async () => {
      const res = await request(app)
        .delete('/api/projects/00000000-0000-0000-0000-000000000002')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated delete request', async () => {
      const res = await request(app).delete(
        '/api/projects/00000000-0000-0000-0000-000000000003',
      );

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });
});
