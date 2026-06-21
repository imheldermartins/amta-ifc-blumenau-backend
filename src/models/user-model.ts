import { Model } from "@/core/db/model";
import { type Schema } from "@models/schemas/index";

const users = new Model<Schema.User>("users");
export { users };