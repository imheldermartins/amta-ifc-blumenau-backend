import type { EntityBase } from "@/models/schemas/entity-base";

export namespace Schema {
  export interface User extends EntityBase {
    name: string | null;
    email: string;
    created_at?: string;
    updated_at?: string;
  }
  export interface Users extends User {}

  // --- 2. WORKSPACES ---
  export interface Workspace extends EntityBase {
    name: string | null;
    data: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  export interface Workspaces extends Workspace {}

  // --- 3. PAGES ---
  export interface Page extends EntityBase {
    title: string | null;
    data: Record<string, any>;
    owner_id: string; // ID do usuário dono (UUID)
    created_at?: string;
    updated_at?: string;
  }
  export interface Pages extends Page {}

  // --- 4. PAGE HUBS (Hierarquia/Conexões de Páginas) ---
  export interface PageHub extends EntityBase {
    page_root_id: string; // ID da página raiz (workspace)
    page_id: string;      // ID da página filha
    created_at?: string;
    updated_at?: string;
  }
  export interface PageHubs extends PageHub {}

  // --- 5. PAGE COLUMNS (Configurações de Colunas) ---
  export type ColumnType = 'text' | 'numeric' | 'select' | 'date' | 'checkbox';

  export interface PageColumn extends EntityBase {
    name: string | null;
    type: ColumnType;
    data: Record<string, any>;
    page_root_id: string | null;
    created_at?: string;
    updated_at?: string;
  }
  export interface PageColumns extends PageColumn {}

  // --- 6. PAGE COLUMNS VALUES (Valores das Colunas) ---
  export interface PageColumnValue extends EntityBase {
    data: Record<string, any>;
    page_column_id: string | null;
    page_id: string | null;
    created_at?: string;
    updated_at?: string;
  }
  export interface PageColumnsValues extends PageColumnValue {}
}
