import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/ui/shared/Button';
import { AlertTriangle, Home } from 'lucide-react';

interface ErrorPageProps {
  title?: string;
  message?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'Что-то пошло не так',
  message = 'Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.',
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4 sm:px-0">
    <AlertTriangle className="h-16 w-16 text-red-500" />
    <h1 className="mt-4 text-4xl font-bold text-gray-800">{title}</h1>
    <p className="mt-2 text-lg text-gray-600">{message}</p>
    <Link to="/" className="mt-6">
      <Button variant="primary" icon={<Home className="h-4 w-4" />}>
        На главную
      </Button>
    </Link>
  </div>
);
