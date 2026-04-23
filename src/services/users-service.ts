import { db } from "@models/index";

export async function getUser() {
    await db.users.find(1).then(user => {

        console.log(`UserService: ${user?.name}`)
    })
}