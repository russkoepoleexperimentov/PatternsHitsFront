/**
 * API Layer — Options API.
 * Бизнес-логика отправки запросов и обработки ответов для Options-сервиса.
 */

import type { OptionsDto } from '@/domain/models/options';
import { optionsHttpClient } from './clients';

export const optionsApiService = {
  getOptions: (): Promise<OptionsDto> =>
    optionsHttpClient.get<OptionsDto>('/api/Options'),

  updateOptions: (data: OptionsDto): Promise<OptionsDto> =>
    optionsHttpClient.put<OptionsDto>('/api/Options', data),

  updateWebTheme: (theme: string): Promise<OptionsDto> =>
    optionsHttpClient.put<OptionsDto>('/api/Options/web-theme', theme),

  updateMobileTheme: (theme: string): Promise<OptionsDto> =>
    optionsHttpClient.put<OptionsDto>('/api/Options/mobile-theme', theme),

  addHiddenAccount: (accountId: string): Promise<OptionsDto> =>
    optionsHttpClient.post<OptionsDto>(`/api/Options/hidden-accounts/${accountId}`),

  removeHiddenAccount: (accountId: string): Promise<OptionsDto> =>
    optionsHttpClient.delete<OptionsDto>(`/api/Options/hidden-accounts/${accountId}`),
};