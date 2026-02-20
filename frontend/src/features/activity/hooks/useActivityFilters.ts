'use client';

import { useState } from 'react';
import type { ActivityAction, GetActivitiesQuery } from '../types/activity.types';

export interface ActivityFiltersState {
  action:       ActivityAction | '';
  userId:       string;
  filters:      Omit<GetActivitiesQuery, 'page' | 'limit'>;
  hasFilters:   boolean;
  setAction:    (action: ActivityAction | '') => void;
  setUserId:    (id: string) => void;
  clearFilters: () => void;
}

export function useActivityFilters(): ActivityFiltersState {
  const [action, setAction] = useState<ActivityAction | ''>('');
  const [userId, setUserId] = useState('');

  const filters: Omit<GetActivitiesQuery, 'page' | 'limit'> = {
    sortOrder: 'desc',
    ...(action && { action }),
    ...(userId && { userId }),
  };

  const hasFilters = !!action || !!userId;

  function clearFilters(): void {
    setAction('');
    setUserId('');
  }

  return { action, setAction, userId, setUserId, filters, hasFilters, clearFilters };
}
