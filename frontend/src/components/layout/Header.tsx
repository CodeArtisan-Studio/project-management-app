'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useSidebar } from '@/providers/SidebarProvider';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps): JSX.Element {
  const { user } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggle}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium text-neutral-900">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-neutral-500">{user.role}</span>
          </div>
        </div>
      )}
    </header>
  );
}
