import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/ui/context/AuthContext';
import { ToastProvider } from '@/ui/shared/Toast';
import { AppLayout } from '@/ui/layout/AppLayout';
import { PrivateRoute } from '@/ui/routing/PrivateRoute';
import { PublicRoute } from '@/ui/routing/PublicRoute';
import { PageSpinner } from '@/ui/shared/Spinner';

// Pages
import { HomePage } from '@/ui/pages/home/HomePage';
import { LoginPage } from '@/ui/pages/login/LoginPage';
import { CallbackPage } from '@/ui/pages/login/CallbackPage';
import { ProfilePage } from '@/ui/pages/profile/ProfilePage';
import { UsersPage } from '@/ui/pages/users/UsersPage';
import { AccountsPage } from '@/ui/pages/accounts/AccountsPage';
import { TariffsPage } from '@/ui/pages/tariffs/TariffsPage';
import { CreditsPage } from '@/ui/pages/credits/CreditsPage';
import { NotFoundPage } from '@/ui/pages/notFound/NotFoundPage';
import { ForbiddenPage } from '@/ui/pages/forbidden/ForbiddenPage';
import { LogoutCallbackPage } from '@/ui/pages/login/LogoutCallbackPage';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
      <Route path="/accounts" element={<PrivateRoute><AccountsPage /></PrivateRoute>} />
      <Route path="/tariffs" element={<PrivateRoute><TariffsPage /></PrivateRoute>} />
      <Route path="/credits" element={<PrivateRoute><CreditsPage /></PrivateRoute>} />
      <Route path="/signin-oidc" element={<PublicRoute><CallbackPage /></PublicRoute>} />
      <Route path="/signout-callback-oidc" element={<LogoutCallbackPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
