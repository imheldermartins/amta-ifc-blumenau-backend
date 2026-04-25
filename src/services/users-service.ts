import { db } from "@models/index";

export async function getUser() {
    // await db.users.find({ id: "1" })
    await db.users.find({ email: "hylson@ifc.edu.br", name: "Hylson" })
        // .then(console.log);
}

































// await db.users.find({ email: "hylson@ifc.edu.br", name: "Hylson" })
// db.users.find({
//     email: "hylson"
// })