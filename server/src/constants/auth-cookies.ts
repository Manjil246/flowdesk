import type { CookieOptions } from "express";
import { NODE_ENV } from "../config/imports";

/** Cross-origin admin session (client + API on separate Vercel domains). */
export function authCookieOptions(): CookieOptions {
  const crossOrigin = NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: crossOrigin,
    sameSite: crossOrigin ? "none" : "lax",
    path: "/",
  };
}
