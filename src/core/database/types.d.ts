type LookupWhere<T> = {
  and?: DefaultValues<T>;
  or?: DefaultValues<T>;
};

type LookupsConfig<T> = {
  where?: LookupWhere<T>;
  limit?: number;
} & DefaultValues<T>;

type DefaultValues<T> = Omit<Partial<T>, 'id'> 
  & { id?: NonEmptyString; };

type DefaultValues<T> = AtLeastOne<T>;