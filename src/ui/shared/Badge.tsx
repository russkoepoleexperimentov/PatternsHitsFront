import React from 'react';

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
  >
    {children}
  </span>
);
