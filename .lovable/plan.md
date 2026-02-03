
# Plano: Landing Page TribuTalks - Versão Otimizada

## Resumo Executivo

Reescrita completa da Landing Page seguindo o wireframe fornecido, com foco em clareza desde o Hero, hierarquia visual dos planos (Professional destacado), e copy orientado a resultados tangíveis (R$, %, tempo).

---

## Análise da Estrutura Atual vs Nova

### Estrutura Atual (Index.tsx)
```
1. Header
2. HeroSection ➔ REESCREVER
3. ROICaseStudySection ➔ REMOVER (absorvido pelo Hero)
4. BenefitsCtaSection ➔ REMOVER (absorvido pelo Hero)
5. JourneysSection ➔ REMOVER (substituído por PricingSection)
6. SocialProofSection ➔ MANTER (reordenar)
7. CredibilitySection ➔ MANTER
8. HowItWorksSection ➔ MANTER (pequenos ajustes)
9. ROICalculatorSection ➔ MANTER (ajustar copy)
10. MarginProtectionSection ➔ MANTER
11. IntegrationsSection ➔ REORDENAR (antes do Margem Ativa)
12. PricingSection ➔ MANTER (ajustar features)
13. FAQSection ➔ REESCREVER COMPLETO
14. CTASection ➔ REESCREVER
15. Footer ➔ REESCREVER
```

### Nova Estrutura Proposta
```
1. Header (fixo)
2. HeroSection (novo - com benefícios integrados + CTAs)
3. VideoDemoSection (NOVO)
4. HowItWorksSection (ajustado com GIFs/screenshots)
5. PricingSection (ajustado - 6 CNPJs no Professional)
6. IntegrationsSection (reposicionado)
7. MarginProtectionSection (mantido)
8. ROICalculatorSection (ajuste de copy)
9. SocialProofSection (ajustado)
10. CredibilitySection (mantido)
11. FAQSection (reescrito - 9 perguntas novas)
12. CTASection (novo copy)
13. Footer (novo layout com colunas)
```

---

## Fase 1: Novo Hero Section

**Arquivo:** `src/components/landing/HeroSection.tsx`

**Mudanças:**
- Remover card da Clara (mover para seção própria depois)
- Adicionar 3 benefícios com métricas (R$ 47k, CBS/IBS, Clara 24/7)
- Adicionar linha de urgência ("Enquanto seus concorrentes...")
- Dois CTAs: "Testar Grátis por 7 Dias" + "Ver Como Funciona ↓"
- Texto de confiança: "Teste grátis. Cancele quando quiser."

**Copy exato do wireframe:**
```
Headline: Transforme a Reforma Tributária em vantagem competitiva
Subheadline: Software de diagnóstico tributário com IA que identifica 
créditos ocultos, protege margens e automatiza decisões fiscais em minutos.
Urgência: Enquanto seus concorrentes vão descobrir o impacto tarde demais, 
você já estará 3 passos à frente.

Benefícios:
✅ Identifique créditos ocultos — Média de R$ 47k recuperados por empresa
✅ Proteja sua margem — Veja impacto exato de CBS/IBS no seu lucro
✅ Decisões com Clara AI — Sua copilota tributária 24/7
```

---

## Fase 2: Nova Seção de Vídeo Demo

**Arquivo:** `src/components/landing/VideoDemoSection.tsx` (NOVO)

**Estrutura:**
- Título: "Veja TribuTalks em ação"
- Player de vídeo (placeholder ou embed YouTube/Vimeo)
- Legenda: "Do upload ao insight: menos de 2 minutos"

```typescript
export function VideoDemoSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Veja TribuTalks em ação
          </h2>
        </div>
        
        {/* Video Placeholder - substituir por embed real */}
        <div className="max-w-4xl mx-auto aspect-video bg-card rounded-2xl 
                        border border-border flex items-center justify-center">
          <Play className="w-16 h-16 text-primary" />
        </div>
        
        <p className="text-center text-muted-foreground mt-6">
          Do upload ao insight: menos de 2 minutos
        </p>
      </div>
    </section>
  );
}
```

---

## Fase 3: Ajustar HowItWorksSection

**Arquivo:** `src/components/landing/HowItWorksSection.tsx`

**Mudanças:**
- Adicionar "61+ oportunidades fiscais mapeadas" ao passo 2
- Adicionar indicação visual para GIFs/screenshots (placeholders)
- Ajustar copy do passo 3: mencionar "Você comanda, não reage"

**Copy ajustado:**
```
Passo 1 - Diagnóstico Rápido:
Faça upload de 3 XMLs ou conecte seu ERP. Em 2 minutos você vê 
o impacto real da Reforma na sua empresa com o Score Tributário.

Passo 2 - Identifique Oportunidades:
Radar analisa automaticamente e encontra créditos tributários 
não aproveitados (média R$ 47k). 61+ oportunidades fiscais mapeadas.

Passo 3 - Tome Decisões Informadas:
NEXUS consolida 8 KPIs executivos. Clara AI responde dúvidas 24/7. 
Você comanda, não reage.
```

---

## Fase 4: Ajustar PricingSection

**Arquivo:** `src/components/landing/PricingSection.tsx`

**Mudanças principais:**
1. **Starter:** Manter features atuais
2. **Navigator:** Manter features atuais
3. **Professional:** 
   - Corrigir limite para **6 CNPJs • 4 Usuários**
   - Adicionar badges de ROI: "💰 Economia média: R$ 180k/ano" + "📊 ROI típico: 5x no primeiro ano"
   - Reordenar features conforme wireframe
4. **Enterprise:** Manter

