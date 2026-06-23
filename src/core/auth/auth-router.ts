import { Router, type Request, type Response } from "express";
import jwtService from "@core/auth/jwt-service";

const router = Router();

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Troca um refresh token válido por um novo par de tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Novo par de tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: refreshToken é obrigatório
 *       401:
 *         description: refreshToken inválido ou expirado
 */
router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken) {
    return res.status(400).json({ message: "refreshToken is required" });
  }

  try {
    const { sub } = jwtService.verifyRefreshToken(refreshToken);
    const tokens = jwtService.issueTokenPair({ sub });

    return res.status(200).json(tokens);
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

export default router;