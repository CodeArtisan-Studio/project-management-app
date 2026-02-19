import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@/generated/prisma/client';
import { env } from '@/config/env';
import { AppError } from '@/utils/appError';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.dto';

const SALT_ROUNDS = 12;

interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as string,
  } as jwt.SignOptions);
}

function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password: _, ...sanitized } = user;
  return sanitized;
}

export const authService = {
  async register(data: RegisterInput): Promise<AuthResult> {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict('A user with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await authRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken(user.id, user.role);

    return { user: sanitizeUser(user), token };
  },

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const token = generateToken(user.id, user.role);

    return { user: sanitizeUser(user), token };
  },
};
