import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://www.eufacooservico.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch all active provider IDs
  const { data: providers } = await supabase
    .from("provider_profiles")
    .select("id, updated_at")
    .eq("is_active", true);

  // Fetch all categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/home`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/categories`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const providerPages: MetadataRoute.Sitemap = (providers ?? []).map(
    (provider) => ({
      url: `${BASE_URL}/provider/${provider.id}`,
      lastModified: provider.updated_at
        ? new Date(provider.updated_at)
        : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })
  );

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map(
    (category) => ({
      url: `${BASE_URL}/home?categoria=${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })
  );

  return [...staticPages, ...providerPages, ...categoryPages];
}
