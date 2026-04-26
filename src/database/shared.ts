import { parseSqlite } from "@/utils/parser-rqlite-response";
import sendRequest from "@/utils/sendRequest";

const WORKSPACE_DB_API_URL = "http://localhost:4001";

/**
 * Essa função será responsável apenas para requisições de leitura, ou seja, `SELECT`.
 * @param sql : Comando SQL que será enviado para execução.
 */
async function dbQuery<T>(sql: string): Promise<T[] | null> {
  const response = await sendRequest<RawResult>(
    "post",
    `${WORKSPACE_DB_API_URL}/db/query?pretty`,
    [sql],
  );

  if (!response) throw new Error();

  const rows = parseSqlite(response.results);

  return rows as T[];
}

/**
 * Essa função será responsável por operações de escrita, como:
 * @example`CREATE` | `INSERT` | `UPDATE` | `ALTER`, etc.
 * @param sql : Comando SQL que será enviado para execução.
 */
async function dbExecute<T>(sql: string): Promise<T[] | null> {
  const response = await sendRequest<RawResult>(
    "post",
    `${WORKSPACE_DB_API_URL}/db/query?pretty`,
    [sql],
  );

  if (!response) throw new Error();

  const rows = parseSqlite(response.results);

  return rows as T[];
}

export { dbQuery, dbExecute };
