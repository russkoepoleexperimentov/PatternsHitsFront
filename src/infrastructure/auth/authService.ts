/**
 * Auth Service — инкапсулирует работу с OIDC (oidc-client-ts).
 * Не зависит от UI. Предоставляет методы для login/logout/getUser.
 */

import { config } from '@/config';
import type { AuthUser } from '@/domain/models/user';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const userManager = new UserManager({
  authority: config.authority,
  client_id: config.clientId,
  redirect_uri: config.redirectUri,
  response_type: config.responseType,
  
  scope: config.scope,
  post_logout_redirect_uri: config.postLogoutRedirectUri,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

export const authService = {
  getUser: async (): Promise<AuthUser | null> => {
    try {
      const user = await userManager.getUser();
      if (!user) {
        return null;
      }
      return {
        access_token: user.access_token,
        profile: {
          sub: user.profile.sub,
          email: user.profile.email,
          name: user.profile.name,
        },
      };
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  },

  loginCallback: async (): Promise<AuthUser | null> => {
    try {
      await userManager.signinRedirectCallback();
      return authService.getUser();
    } catch (error) {
      console.error('Login callback error:', error);
      return null;
    }
  },

  login: (): void => {
    userManager.signinRedirect();
  },

  logout: (): void => {
    userManager.signoutRedirect();
  },

  getAccessToken: async (): Promise<string | null> => {
    const user = await authService.getUser();
    return user?.access_token ?? null;
  },
};
