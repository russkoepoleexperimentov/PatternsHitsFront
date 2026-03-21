import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div
      className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`}
    />
  </div>
);

export const PageSpinner: React.FC = () => (
  <Spinner size="lg" className="my-20" />
);
