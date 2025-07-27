'use client';

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold text-sm focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  const variantStyles = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus:ring-[var(--primary)]',
    outline: 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)] focus:ring-[var(--primary)]',
    danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] focus:ring-[var(--danger)]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}