export interface User {
  id: string;
  email: string;
  credentials: string | null;
  roles: string[];
  isBlocked: boolean;
}

export interface AuthUser {
  access_token: string;
  id_token?: string;
  profile?: {
    sub: string;
    email?: string;
    name?: string;
  };
  expired?: boolean;
}
