import { SupabaseClient } from "@supabase/supabase-js";
import { UserRole } from "@/types/database";
import { getDefaultBusinessHours } from "@/lib/business-hours";

// ============================================
// AUTH MUTATIONS
// ============================================

export async function signUpWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  providerData?: {
    description: string;
    whatsapp: string;
    cep: string;
    city: string;
    state: string;
    neighborhood: string;
    latitude: number | null;
    longitude: number | null;
    categoryIds: string[];
  }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        ...(providerData ? { provider_data: providerData } : {}),
      },
    },
  });
  return { data, error };
}

export async function signInWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  return { data, error };
}

export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ============================================
// USER MUTATIONS
// ============================================

export async function updateUser(
  supabase: SupabaseClient,
  userId: string,
  data: { full_name?: string; avatar_url?: string | null; role?: UserRole }
) {
  const { error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return { error };
}

// ============================================
// AVATAR MUTATIONS
// ============================================

export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError, url: null };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return { error: dbError, url: avatarUrl };
}

// ============================================
// PROVIDER MUTATIONS
// ============================================

export async function createProviderProfile(
  supabase: SupabaseClient,
  userId: string,
  data: {
    description: string;
    city: string;
    neighborhood?: string;
    cep?: string;
    state?: string;
    latitude?: number | null;
    longitude?: number | null;
    whatsapp: string;
    instagram?: string;
  }
) {
  // Update user role to PROVIDER
  // Note: this triggers `on_user_role_change` which creates a minimal provider_profiles row.
  const { error: roleError } = await supabase
    .from("users")
    .update({ role: "PROVIDER" as UserRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (roleError) return { error: roleError, profileId: null };

  // Upsert provider profile to handle the trigger-created row
  const { data: profile, error } = await supabase
    .from("provider_profiles")
    .upsert(
      {
        user_id: userId,
        description: data.description,
        city: data.city,
        neighborhood: data.neighborhood ?? "",
        cep: data.cep ?? null,
        state: data.state ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        whatsapp: data.whatsapp,
        instagram: data.instagram ?? null,
        is_active: true,
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();

  if (error || !profile) {
    // Rollback role change if profile creation fails
    await supabase
      .from("users")
      .update({ role: "CLIENT" as UserRole, updated_at: new Date().toISOString() })
      .eq("id", userId);
    return { error, profileId: null };
  }

  // Create default business hours (Mon-Fri 08:00-18:00, Sat-Sun closed)
  const defaultHours = getDefaultBusinessHours().map((h) => ({
    provider_id: profile.id,
    day_of_week: h.day_of_week,
    open_time: h.is_closed ? null : h.open_time,
    close_time: h.is_closed ? null : h.close_time,
    is_closed: h.is_closed,
  }));

  await supabase
    .from("business_hours")
    .upsert(defaultHours, { onConflict: "provider_id,day_of_week" });

  return { error: null, profileId: profile.id };
}

export async function updateProviderProfile(
  supabase: SupabaseClient,
  profileId: string,
  data: {
    description?: string;
    city?: string;
    neighborhood?: string;
    cep?: string;
    state?: string;
    latitude?: number | null;
    longitude?: number | null;
    whatsapp?: string;
    instagram?: string | null;
    is_active?: boolean;
  }
) {
  const { error } = await supabase
    .from("provider_profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", profileId);
  return { error };
}

export async function setProviderCategories(
  supabase: SupabaseClient,
  providerId: string,
  categoryIds: string[]
) {
  // Delete existing
  await supabase
    .from("provider_categories")
    .delete()
    .eq("provider_id", providerId);

  // Insert new
  if (categoryIds.length > 0) {
    const { error } = await supabase.from("provider_categories").insert(
      categoryIds.map((categoryId) => ({
        provider_id: providerId,
        category_id: categoryId,
      }))
    );
    return { error };
  }

  return { error: null };
}

// ============================================
// CATEGORY MUTATIONS
// ============================================

export async function createCustomCategory(
  supabase: SupabaseClient,
  name: string
) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Find "Outros" parent category
  const { data: outrosParent } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "outros-servicos")
    .single();

  // Try to insert the new category
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      parent_id: outrosParent?.id ?? null,
    })
    .select("id, name, slug")
    .single();

  // If slug conflict, return the existing category
  if (error && error.code === "23505") {
    const { data: existing } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();
    return { data: existing, error: null };
  }

  return { data, error };
}

// ============================================
// PORTFOLIO MUTATIONS
// ============================================

const MAX_PORTFOLIO_IMAGES = 10;

export async function uploadPortfolioImage(
  supabase: SupabaseClient,
  providerId: string,
  userId: string,
  file: File
) {
  // Check limit
  const { count } = await supabase
    .from("portfolio_images")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId);

  if ((count ?? 0) >= MAX_PORTFOLIO_IMAGES) {
    return { error: { message: `Limite de ${MAX_PORTFOLIO_IMAGES} imagens atingido.` } };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("portfolio")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from("portfolio").getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("portfolio_images").insert({
    provider_id: providerId,
    image_url: publicUrl,
  });

  return { error: dbError };
}

export async function deletePortfolioImage(
  supabase: SupabaseClient,
  imageId: string,
  imageUrl: string
) {
  // Extract path from URL
  const urlParts = imageUrl.split("/portfolio/");
  const filePath = urlParts[urlParts.length - 1];

  if (filePath) {
    await supabase.storage.from("portfolio").remove([filePath]);
  }

  const { error } = await supabase
    .from("portfolio_images")
    .delete()
    .eq("id", imageId);

  return { error };
}

// ============================================
// FAVORITE MUTATIONS
// ============================================

export async function toggleFavorite(
  supabase: SupabaseClient,
  userId: string,
  providerId: string
) {
  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    return { isFavorited: false, error };
  } else {
    const { error } = await supabase.from("favorites").insert({
      user_id: userId,
      provider_id: providerId,
    });
    return { isFavorited: true, error };
  }
}

// ============================================
// REVIEW MUTATIONS
// ============================================

export async function createReview(
  supabase: SupabaseClient,
  providerId: string,
  clientId: string,
  rating: number,
  comment: string | null
) {
  const { error } = await supabase.from("reviews").insert({
    provider_id: providerId,
    client_id: clientId,
    rating,
    comment,
  });
  return { error };
}

export async function createReviewReply(
  supabase: SupabaseClient,
  reviewId: string,
  providerId: string,
  content: string
) {
  const { error } = await supabase.from("review_replies").upsert(
    {
      review_id: reviewId,
      provider_id: providerId,
      content,
    },
    { onConflict: "review_id" }
  );
  return { error };
}
