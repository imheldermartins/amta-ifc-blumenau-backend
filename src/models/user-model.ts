import { Model } from "@database/model";
import type { UserSchema } from "@models/schemas/user-schema";

const users = new Model<UserSchema>("users")
export { users };