import Link from 'next/link';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

interface RegisterFormProps {
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

export function RegisterForm({
  fields,
  errors,
  serverError,
  isSubmitting,
  onSubmit,
}: RegisterFormProps): JSX.Element {
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          type="text"
          autoComplete="given-name"
          placeholder="Jane"
          error={errors.firstName}
          {...fields.firstName}
        />
        <Input
          label="Last name"
          type="text"
          autoComplete="family-name"
          placeholder="Doe"
          error={errors.lastName}
          {...fields.lastName}
        />
      </div>

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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Minimum 8 characters"
        error={errors.password}
        {...fields.password}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href={ROUTES.LOGIN} className="text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