**Adicionar rodapé:**
```
Recomendado por faturamento: 
Starter até R$ 5M/ano | Navigator R$ 5-50M | Professional R$ 50M+
```

---

## Fase 5: Reescrever FAQSection

**Arquivo:** `src/components/landing/FAQSection.tsx`

**9 novas perguntas conforme wireframe:**

1. **Para quem é o TribuTalks?**
   R$ 1M a R$ 100M de faturamento anual, CFOs, Controllers, empresários

2. **Preciso substituir meu contador?**
   Não! Complementa. Contador = compliance, TribuTalks = inteligência estratégica

3. **Como funciona a integração com meu ERP?**
   API nativa, 5 minutos, OAuth, sincronização diária

4. **Quanto tempo leva para ver resultados?**
   Score: 2 min | Radar: 48h | Simulações: Imediato | Economia média: R$ 47k

5. **E se eu quiser cancelar?**
   2 cliques, sem burocracia, dados salvos por 90 dias

6. **Como sei que os cálculos estão corretos?**
   API Receita Federal, legislação atualizada, base jurídico-tributária

7. **Meus dados estão seguros?**
   SSL/TLS 256-bit, LGPD, AWS, backup diário, Stripe

8. **Qual a diferença entre Clara AI Assistente vs Copiloto vs Ilimitada?**
   30 msgs/dia vs 100 msgs/dia vs Sem limite

9. **Grupos econômicos ou faturamento acima de R$ 10M?**
   Enterprise com consultoria Rebechi & Silva

---

## Fase 6: Novo CTASection

**Arquivo:** `src/components/landing/CTASection.tsx`

**Novo copy:**
```
Título: Transforme a Reforma Tributária em vantagem competitiva
Subtítulo: Enquanto seus concorrentes vão descobrir o impacto 
tarde demais, você já estará 3 passos à frente.
CTA: Testar Grátis por 7 Dias →
Disclaimer: Teste grátis. Sem cartão de crédito. Cancele quando quiser.
```

*Nota: O disclaimer menciona "Sem cartão de crédito" mas a memória do projeto indica que o trial REQUER cartão. Ajustar para:*
```
Disclaimer: Teste grátis por 7 dias. Cancele quando quiser.
```

---

## Fase 7: Novo Footer

**Arquivo:** `src/components/landing/Footer.tsx`

**Nova estrutura com colunas:**
```
Logo + Tagline (Plataforma de Inteligência Tributária | A 1ª AI-First do Brasil)
Badge: Powered by Rebechi & Silva Advogados Associados

Colunas:
PRODUTO              EMPRESA              LEGAL
• Score Tributário   • Sobre nós          • Termos
• Radar de Créditos  • Contato            • Privacidade
• DRE Inteligente    • Imprensa           • LGPD (link privacidade)
• NEXUS              • Carreiras (link contato)
• Clara AI           • Blog (link comunidade)

© 2026 TribuTalks. Todos os direitos reservados.
CNPJ: 47.706.144/0001-21
contato@tributalks.com.br
```

---

## Fase 8: Atualizar Index.tsx

**Arquivo:** `src/pages/Index.tsx`

**Nova ordem de seções:**
```tsx
<Header />
<main>
  <HeroSection />
  <VideoDemoSection />      {/* NOVO */}
  <HowItWorksSection />
  <PricingSection />
  <IntegrationsSection />
  <MarginProtectionSection />
  <ROICalculatorSection />
  <SocialProofSection />
  <CredibilitySection />
  <FAQSection />
  <CTASection />
</main>
<Footer />
```

**Remover imports:**
- ROICaseStudySection
- BenefitsCtaSection  
- JourneysSection

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/landing/VideoDemoSection.tsx` | Nova seção de vídeo demo |

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/landing/HeroSection.tsx` | Reescrever com novo layout e copy |
| `src/components/landing/HowItWorksSection.tsx` | Ajustar copy e adicionar placeholders visuais |
| `src/components/landing/PricingSection.tsx` | Corrigir 6 CNPJs, adicionar badges ROI, rodapé |
| `src/components/landing/FAQSection.tsx` | Reescrever com 9 novas perguntas |
| `src/components/landing/CTASection.tsx` | Novo copy e layout |
| `src/components/landing/Footer.tsx` | Novo layout com colunas |
| `src/pages/Index.tsx` | Nova ordem de seções, remover imports obsoletos |

## Arquivos que Podem ser Removidos (opcional)

| Arquivo | Motivo |
|---------|--------|
| `src/components/landing/ROICaseStudySection.tsx` | Conteúdo absorvido pelo SocialProofSection |
| `src/components/landing/BenefitsCtaSection.tsx` | Conteúdo absorvido pelo HeroSection |
| `src/components/landing/JourneysSection.tsx` | Substituído pelo PricingSection reformulado |

---

## Validações de Consistência

**Verificar memórias do projeto:**
- Trial de 7 dias REQUER cartão de crédito (manter consistente)
- Professional = 6 CNPJs (corrigir de 5 para 6)
- Tagline: "PLATAFORMA DE INTELIGÊNCIA TRIBUTÁRIA — A 1ª AI-FIRST DO BRASIL"
- Links de pagamento: usar `CONFIG.PAYMENT_LINKS.STARTER_MENSAL` para CTAs principais

---

## Ordem de Implementação

1. **HeroSection** - Nova estrutura com benefícios e CTAs
2. **VideoDemoSection** - Nova seção (placeholder para vídeo)
3. **HowItWorksSection** - Ajustes de copy
4. **PricingSection** - Correção de limites e badges ROI
5. **FAQSection** - Reescrita completa
6. **CTASection** - Novo copy
7. **Footer** - Novo layout com colunas
8. **Index.tsx** - Reorganizar ordem e limpar imports
