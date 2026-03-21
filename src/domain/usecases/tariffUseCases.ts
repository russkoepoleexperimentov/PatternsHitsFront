/**
 * Use Cases — Тарифы.
 * Бизнес-сценарии работы с тарифами.
 */

import { creditApiService } from '@/infrastructure/api';
import type { Tariff, CreateTariffRequest, UpdateTariffRequest } from '@/domain/models/tariff';

export const tariffUseCases = {
  getAllTariffs: async (): Promise<Tariff[]> => {
    return creditApiService.getTariffs();
  },

  getTariffById: async (id: string): Promise<Tariff> => {
    return creditApiService.getTariffById(id);
  },

  createTariff: async (data: CreateTariffRequest): Promise<Tariff> => {
    return creditApiService.createTariff(data);
  },

  updateTariff: async (id: string, data: UpdateTariffRequest): Promise<Tariff> => {
    return creditApiService.updateTariff(id, data);
  },

  deleteTariff: async (id: string): Promise<void> => {
    return creditApiService.deleteTariff(id);
  },
};
