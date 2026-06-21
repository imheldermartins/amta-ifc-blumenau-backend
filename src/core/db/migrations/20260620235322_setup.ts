import { type Migration } from '../migrator.js';

export const migration: Migration = {
  id: '20260620235322_setup',
  up: [
    /**
     * Workspaces
     * - id: string (UUID)
     * - name: string
     * - data: JSON (for any additional metadata)
     * - created_at: timestamp
     * - updated_at: timestamp
     * 
     * Representam a área de trabalho que está sendo utilizado pelo usuário. 
     * O mesmo ID utilizado será utilizado para 'páginaRoot', que é a database de onde as páginas serão criadas.
     */
    `CREATE TABLE IF NOT EXISTS workspaces (
      \`id\` BLOB PRIMARY KEY NOT NULL,
      \`name\` TEXT,
      \`data\` JSON,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )`,
    /**
     * Users
     * - id: string (UUID)
     * - name: string
     * - email: string (unique)
     * - created_at: timestamp
     * - updated_at: timestamp
     * 
     * Representam os usuários do sistema. 
     * Cada usuário pode ter múltiplas workspaces, e cada workspace pode ter múltiplos usuários (muitos-para-muitos).
     */
    `CREATE TABLE IF NOT EXISTS users (
      id BLOB NOT NULL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )`,
    /**
     * Índice para otimizar buscas por email, já que é um campo único e 
     * frequentemente utilizado para autenticação e recuperação de usuários.
     */
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    /**
     * Pages
     * - id: string (UUID)
     * - title: string
     * - data: JSON (para armazenar conteúdo adicional da página como configurações, etc.)
     * - owner_id: string (UUID) (referência ao usuário que é o dono da página)
     * - created_at: timestamp
     * - updated_at: timestamp
     */
    `CREATE TABLE IF NOT EXISTS pages (
      id BLOB NOT NULL PRIMARY KEY,
      title TEXT,
      \`data\` JSON,
      owner_id BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      FOREIGN KEY (owner_id) REFERENCES users (id)
    )`,
    /**
     * Page Hubs
     * - id: string (UUID)
     * - page_root_id: string (UUID) (referência à página raiz, que é a workspace)
     * - page_id: string (UUID) (referência à página filha)
     * - created_at: timestamp
     * - updated_at: timestamp
     * 
     * Representam as conexões entre páginas, permitindo criar uma estrutura hierárquica ou de rede entre elas. 
     * Cada registro indica que uma página (page_id) está conectada a uma página raiz (page_root_id).
     */
    `CREATE TABLE IF NOT EXISTS page_hubs (
      id BLOB PRIMARY KEY NOT NULL,
      page_root_id BLOB NOT NULL,
      page_id BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      FOREIGN KEY(page_root_id) REFERENCES pages (id),
      FOREIGN KEY(page_id) REFERENCES pages (id),
      UNIQUE(page_root_id, page_id)
    )`,
    /**
     * Page Columns
     * - id: string (UUID)
     * - name: string
     * - type: string (text, numeric, select, date, checkbox)
     * - data: JSON (para armazenar opções adicionais, como opções para select, etc.)
     * - page_root_id: string (UUID) (referência à página raiz a que essa coluna pertence)
     * - created_at: timestamp
     * - updated_at: timestamp
     * 
     * Representam as colunas de uma página, permitindo criar diferentes tipos de conteúdo dentro de uma página.
     */
    `CREATE TABLE IF NOT EXISTS page_columns (
      \`id\` BLOB NOT NULL PRIMARY KEY,
      \`name\` TEXT,
      \`type\` TEXT CHECK (type IN ('text', 'numeric', 'select', 'date', 'checkbox')),
      \`data\` JSON,
      \`page_root_id\` BLOB,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      FOREIGN KEY(\`page_root_id\`) REFERENCES pages (id)
    )`,
    /**
     * Page Column Values
     * - id: string (UUID)
     * - data: JSON (para armazenar o valor da coluna para uma página específica)
     * - page_column_id: string (UUID) (referência à coluna a que esse valor pertence)
     * - page_id: string (UUID) (referência à página a que esse valor pertence)
     * - created_at: timestamp
     * - updated_at: timestamp
     * 
     * Representam os valores associados a uma coluna de uma página, permitindo armazenar dados específicos para cada combinação de coluna e página.
     */
    `CREATE TABLE IF NOT EXISTS page_columns_values (
      id BLOB PRIMARY KEY NOT NULL,
      \`data\` JSON,
      page_column_id BLOB,
      page_id BLOB,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      FOREIGN KEY (page_column_id) REFERENCES page_columns (id),
      FOREIGN KEY (page_id) REFERENCES pages (id)
    )`
  ],
  down: [
    `DROP TABLE IF EXISTS page_columns_values`,
    `DROP TABLE IF EXISTS page_columns`,
    `DROP TABLE IF EXISTS page_hubs`,
    `DROP TABLE IF EXISTS pages`,
    `DROP TABLE IF EXISTS users`,
    `DROP TABLE IF EXISTS workspaces`
  ]
};
