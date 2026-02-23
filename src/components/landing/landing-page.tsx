"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
	Zap,
	Paintbrush,
	Wrench,
	Scissors,
	Hammer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { categoryIconMap } from "@/lib/category-icons"

// ─── Unsplash Service Images ───────────────────────────────────────
const serviceImages = {
	electrician: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop&crop=center",
	plumber: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop&crop=center",
	painter: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop&crop=center",
	cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop&crop=center",
	carpenter: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop&crop=center",
	gardener: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&crop=center",
	mechanic: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop&crop=center",
	hairdresser: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&crop=center",
	stepSearch: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=600&fit=crop&crop=center",
	stepCompare: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop&crop=center",
	stepHire: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop&crop=center",
	ctaBg: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop&crop=center",
}

// ─── Service Showcase Data ─────────────────────────────────────────
const serviceShowcase = [
	{ image: serviceImages.electrician, label: "Eletricista", slug: "eletricista", description: "Instalações, reparos e manutenção elétrica" },
	{ image: serviceImages.plumber, label: "Encanador", slug: "encanador", description: "Vazamentos, instalações hidráulicas e mais" },
	{ image: serviceImages.painter, label: "Pintor", slug: "pintor", description: "Pintura residencial e comercial" },
	{ image: serviceImages.cleaning, label: "Diarista", slug: "diarista", description: "Limpeza completa para sua casa" },
	{ image: serviceImages.carpenter, label: "Marceneiro", slug: "marceneiro", description: "Móveis sob medida e reparos" },
	{ image: serviceImages.gardener, label: "Jardineiro", slug: "jardineiro", description: "Paisagismo e manutenção de jardins" },
	{ image: serviceImages.mechanic, label: "Mecânico", slug: "mecanico", description: "Reparos e manutenção automotiva" },
	{ image: serviceImages.hairdresser, label: "Cabeleireira", slug: "cabeleireira", description: "Cortes, coloração e tratamentos" },
]

// ─── Animation Variants ────────────────────────────────────────────
const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
}

const staggerItem = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" as const },
	},
}


// ─── Section wrapper with viewport animation ────────────────────────
function Section({
	children,
	className = "",
	id
}: {
	children: React.ReactNode
	className?: string
	id?: string
}) {
	return (
		<motion.section
			id={id}
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			className={className}>
			{children}
		</motion.section>
	)
}

// ─── Decorative Divider ─────────────────────────────────────────────
function SectionDivider() {
	return (
		<div className='relative py-8 overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent' />
			<div className='mx-auto max-w-6xl px-4 flex items-center gap-4'>
				<div className='flex-1 h-px bg-gradient-to-r from-transparent to-border/60' />
				<Sparkles className='h-5 w-5 text-primary/30' />
				<div className='flex-1 h-px bg-gradient-to-l from-transparent to-border/60' />
			</div>
		</div>
	)
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
	{ slug: "personal-trainer", label: "Personal Trainer" }
]


