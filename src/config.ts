export const config = {
  authority: 'http://localhost:2280',
  clientId: 'web_client',
  redirectUri: `${window.location.origin}/signin-oidc`,
  responseType: 'code',
  scope: 'openid profile account_api credit_api',
  postLogoutRedirectUri: `${window.location.origin}/signout-callback-oidc`,

  authApiUrl: 'http://localhost:2280',
  coreApiUrl: 'http://localhost:2281',
  creditApiUrl: 'http://localhost:5001',
} as const;
