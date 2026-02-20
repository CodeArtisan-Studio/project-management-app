'use client';

import { Modal } from '@/components/ui/Modal';
import { useCreateProjectForm } from '../hooks/useCreateProjectForm';
import { CreateProjectForm } from './CreateProjectForm';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps): JSX.Element {
  const form = useCreateProjectForm(onClose);

  const handleClose = (): void => {
    form.reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New project">
      <CreateProjectForm
        fields={form.fields}
        errors={form.errors}
        serverError={form.serverError}
        isPending={form.isPending}
        onSubmit={form.onSubmit}
        onCancel={handleClose}
      />
    </Modal>
  );
}
