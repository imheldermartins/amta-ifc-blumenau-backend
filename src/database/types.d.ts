type LookupWhere<T> = {
  and?: Partial<T>;
  or?: Partial<T>;
};

type LookupsConfig<T> = {
  where?: LookupWhere<T>;
};

type DefaultValues<T> = Omit<Partial<T>, 'id'> 
  & { id: NonEmptyString; };