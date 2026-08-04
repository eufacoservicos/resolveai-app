import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProviderById,
  getProviderReviews,
  getCurrentUser,
  hasUserReviewedProvider,
} from "@/lib/supabase/queries";
import { ProviderDetail } from "@/components/providers/provider-detail";
import { TrackView } from "@/components/analytics/track-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const provider = await getProviderById(supabase, id);

  if (!provider) {
    return { title: "Prestador não encontrado - eufaço!" };
  }

  const name = provider.user.full_name;
  const category = provider.categories[0]?.name ?? "Serviços";
  const rating = provider.average_rating
    ? ` | ${provider.average_rating} estrelas`
    : "";

  const ogImage =
    provider.portfolio?.[0]?.image_url ?? provider.user.avatar_url;

  return {
    title: `${name} - ${category} | eufaço!`,
    description: provider.description
      ? provider.description.slice(0, 160)
      : `${name} - ${category} em ${provider.city || "sua cidade"}. Veja avaliações e entre em contato pelo eufaço!.`,
    openGraph: {
      title: `${name} - ${category}${rating}`,
      description: provider.description
        ? provider.description.slice(0, 160)
        : `Prestador de serviços no eufaço!.`,
      type: "profile",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [provider, reviews, currentUser] = await Promise.all([
    getProviderById(supabase, id),
    getProviderReviews(supabase, id),
    getCurrentUser(supabase),
  ]);

  if (!provider) {
    notFound();
  }

  const alreadyReviewed = currentUser
    ? await hasUserReviewedProvider(supabase, id, currentUser.id)
    : true;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: provider.user.full_name,
    description: provider.description || undefined,
    image: provider.portfolio?.[0]?.image_url ?? provider.user.avatar_url ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.city || undefined,
      addressRegion: provider.state || undefined,
      addressCountry: "BR",
    },
    url: `https://www.eufacooservico.com.br/provider/${id}`,
    ...(provider.categories.length > 0 && {
      category: provider.categories.map((c: { name: string }) => c.name).join(", "),
    }),
    ...(provider.average_rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: provider.average_rating,
        reviewCount: provider.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("</", "<\\/") }}
      />
      <TrackView providerId={id} />
      <ProviderDetail
        provider={{
          ...provider,
          whatsapp: currentUser ? provider.whatsapp : "",
          average_rating: currentUser ? provider.average_rating : null,
          review_count: currentUser ? provider.review_count : 0,
        }}
        reviews={currentUser ? reviews : []}
        currentUser={currentUser}
        alreadyReviewed={alreadyReviewed}
      />
    </>
  );
}
