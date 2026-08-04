import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProviders } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = Number(params.get("page")) || 1;
  const pageSize = Number(params.get("pageSize")) || 20;

  const filters: {
    categorySlug?: string;
    orderBy?: "rating" | "recent";
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    city?: string;
  } = {};

  if (params.get("categorySlug")) filters.categorySlug = params.get("categorySlug")!;
  if (params.get("orderBy") === "rating") filters.orderBy = "rating";
  if (params.get("latitude")) filters.latitude = Number(params.get("latitude"));
  if (params.get("longitude")) filters.longitude = Number(params.get("longitude"));
  if (params.get("radiusKm")) filters.radiusKm = Number(params.get("radiusKm"));
  if (params.get("city")) filters.city = params.get("city")!;

  const supabase = await createClient();
  const result = await getActiveProviders(supabase, { ...filters, page, pageSize });

  // Remove WhatsApp from public API — contact info requires authentication
  const sanitizedProviders = result.providers.map(({ whatsapp, ...rest }) => rest);

  return NextResponse.json({ providers: sanitizedProviders, total: result.total });
}
