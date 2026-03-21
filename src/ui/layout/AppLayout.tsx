import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/ui/context/AuthContext';
import {
  Home,
  Users,
  Wallet,
  CreditCard,
  FileText,
  UserCircle,
  LogOut,
  Building2,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Login page — no layout
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  const navItems: NavItem[] = [
    { key: '/', label: 'Главная', icon: <Home className="h-4 w-4" />, to: '/' },
    { key: '/users', label: 'Пользователи', icon: <Users className="h-4 w-4" />, to: '/users' },
    { key: '/accounts', label: 'Счета', icon: <Wallet className="h-4 w-4" />, to: '/accounts' },
    { key: '/tariffs', label: 'Тарифы', icon: <CreditCard className="h-4 w-4" />, to: '/tariffs' },
    { key: '/credits', label: 'Кредиты', icon: <FileText className="h-4 w-4" />, to: '/credits' },
  ];

  if (user) {
    navItems.push({
      key: '/profile',
      label: 'Профиль',
      icon: <UserCircle className="h-4 w-4" />,
      to: '/profile',
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span>Банк</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) =>
              item.to ? (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : null,
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
          {navItems.map((item) =>
            item.to ? (
              <Link
                key={item.key}
                to={item.to}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  location.pathname === item.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : null,
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
        © 2025 Банк — Панель управления
      </footer>
    </div>
  );
};
