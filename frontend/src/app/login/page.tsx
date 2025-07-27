'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data.email, data.password);
      setUser(user);
      toast.success('Logged in successfully');
      router.push('/dashboard');
    } catch {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-[var(--card-bg)] rounded-lg shadow-[var(--shadow)]">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--secondary)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[var(--primary)] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}