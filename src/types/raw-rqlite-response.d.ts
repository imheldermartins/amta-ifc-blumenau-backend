type Column = string;
type Types = "integer" | "text" | "blob";
type Value = (number | string)[];
type Result = {
    columns: Column[];
    types: Types[];
    values: Value[];
} | ErrorQuerying;

type ErrorQuerying = { error: string; };
type RawResult = {
	results: Result[];
};