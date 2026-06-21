import db from "@models/index";

export async function createUser() {
  try {
    return await db.users
      .create({
        name: "Helder",
        email: "helder@gmail.com"
      });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[${error.cause}] ${error.message}`);
    }
    return null;
  }
}

export async function getUser() {
  try {
    return await db.users
      .find({
        id: '01KVNJRVJHT5GTHRZGM7ZPZPWT'
        // email: "helder@gmail.com"
      });

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
    return null;
  }
}
