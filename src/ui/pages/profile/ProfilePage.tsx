import React from 'react';
import { useAuth } from '@/ui/context/AuthContext';
import { Button } from '@/ui/shared/Button';
import { PageHeader } from '@/ui/shared/PageHeader';
import { DetailRow } from '@/ui/shared/DetailRow';
import { LogOut, UserCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Профиль" subtitle="Информация о текущем пользователе" />

      <div className="mb-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <UserCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.profile?.name || 'Пользователь'}
          </h3>
          <p className="text-sm text-gray-500">{user?.profile?.email || '—'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-6">
        <h4 className="mb-4 text-sm font-semibold uppercase text-gray-400">Детали</h4>
        <DetailRow label="ID">{user?.profile?.sub || '—'}</DetailRow>
        <DetailRow label="Email">{user?.profile?.email || '—'}</DetailRow>
        <DetailRow label="Имя">{user?.profile?.name || '—'}</DetailRow>
      </div>

      <div className="mt-6">
        <Button variant="danger" icon={<LogOut className="h-4 w-4" />} onClick={logout}>
          Выйти из системы
        </Button>
      </div>
    </div>
  );
};
