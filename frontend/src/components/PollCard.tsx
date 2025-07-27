'use client';

import Link from 'next/link';
import { Poll, User } from '../lib/types';

interface PollCardProps {
  poll: Poll;
  user: User | null;
}

export default function PollCard({ poll, user }: PollCardProps) {
  const hasVoted = poll.votes.some((vote) => vote.userId === user?.email);

  return (
    <div className="p-5 bg-[var(--card-bg)] rounded-lg shadow-[var(--shadow)] hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{poll.question}</h3>
      <div className="flex flex-wrap gap-2 mt-3">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            poll.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {poll.isActive ? 'Active' : 'Expired'}
        </span>
        {hasVoted && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Voted
          </span>
        )}
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            poll.isPrivate ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {poll.isPrivate ? 'Private' : 'Public'}
        </span>
      </div>
      <Link
        href={`/polls/${poll._id}`}
        className="text-[var(--primary)] hover:underline mt-3 block text-sm font-medium"
      >
        {poll.isActive && !hasVoted && user?.role === 'user' ? 'Vote Now' : 'View Results'}
      </Link>
    </div>
  );
}