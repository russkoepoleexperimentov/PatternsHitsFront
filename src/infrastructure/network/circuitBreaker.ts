/**
 * Один экземпляр создаётся на каждый HttpClient.
 *
 * Состояния:
 *  CLOSED   — нормальная работа, запросы проходят
 *  OPEN     — цепь разомкнута, запросы отклоняются немедленно
 *  HALF_OPEN — после таймаута разрешается один пробный запрос
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  /** Размер скользящего окна (кол-во последних запросов). По умолчанию: 20 */
  windowSize: number;
  /** Порог доли ошибок для размыкания цепи. По умолчанию: 0.7 (70%) */
  errorThreshold: number;
  /** Время в состоянии OPEN до перехода в HALF_OPEN (мс). По умолчанию: 30000 */
  openTimeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  /** История последних N запросов: true = ошибка, false = успех */
  private callHistory: boolean[] = [];
  private openedAt: number | null = null;
  private readonly opts: CircuitBreakerOptions;

  constructor(opts: Partial<CircuitBreakerOptions> = {}) {
    this.opts = {
      windowSize:     opts.windowSize     ?? 20,
      errorThreshold: opts.errorThreshold ?? 0.7,
      openTimeoutMs:  opts.openTimeoutMs  ?? 30_000,
    };
  }

  get currentState(): CircuitState {
    return this.state;
  }

  canRequest(): boolean {
    if (this.state === 'CLOSED') return true;

    if (this.state === 'OPEN') {
      const elapsed = Date.now() - (this.openedAt ?? 0);
      if (elapsed >= this.opts.openTimeoutMs) {
        this.state = 'HALF_OPEN';
        return true; // Разрешаем один пробный запрос
      }
      return false;
    }

    // HALF_OPEN: разрешаем один запрос
    return true;
  }

  recordOutcome(isError: boolean): void {
    if (this.state === 'HALF_OPEN') {
      if (isError) {
        this.state = 'OPEN';
        this.openedAt = Date.now();
      } else {
        this.state = 'CLOSED';
        this.callHistory = [];
      }
      return;
    }

    if (this.state !== 'CLOSED') return;

    this.callHistory.push(isError);
    if (this.callHistory.length > this.opts.windowSize) {
      this.callHistory.shift();
    }
    
    if (this.callHistory.length === this.opts.windowSize) {
      const errorCount = this.callHistory.filter(Boolean).length;
      if (errorCount / this.opts.windowSize >= this.opts.errorThreshold) {
        this.state = 'OPEN';
        this.openedAt = Date.now();
      }
    }
  }
}
