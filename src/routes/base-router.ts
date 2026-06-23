import { Router, type Request, type Response } from "express";

/**
 * Abstrai o mapeamento HTTP <-> IBaseController<T> que se repetia em cada
 * arquivo de rota. Uma resource router concreta só precisa:
 *   1. dizer qual controller usar (via super(controller) no construtor)
 *   2. dizer o nome do recurso (pras mensagens de erro)
 *   3. opcionalmente sobrescrever um dos 5 métodos pra regra específica
 *      (ex: validação de campo), chamando super.<metodo>() pra reaproveitar
 *      o resto do fluxo.
 */
export abstract class BaseRouter<T> {
  public readonly router: Router;
  protected abstract readonly resourceName: string;

  constructor(protected readonly controller: IBaseController<T>) {
    this.router = Router();
    this.registerRoutes();
  }

  protected registerRoutes(): void {
    this.router.get("/", this.all.bind(this));
    this.router.get("/:id", this.get.bind(this));
    this.router.post("/", this.create.bind(this));
    this.router.put("/:id", this.update.bind(this));
    this.router.delete("/:id", this.delete.bind(this));
  }

  protected async all(_req: Request, res: Response): Promise<Response> {
    const items = await this.controller.all();

    if (!items) {
      return res.status(404).json({ message: `No ${this.resourceName} records found` });
    }

    return res.status(200).json(items);
  }

  protected async get(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const item = await this.controller.get({ id } as unknown as LookupValues<T>);

    if (!item) {
      return res.status(404).json({ message: `${this.resourceName} not found` });
    }

    return res.status(200).json(item);
  }

  protected async create(req: Request, res: Response): Promise<Response> {
    const data = (req.body ?? {}) as CreateValues<T>;

    const item = await this.controller.create(data);

    if (!item) {
      return res.status(500).json({ message: `Failed to create ${this.resourceName}` });
    }

    return res.status(201).json(item);
  }

  protected async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const data = (req.body ?? {}) as UpdateValues<T>;

    const item = await this.controller.update({ id } as unknown as LookupValues<T>, data);

    if (!item) {
      return res.status(404).json({ message: `${this.resourceName} not found or update failed` });
    }

    return res.status(200).json(item);
  }

  protected async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const deleted = await this.controller.delete({ id } as unknown as LookupValues<T>);

    if (!deleted) {
      return res.status(404).json({ message: `${this.resourceName} not found` });
    }

    return res.status(204).send();
  }
}