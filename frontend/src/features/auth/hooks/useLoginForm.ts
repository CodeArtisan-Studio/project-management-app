'use client';

import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schema';
import { getApiErrorMessage } from '@/lib/utils';

export interface UseLoginFormReturn {
  fields: {
    email: UseFormRegisterReturn<'email'>;
    password: UseFormRegisterReturn<'password'>;
  };
  errors: {
    email?: string;
    password?: string;
  };
  serverError: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function useLoginForm(): UseLoginFormReturn {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values: LoginFormValues): Promise<void> => {
    setServerError(null);
    try {
      await login(values);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Invalid email or password.'));
    }
  });

  return {
    fields: {
      email: register('email'),
      password: register('password'),
    },
    errors: {
      email: errors.email?.message,
      password: errors.password?.message,
    },
    serverError,
    isSubmitting,
    onSubmit,
  };
}
