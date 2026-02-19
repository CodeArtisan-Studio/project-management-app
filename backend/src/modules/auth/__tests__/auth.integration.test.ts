import request from 'supertest';
import { app } from '@/app';
import { testPrisma } from '@/tests/helpers/test-db';

// ─── Test fixtures ─────────────────────────────────────────────────────────
// A unique email that is guaranteed not to exist in seed/production data.
const TEST_EMAIL = 'auth-integration@test.local';

const VALID_PAYLOAD = {
  email: TEST_EMAIL,
  password: 'ValidPass123!',
  firstName: 'Integration',
  lastName: 'Test',
};

// ─── Helpers ───────────────────────────────────────────────────────────────
async function deleteTestUser(): Promise<void> {
  await testPrisma.user.deleteMany({ where: { email: TEST_EMAIL } });
}

async function registerTestUser(): Promise<void> {
  await request(app).post('/api/auth/register').send(VALID_PAYLOAD);
}

// ─── Suite ─────────────────────────────────────────────────────────────────
describe('Auth Integration Tests', () => {
  // Ensure a clean slate before every test.
  beforeEach(async () => {
    await deleteTestUser();
  });

  // Final cleanup so the test DB is tidy after the suite.
  afterAll(async () => {
    await deleteTestUser();
  });

  // ── POST /api/auth/register ──────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('201 — registers a new user and returns the standardised ApiResponse with user + token', async () => {
      const res = await request(app).post('/api/auth/register').send(VALID_PAYLOAD);

      expect(res.status).toBe(201);

      // Top-level ApiResponse shape
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('User registered successfully.');
      expect(res.body.data).toBeDefined();

      const { user, token } = res.body.data;

      // User shape — all expected fields present
      expect(user.id).toBeDefined();
      expect(user.email).toBe(VALID_PAYLOAD.email);
      expect(user.firstName).toBe(VALID_PAYLOAD.firstName);
      expect(user.lastName).toBe(VALID_PAYLOAD.lastName);
      expect(user.role).toBe('MEMBER'); // default role
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Password must never appear in the response
      expect(user.password).toBeUndefined();

      // Token is a structurally valid JWT (header.payload.signature)
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('409 — rejects registration with an already-registered email', async () => {
      await registerTestUser(); // first registration succeeds

      const res = await request(app).post('/api/auth/register').send(VALID_PAYLOAD);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('400 — rejects a request with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: TEST_EMAIL }); // password, firstName, lastName missing

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBeDefined();
    });

    it('400 — rejects an invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...VALID_PAYLOAD, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects a password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...VALID_PAYLOAD, password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects an empty firstName', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...VALID_PAYLOAD, firstName: '' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });

  // ── POST /api/auth/login ─────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    // Each login test needs an existing user to authenticate against.
    beforeEach(async () => {
      await registerTestUser();
    });

    it('200 — authenticates with valid credentials and returns user + token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_PAYLOAD.email, password: VALID_PAYLOAD.password });

      expect(res.status).toBe(200);

      // Top-level ApiResponse shape
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Login successful.');
      expect(res.body.data).toBeDefined();

      const { user, token } = res.body.data;

      // User shape
      expect(user.email).toBe(VALID_PAYLOAD.email);
      expect(user.firstName).toBe(VALID_PAYLOAD.firstName);
      expect(user.lastName).toBe(VALID_PAYLOAD.lastName);

      // Password must never appear in the response
      expect(user.password).toBeUndefined();

      // Token is a structurally valid JWT
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('401 — rejects an incorrect password (same message to prevent user enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_PAYLOAD.email, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('401 — rejects a non-existent email (same message to prevent user enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.local', password: VALID_PAYLOAD.password });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('400 — rejects a request with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_PAYLOAD.email }); // password omitted

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('400 — rejects an invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bad-email', password: VALID_PAYLOAD.password });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });
});
