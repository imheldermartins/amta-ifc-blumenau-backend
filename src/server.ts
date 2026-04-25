import dbQuery from "@database/db-query";

dbQuery<{ id: number; nome: string; }>('SELECT * FROM teste;')
    .then(res => {
        const row = res![0]!;
        console.log(`Id: ${row.id} e Nome: ${row.nome}`);
    });

// import { getUser } from "./services/users-service.js";

// getUser();