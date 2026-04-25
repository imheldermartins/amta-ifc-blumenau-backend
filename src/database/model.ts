export class Model<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async find(conditionals: Partial<T>): Promise<T | null> {
    const entries = Object.entries(conditionals);

    let whereConditional = "";

    if (entries.length > 0) {
      const filters = entries.map(
        ([key, val]) => `${this.tableName}.${key} = ${JSON.stringify(val)}`,
      );
      whereConditional = ` WHERE ${filters.join(" AND ")}`;
    }

    const sql = `SELECT * FROM ${this.tableName}${whereConditional}`;
    console.log(`Executando: ${sql}`);
    return null;
  }

  async findAll() {
    return null;
  }
}
