'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export interface UseProjectsPageReturn {
  isCreateOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
  canCreate: boolean;
}

export function useProjectsPage(): UseProjectsPageReturn {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();

  const canCreate = user?.role === 'MAINTAINER' || user?.role === 'ADMIN';

  return {
    isCreateOpen,
    openCreate: () => setIsCreateOpen(true),
    closeCreate: () => setIsCreateOpen(false),
    canCreate,
  };
}
