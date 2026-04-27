type Column = string;
type Types = "integer" | "text" | "blob";
type Value = (number | string)[];

type ErrorQuerying = { error: string; };

type QueryResult = {
    columns: Column[];
    types: Types[];
    values: Value[];
} | ErrorQuerying;

type ExecuteResult = {
	last_insert_id: number;
	rows_affected: number;
} | ErrorQuerying;

type RqliteResponse = {
	results: Result[];
};