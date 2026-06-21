import { SQLBuilder } from "@db/sql-builder";
import sql from "@/core/db/shared";
import { ulid } from "ulid";

export class Model<T> {
  private sql: SQLBuilder<T>;

  public constructor(tableName: string) {
    this.sql = new SQLBuilder(tableName);
  }

  public async create(data: CreateValues<T>): Promise<T | null> {
    const id = ulid();

    const payload = { id, ...data } as CreateValues<T>;

    const raw = this.sql.create(payload);

    const result = await sql(raw);
    if (!result) 
      throw new Error('Create::Model response is null.', { cause: 'MODELERROR' });

    return this.find({ ...data } as LookupValues<T>);
  }

  public async find(lookup: LookupValues<T>): Promise<T | null> {
    const raw = this.sql.read({ ...lookup, limit: 1 });

    const [row] = await sql<T>(raw) as T[];

    return row ?? null;
  }

  public async findAll(lookup?: LookupsConfig<T>): Promise<T[] | null> {
    const raw = this.sql.read(lookup);

    const rows = await sql<T>(raw) as T[];

    return rows;
  }

  public async update(values: UpdateValues<T>, lookup: LookupValues<T>): Promise<boolean> {
    const raw = this.sql.update(values, lookup);

    const result = await sql(raw);

    return !!result;
  }

  public async delete(lookup: LookupValues<T>): Promise<boolean> {
    const raw = this.sql.delete(lookup);

    const result = await sql(raw);

    return !!result;
  }
}