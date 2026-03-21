/**
 * Use Cases — Счета.
 * Бизнес-сценарии работы со счетами и транзакциями.
 */

import { coreApiService } from '@/infrastructure/api';
import type { Account, Transaction, DepositWithdrawRequest } from '@/domain/models/account';

export const accountUseCases = {
  getAllAccounts: async (): Promise<Account[]> => {
    return coreApiService.getAccounts();
  },

  getMasterAccount: async (): Promise<Account> => {
    return coreApiService.getMasterAccount();
  },

  getAccountById: async (id: string): Promise<Account> => {
    return coreApiService.getAccountById(id);
  },

  closeAccount: async (id: string): Promise<Account> => {
    return coreApiService.deleteAccount(id);
  },

  getTransactions: async (
    accountId: string,
    from?: Date,
    to?: Date,
  ): Promise<Transaction[]> => {
    return coreApiService.getAccountTransactions(accountId, from, to);
  },

  deposit: async (accountId: string, data: DepositWithdrawRequest): Promise<Transaction> => {
    return coreApiService.deposit(accountId, data.amount, data.description);
  },

  withdraw: async (accountId: string, data: DepositWithdrawRequest): Promise<Transaction> => {
    return coreApiService.withdraw(accountId, data.amount, data.description);
  },
};
