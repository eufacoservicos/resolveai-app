"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ArrowRight, LayoutGrid } from "lucide-react"
import { getCategoryIcon } from "@/lib/category-icons"
import { CATEGORY_GROUPS } from "@/lib/constants"
import { useCategoryPending } from "@/components/providers/category-pending"

interface CategoryFilterProps {
	activeSlug?: string
	limit?: number
}

export function CategoryFilter({ activeSlug, limit }: CategoryFilterProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { startNavigation } = useCategoryPending()

	const displayedGroups = limit
		? CATEGORY_GROUPS.slice(0, limit)
		: CATEGORY_GROUPS

	const isAllActive = !activeSlug

	function isGroupActive(groupSlug: string) {
		if (!activeSlug) return false
		if (activeSlug === groupSlug) return true
		const group = CATEGORY_GROUPS.find((g) => g.slug === groupSlug)
		if (!group) return false
		return (group.subcategories as readonly string[]).includes(activeSlug)
	}

	function handleAllClick() {
		const params = new URLSearchParams(searchParams.toString())
		params.delete("categoria")
		startNavigation(() => {
			router.push(`?${params.toString()}`)
		})
	}

	function handleGroupClick(groupSlug: string) {
		const params = new URLSearchParams(searchParams.toString())

		if (isGroupActive(groupSlug)) {
			params.delete("categoria")
		} else {
			params.set("categoria", groupSlug)
		}
		startNavigation(() => {
			router.push(`?${params.toString()}`)
		})
	}

	return (
		<div>
			<h2 className='mb-3 text-lg font-semibold'>Categorias</h2>
			<div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
				{/* "Todas" card */}
				<button
					onClick={handleAllClick}
					className={cn(
						"flex shrink-0 flex-col items-center gap-1.5 rounded-sm border w-18 py-3 transition-all",
						isAllActive
							? "border-primary bg-primary/5 text-primary"
							: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
					)}>
					<div
						className={cn(
							"flex h-9 w-9 items-center justify-center rounded-lg",
							isAllActive ? "bg-primary/10" : "bg-muted"
						)}>
						<LayoutGrid className='h-4.5 w-4.5' />
					</div>
					<span className='text-[11px] font-medium leading-tight'>Todas</span>
				</button>

				{displayedGroups.map((group) => {
					const isActive = isGroupActive(group.slug)
					const Icon = getCategoryIcon(group.slug)

					return (
						<button
							key={group.slug}
							onClick={() => handleGroupClick(group.slug)}
							className={cn(
								"flex shrink-0 flex-col items-center gap-1.5 rounded-sm border w-18 py-3 transition-all",
								isActive
									? "border-primary bg-primary/5 text-primary"
									: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
							)}>
							<div
								className={cn(
									"flex h-9 w-9 items-center justify-center rounded-lg",
									isActive ? "bg-primary/10" : "bg-muted"
								)}>
								<Icon className='h-4.5 w-4.5' />
							</div>
							<span className='text-[11px] font-medium leading-tight text-center line-clamp-2 px-1'>
								{group.name}
							</span>
						</button>
					)
				})}

				{/* "Ver todas" card */}
				<Link
					href='/categories'
					className='flex shrink-0 flex-col items-center gap-1.5 rounded-sm border border-dashed border-border w-18 py-3 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all'>
					<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted'>
						<ArrowRight className='h-4.5 w-4.5' />
					</div>
					<span className='text-[11px] font-medium leading-tight text-center'>
						Ver todas
					</span>
				</Link>
			</div>
		</div>
	)
}
