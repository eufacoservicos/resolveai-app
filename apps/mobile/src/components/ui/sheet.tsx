import { Modal, Pressable, ScrollView, View } from "react-native";
import type { ReactNode } from "react";
import { X } from "lucide-react-native";
import { Text } from "@/components/ui/text";

// Bottom sheet do PWA (o painel de filtros da busca), como Modal nativo.
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
};

export function Sheet({ open, onOpenChange, title, children }: Props) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          className="max-h-[80%] rounded-t-2xl bg-card p-5"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-lg font-semibold">{title}</Text>
            <Pressable
              onPress={() => onOpenChange(false)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            >
              <X size={20} color="#f5f7fb" />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
