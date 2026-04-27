type NonEmptyString = `${string}${string & { length: number }}` | `${any}${string}`;

type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K>}> = 
  Partial<T> & U[keyof U];