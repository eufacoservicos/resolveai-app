import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { Star, MapPin } from "lucide-react-native";
import { Text, Muted } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@resolveai/shared/cn";

export type ProviderCardData = {
  id: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
  categories: { id: string; name: string; slug: string }[];
  description?: string | null;
  city: string;
  state?: string | null;
  average_rating: number | null;
  review_count: number;
  is_verified?: boolean;
  featured?: boolean;
};

type Props = {
  provider: ProviderCardData;
  className?: string;
};

export function ProviderCard({ provider, className }: Props) {
  const rating = provider.average_rating?.toFixed(1);

  return (
    <Link href={`/(main)/provider/${provider.id}` as `/(main)/provider/${string}`} asChild>
      <Pressable
        className={cn(
          "flex-row gap-3 rounded-xl border border-border bg-background p-3 active:opacity-80",
          className
        )}
      >
        <Avatar
          src={provider.user.avatar_url}
          fallback={provider.user.full_name}
          size={64}
        />
        <View className="flex-1 justify-center gap-1">
          <View className="flex-row items-center gap-1">
            <Text className="flex-1 text-base font-semibold" numberOfLines={1}>
              {provider.user.full_name}
            </Text>
            {provider.featured && (
              <Badge variant="secondary" className="bg-emerald-100">
                <Text className="text-[10px] font-bold uppercase text-emerald-700">
                  Top
                </Text>
              </Badge>
            )}
          </View>

          {provider.categories.length > 0 && (
            <Muted className="text-xs" numberOfLines={1}>
              {provider.categories.map((c) => c.name).join(" · ")}
            </Muted>
          )}

          <View className="flex-row items-center gap-3">
            {rating && (
              <View className="flex-row items-center gap-1">
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text className="text-xs font-medium">
                  {rating}
                  <Text className="text-muted-foreground">
                    {" "}
                    ({provider.review_count})
                  </Text>
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color="#64748b" />
              <Muted className="text-xs" numberOfLines={1}>
                {provider.city}
                {provider.state ? `, ${provider.state}` : ""}
              </Muted>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
