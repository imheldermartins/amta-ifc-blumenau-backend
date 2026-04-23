import { Model } from "@/database/model.js";
import type { UserSchema } from "@/database/schemas/user-schema.js";

const users = new Model<UserSchema>("users")
export { users };