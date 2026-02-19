import { prisma } from '@/config/prisma';
import { Role, User } from '@/generated/prisma/client';

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export const authRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  },

  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  },
};
