import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
