export const CONFIG = {
  // Payment Links - Mercado Pago
  PAYMENT_LINKS: {
    // Starter - R$297/mês ou R$2.970/ano (7 dias grátis)
    STARTER_MENSAL: "/cadastro", // TODO: Criar link Mercado Pago
    STARTER_ANUAL: "/cadastro", // TODO: Criar link Mercado Pago
    // Navigator - R$1.997/mês ou R$19.970/ano (2 meses grátis)
    NAVIGATOR_MENSAL: "/cadastro", // TODO: Criar link Mercado Pago
    NAVIGATOR_ANUAL: "/cadastro", // TODO: Criar link Mercado Pago
    // Professional - R$2.997/mês ou R$29.970/ano (2 meses grátis)
    PROFESSIONAL_MENSAL: "/cadastro", // TODO: Criar link Mercado Pago
    PROFESSIONAL_ANUAL: "/cadastro", // TODO: Criar link Mercado Pago
    // Enterprise - Sob consulta (WhatsApp direto)
    ENTERPRISE: "https://wa.me/5511914523971",
    // Pacotes de créditos Clara (1 crédito = 1 conversa)
    CREDITS_30: "/cadastro", // R$ 74,90 - 30 créditos
    CREDITS_50: "/cadastro", // R$ 109,90 - 50 créditos
    CREDITS_100: "/cadastro", // R$ 199,90 - 100 créditos
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
