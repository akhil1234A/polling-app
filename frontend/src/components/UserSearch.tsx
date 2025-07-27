'use client';

import { useState, useEffect } from 'react';
import { Control, useController } from 'react-hook-form';
import api from '../lib/api';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

interface UserSearchProps {
  control: Control;
  name: string;
  error?: string;
}

interface User {
  _id: string;
  email: string;
}

export default function UserSearch({ control, name, error }: UserSearchProps) {
  const { field } = useController({ control, name });
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(field.value || []);

  useEffect(() => {
    const fetchUsers = debounce(async () => {
      if (!query) return setUsers([]);
      try {
        const res = await api.get(`/auth/search?email=${query}`);
        setUsers(res.data.users);
      } catch {
        toast.error('Failed to fetch users');
      }
    }, 400);

    fetchUsers();
    return () => fetchUsers.cancel();
  }, [query]);

  const handleSelect = (email: string) => {
    const updated = selectedUsers.includes(email)
      ? selectedUsers.filter((e) => e !== email)
      : [...selectedUsers, email];

    setSelectedUsers(updated);
    field.onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">Allowed Users (emails)</label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by email..."
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      {users.length > 0 && (
        <div className="max-h-40 overflow-y-auto bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-[var(--shadow)]">
          {users.map((user) => (
            <div
              key={user._id}
              className={`p-3 cursor-pointer hover:bg-[var(--border)] text-[var(--foreground)] ${
                selectedUsers.includes(user.email) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSelect(user.email)}
            >
              {user.email}
            </div>
          ))}
        </div>
      )}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map((email) => (
            <span
              key={email}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200"
              onClick={() => handleSelect(email)}
            >
              {email} &times;
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
    </div>
  );
}