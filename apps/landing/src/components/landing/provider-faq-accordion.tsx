"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ProviderFaqItem {
  question: string;
  answer: string;
}

interface ProviderFaqAccordionProps {
  items: ProviderFaqItem[];
}

export function ProviderFaqAccordion({
  items,
}: ProviderFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.question}>
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 text-left transition-all hover:border-primary/30 hover:bg-card/80 sm:p-5"
          >
            <span className="pr-4 text-sm font-medium sm:text-base">
              {item.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="px-4 py-3 text-sm leading-relaxed text-muted-foreground sm:px-5">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
