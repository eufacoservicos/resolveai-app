import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { Text, Muted } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

// Equivalente nativo do Select (Radix) do PWA: o trigger abre uma lista modal
// ancorada na base da tela, com suporte a grupos rotulados.
export type SelectOption = { value: string; label: string };
export type SelectGroup = { label: string; options: SelectOption[] };

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  /** Opcoes soltas, exibidas antes dos grupos */
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  title?: string;
  className?: string;
  textClassName?: string;
};

export function Select({
  value,
  onValueChange,
  options = [],
  groups = [],
  placeholder = "Selecionar",
  title,
  className,
  textClassName,
}: Props) {
  const [open, setOpen] = useState(false);

  const allOptions = [...options, ...groups.flatMap((g) => g.options)];
  const selected = allOptions.find((o) => o.value === value);

  function handleSelect(next: string) {
    onValueChange(next);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          "flex-row items-center gap-1 rounded-xl border border-border bg-card px-3",
          className
        )}
      >
        <Text className={cn("flex-1 text-sm", textClassName)} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={14} color="#8891a4" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="max-h-[80%] rounded-t-2xl bg-card p-5"
            onPress={(e) => e.stopPropagation()}
          >
            {title && (
              <Text className="mb-3 text-lg font-semibold">{title}</Text>
            )}
            <ScrollView>
              {options.map((opt) => (
                <SelectRow
                  key={opt.value}
                  option={opt}
                  selected={opt.value === value}
                  onPress={() => handleSelect(opt.value)}
                />
              ))}

              {groups.map((group) => (
                <View key={group.label}>
                  <Muted className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider">
                    {group.label}
                  </Muted>
                  {group.options.map((opt) => (
                    <SelectRow
                      key={opt.value}
                      option={opt}
                      selected={opt.value === value}
                      onPress={() => handleSelect(opt.value)}
                      indented
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function SelectRow({
  option,
  selected,
  onPress,
  indented,
}: {
  option: SelectOption;
  selected: boolean;
  onPress: () => void;
  indented?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-between rounded-lg px-3 py-2.5 active:bg-muted",
        indented && "pl-6"
      )}
    >
      <Text className={cn("text-sm", selected && "font-medium text-primary")}>
        {option.label}
      </Text>
      {selected && <Check size={16} color="#22d3ee" />}
    </Pressable>
  );
}
