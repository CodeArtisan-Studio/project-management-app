'use client';

import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/auth.schema';
import { getApiErrorMessage } from '@/lib/utils';

export interface UseRegisterFormReturn {
  fields: {
    firstName: UseFormRegisterReturn<'firstName'>;
    lastName: UseFormRegisterReturn<'lastName'>;
    email: UseFormRegisterReturn<'email'>;
    password: UseFormRegisterReturn<'password'>;
  };
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };
  serverError: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function useRegisterForm(): UseRegisterFormReturn {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values: RegisterFormValues): Promise<void> => {
    setServerError(null);
    try {
      await registerUser(values);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    }
  });

  return {
    fields: {
      firstName: register('firstName'),
      lastName: register('lastName'),
      email: register('email'),
      password: register('password'),
    },
    errors: {
      firstName: errors.firstName?.message,
      lastName: errors.lastName?.message,
      email: errors.email?.message,
      password: errors.password?.message,
    },
    serverError,
    isSubmitting,
    onSubmit,
  };
}
