function parseRuntimeValue(value: any, dbType: string): any {
    if (value === null || value === undefined) return null;

    switch (dbType.toLowerCase()) {
        case 'integer':
        case 'int':
        case 'real':
        case 'numeric':
            return Number(value);
        case 'text':
        case 'varchar':
            return String(value);
        case 'boolean':
        case 'bool':
            return value === 1 || value === 'true'; 
        default:
            return value;
    }
}

export function parseSqlite<T = Record<string, any>>(rawResults: RawResult['results']): T[] {
    const parsedRows: T[] = [];

    for (const resultBlock of rawResults) {
        // @ts-ignore
        const { columns, types, values } = resultBlock!;

        for (const row of values) {
            const rowObject: Record<string, any> = {};

            for (let i = 0; i < columns.length; i++) {
                const columnName = columns[i] as string;
                let rawValue = row[i];
                
                if (types && types[i]) {
                    rawValue = parseRuntimeValue(rawValue, types[i] as string);
                }

                rowObject[columnName] = rawValue;
            }
            
            parsedRows.push(rowObject as T);
        }
    }

    return parsedRows;
}