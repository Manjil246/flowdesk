import jwt from "jsonwebtoken";
import type { Response } from "express";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  AUTH_COOKIE_NAME,
  JWT_EXPIRES_SECONDS,
  JWT_SECRET,
} from "../config/imports";
import { authCookieOptions } from "../constants/auth-cookies";

export type AuthTokenPayload = {
  email: string;
  sub: "admin";
};

export function isAuthConfigured(): boolean {
  return Boolean(JWT_SECRET && ADMIN_EMAIL && ADMIN_PASSWORD);
}

export function signAuthToken(email: string): string {
  return jwt.sign({ email, sub: "admin" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_SECONDS,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    if (!decoded?.email || decoded.sub !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions(),
    maxAge: JWT_EXPIRES_SECONDS * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
}
