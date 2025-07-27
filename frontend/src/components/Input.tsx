'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
      <input
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] ${error ? 'border-[var(--danger)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
    </div>
  );
}