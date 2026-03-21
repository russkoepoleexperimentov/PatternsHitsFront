/**
 * Use Cases — Options.
 * Бизнес-сценарии работы с настройками пользователя.
 */

import { optionsApiService } from '@/infrastructure/api';
import type { OptionsDto } from '@/domain/models/options';

export const optionsUseCases = {
  getOptions: async (): Promise<OptionsDto> => {
    return optionsApiService.getOptions();
  },

  updateOptions: async (options: OptionsDto): Promise<OptionsDto> => {
    return optionsApiService.updateOptions(options);
  },

  updateWebTheme: async (theme: string): Promise<OptionsDto> => {
    return optionsApiService.updateWebTheme(theme);
  },

  updateMobileTheme: async (theme: string): Promise<OptionsDto> => {
    return optionsApiService.updateMobileTheme(theme);
  },

  addHiddenAccount: async (accountId: string): Promise<OptionsDto> => {
    return optionsApiService.addHiddenAccount(accountId);
  },

  removeHiddenAccount: async (accountId: string): Promise<OptionsDto> => {
    return optionsApiService.removeHiddenAccount(accountId);
  },
};