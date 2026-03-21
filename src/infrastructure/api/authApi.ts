/**
 * API Layer — Auth API.
 * Бизнес-логика отправки запросов и обработки ответов для Auth-сервиса.
 * Работает с доменными моделями, использует HttpClient для транспорта.
 */

import type { User } from '@/domain/models/user';
import { authHttpClient } from './clients';

export const authApiService = {
  searchUsers: (query: string = ''): Promise<User[]> =>
    authHttpClient.get<User[]>('/api/users/search', { query }),

  getUserById: (id: string): Promise<User> =>
    authHttpClient.get<User>(`/api/users/${id}`),

  addUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await authHttpClient.request<User>(
      `/api/users/${userId}/role`,
      { method: 'POST', params: { role } },
    );
    return response.data;
  },

  removeUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await authHttpClient.request<User>(
      `/api/users/${userId}/role`,
      { method: 'DELETE', params: { role } },
    );
    return response.data;
  },

  blockUser: (userId: string): Promise<User> =>
    authHttpClient.post<User>(`/api/auth/block/${userId}`),

  unblockUser: (userId: string): Promise<User> =>
    authHttpClient.post<User>(`/api/auth/unblock/${userId}`),
};
