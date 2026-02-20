import type { Metadata } from 'next';
import { RegisterFormContainer } from '@/features/auth/components/RegisterFormContainer';

export const metadata: Metadata = {
  title: 'Create account',
};

export default function RegisterPage(): JSX.Element {
  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-neutral-900">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">Get started in seconds.</p>
      </div>
      <RegisterFormContainer />
    </>
  );
}
