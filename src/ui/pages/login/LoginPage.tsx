import React from 'react';
import { useAuth } from '@/ui/context/AuthContext';
import { Building2, LogIn } from 'lucide-react';
import { Button } from '@/ui/shared/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Банк</h1>
          <p className="mt-2 text-gray-500">Панель управления</p>
        </div>

        <Button variant="primary" size="lg" className="w-full" onClick={login} icon={<LogIn className="h-4 w-4" />}>
          Войти в систему
        </Button>

        <p className="mt-4 text-center text-xs text-gray-400">
          Авторизация через IdentityServer
        </p>
      </div>
    </div>
  );
};
