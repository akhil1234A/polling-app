'use client';

import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import Button from '../components/Button';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-6">
        Welcome to Polling App
      </h1>
      <p className="text-lg text-[var(--secondary)] mb-8 max-w-2xl mx-auto">
        Create, share, and vote on polls with ease. Whether you&apos;re gathering opinions or making decisions, our app makes it simple and secure.
      </p>
      {user ? (
        <div>
          <p className="text-xl text-[var(--foreground)] mb-6">Hello, {user.email}!</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      )}
    </div>
  );
}