'use client';

import { useState } from 'react';
import { UpdateProjectFormContainer } from './UpdateProjectFormContainer';
import { MemberListContainer } from './MemberListContainer';
import { StatusListContainer } from '@/features/task/components/StatusListContainer';
import type { Project } from '@/features/project/types/project.types';

type SettingsTab = 'general' | 'members' | 'statuses';

const tabs: { key: SettingsTab; label: string; icon: JSX.Element }[] = [
  {
    key: 'general',
    label: 'General',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: 'members',
    label: 'Members',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
      </svg>
    ),
  },
  {
    key: 'statuses',
    label: 'Board columns',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

interface ProjectSettingsPanelProps {
  project: Project;
  canManage: boolean;
}

export function ProjectSettingsPanel({
  project,
  canManage,
}: ProjectSettingsPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div>
      {/* Tab navigation */}
      <div className="mb-5 flex gap-1 rounded-lg bg-neutral-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'general' && (
        canManage ? (
          <UpdateProjectFormContainer project={project} />
        ) : (
          <div className="rounded-lg border-2 border-dashed border-neutral-200 py-10 text-center">
            <p className="text-sm text-neutral-400">
              Only the project owner or an admin can edit project details.
            </p>
          </div>
        )
      )}

      {activeTab === 'members' && (
        <MemberListContainer project={project} />
      )}

      {activeTab === 'statuses' && (
        <StatusListContainer
          projectId={project.id}
          canManage={canManage}
        />
      )}
    </div>
  );
}
