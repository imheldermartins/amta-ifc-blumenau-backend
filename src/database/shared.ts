import sendRequest from "@/utils/sendRequest";

const WORKSPACE_DB_API_URL = "http://localhost:4001";

type Endpoint = 'query' | 'execute' | 'request';

async function rqlite<T>(
  sqlQueries: string[], 
  endpoint: Endpoint
): Promise<SQLResponse<T>> {
  const response = await sendRequest<SQLResponse<T>>(
    "post",
    `${WORKSPACE_DB_API_URL}/db/${endpoint}?pretty&associative`,
    [...sqlQueries],
  );

  return response as SQLResponse<T>;
}

/**
 * @example Query: 
 *  Essa função será responsável apenas para requisições de leitura, ou seja, `SELECT`.
 * @example Execute: 
 *  Essa função será responsável apenas para requisições de escrita, ou seja, `CREATE | INSERT | UPDATE | ALTER, etc`.
 * @example Request: 
 *  Essa função será responsável apenas para requisições de leitura e escrita.
 * @param sql : Comando SQL que será enviado para execução.
 */
async function sql<T>(sql: string, endpoint: Endpoint = 'request'): Promise<T[] | null> {
  
  const errors: string[] = [];
  const response = await rqlite<T>([sql], endpoint);

  if (!(response?.results && Array.isArray(response?.results))) 
    throw new Error('Results is invalid.', { cause: 'SQLERROR' })
  
  const [result] = (response.results).map(result => {
      if ('error' in result) {
        errors.push(result.error);
        return null;
      }

      return result.rows as T[];
    }).filter(Boolean);

    if (errors.length > 0) {
        throw new Error(errors.map(err => `[${err}]`).join('\n'), {
            cause: 'SQLERROR'
        })
    }

    return result!;
}


export default sql;
