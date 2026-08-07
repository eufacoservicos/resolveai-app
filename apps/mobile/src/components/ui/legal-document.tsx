import { Fragment } from "react";
import { View } from "react-native";
import type { LegalDocument as LegalDocumentData } from "@resolveai/shared/legal";
import { Text, Muted } from "@/components/ui/text";

// Renderiza o conteudo legal de @resolveai/shared. Trechos entre ** ** viram
// negrito com a cor de foreground, como os <strong> do PWA.
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <Muted className="leading-relaxed">
      {parts.map((part, i) => {
        const bold = part.startsWith("**") && part.endsWith("**");
        return (
          <Fragment key={i}>
            {bold ? (
              <Text className="text-sm font-semibold">{part.slice(2, -2)}</Text>
            ) : (
              part
            )}
          </Fragment>
        );
      })}
    </Muted>
  );
}

export function LegalDocument({ document }: { document: LegalDocumentData }) {
  return (
    <View className="gap-5">
      <View>
        <Text className="text-3xl font-black tracking-tight">
          {document.title}
        </Text>
        <Muted className="mt-2 text-xs">
          Última atualização: {document.updatedAt}
        </Muted>
      </View>

      <View className="gap-6 rounded-3xl border border-white/10 bg-card/60 p-6">
        {document.sections.map((section) => (
          <View key={section.title} className="gap-2.5">
            <Text className="text-base font-bold text-foreground">
              {section.title}
            </Text>
            {section.blocks.map((block, i) =>
              block.type === "p" ? (
                <RichText key={i} text={block.text} />
              ) : (
                <View key={i} className="gap-1 pl-4">
                  {block.items.map((item, j) => (
                    <View key={j} className="flex-row gap-2">
                      <Text className="text-sm text-primary">•</Text>
                      <View className="flex-1">
                        <RichText text={item} />
                      </View>
                    </View>
                  ))}
                </View>
              )
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
