import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/infrastructure/auth/authService';
import { useAuth } from '@/ui/context/AuthContext';
import { PageSpinner } from '@/ui/shared/Spinner';

export const CallbackPage: React.FC = () => {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const isHandledRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (isHandledRef.current) {
        return;
      }
      isHandledRef.current = true;

      try {
        const user = await authService.loginCallback();
        if (!user) {
          console.error('Callback login did not return user, redirect to login');
          navigate('/login');
          return;
        }

        await refresh();
        navigate('/');
      } catch (error) {
        console.error('Callback error', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, refresh]);

  return <PageSpinner />;
};
