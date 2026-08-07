import { Modal, Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { X } from "lucide-react-native";
import { Text, Muted } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

// Equivalente nativo do Dialog (Radix) do PWA: overlay preto/50, card
// centralizado com max-w-sm e botao de fechar no canto.
type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  /** false remove o botao de fechar e o toque no overlay (modal bloqueante) */
  dismissible?: boolean;
};

export function Dialog({
  open,
  onOpenChange,
  children,
  dismissible = true,
}: DialogProps) {
  const close = () => onOpenChange?.(false);

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissible ? close : () => {}}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 p-6"
        onPress={dismissible ? close : undefined}
      >
        {/* Pressable interno absorve o toque para nao fechar ao tocar no card */}
        <Pressable
          className="w-full max-w-sm gap-4 rounded-xl border border-border bg-popover p-5"
          onPress={(e) => e.stopPropagation()}
        >
          {children}
          {dismissible && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={close}
              hitSlop={8}
              className="absolute right-4 top-4 rounded-sm p-1 active:opacity-60"
            >
              <X size={16} color="#8891a4" />
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <View className={cn("gap-1 pr-6", className)}>{children}</View>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <Text className="text-lg font-semibold">{children}</Text>;
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <Muted>{children}</Muted>;
}
