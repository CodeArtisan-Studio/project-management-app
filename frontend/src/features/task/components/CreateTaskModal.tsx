'use client';

import { useTaskStatuses } from '@/features/task/hooks/useTasks';
import { useProjectMembers } from '@/features/project/hooks/useProjects';
import { useCreateTaskForm } from '@/features/task/hooks/useCreateTaskForm';
import { Modal } from '@/components/ui/Modal';
import { CreateTaskForm } from './CreateTaskForm';

interface CreateTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultStatusId?: string;
}

export function CreateTaskModal({
  projectId,
  isOpen,
  onClose,
  defaultStatusId,
}: CreateTaskModalProps): JSX.Element | null {
  const { data: statuses } = useTaskStatuses(projectId);
  const { data: members } = useProjectMembers(projectId);

  const form = useCreateTaskForm({
    projectId,
    defaultStatusId: defaultStatusId ?? statuses?.[0]?.id,
    onSuccess: onClose,
  });

  const handleClose = (): void => {
    form.reset();
    onClose();
  };

  // Map project members to TaskAssignee shape
  const assignees = members?.map((m) => m.user) ?? [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New task">
      <CreateTaskForm
        fields={form.fields}
        errors={form.errors}
        serverError={form.serverError}
        isSubmitting={form.isSubmitting}
        statuses={statuses ?? []}
        members={assignees}
        onSubmit={form.onSubmit}
        onCancel={handleClose}
      />
    </Modal>
  );
}
