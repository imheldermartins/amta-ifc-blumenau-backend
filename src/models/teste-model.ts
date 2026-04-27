import { Model } from "@database/model";
import type { TesteSchema } from "@/database/schemas/teste-schema";

const teste = new Model<TesteSchema>("teste")
export { teste };