import { parseSqlite } from "@/utils/parser-rqlite-response";
import sendRequest from "@/utils/sendRequest";

const WORKSPACE_DB_API_URL = "http://localhost:4001";

type Endpoint = 'query' | 'execute' | 'request';

async function rqlite<T>(
  sqlQueries: string[], 
  endpoint: Endpoint
): Promise<RqliteResponse['results'] | null> {
  const response = await sendRequest<RqliteResponse>(
    "post",
    `${WORKSPACE_DB_API_URL}/db/${endpoint}?pretty`,
    [...sqlQueries],
  );

  const results = response?.results;

  return parseSqlite(results!);
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
  const results = await rqlite([sql], endpoint) as T[];

  const rows = parseSqlite(results);

  return rows as T[];
}


export default sql;
