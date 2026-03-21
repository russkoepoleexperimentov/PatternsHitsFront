import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/ui/context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // In real app, check role from token:
  // const role = getRoleFromToken(user.access_token);
  // if (!isRoleAllowed(role)) return <Navigate to="/forbidden" replace />;

  return <>{children}</>;
};
