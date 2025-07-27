'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Poll } from '../../lib/types';
import PollCard from '../../components/PollCard';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import Button from '../../components/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: 'all', visibility: 'all', voted: false });
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchPolls = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await api.get('/polls', {
        params: {
          status: filters.status !== 'all' ? filters.status : undefined,
          visibility: filters.visibility !== 'all' ? filters.visibility : undefined,
          voted: filters.voted ? 'true' : undefined,
        },
      });
      setPolls(response.data.polls);
    } catch (err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [filters]);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
    </div>
  );
  if (isError) return (
    <p className="text-[var(--danger)] text-center">Failed to load polls. Please try again.</p>
  );

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
          {user?.role === 'admin' && (
            <Link href="/polls/create" className="inline-block">
              <Button>Create Poll</Button>
            </Link>
          )}
        </div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 bg-[var(--card-bg)] p-4 rounded-lg shadow-[var(--shadow)]">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] focus:ring-[var(--primary)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Visibility</label>
            <select
              value={filters.visibility}
              onChange={(e) => handleFilterChange('visibility', e.target.value)}
              className="w-full p-2 border rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] focus:ring-[var(--primary)]"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.voted}
              onChange={(e) => handleFilterChange('voted', e.target.checked)}
              className="h-4 w-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
            />
            <span className="text-sm text-[var(--foreground)]">Voted Polls</span>
          </label>
        </div>
        {polls.length === 0 ? (
          <p className="text-[var(--secondary)] text-center">No polls available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <PollCard key={poll._id} poll={poll} user={user} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}