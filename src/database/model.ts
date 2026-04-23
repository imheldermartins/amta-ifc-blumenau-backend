export class Model<T> {

    public tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    async find(id: number): Promise<T | null> {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        console.log(`Executando: ${sql} com id: ${id}`);
        return null;
    }

    async findAll() {
        return null;
    }
}