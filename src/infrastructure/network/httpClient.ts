/**
 * Network Layer — инкапсулирует всю логику работы с HTTP-запросами.
 * Не знает о бизнес-логике, UI, доменных моделях.
 *
 * Реализованные паттерны:
 *  - Идемпотентность: Idempotency-Key header для мутирующих запросов (POST/PUT/PATCH/DELETE)
 *  - Retry: до 3 повторных попыток с экспоненциальной задержкой при NetworkError и 5xx
 *  - Circuit Breaker: при ≥70% ошибок в последних 20 запросах цепь размыкается на 30 с
 *  - Трассировка: каждый запрос отправляется в monitoring service (fire-and-forget)
 */

import { authService } from '../auth/authService';
import { CircuitBreaker } from './circuitBreaker';
import { sendTrace } from '../monitoring/monitoringClient';

export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

export interface HttpResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
  headers: Headers;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly responseBody: unknown,
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

type TokenProvider = () => Promise<string | null>;

const MAX_ATTEMPTS = 4; // 1 оригинальный + 3 повтора
const RETRY_BASE_MS = 500;

function retryDelay(attempt: number): Promise<void> {
  // attempt 0 → 500ms, 1 → 1000ms, 2 → 2000ms
  return new Promise(resolve => setTimeout(resolve, RETRY_BASE_MS * Math.pow(2, attempt)));
}

function isMutating(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
}

/**
 * HttpClient — универсальный HTTP-клиент.
 * Поддерживает baseURL, автоматическую подстановку токена, сериализацию/десериализацию JSON,
 * идемпотентность, retry, circuit breaker и трассировку.
 */
export class HttpClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider | null = null;
  private readonly circuitBreaker = new CircuitBreaker();

  constructor(
    baseUrl: string,
    private readonly serviceName: string = 'unknown',
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  async request<T = unknown>(endpoint: string, config: HttpRequestConfig): Promise<HttpResponse<T>> {
    // 1. Circuit Breaker: отклоняем запрос если цепь разомкнута
    if (!this.circuitBreaker.canRequest()) {
      throw new CircuitOpenError(
        `Circuit breaker OPEN for service "${this.serviceName}". Requests temporarily suspended.`,
      );
    }

    // 2. Idempotency Key: генерируется один раз до цикла retry и переиспользуется
    const idempotencyKey = isMutating(config.method) ? crypto.randomUUID() : undefined;

    let lastError: unknown;

    // 3. Retry loop
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const url = this.buildUrl(endpoint, config.params);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers,
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      if (this.tokenProvider) {
        const token = await this.tokenProvider();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const fetchConfig: RequestInit = {
        method: config.method,
        headers,
      };

      if (config.body !== undefined && config.method !== 'GET') {
        fetchConfig.body = JSON.stringify(config.body);
      }

      const startMs = Date.now();
      let response: Response;

      try {
        response = await fetch(url, fetchConfig);
      } catch (error) {
        // Сетевая ошибка (нет соединения, таймаут и т.п.)
        lastError = new NetworkError('Network request failed', error);
        this.circuitBreaker.recordOutcome(true);

        if (attempt < MAX_ATTEMPTS - 1) {
          await retryDelay(attempt);
          continue;
        }

        // Последняя попытка — отправляем трейс и бросаем ошибку
        sendTrace({
          traceId: crypto.randomUUID(),
          serviceName: this.serviceName,
          method: config.method,
          path: endpoint,
          statusCode: 0,
          durationMs: Date.now() - startMs,
          isError: true,
          timestamp: new Date().toISOString(),
        });
        throw lastError;
      }

      // Разбираем тело ответа
      let data: T = undefined as T;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = undefined as T;
        }
      }

      const durationMs = Date.now() - startMs;

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }

        this.circuitBreaker.recordOutcome(true);
        const httpError = new HttpError(response.status, response.statusText, data);
        const is5xx = response.status >= 500;
        const isLastAttempt = attempt === MAX_ATTEMPTS - 1;

        if (!is5xx || isLastAttempt) {
          // 4xx — никогда не повторяем; 5xx на последней попытке — сдаёмся
          sendTrace({
            traceId: crypto.randomUUID(),
            serviceName: this.serviceName,
            method: config.method,
            path: endpoint,
            statusCode: response.status,
            durationMs,
            isError: true,
            timestamp: new Date().toISOString(),
          });
          throw httpError;
        }

        // 5xx с оставшимися попытками — повторяем
        lastError = httpError;
        await retryDelay(attempt);
        continue;
      }

      // Успешный ответ
      this.circuitBreaker.recordOutcome(false);
      sendTrace({
        traceId: crypto.randomUUID(),
        serviceName: this.serviceName,
        method: config.method,
        path: endpoint,
        statusCode: response.status,
        durationMs,
        isError: false,
        timestamp: new Date().toISOString(),
      });

      return {
        status: response.status,
        ok: response.ok,
        data,
        headers: response.headers,
      };
    }

    // Эта ветка недостижима, но требуется TypeScript
    throw lastError;
  }

  async get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'GET', params });
    return response.data;
  }

  async post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'POST', body });
    return response.data;
  }

  async put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'PUT', body });
    return response.data;
  }

  async patch<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'PATCH', body });
    return response.data;
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'DELETE' });
    return response.data;
  }
}
