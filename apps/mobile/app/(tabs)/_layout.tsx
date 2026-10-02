import { Tabs } from "expo-router";
import { Heart, House, LayoutGrid, Search, UserRound } from "lucide-react-native";
import { TabBar } from "@/components/TabBar";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: "Buscar", tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="categories"
        options={{ title: "Categorias", tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: "Favoritos", tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tabs>
  );
}
