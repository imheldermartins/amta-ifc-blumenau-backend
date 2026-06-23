import type { Request, Response } from "express";
import userController from "@/controllers/user-controller";
import type { Schema } from "@/models/schemas/index";
import { BaseRouter } from "@routes/base-router";

class UserRouter extends BaseRouter<Schema.User> {
  protected readonly resourceName = "User";

  constructor() {
    super(userController);
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