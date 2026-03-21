import React from 'react';

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => (
  <div className="flex gap-2 py-2">
    <span className="min-w-[140px] text-sm font-medium text-gray-500">{label}</span>
    <span className="text-sm text-gray-900">{children}</span>
  </div>
);
