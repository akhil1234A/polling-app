'use client';

import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import UserSearch from '../../../components/UserSearch';

const schema = z.object({
  question: z.string().min(1, 'Question is required'),
  durationMinutes: z.number().min(1).max(120),
  isPrivate: z.boolean(),
  allowedUsers: z.array(z.string().email()),
});

const optionsSchema = z
  .array(z.string().min(1, 'Option cannot be empty'))
  .min(2, 'At least two options required')
  .refine((opts) => new Set(opts).size === opts.length, {
    message: 'Options must be unique',
  });

type FormData = z.infer<typeof schema>;

export default function CreatePollPage() {
  const { user } = useAuth();
  const router = useRouter();

  // useForm for question, durationMinutes, isPrivate, and allowedUsers
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      question: '',
      durationMinutes: 60,
      isPrivate: false,
      allowedUsers: [],
    },
  });

  // useState for options
  const [options, setOptions] = useState<string[]>(['', '']);
  const [optionErrors, setOptionErrors] = useState<string[]>([]);

  // Watch form values for preview
  const formValues = useWatch({ control, defaultValue: { question: '', durationMinutes: 60, isPrivate: false, allowedUsers: [] } });

  if (user?.role !== 'admin') {
    return <p className="text-red-500 mt-10 text-center">Access denied. Admins only.</p>;
  }

  // Handle option changes
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Add a new option
  const addOption = () => {
    setOptions((prev) => [...prev, '']);
  };

  // Remove an option
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
      setOptionErrors((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Validate options
      optionsSchema.parse(options);
      const fullData = { ...data, options }; // Combine form data with options
      await api.post('/polls', fullData);
      toast.success('Poll created successfully');
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newOptionErrors = new Array(options.length).fill('');
        error.issues.forEach((issue: z.ZodIssue) => {
          if (issue.path[0] === 'options' && typeof issue.path[1] === 'number') {
            newOptionErrors[issue.path[1]] = issue.message;
          }
        });
        setOptionErrors(newOptionErrors);
        if (error.issues.some((issue) => issue.path[0] === 'options' && typeof issue.path[1] !== 'number')) {
          toast.error('Options must be unique and at least two are required');
        }
      } else {
        toast.error('Failed to create poll');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Create a New Poll</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Question"
          {...register('question')}
          error={errors.question?.message}
        />

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  label={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  error={optionErrors[index]}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {optionErrors.some((err) => err) && (
            <p className="text-sm text-red-500 mt-1">Please fix option errors</p>
          )}
          <button
            type="button"
            onClick={addOption}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            + Add another option
          </button>
        </div>

        <Input
          label="Duration (in minutes)"
          type="number"
          {...register('durationMinutes', { valueAsNumber: true })}
          error={errors.durationMinutes?.message}
        />

        {/* Privacy Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('isPrivate')}
            className="h-4 w-4 text-blue-600"
          />
          <label className="text-sm text-gray-700">Make this a private poll</label>
        </div>

        {/* Allowed users (for private poll) */}
        {formValues.isPrivate && (
          <UserSearch
            control={control}
            name="allowedUsers"
            error={errors.allowedUsers?.message}
          />
        )}

        {/* Preview */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          <div className="p-4 bg-gray-50 rounded border text-sm">
            <p className="font-medium">{formValues.question || 'Your question'}</p>
            <ul className="mt-2 list-disc pl-5 text-gray-700">
              {options.map((opt, i) => (
                <li key={i}>{opt || `Option ${i + 1}`}</li>
              ))}
            </ul>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
          {isSubmitting ? 'Creating...' : 'Create Poll'}
        </Button>
      </form>
    </div>
  );
}