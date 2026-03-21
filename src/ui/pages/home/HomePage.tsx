import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/ui/context/AuthContext';
import { Users, Wallet, CreditCard, FileText } from 'lucide-react';

interface ServiceCard {
  title: string;
  icon: React.ReactNode;
  link: string;
  description: string;
  color: string;
}

const services: ServiceCard[] = [
  {
    title: 'Пользователи',
    icon: <Users className="h-10 w-10" />,
    link: '/users',
    description: 'Управление пользователями, блокировка, назначение ролей',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Счета',
    icon: <Wallet className="h-10 w-10" />,
    link: '/accounts',
    description: 'Просмотр счетов, транзакции, пополнение и снятие',
    color: 'text-green-600 bg-green-50',
  },
  {
    title: 'Тарифы',
    icon: <CreditCard className="h-10 w-10" />,
    link: '/tariffs',
    description: 'Управление тарифами по кредитам',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    title: 'Кредиты',
    icon: <FileText className="h-10 w-10" />,
    link: '/credits',
    description: 'Просмотр кредитных заявок, одобрение и отказ',
    color: 'text-purple-600 bg-purple-50',
  },
];

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Добро пожаловать, {user?.profile?.name || user?.profile?.email || 'Администратор'}!
      </h1>
      <p className="mt-2 text-gray-500">
        Это панель управления банковской системой. Выберите раздел для работы.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Link
            key={service.link}
            to={service.link}
            className="group rounded-xl border border-gray-200 p-6 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${service.color}`}>
              {service.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {service.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{service.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
