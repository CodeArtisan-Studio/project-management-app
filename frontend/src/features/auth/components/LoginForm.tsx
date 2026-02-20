import Link from 'next/link';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

interface LoginFormProps {
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

export function LoginForm({
  fields,
  errors,
  serverError,
  isSubmitting,
  onSubmit,
}: LoginFormProps): JSX.Element {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email}
        {...fields.email}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password}
        {...fields.password}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Sign in
      </Button>

      <p className="text-center text-sm text-neutral-500">
        No account?{' '}
        <Link href={ROUTES.REGISTER} className="text-primary-600 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
