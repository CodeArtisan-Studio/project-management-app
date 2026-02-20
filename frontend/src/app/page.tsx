import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

// Root route redirects to the dashboard.
// Middleware handles unauthenticated users and redirects them to login.
export default function RootPage(): never {
  redirect(ROUTES.DASHBOARD);
}
