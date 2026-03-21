/**
 * Use Cases — Пользователи.
 * Бизнес-сценарии работы с пользователями.
 * Зависит от API-слоя, но не от UI.
 */

import { authApiService } from '@/infrastructure/api';
import type { User } from '@/domain/models/user';

export const userUseCases = {
  searchUsers: async (query: string): Promise<User[]> => {
    return authApiService.searchUsers(query);
  },

  getUserDetails: async (userId: string): Promise<User> => {
    return authApiService.getUserById(userId);
  },

  assignEmployeeRole: async (userId: string): Promise<User> => {
    return authApiService.addUserRole(userId, 'Employee');
  },

  removeEmployeeRole: async (userId: string): Promise<User> => {
    return authApiService.removeUserRole(userId, 'Employee');
  },

  blockUser: async (userId: string): Promise<User> => {
    return authApiService.blockUser(userId);
  },

  unblockUser: async (userId: string): Promise<User> => {
    return authApiService.unblockUser(userId);
  },

  /**
   * Загружает карту пользователей по массиву userId.
   */
  loadUsersMap: async (userIds: string[]): Promise<Record<string, User>> => {
    const unique = [...new Set(userIds.filter(Boolean))];
    const map: Record<string, User> = {};

    const results = await Promise.allSettled(
      unique.map((id) => authApiService.getUserById(id)),
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value?.id) {
        map[result.value.id] = result.value;
      }
    });

    return map;
  },
};
