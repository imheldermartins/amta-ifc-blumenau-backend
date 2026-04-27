import squel, {
  type BaseBuilder
} from "squel";

type LookupWhere<T> = {
  and?: Partial<T>;
  or?: Partial<T>;
};

type LookupsConfig<T> = {
  where?: LookupWhere<T>;
};

type DefaultValues<T> = Omit<Partial<T>, 'id'> 
  & { id: NonEmptyString; };

export class Model<T> {

  private tableName: string;
  private sql: BaseBuilder | null = null;

  public constructor(tableName: string) {

    this.tableName = tableName;
  }

  private set(operation: 'create' | 'read' | 'update' | 'delete') {
    this.sql = squel.useFlavour('mysql');

    switch(operation) {
      case 'read':
        this.sql = this.sql
          .select()
          .from(this.tableName);
        break;
      case 'create':
        this.sql = this.sql
          .insert()
          .into(this.tableName);
        break;
      case 'delete':
        this.sql = this.sql
          .delete()
          .from(this.tableName);
        break
      case 'update':
        this.sql = this.sql
          .update()
          .table(this.tableName);
        break;
      default:
        throw new Error(`Unsupported query operation: ${operation}`);
        break;
    }
  }
  
  public async create(data: Partial<T>): Promise<T | null> {
    this.set('create');

    const entries = Object.entries(data);

    if (entries.length === 0) return null;

    entries.forEach(([key, value]) => {
      this.sql?.set(key, value); 
    });

    return this.sql?.toString(); 
  }

  public async findAll(lookup: LookupsConfig<T>) {
    this.set('read');

    const whereConditionals = lookup?.where;
    if (whereConditionals) {
      if (whereConditionals?.and) {
        const filters = Object.entries(whereConditionals?.and).map(
          ([key, value]) => {
            const lookupIsString = typeof value === 'string';
            const lookupSearch = lookupIsString && value.includes('%') ?  'LIKE' : '=';

            return `${key} ${lookupSearch} ${lookupIsString ? `'${value}'` : value}`;
          }
        );

        this.sql?.where(`${filters.join(" AND ")}`);
      }
      
      if (whereConditionals?.or) {
        const filters = Object.entries(whereConditionals?.or).map(
          ([key, value]) => {
            const lookupIsString = typeof value === 'string';
            const lookupSearch = lookupIsString && value.includes('%') ?  'LIKE' : '=';

            return `${key} ${lookupSearch} ${lookupIsString ? `'${value}'` : value}`;
          }
        );

        this.sql?.where(`${filters.join(" OR ")}`);
      }
    }

    return this.sql?.toString();
  }

  public async find(lookup: Partial<T>): Promise<T | null> {
    this.set('read');

    const entries = Object.entries(lookup);

    if (entries.length === 0) return null;

    entries.forEach(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `'${value}'` : value;
      
      this.sql.where(`${key} = ${formattedValue}`);
    });

    return this.sql?.toString();
  }

  public async update(data: DefaultValues<T>): Promise<T | null> {
    this.set('update');

    if (!data?.id) throw new Error('Sensive batch operation not permitted, Id is missing!');

    const entries = Object.entries(data);

    if (entries.length === 0) return null;

    entries.forEach(([key, value]) => {
      this.sql?.set(key, value); 
    });

    this.sql.where('id', data.id);

    return this.sql?.toString();
  }

  public async delete(lookup: Partial<T>) {
    this.set('delete');

    const entries = Object.entries(lookup);

    if (entries.length === 0) return null;

    entries.forEach(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `'${value}'` : value;
      
      this.sql.where(`${key} = ${formattedValue}`);
    });

    return this.sql?.toString();
  }
}
