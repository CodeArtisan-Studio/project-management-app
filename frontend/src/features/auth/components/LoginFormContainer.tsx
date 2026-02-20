'use client';

import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { LoginForm } from './LoginForm';

export function LoginFormContainer(): JSX.Element {
  const formProps = useLoginForm();
  return <LoginForm {...formProps} />;
}
