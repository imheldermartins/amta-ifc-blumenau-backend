import { Model } from "@database/model";
import type { WorkspaceSchema } from "@/models/schemas/workspace-schema";

const workspaces = new Model<WorkspaceSchema>("workspaces");
export { workspaces };