import { SQLBuilder } from "@database/sql-builder";
import sql from "@database/shared";

export class Model<T> {
  private sql: SQLBuilder<T> | null = null;

  public constructor(tableName: string) {
    this.sql = new SQLBuilder(tableName);
  }

  public async create(data: Partial<T>): Promise<T | null> {
    return this.sql?.create(data) as any;
  }

  public async find(lookup: DefaultValues<T>): Promise<T | null> {
    const raw = String(this.sql?.read({ ...lookup, limit: 1 }));

    const [row] = await sql<T>(raw) as T[];

    return row as T;
  }

  public async findAll(lookup: LookupsConfig<T>): Promise<T[] | null> {
    return this.sql?.read(lookup) as any;
  }

  public async update(data: DefaultValues<T>): Promise<T | null> {
    return this.sql?.update(data) as any;
  }

  public async delete(lookup: DefaultValues<T>): Promise<boolean> {
    return this.sql?.delete(lookup) as any;
  }
}
