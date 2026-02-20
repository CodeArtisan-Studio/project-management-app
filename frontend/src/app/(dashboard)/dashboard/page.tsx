import type { Metadata } from 'next';
import { DashboardPageContainer } from '@/features/dashboard/components/DashboardPageContainer';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage(): JSX.Element {
  return <DashboardPageContainer />;
}
