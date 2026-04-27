import db from "@models/index";

export async function getUser() {
  try {
    await db.users
      .find({
        id: "1",
        email: "helder",
      })
      .then(console.log);

    // await db.users
    //   .create({
    //     email: "hylson@ifc.edu.br",
    //     name: "Hylson",
    //   })
    //   .then(log);

    // await db.users
    //   .delete({
    //     email: "hylson@ifc.edu.br",
    //     name: "Hylson",
    //   })
    //   .then(log);

    // await db.users
    //   .update({
    //     id: '1',
    //     email: "hylson@ifc.edu.br",
    //     name: "Hylson",
    //   })
    //   .then(log);

    // await db.users
    //   .findAll({
    //     where: {
    //       and: {
    //         email: "hylson@gmail.com",
    //         id: "1",
    //       },
    //       or: {
    //         name: "%held%",
    //       },
    //     },
    //   })
    //   .then(log);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[${error.cause}] ${error.message}`);
    }
  }
}
