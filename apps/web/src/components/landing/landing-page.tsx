"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
	ArrowRight,
	ArrowUpRight,
	Camera,
	Car,
	CheckCircle2,
	ChevronDown,
	Droplets,
	Dumbbell,
	HardHat,
	HelpCircle,
	MessageCircle,
	Monitor,
	Paintbrush,
	Play,
	Ruler,
	Scissors,
	Search,
	Shield,
	Sparkles,
	Star,
	TreePine,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react"
import type { ElementType, ReactNode, RefObject } from "react"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=br.com.eufaco.app"

// ─── Category icons ────────────────────────────────────────────────
const categoryIcons: Record<string, ElementType> = {
	eletricista: Zap,
	encanador: Droplets,
	pintor: Paintbrush,
	diarista: Sparkles,
	marceneiro: Ruler,
	jardineiro: TreePine,
	mecanico: Car,
	cabeleireira: Scissors,
	pedreiro: HardHat,
	"tecnico-informatica": Monitor,
	fotografo: Camera,
	"personal-trainer": Dumbbell,
}

// ─── Service imagery ───────────────────────────────────────────────
const serviceImages = {
	electrician: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=750&fit=crop&crop=center&q=75",
	plumber: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=750&fit=crop&crop=center&q=75",
	painter: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=750&fit=crop&crop=center&q=75",
	cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=750&fit=crop&crop=center&q=75",
	carpenter: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=750&fit=crop&crop=center&q=75",
	gardener: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=750&fit=crop&crop=center&q=75",
	mechanic: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=750&fit=crop&crop=center&q=75",
	hairdresser: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=750&fit=crop&crop=center&q=75",
	providerShowcase: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1000&h=800&fit=crop&crop=center&q=80",
}

const serviceShowcase = [
	{ image: serviceImages.electrician, label: "Eletricista", slug: "eletricista", description: "Instalações e reparos" },
	{ image: serviceImages.plumber, label: "Encanador", slug: "encanador", description: "Vazamentos e hidráulica" },
	{ image: serviceImages.painter, label: "Pintor", slug: "pintor", description: "Pintura residencial" },
	{ image: serviceImages.cleaning, label: "Diarista", slug: "diarista", description: "Limpeza sob demanda" },
	{ image: serviceImages.carpenter, label: "Marceneiro", slug: "marceneiro", description: "Móveis e reparos" },
	{ image: serviceImages.gardener, label: "Jardineiro", slug: "jardineiro", description: "Paisagismo" },
	{ image: serviceImages.mechanic, label: "Mecânico", slug: "mecanico", description: "Reparo automotivo" },
	{ image: serviceImages.hairdresser, label: "Cabeleireira", slug: "cabeleireira", description: "Cortes e coloração" },
]

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
]

const marqueeItems = [
	"Eletricista", "Diarista", "Pintor", "Encanador", "Pedreiro", "Marceneiro",
	"Jardineiro", "Cabeleireira", "Mecânico", "Fotógrafo", "Personal Trainer", "Técnico de TI",
]

const faqItems = [
	{
		question: "O que é o eufaço!?",
		answer:
			"O eufaço! é o app que conecta você a prestadores de serviços locais. Encontre profissionais verificados na sua região, veja avaliações reais e fale direto pelo WhatsApp — sem intermediários, sem taxas.",
	},
	{
		question: "É gratuito?",
		answer:
			"Sim. Baixar e usar o app é 100% grátis, tanto para quem contrata quanto para quem oferece serviços. Sem mensalidade, sem comissão sobre serviços fechados.",
	},
	{
		question: "Como encontro o profissional certo?",
		answer:
			"Busque por categoria (eletricista, pintor…) ou pela localização. Compare avaliações reais de outros clientes, veja o portfólio e escolha quem confia mais. Um clique e a conversa começa no WhatsApp.",
	},
	{
		question: "Sou prestador, como me cadastro?",
		answer:
			"Baixe o app, escolha \"Quero oferecer serviços\" no registro, selecione suas categorias e informe seu WhatsApp. Em minutos seu perfil está no ar e recebendo contatos.",
	},
	{
		question: "O eufaço! cobra comissão dos prestadores?",
		answer:
			"Não. O contato entre cliente e prestador acontece direto no WhatsApp. Nós não intermediamos pagamentos e não ficamos com nenhum percentual do serviço.",
	},
	{
		question: "Está disponível para iPhone?",
		answer:
			"Ainda não. Estamos disponíveis na Google Play e a versão iOS está em desenvolvimento.",
	},
]

