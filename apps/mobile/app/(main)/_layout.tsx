import { Redirect, Tabs } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { Home, Search, Heart, User } from "lucide-react-native";
import { useAuth } from "@/lib/auth-provider";

export default function MainLayout() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="become-provider" options={{ href: null }} />
      <Tabs.Screen name="provider/[id]" options={{ href: null }} />
      <Tabs.Screen name="provider/edit" options={{ href: null }} />
      <Tabs.Screen name="provider/portfolio" options={{ href: null }} />
    </Tabs>
  );
}
