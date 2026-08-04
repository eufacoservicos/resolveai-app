import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-foreground">eufaço!</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          App em migração para React Native
        </Text>
        <View className="mt-8 rounded-2xl bg-primary/10 px-4 py-2">
          <Text className="text-sm font-medium text-primary">
            Task 4: Expo bootstrap ✅
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
