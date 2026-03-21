import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/ui/context/AuthContext';
import { ThemeProvider } from '@/ui/context/ThemeContext';
import { ToastProvider } from '@/ui/shared/Toast';
import { AppLayout } from '@/ui/layout/AppLayout';
import { PrivateRoute } from '@/ui/routing/PrivateRoute';
import { PublicRoute } from '@/ui/routing/PublicRoute';
import { PageSpinner } from '@/ui/shared/Spinner';
import { ErrorBoundary } from '@/ui/shared/ErrorBoundary';
import { ErrorPage } from '@/ui/pages/error/ErrorPage';

// Pages
import { HomePage } from '@/ui/pages/home/HomePage';
import { LoginPage } from '@/ui/pages/login/LoginPage';
import { CallbackPage } from '@/ui/pages/login/CallbackPage';
import { ProfilePage } from '@/ui/pages/profile/ProfilePage';
import { UsersPage } from '@/ui/pages/users/UsersPage';
import { AccountsPage } from '@/ui/pages/accounts/AccountsPage';
import { TariffsPage } from '@/ui/pages/tariffs/TariffsPage';
import { CreditsPage } from '@/ui/pages/credits/CreditsPage';
import { OptionsPage } from '@/ui/pages/options/OptionsPage';
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
      <Route element={<ErrorBoundary fallback={<ErrorPage />}><Outlet /></ErrorBoundary>}>
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/options" element={<PrivateRoute><OptionsPage /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        <Route path="/accounts" element={<PrivateRoute><AccountsPage /></PrivateRoute>} />
        <Route path="/tariffs" element={<PrivateRoute><TariffsPage /></PrivateRoute>} />
        <Route path="/credits" element={<PrivateRoute><CreditsPage /></PrivateRoute>} />
      </Route>

      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signin-oidc" element={<PublicRoute><CallbackPage /></PublicRoute>} />
      <Route path="/signout-callback-oidc" element={<LogoutCallbackPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function GlobalErrorHandlers() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[GlobalErrorHandlers] window.onerror:', event.error || event.message, event.filename, event.lineno, event.colno);
      navigate('/error', { replace: true });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('[GlobalErrorHandlers] unhandledrejection:', event.reason);
      navigate('/error', { replace: true });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <GlobalErrorHandlers />
            <AppLayout>
              <ErrorBoundary fallback={<ErrorPage />}>
                <AppRoutes />
              </ErrorBoundary>
            </AppLayout>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
