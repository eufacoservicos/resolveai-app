"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCpf } from "@/lib/cpf";
import { formatCnpj } from "@/lib/cnpj";
import { Briefcase, User } from "lucide-react";

export type ProviderType = "individual" | "company";
export type DocumentType = "cpf" | "cnpj";

export function getDocumentType(providerType: ProviderType): DocumentType {
  return providerType === "individual" ? "cpf" : "cnpj";
}

interface DocumentInputProps {
  providerType: ProviderType;
  onProviderTypeChange: (type: ProviderType) => void;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DocumentInput({
  providerType,
  onProviderTypeChange,
  value,
  onChange,
  className,
}: DocumentInputProps) {
  const isIndividual = providerType === "individual";
  const maxDigits = isIndividual ? 11 : 14;
  const maxLength = isIndividual ? 14 : 18;
  const placeholder = isIndividual ? "000.000.000-00" : "00.000.000/0000-00";
  const formatter = isIndividual ? formatCpf : formatCnpj;
  const docLabel = isIndividual ? "CPF" : "CNPJ";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
    onChange(formatter(digits));
  }

  function handleTypeChange(type: ProviderType) {
    onProviderTypeChange(type);
    onChange("");
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Tipo de prestador *</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("individual")}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 transition-all",
              isIndividual
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-border"
            )}
          >
            <User className={cn("h-4 w-4 shrink-0", isIndividual ? "text-primary" : "text-muted-foreground")} />
            <div className="text-left">
              <p className={cn("text-xs font-semibold", isIndividual ? "text-primary" : "text-foreground")}>
                Autônomo
              </p>
              <p className="text-[10px] text-muted-foreground">Pessoa física</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("company")}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 transition-all",
              !isIndividual
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-border"
            )}
          >
            <Briefcase className={cn("h-4 w-4 shrink-0", !isIndividual ? "text-primary" : "text-muted-foreground")} />
            <div className="text-left">
              <p className={cn("text-xs font-semibold", !isIndividual ? "text-primary" : "text-foreground")}>
                Empresa
              </p>
              <p className="text-[10px] text-muted-foreground">Pessoa jurídica</p>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{docLabel} *</Label>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={maxLength}
          className="h-11 rounded-lg border-border"
        />
      </div>
    </div>
  );
}
