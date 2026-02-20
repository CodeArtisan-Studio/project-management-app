import type { Metadata } from 'next';
import { LoginFormContainer } from '@/features/auth/components/LoginFormContainer';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage(): JSX.Element {
  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-neutral-900">Sign in to your account</h1>
        <p className="mt-1 text-sm text-neutral-500">Enter your credentials to continue.</p>
      </div>
      <LoginFormContainer />
    </>
  );
}
