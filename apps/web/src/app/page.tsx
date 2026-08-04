import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "eufaço! - Encontre Profissionais de Serviços Locais",
  description:
    "Conecte-se com prestadores de serviços verificados na sua região. Eletricistas, encanadores, pintores e mais. Baixe o app grátis.",
  openGraph: {
    title: "eufaço! - Encontre Profissionais de Serviços Locais",
    description:
      "Conecte-se com prestadores de serviços verificados na sua região. Baixe o app grátis.",
    url: "https://www.eufacooservico.com.br",
  },
  alternates: {
    canonical: "https://www.eufacooservico.com.br",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é o eufaço!?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O eufaço! é um aplicativo que conecta você a prestadores de serviços locais. Encontre eletricistas, encanadores, pintores e dezenas de outros profissionais na sua região, veja avaliações e entre em contato diretamente pelo WhatsApp.",
      },
    },
    {
      "@type": "Question",
      name: "O eufaço! é gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! O uso do app é totalmente gratuito para clientes e prestadores. Você pode buscar profissionais, ver perfis e entrar em contato sem nenhum custo.",
      },
    },
    {
      "@type": "Question",
      name: "Como encontro um profissional?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Baixe o app, use a busca ou navegue pelas categorias. Você pode filtrar por localização, tipo de serviço e avaliação. Ao encontrar o profissional ideal, clique no botão do WhatsApp para entrar em contato direto.",
      },
    },
    {
      "@type": "Question",
      name: "Como me cadastro como prestador?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'Baixe o app e clique em "Quero oferecer serviços" na tela de registro. Preencha seus dados, selecione suas categorias de serviço e informe seu WhatsApp. Após criar a conta, complete seu perfil com fotos do portfólio e horário de funcionamento.',
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o contato com o profissional?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O contato é feito diretamente pelo WhatsApp do prestador. Ao clicar no botão de contato no perfil do profissional, uma conversa é iniciada automaticamente. Não há intermediários.",
      },
    },
  ],
};

export default function RootPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingPage />
    </>
  );
}
