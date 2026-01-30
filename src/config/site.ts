export const CONFIG = {
  // Payment Links - Mercado Pago
  PAYMENT_LINKS: {
    // Starter - R$297/mês ou R$3.970/ano (7 dias grátis)
    STARTER_MENSAL: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=8afa4ed679f649fc99fe3ebe6ea6bd94",
    STARTER_ANUAL: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=b816a10f5deb42bd8a92e711f60d5961",
    // Navigator - R$1.297/mês (anual não disponível por enquanto)
    NAVIGATOR_MENSAL: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=89e78b22cd71461595f92886fcacfa17",
    NAVIGATOR_ANUAL: "", // Não disponível - usar link mensal como fallback
    // Professional - R$2.997/mês (anual não disponível por enquanto)
    PROFESSIONAL_MENSAL: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=622791ff8aea48febbc1a8643e56fb2b",
    PROFESSIONAL_ANUAL: "", // Não disponível - usar link mensal como fallback
    // Enterprise - Sob consulta (WhatsApp direto)
    ENTERPRISE: "https://wa.me/5511914523971",
    // Pacotes de créditos Clara (1 crédito = 1 conversa)
    CREDITS_30: "https://mpago.li/2wkZU66",
    CREDITS_50: "https://mpago.li/312AeJE",
    CREDITS_100: "https://mpago.li/2x8EsdW",
    // Extra seats for multi-user plans
    SEAT_PROFESSIONAL: "/cadastro",
    SEAT_ENTERPRISE: "/cadastro",
  },
  // Legacy alias for backward compatibility
  STRIPE_PAYMENT_LINKS: {} as Record<string, string>,
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
  // Community
  CIRCLE_COMMUNITY: "https://tributalksconnect.circle.so",
  // Calendly
  CALENDLY_LINK: "https://calendly.com/tributalks/consultoria",
};

// Backward compatibility: map old STRIPE keys to new PAYMENT keys
CONFIG.STRIPE_PAYMENT_LINKS = CONFIG.PAYMENT_LINKS;
