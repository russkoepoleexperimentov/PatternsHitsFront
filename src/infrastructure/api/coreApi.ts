/**
 * API Layer — Core API.
 * Бизнес-логика отправки запросов и обработки ответов для Core-сервиса (счета, транзакции).
 */

import type { Account, Transaction, CreateTransactionRequest } from '@/domain/models/account';
import { coreHttpClient } from './clients';

export const coreApiService = {
  registerPushDevice: (fcmToken: string): Promise<void> =>
    coreHttpClient.request<void>('/api/push/device', {
      method: 'POST',
      params: { fcmToken, deviceType: 'Employee' },
    }).then(() => undefined),


  getAccounts: (): Promise<Account[]> =>
    coreHttpClient.get<Account[]>('/api/accounts/employee'),

  getMasterAccount: (): Promise<Account> =>
    coreHttpClient.get<Account>('/api/accounts/master'),

  getAccountById: (id: string): Promise<Account> =>
    coreHttpClient.get<Account>(`/api/accounts/employee/${id}`),

  deleteAccount: (id: string): Promise<Account> =>
    coreHttpClient.delete<Account>(`/api/accounts/employee/${id}`),

  getAccountTransactions: (
    accountId: string,
    from?: Date,
    to?: Date,
  ): Promise<Transaction[]> => {
    const params: Record<string, string> = {};
    if (from) params.from = from.toISOString();
    if (to) params.to = to.toISOString();
    return coreHttpClient.get<Transaction[]>(
      `/api/accounts/employee/${accountId}/transactions`,
      Object.keys(params).length > 0 ? params : undefined,
    );
  },

  createTransaction: (data: CreateTransactionRequest): Promise<Transaction> =>
    coreHttpClient.post<Transaction>('/api/transactions', data),

  deposit: (accountId: string, amount: number, description: string): Promise<Transaction> =>
    coreHttpClient.post<Transaction>('/api/transactions', {
      sourceId: null,
      sourceType: 'RealWorld',
      targetId: accountId,
      targetType: 'Account',
      amount,
      description,
    } satisfies CreateTransactionRequest),

  withdraw: (accountId: string, amount: number, description: string): Promise<Transaction> =>
    coreHttpClient.post<Transaction>('/api/transactions', {
      sourceId: accountId,
      sourceType: 'Account',
      targetId: null,
      targetType: 'RealWorld',
      amount,
      description,
    } satisfies CreateTransactionRequest),
};
