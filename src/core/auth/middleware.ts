import type { Request, Response, NextFunction } from "express";
import jwtService from "@/core/auth/jwt-service";

class Middleware {
  constructor(private readonly jwt: typeof jwtService) {}

  // Arrow function como propriedade de instância: preserva o "this" mesmo
  // quando o express chama handle solto, sem precisar de .bind() em todo uso.
  public readonly handle = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing access token" });
      return;
    }

    const token = header.slice("Bearer ".length);

    try {
      const { sub } = this.jwt.verifyAccessToken(token);
      req.userId = sub;
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired access token" });
    }
  };
}

export default new Middleware(jwtService);