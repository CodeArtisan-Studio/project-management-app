'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { useUpdateProfile, useDeleteUser, useUsers } from '@/features/user/hooks/useUsers';
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from '@/features/user/schemas/profile.schema';
import { getApiErrorMessage, getInitials } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/types/user.types';

// ─── Role badge ───────────────────────────────────────────

const roleMeta: Record<UserRole, { label: string; className: string }> = {
  ADMIN: { label: 'Admin', className: 'bg-red-100 text-red-700' },
  MAINTAINER: { label: 'Maintainer', className: 'bg-amber-100 text-amber-700' },
  MEMBER: { label: 'Member', className: 'bg-blue-100 text-blue-700' },
};

function RoleBadge({ role }: { role: UserRole }): JSX.Element {
  const meta = roleMeta[role];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

// ─── Edit profile form ────────────────────────────────────

function EditProfileSection(): JSX.Element {
  const { user, refreshUser } = useAuth();
  const { mutateAsync, isPending } = useUpdateProfile();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values): Promise<void> => {
    setServerError(null);
    setSaved(false);
    try {
      await mutateAsync(values);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Failed to update profile.'));
    }
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-1 text-base font-semibold text-neutral-900">Edit profile</h2>
      <p className="mb-5 text-sm text-neutral-500">Update your personal information.</p>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {serverError}
          </div>
        )}
        {saved && (
          <div
            className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            role="status"
          >
            Profile updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            placeholder="Jane"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex justify-end pt-1">
          <Button type="submit" isLoading={isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}

// ─── Profile info card ────────────────────────────────────

function ProfileCard(): JSX.Element {
  const { user } = useAuth();

  if (!user) return <></>;

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white p-6 text-center">
      {/* Avatar */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white shadow-sm">
        {getInitials(user.firstName, user.lastName)}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-lg font-semibold text-neutral-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-neutral-500">{user.email}</p>
      </div>

      <div className="mt-3">
        <RoleBadge role={user.role} />
      </div>

      <div className="mt-4 w-full border-t border-neutral-100 pt-4">
        <dl className="space-y-2 text-left">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-neutral-500">Member since</dt>
            <dd className="font-medium text-neutral-700">{joinedDate}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-neutral-500">Account ID</dt>
            <dd className="max-w-[120px] truncate font-mono text-xs text-neutral-400" title={user.id}>
              {user.id.slice(0, 8)}…
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

// ─── Admin: user management table ────────────────────────

function UserManagementSection(): JSX.Element {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUsers({ page, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { user: currentUser } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (userId: string): void => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    setDeletingId(userId);
    deleteUser(userId, {
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">User management</h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            All registered accounts in the workspace.
          </p>
        </div>
        {data && (
          <span className="flex h-6 items-center justify-center rounded-full bg-neutral-100 px-3 text-xs font-semibold tabular-nums text-neutral-500">
            {data.meta.total}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-px p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      )}

      {isError && (
        <div className="px-6 py-8 text-center text-sm text-red-600">
          Failed to load users.
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    User
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400 sm:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Role
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400 md:table-cell">
                    Joined
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.data.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {getInitials(u.firstName, u.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {u.firstName} {u.lastName}
                            {u.id === currentUser?.id && (
                              <span className="ml-2 text-xs font-normal text-neutral-400">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-400 sm:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-3 text-neutral-500 sm:table-cell">
                      {u.email}
                    </td>
                    <td className="px-6 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="hidden px-6 py-3 text-neutral-400 md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={isDeleting && deletingId === u.id}
                          className="rounded-md p-1.5 text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${u.firstName} ${u.lastName}`}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-3">
              <p className="text-xs text-neutral-400">
                Page {data.meta.page} of {data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function ProfilePage(): JSX.Element {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <Header title="Profile" />
      <PageContainer>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Top: profile card + edit form */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ProfileCard />
            </div>
            <div className="lg:col-span-2">
              <EditProfileSection />
            </div>
          </div>

          {/* Admin: user management */}
          {isAdmin && <UserManagementSection />}
        </div>
      </PageContainer>
    </>
  );
}
