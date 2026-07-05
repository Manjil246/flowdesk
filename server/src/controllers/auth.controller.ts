import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import type { LoginBody } from "../validationSchemas/auth.VSchema";
import {
  clearAuthCookie,
  isAuthConfigured,
  setAuthCookie,
  signAuthToken,
} from "../lib/auth-token";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = (req: Request, res: Response): void => {
    if (!isAuthConfigured()) {
      res.status(503).json({
        success: false,
        message: "Admin authentication is not configured on the server",
      });
      return;
    }

    const { email, password } = req.body as LoginBody;
    if (!this.authService.verifyCredentials(email, password)) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const token = signAuthToken(normalizedEmail);
    setAuthCookie(res, token);
    res.json({ success: true, email: normalizedEmail });
  };

  logout = (_req: Request, res: Response): void => {
    clearAuthCookie(res);
    res.json({ success: true });
  };

  me = (req: Request, res: Response): void => {
    if (!req.user?.email) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }
    res.json({ success: true, email: req.user.email });
  };
}
