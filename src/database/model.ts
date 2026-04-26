type ModelLookupMethods = "where" | "like";
type ModelLookup<T> = {
  [K in ModelLookupMethods]?: Partial<T>;
};

export class Model<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private setLookupStr(lookupsEntries: [string, Partial<T>][]): string | null {
    if (!lookupsEntries) return null;

    let lookupStr = "";

    lookupsEntries.forEach(([lookupKey, lookupValues]) => {
      lookupKey = lookupKey.toUpperCase();

      const filters = Object.entries(lookupValues ?? {}).map(
        ([key, val]) => `${this.tableName}.${key} ${lookupKey === 'WHERE' ? '=' : 'AS'} ${JSON.stringify(val)}`,
      );
      lookupStr += ` ${lookupKey} ${filters.join(" AND ")}`;
    });

    return lookupStr;
  }

  async find(conditionals: ModelLookup<T>): Promise<T | null> {
    const lookupsEntries = Object.entries(conditionals);

    let lookupsStr = this.setLookupStr(lookupsEntries);

    const sql = `SELECT * FROM ${this.tableName}${lookupsStr}`;
    console.log(`Executando: ${sql}`);
    return null;
  }

  async findAll() {
    return null;
  }
}
