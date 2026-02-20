import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-primary-600">ProjectFlow</span>
          <p className="mt-1 text-sm text-neutral-500">Production-grade project management</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
