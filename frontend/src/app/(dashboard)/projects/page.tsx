import type { Metadata } from 'next';
import { ProjectsPageContainer } from '@/features/project/components/ProjectsPageContainer';

export const metadata: Metadata = {
  title: 'Projects',
};

export default function ProjectsPage(): JSX.Element {
  return <ProjectsPageContainer />;
}
