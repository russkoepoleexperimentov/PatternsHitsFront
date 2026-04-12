/**
 * Monitoring Client — отправляет трейсы в микросервис мониторинга.
 *
 * ВАЖНО: намеренно использует голый fetch, НЕ HttpClient.
 * Использование HttpClient создало бы бесконечную рекурсию (HttpClient → sendTrace → HttpClient → ...).
 *
 * Все ошибки молча игнорируются — мониторинг не должен ломать основное приложение.
 */

import { config } from '@/config';

export interface IncomingTraceDto {
  traceId: string;
  serviceName: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  isError: boolean;
  timestamp: string; // ISO 8601
}

/**
 * Fire-and-forget отправка трейса в monitoring service.
 * POST /api/traces
 */
export function sendTrace(trace: IncomingTraceDto): void {
  const url = config.monitoringApiUrl;
  if (!url) return;

  fetch(`${url}/api/traces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trace),
  }).catch(() => {
    // Intentionally silent — мониторинг не должен влиять на работу приложения
  });
}
