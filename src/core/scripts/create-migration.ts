import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, '../db/migrations');

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function template(id: string): string {
  return `import { type Migration } from '../migrator.js';

export const migration: Migration = {
  id: '${id}',
  up: [

  ],
  down: [

  ]
};
`;
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const description = await ask('>> Digite sobre o que é a migration: ');
  const slug = slugify(description);

  if (!slug) {
    console.error('Nome inválido: a descrição não gerou nenhum caractere válido.');
    process.exit(1);
  }

  if (!existsSync(MIGRATIONS_DIR)) {
    mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }

  const id = `${timestamp()}_${slug}`;
  const filePath = join(MIGRATIONS_DIR, `${id}.ts`);

  if (existsSync(filePath)) {
    console.error(`O arquivo ${filePath} já existe.`);
    process.exit(1);
  }

  writeFileSync(filePath, template(id), 'utf8');
  console.log(`Migration criada: migrations/${id}.ts`);
}

main();