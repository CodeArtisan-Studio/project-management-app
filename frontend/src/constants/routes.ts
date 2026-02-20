export const ROUTES = {
  HOME:     '/',
  LOGIN:    '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROJECTS:  '/projects',
  PROJECT:   (id: string) => `/projects/${id}`,
  TASKS:     '/tasks',
  ACTIVITY:  '/activity',
  REPORTS:   '/reports',
  PROFILE:   '/profile',
} as const;
