export const CONFIG = {
  STRIPE_PAYMENT_LINKS: {
    FREE: "/cadastro",
    // Navigator - R$697/mês ou R$6.970/ano (2 meses grátis)
    NAVIGATOR_MENSAL: "https://buy.stripe.com/test_aFa8wI3V8e9U7PR9iSbo403",
    NAVIGATOR_ANUAL: "https://buy.stripe.com/test_fZu9AM63g2rcc67gLkbo404",
    // Professional - R$2.497/mês ou R$24.970/ano (2 meses grátis)
    PROFESSIONAL_MENSAL: "https://buy.stripe.com/test_aFa9AMfDQ7Lw6LNgLkbo402",
    PROFESSIONAL_ANUAL: "https://buy.stripe.com/test_dRmdR2ajwd5Q6LNcv4bo400",
    // Enterprise - Sob consulta (WhatsApp direto)
    ENTERPRISE: "https://wa.me/5511914523971",
    // Credit packages for Navigator users (TribuBot extra credits)
    // TODO: Replace with real Stripe Payment Links after creating products
    CREDITS_10: "https://buy.stripe.com/PLACEHOLDER_CREDITS_10",
    CREDITS_20: "https://buy.stripe.com/PLACEHOLDER_CREDITS_20",
    CREDITS_30: "https://buy.stripe.com/PLACEHOLDER_CREDITS_30",
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
  // Contact Info
  CONTACT_EMAIL: "suporte@tributalks.com.br",
  COMMERCIAL_EMAIL: "comercial@tributalks.com.br",
  PHONE: "+55 11 91452-3971",
  WHATSAPP: "https://wa.me/5511914523971",
  // Address
  ADDRESS: {
    company: "Rebechi & Silva Produções",
    street: "Avenida Marquês de São Vicente, 1619",
    complement: "Conjunto 2712 - Barra Funda",
    city: "São Paulo/SP",
    zip: "01139-003",
  },
  // Social
  LINKEDIN: "https://www.linkedin.com/company/tributalks/",
  CALENDLY_LINK: "https://calendly.com/PLACEHOLDER",
};
