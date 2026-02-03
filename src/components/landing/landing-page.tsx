"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Star,
  MessageCircle,
  Shield,
  Users,
  Briefcase,
  Camera,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryIconMap } from "@/lib/category-icons";

// ─── Animated Counter ───────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const startTime = performance.now();

          function animate(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.floor(eased * target);
            setCount(start);
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ─── Section wrapper with viewport animation ────────────────────────
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Popular categories to show ─────────────────────────────────────
const popularCategories = [
  { slug: "eletricista", label: "Eletricista" },
  { slug: "encanador", label: "Encanador" },
  { slug: "pintor", label: "Pintor" },
  { slug: "diarista", label: "Diarista" },
  { slug: "pedreiro", label: "Pedreiro" },
  { slug: "marceneiro", label: "Marceneiro" },
  { slug: "jardineiro", label: "Jardineiro" },
  { slug: "tecnico-informatica", label: "Técnico de Informática" },
  { slug: "mecanico", label: "Mecânico" },
  { slug: "cabeleireira", label: "Cabeleireira" },
  { slug: "fotografo", label: "Fotógrafo" },
  { slug: "personal-trainer", label: "Personal Trainer" },
];

// ─── Testimonials ───────────────────────────────────────────────────
const testimonials = [
  {
    name: "Mariana Silva",
    role: "Cliente",
    text: "Encontrei um eletricista excelente em minutos. O serviço foi rápido e o preço justo. Recomendo demais!",
    rating: 5,
    avatar: "MS",
  },
  {
    name: "Carlos Oliveira",
    role: "Prestador",
    text: "Desde que criei meu perfil, meus clientes aumentaram muito. A plataforma é simples e eficiente.",
    rating: 5,
    avatar: "CO",
  },
  {
    name: "Ana Costa",
    role: "Cliente",
    text: "Precisava de uma diarista de confiança e achei pelo ResolveAí. Já contratei 3 vezes!",
    rating: 5,
    avatar: "AC",
  },
];

// ─── Main Component ─────────────────────────────────────────────────
export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── Navbar ───────────────────────────────────────────── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <Image src="/logo.png" alt="ResolveAí" width={140} height={40} className="h-10 w-auto" />
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-shadow text-sm font-medium"
                >
                  Começar grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <div ref={heroRef} className="relative pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-20 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-400/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/3 blur-3xl" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-20 sm:pt-28 lg:pt-36"
        >
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                A plataforma de serviços locais
              </span>
            </motion.div>

            <motion.h1
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Encontre o profissional{" "}
              <span className="gradient-text">ideal</span> para qualquer
              serviço
            </motion.h1>

            <motion.p
              className="mt-6 text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Conecte-se com prestadores verificados na sua região. Busque,
              compare avaliações e contrate com segurança.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="gradient-bg text-white border-0 shadow-lg hover:shadow-xl transition-all text-base px-8 h-12 rounded-xl gap-2 group"
                >
                  Começar agora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 rounded-xl"
                >
                  Como funciona
                </Button>
              </Link>
            </motion.div>

            {/* Search preview */}
            <motion.div
              className="mt-12 mx-auto max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/register" className="block">
                <div className="glass flex items-center gap-3 rounded-2xl border border-border/50 px-5 py-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    O que você precisa? Ex: eletricista, pintor...
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ─── Features ─────────────────────────────────────────── */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" id="funcionalidades">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Feito para <span className="gradient-text">todos</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Seja você um cliente buscando serviços ou um prestador oferecendo
              seu trabalho
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* For clients */}
            <motion.div
              className="rounded-2xl border border-border/50 glass p-8 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                <Search className="h-4 w-4" />
                Para Clientes
              </div>
              <div className="space-y-5">
                {[
                  {
                    icon: Search,
                    title: "Busca inteligente",
                    desc: "Encontre profissionais por categoria, cidade ou nome",
                  },
                  {
                    icon: Star,
                    title: "Avaliações reais",
                    desc: "Veja a opinião de outros clientes antes de contratar",
                  },
                  {
                    icon: MessageCircle,
                    title: "Contato direto",
                    desc: "Fale com o prestador via WhatsApp com um clique",
                  },
                  {
                    icon: Heart,
                    title: "Lista de favoritos",
                    desc: "Salve os profissionais que mais gostou para voltar depois",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* For providers */}
            <motion.div
              className="rounded-2xl border border-border/50 glass p-8 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600">
                <Briefcase className="h-4 w-4" />
                Para Prestadores
              </div>
              <div className="space-y-5">
                {[
                  {
                    icon: Users,
                    title: "Visibilidade",
                    desc: "Seu perfil visível para milhares de pessoas na sua região",
                  },
                  {
                    icon: Camera,
                    title: "Portfólio",
                    desc: "Mostre fotos dos seus trabalhos e conquiste mais clientes",
                  },
                  {
                    icon: TrendingUp,
                    title: "Cresça seu negócio",
                    desc: "Receba contatos diretamente pelo WhatsApp",
                  },
                  {
                    icon: Shield,
                    title: "Perfil verificado",
                    desc: "Transmita confiança com um perfil completo e avaliações",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <feature.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ─── Como Funciona ────────────────────────────────────── */}
      <Section
        className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/[0.03] to-transparent"
        id="como-funciona"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Como <span className="gradient-text">funciona</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Simples, rápido e seguro. Em 3 passos você encontra o
              profissional certo.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Busque",
                desc: "Digite o serviço que precisa ou navegue pelas categorias disponíveis.",
                icon: Search,
              },
              {
                step: "02",
                title: "Compare",
                desc: "Veja perfis, avaliações, portfólios e escolha o melhor profissional.",
                icon: Star,
              },
              {
                step: "03",
                title: "Contrate",
                desc: "Entre em contato direto pelo WhatsApp e resolva o que precisa.",
                icon: CheckCircle2,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-primary/5" />
                )}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl glass border border-border/50 shadow-md">
                  <item.icon className="h-10 w-10 text-primary" />
                </div>
                <span className="text-sm font-bold text-primary/60">
                  PASSO {item.step}
                </span>
                <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Categorias Populares ─────────────────────────────── */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" id="categorias">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Categorias <span className="gradient-text">populares</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Dezenas de categorias para você encontrar exatamente o que precisa
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularCategories.map((cat, i) => {
              const Icon = categoryIconMap[cat.slug];
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex flex-col items-center gap-3 rounded-2xl glass border border-border/50 p-5 cursor-pointer transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    {Icon && <Icon className="h-6 w-6 text-primary" />}
                  </div>
                  <span className="text-sm font-medium text-center">
                    {cat.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl gap-2 group"
              >
                Ver todas as categorias
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* ─── Estatísticas ─────────────────────────────────────── */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl gradient-bg p-10 sm:p-16 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

            <div className="relative grid gap-8 sm:grid-cols-3 text-center">
              {[
                { value: 60, suffix: "+", label: "Categorias de serviços" },
                { value: 100, suffix: "+", label: "Cidades atendidas" },
                { value: 1000, suffix: "+", label: "Profissionais cadastrados" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="text-4xl sm:text-5xl font-extrabold">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-white/80 text-sm sm:text-base">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Depoimentos ──────────────────────────────────────── */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" id="depoimentos">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              O que dizem nossos{" "}
              <span className="gradient-text">usuários</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Histórias reais de quem já usa o ResolveAí
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="rounded-2xl glass border border-border/50 p-6 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── CTA Final ────────────────────────────────────────── */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 sm:p-16 text-center text-white relative overflow-hidden">
            {/* Gradient orbs */}
            <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <motion.h2
                className="text-3xl sm:text-4xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Pronto para começar?
              </motion.h2>
              <motion.p
                className="mt-4 text-lg text-white/70 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Junte-se a milhares de pessoas que já usam o ResolveAí para
                encontrar e oferecer serviços.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gradient-bg text-white border-0 shadow-lg hover:shadow-xl transition-all text-base px-8 h-12 rounded-xl gap-2 group"
                  >
                    <Search className="h-4 w-4" />
                    Quero contratar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-base px-8 h-12 rounded-xl gap-2 group"
                  >
                    <Briefcase className="h-4 w-4" />
                    Quero oferecer serviços
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="mb-4">
                <Image src="/logo.png" alt="ResolveAí" width={120} height={36} className="h-9 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma que conecta você aos melhores prestadores de
                serviços da sua região.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#como-funciona"
                    className="hover:text-foreground transition-colors"
                  >
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="#categorias"
                    className="hover:text-foreground transition-colors"
                  >
                    Categorias
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-foreground transition-colors"
                  >
                    Criar conta
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Política de privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ResolveAí. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
