import { timingSafeEqual } from "crypto";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/imports";
import { isAuthConfigured } from "../lib/auth-token";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export class AuthService {
  verifyCredentials(email: string, password: string): boolean {
    if (!isAuthConfigured()) return false;
    const normalizedEmail = email.trim().toLowerCase();
    return (
      safeEqual(normalizedEmail, ADMIN_EMAIL) &&
      safeEqual(password, ADMIN_PASSWORD)
    );
  }
}
