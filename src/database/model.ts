import { SQLBuilder } from "@database/sql-builder";

export class Model<T> {
  private sql: SQLBuilder<T> | null = null;

  public constructor(tableName: string) {
    this.sql = new SQLBuilder(tableName);
  }

  public async create(data: Partial<T>): Promise<T | null> {
    return this.sql?.create(data) as any;
  }

  public async find(lookup: DefaultValues<T>): Promise<T | null> {
    return this.sql?.read({ ...lookup, limit: 1 }) as any;
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
