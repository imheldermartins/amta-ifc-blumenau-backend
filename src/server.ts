import dbQuery from "./database/db-query.js";

dbQuery<{ id: number; nome: string; }>('SELECT * FROM teste;')
    .then(res => {
        const row = res![0]!;
        console.log(`Id: ${row.id} e Nome: ${row.nome}`);
    });