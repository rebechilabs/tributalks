import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Wallet, TrendingUp, Shield, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PersonalizedToolPlan } from "@/components/welcome/PersonalizedToolPlan";
import { useAIJourney } from "@/hooks/useAIJourney";

interface PriorityOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PRIORITIES: PriorityOption[] = [
  {
    id: "caixa",
    label: "Caixa",
    description: "Fluxo de caixa e capital de giro",
    icon: <Wallet className="w-6 h-6" />,
    color: "text-emerald-500",
  },
  {
    id: "margem",
    label: "Margem",
    description: "Lucro e rentabilidade",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "text-blue-500",
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Conformidade fiscal e prazos",
    icon: <Shield className="w-6 h-6" />,
    color: "text-amber-500",
  },
  {
    id: "crescimento",
    label: "Crescimento",
    description: "Expansão e planejamento",
    icon: <Rocket className="w-6 h-6" />,
    color: "text-purple-500",
  },
];

/**
 * Página de Boas-Vindas AI-First
 * Uma pergunta apenas: qual é a prioridade do usuário?
 * Gera um plano personalizado de ferramentas baseado no perfil
 */
const WelcomeAI = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { startJourney, journey } = useAIJourney();
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  // Nome do usuário para personalização
  const userName = profile?.nome?.split(" ")[0] || "você";
  
  // Dados do perfil para contexto
  const regime = profile?.plano || "STARTER";
  const setor = (() => {
    // Tentar buscar setor do company_profile via hook ou contexto
    return "sua empresa";
  })();

  // Se já viu o welcome e tem journey, vai direto para o plano
  useEffect(() => {
    if (journey?.welcome_seen_at && journey?.priority) {
      setSelectedPriority(journey.priority);
      setShowPlan(true);
      setIsAnimating(false);
    }
  }, [journey]);

  // Animação inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectPriority = async (priority: string) => {
    setSelectedPriority(priority);
    
    // Salva no backend
    await startJourney.mutateAsync(priority);
    
    // Mostra o plano
    setTimeout(() => setShowPlan(true), 300);
  };

  const handleSkipToTool = (toolPath: string) => {
    // Marca o welcome como visto
    localStorage.setItem("welcome_seen", "true");
    navigate(toolPath);
  };

  const handleSkipWelcome = () => {
    localStorage.setItem("welcome_seen", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {!showPlan ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Avatar da Clara */}
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <Bot className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Mensagem de boas-vindas */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Oi {userName}! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                  Vi que você é do plano{" "}
                  <span className="text-primary font-medium">{regime}</span>.
                  <br />
                  Qual é sua maior prioridade agora?
                </p>
              </motion.div>

              {/* Opções de prioridade */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {PRIORITIES.map((priority, index) => (
                  <motion.div
                    key={priority.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 ${
                        selectedPriority === priority.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-primary/30"
                      }`}
                      onClick={() => handleSelectPriority(priority.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`mb-2 ${priority.color} flex justify-center`}>
                          {priority.icon}
                        </div>
                        <h3 className="font-semibold mb-1">{priority.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {priority.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Link para pular */}
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipWelcome}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Ir direto para o dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PersonalizedToolPlan
                priority={selectedPriority!}
                userPlan={regime}
                onStartTool={handleSkipToTool}
                onChangePriority={() => setShowPlan(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WelcomeAI;
