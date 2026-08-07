import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * Toda rota em app/(main) que nao for declarada no layout vira uma aba
 * automaticamente. Ja aconteceu duas vezes de sobrar aba na barra:
 * - "profile" nunca casou com profile/index.tsx (o nome do screen no
 *   expo-router e o caminho do arquivo, com o /index);
 * - converter provider/[id].tsx em pasta renomeou o screen para
 *   provider/[id]/index e o href:null antigo ficou obsoleto.
 *
 * Este teste falha se aparecer rota nova sem declaracao, ou declaracao
 * apontando para arquivo que nao existe.
 */

const MAIN_DIR = join(__dirname, "..", "..", "..", "app", "(main)");
const LAYOUT = join(MAIN_DIR, "_layout.tsx");

/** Nomes de screen do expo-router: caminho relativo, sem extensao, com /index */
function collectRouteNames(dir: string, prefix = ""): string[] {
  const names: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      names.push(...collectRouteNames(full, `${prefix}${entry}/`));
    } else if (entry.endsWith(".tsx") && entry !== "_layout.tsx") {
      names.push(`${prefix}${entry.replace(/\.tsx$/, "")}`);
    }
  }
  return names;
}

const layoutSource = readFileSync(LAYOUT, "utf8");

function declaredScreenNames(): string[] {
  return [...layoutSource.matchAll(/<Tabs\.Screen\s+name="([^"]+)"/g)].map(
    (m) => m[1]
  );
}

describe("layout de abas de (main)", () => {
  const routeNames = collectRouteNames(MAIN_DIR);
  const declared = declaredScreenNames();

  it("encontra as rotas e as declaracoes", () => {
    expect(routeNames.length).toBeGreaterThan(5);
    expect(declared.length).toBeGreaterThan(5);
  });

  it("declara toda rota de (main) no layout", () => {
    const missing = routeNames.filter((r) => !declared.includes(r));
    expect(missing).toEqual([]);
  });

  it("nao declara screen que nao existe como arquivo", () => {
    const orphan = declared.filter((d) => !routeNames.includes(d));
    expect(orphan).toEqual([]);
  });

  it("expoe exatamente as quatro abas da barra", () => {
    // Uma aba e um Tabs.Screen sem href:null
    const tabs = [
      ...layoutSource.matchAll(
        /<Tabs\.Screen\s+name="([^"]+)"\s+options=\{\{([\s\S]*?)\}\}\s*\/>/g
      ),
    ]
      .filter(([, , options]) => !options.includes("href: null"))
      .map(([, name]) => name);

    expect(tabs.sort()).toEqual(
      ["favorites", "home", "profile/index", "search"].sort()
    );
  });
});
