import { BackButton } from "@/components/ui/back-button";

export default function PrivacidadePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-bold tracking-tight">Política de Privacidade</h1>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">
          Última atualização: Janeiro de 2026
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            1. Informações que Coletamos
          </h2>
          <p>
            Ao utilizar o ResolveAí, coletamos as seguintes informações pessoais
            em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº
            13.709/2018):
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nome completo e endereço de email</li>
            <li>Foto de perfil (opcional)</li>
            <li>
              Número de WhatsApp (apenas para prestadores de serviço)
            </li>
            <li>Bairro de atuação (apenas para prestadores)</li>
            <li>Imagens de portfólio (apenas para prestadores)</li>
            <li>Avaliações e comentários publicados</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            2. Base Legal para o Tratamento
          </h2>
          <p>
            O tratamento dos seus dados pessoais é realizado com base nas
            seguintes hipóteses legais previstas na LGPD:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Consentimento:</strong>{" "}
              Fornecido no momento do cadastro na plataforma
            </li>
            <li>
              <strong className="text-foreground">
                Execução de contrato:
              </strong>{" "}
              Necessário para a prestação dos serviços da plataforma
            </li>
            <li>
              <strong className="text-foreground">Legítimo interesse:</strong>{" "}
              Para melhorar a experiência do usuário e a segurança da plataforma
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            3. Como Utilizamos suas Informações
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Criar e gerenciar sua conta na plataforma</li>
            <li>
              Exibir perfis de prestadores para clientes interessados
            </li>
            <li>Facilitar o contato entre clientes e prestadores via WhatsApp</li>
            <li>Exibir avaliações e classificações dos prestadores</li>
            <li>Melhorar a experiência do usuário na plataforma</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            4. Compartilhamento de Dados
          </h2>
          <p>
            Suas informações podem ser compartilhadas com:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Outros usuários:</strong>{" "}
              Nome, foto e informações do perfil profissional são visíveis
              publicamente para usuários autenticados
            </li>
            <li>
              <strong className="text-foreground">
                Prestadores de infraestrutura:
              </strong>{" "}
              Utilizamos serviços da Supabase para armazenamento de dados e
              autenticação, e da Vercel para hospedagem
            </li>
          </ul>
          <p>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com
            terceiros para fins comerciais.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            5. Armazenamento e Segurança
          </h2>
          <p>
            Seus dados são armazenados em servidores seguros com criptografia.
            Utilizamos medidas técnicas e organizacionais para proteger suas
            informações contra acesso não autorizado, perda ou alteração.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            6. Seus Direitos (LGPD)
          </h2>
          <p>
            De acordo com a LGPD, você tem os seguintes direitos sobre seus
            dados pessoais:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirmação da existência de tratamento de dados</li>
            <li>Acesso aos seus dados pessoais</li>
            <li>Correção de dados incompletos ou desatualizados</li>
            <li>
              Anonimização, bloqueio ou eliminação de dados desnecessários
            </li>
            <li>Portabilidade dos dados</li>
            <li>Eliminação dos dados tratados com consentimento</li>
            <li>Revogação do consentimento</li>
          </ul>
          <p>
            Para exercer qualquer destes direitos, entre em contato através do
            suporte da plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            7. Cookies e Dados de Navegação
          </h2>
          <p>
            Utilizamos cookies essenciais para manter sua sessão ativa e
            garantir o funcionamento da plataforma. Não utilizamos cookies de
            rastreamento ou publicidade.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            8. Retenção de Dados
          </h2>
          <p>
            Seus dados são mantidos enquanto sua conta estiver ativa. Ao
            solicitar a exclusão da conta, seus dados serão removidos em até 30
            dias, exceto quando houver obrigação legal de retenção.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            9. Alterações nesta Política
          </h2>
          <p>
            Esta política pode ser atualizada periodicamente. Alterações
            significativas serão comunicadas através da plataforma. Recomendamos
            a revisão periódica desta página.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            10. Contato
          </h2>
          <p>
            Para dúvidas sobre esta Política de Privacidade ou sobre o
            tratamento dos seus dados pessoais, entre em contato através do
            suporte disponível na plataforma.
          </p>
        </section>
      </div>
    </div>
  );
}
