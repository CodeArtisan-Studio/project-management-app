import request from 'supertest';
import { app } from '@/app';
import { testPrisma } from '@/tests/helpers/test-db';
import { Role } from '@/generated/prisma/client';

// ─── Test Fixtures ───────────────────────────────────────────────────────────
const TEST_PASSWORD = 'TestPass123!';

const TEST_EMAILS = {
  admin: 'user-admin@test.local',
  maintainer: 'user-maintainer@test.local',
  member: 'user-member@test.local',
  // Reserved for the soft-delete scenario; holds a valid token post-deletion.
  deletable: 'user-deletable@test.local',
  // Exists solely to occupy an email address for the 409 uniqueness test.
  emailConflict: 'user-conflict@test.local',
} as const;

// ─── Shared State ────────────────────────────────────────────────────────────
let adminToken: string;
let adminUserId: string;

let maintainerToken: string;
let maintainerUserId: string;

let memberToken: string;
let memberUserId: string;

// deletableToken remains cryptographically valid after the user is soft-deleted.
// Used to verify that a soft-deleted user cannot replay their JWT.
let deletableToken: string;
let deletableUserId: string;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Registers a user via the public API (role defaults to MEMBER), elevates
 * the role via testPrisma, then re-logs-in so the JWT carries the correct role.
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

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('User Integration Tests', () => {
  beforeAll(async () => {
    // Purge residual data from any previous run.
    await testPrisma.user.deleteMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
    });

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

    const member = await registerUser(TEST_EMAILS.member, 'Member', Role.MEMBER);
    memberToken = member.token;
    memberUserId = member.userId;

    const deletable = await registerUser(TEST_EMAILS.deletable, 'Deletable', Role.MEMBER);
    deletableToken = deletable.token;
    deletableUserId = deletable.userId;

    // emailConflict user only needs to exist; its token is never used.
    await registerUser(TEST_EMAILS.emailConflict, 'Conflict', Role.MEMBER);
  });

  afterAll(async () => {
    // Hard-delete all test users (including any that are soft-deleted).
    await testPrisma.user.deleteMany({
      where: { email: { in: Object.values(TEST_EMAILS) } },
    });
  });

  // ── GET /api/users/me ────────────────────────────────────────────────────────
  describe('GET /api/users/me — get own profile', () => {
    it('200 — returns the authenticated user\'s profile with the full safe shape', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();

      const { data } = res.body;
      expect(data.id).toBe(memberUserId);
      expect(data.email).toBe(TEST_EMAILS.member);
      expect(data.firstName).toBe('Member');
      expect(data.lastName).toBe('Test');
      expect(data.role).toBe('MEMBER');
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
      // Password hash must never be exposed.
      expect(data.password).toBeUndefined();
    });

    it('200 — returns correct profile for an ADMIN user', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(adminUserId);
      expect(res.body.data.email).toBe(TEST_EMAILS.admin);
      expect(res.body.data.role).toBe('ADMIN');
      expect(res.body.data.password).toBeUndefined();
    });

    it('200 — returns correct profile for a MAINTAINER user', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(maintainerUserId);
      expect(res.body.data.role).toBe('MAINTAINER');
    });

    it('401 — rejects a request with no Authorization header', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects a malformed Bearer token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer not.a.valid.jwt');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  // ── PATCH /api/users/me ──────────────────────────────────────────────────────
  describe('PATCH /api/users/me — update own profile', () => {
    // Canonical state for the member user used in update tests.
    const ORIGINAL = {
      firstName: 'Member',
      lastName: 'Test',
      email: TEST_EMAILS.member,
    } as const;

    // Restore the member user after every test to keep a clean baseline.
    afterEach(async () => {
      await testPrisma.user.update({
        where: { id: memberUserId },
        data: ORIGINAL,
      });
    });

    it('200 — updates firstName; other fields remain unchanged', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ firstName: 'Renamed' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Profile updated successfully.');
      expect(res.body.data.firstName).toBe('Renamed');
      expect(res.body.data.lastName).toBe(ORIGINAL.lastName);
      expect(res.body.data.email).toBe(ORIGINAL.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it('200 — updates lastName; firstName and email remain unchanged', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ lastName: 'NewLastName' });

      expect(res.status).toBe(200);
      expect(res.body.data.lastName).toBe('NewLastName');
      expect(res.body.data.firstName).toBe(ORIGINAL.firstName);
      expect(res.body.data.email).toBe(ORIGINAL.email);
    });

    it('200 — updates email to a new unique address', async () => {
      const newEmail = 'member-newemail@test.local';

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: newEmail });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(newEmail);
      // afterEach restores the original email
    });

    it('200 — re-submitting own current email is allowed (self-exclusion in uniqueness check)', async () => {
      // findByEmail(email, userId) excludes the current user — should not conflict.
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: TEST_EMAILS.member });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(TEST_EMAILS.member);
    });

    it('200 — updates all three fields in a single request', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          firstName: 'Multi',
          lastName: 'Update',
          email: 'multi-update@test.local',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe('Multi');
      expect(res.body.data.lastName).toBe('Update');
      expect(res.body.data.email).toBe('multi-update@test.local');
    });

    it('200 — any authenticated role can update their own profile (MAINTAINER)', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${maintainerToken}`)
        .send({ firstName: 'MaintainerUpdated' });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe('MaintainerUpdated');

      // Restore maintainer immediately — afterEach only covers memberUserId.
      await testPrisma.user.update({
        where: { id: maintainerUserId },
        data: { firstName: 'Maintainer' },
      });
    });

    it('200 — any authenticated role can update their own profile (ADMIN)', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ lastName: 'AdminUpdated' });

      expect(res.status).toBe(200);
      expect(res.body.data.lastName).toBe('AdminUpdated');

      await testPrisma.user.update({
        where: { id: adminUserId },
        data: { lastName: 'Test' },
      });
    });

    it('409 — rejects an email already registered to another user', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: TEST_EMAILS.emailConflict });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toMatch(/already in use/i);
    });

    it('400 — rejects an empty body (at-least-one-field refine)', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects an empty-string firstName', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ firstName: '' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects an empty-string lastName', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ lastName: '' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a malformed email address', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .send({ firstName: 'No Auth' });

      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/users ───────────────────────────────────────────────────────────
  describe('GET /api/users — admin: list all users with pagination', () => {
    it('200 — ADMIN receives a paginated ApiResponse with correct meta shape', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.data.length).toBeGreaterThan(0);
      expect(res.body.data.meta).toMatchObject({ page: 1, limit: 10 });
      expect(typeof res.body.data.meta.total).toBe('number');
      expect(typeof res.body.data.meta.totalPages).toBe('number');
      expect(typeof res.body.data.meta.hasNextPage).toBe('boolean');
      expect(typeof res.body.data.meta.hasPreviousPage).toBe('boolean');
    });

    it('200 — every record in the list exposes only safe fields (no password)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      res.body.data.data.forEach((u: Record<string, unknown>) => {
        expect(u.id).toBeDefined();
        expect(u.email).toBeDefined();
        expect(u.firstName).toBeDefined();
        expect(u.lastName).toBeDefined();
        expect(u.role).toBeDefined();
        expect(u.createdAt).toBeDefined();
        expect(u.updatedAt).toBeDefined();
        expect(u.password).toBeUndefined();
      });
    });

    it('200 — default response uses page=1 and limit=10', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.limit).toBe(10);
    });

    it('200 — ?limit=1 constrains page size; meta.limit reflects the param', async () => {
      const res = await request(app)
        .get('/api/users?limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.meta.limit).toBe(1);
      expect(res.body.data.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('200 — ?page=2&limit=1 returns the second slice with hasPreviousPage=true', async () => {
      const res = await request(app)
        .get('/api/users?page=2&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.meta.page).toBe(2);
      expect(res.body.data.meta.hasPreviousPage).toBe(true);
    });

    it('200 — ?sortBy=firstName&sortOrder=asc returns the current page in ascending name order', async () => {
      const res = await request(app)
        .get('/api/users?sortBy=firstName&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const names: string[] = res.body.data.data.map((u: { firstName: string }) => u.firstName);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    });

    it('200 — ?sortBy=email&sortOrder=desc returns the current page in descending email order', async () => {
      const res = await request(app)
        .get('/api/users?sortBy=email&sortOrder=desc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const emails: string[] = res.body.data.data.map((u: { email: string }) => u.email);
      const sorted = [...emails].sort((a, b) => b.localeCompare(a));
      expect(emails).toEqual(sorted);
    });

    it('200 — ?sortBy=lastName&sortOrder=asc returns the current page in ascending lastName order', async () => {
      const res = await request(app)
        .get('/api/users?sortBy=lastName&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const lastNames: string[] = res.body.data.data.map((u: { lastName: string }) => u.lastName);
      const sorted = [...lastNames].sort((a, b) => a.localeCompare(b));
      expect(lastNames).toEqual(sorted);
    });

    it('400 — rejects an invalid sortBy value', async () => {
      const res = await request(app)
        .get('/api/users?sortBy=invalidField')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects an invalid sortOrder value', async () => {
      const res = await request(app)
        .get('/api/users?sortOrder=RANDOM')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a non-integer page value', async () => {
      const res = await request(app)
        .get('/api/users?page=abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a limit exceeding 100', async () => {
      const res = await request(app)
        .get('/api/users?limit=101')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('403 — MAINTAINER is forbidden from listing users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — MEMBER is forbidden from listing users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated request', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  // ── DELETE /api/users/:id ────────────────────────────────────────────────────
  // Ordering is intentional: authorization and guard tests run before the
  // destructive 204 test so that deletableUserId remains intact for their assertions.
  // Post-deletion state assertions follow immediately after.
  describe('DELETE /api/users/:id — admin: soft delete user', () => {
    it('403 — MAINTAINER cannot delete a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${memberUserId}`)
        .set('Authorization', `Bearer ${maintainerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('403 — MEMBER cannot delete a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${maintainerUserId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('400 — ADMIN cannot delete their own account (self-deletion guard)', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toMatch(/cannot delete your own account/i);
    });

    it('404 — returns 404 when targeting a non-existent user ID', async () => {
      const res = await request(app)
        .delete('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });

    it('401 — rejects an unauthenticated delete request', async () => {
      const res = await request(app).delete(`/api/users/${deletableUserId}`);

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    // ── Destructive step — runs after all guard assertions ──────────────────
    it('204 — ADMIN successfully soft-deletes a user (no response body)', async () => {
      const res = await request(app)
        .delete(`/api/users/${deletableUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      expect(res.text).toBe(''); // 204 must have an empty body
    });

    // ── Post-deletion state assertions ──────────────────────────────────────
    it('soft delete — deleted user no longer appears in the admin user list', async () => {
      const res = await request(app)
        .get('/api/users?limit=100')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const ids: string[] = res.body.data.data.map((u: { id: string }) => u.id);
      expect(ids).not.toContain(deletableUserId);
    });

    it('soft delete — deleted user\'s total is excluded from meta.total', async () => {
      // Fetch total with a fresh list request and verify the count
      // does not include soft-deleted rows.
      const res = await request(app)
        .get('/api/users?limit=100')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Every returned user must have deletedAt === null (no deletedAt field
      // is exposed in safeUserSelect, but confirming none is the deleted user
      // is sufficient via ID exclusion already tested above).
      expect(res.body.data.meta.total).toBe(res.body.data.data.length);
    });

    it('soft delete — deleted user\'s GET /me with a still-valid JWT returns 404', async () => {
      // deletableToken is cryptographically valid but the user now has deletedAt set.
      // getProfile → findById({ id, deletedAt: null }) → null → AppError.notFound.
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${deletableToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toMatch(/user not found/i);
    });

    it('soft delete — deleted user\'s PATCH /me with a still-valid JWT returns 404', async () => {
      // updateProfile calls getProfile first — same 404 path.
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${deletableToken}`)
        .send({ firstName: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });
  });
});
