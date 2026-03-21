import React, { useEffect, useState } from 'react';

import { PageHeader } from '@/ui/shared/PageHeader';
import { DetailRow } from '@/ui/shared/DetailRow';
import {  UserCircle } from 'lucide-react';
import { User } from '@/domain/models/user';
import { authApiService } from '@/infrastructure/api';
import { useToast } from '@/ui/shared/Toast';
import { Spinner } from '@/ui/shared/Spinner';

export const ProfilePage: React.FC = () => {

  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {

    const fetchUser = async () => {
      setIsLoading(true);
      await authApiService.getLoggedInUser()
        .then(setUser)
        .catch((error) => {
          console.error('Ошибка при загрузке данных пользователя', error);
          toast.info('Ошибка при загрузке данных пользователя');
          setUser(null);
        });
      setIsLoading(false);
    }

    fetchUser();
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Профиль" subtitle="Информация о текущем пользователе" />
      
      {isLoading ? <Spinner /> : (<> 
      <div className="mb-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <UserCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.credentials  || '<Пользователь>'}
          </h3>
          <p className="text-sm text-gray-500">{user?.email || '—'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-6">
        <h4 className="mb-4 text-sm font-semibold uppercase text-gray-400">Детали</h4>
        <DetailRow label="ID">{user?.id || '—'}</DetailRow>
        <DetailRow label="Email">{user?.email || '—'}</DetailRow>
        <DetailRow label="Имя">{user?.credentials || '—'}</DetailRow>
      </div>
      </>)}
    </div>
  );
};
