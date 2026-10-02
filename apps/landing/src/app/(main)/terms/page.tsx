import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de uso da plataforma eufaço!. Leia os termos e condições para uso dos nossos serviços.",
};

export default function TermosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Termos de Uso</h1>

      <div className="rounded-xl border border-border bg-white p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">
          Última atualização: Março de 2026
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar e usar o eufaço!, você concorda com estes Termos de
            Uso. Se você não concorda com qualquer parte destes termos, não
            utilize a plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            2. Descrição do Serviço
          </h2>
          <p>
            O eufaço! é uma plataforma que conecta clientes a prestadores de
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
            terceiros. O eufaço! reserva-se o direito de remover avaliações
            que violem estes termos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            6. Natureza da Plataforma e Responsabilidades
          </h2>
          <p>
            O eufaço! é <strong className="text-foreground">exclusivamente um catálogo digital</strong> de
            prestadores de serviços. A plataforma tem como única função facilitar
            a divulgação e a descoberta de profissionais, sem qualquer
            participação na negociação, execução ou supervisão dos serviços.
          </p>
          <p>
            <strong className="text-foreground">Não existe vínculo</strong> empregatício, de representação,
            de parceria ou de intermediação ativa entre o eufaço! e os
            prestadores ou clientes cadastrados.
          </p>
          <p>
            O contato e a contratação são realizados{" "}
            <strong className="text-foreground">diretamente entre as partes</strong>, por meio dos
            canais de comunicação disponibilizados no perfil do prestador
            (ex.: WhatsApp). O eufaço!{" "}
            <strong className="text-foreground">não se responsabiliza</strong> por:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Qualidade, prazo ou resultado dos serviços prestados;</li>
            <li>Acordos financeiros, preços ou formas de pagamento;</li>
            <li>Danos materiais, morais ou de qualquer natureza decorrentes da relação entre cliente e prestador;</li>
            <li>Veracidade das informações fornecidas pelos usuários em seus perfis;</li>
            <li>Eventuais disputas, prejuízos ou conflitos entre as partes.</li>
          </ul>
          <p>
            Ao utilizar a plataforma, você reconhece e aceita que toda e
            qualquer decisão de contratação é de sua exclusiva responsabilidade.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            7. Propriedade Intelectual
          </h2>
          <p>
            Todo o conteúdo da plataforma (design, textos, logotipos e código)
            é de propriedade do eufaço!. As imagens de portfólio são de
            propriedade dos prestadores que as enviaram.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            8. Encerramento de Conta
          </h2>
          <p>
            O eufaço! pode suspender ou encerrar contas que violem estes termos
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
