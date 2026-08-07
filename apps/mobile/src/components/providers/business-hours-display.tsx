import { useState } from "react";
import { Pressable, View } from "react-native";
import { ChevronDown, Clock } from "lucide-react-native";
import {
  DAYS_OF_WEEK,
  formatTimeRange,
  isProviderOpenNow,
} from "@resolveai/shared/business-hours";
import type { BusinessHours } from "@resolveai/shared/supabase/types";
import { Text, Muted } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

// Porta do BusinessHoursDisplay do PWA: colapsado mostra so hoje; expandido, a
// semana inteira com o dia atual destacado.
export function BusinessHoursDisplay({ hours }: { hours: BusinessHours[] }) {
  const [expanded, setExpanded] = useState(false);

  if (hours.length === 0) return null;

  const { isOpen, label } = isProviderOpenNow(hours);

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const todayDayOfWeek = now.getDay();
  const todayHours = hours.find((h) => h.day_of_week === todayDayOfWeek);
  const todayLabel = DAYS_OF_WEEK.find((d) => d.value === todayDayOfWeek);

  const todayTimeText = todayHours
    ? formatTimeRange(todayHours.open_time, todayHours.close_time, todayHours.is_closed)
    : "Fechado";

  return (
    <View className="overflow-hidden rounded-2xl border border-white/10 bg-card/60">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center gap-3 px-4 py-4 active:bg-white/[0.03]"
      >
        <View className="h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Clock size={14} color="#22d3ee" />
        </View>
        <View className="flex-1 flex-row items-center gap-2">
          <View className="flex-row items-center gap-1.5">
            <View
              className={cn(
                "h-2 w-2 rounded-full",
                isOpen ? "bg-emerald-400" : "bg-muted-foreground/40"
              )}
            />
            <Text
              className={cn(
                "text-sm font-bold",
                isOpen ? "text-emerald-400" : "text-muted-foreground"
              )}
            >
              {label}
            </Text>
          </View>
          <Muted>·</Muted>
          <Muted numberOfLines={1} className="flex-1 text-xs">
            {todayLabel?.short}: {todayTimeText}
          </Muted>
        </View>
        <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
          <ChevronDown size={16} color="#8891a4" />
        </View>
      </Pressable>

      {expanded && (
        <View className="gap-1 border-t border-white/5 px-4 py-3">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = hours.find((h) => h.day_of_week === day.value);
            const isToday = day.value === todayDayOfWeek;

            return (
              <View
                key={day.value}
                className={cn(
                  "flex-row items-center justify-between rounded-xl px-3 py-1.5",
                  isToday && "bg-primary/10"
                )}
              >
                <Text
                  className={cn(
                    "text-xs",
                    isToday ? "font-bold text-primary" : "text-muted-foreground"
                  )}
                >
                  {day.short}
                </Text>
                <Text
                  className={cn(
                    "text-xs",
                    isToday && "font-bold",
                    !dayHours || dayHours.is_closed
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  {dayHours
                    ? formatTimeRange(
                        dayHours.open_time,
                        dayHours.close_time,
                        dayHours.is_closed
                      )
                    : "Fechado"}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
