import { SQLBuilder } from "@database/sql-builder";
import sql from "@database/shared";

export class Model<T> {
  private sql: SQLBuilder<T> | null = null;

  public constructor(tableName: string) {
    this.sql = new SQLBuilder(tableName);
  }

  public async create(data: DefaultValues<T>): Promise<T | null> {
    const raw = String(this.sql?.create(data));

    const created = await sql(raw) // execute create query
      .then(async (res) => {
        if (!res) throw new Error('Create::Model response is null.', { cause: 'MODELERROR' });
        
        return await this.find({ ...data }) // find created rows without lookup
      });

    return created as T;
  }

  public async find(lookup: LookupsConfig<T>): Promise<T | null> {
    const raw = String(this.sql?.read({ ...lookup, limit: 1 }));

    const [row] = await sql<T>(raw) as T[];

    return row as T;
  }

  public async findAll(lookup?: LookupsConfig<T>): Promise<T[] | null> {
    const raw = String(this.sql?.read(lookup));

    const rows = await sql<T>(raw) as T[];

    return rows;
  }

  public async update(data: DefaultValues<T>): Promise<T | null> {
    return this.sql?.update(data) as any;
  }

  public async delete(lookup: DefaultValues<T>): Promise<boolean> {
    return this.sql?.delete(lookup) as any;
  }
}
