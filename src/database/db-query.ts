import { parseSqlite } from "@/utils/parser-rqlite-response.js";
import sendRequest from "@/utils/sendRequest.js";

const WORKSPACE_DB_API_URL = "http://localhost:4001";

/**
 * Essa função será responsável apenas para requisições de leitura, ou seja, `SELECT`.
 * @param sql : Comando SQL que será enviado para execução.
 */
export default async function dbQuery<T>(sql: string): Promise<T[] | null> {
  const response = await sendRequest<RawResult>(
    "post",
    `${WORKSPACE_DB_API_URL}/db/query?pretty`,
    [sql],
  );

  if (!response) throw new Error();

  const rows = parseSqlite(response.results);

  return rows as T[];
}
