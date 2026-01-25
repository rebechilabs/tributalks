export const CONFIG = {
  STRIPE_PAYMENT_LINKS: {
    FREE: "/cadastro",
    // Navigator - R$697/mês ou R$6.970/ano (2 meses grátis)
    NAVIGATOR_MENSAL: "https://buy.stripe.com/PLACEHOLDER_NAVIGATOR_MENSAL",
    NAVIGATOR_ANUAL: "https://buy.stripe.com/PLACEHOLDER_NAVIGATOR_ANUAL",
    // Professional - R$2.497/mês ou R$24.970/ano (2 meses grátis)
    PROFESSIONAL_MENSAL: "https://buy.stripe.com/PLACEHOLDER_PROFESSIONAL_MENSAL",
    PROFESSIONAL_ANUAL: "https://buy.stripe.com/PLACEHOLDER_PROFESSIONAL_ANUAL",
    // Enterprise - Sob consulta (não usa Stripe)
    ENTERPRISE: "/contato",
    // Legacy - deprecated, mantendo para compatibilidade
    BASICO_MENSAL: "https://buy.stripe.com/PLACEHOLDER_BASICO_MENSAL",
    BASICO_ANUAL: "https://buy.stripe.com/PLACEHOLDER_BASICO_ANUAL",
    PROFISSIONAL_MENSAL: "https://buy.stripe.com/PLACEHOLDER_PRO_MENSAL",
    PROFISSIONAL_ANUAL: "https://buy.stripe.com/PLACEHOLDER_PRO_ANUAL",
    PREMIUM_MENSAL: "https://buy.stripe.com/PLACEHOLDER_PREMIUM_MENSAL",
    PREMIUM_ANUAL: "https://buy.stripe.com/PLACEHOLDER_PREMIUM_ANUAL",
  },
  // Legacy - keeping for compatibility
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/PLACEHOLDER_PRO_MENSAL",
  STRIPE_ANNUAL_LINK: "https://buy.stripe.com/PLACEHOLDER_PRO_ANUAL",
  CONTACT_EMAIL: "contato@tributech.com.br",
  CALENDLY_LINK: "https://calendly.com/PLACEHOLDER",
};
