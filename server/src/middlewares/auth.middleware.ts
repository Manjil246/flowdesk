import type { Request, Response, NextFunction } from "express";
import { AUTH_COOKIE_NAME } from "../config/imports";
import { verifyAuthToken, type AuthTokenPayload } from "../lib/auth-token";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export class AuthMiddleware {
  public authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    this.handleAuthentication(req, res, next).catch((err) => {
      console.error("Authentication error:", err);
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    });
  };

  private async handleAuthentication(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Access token is required" });
      return;
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }

    req.user = decoded;
    next();
  }
}

export const authenticate = new AuthMiddleware().authenticate;
