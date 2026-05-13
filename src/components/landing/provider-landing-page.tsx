"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Hammer,
  HelpCircle,
  MessageCircle,
  Paintbrush,
  Scissors,
  Search,
  Smartphone,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { PainPointsSection } from "@/components/landing/pain-points-section";
import { ProviderFaqAccordion } from "@/components/landing/provider-faq-accordion";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { Button } from "@/components/ui/button";

type CopyVariant = "a" | "b";

type ProviderLandingPageProps = {
  headlineVariant?: CopyVariant;
  ctaVariant?: CopyVariant;
};

const registerHref = "/register?role=provider&source=providers";

const ctaBackground =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop&crop=center&q=60";

const heroVariants = {
  a: {
    title:
      "Pare de depender de indicação: receba clientes todos os dias na sua cidade",
    subtitle:
      "Clientes estão procurando seu serviço AGORA. Cadastre-se e comece a receber contatos no WhatsApp.",
  },
  b: {
    title:
      "Seu serviço não pode ficar invisível: apareça para clientes da sua cidade hoje",
    subtitle:
      "Tem gente buscando profissional neste momento. Entre agora e comece a receber mensagens no WhatsApp.",
  },
} satisfies Record<CopyVariant, { title: string; subtitle: string }>;

const ctaVariants = {
  a: {
    top: "Quero receber clientes",
    hero: "Quero receber clientes",
    middle: "Começar a receber contatos",
    benefits: "Quero aparecer para clientes",
    final: "Quero receber clientes",
  },
  b: {
    top: "Começar a receber contatos",
    hero: "Começar a receber contatos",
    middle: "Quero aparecer para clientes",
    benefits: "Quero receber clientes",
    final: "Começar a receber contatos",
  },
} satisfies Record<
  CopyVariant,
  {
    top: string;
    hero: string;
    middle: string;
    benefits: string;
    final: string;
  }
>;

const heroHighlights = [
  "Cadastro rápido e grátis",
  "Contato direto no WhatsApp",
  "Quem entra primeiro aparece mais",
];

const resultBenefits = [
  {
    icon: Search,
    title: "Apareça para clientes que já estão procurando seu serviço",
    description: "Sua visibilidade aumenta para quem quer contratar agora.",
  },
  {
    icon: MessageCircle,
    title: "Receba pedidos no WhatsApp sem intermediários",
    description: "Conversa rápida, resposta direta e mais chance de fechar.",
  },
  {
    icon: Sparkles,
    title: "Construa autoridade local com um perfil profissional",
    description:
      "Passe mais confiança para clientes que comparam vários prestadores.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Mantenha sua agenda com mais demanda durante a semana",
    description: "Tenha um canal extra para reduzir dias com pouca demanda.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie seu perfil (leva 1 minuto)",
    description: "Preencha os dados principais e deixe seu contato pronto.",
  },
  {
    number: "02",
    title: "Apareça para clientes da sua cidade",
    description: "Seu perfil entra nas buscas de quem precisa do seu serviço.",
  },
  {
    number: "03",
    title: "Receba mensagens no WhatsApp",
    description: "Negocie direto com o cliente e feche serviços mais rápido.",
  },
];

const categories = [
  "Eletricista",
  "Encanador",
  "Diarista",
  "Pintor",
  "Jardineiro",
  "Cabeleireira",
  "Mecânico",
  "Técnico de informática",
];

const faqs = [
  {
    question: "Preciso pagar para criar meu perfil?",
    answer:
      "Não. O cadastro é grátis para começar. Você cria seu perfil e pode ajustar quando quiser.",
  },
  {
    question: "Quanto tempo leva para entrar?",
    answer:
      "Em cerca de 1 minuto você já publica o básico. Depois pode completar com mais detalhes.",
  },
  {
    question: "Como o cliente fala comigo?",
    answer:
      "O contato chega direto no seu WhatsApp. Sem intermediários e com resposta mais rápida.",
  },
];

function SectionDivider() {
  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
        <Sparkles className="h-5 w-5 text-primary/30" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
      </div>
    </div>
  );
}

function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
    >
      {children}
    </section>
  );
}

