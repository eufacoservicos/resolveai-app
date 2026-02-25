import { SupabaseClient } from "@supabase/supabase-js";
import { CATEGORY_GROUPS } from "@/lib/constants";

// ============================================
// USER QUERIES
// ============================================

export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  return data;
}

// ============================================
// CATEGORY QUERIES
// ============================================

export async function getCategories(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Return only leaf categories (subcategories), not parent groups
  // If parent_id system is not yet set up, return all categories
  const allData = data ?? [];
  const parentIds = new Set(allData.filter((c) => c.parent_id).map((c) => c.parent_id));
  if (parentIds.size > 0) {
    return allData.filter((c) => c.parent_id !== null);
  }
  return allData;
}

// ============================================
// PROVIDER QUERIES
// ============================================

export async function getActiveProviders(
  supabase: SupabaseClient,
  filters?: {
    search?: string;
    categorySlug?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    orderBy?: "rating" | "recent" | "distance";
    page?: number;
    pageSize?: number;
  }
) {
  // Proximity filter: get nearby provider IDs + distances via RPC
  let nearbyMap: Map<string, number> | null = null;

  if (filters?.latitude != null && filters?.longitude != null) {
    const radius = filters.radiusKm ?? 50;
    const { data: nearbyData } = await supabase.rpc("get_nearby_providers", {
      lat: filters.latitude,
      lng: filters.longitude,
      radius_km: radius,
    });

    if (nearbyData) {
      nearbyMap = new Map(
        (nearbyData as { provider_id: string; distance_km: number }[]).map(
          (r) => [r.provider_id, r.distance_km]
        )
      );
    }
  }

  let query = supabase
    .from("provider_profiles")
    .select(
      `
      *,
      user:users!provider_profiles_user_id_fkey(full_name, avatar_url),
      categories:provider_categories(
        category:categories(*)
      ),
      ratings:provider_ratings(average_rating, review_count),
      business_hours(*)
    `
    )
    .eq("is_active", true);

  // Backward compat: city filter only when no geolocation
  if (filters?.city && !nearbyMap) {
    query = query.eq("city", filters.city);
  }

  const { data } = await query;

  let providers = (data ?? [])
    .filter((p) => p.user !== null)
    .map((p) => ({
      ...p,
      user: p.user as { full_name: string; avatar_url: string | null },
      categories: (
        p.categories as { category: { id: string; name: string; slug: string } }[]
      ).map((pc) => pc.category),
      average_rating: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.average_rating ?? null,
      review_count: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.review_count ?? 0,
      business_hours: (p.business_hours ?? []) as {
        id: string;
        provider_id: string;
        day_of_week: number;
        open_time: string | null;
        close_time: string | null;
        is_closed: boolean;
      }[],
      distance_km: nearbyMap?.get(p.id) ?? null,
    }));

  // If proximity search active, filter to only nearby providers
  if (nearbyMap) {
    providers = providers.filter((p) => nearbyMap!.has(p.id));
  }

  // Filter by category (supports both individual slugs and group slugs)
  if (filters?.categorySlug) {
    const group = CATEGORY_GROUPS.find((g) => g.slug === filters.categorySlug);
    if (group) {
      const groupSlugs = group.subcategories as readonly string[];
      providers = providers.filter((p) =>
        p.categories.some((c: { slug: string }) => groupSlugs.includes(c.slug))
      );
    } else {
      providers = providers.filter((p) =>
        p.categories.some((c: { slug: string }) => c.slug === filters.categorySlug)
      );
    }
  }

  // Filter by text search (name or description)
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    providers = providers.filter(
      (p) =>
        p.user.full_name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        p.categories.some((c: { name: string }) =>
          c.name.toLowerCase().includes(term)
        )
    );
  }

  // Sort
  if (filters?.orderBy === "distance" && nearbyMap) {
    providers.sort(
      (a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity)
    );
  } else if (filters?.orderBy === "rating") {
    providers.sort(
      (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)
    );
  } else {
    // Default: priority sort (verified + rated first)
    providers.sort((a, b) => {
      const aVerified = a.is_verified ? 1 : 0;
      const bVerified = b.is_verified ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;

      const aHasRating = a.average_rating !== null ? 1 : 0;
      const bHasRating = b.average_rating !== null ? 1 : 0;
      if (aHasRating !== bHasRating) return bHasRating - aHasRating;

      if (a.average_rating !== null && b.average_rating !== null) {
        return b.average_rating - a.average_rating;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  // Pagination
  const total = providers.length;
  if (filters?.page && filters?.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    providers = providers.slice(start, start + filters.pageSize);
  }

  return { providers, total };
}

export async function getProviderById(
  supabase: SupabaseClient,
  providerId: string
) {
  const { data } = await supabase
    .from("provider_profiles")
    .select(
      `
      *,
      user:users!provider_profiles_user_id_fkey(full_name, avatar_url),
      categories:provider_categories(
        category:categories(*)
      ),
      portfolio:portfolio_images(*),
      ratings:provider_ratings(average_rating, review_count),
      business_hours(*)
    `
    )
    .eq("id", providerId)
    .single();

  if (!data) return null;

  return {
    ...data,
    user: data.user as { full_name: string; avatar_url: string | null },
    categories: (
      data.categories as {
        category: { id: string; name: string; slug: string };
      }[]
    ).map((pc) => pc.category),
    portfolio: data.portfolio as {
      id: string;
      image_url: string;
      created_at: string;
    }[],
    average_rating: (data.ratings as { average_rating: number; review_count: number }[])?.[0]
      ?.average_rating ?? null,
    review_count: (data.ratings as { average_rating: number; review_count: number }[])?.[0]
      ?.review_count ?? 0,
    business_hours: (data.business_hours ?? []) as {
      id: string;
      provider_id: string;
      day_of_week: number;
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
    }[],
  };
}

export async function getProviderByUserId(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("provider_profiles")
    .select(
      `
      *,
      categories:provider_categories(
        category:categories(*)
      ),
      portfolio:portfolio_images(*),
      ratings:provider_ratings(average_rating, review_count),
      business_hours(*)
    `
    )
    .eq("user_id", userId)
    .single();

  if (!data) return null;

  return {
    ...data,
    categories: (
      data.categories as {
        category: { id: string; name: string; slug: string };
      }[]
    ).map((pc) => pc.category),
    portfolio: data.portfolio as {
      id: string;
      image_url: string;
      created_at: string;
    }[],
    average_rating: (data.ratings as { average_rating: number; review_count: number }[])?.[0]
      ?.average_rating ?? null,
    review_count: (data.ratings as { average_rating: number; review_count: number }[])?.[0]
      ?.review_count ?? 0,
    business_hours: (data.business_hours ?? []) as {
      id: string;
      provider_id: string;
      day_of_week: number;
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
    }[],
  };
}

// ============================================
// REVIEW QUERIES
// ============================================

export async function getProviderReviews(
  supabase: SupabaseClient,
  providerId: string
) {
  const { data } = await supabase
    .from("reviews")
    .select(
      `
      *,
      client:users!reviews_client_id_fkey(full_name, avatar_url),
      reply:review_replies(content, created_at)
    `
    )
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    ...r,
    client: r.client as { full_name: string; avatar_url: string | null },
    reply: (r.reply as { content: string; created_at: string }[] | null)?.[0] ?? null,
  }));
}

