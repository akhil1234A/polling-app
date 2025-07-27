'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Poll, UpdatePollDto, VoteDto } from '@/lib/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import UserSearch from '@/components/UserSearch';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const updateSchema = z.object({
  question: z.string().min(1).optional(),
  options: z
    .array(z.string().min(1))
    .min(2)
    .refine((opts) => new Set(opts).size === opts.length, {
      message: 'Options must be unique',
    })
    .optional(),
  durationMinutes: z.number().min(1).max(120).optional(),
  isPrivate: z.boolean().optional(),
  allowedUsers: z.array(z.string().email()).optional(),
});

const voteSchema = z.object({
  option: z.string().min(1),
});

type UpdateFormData = z.infer<typeof updateSchema>;
type VoteFormData = z.infer<typeof voteSchema>;

interface PollPageProps {
  params: { id: string };
}

export default function PollPage({ params }: PollPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const {
    register: updateRegister,
    handleSubmit: handleUpdate,
    formState: { errors: updateErrors, isSubmitting: updating },
    reset: resetUpdate,
    control,
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: { allowedUsers: [] },
  });

  const {
    register: voteRegister,
    handleSubmit: handleVote,
    formState: { errors: voteErrors, isSubmitting: voting },
  } = useForm<VoteFormData>({ resolver: zodResolver(voteSchema) });

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const res = await api.get(`/polls/${params.id}`);
        const p: Poll = res.data.poll;
        setPoll(p);
        resetUpdate({
          question: p.question,
          options: p.options,
          durationMinutes: (new Date(p.expiresAt).getTime() - Date.now()) / 60000,
          isPrivate: p.isPrivate,
          allowedUsers: p.allowedUsers,
        });
      } catch {
        setError('Poll not found');
        toast.error('Poll not found');
      }
    };
    loadPoll();
  }, [params.id, resetUpdate]);

  useEffect(() => {
    if (poll?.expiresAt && poll.isActive) {
      const interval = setInterval(() => {
        if (new Date(poll.expiresAt) < new Date()) {
          setPoll((prev) => prev && { ...prev, isActive: false });
          toast.info('This poll has expired');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [poll]);

  const onUpdateSubmit = async (data: UpdateFormData) => {
    try {
      const res = await api.patch(`/polls/${params.id}`, data);
      setPoll(res.data.poll);
      setIsEditing(false);
      toast.success('Poll updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const onVoteSubmit = async (data: VoteFormData) => {
    try {
      const res = await api.post(`/polls/${params.id}/vote`, data);
      setPoll(res.data.poll);
      toast.success('Vote recorded');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Vote failed');
    }
  };

  const deletePoll = async () => {
    if (confirm('Delete this poll?')) {
      try {
        await api.delete(`/polls/${params.id}`);
        toast.success('Poll deleted');
        router.push('/dashboard');
      } catch {
        toast.error('Delete failed');
      }
    }
  };

  if (!poll) return <p>{error || 'Loading...'}</p>;

  const hasVoted = poll.votes.some((v) => v.userId === user?.email);
  const isAdmin = user?.role === 'admin';
  const voteCounts = poll.votes.reduce(
    (acc, v) => ({ ...acc, [v.option]: (acc[v.option] || 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{poll.question}</h1>
      <p className="text-sm text-gray-600 mb-2">
        {poll.isActive ? 'Active' : 'Expired'} |{' '}
        {poll.expiresAt && `Expires: ${new Date(poll.expiresAt).toLocaleString()}`}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        {poll.isPrivate ? `Private (${poll.allowedUsers.join(', ')})` : 'Public'}
      </p>

      {isEditing && isAdmin ? (
        <form onSubmit={handleUpdate(onUpdateSubmit)} className="space-y-4">
          <Input label="Question" {...updateRegister('question')} error={updateErrors.question?.message} />
          {poll.options.map((opt, i) => (
            <Input
              key={i}
              {...updateRegister(`options.${i}`)}
              defaultValue={opt}
              error={updateErrors.options?.[i]?.message}
            />
          ))}
          <Input
            label="Duration (minutes)"
            type="number"
            {...updateRegister('durationMinutes', { valueAsNumber: true })}
            error={updateErrors.durationMinutes?.message}
            readOnly
          />
          <label className="flex items-center">
            <input type="checkbox" {...updateRegister('isPrivate')} className="mr-2" />
            Private
          </label>
          <UserSearch control={control} name="allowedUsers" error={updateErrors.allowedUsers?.message} />
          <div className="flex gap-2">
            <Button type="submit" disabled={updating}>
              {updating ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" onClick={() => setIsEditing(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          {poll.isActive && !hasVoted && user?.role === 'user' && (
            <form onSubmit={handleVote(onVoteSubmit)} className="space-y-4">
              {poll.options.map((opt) => (
                <label key={opt} className="flex items-center">
                  <input type="radio" value={opt} {...voteRegister('option')} className="mr-2" />
                  {opt}
                </label>
              ))}
              {voteErrors.option && <p className="text-red-500 text-sm">{voteErrors.option.message}</p>}
              <Button type="submit" disabled={voting}>
                {voting ? 'Voting...' : 'Vote'}
              </Button>
            </form>
          )}

          {(hasVoted || !poll.isActive) && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <Bar
                data={{
                  labels: poll.options,
                  datasets: [
                    {
                      label: 'Votes',
                      data: poll.options.map((opt) => voteCounts[opt] || 0),
                      backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false }, title: { display: true, text: 'Poll Results' } },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Votes' } },
                    x: { title: { display: true, text: 'Options' } },
                  },
                }}
              />
            </div>
          )}

          {isAdmin && poll.isActive && (
            <div className="flex space-x-2 mt-6">
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
              <Button onClick={deletePoll} variant="danger">
                Delete
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
