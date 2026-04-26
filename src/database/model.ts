type ModelLookupMethods = "where";
type ModelLookup<T> = {
  [K in ModelLookupMethods]?: Partial<T>;
};

export class Model<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private setLookupStr(lookupsEntries: Partial<T>): string | null {
    const entries = Object.entries(lookupsEntries ?? {});

    const filters = entries.map(
      ([key, val]) => `${this.tableName}.${key} = ${JSON.stringify(val).replace(/"/g, "'")}`,
    );
    return ` WHERE ${filters.join(" AND ")}`;
  }

  async find(conditionals: ModelLookup<T>): Promise<T | null> {
    let lookupsStr = this.setLookupStr(conditionals.where!);

    const sql = `SELECT * FROM ${this.tableName}${lookupsStr}`;
    console.log(`Executando: ${sql}`);
    return null;
  }

  async findAll() {
    return null;
  }
}
