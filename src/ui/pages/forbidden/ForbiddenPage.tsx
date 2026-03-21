import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/ui/context/AuthContext';
import { Button } from '@/ui/shared/Button';
import { Home, LogOut } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-7xl font-bold text-red-200">403</h1>
      <p className="mt-4 text-xl font-semibold text-gray-700">Доступ запрещён</p>
      <p className="mt-2 text-gray-500">
        Извините, у вас нет доступа к этой странице.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button variant="primary" icon={<Home className="h-4 w-4" />}>
            На главную
          </Button>
        </Link>
        <Button variant="secondary" icon={<LogOut className="h-4 w-4" />} onClick={logout}>
          Выйти
        </Button>
      </div>
    </div>
  );
};
