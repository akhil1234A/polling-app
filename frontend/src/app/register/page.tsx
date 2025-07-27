'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { register } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Link from 'next/link';

const schema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
      .regex(/^\S*$/, 'Password cannot contain spaces'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await register(data.email, data.password);
      setUser(user);
      toast.success('Registered successfully');
      router.push('/dashboard');
    } catch {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-[var(--card-bg)] rounded-lg shadow-[var(--shadow)]">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email"
          type="email"
          {...formRegister('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          {...formRegister('password')}
          error={errors.password?.message}
        />
        <Input
          label="Confirm Password"
          type="password"
          {...formRegister('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
              </svg>
              Registering...
            </span>
          ) : (
            'Register'
          )}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--secondary)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}