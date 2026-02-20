'use client';

import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import { RegisterForm } from './RegisterForm';

export function RegisterFormContainer(): JSX.Element {
  const formProps = useRegisterForm();
  return <RegisterForm {...formProps} />;
}
