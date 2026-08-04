import { AlertTriangle, SearchX, UserX } from "lucide-react";

const painPoints = [
  "Depende só de indicação",
  "Fica sem demanda em alguns dias",
  "Clientes não te encontram no Google",
];

export function PainPointsSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="glass rounded-2xl border border-red-200/60 bg-red-50/40 p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Alerta de demanda
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Você está perdendo clientes todos os dias
          </h2>

          <ul className="mt-6 space-y-3">
            {painPoints.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <SearchX className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <span className="text-sm font-medium text-slate-700 sm:text-base">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl border border-border/50 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserX className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Sem cadastro, sem visibilidade
            </p>
          </div>

          <p className="mt-4 text-base leading-8 text-slate-600">
            Enquanto você espera indicação, outros prestadores estão recebendo
            contato direto todos os dias.
          </p>

          <p className="mt-4 text-sm font-semibold text-primary">
            Quem entra primeiro aparece mais.
          </p>
        </div>
      </div>
    </section>
  );
}
