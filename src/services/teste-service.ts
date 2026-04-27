import db from "@models/index";

export async function getTeste() {
  try {
    await db.teste
      .find({
        // @ts-ignore
        id: 1,
      })
      .then(t => console.log('Unique: ', JSON.stringify(t)));
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[${error.cause}] ${error.message}`);
    }
  }
}

export async function getTestes() {
  try {
    await db.teste
      .findAll()
      .then(t => console.log('All: ', JSON.stringify(t)));
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[${error.cause}] ${error.message}`);
    }
  }
}
