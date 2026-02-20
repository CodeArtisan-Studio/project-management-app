'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AddMemberFormProps {
  serverError: string | null;
  isSubmitting: boolean;
  availableUsers: UserOption[];
  isLoadingUsers: boolean;
  onAdd: (userId: string) => void;
}

export function AddMemberForm({
  serverError,
  isSubmitting,
  availableUsers,
  isLoadingUsers,
  onAdd,
}: AddMemberFormProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter users by name or email
  const filtered = query.trim()
    ? availableUsers.filter((u) => {
        const search = query.toLowerCase();
        return (
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
        );
      })
    : availableUsers;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (user: UserOption): void => {
    setSelectedUser(user);
    setQuery(`${user.firstName} ${user.lastName}`);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!selectedUser) return;
    onAdd(selectedUser.id);
    setQuery('');
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
    setSelectedUser(null);
    setIsOpen(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {serverError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div className="flex items-start gap-2">
        <div ref={containerRef} className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={isLoadingUsers ? 'Loading users…' : 'Search by name or email…'}
            disabled={isLoadingUsers}
            className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
          />

          {/* Dropdown */}
          {isOpen && !isLoadingUsers && (
            <div className="absolute left-0 top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-neutral-400">
                  {query.trim() ? 'No users found' : 'No available users'}
                </p>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-neutral-400">{user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          disabled={!selectedUser}
          className="shrink-0"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add
        </Button>
      </div>
    </form>
  );
}
