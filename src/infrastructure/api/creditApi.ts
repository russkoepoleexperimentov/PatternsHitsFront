/**
 * API Layer — Credit API.
 * Бизнес-логика отправки запросов и обработки ответов для Credit-сервиса.
 */

import type { Credit, ApproveCreditRequest, RejectCreditRequest, CreditRating, Payment } from '@/domain/models/credit';
import type { Tariff, CreateTariffRequest, UpdateTariffRequest } from '@/domain/models/tariff';
import { creditHttpClient } from './clients';

export const creditApiService = {
  // --- Tariffs ---
  getTariffs: (): Promise<Tariff[]> =>
    creditHttpClient.get<Tariff[]>('/api/tariffs'),

  getCreditRating: (userId: string): Promise<CreditRating> =>
    creditHttpClient.get<CreditRating>(`/api/user/${userId}/credit-rating`),

  getTariffById: (id: string): Promise<Tariff> =>
    creditHttpClient.get<Tariff>(`/api/tariffs/${id}`),

  createTariff: (data: CreateTariffRequest): Promise<Tariff> =>
    creditHttpClient.post<Tariff>('/api/tariffs', data),

  updateTariff: (id: string, data: UpdateTariffRequest): Promise<Tariff> =>
    creditHttpClient.put<Tariff>(`/api/tariffs/${id}`, data),

  deleteTariff: (id: string): Promise<void> =>
    creditHttpClient.delete<void>(`/api/tariffs/${id}`),

  // --- Credits ---
  getCredits: (userId?: string): Promise<Credit[]> => {
    const params = userId ? { userId } : undefined;
    return creditHttpClient.get<Credit[]>('/api/credits', params);
  },

  getCreditById: (id: string): Promise<Credit> =>
    creditHttpClient.get<Credit>(`/api/credits/${id}`),

  getOverduePayments: (creditId: string): Promise<Payment[]> =>
    creditHttpClient.get<Payment[]>(`/api/credit/${creditId}/overdue`),

  approveCredit: (id: string, data: ApproveCreditRequest): Promise<Credit> =>
    creditHttpClient.patch<Credit>(`/api/credits/${id}/approve`, data),

  rejectCredit: (id: string, data: RejectCreditRequest): Promise<Credit> =>
    creditHttpClient.patch<Credit>(`/api/credits/${id}/reject`, data),
};
