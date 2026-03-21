/**
 * API Clients — инстансы HttpClient для каждого бэкенд-сервиса.
 * Сюда же устанавливается провайдер токена.
 */

import { HttpClient } from '@/infrastructure/network';
import { config } from '@/config';

export const authHttpClient = new HttpClient(config.authApiUrl);
export const coreHttpClient = new HttpClient(config.coreApiUrl);
export const creditHttpClient = new HttpClient(config.creditApiUrl);
export const optionsHttpClient = new HttpClient(config.optionsApiUrl);

/**
 * Устанавливает провайдер токена для всех клиентов.
 * Вызывается один раз при инициализации приложения (из AuthProvider).
 */
export function setApiTokenProvider(provider: () => Promise<string | null>): void {
  authHttpClient.setTokenProvider(provider);
  coreHttpClient.setTokenProvider(provider);
  creditHttpClient.setTokenProvider(provider);
  optionsHttpClient.setTokenProvider(provider);
}
