export type UserRole = "CLIENT" | "PROVIDER";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  description: string;
  neighborhood: string;
  city: string;
  cep: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string;
  instagram: string | null;
  is_active: boolean;
  is_verified: boolean;
  verified_at: string | null;
  verification_status: "none" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number;
  created_at: string;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export interface ProviderCategory {
  id: string;
  provider_id: string;
  category_id: string;
}

export interface PortfolioImage {
  id: string;
  provider_id: string;
  image_url: string;
  created_at: string;
}

export interface Review {
  id: string;
  provider_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
}

export interface VerificationDocument {
  id: string;
  provider_id: string;
  document_type: "identity" | "selfie";
  document_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface BusinessHours {
  id: string;
  provider_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface ProfileView {
  id: string;
  provider_id: string;
  viewer_id: string | null;
  created_at: string;
}

export interface WhatsAppClick {
  id: string;
  provider_id: string;
  clicker_id: string | null;
  created_at: string;
}

export interface ProviderStats {
  totalViews: number;
  totalClicks: number;
  viewsLast7Days: number;
  clicksLast7Days: number;
}

// Joined / computed types

export interface ProviderWithDetails extends ProviderProfile {
  user: Pick<User, "full_name" | "avatar_url">;
  categories: Category[];
  portfolio: PortfolioImage[];
  average_rating: number | null;
  review_count: number;
  business_hours: BusinessHours[];
  distance_km?: number | null;
}

export interface ReviewWithClient extends Review {
  client: Pick<User, "full_name" | "avatar_url">;
}
