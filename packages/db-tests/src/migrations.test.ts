import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import {
  applyMigration,
  asAuthenticated,
  clickWhatsApp,
  countRows,
  createDatabase,
  createProvider,
  createUser,
  grantAuthenticatedAccess,
  notificationsOf,
  subscribeToPro,
} from "./database";

/** Dono do perfil, para conferir quem recebeu o aviso. */
async function ownerOf(db: PGlite, providerId: string): Promise<string> {
  const { rows } = await db.query<{ user_id: string }>(
    `select user_id from public.provider_profiles where id = $1::uuid`,
    [providerId],
  );
  return rows[0]!.user_id;
}

describe("schema e migrações", () => {
  it("aplicam da primeira à última sem erro", async () => {
    const { db, applied } = await createDatabase();
    const failures = applied.filter((file) => file.error !== null);

    expect(
      failures.map((f) => `${f.name}: ${f.error}`),
      "toda migração precisa aplicar limpa numa base nova",
    ).toEqual([]);

    await db.close();
  });

  it("podem ser reaplicadas — as novas são idempotentes", async () => {
    const { db } = await createDatabase();

    // Rodar de novo é o caso real: quem aplica pelo SQL Editor não tem
    // controle de versão e repete arquivo sem querer.
    for (const fragment of ["v20", "v21", "v22", "v23"]) {
      await expect(applyMigration(db, fragment)).resolves.not.toThrow();
    }

    await db.close();
  });
});

describe("v23 — cota de orçamentos do plano grátis", () => {
  let db: PGlite;
  let freeProvider: string;
  let proProvider: string;
  let client: string;

  beforeAll(async () => {
    ({ db } = await createDatabase());
    const freeUser = await createUser(db, 1, "Prestador Grátis");
    const proUser = await createUser(db, 2, "Prestador Pro");
    client = await createUser(db, 3, "Cliente");

    freeProvider = await createProvider(db, freeUser);
    proProvider = await createProvider(db, proUser);
    await subscribeToPro(db, proProvider);
  });

  afterAll(async () => {
    await db.close();
  });

  const acceptsQuotes = async (providerId: string) => {
    const { rows } = await db.query<{ a: boolean }>(
      `select public.provider_accepts_quotes($1::uuid) as a`,
      [providerId],
    );
    return rows[0]!.a;
  };

  const clickCount = (providerId: string) =>
    countRows(
      db,
      `select count(*)::int as c from public.whatsapp_clicks where provider_id = $1::uuid`,
      [providerId],
    );

  it("aceita os 10 primeiros orçamentos do mês", async () => {
    expect(await acceptsQuotes(freeProvider)).toBe(true);

    for (let i = 0; i < 10; i++) await clickWhatsApp(db, freeProvider, client);

    expect(await clickCount(freeProvider)).toBe(10);
  });

  it("recusa o 11º, no banco e não só na tela", async () => {
    expect(await acceptsQuotes(freeProvider)).toBe(false);

    await expect(clickWhatsApp(db, freeProvider, client)).rejects.toThrow(
      /limite de orçamentos do mês/i,
    );

    expect(await clickCount(freeProvider), "o clique recusado não pode ser gravado").toBe(10);
  });

  it("não limita quem assina o plano pago", async () => {
    for (let i = 0; i < 25; i++) await clickWhatsApp(db, proProvider, client);

    expect(await clickCount(proProvider)).toBe(25);
    expect(await acceptsQuotes(proProvider)).toBe(true);
  });

  it("avisa o prestador quando restam 3 e quando acaba", async () => {
    const owner = await ownerOf(db, freeProvider);
    const warnings = (await notificationsOf(db, owner)).filter((n) => n.type === "quota_warning");

    expect(warnings.map((w) => w.title)).toEqual([
      "Restam 3 orçamentos este mês",
      "Seus orçamentos do mês acabaram",
    ]);
  });

  it("não avisa de cota quem não tem cota", async () => {
    const owner = await ownerOf(db, proProvider);
    const warnings = (await notificationsOf(db, owner)).filter((n) => n.type === "quota_warning");

    expect(warnings).toEqual([]);
  });
});

