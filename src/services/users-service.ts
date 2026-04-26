import db from "@models/index";

export async function getUser() {
  await db.users
    .find({ 
        email: "hylson@ifc.edu.br", 
        name: "Hylson" 
    })
    .then(console.log);
}

