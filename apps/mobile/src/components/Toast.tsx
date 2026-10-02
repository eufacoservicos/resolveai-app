import { Text, fontSize, letterSpacing, useShadow, useTheme } from "@eufaco/design-system/native";
import { CircleAlert, CircleCheck, Info } from "lucide-react-native";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ColorToken } from "@eufaco/design-system";

type ToastTone = "success" | "danger" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Ação à direita, como o "Desfazer" do protótipo. */
  action?: { label: string; onPress: () => void };
}

interface ToastApi {
  show: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const tones: Record<ToastTone, { bg: ColorToken; fg: ColorToken }> = {
  success: { bg: "successSoft", fg: "success" },
  danger: { bg: "dangerSoft", fg: "danger" },
  info: { bg: "primarySoft", fg: "primaryStrong" },
};

/** Quanto tempo o aviso fica na tela antes de sumir sozinho. */
const DURATION_MS = 4000;

/**
 * Avisos passageiros (`C / Toast`), ancorados acima da tab bar.
 * Confirmam o que acabou de acontecer sem interromper: o diálogo é para
 * decidir, o toast é para informar.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const toastShadow = useShadow("sheet");
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const show = useCallback((options: ToastOptions) => {
    setToast(options);
    setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  const api = useMemo<ToastApi>(() => ({ show }), [show]);
  const tone = tones[toast?.tone ?? "success"];
  const Icon =
    toast?.tone === "danger" ? CircleAlert : toast?.tone === "info" ? Info : CircleCheck;

  return (
    <ToastContext.Provider value={api}>
      {children}

      {toast ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: Math.max(insets.bottom, 12) + 82,
          }}
        >
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 13,
                borderRadius: radii.md,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
              toastShadow,
            ]}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: colors[tone.bg],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={17} color={colors[tone.fg]} />
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="titleSm" style={{ letterSpacing: letterSpacing.hairline }}>
                {toast.title}
              </Text>
              {toast.description ? (
                <Text
                  color="textSecondary"
                  style={{ fontSize: fontSize.note, lineHeight: fontSize.note * 1.4 }}
                >
                  {toast.description}
                </Text>
              ) : null}
            </View>

            {toast.action ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={toast.action.label}
                onPress={() => {
                  toast.action?.onPress();
                  setToast(null);
                }}
                hitSlop={8}
              >
                <Text variant="label" color="primaryStrong">
                  {toast.action.label}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast foi chamado fora do ToastProvider.");
  return api;
}
