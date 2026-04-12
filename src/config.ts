export const config = {
  authority: 'http://37.21.130.4:5000',
  clientId: 'web_client',
  redirectUri: `${window.location.origin}/signin-oidc`,
  responseType: 'code',
  scope: 'openid profile account_api credit_api options_api',
  postLogoutRedirectUri: `${window.location.origin}/signout-callback-oidc`,

  authApiUrl: 'http://37.21.130.4:5000',
  coreApiUrl: 'http://37.21.130.4:5001',
  creditApiUrl: 'http://37.21.130.4:5002',
  optionsApiUrl: 'http://37.21.130.4:5004',
  monitoringApiUrl: 'http://37.21.130.4:5005', 
} as const;
