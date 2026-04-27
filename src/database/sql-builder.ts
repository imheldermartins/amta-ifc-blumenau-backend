import squel, { type BaseBuilder } from "squel";

export class SQLBuilder<T> {
  private tableName: string;
  private sql: BaseBuilder | null = null;

  public constructor(tableName: string) {
    this.tableName = tableName;
  }

  private sqlError(message: string) {
    throw new Error(message, { cause: 'SQLERROR-MALFORMED' });
  }

  private prepareLookupEntries(conditionals: LookupWhere<T>) {
    Object.entries(conditionals).forEach(([cKey, cValue]) => {
      const filters = Object.entries(cValue ?? {}).map(([key, value]) => {
        const lookupIsString = typeof value === "string";
        const lookupSearch =
          lookupIsString && value.includes("%") ? "LIKE" : "=";

        return `${key} ${lookupSearch} ${lookupIsString ? `'${value}'` : value}`;
      });

      this.sql?.where(`${filters.join(` ${cKey} `)}`);
    });
  }

  public raw(): string {
    if (!this.sql) this.sqlError("SQL is not defined.");

    return String(this.sql?.toString());
  }

  public create(data: Partial<T>): string {
    this.sql = squel.insert().into(this.tableName);

    const entries = Object.entries(data);

    if (entries.length === 0) this.sqlError("Entries is empty. There is no lookups.");

    entries.forEach(([key, value]) => {
      this.sql?.set(key, value);
    });

    return String(this.sql?.toString());
  }

  public read(lookup?: LookupsConfig<T>): string {
    this.sql = squel.select().from(this.tableName);

    if (lookup && Object.keys(lookup).filter(key => !(['where', 'limit'].includes(key))).length > 0) {
      
      const tempLookup = { ...lookup };
      if ('where' in tempLookup) delete tempLookup.where;
      if ('limit' in tempLookup) delete tempLookup.limit;

      const entries = Object.entries(tempLookup);

      if (entries.length === 0)
        this.sqlError("Entries is empty. There is no lookups.");

      entries.forEach(([key, value]) => {
        const formattedValue = typeof value === 'string' ? `'${value}'` : value;
        
        this.sql.where(`${key} = ${formattedValue}`);
      });
    }

    this.prepareLookupEntries(lookup?.where ?? {});
    
    if (lookup?.limit) this.sql.limit(lookup.limit);

    return String(this.sql?.toString());
  }

  public update(data: LookupsConfig<T>): string {
    this.sql = squel.update().table(this.tableName);

    if (!data?.id && !data.where) this.sqlError('Missing Parameters');
    
    const entries = Object.entries(data);
    
    if (entries.length === 0)
      this.sqlError("Entries is empty. There is no lookups.");

    entries.forEach(([key, value]) => {
      this.sql?.set(key, value);
    });

    this.sql?.where('id', data.id)

    return String(this.sql?.toString());
  }

  public delete(lookup: DefaultValues<T>): string {
    this.sql = squel.delete().from(this.tableName);

    const entries = Object.entries(lookup);

    if (entries.length === 0) 
      this.sqlError('Missing Parameters');

    entries.forEach(([key, value]) => {
      const formattedValue = typeof value === "string" ? `'${value}'` : value;

      this.sql.where(`${key} = ${formattedValue}`);
    });

    return String(this.sql?.toString());
  }
}
