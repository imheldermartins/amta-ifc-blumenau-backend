import { Model } from "@database/model";
import type { UserSchema } from "@database/schemas/user-schema";

const users = new Model<UserSchema>("users")
export { users };