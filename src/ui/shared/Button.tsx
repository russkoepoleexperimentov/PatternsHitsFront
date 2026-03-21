import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    ) : icon ? (
      <span className="h-4 w-4">{icon}</span>
    ) : null}
    {children}
  </button>
);
