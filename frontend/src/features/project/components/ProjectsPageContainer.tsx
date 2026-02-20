'use client';

import { Header } from '@/components/layout/Header';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { ProjectListContainer } from './ProjectListContainer';
import { CreateProjectModal } from './CreateProjectModal';
import { useProjectsPage } from '../hooks/useProjectsPage';

export function ProjectsPageContainer(): JSX.Element {
  const { isCreateOpen, openCreate, closeCreate, canCreate } = useProjectsPage();

  return (
    <>
      <Header title="Projects" />
      <PageContainer>
        <PageHeader
          title="Projects"
          description="All projects you have access to."
          action={
            canCreate ? (
              <Button onClick={openCreate}>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                New project
              </Button>
            ) : undefined
          }
        />

        <ProjectListContainer />

        {canCreate && (
          <CreateProjectModal isOpen={isCreateOpen} onClose={closeCreate} />
        )}
      </PageContainer>
    </>
  );
}
