import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type SocialProofSectionProps = {
  registerHref: string;
  ctaLabel: string;
};

const socialStats = [
  {
    label: "Mais de 80 prestadores já cadastrados",
    support: "A plataforma segue crescendo com novos perfis ativos.",
  },
  {
    label: "Profissionais em +10 cidades",
    support: "Clientes já encontram prestadores em diferentes regiões.",
  },
  {
    label: "Novos cadastros toda semana",
    support: "Quem entra agora ganha vantagem competitiva local.",
  },
];

const profileCards = [
  {
    name: "Carlos Silva",
    role: "Eletricista",
    city: "Santo André",
    rating: "4.9",
  },
  {
    name: "Juliana Lima",
    role: "Diarista",
    city: "São Bernardo",
    rating: "5.0",
  },
  {
    name: "Rafael Costa",
    role: "Encanador",
    city: "São Caetano",
    rating: "4.8",
  },
];

export function SocialProofSection({
  registerHref,
  ctaLabel,
}: SocialProofSectionProps) {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Prova social
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Prestadores já estão saindo na frente com mais visibilidade local
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {socialStats.map((item) => (
            <div
              key={item.label}
              className="glass rounded-2xl border border-border/50 p-5 shadow-sm"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900 sm:text-base">
                {item.label}
              </p>
              <p className="mt-2 text-sm text-slate-600">{item.support}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {profileCards.map((profile) => (
            <div
              key={profile.name}
              className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {profile.name}
                  </p>
                  <p className="text-sm text-slate-600">{profile.role}</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {profile.rating}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  WhatsApp ativo
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm font-medium leading-7 text-slate-700">
            Cadastre-se agora e saia na frente na sua cidade. O cliente já está
            procurando serviço neste momento.
          </p>
          <Link href={registerHref}>
            <Button className="gradient-bg rounded-xl border-0 px-6 text-white hover:brightness-105">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
