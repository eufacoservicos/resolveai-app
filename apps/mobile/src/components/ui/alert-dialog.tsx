import { View } from "react-native";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

// Equivalente do AlertDialog do PWA: confirmacao destrutiva com acao e cancelar.
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  actionLabel: string;
  cancelLabel?: string;
  onAction: () => void;
  loading?: boolean;
  destructive?: boolean;
};

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  cancelLabel = "Cancelar",
  onAction,
  loading,
  destructive,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <View className="gap-2">
        <Button
          variant={destructive ? "destructive" : "default"}
          onPress={onAction}
          loading={loading}
        >
          {actionLabel}
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onPress={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
      </View>
    </Dialog>
  );
}
