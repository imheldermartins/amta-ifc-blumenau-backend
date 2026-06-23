import jwt, { type SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  sub: string; // user id
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Toda a lógica de accessToken/refreshToken fica encapsulada aqui -- quem
 * consome (middleware, rota de refresh, etc.) nunca lida com jwt.sign/verify
 * direto, nem com qual secret/tempo de expiração usar pra qual token.
 */
class JwtService {
  // Em produção, defina JWT_ACCESS_SECRET e JWT_REFRESH_SECRET no .env.
  // Os fallbacks abaixo existem só pra não travar o ambiente de dev.
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";
  private readonly accessExpiresIn: NonNullable<SignOptions["expiresIn"]> = "15m";
  private readonly refreshExpiresIn: NonNullable<SignOptions["expiresIn"]> = "7d";

  public signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiresIn });
  }

  public signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
  }

  public issueTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }

  public verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessSecret) as JwtPayload;
  }

  public verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload;
  }
}

export default new JwtService();