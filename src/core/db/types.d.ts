type AutoManagedFields = 'id' | 'created_at' | 'updated_at';

type CreateValues<T> = Omit<T, AutoManagedFields>;

type UpdateValues<T> = Partial<Omit<T, AutoManagedFields>>;

type LookupValues<T> = AtLeastOne<T>;

type LookupWhere<T> = {
  and?: Partial<T>;
  or?: Partial<T>;
};

type LookupsConfig<T> = {
  where?: LookupWhere<T>;
  limit?: number;
} & Partial<T>;