# TribuTalks - Inteligência Tributária

Plataforma SaaS de gestão tributária inteligente para empresas brasileiras, com 36+ ferramentas para diagnóstico, recuperação de créditos, precificação e gestão estratégica.

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query + React Context |
| Backend | Lovable Cloud (Supabase) |
| IA | Clara AI (GPT-5/Gemini via Lovable AI) |
| Animações | Framer Motion |
| PDF | jsPDF |
| Tour | React Joyride |

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React organizados por feature
│   ├── clara/           # Clara AI (assistente virtual)
│   ├── dashboard/       # Componentes do painel principal
│   ├── dre/             # DRE Inteligente
│   ├── landing/         # Landing page
│   ├── onboarding/      # Fluxo de onboarding
│   ├── simpronto/       # Comparativo de regimes tributários
│   └── ui/              # shadcn/ui components
├── contexts/            # React Contexts (Auth, Company, Theme)
├── hooks/               # Custom hooks
├── integrations/        # Integrações externas (Supabase)
├── lib/                 # Utilitários e helpers
├── pages/               # Páginas da aplicação
└── config/              # Configurações globais

supabase/
├── functions/           # 48 Edge Functions (Deno)
└── migrations/          # Migrações do banco de dados

docs/
└── TRIBUTALKS_DOCUMENTATION.md  # Documentação técnica completa
```

## 🛠️ Instalação Local

### Pré-requisitos

- Node.js 18+ 
- npm ou bun
- Git

### Passos

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>

# 2. Instale as dependências
npm install
# ou
bun install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

O projeto estará disponível em `http://localhost:5173`

## 📚 Documentação

A documentação técnica completa está em [`docs/TRIBUTALKS_DOCUMENTATION.md`](docs/TRIBUTALKS_DOCUMENTATION.md), incluindo:

- Arquitetura de autenticação e onboarding
- Sistema multi-CNPJ
- Feature gates por plano
- Estrutura de rotas
- Descrição de todas as ferramentas
- Schema do banco de dados (77 tabelas)
- Edge Functions (48 funções)
- Configurações globais

## 🔐 Módulos Principais

| Módulo | Descrição |
|--------|-----------|
| **ENTENDER** | DRE Inteligente, Score Tributário, Simpronto |
| **RECUPERAR** | Radar de Créditos, Oportunidades Fiscais |
| **PRECIFICAÇÃO** | Margem Ativa, PriceGuard, Split Payment |
| **COMANDAR** | NEXUS (Centro de Comando), Valuation |
| **CONEXÃO** | Notícias, Comunidade, Indique e Ganhe |

## 🤖 Clara AI

Assistente virtual especializada em tributação brasileira:
- Chat conversacional com comandos especiais (`/resumo`, `/diagnostico`)
- Atalho global: `Ctrl+K`
- Sistema de memória persistente
- Base de conhecimento tributário (RAG)

## 📊 Banco de Dados

- **77 tabelas** com RLS (Row Level Security)
- **48 Edge Functions** para processamento backend
- Suporte a multi-tenant com isolamento por `user_id`

## 🔗 Links

| Recurso | URL |
|---------|-----|
| Preview | https://id-preview--a0c5403f-32d5-4f40-a502-bb558f3296ac.lovable.app |
| Produção | https://tributechai.lovable.app |
| Documentação | [docs/TRIBUTALKS_DOCUMENTATION.md](docs/TRIBUTALKS_DOCUMENTATION.md) |

## 📄 Licença

Projeto proprietário - Todos os direitos reservados.

---

**Desenvolvido com [Lovable](https://lovable.dev)**
