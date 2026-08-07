import { Linking, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

// Porta do AdBanner do PWA. Igual ao web, nao renderiza nada sem imageUrl —
// o slot existe para quando houver campanha configurada.
type AdBannerProps = {
  imageUrl?: string;
  href?: string;
  alt?: string;
  className?: string;
};

export function AdBanner({ imageUrl, href, alt = "Anúncio", className }: AdBannerProps) {
  if (!imageUrl) return null;

  const content = (
    <View
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border",
        className
      )}
    >
      <Image
        source={{ uri: imageUrl }}
        accessibilityLabel={alt}
        contentFit="cover"
        style={{ width: "100%", aspectRatio: 4 }}
      />
      <View className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5">
        <Text className="text-[10px] text-white/70">Anúncio</Text>
      </View>
    </View>
  );

  if (href) {
    return <Pressable onPress={() => Linking.openURL(href)}>{content}</Pressable>;
  }

  return content;
}
