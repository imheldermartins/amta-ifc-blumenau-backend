import { SQLBuilder } from "@database/sql-builder";

export class Model<T> {
  private sql: SQLBuilder<T> | null = null;

  public constructor(tableName: string) {
    this.sql = new SQLBuilder(tableName);
  }

  public async create(data: Partial<T>): Promise<T | null> {
    this.sql?.create(data);

    return this.sql?.raw() as any;
  }

  public async find(lookup: Partial<T>): Promise<T | null> {
    this.sql?.read(lookup);

    return this.sql?.raw() as any;
  }

  public async findAll(lookup: LookupsConfig<T>): Promise<T[] | null> {
    this.sql?.read(lookup);

    return this.sql?.raw() as any;
  }

  public async update(data: DefaultValues<T>): Promise<T | null> {
    this.sql?.update(data);

    return this.sql?.raw() as any;
  }

  public async delete(lookup: Partial<T>): Promise<boolean> {
    this.sql?.delete(lookup);

    return this.sql?.raw() as any;
  }
}
