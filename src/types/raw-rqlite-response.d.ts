type ErrorQuerying = { error: string; };

type DBTypes = 'integer' | 'text';

type QueryResult<T> = {
    types: Record<keyof T, DBTypes>;
    rows: T[];
} | ErrorQuerying;

type ExecuteResult = {
	last_insert_id: number;
	rows_affected: number;
} | ErrorQuerying;

type SQLResponse<T> = {
	results: QueryResult<T>[];
};