import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { env } from './env';

const pool = new Pool({ connectionString: env.databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

// ─── Soft-Delete Extension ─────────────────────────────
// Activate when models with `deletedAt` are added to the
// Prisma schema. Uses `$extends` to:
// - Filter soft-deleted records on reads (findMany, findFirst, count)
// - Redirect delete/deleteMany to set deletedAt instead of removing rows
//
// Usage (uncomment and export extendedPrisma instead of prisma):
//
// const extendedPrisma = prisma.$extends({
//   query: {
//     $allModels: {
//       async findMany({ args, query }) {
//         args.where = { ...args.where, deletedAt: args.where?.deletedAt ?? null };
//         return query(args);
//       },
//       async findFirst({ args, query }) {
//         args.where = { ...args.where, deletedAt: args.where?.deletedAt ?? null };
//         return query(args);
//       },
//       async count({ args, query }) {
//         args.where = { ...args.where, deletedAt: args.where?.deletedAt ?? null };
//         return query(args);
//       },
//       async delete({ args, model }) {
//         return (prisma as any)[model].update({
//           ...args,
//           data: { deletedAt: new Date() },
//         });
//       },
//       async deleteMany({ args, model }) {
//         return (prisma as any)[model].updateMany({
//           ...args,
//           data: { deletedAt: new Date() },
//         });
//       },
//     },
//   },
// });
// ────────────────────────────────────────────────────────

const gracefulDisconnect = async (): Promise<void> => {
  await prisma.$disconnect();
  await pool.end();
};

process.on('beforeExit', gracefulDisconnect);

export { prisma, pool };
