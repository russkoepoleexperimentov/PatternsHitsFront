
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDF3nM16dTzVCWgLzfHafXDY1ITtGcwqhk",

  authDomain: "bankhits-45805.firebaseapp.com",

  projectId: "bankhits-45805",

  storageBucket: "bankhits-45805.firebasestorage.app",

  messagingSenderId: "358067847151",

  appId: "1:358067847151:web:d2b91ff4096cd792eb801a",

  measurementId: "G-ZJ2FSH1M7M"

};

export const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);

export const VAPID_KEY = 'BKOwbsQ9cG_JKUgYix3lqka0WPQF7iejt6ciVZ68ZiPkbBtqXRKo06Zs4id2Gds_a_bEmC1qfOuqYgE6iWiF4XQ';
