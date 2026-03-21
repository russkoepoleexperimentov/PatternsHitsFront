export const config = {
  authority: 'http://37.21.130.4:5000',
  clientId: 'web_client',
  redirectUri: `${window.location.origin}/signin-oidc`,
  responseType: 'code',
  scope: 'openid profile account_api credit_api',
  postLogoutRedirectUri: `${window.location.origin}/signout-callback-oidc`,

  authApiUrl: 'http://37.21.130.4:5000',
  coreApiUrl: 'http://37.21.130.4:5001',
  creditApiUrl: 'http://37.21.130.4:5002',
} as const;