function RevealBlock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function HeroItem({
  children,
  className = "",
  delay,
  mounted,
}: {
  children: ReactNode;
  className?: string;
  delay: number;
  mounted: boolean;
}) {
  return (
    <div
      className={`transition-all duration-500 ease-out ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
      style={{ transitionDelay: mounted ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export function ProviderLandingPage({
  headlineVariant = "a",
  ctaVariant = "a",
}: ProviderLandingPageProps) {
  const heroCopy = heroVariants[headlineVariant];
  const ctaCopy = ctaVariants[ctaVariant];
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_42%),radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_36%)]" />

      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 animate-[slide-down_0.5s_ease-out_both] ${
          scrolled ? "glass border-b border-border/50 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="eufaço!"
              width={132}
              height={48}
              className="h-10 w-auto sm:h-14"
            />
            <span className="hidden rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:inline-flex">
              Para prestadores
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-slate-600 sm:inline-flex"
              >
                Sou cliente
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Entrar
              </Button>
            </Link>
            <Link href={registerHref}>
              <Button
                size="sm"
                className="gradient-bg rounded-xl border-0 px-4 text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)] hover:brightness-105"
              >
                {ctaCopy.top}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[10%] top-32 animate-float opacity-[0.08]">
              <Zap className="h-16 w-16 text-primary" />
            </div>
            <div
              className="absolute right-[12%] top-48 animate-float-slow opacity-[0.08]"
              style={{ animationDelay: "1s" }}
            >
              <Paintbrush className="h-14 w-14 text-primary" />
            </div>
            <div
              className="absolute bottom-24 left-[20%] animate-float-reverse opacity-[0.06]"
              style={{ animationDelay: "2s" }}
            >
              <Wrench className="h-12 w-12 text-primary" />
            </div>
            <div
              className="absolute left-[75%] top-64 animate-float opacity-[0.06]"
              style={{ animationDelay: "3s" }}
            >
              <Scissors className="h-12 w-12 text-primary" />
            </div>
            <div
              className="absolute bottom-40 right-[25%] animate-float-slow opacity-[0.07]"
              style={{ animationDelay: "0.5s" }}
            >
              <Hammer className="h-14 w-14 text-primary" />
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <HeroItem delay={200} mounted={mounted}>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-sm font-medium text-primary shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Feito para captar clientes locais todos os dias
                </div>
              </HeroItem>

              <HeroItem delay={300} mounted={mounted}>
                <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  {heroCopy.title}
                </h1>
              </HeroItem>

              <HeroItem delay={400} mounted={mounted}>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  {heroCopy.subtitle}
                </p>
              </HeroItem>

              <HeroItem delay={500} mounted={mounted}>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link href={registerHref}>
                    <Button
                      size="lg"
                      className="gradient-bg h-[52px] w-full rounded-2xl border-0 px-8 text-base font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.3)] hover:brightness-105 sm:w-auto"
                    >
                      {ctaCopy.hero}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#como-funciona">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-[52px] w-full rounded-2xl border-primary/20 bg-white px-8 text-base text-primary hover:bg-primary/5 sm:w-auto"
                    >
                      Ver como funciona
                    </Button>
                  </Link>
                </div>
              </HeroItem>

              <HeroItem delay={600} mounted={mounted}>
                <p className="mt-4 text-sm font-semibold text-primary">
                  Cadastre-se agora e saia na frente na sua cidade.
                </p>
              </HeroItem>

              <HeroItem delay={700} mounted={mounted}>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {heroHighlights.map((item) => (
                    <div
                      key={item}
                      className="glass flex items-center gap-3 rounded-2xl border border-border/50 px-4 py-3 shadow-sm"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm font-medium text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </HeroItem>
            </div>

            <div
              className={`relative flex justify-center transition-all duration-700 ease-out ${
                mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
              style={{ transitionDelay: mounted ? "400ms" : "0ms" }}
            >
              <div className="relative h-[560px] w-[280px] overflow-hidden rounded-[3rem] border-[8px] border-slate-800 bg-slate-900 shadow-2xl">
                <div className="h-full overflow-hidden rounded-[2.2rem] bg-background p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="gradient-bg h-8 w-8 rounded-lg" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                  <div className="glass mb-3 flex items-center gap-2 rounded-xl border border-border/50 p-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div className="h-2.5 w-24 rounded bg-muted" />
                  </div>
                  {[
                    "photo-1621905251189-08b45d6a269e",
                    "photo-1585704032915-c3400ca199e7",
                    "photo-1562259949-e8e7689d7828",
                  ].map((id, index) => (
                    <div
                      key={index}
                      className={`glass mb-2.5 flex items-center gap-3 rounded-xl border border-border/50 p-2.5 transition-all duration-500 ease-out ${
                        mounted
                          ? "translate-x-0 opacity-100"
                          : "translate-x-5 opacity-0"
                      }`}
                      style={{
                        transitionDelay: mounted
                          ? `${800 + index * 200}ms`
                          : "0ms",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://images.unsplash.com/${id}?w=96&h=96&fit=crop&crop=center&q=60`}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="mb-1.5 h-2.5 w-20 rounded bg-muted-foreground/20" />
                        <div className="h-2 w-14 rounded bg-muted" />
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 space-y-2">
                    <div className="h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              </div>

              <div className="absolute -left-16 -top-4 hidden rounded-xl border border-border/50 glass p-3 shadow-lg animate-[badge-float_4s_ease-in-out_infinite] lg:block">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="whitespace-nowrap text-xs font-semibold">
                    Profissional em destaque
                  </span>
                </div>
              </div>

              <div className="absolute -right-16 bottom-20 hidden rounded-xl border border-border/50 glass p-3 shadow-lg animate-[badge-float-alt_5s_ease-in-out_1s_infinite] lg:block">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="whitespace-nowrap text-xs font-semibold">
                    Média 4.9 de avaliação
                  </span>
                </div>
              </div>

              <div className="absolute -right-24 top-1/2 hidden rounded-xl border border-border/50 glass p-3 shadow-lg animate-[badge-float_6s_ease-in-out_2s_infinite] lg:block">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span className="whitespace-nowrap text-xs font-semibold">
                    Contato direto no WhatsApp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <RevealBlock>
          <SocialProofSection registerHref={registerHref} ctaLabel={ctaCopy.middle} />
        </RevealBlock>

        <SectionDivider />

        <RevealBlock>
          <PainPointsSection />
        </RevealBlock>

        <SectionDivider />

        <Section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Benefícios reais
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  O que muda quando você entra na plataforma
                </h2>
              </div>
              <Link href={registerHref}>
                <Button
                  variant="outline"
                  className="rounded-xl border-primary/20 bg-white text-primary hover:bg-primary/5"
                >
                  {ctaCopy.benefits}
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {resultBenefits.map((item) => (
                <div
                  key={item.title}
                  className="glass rounded-2xl border border-border/50 p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <SectionDivider />

        <Section
          id="como-funciona"
          className="bg-gradient-to-b from-primary/[0.03] to-transparent px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Como funciona
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Simples, rápido e focado em contato
                </h2>
              </div>
              <Link href={registerHref}>
                <Button
                  variant="outline"
                  className="rounded-xl border-primary/20 bg-white text-primary hover:bg-primary/5"
                >
                  {ctaCopy.middle}
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((item) => (
                <div
                  key={item.number}
                  className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-white p-6 shadow-sm"
                >
                  <div className="absolute right-5 top-5 text-6xl font-black leading-none text-primary/10">
                    {item.number}
                  </div>
                  <div className="relative">
                    <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Passo {item.number}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <SectionDivider />

        <Section id="categorias" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="glass rounded-2xl border border-border/50 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Ideal para
                </p>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  Prestadores que querem sair da dependência de indicação
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  Funciona para quem atende por WhatsApp e quer mais demanda
                  local sem depender só de rede social.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Entre agora e ganhe vantagem competitiva local.",
                    "Receba pedidos de clientes que já estão decidindo contratação.",
                    "Atualize seu perfil quando quiser, sem burocracia.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm leading-7 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl border border-border/50 p-8">
                <div className="flex flex-wrap gap-3">
                  {categories.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-slate-900">
                        Mais confiança para fechar
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Um perfil claro ajuda o cliente a escolher você com mais
                      rapidez.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-900">
                        Conversa no canal certo
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      O cliente chama no WhatsApp e você responde sem perder
                      tempo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <SectionDivider />

        <Section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Perguntas <span className="gradient-text">frequentes</span>
              </h2>
            </div>

            <ProviderFaqAccordion items={faqs} />
          </div>
        </Section>

        {/* ─── Play Store ──────────────────────────────────────── */}
        <Section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 p-10 text-center text-white sm:p-14">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Smartphone className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Baixe o app <span className="gradient-text">eufaço!</span>
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-base text-white/70">
                Gerencie seus clientes e pedidos de onde estiver. Disponível agora para Android.
              </p>
              <div className="mt-8 flex justify-center">
                <a
                  href="https://play.google.com/store/apps/details?id=br.com.eufaco.app&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105 active:scale-95"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png"
                    alt="Disponível no Google Play"
                    width={200}
                    height={60}
                  />
                </a>
              </div>
            </div>
          </div>
        </Section>

        <Section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src={ctaBackground}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95" />

              <div className="relative p-10 text-center text-white sm:p-16">
                <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative">
                  <h2 className="text-3xl font-bold sm:text-4xl">
                    Cadastre-se agora e saia na frente na sua cidade
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                    Quem entra primeiro aparece mais. Seu próximo cliente pode
                    estar buscando serviço neste momento.
                  </p>

                  <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href={registerHref}>
                      <Button
                        size="lg"
                        className="gradient-bg h-12 rounded-xl border-0 px-8 text-base text-white shadow-lg hover:shadow-xl"
                      >
                        <BriefcaseBusiness className="h-4 w-4" />
                        {ctaCopy.final}
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        className="h-12 rounded-xl border border-white/20 bg-white/10 px-8 text-base text-white hover:bg-white/20"
                      >
                        Já tenho conta
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-border/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="eufaço!"
                  width={120}
                  height={44}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma para prestadores conseguirem mais clientes locais com
                contato direto.
              </p>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#como-funciona"
                    className="transition-colors hover:text-foreground"
                  >
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="#categorias"
                    className="transition-colors hover:text-foreground"
                  >
                    Categorias
                  </Link>
                </li>
                <li>
                  <Link
                    href={registerHref}
                    className="transition-colors hover:text-foreground"
                  >
                    {ctaCopy.final}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-foreground"
                  >
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-foreground"
                  >
                    Política de privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} eufaço! Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
