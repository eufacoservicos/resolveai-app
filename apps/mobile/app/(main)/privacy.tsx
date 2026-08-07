import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PRIVACY_POLICY } from "@resolveai/shared/legal";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { LegalDocument } from "@/components/ui/legal-document";
import { useTabBarPadding } from "@/lib/layout";

export default function PrivacyScreen() {
  const tabBarPad = useTabBarPadding();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[280px]">
        <AmbientBg variant="violet" />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: tabBarPad }}
        showsVerticalScrollIndicator={false}
      >
        <LegalDocument document={PRIVACY_POLICY} />
      </ScrollView>
    </SafeAreaView>
  );
}
