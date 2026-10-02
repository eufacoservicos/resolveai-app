import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SUPABASE_DIR = join(here, "..", "..", "..", "supabase");

/**
 * Migrações na ordem em que são aplicadas em produção: `migration-vN`,
 * ordenado pelo número — não pelo nome, senão v10 vem antes de v2.
 */
export function migrationFiles(): string[] {
  return readdirSync(SUPABASE_DIR)
    .filter((name) => /^migration-v\d+.*\.sql$/.test(name))
    .sort((a, b) => Number(/v(\d+)/.exec(a)![1]) - Number(/v(\d+)/.exec(b)![1]))
    .map((name) => join(SUPABASE_DIR, name));
}

function read(file: string): string {
  // O PGlite não traz uuid-ossp, unaccent, cube/earthdistance nem pg_net.
  // A fixture supre as funções que o schema usa; aqui neutralizamos os
  // CREATE EXTENSION, que não são o que estes testes verificam.
  return readFileSync(file, "utf8").replace(
    /create\s+extension\s+if\s+not\s+exists[^;]*;/gi,
    "",
  );
}

export interface AppliedFile {
  name: string;
  error: string | null;
}

/**
 * Sobe um Postgres em memória com o schema e todas as migrações aplicadas.
 *
 * Devolve também o resultado de cada arquivo, para um teste poder afirmar
 * que tudo aplicou limpo.
 *
 * `skip` deixa de fora migrações específicas, o que permite medir o estado
 * antes e depois de uma correção.
 */
export async function createDatabase(options: { skip?: string[] } = {}) {
  const db = await PGlite.create();
  const applied: AppliedFile[] = [];

  const files = [
    join(here, "fixture.sql"),
    join(SUPABASE_DIR, "schema.sql"),
    ...migrationFiles(),
  ].filter((file) => !options.skip?.some((fragment) => file.includes(fragment)));

  for (const file of files) {
    const name = file.split(/[\/]/).pop()!;
    try {
      await db.exec(read(file));
      applied.push({ name, error: null });
    } catch (error) {
      applied.push({ name, error: (error as Error).message });
    }
  }

  return { db, applied };
}

/** Aplica uma migração isolada, para exercitar o antes e o depois dela. */
export async function applyMigration(db: PGlite, fragment: string) {
  const file = migrationFiles().find((path) => path.includes(fragment));
  if (!file) throw new Error(`Migração não encontrada: ${fragment}`);
  await db.exec(read(file));
}

const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;

/** Cria a conta no auth; o gatilho da v9 espelha em public.users. */
export async function createUser(db: PGlite, n: number, fullName: string) {
  const id = uuid(n);
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data)
     values ($1::uuid, $2::text, jsonb_build_object('full_name', $3::text))`,
    [id, `usuario-${n}@teste.com`, fullName],
  );
  return id;
}

/** Promove a prestador e devolve o id do perfil que o gatilho cria. */
export async function createProvider(db: PGlite, userId: string): Promise<string> {
  await db.query(`update public.users set role = 'PROVIDER' where id = $1::uuid`, [userId]);
  const { rows } = await db.query<{ id: string }>(
    `select id from public.provider_profiles where user_id = $1::uuid`,
    [userId],
  );
  return rows[0]!.id;
}

export async function subscribeToPro(db: PGlite, providerId: string) {
  await db.query(
    `insert into public.provider_subscriptions
       (provider_id, plan, status, current_period_start, current_period_end)
     values ($1::uuid, 'pro', 'active', now(), now() + interval '30 days')`,
    [providerId],
  );
}

export async function clickWhatsApp(db: PGlite, providerId: string, clickerId: string) {
  await db.query(
    `insert into public.whatsapp_clicks (provider_id, clicker_id) values ($1::uuid, $2::uuid)`,
    [providerId, clickerId],
  );
}

export async function notificationsOf(db: PGlite, userId: string) {
  const { rows } = await db.query<{ type: string; title: string; body: string }>(
    `select type, title, body from public.notifications
      where user_id = $1::uuid order by created_at, title`,
    [userId],
  );
  return rows;
}

export async function countRows(db: PGlite, sql: string, params: unknown[] = []) {
  const { rows } = await db.query<{ c: number }>(sql, params);
  return Number(rows[0]!.c);
}

/**
 * Roda uma consulta como um usuário logado, sujeita à RLS.
 *
 * No Supabase o papel `authenticated` tem GRANT em todo o schema public e a
 * RLS é que restringe — reproduzimos isso para a policy ser o que decide.
 */
export async function asAuthenticated<T>(
  db: PGlite,
  userId: string,
  run: () => Promise<T>,
): Promise<T> {
  await db.exec(`set test.uid = '${userId}'; set role authenticated;`);
  try {
    return await run();
  } finally {
    await db.exec(`reset role;`);
  }
}

export async function grantAuthenticatedAccess(db: PGlite) {
  await db.exec(`grant usage on schema public to authenticated;
                 grant select on all tables in schema public to authenticated;`);
}
