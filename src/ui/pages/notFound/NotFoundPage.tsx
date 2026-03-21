import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/ui/shared/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <h1 className="text-7xl font-bold text-gray-200">404</h1>
    <p className="mt-4 text-xl font-semibold text-gray-700">Страница не найдена</p>
    <p className="mt-2 text-gray-500">Извините, запрашиваемая страница не существует.</p>
    <Link to="/" className="mt-6">
      <Button variant="primary" icon={<Home className="h-4 w-4" />}>
        Вернуться на главную
      </Button>
    </Link>
  </div>
);
