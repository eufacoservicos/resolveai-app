import { DAYS_OF_WEEK, getDefaultBusinessHours, setBusinessHours, type BusinessHours } from "@eufaco/shared";
import { Button, Card, Text, Toggle, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { Calendar, Clock3 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

type DayHours = Pick<BusinessHours, "day_of_week" | "open_time" | "close_time" | "is_closed">;

/** Aceita 8, 08, 0800 e 08:00; devolve HH:MM ou null. */
function normalizeTime(input: string): string | null {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return null;

  const hours = Number(digits.slice(0, 2).padEnd(2, "0"));
  const minutes = digits.length > 2 ? Number(digits.slice(2).padEnd(2, "0")) : 0;

  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function BusinessHoursScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { provider, loading: accountLoading } = useProviderAccount();

  const [hours, setHours] = useState<DayHours[]>(getDefaultBusinessHours());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;
    const existing = provider.business_hours ?? [];
    if (existing.length === 0) return;

    setHours(
      DAYS_OF_WEEK.map((day) => {
        const found = existing.find((h) => h.day_of_week === day.value);
        return (
          found ?? { day_of_week: day.value, open_time: null, close_time: null, is_closed: true }
        );
      }),
    );
  }, [provider]);

  const patchDay = (dayOfWeek: number, patch: Partial<DayHours>) => {
    setHours((prev) => prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, ...patch } : h)));
  };

  /** Copia o primeiro dia útil aberto para os demais dias úteis. */
  const applyWeekdays = () => {
    const template = hours.find((h) => h.day_of_week >= 1 && h.day_of_week <= 5 && !h.is_closed);
    if (!template) return;

    setHours((prev) =>
      prev.map((h) =>
        h.day_of_week >= 1 && h.day_of_week <= 5
          ? { ...h, open_time: template.open_time, close_time: template.close_time, is_closed: false }
          : h,
      ),
    );
  };

  const submit = async () => {
    if (!provider) return;

    const invalid = hours.find(
      (h) => !h.is_closed && (!h.open_time || !h.close_time || h.open_time >= h.close_time),
    );
    if (invalid) {
      const day = DAYS_OF_WEEK.find((d) => d.value === invalid.day_of_week);
      setError(`Confira o horário de ${day?.label ?? "um dos dias"}: a abertura precisa vir antes do fechamento.`);
      return;
    }

    setSaving(true);
    setError(null);

    const { error: saveError } = await setBusinessHours(supabase, provider.id, hours);
    setSaving(false);

    if (saveError) {
      setError("Não foi possível salvar. Verifique sua conexão e tente de novo.");
      return;
    }
    router.back();
  };

  if (sessionLoading || accountLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Horários" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Horários" />
        <SignInPrompt
          title="Seus horários"
          description="Entre com sua conta de profissional para definir quando você atende."
        />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Horários" />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: layout.screenPadding }}>
          <Card style={{ alignItems: "center", gap: spacing[2], paddingVertical: spacing[8] }}>
            <Text variant="title">Você ainda não tem perfil profissional</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Crie seu perfil para definir seus horários.
            </Text>
          </Card>
        </View>
      </View>
    );
  }

  const timeInput = (day: DayHours, field: "open_time" | "close_time") => (
    <View
      style={{
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: 8,
        backgroundColor: colors.surface2,
      }}
    >
      <TextInput
        value={day[field] ?? ""}
        onChangeText={(text) => patchDay(day.day_of_week, { [field]: text })}
        onBlur={() => patchDay(day.day_of_week, { [field]: normalizeTime(day[field] ?? "") })}
        placeholder="08:00"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={5}
        accessibilityLabel={`${field === "open_time" ? "Abre" : "Fecha"} às`}
        style={{ color: colors.textSecondary, fontSize: 12, minWidth: 44, textAlign: "center" }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Horários" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[4],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[2] + 2,
            backgroundColor: colors.primarySoft,
            borderRadius: radii.md,
            padding: spacing[3] + 1,
          }}
        >
          <Clock3 size={17} color={colors.primaryStrong} />
          <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
            Clientes veem se você está aberto agora direto no seu card.
          </Text>
        </View>

        <View style={{ gap: spacing[2] }}>
          {hours.map((day) => {
            const label = DAYS_OF_WEEK.find((d) => d.value === day.day_of_week)?.label ?? "";
            return (
              <Card
                key={day.day_of_week}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing[3], paddingVertical: 11 }}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text variant="bodyStrong" color={day.is_closed ? "textMuted" : "textPrimary"}>
                    {label}
                  </Text>
                  {day.is_closed ? (
                    <Text variant="caption" color="textMuted">
                      Fechado
                    </Text>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1] + 2 }}>
                      {timeInput(day, "open_time")}
                      {timeInput(day, "close_time")}
                    </View>
                  )}
                </View>

                <Toggle
                  accessibilityLabel={`Atende ${label}`}
                  value={!day.is_closed}
                  onValueChange={(open) =>
                    patchDay(day.day_of_week, {
                      is_closed: !open,
                      open_time: open ? (day.open_time ?? "08:00") : day.open_time,
                      close_time: open ? (day.close_time ?? "18:00") : day.close_time,
                    })
                  }
                />
              </Card>
            );
          })}
        </View>

        {error ? (
          <Card variant="plain" style={{ backgroundColor: colors.dangerSoft }}>
            <Text variant="bodyStrong" color="danger">
              {error}
            </Text>
          </Card>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aplicar o mesmo horário de segunda a sexta"
          onPress={applyWeekdays}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing[1] + 3,
            paddingVertical: 13,
            borderRadius: radii.md,
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.borderStrong,
          }}
        >
          <Calendar size={15} color={colors.textPrimary} />
          <Text variant="label">Aplicar segunda a sexta</Text>
        </Pressable>

        <Button label="Salvar horários" loading={saving} onPress={() => void submit()} />
      </ScrollView>
    </View>
  );
}
