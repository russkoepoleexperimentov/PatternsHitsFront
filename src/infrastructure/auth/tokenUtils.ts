/**
 * Утилиты для работы с JWT-токенами.
 */

import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  role?: string;
  sub?: string;
  email?: string;
  exp?: number;
  [key: string]: unknown;
}

export function getRoleFromToken(token: string): string | null {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function isRoleAllowed(role: string | null): boolean {
  return role !== 'Customer';
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}
