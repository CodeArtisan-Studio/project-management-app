'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useSidebar } from '@/providers/SidebarProvider';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    href: ROUTES.DASHBOARD,
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: ROUTES.PROJECTS,
    label: 'Projects',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    ),
  },
  {
    href: ROUTES.ACTIVITY,
    label: 'Activity',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: ROUTES.PROFILE,
    label: 'Profile',
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200 bg-white transition-[width,transform] duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0',
          // Mobile: always full width, translate in/out
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
          // Desktop: width driven by collapsed state
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
          {!isCollapsed && (
            <Link
              href={ROUTES.DASHBOARD}
              className="truncate text-lg font-bold text-primary-600 lg:block"
            >
              ProjectFlow
            </Link>
          )}
          {isCollapsed && (
            <Link
              href={ROUTES.DASHBOARD}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white"
              aria-label="ProjectFlow home"
            >
              P
            </Link>
          )}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1 p-2', isCollapsed ? 'overflow-hidden' : 'overflow-y-auto')} aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isCollapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>

                {/* Collapsed tooltip */}
                {isCollapsed && (
                  <div
                    className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    {item.label}
                    {/* Arrow */}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-neutral-200 p-2 space-y-1">
          {/* Collapse toggle — desktop only */}
          <div className="group relative hidden lg:block">
            <button
              onClick={toggleCollapse}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700',
                isCollapsed && 'justify-center px-2',
              )}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                /* Right-pointing chevrons */
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                /* Left-pointing chevrons */
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {!isCollapsed && <span className="truncate">Collapse</span>}
            </button>

            {/* Collapsed tooltip */}
            {isCollapsed && (
              <div
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                aria-hidden="true"
              >
                Expand sidebar
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
              </div>
            )}
          </div>

          {/* Sign out */}
          <div className="group relative">
            <button
              onClick={logout}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-700',
                isCollapsed && 'justify-center px-2',
              )}
              aria-label="Sign out"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              {!isCollapsed && <span className="truncate">Sign out</span>}
            </button>

            {/* Collapsed tooltip */}
            {isCollapsed && (
              <div
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                aria-hidden="true"
              >
                Sign out
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
