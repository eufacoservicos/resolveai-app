import { useState } from "react";
import { View } from "react-native";
import { Clock } from "lucide-react-native";
import { toast } from "sonner-native";
import {
  DAYS_OF_WEEK,
  getDefaultBusinessHours,
} from "@resolveai/shared/business-hours";
import type { BusinessHours } from "@resolveai/shared/supabase/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimeInput, normalizeTime } from "@/components/ui/time-input";
import { Text, Muted } from "@/components/ui/text";

type DayHours = {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

type Props = {
  providerId: string;
  initialHours: BusinessHours[];
  onSaved?: () => void;
};

export function BusinessHoursEditor({
  providerId,
  initialHours,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);

  const defaultHours = getDefaultBusinessHours();
  const [hours, setHours] = useState<DayHours[]>(
    DAYS_OF_WEEK.map((day) => {
      const existing = initialHours.find((h) => h.day_of_week === day.value);
      const fallback = defaultHours.find((h) => h.day_of_week === day.value)!;
      return {
        day_of_week: day.value,
        open_time:
          existing?.open_time?.slice(0, 5) ?? fallback.open_time ?? "08:00",
        close_time:
          existing?.close_time?.slice(0, 5) ?? fallback.close_time ?? "18:00",
        is_closed: existing ? existing.is_closed : fallback.is_closed,
      };
    })
  );

  function updateDay(
    dayOfWeek: number,
    field: keyof DayHours,
    value: string | boolean
  ) {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h))
    );
  }

  function validate(): string | null {
    for (const h of hours) {
      if (h.is_closed) continue;
      const dayName = DAYS_OF_WEEK.find((d) => d.value === h.day_of_week)!.label;
      if (!h.open_time || !h.close_time) {
        return `${dayName}: preencha os horários de abertura e fechamento.`;
      }
      if (normalizeTime(h.close_time) <= normalizeTime(h.open_time)) {
        return `${dayName}: o horário de fechamento deve ser depois do de abertura.`;
      }
    }
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    const rows = hours.map((h) => ({
      provider_id: providerId,
      day_of_week: h.day_of_week,
      open_time: h.is_closed ? null : normalizeTime(h.open_time),
      close_time: h.is_closed ? null : normalizeTime(h.close_time),
      is_closed: h.is_closed,
    }));

    // Upsert para nao perder dados (constraint unica provider_id + day_of_week)
    const { error } = await supabase
      .from("business_hours")
      .upsert(rows, { onConflict: "provider_id,day_of_week" });

    if (error) {
      toast.error("Erro ao salvar horários.");
    } else {
      toast.success("Horários atualizados!");
      onSaved?.();
    }

    setLoading(false);
  }

  return (
    <View className="rounded-xl border border-border bg-card p-5">
      <View className="mb-4 flex-row items-center gap-2">
        <Clock size={20} color="#8891a4" />
        <Label className="text-base font-semibold">Horário de atendimento</Label>
      </View>

      <View className="gap-3">
        {hours.map((day) => {
          const dayInfo = DAYS_OF_WEEK.find((d) => d.value === day.day_of_week)!;
          return (
            <View
              key={day.day_of_week}
              className="gap-3 rounded-lg border border-border p-3"
            >
              <View className="flex-row items-center gap-3">
                <Text className="w-12 text-sm font-medium">{dayInfo.short}</Text>
                <Switch
                  checked={!day.is_closed}
                  onCheckedChange={(open) =>
                    updateDay(day.day_of_week, "is_closed", !open)
                  }
                  accessibilityLabel={`${dayInfo.label}: ${day.is_closed ? "fechado" : "aberto"}`}
                />
                {day.is_closed && <Muted>Fechado</Muted>}
              </View>

              {!day.is_closed && (
                <View className="flex-row items-center gap-2">
                  <TimeInput
                    value={day.open_time}
                    onChangeText={(v) => updateDay(day.day_of_week, "open_time", v)}
                  />
                  <Muted className="text-xs">às</Muted>
                  <TimeInput
                    value={day.close_time}
                    onChangeText={(v) =>
                      updateDay(day.day_of_week, "close_time", v)
                    }
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Button
        onPress={handleSave}
        loading={loading}
        className="mt-4 h-11 w-full"
      >
        Salvar horários
      </Button>
    </View>
  );
}
