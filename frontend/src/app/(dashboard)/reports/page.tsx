import type { Metadata } from 'next';
import { ReportsPageContainer } from '@/features/report/components/ReportsPageContainer';

export const metadata: Metadata = {
  title: 'Reports',
};

export default function ReportsPage(): JSX.Element {
  return <ReportsPageContainer />;
}
