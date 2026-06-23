import type { Request, Response } from "express";
import userController from "@/controllers/user-controller";
import type { Schema } from "@/models/schemas/index";
import { BaseRouter } from "@routes/base-router";
import middleware from "@/core/auth/middleware";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *       required:
 *         - email
 */
 
/**
 * @openapi
 * /users:
 *   get:
 *     summary: Lista usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Nenhum usuário encontrado
 *   post:
 *     summary: Cria um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: email é obrigatório
 *       401:
 *         description: Token de acesso ausente ou inválido
 *
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário por id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       401:
 *         description: Token de acesso ausente ou inválido
 *       404:
 *         description: Usuário não encontrado ou falha ao atualizar
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuário removido
 *       401:
 *         description: Token de acesso ausente ou inválido
 *       404:
 *         description: Usuário não encontrado
 */
class UserRouter extends BaseRouter<Schema.User> {
  protected readonly resourceName = "User";

  constructor() {
    super(userController, {
      create: [middleware.handle],
      update: [middleware.handle],
      delete: [middleware.handle],
    });
  }

  // Único ponto que difere do CRUD genérico: valida "email" antes de
  // delegar pro create() do BaseRouter.
  protected async create(req: Request, res: Response): Promise<Response> {
    const { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    return super.create(req, res);
  }
}

export default new UserRouter().router;