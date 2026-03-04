"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ProviderCard } from "@/components/providers/provider-card"
import { ProviderGrid } from "@/components/providers/provider-grid"
import { toast } from "sonner"

interface Provider {
	id: string
	user: { full_name: string; avatar_url: string | null }
	categories: { id: string; name: string; slug: string }[]
	description?: string
	city: string
	state?: string | null
	average_rating: number | null
	review_count: number
	is_verified?: boolean
	business_hours?: {
		id: string
		provider_id: string
		day_of_week: number
		open_time: string | null
		close_time: string | null
		is_closed: boolean
	}[]
	distance_km?: number | null
}

interface ProviderLoadMoreProps {
	initialProviders: Provider[]
	total: number
	pageSize: number
	filters: {
		categorySlug?: string
		orderBy?: "rating" | "recent"
		latitude?: number
		longitude?: number
		radiusKm?: number
		city?: string
	}
	userId: string | null
	favoriteIds: string[]
}

export function ProviderLoadMore({
	initialProviders,
	total,
	pageSize,
	filters,
	userId,
	favoriteIds
}: ProviderLoadMoreProps) {
	const [providers, setProviders] = useState<Provider[]>(initialProviders)
	const [page, setPage] = useState(1)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		setProviders(initialProviders)
		setPage(1)
	}, [
		initialProviders,
		total,
		filters.categorySlug,
		filters.orderBy,
		filters.latitude,
		filters.longitude,
		filters.radiusKm,
		filters.city
	])

	const hasMore = providers.length < total

	async function handleLoadMore() {
		setIsLoading(true)
		try {
			const nextPage = page + 1
			const params = new URLSearchParams({
				page: String(nextPage),
				pageSize: String(pageSize)
			})
			if (filters.categorySlug) params.set("categorySlug", filters.categorySlug)
			if (filters.orderBy) params.set("orderBy", filters.orderBy)
			if (filters.latitude != null)
				params.set("latitude", String(filters.latitude))
			if (filters.longitude != null)
				params.set("longitude", String(filters.longitude))
			if (filters.radiusKm != null)
				params.set("radiusKm", String(filters.radiusKm))
			if (filters.city) params.set("city", filters.city)

			const res = await fetch(`/api/providers?${params}`)
			if (!res.ok) {
				throw new Error(`Failed to load providers: ${res.status}`)
			}

			const result = await res.json()
			setProviders((prev) => [
				...prev,
				...result.providers.filter(
					(provider: Provider) => !prev.some((current) => current.id === provider.id)
				)
			])
			setPage(nextPage)
		} catch (error) {
			console.error(error)
			toast.error("Nao foi possivel carregar mais profissionais.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<>
			<ProviderGrid>
				{providers.map((provider) => (
					<ProviderCard
						key={provider.id}
						provider={provider}
						userId={userId}
						isFavorited={favoriteIds.includes(provider.id)}
					/>
				))}
			</ProviderGrid>

			{hasMore && (
				<div className='flex justify-center pt-4'>
					<button
						onClick={handleLoadMore}
						disabled={isLoading}
						className='inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50'>
						{isLoading ? (
							<>
								<Loader2 className='h-4 w-4 animate-spin' />
								Carregando...
							</>
						) : (
							"Carregar mais"
						)}
					</button>
				</div>
			)}
		</>
	)
}
