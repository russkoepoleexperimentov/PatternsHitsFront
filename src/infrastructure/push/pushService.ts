
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, VAPID_KEY } from './firebaseConfig';

export type PushMessagePayload = {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
};

export type PushMessageHandler = (payload: PushMessagePayload) => void;

export const pushService = {
 
  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[pushService] Push notifications not supported in this browser');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[pushService] Notification permission denied');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      return token ?? null;
    } catch (error) {
      console.warn('[pushService] Failed to get FCM token:', error);
      return null;
    }
  },


  onForegroundMessage(handler: PushMessageHandler): () => void {
    return onMessage(messaging, (payload) => {
      handler(payload as PushMessagePayload);
    });
  },
};
