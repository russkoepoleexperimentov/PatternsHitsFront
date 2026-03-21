import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex items-start justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
