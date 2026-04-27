import squel, { type BaseBuilder } from "squel";

export class SQLBuilder<T> {
  private tableName: string;
  private sql: BaseBuilder | null = null;

  public constructor(tableName: string) {
    this.tableName = tableName;
  }

  public raw(): string {
    if (!this.sql) throw new Error("SQL is not defined.");

    return String(this.sql?.toString());
  }

  public create(data: Partial<T>): string {
    this.sql = squel.insert().into(this.tableName);

    const entries = Object.entries(data);

    if (entries.length === 0) throw new Error("Data missing.");

    entries.forEach(([key, value]) => {
      this.sql?.set(key, value);
    });

    return String(this.sql?.toString());
  }

  public read(lookup: LookupsConfig<T>) {
    this.sql = squel.select().from(this.tableName);

    const whereConditionals = lookup?.where;
    if (whereConditionals) {
      if (whereConditionals?.and) {
        const filters = Object.entries(whereConditionals?.and).map(
          ([key, value]) => {
            const lookupIsString = typeof value === "string";
            const lookupSearch =
              lookupIsString && value.includes("%") ? "LIKE" : "=";

            return `${key} ${lookupSearch} ${lookupIsString ? `'${value}'` : value}`;
          },
        );

        this.sql?.where(`${filters.join(" AND ")}`);
      }

      if (whereConditionals?.or) {
        const filters = Object.entries(whereConditionals?.or).map(
          ([key, value]) => {
            const lookupIsString = typeof value === "string";
            const lookupSearch =
              lookupIsString && value.includes("%") ? "LIKE" : "=";

            return `${key} ${lookupSearch} ${lookupIsString ? `'${value}'` : value}`;
          },
        );

        this.sql?.where(`${filters.join(" OR ")}`);
      }
    }

    return String(this.sql?.toString());
  }

  public update(data: DefaultValues<T>) {
    this.sql = squel.update().table(this.tableName);

    if (!data?.id)
      throw new Error("Sensive batch operation not permitted, Id is missing!");

    const entries = Object.entries(data);

    if (entries.length === 0) return null;

    entries.forEach(([key, value]) => {
      this.sql?.set(key, value);
    });

    this.sql.where("id", data.id);

    return String(this.sql?.toString());
  }

  public delete(lookup: Partial<T>) {
    this.sql = squel.delete().from(this.tableName);

    const entries = Object.entries(lookup);

    if (entries.length === 0) return null;

    entries.forEach(([key, value]) => {
      const formattedValue = typeof value === "string" ? `'${value}'` : value;

      this.sql.where(`${key} = ${formattedValue}`);
    });

    return String(this.sql?.toString());
  }
}
