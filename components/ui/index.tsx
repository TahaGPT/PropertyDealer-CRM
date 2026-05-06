import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-[#517561] text-white hover:bg-[#3b5d49] shadow-lg shadow-[#517561]/20',
    secondary: 'bg-[#262f2a] text-white hover:bg-[#324b3a]',
    outline: 'border border-[#517561]/30 bg-transparent text-[#517561] hover:bg-[#517561]/5',
    ghost: 'bg-transparent text-[#517561] hover:bg-[#517561]/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#517561]/20 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'flex h-11 w-full rounded-xl border border-[#517561]/20 bg-white/80 px-4 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#517561]/10 focus:border-[#517561] transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-sm text-[#262f2a]',
      className
    )}
    {...props}
  />
);

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('glass-card rounded-2xl p-6 transition-all hover:shadow-lg', className)}>
    {children}
  </div>
);
