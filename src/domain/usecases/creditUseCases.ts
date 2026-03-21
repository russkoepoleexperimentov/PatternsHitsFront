/**
 * Use Cases — Кредиты.
 * Бизнес-сценарии работы с кредитами.
 */

import { creditApiService } from '@/infrastructure/api';
import type { Credit, ApproveCreditRequest, RejectCreditRequest, CreditRating } from '@/domain/models/credit';

export const creditUseCases = {
  getAllCredits: async (userId?: string): Promise<Credit[]> => {
    return creditApiService.getCredits(userId);
  },

  getCreditDetails: async (id: string): Promise<Credit> => {
    return creditApiService.getCreditById(id);
  },

  getUserRating: async (userId: string): Promise<CreditRating> => {
    return creditApiService.getCreditRating(userId);
  },

  approveCredit: async (id: string, data: ApproveCreditRequest): Promise<Credit> => {
    return creditApiService.approveCredit(id, data);
  },

  rejectCredit: async (id: string, data: RejectCreditRequest): Promise<Credit> => {
    return creditApiService.rejectCredit(id, data);
  },
};
