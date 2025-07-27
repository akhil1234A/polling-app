'use client';

import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import Button from './Button';
import { logout } from '../lib/auth';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-[var(--primary)] text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Polling App
        </Link>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link href="/polls/create" className="text-sm font-medium hover:underline">
                  Create Poll
                </Link>
              )}
              <Button onClick={logout} variant="outline" className="text-white border-white hover:bg-white hover:text-[var(--primary)]">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}