// ─── Scroll reveal ─────────────────────────────────────────────────
function Reveal({
	children,
	className = "",
	id,
	as = "section",
	delay = 0,
}: {
	children: ReactNode
	className?: string
	id?: string
	as?: "section" | "div"
	delay?: number
}) {
	const ref = useRef<HTMLElement>(null)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true)
					observer.disconnect()
				}
			},
			{ threshold: 0.12 }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	const Tag = as as "section"
	return (
		<Tag
			ref={ref as RefObject<HTMLElement | null>}
			id={id}
			className={`transition-all duration-700 ease-out ${
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
			} ${className}`}
			style={{ transitionDelay: `${delay}ms` }}
		>
			{children}
		</Tag>
	)
}

function HeroItem({
	children,
	className = "",
	delay,
}: {
	children: ReactNode
	className?: string
	delay: number
}) {
	return (
		<div
			className={`animate-fade-up ${className}`}
			style={{ animationDelay: `${delay}ms` }}
		>
			{children}
		</div>
	)
}

// ─── FAQ Accordion ─────────────────────────────────────────────────
function FaqAccordion() {
	const [openIndex, setOpenIndex] = useState<number | null>(0)

	return (
		<div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
			{faqItems.map((item, i) => (
				<div key={i} className="group">
					<button
						onClick={() => setOpenIndex(openIndex === i ? null : i)}
						className="flex w-full items-center justify-between gap-6 p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.02]"
					>
						<span className="text-base sm:text-lg font-medium text-foreground">
							{item.question}
						</span>
						<span
							className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all group-hover:border-primary/40 group-hover:text-primary ${
								openIndex === i ? "rotate-180 bg-primary/10 !border-primary/50 !text-primary" : ""
							}`}
						>
							<ChevronDown className="h-4 w-4" />
						</span>
					</button>
					<div
						className={`overflow-hidden transition-all duration-300 ease-out ${
							openIndex === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
						}`}
					>
						<p className="px-5 sm:px-6 pb-6 text-[15px] text-muted-foreground leading-relaxed">
							{item.answer}
						</p>
					</div>
				</div>
			))}
		</div>
	)
}

// ─── Play Store button ─────────────────────────────────────────────
function PlayStoreButton({
	className = "",
	label = "Baixar grátis",
}: {
	className?: string
	label?: string
}) {
	return (
		<a
			href={PLAY_STORE_URL}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Baixar na Google Play"
			className={`group relative inline-flex items-center gap-3 rounded-full bg-white text-slate-900 px-6 h-12 font-semibold shadow-[0_20px_60px_-15px_rgba(34,211,238,0.5)] transition-all hover:shadow-[0_25px_70px_-15px_rgba(34,211,238,0.7)] hover:-translate-y-0.5 ${className}`}
		>
			<svg viewBox="0 0 256 256" className="h-6 w-6 shrink-0" aria-hidden="true">
				<path fill="#00C3FF" d="M119.589 128 14.93 232.66c-4.65-2.42-7.55-7.04-7.55-12.16V35.5c0-5.12 2.9-9.74 7.55-12.16L119.589 128z" />
				<path fill="#00DE7A" d="m119.589 128 35.21-35.21L29.78 23.34a13.71 13.71 0 0 0-14.85 0L119.589 128z" />
				<path fill="#FF3A44" d="m119.589 128 35.21 35.21L29.78 232.66a13.71 13.71 0 0 1-14.85 0L119.589 128z" />
				<path fill="#FFCE00" d="m154.799 92.79-35.21 35.21 35.21 35.21 41.49-22.9c10.59-5.85 10.59-21.18 0-27.03l-41.49-20.49z" />
			</svg>
			<span className="text-sm sm:text-base">{label}</span>
			<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
		</a>
	)
}

// ─── Main Component ────────────────────────────────────────────────
export function LandingPage() {
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden">
			{/* ═══ NAVBAR ═══════════════════════════════════════════════ */}
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-[slide-down_0.6s_ease-out_both] ${
					scrolled ? "py-3" : "py-4"
				}`}
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<div
						className={`flex h-14 items-center justify-between rounded-full px-4 sm:px-5 transition-all duration-300 ${
							scrolled
								? "glass-strong shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]"
								: "bg-transparent"
						}`}
					>
						<Link href="/" className="flex items-center gap-2">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src="/logo.svg"
								alt="eufaço!"
								width={112}
								height={40}
								className="h-8 sm:h-9 w-auto"
							/>
						</Link>

						<nav className="hidden md:flex items-center gap-1">
							{[
								{ href: "#como-funciona", label: "Como funciona" },
								{ href: "#servicos", label: "Serviços" },
								{ href: "#prestadores", label: "Sou prestador" },
								{ href: "#faq", label: "FAQ" },
							].map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
								>
									{item.label}
								</Link>
							))}
						</nav>

						<a
							href={PLAY_STORE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="group inline-flex items-center gap-2 rounded-full gradient-bg px-4 sm:px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
						>
							<span>Baixar app</span>
							<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
						</a>
					</div>
				</div>
			</header>

			{/* ═══ HERO ═══════════════════════════════════════════════ */}
			<section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
				{/* Ambient background */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[120px]" />
					<div className="absolute top-20 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
					<div className="absolute inset-0 grid-fade opacity-40" />
					<div className="absolute inset-0 noise" />
				</div>

				<div className="relative mx-auto max-w-6xl px-4 sm:px-6">
					<div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
						{/* Left: text */}
						<div className="text-center lg:text-left min-w-0">
							<HeroItem delay={100}>
								<span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground backdrop-blur">
									<span className="relative flex h-2 w-2">
										<span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-dot" />
										<span className="relative rounded-full bg-emerald-400 h-2 w-2" />
									</span>
									<span className="hidden sm:inline">4.8 na Play Store · milhares de contatos por semana</span>
									<span className="sm:hidden">4.8 na Play Store</span>
								</span>
							</HeroItem>

							<HeroItem delay={220}>
								<h1 className="mt-6 text-[44px] sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[0.95]">
									Resolva
									<br />
									qualquer
									<br />
									<span className="gradient-text">serviço.</span>
								</h1>
							</HeroItem>

							<HeroItem delay={340}>
								<p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
									Do eletricista à diarista, do pintor ao personal.{" "}
									<span className="text-foreground/90">Encontre profissionais da sua região</span> e fale
									direto no WhatsApp. Sem taxa, sem intermediário.
								</p>
							</HeroItem>

							<HeroItem delay={460}>
								<div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
									<PlayStoreButton />
									<a
										href="#como-funciona"
										className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 backdrop-blur px-5 h-12 text-sm sm:text-base font-medium text-foreground hover:bg-card/70 transition-colors"
									>
										<Play className="h-4 w-4 fill-current" />
										Como funciona
									</a>
								</div>
							</HeroItem>

							<HeroItem delay={580} className="mt-10">
								<div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8">
									<div className="flex items-center gap-2">
										<div className="flex -space-x-2">
											{[0, 1, 2, 3].map((i) => (
												<div
													key={i}
													className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-violet-500/40 flex items-center justify-center text-[10px] font-bold text-white"
												>
													{["JV", "MA", "RC", "LS"][i]}
												</div>
											))}
										</div>
										<div className="text-xs text-muted-foreground">
											<div className="flex items-center gap-1 text-amber-400">
												{[0, 1, 2, 3, 4].map((i) => (
													<Star key={i} className="h-3 w-3 fill-current" />
												))}
											</div>
											<span>+12k avaliações</span>
										</div>
									</div>
									<div className="hidden sm:block h-8 w-px bg-border/60" />
									<div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
										<Shield className="h-4 w-4 text-emerald-400" />
										<span>Perfis verificados</span>
									</div>
								</div>
							</HeroItem>
						</div>

						{/* Right: phone mockup */}
						<HeroItem delay={340} className="relative hidden lg:flex justify-center">
							<div className="relative">
								{/* Glow rings */}
								<div className="absolute -inset-16 rounded-full bg-primary/10 blur-3xl" />
								<div className="absolute -inset-6 rounded-[3.5rem] bg-gradient-to-br from-primary/30 via-transparent to-violet-500/30 blur-2xl opacity-70" />

								{/* Floating cards around phone */}
								<div className="absolute -left-16 top-16 z-20 animate-float">
									<div className="glass-strong rounded-2xl p-3 shadow-2xl border-gradient min-w-[180px]">
										<div className="flex items-center gap-2.5">
											<div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
												<Zap className="h-5 w-5 text-primary" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Novo contato</p>
												<p className="text-sm font-semibold">Eletricista</p>
											</div>
											<div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
												<CheckCircle2 className="h-3.5 w-3.5" />
											</div>
										</div>
									</div>
								</div>

								<div className="absolute -right-14 bottom-24 z-20 animate-float-slow" style={{ animationDelay: "1s" }}>
									<div className="glass-strong rounded-2xl p-3 shadow-2xl min-w-[170px]">
										<div className="flex items-center gap-2">
											<div className="flex items-center text-amber-400">
												{[0, 1, 2, 3, 4].map((i) => (
													<Star key={i} className="h-3 w-3 fill-current" />
												))}
											</div>
											<span className="text-sm font-bold">5.0</span>
										</div>
										<p className="mt-1 text-xs text-muted-foreground">&ldquo;Atendeu no mesmo dia, super profissional.&rdquo;</p>
									</div>
								</div>

								<div className="absolute -left-10 -bottom-4 z-20 animate-float-reverse" style={{ animationDelay: "0.5s" }}>
									<div className="glass-strong rounded-full pl-2 pr-4 py-1.5 flex items-center gap-2 shadow-xl">
										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
											<MessageCircle className="h-4 w-4 text-emerald-400" />
										</div>
										<span className="text-xs font-semibold">WhatsApp direto</span>
									</div>
								</div>

								{/* Phone frame */}
								<div className="relative z-10 w-[300px] h-[600px] rounded-[3rem] border-[10px] border-slate-900 bg-slate-900 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
									{/* Notch */}
									<div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 h-6 w-24 rounded-full bg-black" />
									<div className="relative h-full w-full rounded-[2.2rem] overflow-hidden bg-background">
										<Image
											src="/mobile-1.png"
											alt="App eufaço! - tela inicial"
											fill
											sizes="300px"
											className="object-cover object-top"
											priority
										/>
									</div>
								</div>
							</div>
						</HeroItem>
					</div>

					{/* Category marquee */}
					<HeroItem delay={700} className="mt-16 sm:mt-24">
						<div className="relative overflow-hidden">
							<div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
							<div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
							<div className="flex gap-3 animate-marquee whitespace-nowrap will-change-transform">
								{[...marqueeItems, ...marqueeItems].map((item, i) => (
									<span
										key={`${item}-${i}`}
										className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 backdrop-blur px-4 py-2 text-sm text-muted-foreground"
									>
										<span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
										{item}
									</span>
								))}
							</div>
						</div>
					</HeroItem>
				</div>
			</section>

			{/* ═══ SOCIAL PROOF STRIP ═══════════════════════════════════ */}
			<Reveal className="relative py-16 sm:py-20 px-4 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-4 rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-8 sm:p-10">
						{[
							{ value: "+12k", label: "Usuários ativos" },
							{ value: "4.8★", label: "Nota na Play Store" },
							{ value: "50+", label: "Categorias de serviço" },
							{ value: "R$0", label: "De taxa. Sempre." },
						].map((stat) => (
							<div key={stat.label} className="text-center">
								<div className="text-3xl sm:text-4xl font-black tracking-tight gradient-text">
									{stat.value}
								</div>
								<div className="mt-1 text-xs sm:text-sm text-muted-foreground">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</Reveal>

			{/* ═══ COMO FUNCIONA ═══════════════════════════════════════ */}
			<Reveal id="como-funciona" className="relative py-20 sm:py-28 px-4 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="text-center max-w-2xl mx-auto mb-16">
						<span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground">
							<Sparkles className="h-3.5 w-3.5 text-primary" />
							Como funciona
						</span>
						<h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
							Do problema à solução em <span className="gradient-text">3 passos</span>.
						</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Sem cadastro complicado, sem esperar orçamento por dias.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{[
							{
								step: "01",
								icon: Search,
								title: "Busque",
								desc: "Digite o serviço ou navegue por categoria. Filtre por localização e avaliação.",
							},
							{
								step: "02",
								icon: Star,
								title: "Compare",
								desc: "Veja perfis, portfólios e o que outros clientes disseram. Escolha com confiança.",
							},
							{
								step: "03",
								icon: MessageCircle,
								title: "Contrate",
								desc: "Um toque abre o WhatsApp com o prestador. A conversa começa direto — sem intermediário.",
							},
						].map((item, i) => (
							<div
								key={item.step}
								className="group relative rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-8 hover:bg-card/70 hover:border-primary/30 transition-all duration-500"
								style={{ transitionDelay: `${i * 60}ms` }}
							>
								<div className="absolute -top-3 left-8 rounded-full gradient-bg px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
									{item.step}
								</div>
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 mb-6">
									<item.icon className="h-7 w-7 text-primary" />
								</div>
								<h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
								<p className="mt-2 text-muted-foreground leading-relaxed">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</Reveal>

			{/* ═══ SERVIÇOS EM DESTAQUE ═════════════════════════════════ */}
			<Reveal id="servicos" className="relative py-20 sm:py-28 px-4 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
						<div className="max-w-xl">
							<span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground">
								<TrendingUp className="h-3.5 w-3.5 text-primary" />
								Em alta agora
							</span>
							<h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
								Serviços em <span className="gradient-text">destaque</span>.
							</h2>
							<p className="mt-3 text-lg text-muted-foreground">
								Os profissionais mais procurados na sua região, prontos para atender.
							</p>
						</div>
						<a
							href={PLAY_STORE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="group hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
						>
							Ver todos no app
							<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
						</a>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{serviceShowcase.map((service, i) => {
							const Icon = categoryIcons[service.slug]
							return (
								<a
									key={service.slug}
									href={PLAY_STORE_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="group relative rounded-2xl overflow-hidden border border-border/60 bg-card hover:border-primary/40 transition-all duration-500 hover:-translate-y-1"
									style={{ transitionDelay: `${i * 30}ms` }}
								>
									<div className="aspect-[4/5] relative overflow-hidden">
										<Image
											src={service.image}
											alt={service.label}
											fill
											sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
											className="object-cover transition-transform duration-700 group-hover:scale-110"
											loading="lazy"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
										<div className="absolute top-3 right-3 h-8 w-8 rounded-full glass-strong flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
											<ArrowUpRight className="h-4 w-4 text-primary" />
										</div>
									</div>
									<div className="absolute bottom-0 left-0 right-0 p-4">
										<div className="flex items-center gap-2 mb-1">
											{Icon && (
												<div className="h-7 w-7 rounded-lg gradient-bg-soft border border-primary/30 flex items-center justify-center">
													<Icon className="h-3.5 w-3.5 text-primary" />
												</div>
											)}
											<h3 className="text-white font-bold text-base">{service.label}</h3>
										</div>
										<p className="text-white/60 text-xs">{service.description}</p>
									</div>
								</a>
							)
						})}
					</div>
				</div>
			</Reveal>

			{/* ═══ CATEGORIAS ═══════════════════════════════════════════ */}
			<Reveal id="categorias" className="relative py-20 sm:py-28 px-4 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="text-center max-w-2xl mx-auto mb-14">
						<span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground">
							Catálogo
						</span>
						<h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
							50+ categorias, um <span className="gradient-text">único app</span>.
						</h2>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
						{popularCategories.map((cat) => {
							const Icon = categoryIcons[cat.slug]
							return (
								<a
									key={cat.slug}
									href={PLAY_STORE_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 aspect-square transition-all hover:border-primary/40 hover:bg-card/70 hover:-translate-y-1"
								>
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 group-hover:scale-110 transition-transform">
										{Icon && <Icon className="h-5 w-5 text-primary" />}
									</div>
									<span className="text-xs sm:text-sm font-medium text-center leading-tight text-foreground/90">
										{cat.label}
									</span>
								</a>
							)
						})}
					</div>

					<div className="mt-10 text-center">
						<a
							href={PLAY_STORE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
						>
							Explorar todas as categorias no app
							<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
						</a>
					</div>
				</div>
			</Reveal>

			{/* ═══ PARA PRESTADORES ═════════════════════════════════════ */}
			<Reveal id="prestadores" className="relative py-20 sm:py-28 px-4 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-border/60">
						{/* Background */}
						<div className="absolute inset-0">
							<Image
								src={serviceImages.providerShowcase}
								alt=""
								fill
								sizes="100vw"
								className="object-cover opacity-25"
								loading="lazy"
							/>
							<div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
							<div className="absolute inset-0 grid-fade opacity-30" />
						</div>

						<div className="relative grid md:grid-cols-[1.1fr_1fr] gap-10 p-8 sm:p-12 lg:p-16">
							<div>
								<span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
									<Users className="h-3.5 w-3.5" />
									Para prestadores
								</span>
								<h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
									Pare de depender de <span className="gradient-text-warm">indicação</span>.
								</h2>
								<p className="mt-5 text-lg text-muted-foreground max-w-lg">
									Enquanto você lê isso, tem gente na sua região procurando um profissional
									como você. Cadastre-se em 2 minutos e comece a receber contatos direto no
									seu WhatsApp — de graça, sem comissão.
								</p>

								<div className="mt-8 space-y-3">
									{[
										{ icon: MessageCircle, text: "Contatos diretos no WhatsApp — 0% de comissão" },
										{ icon: TrendingUp, text: "Perfil visível para milhares de clientes na sua cidade" },
										{ icon: Camera, text: "Mostre seu portfólio e conquiste mais trabalho" },
										{ icon: Shield, text: "Selo de perfil verificado transmite confiança" },
									].map((b) => (
										<div key={b.text} className="flex items-start gap-3">
											<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
												<b.icon className="h-3.5 w-3.5" />
											</div>
											<span className="text-sm sm:text-base text-foreground/90">{b.text}</span>
										</div>
									))}
								</div>

								<div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
									<PlayStoreButton label="Quero receber clientes" />
									<a
										href={PLAY_STORE_URL}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors self-center sm:self-auto sm:h-12"
									>
										Já sou prestador
										<ArrowUpRight className="h-4 w-4" />
									</a>
								</div>
							</div>

							{/* Metric cards */}
							<div className="relative">
								<div className="grid gap-4">
									<div className="glass-strong rounded-2xl p-5 border-gradient">
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground uppercase tracking-wider">
												Contatos hoje
											</span>
											<div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
												<TrendingUp className="h-3 w-3" />
												+38%
											</div>
										</div>
										<div className="mt-3 flex items-end gap-2">
											<span className="text-5xl font-black tracking-tight">12</span>
											<span className="text-muted-foreground pb-2">novas mensagens</span>
										</div>
										<div className="mt-4 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
											<div className="h-full w-[68%] gradient-bg rounded-full" />
										</div>
									</div>

									<div className="glass-strong rounded-2xl p-5">
										<div className="flex items-center gap-3">
											<div className="h-11 w-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
												<Star className="h-5 w-5 text-amber-400 fill-current" />
											</div>
											<div className="flex-1">
												<p className="text-sm text-muted-foreground">Sua avaliação média</p>
												<div className="flex items-center gap-2 mt-0.5">
													<span className="text-2xl font-black">4.9</span>
													<div className="flex text-amber-400">
														{[0, 1, 2, 3, 4].map((i) => (
															<Star key={i} className="h-3 w-3 fill-current" />
														))}
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="glass-strong rounded-2xl p-5">
										<div className="flex items-start gap-3">
											<div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
												<MessageCircle className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<p className="text-sm font-semibold truncate">Marina S.</p>
													<span className="text-xs text-muted-foreground">agora</span>
												</div>
												<p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
													Oi! Preciso trocar a resistência do chuveiro, você atende hoje?
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Reveal>

			{/* ═══ FAQ ═════════════════════════════════════════════════ */}
			<Reveal id="faq" className="relative py-20 sm:py-28 px-4 sm:px-6">
				<div className="mx-auto max-w-3xl">
					<div className="text-center mb-14">
						<div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20">
							<HelpCircle className="h-6 w-6 text-primary" />
						</div>
						<h2 className="text-4xl sm:text-5xl font-black tracking-tight">
							Perguntas <span className="gradient-text">frequentes</span>.
						</h2>
					</div>
					<FaqAccordion />
				</div>
			</Reveal>

			{/* ═══ CTA FINAL ═══════════════════════════════════════════ */}
			<Reveal className="relative py-20 sm:py-28 px-4 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
						<div className="absolute inset-0 gradient-bg" />
						<div className="absolute inset-0 opacity-40" style={{
							backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.35), transparent 45%)",
						}} />
						<div className="absolute inset-0 noise opacity-40" />

						<div className="relative p-10 sm:p-16 lg:p-20 text-center">
							<span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/20 px-3 py-1 text-xs font-medium text-white">
								<Sparkles className="h-3.5 w-3.5" />
								Disponível agora
							</span>
							<h2 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.05]">
								Baixe o eufaço!
								<br />e resolva hoje mesmo.
							</h2>
							<p className="mt-5 text-lg sm:text-xl text-white/80 max-w-xl mx-auto">
								Milhares de profissionais verificados esperando sua mensagem. É de graça
								e leva menos de um minuto.
							</p>

							<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
								<a
									href={PLAY_STORE_URL}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Baixar na Google Play"
									className="group inline-flex items-center gap-3 rounded-2xl bg-slate-950 px-6 py-3.5 text-white shadow-2xl hover:bg-slate-900 transition-all hover:-translate-y-0.5 min-w-[220px]"
								>
									<svg viewBox="0 0 256 256" className="h-9 w-9 shrink-0" aria-hidden="true">
										<path fill="#00C3FF" d="M119.589 128 14.93 232.66c-4.65-2.42-7.55-7.04-7.55-12.16V35.5c0-5.12 2.9-9.74 7.55-12.16L119.589 128z" />
										<path fill="#00DE7A" d="m119.589 128 35.21-35.21L29.78 23.34a13.71 13.71 0 0 0-14.85 0L119.589 128z" />
										<path fill="#FF3A44" d="m119.589 128 35.21 35.21L29.78 232.66a13.71 13.71 0 0 1-14.85 0L119.589 128z" />
										<path fill="#FFCE00" d="m154.799 92.79-35.21 35.21 35.21 35.21 41.49-22.9c10.59-5.85 10.59-21.18 0-27.03l-41.49-20.49z" />
									</svg>
									<div className="text-left leading-tight">
										<p className="text-[10px] uppercase tracking-wide text-white/60">Disponível na</p>
										<p className="text-lg font-bold">Google Play</p>
									</div>
								</a>

								<div
									aria-disabled="true"
									className="relative inline-flex items-center gap-3 rounded-2xl bg-slate-950/50 backdrop-blur border border-white/10 px-6 py-3.5 text-white/70 min-w-[220px] cursor-not-allowed"
								>
									<svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0 fill-current" aria-hidden="true">
										<path d="M17.564 12.65c-.03-3.022 2.47-4.474 2.58-4.546-1.408-2.06-3.6-2.343-4.378-2.375-1.866-.188-3.642 1.094-4.59 1.094-.948 0-2.41-1.066-3.96-1.038-2.04.03-3.92 1.184-4.97 3.008-2.118 3.672-.542 9.108 1.524 12.1.998 1.466 2.19 3.116 3.762 3.058 1.51-.06 2.082-.978 3.91-.978 1.826 0 2.346.978 3.95.948 1.63-.03 2.66-1.498 3.654-2.97 1.15-1.7 1.624-3.348 1.652-3.432-.036-.018-3.166-1.214-3.196-4.832ZM14.616 3.752c.834-1.01 1.396-2.41 1.242-3.806-1.2.05-2.654.8-3.514 1.808-.772.892-1.448 2.322-1.266 3.69 1.34.106 2.706-.682 3.538-1.692Z" />
									</svg>
									<div className="text-left leading-tight">
										<p className="text-[10px] uppercase tracking-wide text-white/50">Em breve na</p>
										<p className="text-lg font-bold">App Store</p>
									</div>
									<span className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-lg">
										Em breve
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Reveal>

			{/* ═══ FOOTER ══════════════════════════════════════════════ */}
			<footer className="border-t border-border/60 py-12 px-4 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="grid gap-8 sm:grid-cols-4">
						<div className="sm:col-span-2">
							<div className="mb-4">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src="/logo.svg"
									alt="eufaço!"
									width={120}
									height={44}
									className="h-9 w-auto"
								/>
							</div>
							<p className="text-sm text-muted-foreground max-w-sm">
								A plataforma que conecta você aos melhores prestadores de serviços da sua
								região. Direto, sem intermediário, sem taxa.
							</p>
							<div className="mt-6 flex items-center gap-3">
								<a
									href={PLAY_STORE_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs font-medium hover:border-primary/40 transition-colors"
								>
									<svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden="true">
										<path fill="#00C3FF" d="M119.589 128 14.93 232.66c-4.65-2.42-7.55-7.04-7.55-12.16V35.5c0-5.12 2.9-9.74 7.55-12.16L119.589 128z" />
										<path fill="#00DE7A" d="m119.589 128 35.21-35.21L29.78 23.34a13.71 13.71 0 0 0-14.85 0L119.589 128z" />
										<path fill="#FF3A44" d="m119.589 128 35.21 35.21L29.78 232.66a13.71 13.71 0 0 1-14.85 0L119.589 128z" />
										<path fill="#FFCE00" d="m154.799 92.79-35.21 35.21 35.21 35.21 41.49-22.9c10.59-5.85 10.59-21.18 0-27.03l-41.49-20.49z" />
									</svg>
									Google Play
								</a>
							</div>
						</div>

						<div>
							<h4 className="text-sm font-semibold mb-3">Produto</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li><Link href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</Link></li>
								<li><Link href="#servicos" className="hover:text-foreground transition-colors">Serviços</Link></li>
								<li><Link href="#prestadores" className="hover:text-foreground transition-colors">Sou prestador</Link></li>
								<li><Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
							</ul>
						</div>

						<div>
							<h4 className="text-sm font-semibold mb-3">Legal</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li><Link href="/terms" className="hover:text-foreground transition-colors">Termos de uso</Link></li>
								<li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link></li>
							</ul>
						</div>
					</div>

					<div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
						<span>&copy; {new Date().getFullYear()} eufaço! Todos os direitos reservados.</span>
						<span className="flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
							Feito com cuidado no Brasil
						</span>
					</div>
				</div>
			</footer>
		</div>
	)
}
