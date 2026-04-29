import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { rqlite } from "@database/shared";

(class SchemaBuilder {

    static raw(): string {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        return fs.readFileSync(
            path.join(__dirname, './migration.sql'), 
            'utf8'
        );
    }

    static async build() {
        try {

            const raw = this.raw();

            if (!raw) {
                throw new Error('Migration file sql is not defined');
            }
            /**
             * Possibilidades de criar múltiplas seleções e ter controle melhor
            */
            await rqlite<any>([raw], 'execute')
                .then(results => {
                    if (!results) {
                        throw new Error('Migration is failed.')
                    } else {
                        results.forEach((result, index) => {
                            const migration = `Migration::${index + 1}`;
                            if ('error' in result)
                                console.error(`${migration} is not applied. \nError: ${result.error}`)
                            else
                                console.log(`${migration} is applied with successfully.\n`, JSON.stringify(result, null, 2));
                        });
                    }
                });
        } catch (error) {
            if (error instanceof Error) {
                console.error(`[Server] ${error.message}`);
            }
        }
    }
}).build();