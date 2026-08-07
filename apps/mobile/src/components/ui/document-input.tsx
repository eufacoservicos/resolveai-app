import { Pressable, View } from "react-native";
import { Briefcase, User } from "lucide-react-native";
import { formatCpf } from "@resolveai/shared/validators/cpf";
import { formatCnpj } from "@resolveai/shared/validators/cnpj";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text, Muted } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

export type ProviderType = "individual" | "company";
export type DocumentType = "cpf" | "cnpj";

export function getDocumentType(providerType: ProviderType): DocumentType {
  return providerType === "individual" ? "cpf" : "cnpj";
}

type Props = {
  providerType: ProviderType;
  onProviderTypeChange: (type: ProviderType) => void;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function DocumentInput({
  providerType,
  onProviderTypeChange,
  value,
  onChange,
  className,
}: Props) {
  const isIndividual = providerType === "individual";
  const maxDigits = isIndividual ? 11 : 14;
  const maxLength = isIndividual ? 14 : 18;
  const placeholder = isIndividual ? "000.000.000-00" : "00.000.000/0000-00";
  const formatter = isIndividual ? formatCpf : formatCnpj;
  const docLabel = isIndividual ? "CPF" : "CNPJ";

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, maxDigits);
    onChange(formatter(digits));
  }

  function handleTypeChange(type: ProviderType) {
    onProviderTypeChange(type);
    onChange("");
  }

  return (
    <View className={cn("gap-3", className)}>
      <View className="gap-1.5">
        <Label className="text-sm font-medium">Tipo de prestador *</Label>
        <View className="flex-row gap-2">
          <TypeOption
            active={isIndividual}
            icon={User}
            title="Autônomo"
            subtitle="Pessoa física"
            onPress={() => handleTypeChange("individual")}
          />
          <TypeOption
            active={!isIndividual}
            icon={Briefcase}
            title="Empresa"
            subtitle="Pessoa jurídica"
            onPress={() => handleTypeChange("company")}
          />
        </View>
      </View>

      <View className="gap-1.5">
        <Label className="text-sm font-medium">{docLabel} *</Label>
        <Input
          placeholder={placeholder}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={maxLength}
        />
      </View>
    </View>
  );
}

function TypeOption({
  active,
  icon: Icon,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  icon: typeof User;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-1 flex-row items-center gap-2 rounded-lg border-2 px-3 py-2.5",
        active ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <Icon size={16} color={active ? "#22d3ee" : "#8891a4"} />
      <View>
        <Text
          className={cn("text-xs font-semibold", active && "text-primary")}
        >
          {title}
        </Text>
        <Muted className="text-[10px]">{subtitle}</Muted>
      </View>
    </Pressable>
  );
}
