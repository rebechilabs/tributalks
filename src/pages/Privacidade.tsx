import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-tributech.png";

export default function Privacidade() {
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
        <h1 className="text-3xl font-bold text-foreground mb-2">POLÍTICA DE PRIVACIDADE</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 23 de janeiro de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground">
          <p>
            A TribuTech, operada pela Rebechi & Silva Advogados Associados, está comprometida com a proteção da sua privacidade. Esta Política descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. CONTROLADOR DOS DADOS</h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="font-medium text-foreground">Rebechi & Silva Advogados Associados</p>
              <p>CNPJ: 47.706.144/0001-21</p>
              <p>Endereço: Avenida Marquês de São Vicente, 1619 - conjunto 2712 - Barra Funda - São Paulo - SP</p>
              <p>E-mail do Encarregado (DPO): privacidade@tributech.com.br</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. DADOS QUE COLETAMOS</h2>
            
            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.1. Dados fornecidos diretamente pelo Usuário:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Dados de identificação:</strong> nome completo, e-mail</li>
              <li><strong>Dados da empresa:</strong> nome da empresa, CNAE, estado</li>
              <li><strong>Dados tributários:</strong> faturamento, regime tributário, setor de atuação</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pelo Stripe (não armazenamos dados de cartão)</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.2. Dados coletados automaticamente:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas acessadas, tempo de permanência</li>
              <li><strong>Dados de dispositivo:</strong> sistema operacional, identificadores de dispositivo</li>
              <li>Cookies e tecnologias similares (veja seção 7)</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.3. Dados gerados pelo uso da Plataforma:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Histórico de simulações e cálculos</li>
              <li>Conversas com o TribuBot</li>
              <li>Configurações e preferências</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. FINALIDADES DO TRATAMENTO</h2>
            <p>Utilizamos seus dados para as seguintes finalidades:</p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.1. Execução do contrato:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Criar e gerenciar sua conta</li>
              <li>Fornecer os serviços contratados</li>
              <li>Personalizar simulações e cálculos</li>
              <li>Processar pagamentos e assinaturas</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.2. Legítimo interesse:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Melhorar a Plataforma e desenvolver novos recursos</li>
              <li>Enviar notícias tributárias relevantes</li>
              <li>Prevenir fraudes e garantir segurança</li>
              <li>Realizar análises estatísticas agregadas</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.3. Consentimento (quando aplicável):</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enviar comunicações de marketing</li>
              <li>Compartilhar dados com parceiros</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.4. Cumprimento de obrigação legal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Atender requisições de autoridades competentes</li>
              <li>Cumprir obrigações fiscais e contábeis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. COMPARTILHAMENTO DE DADOS</h2>
            
            <p><strong>4.1.</strong> Compartilhamos dados apenas nas seguintes situações:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Processadores de pagamento:</strong> Stripe, para processar transações financeiras.</li>
              <li><strong>Provedores de infraestrutura:</strong> Supabase (banco de dados), Vercel/Lovable (hospedagem), para operar a Plataforma.</li>
              <li><strong>Provedores de IA:</strong> Para funcionamento do TribuBot. Os dados são processados de forma anonimizada quando possível.</li>
              <li><strong>Autoridades competentes:</strong> quando exigido por lei ou ordem judicial.</li>
            </ul>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-4">
              <p className="text-primary font-medium">4.2. NÃO vendemos, alugamos ou comercializamos seus dados pessoais.</p>
            </div>

            <p><strong>4.3.</strong> Todos os nossos parceiros e fornecedores estão obrigados contratualmente a proteger seus dados e utilizá-los apenas para as finalidades especificadas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. ARMAZENAMENTO E SEGURANÇA</h2>
            <p><strong>5.1.</strong> Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS) e em repouso.</p>
            <p><strong>5.2.</strong> Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda, alteração ou destruição, incluindo:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Criptografia de dados sensíveis</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento de segurança</li>
              <li>Backups regulares</li>
              <li>Treinamento de equipe</li>
            </ul>
            <p className="mt-4"><strong>5.3.</strong> Apesar de nossos esforços, nenhum sistema é 100% seguro. Em caso de incidente de segurança que possa afetar seus dados, você será notificado conforme exigido pela LGPD.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. RETENÇÃO DE DADOS</h2>
            <p><strong>6.1.</strong> Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer os serviços.</p>
            <p><strong>6.2.</strong> Após o encerramento da conta:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li><strong>Dados de identificação:</strong> mantidos por 5 anos para fins legais</li>
              <li><strong>Histórico de simulações:</strong> excluído em até 90 dias</li>
              <li><strong>Conversas do TribuBot:</strong> excluídas em até 30 dias</li>
              <li><strong>Dados de pagamento:</strong> mantidos conforme exigências fiscais (5 anos)</li>
            </ul>
            <p className="mt-4"><strong>6.3.</strong> Dados agregados e anonimizados podem ser mantidos indefinidamente para fins estatísticos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. COOKIES E TECNOLOGIAS SIMILARES</h2>
            <p><strong>7.1.</strong> Utilizamos cookies para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Manter você conectado (cookies de sessão)</li>
              <li>Lembrar suas preferências (cookies de funcionalidade)</li>
              <li>Analisar o uso da Plataforma (cookies de análise)</li>
              <li>Melhorar nosso marketing (cookies de publicidade)</li>
            </ul>

            <p className="mt-4"><strong>7.2.</strong> Tipos de cookies utilizados:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li><strong>Essenciais:</strong> necessários para o funcionamento da Plataforma. Não podem ser desativados.</li>
              <li><strong>Funcionais:</strong> lembram suas escolhas e preferências.</li>
              <li><strong>Analíticos:</strong> nos ajudam a entender como a Plataforma é utilizada.</li>
              <li><strong>Marketing:</strong> utilizados para mostrar anúncios relevantes.</li>
            </ul>

            <p className="mt-4"><strong>7.3.</strong> Você pode gerenciar cookies através das configurações do seu navegador. A desativação de alguns cookies pode afetar a funcionalidade da Plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. SEUS DIREITOS (LGPD)</h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="font-medium text-foreground mb-3">8.1. Você tem os seguintes direitos em relação aos seus dados:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los.</li>
                <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários ou tratados em desconformidade.</li>
                <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado.</li>
                <li><strong>Eliminação:</strong> solicitar a exclusão de dados tratados com base no consentimento.</li>
                <li><strong>Informação:</strong> saber com quem compartilhamos seus dados.</li>
                <li><strong>Revogação do consentimento:</strong> retirar o consentimento a qualquer momento.</li>
                <li><strong>Oposição:</strong> opor-se ao tratamento em determinadas situações.</li>
              </ul>
            </div>
            <p className="mt-4"><strong>8.2.</strong> Para exercer seus direitos, entre em contato pelo e-mail: privacidade@tributech.com.br</p>
            <p><strong>8.3.</strong> Responderemos sua solicitação em até 15 (quinze) dias, conforme previsto na LGPD.</p>
            <p><strong>8.4.</strong> Você também tem o direito de apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. TRANSFERÊNCIA INTERNACIONAL</h2>
            <p><strong>9.1.</strong> Alguns de nossos fornecedores podem processar dados em servidores localizados fora do Brasil.</p>
            <p><strong>9.2.</strong> Essas transferências são realizadas com base em:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Cláusulas contratuais padrão aprovadas</li>
              <li>Certificações de adequação (quando aplicável)</li>
              <li>Consentimento específico do titular</li>
            </ul>
            <p className="mt-4"><strong>9.3.</strong> Garantimos que seus dados recebam proteção equivalente à exigida pela legislação brasileira.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. MENORES DE IDADE</h2>
            <p><strong>10.1.</strong> A Plataforma é destinada a pessoas maiores de 18 anos ou legalmente emancipadas.</p>
            <p><strong>10.2.</strong> Não coletamos intencionalmente dados de menores de idade. Se tomarmos conhecimento de que coletamos dados de um menor, excluiremos as informações imediatamente.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. ALTERAÇÕES NESTA POLÍTICA</h2>
            <p><strong>11.1.</strong> Podemos atualizar esta Política periodicamente. A data da última atualização será sempre indicada no topo do documento.</p>
            <p><strong>11.2.</strong> Alterações significativas serão comunicadas por e-mail ou através de aviso na Plataforma.</p>
            <p><strong>11.3.</strong> O uso continuado da Plataforma após alterações constitui aceitação da nova Política.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. CONTATO</h2>
            <p>Para dúvidas, solicitações ou reclamações sobre esta Política ou sobre o tratamento de seus dados:</p>
            <div className="bg-card border border-border rounded-lg p-4 mt-4">
              <p className="font-medium text-foreground">Encarregado de Proteção de Dados (DPO)</p>
              <p>E-mail: privacidade@tributech.com.br</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-medium text-foreground">TribuTech — Uma iniciativa Rebechi & Silva Advogados Associados</p>
                <p>Endereço: Avenida Marquês de São Vicente, 1619 - conjunto 2712 - Barra Funda - São Paulo - SP</p>
                <p>Telefone: +55 11 91452-3971</p>
              </div>
            </div>
          </section>

          <div className="border-t border-border pt-8 mt-8">
            <p className="text-center text-muted-foreground">
              Ao utilizar a Plataforma, você confirma que leu e compreendeu esta Política de Privacidade.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 TribuTech. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="hover:text-foreground transition-colors">
              Termos de Uso
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
