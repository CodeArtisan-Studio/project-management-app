'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { SidebarProvider, useSidebar } from '@/providers/SidebarProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <FullPageSpinner />;
  }

  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
}

function DashboardShell({ children }: { children: ReactNode }): JSX.Element {
  const { isOpen, close } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar isOpen={isOpen} onClose={close} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
