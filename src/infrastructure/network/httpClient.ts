/**
 * Network Layer — инкапсулирует всю логику работы с HTTP-запросами.
 * Не знает о бизнес-логике, UI, доменных моделях.
 * Отвечает только за: формирование запросов, отправку, обработку ответов и ошибок транспортного уровня.
 */

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

type TokenProvider = () => Promise<string | null>;

/**
 * HttpClient — универсальный HTTP-клиент.
 * Поддерживает baseURL, автоматическую подстановку токена, сериализацию/десериализацию JSON.
 */
export class HttpClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider | null = null;

  constructor(baseUrl: string) {
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
    const url = this.buildUrl(endpoint, config.params);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Inject auth token if available
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

    let response: Response;
    try {
      response = await fetch(url, fetchConfig);
    } catch (error) {
      throw new NetworkError('Network request failed', error);
    }

    let data: T;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = undefined as T;
      }
    } else {
      data = undefined as T;
    }

    if (!response.ok) {
      throw new HttpError(response.status, response.statusText, data);
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: response.headers,
    };
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
