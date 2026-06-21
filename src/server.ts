import { createUser, getUser } from "@/services/users-service";

(async () => {
    // await createUser().then(u => console.log(`CreateUser::`, u));
  await getUser().then(u => console.log(`FindUser::`, u));
})();