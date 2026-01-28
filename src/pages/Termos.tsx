import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-tributech.png";

export default function Termos() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="TribuTech" className="h-8" />
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">TERMOS DE USO</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 23 de janeiro de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground">
          <p>
            Bem-vindo ao TribuTech. Ao acessar ou utilizar nossa plataforma, você concorda com estes Termos de Uso. Leia-os atentamente.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. DEFINIÇÕES</h2>
            <p><strong>1.1.</strong> "TribuTech" ou "Plataforma": refere-se ao site, aplicativo e serviços disponibilizados pela Rebechi & Silva Produções, inscrita no CNPJ sob nº 47.706.144/0001-21, com sede na Avenida Marquês de São Vicente, 1619 - conjunto 2712 - Barra Funda - São Paulo - SP.</p>
            <p><strong>1.2.</strong> "Usuário": qualquer pessoa física ou jurídica que acessa ou utiliza a Plataforma.</p>
            <p><strong>1.3.</strong> "Conteúdo": todas as informações, textos, gráficos, simulações, cálculos, notícias e materiais disponibilizados na Plataforma.</p>
            <p><strong>1.4.</strong> "Serviços": as funcionalidades oferecidas pela Plataforma, incluindo calculadoras tributárias, Clara AI (copiloto de decisão tributária), notícias tributárias, comunidade e consultorias.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. ACEITAÇÃO DOS TERMOS</h2>
            <p><strong>2.1.</strong> Ao criar uma conta ou utilizar qualquer funcionalidade da Plataforma, você declara ter lido, compreendido e aceito integralmente estes Termos de Uso.</p>
            <p><strong>2.2.</strong> Se você não concordar com qualquer disposição destes Termos, não utilize a Plataforma.</p>
            <p><strong>2.3.</strong> Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado da Plataforma após modificações constitui aceitação dos novos Termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. CADASTRO E CONTA</h2>
            <p><strong>3.1.</strong> Para acessar determinadas funcionalidades, é necessário criar uma conta fornecendo informações verdadeiras, completas e atualizadas.</p>
            <p><strong>3.2.</strong> Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</p>
            <p><strong>3.3.</strong> Você deve notificar imediatamente a TribuTech sobre qualquer uso não autorizado de sua conta.</p>
            <p><strong>3.4.</strong> A TribuTech reserva-se o direito de suspender ou cancelar contas que violem estes Termos ou que apresentem informações falsas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. PLANOS E PAGAMENTOS</h2>
            <p><strong>4.1.</strong> A Plataforma oferece diferentes planos de assinatura: Free, Básico (R$ 99/mês), Profissional (R$ 197/mês) e Premium (R$ 500/mês).</p>
            <p><strong>4.2.</strong> Os pagamentos são processados por meio de plataforma de terceiros (Stripe) e estão sujeitos aos termos e condições do processador de pagamentos.</p>
            <p><strong>4.3.</strong> As assinaturas são renovadas automaticamente ao final de cada período, salvo cancelamento prévio pelo Usuário.</p>
            <p><strong>4.4.</strong> O cancelamento pode ser realizado a qualquer momento através do painel do usuário. O acesso aos recursos pagos será mantido até o final do período já pago.</p>
            <p><strong>4.5.</strong> Não há reembolso de valores já pagos, exceto em casos previstos no Código de Defesa do Consumidor.</p>
            <p><strong>4.6.</strong> A TribuTech reserva-se o direito de alterar os preços dos planos, mediante aviso prévio de 30 (trinta) dias.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. NATUREZA DOS SERVIÇOS — ISENÇÃO DE RESPONSABILIDADE</h2>
            <p><strong>5.1.</strong> A TribuTech é uma plataforma de inteligência tributária com fins EXCLUSIVAMENTE EDUCATIVOS E INFORMATIVOS.</p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
              <p className="text-destructive font-medium mb-2">5.2. AS SIMULAÇÕES, CÁLCULOS, COMPARATIVOS E INFORMAÇÕES FORNECIDAS PELA PLATAFORMA NÃO CONSTITUEM:</p>
              <ul className="list-disc list-inside space-y-1 text-destructive/80">
                <li>Parecer jurídico ou tributário;</li>
                <li>Consultoria contábil ou financeira;</li>
                <li>Recomendação de tomada de decisão;</li>
                <li>Garantia de resultados ou economia tributária.</li>
              </ul>
            </div>
            <p><strong>5.3.</strong> Os valores apresentados nas calculadoras são ESTIMATIVAS baseadas em médias de mercado e nos dados informados pelo Usuário. Os resultados reais podem variar significativamente.</p>
            <p><strong>5.4.</strong> O TribuBot (assistente de IA) fornece informações gerais sobre tributação. Suas respostas NÃO substituem o aconselhamento de um profissional qualificado.</p>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 my-4">
              <p className="text-warning font-medium">5.5. ANTES DE TOMAR QUALQUER DECISÃO TRIBUTÁRIA, CONTÁBIL OU FINANCEIRA, O USUÁRIO DEVE CONSULTAR UM PROFISSIONAL HABILITADO (contador, advogado tributarista ou consultor financeiro).</p>
            </div>
            <p><strong>5.6.</strong> A TribuTech, seus sócios, colaboradores e parceiros NÃO SE RESPONSABILIZAM por decisões tomadas com base nas informações da Plataforma, nem por eventuais prejuízos, perdas, multas, autuações ou danos de qualquer natureza.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. CONSULTORIAS (PLANO PREMIUM)</h2>
            <p><strong>6.1.</strong> O plano Premium inclui 2 (duas) sessões de consultoria de 30 minutos por mês com especialistas da Rebechi & Silva Produções.</p>
            <p><strong>6.2.</strong> As consultorias são de natureza orientativa e não configuram relação de prestação de serviços advocatícios ou contábeis continuados.</p>
            <p><strong>6.3.</strong> As sessões não utilizadas no mês NÃO são cumulativas para o mês seguinte.</p>
            <p><strong>6.4.</strong> O agendamento está sujeito à disponibilidade de horários dos especialistas.</p>
            <p><strong>6.5.</strong> Cancelamentos com menos de 24 horas de antecedência serão contabilizados como sessão utilizada.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. PROPRIEDADE INTELECTUAL</h2>
            <p><strong>7.1.</strong> Todo o conteúdo da Plataforma, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, software, código-fonte e compilações de dados, é de propriedade exclusiva da TribuTech ou de seus licenciadores.</p>
            <p><strong>7.2.</strong> É vedado ao Usuário:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Reproduzir, copiar, modificar ou distribuir o conteúdo da Plataforma;</li>
              <li>Utilizar técnicas de engenharia reversa ou descompilar o software;</li>
              <li>Remover avisos de direitos autorais ou marcas registradas;</li>
              <li>Utilizar o conteúdo para fins comerciais sem autorização expressa.</li>
            </ul>
            <p className="mt-2"><strong>7.3.</strong> O Usuário mantém a propriedade dos dados que insere na Plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. CONDUTA DO USUÁRIO</h2>
            <p><strong>8.1.</strong> O Usuário compromete-se a:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Fornecer informações verdadeiras e atualizadas;</li>
              <li>Utilizar a Plataforma de forma ética e legal;</li>
              <li>Não compartilhar suas credenciais de acesso;</li>
              <li>Não utilizar a Plataforma para fins ilícitos;</li>
              <li>Respeitar os demais usuários na Comunidade.</li>
            </ul>
            <p className="mt-4"><strong>8.2.</strong> É expressamente proibido:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Tentar acessar áreas restritas ou sistemas da Plataforma;</li>
              <li>Utilizar robôs, scrapers ou ferramentas automatizadas;</li>
              <li>Sobrecarregar a infraestrutura da Plataforma;</li>
              <li>Transmitir vírus, malware ou código malicioso;</li>
              <li>Praticar assédio, discriminação ou condutas ofensivas na Comunidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. DISPONIBILIDADE E SUPORTE</h2>
            <p><strong>9.1.</strong> A TribuTech se esforça para manter a Plataforma disponível 24 horas por dia, 7 dias por semana, mas não garante disponibilidade ininterrupta.</p>
            <p><strong>9.2.</strong> Manutenções programadas serão comunicadas com antecedência quando possível.</p>
            <p><strong>9.3.</strong> A TribuTech não se responsabiliza por interrupções causadas por fatores externos, como falhas de internet, ataques cibernéticos ou força maior.</p>
            <p><strong>9.4.</strong> O suporte ao usuário é oferecido por e-mail (suporte@tributalks.com.br) com prazo de resposta de até 48 horas úteis para planos Básico e Profissional, e prioritário para o plano Premium.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. LIMITAÇÃO DE RESPONSABILIDADE</h2>
            <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
              <p className="font-medium mb-2">10.1. NA MÁXIMA EXTENSÃO PERMITIDA POR LEI, A TRIBUTECH NÃO SERÁ RESPONSÁVEL POR:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Danos indiretos, incidentais, especiais ou consequentes;</li>
                <li>Perda de lucros, receitas, dados ou oportunidades de negócio;</li>
                <li>Decisões tomadas com base nas informações da Plataforma;</li>
                <li>Erros, imprecisões ou omissões no conteúdo;</li>
                <li>Ações de terceiros ou falhas em serviços de terceiros.</li>
              </ul>
            </div>
            <p><strong>10.2.</strong> A responsabilidade total da TribuTech, em qualquer hipótese, estará limitada ao valor pago pelo Usuário nos últimos 12 (doze) meses.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. RESCISÃO</h2>
            <p><strong>11.1.</strong> O Usuário pode encerrar sua conta a qualquer momento através do painel de configurações.</p>
            <p><strong>11.2.</strong> A TribuTech pode suspender ou encerrar a conta do Usuário em caso de:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violação destes Termos;</li>
              <li>Uso fraudulento ou abusivo da Plataforma;</li>
              <li>Inadimplência de pagamentos;</li>
              <li>Solicitação de autoridades competentes.</li>
            </ul>
            <p className="mt-2"><strong>11.3.</strong> Após o encerramento, os dados do Usuário serão tratados conforme a Política de Privacidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. DISPOSIÇÕES GERAIS</h2>
            <p><strong>12.1.</strong> Estes Termos constituem o acordo integral entre as partes e substituem quaisquer acordos anteriores.</p>
            <p><strong>12.2.</strong> A tolerância quanto ao descumprimento de qualquer disposição não implica renúncia ao direito de exigir o cumprimento.</p>
            <p><strong>12.3.</strong> Se qualquer disposição for considerada inválida, as demais permanecerão em pleno vigor.</p>
            <p><strong>12.4.</strong> A TribuTech pode ceder ou transferir seus direitos e obrigações sem consentimento prévio do Usuário.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">13. LEI APLICÁVEL E FORO</h2>
            <p><strong>13.1.</strong> Estes Termos são regidos pelas leis da República Federativa do Brasil.</p>
            <p><strong>13.2.</strong> Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias, com exclusão de qualquer outro, por mais privilegiado que seja.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">14. CONTATO</h2>
            <p>Para dúvidas, sugestões ou reclamações sobre estes Termos:</p>
            <div className="bg-card border border-border rounded-lg p-4 mt-4">
              <p className="font-medium text-foreground">TribuTech — Uma iniciativa Rebechi & Silva Produções</p>
              <p>E-mail: suporte@tributalks.com.br</p>
              <p>Endereço: Avenida Marquês de São Vicente, 1619 - conjunto 2712 - Barra Funda - São Paulo - SP</p>
              <p>Telefone: +55 11 91452-3971</p>
            </div>
          </section>

          <div className="border-t border-border pt-8 mt-8">
            <p className="text-center text-muted-foreground">
              Ao utilizar a Plataforma, você confirma que leu, compreendeu e concorda com estes Termos de Uso.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 TribuTech. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/contato" className="hover:text-foreground transition-colors">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