describe("v21 — os avisos nascem dos eventos", () => {
  let db: PGlite;
  let provider: string;
  let providerUser: string;
  let client: string;

  beforeAll(async () => {
    ({ db } = await createDatabase());
    providerUser = await createUser(db, 1, "Prestador");
    client = await createUser(db, 2, "Cliente");
    provider = await createProvider(db, providerUser);
  });

  afterAll(async () => {
    await db.close();
  });

  it("pedido de orçamento vira aviso para o prestador", async () => {
    await clickWhatsApp(db, provider, client);

    const quotes = (await notificationsOf(db, providerUser)).filter(
      (n) => n.type === "quote_request",
    );

    expect(quotes).toHaveLength(1);
    expect(quotes[0]!.body).toContain("Cliente");
  });

  it("o prestador abrindo o próprio WhatsApp não vira aviso", async () => {
    const before = (await notificationsOf(db, providerUser)).length;

    await clickWhatsApp(db, provider, providerUser);

    expect((await notificationsOf(db, providerUser)).length).toBe(before);
  });

  it("avaliação vira aviso para o prestador, com a nota no título", async () => {
    await db.query(
      `insert into public.reviews (provider_id, client_id, rating, comment)
       values ($1::uuid, $2::uuid, 5, 'Excelente')`,
      [provider, client],
    );

    const reviews = (await notificationsOf(db, providerUser)).filter(
      (n) => n.type === "new_review",
    );

    expect(reviews).toHaveLength(1);
    expect(reviews[0]!.title).toBe("5 estrelas de Cliente");
    expect(reviews[0]!.body).toBe("Excelente");
  });

  it("resposta do profissional vira aviso para quem avaliou", async () => {
    const { rows } = await db.query<{ id: string }>(`select id from public.reviews limit 1`);

    await db.query(
      `insert into public.review_replies (review_id, provider_id, content)
       values ($1::uuid, $2::uuid, 'Obrigado pela confiança!')`,
      [rows[0]!.id, provider],
    );

    const replies = (await notificationsOf(db, client)).filter((n) => n.type === "review_reply");

    expect(replies).toHaveLength(1);
    expect(replies[0]!.body).toBe("Obrigado pela confiança!");
  });

  it("a preferência desligada impede o aviso", async () => {
    const otherClient = await createUser(db, 3, "Outro Cliente");
    await db.query(
      `update public.notification_preferences set new_reviews = false where user_id = $1::uuid`,
      [providerUser],
    );

    await db.query(
      `insert into public.reviews (provider_id, client_id, rating) values ($1::uuid, $2::uuid, 4)`,
      [provider, otherClient],
    );

    const reviews = (await notificationsOf(db, providerUser)).filter(
      (n) => n.type === "new_review",
    );

    expect(reviews, "continua só a primeira avaliação").toHaveLength(1);
  });
});

describe("v22 — o push é enfileirado", () => {
  let db: PGlite;
  let user: string;

  beforeAll(async () => {
    ({ db } = await createDatabase());
    user = await createUser(db, 1, "Pessoa");
  });

  afterAll(async () => {
    await db.close();
  });

  const calls = async () => {
    const { rows } = await db.query<{ url: string; body: Record<string, unknown> }>(
      `select url, body from net._calls order by id`,
    );
    return rows;
  };

  const notify = () =>
    db.query(
      `insert into public.notifications (user_id, type, title, body)
       values ($1::uuid, 'system', 'Oi', 'Corpo')`,
      [user],
    );

  it("sem as configurações do projeto, não chama nada e não quebra o insert", async () => {
    await expect(notify()).resolves.toBeTruthy();

    expect(await calls(), "push não configurado não pode derrubar o aviso").toEqual([]);
    expect(await countRows(db, `select count(*)::int as c from public.notifications`)).toBe(1);
  });

  it("configurado, chama a Edge Function passando só o id do aviso", async () => {
    await db.query(`select public.set_push_config($1::text, $2::text)`, [
      "https://exemplo.supabase.co/functions/v1",
      "chave-de-teste",
    ]);

    await notify();

    const sent = await calls();

    expect(sent).toHaveLength(1);
    expect(sent[0]!.url).toBe("https://exemplo.supabase.co/functions/v1/send-push");
    expect(Object.keys(sent[0]!.body)).toEqual(["notification_id"]);
  });

  it("set_push_config pode ser chamada de novo, para rotacionar a chave", async () => {
    await db.query(`select public.set_push_config($1::text, $2::text)`, [
      "https://outro.supabase.co/functions/v1",
      "chave-rotacionada",
    ]);

    const { rows } = await db.query<{ n: number }>(
      `select count(*)::int as n from vault.secrets where name in
         ('push_edge_base_url', 'push_service_role_key')`,
    );
    expect(rows[0]!.n, "atualiza no lugar, não acumula segredo").toBe(2);

    await notify();

    const sent = await calls();
    expect(sent.at(-1)!.url).toBe("https://outro.supabase.co/functions/v1/send-push");
  });

  it("não deixa quem usa o app mexer na configuração do push", async () => {
    // A função é SECURITY DEFINER e recebe a service_role_key: se `anon` ou
    // `authenticated` pudessem executá-la, dava para apontar o push de todo
    // mundo para um servidor qualquer.
    const { rows } = await db.query<{ has: boolean }>(
      `select bool_or(
                has_function_privilege(role_name, 'public.set_push_config(text, text)', 'EXECUTE')
              ) as has
         from (values ('anon'), ('authenticated')) as r(role_name)`,
    );
    expect(rows[0]!.has).toBe(false);
  });
});

describe("v20 — 'Meus contatos' do cliente", () => {
  it("destrava a leitura dos próprios contatos sem abrir os alheios", async () => {
    // Sobe sem a v20 para medir o antes: é o bug que ela conserta.
    const { db } = await createDatabase({ skip: ["v20"] });

    const providerUser = await createUser(db, 1, "Prestador");
    const client = await createUser(db, 2, "Cliente");
    const stranger = await createUser(db, 3, "Terceiro");
    const provider = await createProvider(db, providerUser);

    await clickWhatsApp(db, provider, client);
    await grantAuthenticatedAccess(db);

    const seenBy = (userId: string) =>
      asAuthenticated(db, userId, () =>
        countRows(db, `select count(*)::int as c from public.whatsapp_clicks`),
      );

    expect(await seenBy(client), "antes da v20 a tela abria vazia").toBe(0);

    await applyMigration(db, "v20");

    expect(await seenBy(client), "depois da v20 o cliente vê o próprio contato").toBe(1);
    expect(await seenBy(stranger), "e continua sem ver o contato dos outros").toBe(0);

    await db.close();
  });
});
