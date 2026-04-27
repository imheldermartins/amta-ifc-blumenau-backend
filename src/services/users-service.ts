import db from "@models/index";

const log = (str: any) => console.log(`SQL: ${str}`);

export async function getUser() {
  await db.users
    .find({ 
        email: "hylson@ifc.edu.br", 
        name: "Hylson" 
    })
    .then(log);
  
    await db.users
        .create({ 
            email: "hylson@ifc.edu.br", 
            name: "Hylson" 
        })
        .then(log);
    
    await db.users
        .delete({ 
            email: "hylson@ifc.edu.br", 
            name: "Hylson" 
        })
        .then(log);
    
    await db.users
        .update({
            id: '1',
            email: "hylson@ifc.edu.br", 
            name: "Hylson" 
        })
        .then(log);
    
    await db.users
        .findAll({ 
            where: {
                and: {
                    email: 'hylson@gmail.com',
                    id: '1'
                },
                or: {
                    name: '%held%'
                }
            }
        })
        .then(log);
}

