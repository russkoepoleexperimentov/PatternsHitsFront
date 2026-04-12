/**
 * Firebase Cloud Messaging Service Worker
 * Обрабатывает push-уведомления когда приложение закрыто или в фоне.
 *
 * Использует importScripts из CDN — это позволяет обойти ограничение viteSingleFile,
 * который иначе не может обработать файл сервис-воркера как отдельный бандл.
 *
 * TODO: Скопируй значения firebaseConfig из Firebase Console → Project Settings → Your Apps
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// TODO: Замени все REPLACE_ME значениями из Firebase Console → Project Settings → Your apps → Web App
firebase.initializeApp({
  apiKey: "AIzaSyDF3nM16dTzVCWgLzfHafXDY1ITtGcwqhk",

  authDomain: "bankhits-45805.firebaseapp.com",

  projectId: "bankhits-45805",

  storageBucket: "bankhits-45805.firebasestorage.app",

  messagingSenderId: "358067847151",

  appId: "1:358067847151:web:d2b91ff4096cd792eb801a",

  measurementId: "G-ZJ2FSH1M7M"

});

const messaging = firebase.messaging();

// Обработка фоновых push-уведомлений (приложение закрыто или неактивно)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Новое уведомление';
  const body  = payload.notification?.body  ?? '';

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
  });
});