// ─── Main Component ─────────────────────────────────────────────────
export function LandingPage() {
	const heroRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ["start start", "end start"]
	})
	const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
	const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])

	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<div className='min-h-screen bg-background overflow-x-hidden'>
			{/* ─── Navbar ───────────────────────────────────────────── */}
			<motion.header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					scrolled ? "glass border-b border-border/50 shadow-sm" : "bg-transparent"
				}`}
				initial={{ y: -80 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}>
				<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<Link href='/'>
							<Image
								src='/logo.svg'
								alt='eufaço!'
								width={220}
								height={80}
								className='h-10 sm:h-14 w-auto'
							/>
						</Link>

						<div className='flex items-center gap-3'>
							<Link href='/login'>
								<Button variant='ghost' size='sm' className='text-sm font-medium'>
									Entrar
								</Button>
							</Link>
							<Link href='/register'>
								<Button
									size='sm'
									className='gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-shadow text-sm font-medium'>
									Começar grátis
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</motion.header>

			{/* ─── Hero Section ─────────────────────────────────────── */}
			<div ref={heroRef} className='relative pt-16 overflow-hidden'>
				{/* Background decorations */}
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<div className='absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl' />
					<div className='absolute top-20 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-400/5 blur-3xl' />
					<div className='absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/3 blur-3xl' />

					{/* Floating service icons */}
					<div className='absolute top-32 left-[10%] animate-float opacity-[0.08]'>
						<Zap className='h-16 w-16 text-primary' />
					</div>
					<div className='absolute top-48 right-[12%] animate-float-slow opacity-[0.08]' style={{ animationDelay: "1s" }}>
						<Paintbrush className='h-14 w-14 text-primary' />
					</div>
					<div className='absolute bottom-24 left-[20%] animate-float-reverse opacity-[0.06]' style={{ animationDelay: "2s" }}>
						<Wrench className='h-12 w-12 text-primary' />
					</div>
					<div className='absolute top-64 left-[75%] animate-float opacity-[0.06]' style={{ animationDelay: "3s" }}>
						<Scissors className='h-12 w-12 text-primary' />
					</div>
					<div className='absolute bottom-40 right-[25%] animate-float-slow opacity-[0.07]' style={{ animationDelay: "0.5s" }}>
						<Hammer className='h-14 w-14 text-primary' />
					</div>
				</div>

				<motion.div
					style={{ opacity: heroOpacity, y: heroY }}
					className='relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-20 sm:pt-28 lg:pt-36'>
					<div className='grid lg:grid-cols-2 gap-12 items-center'>
						{/* Left: Text content */}
						<div className='text-center lg:text-left min-w-0'>
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}>
								<span className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6'>
									<Sparkles className='h-4 w-4' />A plataforma de serviços locais
								</span>
							</motion.div>

							<motion.h1
								className='mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl'
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}>
								Encontre o profissional <span className='gradient-text'>ideal</span> para
								qualquer serviço
							</motion.h1>

							<motion.p
								className='mt-6 text-lg text-muted-foreground sm:text-xl'
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}>
								Conecte-se com prestadores verificados na sua região. Busque, compare
								avaliações e contrate com segurança.
							</motion.p>

							<motion.div
								className='mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4'
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.5 }}>
								<Link href='/home'>
									<Button
										size='lg'
										className='gradient-bg text-white border-0 shadow-lg hover:shadow-xl transition-all text-base px-8 h-12 rounded-xl gap-2 group'>
										Explorar profissionais
										<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
									</Button>
								</Link>
								<Link href='#como-funciona'>
									<Button
										variant='outline'
										size='lg'
										className='text-base px-8 h-12 rounded-xl'>
										Como funciona
									</Button>
								</Link>
							</motion.div>

							{/* Search preview */}
							<motion.div
								className='mt-12 max-w-lg mx-auto lg:mx-0'
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.6 }}>
								<Link href='/search' className='block'>
									<div className='glass flex items-center gap-3 rounded-2xl border border-border/50 px-5 py-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden'>
										<Search className='h-5 w-5 text-muted-foreground shrink-0' />
										<span className='text-muted-foreground truncate'>
											O que você precisa? Ex: eletricista, pintor...
										</span>
									</div>
								</Link>
							</motion.div>

							{/* Mobile: service image strip */}
							<motion.div
								className='mt-8 lg:hidden -mx-4 px-4 flex gap-3 overflow-x-auto scrollbar-none pb-2'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.7 }}>
								{serviceShowcase.slice(0, 4).map((service, i) => (
									<div key={i} className='shrink-0 w-[140px] rounded-xl overflow-hidden shadow-md'>
										<Image
											src={service.image}
											alt={service.label}
											width={140}
											height={100}
											className='w-full h-[100px] object-cover'
										/>
										<div className='p-2 bg-background text-center'>
											<span className='text-xs font-medium'>{service.label}</span>
										</div>
									</div>
								))}
							</motion.div>
						</div>

						{/* Right: Phone mockup (desktop only) */}
						<motion.div
							className='relative hidden lg:flex justify-center'
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}>
							{/* Phone frame */}
							<div className='relative w-[280px] h-[560px] rounded-[3rem] border-[8px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden'>
								<div className='h-full bg-background rounded-[2.2rem] overflow-hidden p-4'>
									{/* Simulated app header */}
									<div className='flex items-center gap-2 mb-4'>
										<div className='h-8 w-8 rounded-lg gradient-bg' />
										<div className='h-3 w-20 bg-muted rounded' />
									</div>
									{/* Simulated search bar */}
									<div className='glass rounded-xl p-3 mb-3 flex items-center gap-2 border border-border/50'>
										<Search className='h-4 w-4 text-muted-foreground' />
										<div className='h-2.5 w-24 bg-muted rounded' />
									</div>
									{/* Simulated service cards */}
									{[serviceImages.electrician, serviceImages.plumber, serviceImages.painter].map((img, i) => (
										<motion.div
											key={i}
											className='flex items-center gap-3 rounded-xl glass border border-border/50 p-2.5 mb-2.5'
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.8 + i * 0.2 }}>
											<Image src={img} alt='' width={44} height={44} className='rounded-lg object-cover w-11 h-11' />
											<div className='flex-1'>
												<div className='h-2.5 w-20 bg-muted-foreground/20 rounded mb-1.5' />
												<div className='h-2 w-14 bg-muted rounded' />
											</div>
											<div className='flex gap-0.5'>
												{[...Array(5)].map((_, j) => (
													<Star key={j} className='h-2.5 w-2.5 fill-amber-400 text-amber-400' />
												))}
											</div>
										</motion.div>
									))}
									{/* Simulated extra content */}
									<div className='mt-3 space-y-2'>
										<div className='h-2 w-full bg-muted rounded' />
										<div className='h-2 w-3/4 bg-muted rounded' />
									</div>
								</div>
							</div>

							{/* Floating badges around phone */}
							<motion.div
								className='absolute -top-4 -left-16 glass rounded-xl p-3 shadow-lg border border-border/50'
								animate={{ y: [0, -8, 0] }}
								transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
								<div className='flex items-center gap-2'>
									<CheckCircle2 className='h-5 w-5 text-emerald-500' />
									<span className='text-xs font-semibold whitespace-nowrap'>Profissional verificado</span>
								</div>
							</motion.div>

							<motion.div
								className='absolute bottom-20 -right-16 glass rounded-xl p-3 shadow-lg border border-border/50'
								animate={{ y: [0, 8, 0] }}
								transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
								<div className='flex items-center gap-2'>
									<Star className='h-4 w-4 fill-amber-400 text-amber-400' />
									<span className='text-xs font-semibold whitespace-nowrap'>4.9 avaliações</span>
								</div>
							</motion.div>

							<motion.div
								className='absolute top-1/2 -right-24 glass rounded-xl p-3 shadow-lg border border-border/50'
								animate={{ y: [0, -6, 0] }}
								transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
								<div className='flex items-center gap-2'>
									<MessageCircle className='h-4 w-4 text-primary' />
									<span className='text-xs font-semibold whitespace-nowrap'>Chat via WhatsApp</span>
								</div>
							</motion.div>
						</motion.div>
					</div>
				</motion.div>
			</div>

			{/* ─── Features ─────────────────────────────────────────── */}
			<Section
				className='py-20 sm:py-28 px-4 sm:px-6 lg:px-8'
				id='funcionalidades'>
				<div className='mx-auto max-w-6xl'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold sm:text-4xl'>
							Feito para <span className='gradient-text'>todos</span>
						</h2>
						<p className='mt-4 text-muted-foreground text-lg'>
							Seja você um cliente buscando serviços ou um prestador oferecendo seu
							trabalho
						</p>
					</div>

					<div className='grid gap-8 md:grid-cols-2'>
						{/* For clients */}
						<motion.div
							className='rounded-2xl border border-border/50 glass p-8 space-y-6'
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}>
							<div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary'>
								<Search className='h-4 w-4' />
								Para Clientes
							</div>
							<div className='space-y-5'>
								{[
									{
										icon: Search,
										title: "Busca inteligente",
										desc: "Encontre profissionais por categoria, cidade ou nome"
									},
									{
										icon: Star,
										title: "Avaliações reais",
										desc: "Veja a opinião de outros clientes antes de contratar"
									},
									{
										icon: MessageCircle,
										title: "Contato direto",
										desc: "Fale com o prestador via WhatsApp com um clique"
									},
									{
										icon: Heart,
										title: "Lista de favoritos",
										desc: "Salve os profissionais que mais gostou para voltar depois"
									}
								].map((feature, i) => (
									<motion.div
										key={feature.title}
										className='flex items-start gap-4'
										initial={{ opacity: 0, y: 15 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.4, delay: i * 0.1 }}>
										<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
											<feature.icon className='h-5 w-5 text-primary' />
										</div>
										<div>
											<h3 className='font-semibold'>{feature.title}</h3>
											<p className='text-sm text-muted-foreground'>{feature.desc}</p>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>

						{/* For providers */}
						<motion.div
							className='rounded-2xl border border-border/50 glass p-8 space-y-6'
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}>
							<div className='inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600'>
								<Briefcase className='h-4 w-4' />
								Para Prestadores
							</div>
							<div className='space-y-5'>
								{[
									{
										icon: Users,
										title: "Visibilidade",
										desc: "Seu perfil visível para milhares de pessoas na sua região"
									},
									{
										icon: Camera,
										title: "Portfólio",
										desc: "Mostre fotos dos seus trabalhos e conquiste mais clientes"
									},
									{
										icon: TrendingUp,
										title: "Cresça seu negócio",
										desc: "Receba contatos diretamente pelo WhatsApp"
									},
									{
										icon: Shield,
										title: "Perfil verificado",
										desc: "Transmita confiança com um perfil completo e avaliações"
									}
								].map((feature, i) => (
									<motion.div
										key={feature.title}
										className='flex items-start gap-4'
										initial={{ opacity: 0, y: 15 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.4, delay: i * 0.1 }}>
										<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10'>
											<feature.icon className='h-5 w-5 text-emerald-600' />
										</div>
										<div>
											<h3 className='font-semibold'>{feature.title}</h3>
											<p className='text-sm text-muted-foreground'>{feature.desc}</p>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>
					</div>
				</div>
			</Section>

			<SectionDivider />

			{/* ─── Serviços em Destaque ─────────────────────────────── */}
			<Section className='py-20 sm:py-28 px-4 sm:px-6 lg:px-8' id='servicos'>
				<div className='mx-auto max-w-6xl'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold sm:text-4xl'>
							Serviços em <span className='gradient-text'>destaque</span>
						</h2>
						<p className='mt-4 text-muted-foreground text-lg'>
							Profissionais qualificados nas categorias mais procuradas
						</p>
					</div>

					<motion.div
						className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
						variants={staggerContainer}
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}>
						{serviceShowcase.map((service) => {
							const Icon = categoryIconMap[service.slug]
							return (
								<motion.div
									key={service.slug}
									variants={staggerItem}
									whileHover={{ y: -6 }}
									className='group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer'>
									<div className='aspect-[4/3] relative overflow-hidden'>
										<Image
											src={service.image}
											alt={service.label}
											fill
											sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
											className='object-cover transition-transform duration-500 group-hover:scale-110'
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
									</div>
									<div className='absolute bottom-0 left-0 right-0 p-4'>
										<div className='flex items-center gap-2 mb-1'>
											{Icon && <Icon className='h-4 w-4 text-white/90' />}
											<h3 className='text-white font-semibold text-sm sm:text-base'>{service.label}</h3>
										</div>
										<p className='text-white/70 text-xs sm:text-sm line-clamp-1'>{service.description}</p>
									</div>
								</motion.div>
							)
						})}
					</motion.div>

					<div className='mt-10 text-center'>
						<Link href='/search'>
							<Button size='lg' className='gradient-bg text-white border-0 shadow-lg rounded-xl gap-2 group'>
								Explorar todos os serviços
								<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
							</Button>
						</Link>
					</div>
				</div>
			</Section>

			<SectionDivider />

			{/* ─── Como Funciona ────────────────────────────────────── */}
			<Section
				className='py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/[0.03] to-transparent'
				id='como-funciona'>
				<div className='mx-auto max-w-6xl'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold sm:text-4xl'>
							Como <span className='gradient-text'>funciona</span>
						</h2>
						<p className='mt-4 text-muted-foreground text-lg'>
							Simples, rápido e seguro. Em 3 passos você encontra o profissional certo.
						</p>
					</div>

					<div className='grid gap-8 md:grid-cols-3'>
						{[
							{
								step: "01",
								title: "Busque",
								desc:
									"Digite o serviço que precisa ou navegue pelas categorias disponíveis.",
								icon: Search,
								image: serviceImages.stepSearch
							},
							{
								step: "02",
								title: "Compare",
								desc:
									"Veja perfis, avaliações, portfólios e escolha o melhor profissional.",
								icon: Star,
								image: serviceImages.stepCompare
							},
							{
								step: "03",
								title: "Contrate",
								desc: "Entre em contato direto pelo WhatsApp e resolva o que precisa.",
								icon: CheckCircle2,
								image: serviceImages.stepHire
							}
						].map((item, i) => (
							<motion.div
								key={item.step}
								className='relative text-center group'
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: i * 0.15 }}>
								{/* Connector line */}
								{i < 2 && (
									<div className='hidden md:block absolute top-20 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-primary/5' />
								)}
								{/* Image with overlay */}
								<div className='mx-auto mb-6 h-36 w-36 rounded-2xl overflow-hidden relative shadow-lg'>
									<Image
										src={item.image}
										alt={item.title}
										fill
										sizes='144px'
										className='object-cover transition-transform duration-500 group-hover:scale-110'
									/>
									<div className='absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors' />
									<div className='absolute inset-0 flex items-center justify-center'>
										<div className='h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-md'>
											<item.icon className='h-7 w-7 text-primary' />
										</div>
									</div>
								</div>
								<span className='text-sm font-bold text-primary/60'>
									PASSO {item.step}
								</span>
								<h3 className='mt-2 text-xl font-bold'>{item.title}</h3>
								<p className='mt-2 text-muted-foreground'>{item.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</Section>

			{/* ─── Categorias Populares ─────────────────────────────── */}
			<Section className='py-20 sm:py-28 px-4 sm:px-6 lg:px-8' id='categorias'>
				<div className='mx-auto max-w-6xl'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold sm:text-4xl'>
							Categorias <span className='gradient-text'>populares</span>
						</h2>
						<p className='mt-4 text-muted-foreground text-lg'>
							Dezenas de categorias para você encontrar exatamente o que precisa
						</p>
					</div>

					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
						{popularCategories.map((cat, i) => {
							const Icon = categoryIconMap[cat.slug]
							return (
								<motion.div
									key={cat.slug}
									initial={{ opacity: 0, scale: 0.9 }}
									whileInView={{ opacity: 1, scale: 1 }}
									viewport={{ once: true }}
									transition={{ duration: 0.3, delay: i * 0.05 }}
									whileHover={{ scale: 1.05, y: -4 }}
									className='flex flex-col items-center gap-3 rounded-2xl glass border border-border/50 p-5 cursor-pointer transition-shadow hover:shadow-md'>
									<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10'>
										{Icon && <Icon className='h-6 w-6 text-primary' />}
									</div>
									<span className='text-sm font-medium text-center'>{cat.label}</span>
								</motion.div>
							)
						})}
					</div>

					<div className='mt-10 text-center'>
						<Link href='/categories'>
							<Button variant='outline' size='lg' className='rounded-xl gap-2 group'>
								Ver todas as categorias
								<ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
							</Button>
						</Link>
					</div>
				</div>
			</Section>


			{/* ─── CTA Final ────────────────────────────────────────── */}
			<Section className='py-20 sm:py-28 px-4 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<div className='rounded-3xl relative overflow-hidden'>
						<Image
							src={serviceImages.ctaBg}
							alt=''
							fill
							sizes='100vw'
							className='object-cover'
						/>
						<div className='absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95' />

						<div className='relative p-10 sm:p-16 text-center text-white'>
							{/* Gradient orbs */}
							<div className='absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl' />
							<div className='absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl' />

							<div className='relative'>
								<motion.h2
									className='text-3xl sm:text-4xl font-bold'
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5 }}>
									Pronto para começar?
								</motion.h2>
								<motion.p
									className='mt-4 text-lg text-white/70 max-w-xl mx-auto'
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.1 }}>
									Junte-se a milhares de pessoas que já usam o eufaço! para encontrar e
									oferecer serviços.
								</motion.p>
								<motion.div
									className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-4'
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.2 }}>
									<Link href='/home'>
										<Button
											size='lg'
											className='gradient-bg text-white border-0 shadow-lg hover:shadow-xl transition-all text-base px-8 h-12 rounded-xl gap-2 group'>
											<Search className='h-4 w-4' />
											Quero contratar
										</Button>
									</Link>
									<Link href='/register'>
										<Button
											size='lg'
											variant='outline'
											className='border-white/20 text-white hover:bg-white/10 text-base px-8 h-12 rounded-xl gap-2 group'>
											<Briefcase className='h-4 w-4' />
											Quero oferecer serviços
										</Button>
									</Link>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</Section>

			{/* ─── Footer ───────────────────────────────────────────── */}
			<footer className='border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<div className='grid gap-8 sm:grid-cols-3'>
						<div>
							<div className='mb-4'>
								<Image
									src='/logo.svg'
									alt='eufaço!'
									width={200}
									height={75}
									className='h-10 w-auto'
								/>
							</div>
							<p className='text-sm text-muted-foreground'>
								A plataforma que conecta você aos melhores prestadores de serviços da
								sua região.
							</p>
						</div>

						<div>
							<h4 className='font-semibold mb-3'>Links</h4>
							<ul className='space-y-2 text-sm text-muted-foreground'>
								<li>
									<Link
										href='#como-funciona'
										className='hover:text-foreground transition-colors'>
										Como funciona
									</Link>
								</li>
								<li>
									<Link
										href='#categorias'
										className='hover:text-foreground transition-colors'>
										Categorias
									</Link>
								</li>
								<li>
									<Link
										href='/register'
										className='hover:text-foreground transition-colors'>
										Criar conta
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className='font-semibold mb-3'>Legal</h4>
							<ul className='space-y-2 text-sm text-muted-foreground'>
								<li>
									<Link
										href='/terms'
										className='hover:text-foreground transition-colors'>
										Termos de uso
									</Link>
								</li>
								<li>
									<Link
										href='/privacy'
										className='hover:text-foreground transition-colors'>
										Política de privacidade
									</Link>
								</li>
							</ul>
						</div>
					</div>

					<div className='mt-10 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground'>
						&copy; {new Date().getFullYear()} eufaço! Todos os direitos reservados.
					</div>
				</div>
			</footer>
		</div>
	)
}
