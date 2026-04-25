import React from 'react';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary:   'bg-primary-100 text-primary-800',
  secondary: 'bg-accent-100 text-accent-700',
  success:   'bg-green-100 text-green-800',
  warning:   'bg-yellow-100 text-yellow-800',
  danger:    'bg-red-100 text-red-800',
  info:      'bg-blue-100 text-blue-800',
};

export default function Badge({ label, variant = 'primary', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}
