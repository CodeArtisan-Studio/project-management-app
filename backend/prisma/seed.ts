/**
 * Database Seed
 * Run with: npm run seed
 *
 * Creates a realistic dataset for development and portfolio demos:
 *   - 1 ADMIN, 2 MAINTAINERs, 3 MEMBERs
 *   - 4 projects with custom task statuses
 *   - Project memberships
 *   - Tasks spread across statuses and assignees
 */

import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

// ─── Helpers ──────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ─── Main ─────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('🌱 Seeding database...\n');

  // ── 1. Wipe existing data (FK-safe order) ────────────────
  await prisma.task.deleteMany();
  await prisma.taskStatus.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Cleared existing data');

  // ── 2. Users ─────────────────────────────────────────────
  const [adminPw, alicePw, bobPw, carolPw, davePw, evePw] = await Promise.all([
    hashPassword('Admin123!'),
    hashPassword('Alice123!'),
    hashPassword('Bob123!'),
    hashPassword('Carol123!'),
    hashPassword('Dave123!'),
    hashPassword('Eve123!'),
  ]);

  const admin = await prisma.user.create({
    data: { email: 'admin@pma.dev', password: adminPw, firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
  });

  const alice = await prisma.user.create({
    data: { email: 'alice@pma.dev', password: alicePw, firstName: 'Alice', lastName: 'Carter', role: 'MAINTAINER' },
  });

  const bob = await prisma.user.create({
    data: { email: 'bob@pma.dev', password: bobPw, firstName: 'Bob', lastName: 'Morgan', role: 'MAINTAINER' },
  });

  const carol = await prisma.user.create({
    data: { email: 'carol@pma.dev', password: carolPw, firstName: 'Carol', lastName: 'Evans', role: 'MEMBER' },
  });

  const dave = await prisma.user.create({
    data: { email: 'dave@pma.dev', password: davePw, firstName: 'Dave', lastName: 'Kim', role: 'MEMBER' },
  });

  const eve = await prisma.user.create({
    data: { email: 'eve@pma.dev', password: evePw, firstName: 'Eve', lastName: 'Santos', role: 'MEMBER' },
  });

  console.log('  ✓ Created 6 users (1 admin, 2 maintainers, 3 members)');

  // ── 3. Projects ──────────────────────────────────────────
  // Alice's projects
  const ecommerce = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration, inventory management, and real-time order tracking.',
      status: 'ACTIVE',
      ownerId: alice.id,
    },
  });

  const mobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Complete UX overhaul of the consumer-facing mobile application targeting iOS and Android.',
      status: 'ACTIVE',
      ownerId: alice.id,
    },
  });

  // Bob's projects
  const apiGateway = await prisma.project.create({
    data: {
      name: 'API Gateway Service',
      description: 'Centralised gateway for routing, authentication, rate-limiting, and observability across all microservices.',
      status: 'ACTIVE',
      ownerId: bob.id,
    },
  });

  const analytics = await prisma.project.create({
    data: {
      name: 'Analytics Dashboard',
      description: 'Business intelligence dashboard for tracking KPIs, user behaviour, and revenue metrics.',
      status: 'COMPLETED',
      ownerId: bob.id,
    },
  });

  console.log('  ✓ Created 4 projects');

  // ── 4. Task Statuses (custom per project) ────────────────
  // E-Commerce — adds DEPLOYED after DONE
  const [ecTodo, ecInProgress, ecCodeReview, ecDone, ecDeployed] = await Promise.all([
    prisma.taskStatus.create({ data: { projectId: ecommerce.id, name: 'TODO',        color: '#6B7280', order: 0 } }),
    prisma.taskStatus.create({ data: { projectId: ecommerce.id, name: 'IN_PROGRESS', color: '#3B82F6', order: 1 } }),
    prisma.taskStatus.create({ data: { projectId: ecommerce.id, name: 'CODE_REVIEW', color: '#F59E0B', order: 2 } }),
    prisma.taskStatus.create({ data: { projectId: ecommerce.id, name: 'DONE',        color: '#10B981', order: 3 } }),
    prisma.taskStatus.create({ data: { projectId: ecommerce.id, name: 'DEPLOYED',    color: '#8B5CF6', order: 4 } }),
  ]);

  // Mobile App — standard four statuses
  const [maTodo, maInProgress, maCodeReview, maDone] = await Promise.all([
    prisma.taskStatus.create({ data: { projectId: mobileApp.id, name: 'TODO',        color: '#6B7280', order: 0 } }),
    prisma.taskStatus.create({ data: { projectId: mobileApp.id, name: 'IN_PROGRESS', color: '#3B82F6', order: 1 } }),
    prisma.taskStatus.create({ data: { projectId: mobileApp.id, name: 'CODE_REVIEW', color: '#F59E0B', order: 2 } }),
    prisma.taskStatus.create({ data: { projectId: mobileApp.id, name: 'DONE',        color: '#10B981', order: 3 } }),
  ]);

  // API Gateway — adds BACKLOG before TODO
  const [agBacklog, agTodo, agInProgress, agCodeReview, agDone] = await Promise.all([
    prisma.taskStatus.create({ data: { projectId: apiGateway.id, name: 'BACKLOG',     color: '#9CA3AF', order: 0 } }),
    prisma.taskStatus.create({ data: { projectId: apiGateway.id, name: 'TODO',        color: '#6B7280', order: 1 } }),
    prisma.taskStatus.create({ data: { projectId: apiGateway.id, name: 'IN_PROGRESS', color: '#3B82F6', order: 2 } }),
    prisma.taskStatus.create({ data: { projectId: apiGateway.id, name: 'CODE_REVIEW', color: '#F59E0B', order: 3 } }),
    prisma.taskStatus.create({ data: { projectId: apiGateway.id, name: 'DONE',        color: '#10B981', order: 4 } }),
  ]);

  // Analytics Dashboard — uses BACKLOG + simplified statuses (project is COMPLETED)
  const [anBacklog, anTodo, anInProgress, anDone] = await Promise.all([
    prisma.taskStatus.create({ data: { projectId: analytics.id, name: 'BACKLOG',     color: '#9CA3AF', order: 0 } }),
    prisma.taskStatus.create({ data: { projectId: analytics.id, name: 'TODO',        color: '#6B7280', order: 1 } }),
    prisma.taskStatus.create({ data: { projectId: analytics.id, name: 'IN_PROGRESS', color: '#3B82F6', order: 2 } }),
    prisma.taskStatus.create({ data: { projectId: analytics.id, name: 'DONE',        color: '#10B981', order: 3 } }),
  ]);

  console.log('  ✓ Created task statuses (custom per project)');

  // ── 5. Project Members ───────────────────────────────────
  await prisma.projectMember.createMany({
    data: [
      // E-Commerce: carol, dave
      { projectId: ecommerce.id, userId: carol.id },
      { projectId: ecommerce.id, userId: dave.id },
      // Mobile App: carol, eve
      { projectId: mobileApp.id, userId: carol.id },
      { projectId: mobileApp.id, userId: eve.id },
      // API Gateway: dave, eve
      { projectId: apiGateway.id, userId: dave.id },
      { projectId: apiGateway.id, userId: eve.id },
      // Analytics: carol, dave, eve
      { projectId: analytics.id, userId: carol.id },
      { projectId: analytics.id, userId: dave.id },
      { projectId: analytics.id, userId: eve.id },
    ],
  });

  console.log('  ✓ Created project memberships');

  // ── 6. Tasks ─────────────────────────────────────────────

  // E-Commerce Platform tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: ecommerce.id,
        statusId: ecDeployed.id,
        assigneeId: carol.id,
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment to staging and production environments.',
        order: 0,
      },
      {
        projectId: ecommerce.id,
        statusId: ecDeployed.id,
        assigneeId: dave.id,
        title: 'Integrate Stripe payment gateway',
        description: 'Implement checkout flow with Stripe Elements, handle webhooks for payment confirmation and refunds.',
        order: 1,
      },
      {
        projectId: ecommerce.id,
        statusId: ecDone.id,
        assigneeId: carol.id,
        title: 'Product catalogue API',
        description: 'RESTful API for products, categories, and inventory with pagination, search, and filtering.',
        order: 2,
      },
      {
        projectId: ecommerce.id,
        statusId: ecCodeReview.id,
        assigneeId: dave.id,
        title: 'Shopping cart service',
        description: 'Implement cart persistence, quantity management, coupon application, and price calculation.',
        order: 3,
      },
      {
        projectId: ecommerce.id,
        statusId: ecInProgress.id,
        assigneeId: carol.id,
        title: 'Order tracking dashboard',
        description: 'Real-time order status updates using WebSockets, with email notifications at each stage.',
        order: 4,
      },
      {
        projectId: ecommerce.id,
        statusId: ecTodo.id,
        assigneeId: dave.id,
        title: 'Admin inventory management',
        description: 'Admin panel for stock management, low-stock alerts, and bulk product import via CSV.',
        order: 5,
      },
      {
        projectId: ecommerce.id,
        statusId: ecTodo.id,
        assigneeId: null,
        title: 'Write E2E tests for checkout flow',
        description: 'Cover happy path and edge cases (failed payment, out-of-stock, expired coupon) with Playwright.',
        order: 6,
      },
    ],
  });

  // Mobile App Redesign tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: mobileApp.id,
        statusId: maDone.id,
        assigneeId: carol.id,
        title: 'User research and personas',
        description: 'Conduct 10 user interviews and synthesise findings into 3 primary personas.',
        order: 0,
      },
      {
        projectId: mobileApp.id,
        statusId: maDone.id,
        assigneeId: eve.id,
        title: 'Wireframes for onboarding flow',
        description: 'Low-fidelity wireframes covering sign-up, email verification, and profile setup screens.',
        order: 1,
      },
      {
        projectId: mobileApp.id,
        statusId: maCodeReview.id,
        assigneeId: carol.id,
        title: 'Redesign home screen',
        description: 'Implement new home screen design with personalised content feed and bottom navigation bar.',
        order: 2,
      },
      {
        projectId: mobileApp.id,
        statusId: maInProgress.id,
        assigneeId: eve.id,
        title: 'Accessibility audit and fixes',
        description: 'Ensure WCAG 2.1 AA compliance — colour contrast, touch targets, screen reader support.',
        order: 3,
      },
      {
        projectId: mobileApp.id,
        statusId: maTodo.id,
        assigneeId: carol.id,
        title: 'Dark mode implementation',
        description: 'Add system-aware dark mode using React Native Appearance API across all screens.',
        order: 4,
      },
      {
        projectId: mobileApp.id,
        statusId: maTodo.id,
        assigneeId: null,
        title: 'Push notification preferences screen',
        description: 'Settings screen allowing granular control over notification categories and quiet hours.',
        order: 5,
      },
    ],
  });

  // API Gateway Service tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: apiGateway.id,
        statusId: agDone.id,
        assigneeId: dave.id,
        title: 'Design routing architecture',
        description: 'Document service routing strategy, path rewriting rules, and load balancing approach.',
        order: 0,
      },
      {
        projectId: apiGateway.id,
        statusId: agDone.id,
        assigneeId: eve.id,
        title: 'JWT validation middleware',
        description: 'Centralised token validation at gateway layer, propagating user claims to downstream services.',
        order: 1,
      },
      {
        projectId: apiGateway.id,
        statusId: agCodeReview.id,
        assigneeId: dave.id,
        title: 'Rate limiting per API key',
        description: 'Sliding-window rate limiter using Redis, configurable per client tier (free/pro/enterprise).',
        order: 2,
      },
      {
        projectId: apiGateway.id,
        statusId: agInProgress.id,
        assigneeId: eve.id,
        title: 'Request/response logging pipeline',
        description: 'Structured JSON logs for all gateway traffic, shipped to OpenSearch via Fluentd.',
        order: 3,
      },
      {
        projectId: apiGateway.id,
        statusId: agTodo.id,
        assigneeId: dave.id,
        title: 'Circuit breaker implementation',
        description: 'Prevent cascade failures by wrapping downstream calls with Opossum circuit breaker.',
        order: 4,
      },
      {
        projectId: apiGateway.id,
        statusId: agTodo.id,
        assigneeId: null,
        title: 'API versioning strategy',
        description: 'Define and implement URL-based versioning (v1/v2) with header-based fallback.',
        order: 5,
      },
      {
        projectId: apiGateway.id,
        statusId: agBacklog.id,
        assigneeId: null,
        title: 'GraphQL federation support',
        description: 'Evaluate and prototype Apollo Federation for unifying GraphQL schemas across services.',
        order: 6,
      },
    ],
  });

  // Analytics Dashboard tasks (project completed — all tasks done)
  await prisma.task.createMany({
    data: [
      {
        projectId: analytics.id,
        statusId: anDone.id,
        assigneeId: carol.id,
        title: 'KPI metrics data model',
        description: 'Design Postgres schema for time-series KPI storage with efficient range queries.',
        order: 0,
      },
      {
        projectId: analytics.id,
        statusId: anDone.id,
        assigneeId: dave.id,
        title: 'Revenue chart components',
        description: 'Interactive Recharts components for MRR, ARR, and churn with date-range picker.',
        order: 1,
      },
      {
        projectId: analytics.id,
        statusId: anDone.id,
        assigneeId: eve.id,
        title: 'User behaviour funnel analysis',
        description: 'Implement conversion funnel visualisation from sign-up to first paid subscription.',
        order: 2,
      },
      {
        projectId: analytics.id,
        statusId: anDone.id,
        assigneeId: carol.id,
        title: 'Scheduled PDF report export',
        description: 'Weekly PDF report generation and delivery to stakeholders via SendGrid.',
        order: 3,
      },
      {
        projectId: analytics.id,
        statusId: anDone.id,
        assigneeId: dave.id,
        title: 'Role-based dashboard access',
        description: 'Restrict sensitive metrics (revenue, churn) to ADMIN and MAINTAINER roles only.',
        order: 4,
      },
      {
        projectId: analytics.id,
        statusId: anInProgress.id,
        assigneeId: null,
        title: 'Real-time active users widget',
        description: 'WebSocket-driven live counter showing currently active sessions on the platform.',
        order: 5,
      },
      {
        projectId: analytics.id,
        statusId: anTodo.id,
        assigneeId: null,
        title: 'Mobile responsive dashboard',
        description: 'Adapt all chart layouts and data tables for tablets and mobile viewports.',
        order: 6,
      },
      {
        projectId: analytics.id,
        statusId: anBacklog.id,
        assigneeId: null,
        title: 'Predictive churn model integration',
        description: 'Surface ML model churn-risk scores per user on the customer detail screen.',
        order: 7,
      },
    ],
  });

  console.log('  ✓ Created tasks across all projects\n');

  // ── Summary ──────────────────────────────────────────────
  console.log('✅ Seed complete!\n');
  console.log('─────────────────────────────────────');
  console.log('  Accounts (password in parentheses)');
  console.log('─────────────────────────────────────');
  console.log('  ADMIN      admin@pma.dev     (Admin123!)');
  console.log('  MAINTAINER alice@pma.dev     (Alice123!)');
  console.log('  MAINTAINER bob@pma.dev       (Bob123!)');
  console.log('  MEMBER     carol@pma.dev     (Carol123!)');
  console.log('  MEMBER     dave@pma.dev      (Dave123!)');
  console.log('  MEMBER     eve@pma.dev       (Eve123!)');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
