
import { useEffect } from 'react';
import { useAuth } from '@/ui/context/AuthContext';
import { useToast } from '@/ui/shared/Toast';
import { pushService } from '@/infrastructure/push/pushService';

export function PushNotificationInitializer() {
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = pushService.onForegroundMessage((payload) => {
      const message =
        payload.notification?.body ??
        payload.notification?.title ??
        'Новое уведомление';
      toast.info(message);
    });

    return unsubscribe;
  }, [user, toast]);

  return null;
}
