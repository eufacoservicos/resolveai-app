// Conteudo legal (termos e privacidade) extraido das paginas do PWA.
// Fica aqui, estruturado, para que web e mobile rendam exatamente o mesmo texto.
// Trechos entre ** ** sao renderizados em negrito pelo consumidor.

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = { title: string; blocks: LegalBlock[] };

export type LegalDocument = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

export const TERMS_OF_USE: LegalDocument = {
  title: "Termos de Uso",
  updatedAt: "Última atualização: Março de 2026",
  sections: [
    {
      title: "1. Aceitação dos Termos",
      blocks: [
        {
          type: "p",
          text: "Ao acessar e usar o eufaço!, você concorda com estes Termos de Uso. Se você não concorda com qualquer parte destes termos, não utilize a plataforma.",
        },
      ],
    },
    {
      title: "2. Descrição do Serviço",
      blocks: [
        {
          type: "p",
          text: "O eufaço! é uma plataforma que conecta clientes a prestadores de serviços locais. Atuamos como intermediários na divulgação dos serviços, mas não somos responsáveis pela execução dos mesmos.",
        },
      ],
    },
    {
      title: "3. Cadastro e Conta",
      blocks: [
        {
          type: "p",
          text: "Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.",
        },
      ],
    },
    {
      title: "4. Tipos de Conta",
      blocks: [
        {
          type: "p",
          text: "**Cliente:** Pode buscar, visualizar perfis de prestadores e deixar avaliações após a contratação de um serviço.",
        },
        {
          type: "p",
          text: "**Prestador:** Pode criar um perfil profissional, adicionar portfólio de trabalhos e receber contatos de clientes.",
        },
      ],
    },
    {
      title: "5. Avaliações",
      blocks: [
        {
          type: "p",
          text: "As avaliações devem refletir experiências reais. É proibido publicar conteúdo falso, ofensivo, discriminatório ou que viole direitos de terceiros. O eufaço! reserva-se o direito de remover avaliações que violem estes termos.",
        },
      ],
    },
    {
      title: "6. Natureza da Plataforma e Responsabilidades",
      blocks: [
        {
          type: "p",
          text: "O eufaço! é **exclusivamente um catálogo digital** de prestadores de serviços. A plataforma tem como única função facilitar a divulgação e a descoberta de profissionais, sem qualquer participação na negociação, execução ou supervisão dos serviços.",
        },
        {
          type: "p",
          text: "**Não existe vínculo** empregatício, de representação, de parceria ou de intermediação ativa entre o eufaço! e os prestadores ou clientes cadastrados.",
        },
        {
          type: "p",
          text: "O contato e a contratação são realizados **diretamente entre as partes**, por meio dos canais de comunicação disponibilizados no perfil do prestador (ex.: WhatsApp). O eufaço! **não se responsabiliza** por:",
        },
        {
          type: "list",
          items: [
            "Qualidade, prazo ou resultado dos serviços prestados;",
            "Acordos financeiros, preços ou formas de pagamento;",
            "Danos materiais, morais ou de qualquer natureza decorrentes da relação entre cliente e prestador;",
            "Veracidade das informações fornecidas pelos usuários em seus perfis;",
            "Eventuais disputas, prejuízos ou conflitos entre as partes.",
          ],
        },
        {
          type: "p",
          text: "Ao utilizar a plataforma, você reconhece e aceita que toda e qualquer decisão de contratação é de sua exclusiva responsabilidade.",
        },
      ],
    },
    {
      title: "7. Propriedade Intelectual",
      blocks: [
        {
          type: "p",
          text: "Todo o conteúdo da plataforma (design, textos, logotipos e código) é de propriedade do eufaço!. As imagens de portfólio são de propriedade dos prestadores que as enviaram.",
        },
      ],
    },
    {
      title: "8. Encerramento de Conta",
      blocks: [
        {
          type: "p",
          text: "O eufaço! pode suspender ou encerrar contas que violem estes termos ou que apresentem comportamento abusivo, sem aviso prévio.",
        },
      ],
    },
    {
      title: "9. Alterações nos Termos",
      blocks: [
        {
          type: "p",
          text: "Podemos atualizar estes termos a qualquer momento. Alterações significativas serão comunicadas através da plataforma. O uso continuado após as alterações implica na aceitação dos novos termos.",
        },
      ],
    },
    {
      title: "10. Contato",
      blocks: [
        {
          type: "p",
          text: "Para dúvidas sobre estes Termos de Uso, entre em contato através do suporte disponível na plataforma.",
        },
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  title: "Política de Privacidade",
  updatedAt: "Última atualização: Janeiro de 2026",
  sections: [
    {
      title: "1. Informações que Coletamos",
      blocks: [
        {
          type: "p",
          text: "Ao utilizar o eufaço!, coletamos as seguintes informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):",
        },
        {
          type: "list",
          items: [
            "Nome completo e endereço de email",
            "Foto de perfil (opcional)",
            "Número de WhatsApp (apenas para prestadores de serviço)",
            "Bairro de atuação (apenas para prestadores)",
            "Imagens de portfólio (apenas para prestadores)",
            "Avaliações e comentários publicados",
          ],
        },
      ],
    },
    {
      title: "2. Base Legal para o Tratamento",
      blocks: [
        {
          type: "p",
          text: "O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD:",
        },
        {
          type: "list",
          items: [
            "**Consentimento:** Fornecido no momento do cadastro na plataforma",
            "**Execução de contrato:** Necessário para a prestação dos serviços da plataforma",
            "**Legítimo interesse:** Para melhorar a experiência do usuário e a segurança da plataforma",
          ],
        },
      ],
    },
    {
      title: "3. Como Utilizamos suas Informações",
      blocks: [
        {
          type: "list",
          items: [
            "Criar e gerenciar sua conta na plataforma",
            "Exibir perfis de prestadores para clientes interessados",
            "Facilitar o contato entre clientes e prestadores via WhatsApp",
            "Exibir avaliações e classificações dos prestadores",
            "Melhorar a experiência do usuário na plataforma",
          ],
        },
      ],
    },
    {
      title: "4. Compartilhamento de Dados",
      blocks: [
        { type: "p", text: "Suas informações podem ser compartilhadas com:" },
        {
          type: "list",
          items: [
            "**Outros usuários:** Nome, foto e informações do perfil profissional são visíveis publicamente para usuários autenticados",
            "**Prestadores de infraestrutura:** Utilizamos serviços da Supabase para armazenamento de dados e autenticação, e da Vercel para hospedagem",
          ],
        },
        {
          type: "p",
          text: "Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.",
        },
      ],
    },
    {
      title: "5. Armazenamento e Segurança",
      blocks: [
        {
          type: "p",
          text: "Seus dados são armazenados em servidores seguros com criptografia. Utilizamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou alteração.",
        },
      ],
    },
    {
      title: "6. Seus Direitos (LGPD)",
      blocks: [
        {
          type: "p",
          text: "De acordo com a LGPD, você tem os seguintes direitos sobre seus dados pessoais:",
        },
        {
          type: "list",
          items: [
            "Confirmação da existência de tratamento de dados",
            "Acesso aos seus dados pessoais",
            "Correção de dados incompletos ou desatualizados",
            "Anonimização, bloqueio ou eliminação de dados desnecessários",
            "Portabilidade dos dados",
            "Eliminação dos dados tratados com consentimento",
            "Revogação do consentimento",
          ],
        },
        {
          type: "p",
          text: "Para exercer qualquer destes direitos, entre em contato através do suporte da plataforma.",
        },
      ],
    },
    {
      title: "7. Cookies e Dados de Navegação",
      blocks: [
        {
          type: "p",
          text: "Utilizamos cookies essenciais para manter sua sessão ativa e garantir o funcionamento da plataforma. Não utilizamos cookies de rastreamento ou publicidade.",
        },
      ],
    },
    {
      title: "8. Retenção de Dados",
      blocks: [
        {
          type: "p",
          text: "Seus dados são mantidos enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta, seus dados serão removidos em até 30 dias, exceto quando houver obrigação legal de retenção.",
        },
      ],
    },
    {
      title: "9. Alterações nesta Política",
      blocks: [
        {
          type: "p",
          text: "Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas através da plataforma. Recomendamos a revisão periódica desta página.",
        },
      ],
    },
    {
      title: "10. Contato",
      blocks: [
        {
          type: "p",
          text: "Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados pessoais, entre em contato através do suporte disponível na plataforma.",
        },
      ],
    },
  ],
};
