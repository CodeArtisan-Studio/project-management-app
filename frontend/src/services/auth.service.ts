import { apiPost } from './api';
import type { AuthResult, LoginPayload, RegisterPayload } from '@/features/auth/types/auth.types';

export const authService = {
  login(payload: LoginPayload): Promise<AuthResult> {
    return apiPost<AuthResult>('/auth/login', payload);
  },

  register(payload: RegisterPayload): Promise<AuthResult> {
    return apiPost<AuthResult>('/auth/register', payload);
  },
};