export async function hasUserReviewedProvider(
  supabase: SupabaseClient,
  providerId: string,
  clientId: string
) {
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("client_id", clientId);

  return (count ?? 0) > 0;
}

// ============================================
// FAVORITE QUERIES
// ============================================

export async function getUserFavorites(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("favorites")
    .select("provider_id")
    .eq("user_id", userId);

  return (data ?? []).map((f) => f.provider_id);
}

export async function getUserFavoriteProviders(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("favorites")
    .select(
      `
      provider:provider_profiles!favorites_provider_id_fkey(
        *,
        user:users!provider_profiles_user_id_fkey(full_name, avatar_url),
        categories:provider_categories(
          category:categories(*)
        ),
        ratings:provider_ratings(average_rating, review_count),
        business_hours(*)
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? [])
    .map((f) => f.provider as unknown as Record<string, unknown>)
    .filter((p) => p !== null && p.user !== null)
    .map((p) => ({
      id: p.id as string,
      city: p.city as string,
      description: p.description as string,
      user: p.user as { full_name: string; avatar_url: string | null },
      categories: (
        p.categories as { category: { id: string; name: string; slug: string } }[]
      ).map((pc) => pc.category),
      average_rating: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.average_rating ?? null,
      review_count: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.review_count ?? 0,
      business_hours: ((p.business_hours ?? []) as {
        id: string;
        provider_id: string;
        day_of_week: number;
        open_time: string | null;
        close_time: string | null;
        is_closed: boolean;
      }[]),
    }));
}

// ============================================
// PROVIDER STATS (analytics)
// ============================================

export async function getProviderStats(
  supabase: SupabaseClient,
  providerId: string
) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const since = sevenDaysAgo.toISOString();

  const [totalViews, totalClicks, recentViews, recentClicks] =
    await Promise.all([
      supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("provider_id", providerId),
      supabase
        .from("whatsapp_clicks")
        .select("id", { count: "exact", head: true })
        .eq("provider_id", providerId),
      supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("provider_id", providerId)
        .gte("created_at", since),
      supabase
        .from("whatsapp_clicks")
        .select("id", { count: "exact", head: true })
        .eq("provider_id", providerId)
        .gte("created_at", since),
    ]);

  return {
    totalViews: totalViews.count ?? 0,
    totalClicks: totalClicks.count ?? 0,
    viewsLast7Days: recentViews.count ?? 0,
    clicksLast7Days: recentClicks.count ?? 0,
  };
}

// ============================================
// CITIES (distinct values from providers)
// ============================================

export async function getCities(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("provider_profiles")
    .select("city")
    .eq("is_active", true)
    .neq("city", "");

  const unique = [...new Set((data ?? []).map((d) => d.city))].sort();
  return unique;
}
