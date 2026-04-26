import squel, {
  type Squel
} from "squel";

export class Model<T> {

  private tableName: string;
  private sql: Squel | null = null;

  constructor(tableName: string) {

    this.tableName = tableName;
  }

  private initQuery(operation: 'execute' | 'query'): squel {
    switch(operation) {
      case 'query':
        return squel.select().from(this.tableName);
        break;
      case 'execute':
        return squel.table(this.tableName);
        break;
      default:
        throw new Error(`Unsupported query operation: ${operation}`);
        break;
    }
  }

  async find(lookups: Partial<T>): Promise<T | null> {
    this.sql = this.initQuery('query');

    const entries = Object.entries(lookups);

    if (entries.length === 0) return null;

    entries.forEach(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `'${value}'` : value;
      
      this.sql.where(`${key} = ${formattedValue}`);
    });

    return this.sql.toString();
  }

  async findAll() {
    return null;
  }
}
