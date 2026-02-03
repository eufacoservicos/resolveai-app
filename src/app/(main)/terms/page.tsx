import { BackButton } from "@/components/ui/back-button";

export default function TermosPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-bold tracking-tight">Termos de Uso</h1>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">
          Última atualização: Janeiro de 2026
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar e usar o ResolveAí, você concorda com estes Termos de
            Uso. Se você não concorda com qualquer parte destes termos, não
            utilize a plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            2. Descrição do Serviço
          </h2>
          <p>
            O ResolveAí é uma plataforma que conecta clientes a prestadores de
            serviços locais. Atuamos como intermediários na divulgação dos
            serviços, mas não somos responsáveis pela execução dos mesmos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            3. Cadastro e Conta
          </h2>
          <p>
            Para utilizar a plataforma, é necessário criar uma conta com
            informações verdadeiras e atualizadas. Você é responsável por manter
            a confidencialidade de sua senha e por todas as atividades realizadas
            em sua conta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            4. Tipos de Conta
          </h2>
          <p>
            <strong className="text-foreground">Cliente:</strong> Pode buscar,
            visualizar perfis de prestadores e deixar avaliações após a
            contratação de um serviço.
          </p>
          <p>
            <strong className="text-foreground">Prestador:</strong> Pode criar
            um perfil profissional, adicionar portfólio de trabalhos e receber
            contatos de clientes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            5. Avaliações
          </h2>
          <p>
            As avaliações devem refletir experiências reais. É proibido publicar
            conteúdo falso, ofensivo, discriminatório ou que viole direitos de
            terceiros. O ResolveAí reserva-se o direito de remover avaliações
            que violem estes termos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            6. Responsabilidades
          </h2>
          <p>
            O ResolveAí não se responsabiliza pela qualidade, segurança ou
            legalidade dos serviços oferecidos pelos prestadores. A contratação é
            feita diretamente entre cliente e prestador, cabendo a ambos as
            responsabilidades decorrentes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            7. Propriedade Intelectual
          </h2>
          <p>
            Todo o conteúdo da plataforma (design, textos, logotipos e código)
            é de propriedade do ResolveAí. As imagens de portfólio são de
            propriedade dos prestadores que as enviaram.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            8. Encerramento de Conta
          </h2>
          <p>
            O ResolveAí pode suspender ou encerrar contas que violem estes termos
            ou que apresentem comportamento abusivo, sem aviso prévio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            9. Alterações nos Termos
          </h2>
          <p>
            Podemos atualizar estes termos a qualquer momento. Alterações
            significativas serão comunicadas através da plataforma. O uso
            continuado após as alterações implica na aceitação dos novos termos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            10. Contato
          </h2>
          <p>
            Para dúvidas sobre estes Termos de Uso, entre em contato através do
            suporte disponível na plataforma.
          </p>
        </section>
      </div>
    </div>
  );
}
