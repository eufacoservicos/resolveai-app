import { ProviderLandingPage } from "@/components/landing/provider-landing-page";

type CopyVariant = "a" | "b";

function getVariant(value: string | string[] | undefined): CopyVariant {
  if (Array.isArray(value)) {
    return value[0] === "b" ? "b" : "a";
  }
  return value === "b" ? "b" : "a";
}

export default async function ProvidersLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <ProviderLandingPage
      headlineVariant={getVariant(params.h)}
      ctaVariant={getVariant(params.cta)}
    />
  );
}
