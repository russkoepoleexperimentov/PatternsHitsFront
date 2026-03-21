import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/ui/context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};
