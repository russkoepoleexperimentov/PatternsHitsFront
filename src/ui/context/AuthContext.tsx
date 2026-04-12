import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authService } from '@/infrastructure/auth/authService';
import { setApiTokenProvider } from '@/infrastructure/api';
import { pushService } from '@/infrastructure/push/pushService';
import { coreApiService } from '@/infrastructure/api/coreApi';
import type { AuthUser } from '@/domain/models/user';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getUser();
      setUser(currentUser);
      if (currentUser) {
        pushService.requestPermissionAndGetToken().then(token => {
          if (token) coreApiService.registerPushDevice(token);
        });
      }
    } catch (error) {
      console.error('Auth refresh error', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wire up the token provider for API clients
    setApiTokenProvider(() => authService.getAccessToken());

    refresh();
  }, [refresh]);

  const login = useCallback(() => {
    authService.login();
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
