import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

const CREDITS = [
  { type: "ICMS-ST", value: 23500, icon: "📦" },
  { type: "PIS/COFINS", value: 15800, icon: "💰" },
  { type: "IPI", value: 7700, icon: "🏭" },
];

export function DemoStepRadar() {
  const [total, setTotal] = useState(0);
  const [visibleCredits, setVisibleCredits] = useState(0);
  const targetTotal = 47000;

  useEffect(() => {
    // Anima o contador total
    const interval = setInterval(() => {
      setTotal((prev) => {
        if (prev >= targetTotal) {
          clearInterval(interval);
          return targetTotal;
        }
        return prev + 1200;
      });
    }, 80);

    // Revela créditos um por um
    const creditInterval = setInterval(() => {
      setVisibleCredits((prev) => {
        if (prev >= CREDITS.length) {
          clearInterval(creditInterval);
          return CREDITS.length;
        }
        return prev + 1;
      });
    }, 1200);

    return () => {
      clearInterval(interval);
      clearInterval(creditInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.15, 1],
            boxShadow: [
              "0 0 0 0 rgba(34, 197, 94, 0.4)",
              "0 0 0 20px rgba(34, 197, 94, 0)",
              "0 0 0 0 rgba(34, 197, 94, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <TrendingUp className="w-12 h-12 text-green-500" />
        </motion.div>

        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background border border-border rounded-lg px-4 py-2 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Créditos Identificados</span>
          </div>
          <motion.p
            className="text-2xl font-bold text-green-500 text-center"
            key={total}
          >
            R$ {(total / 1000).toFixed(0)}k
          </motion.p>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 mt-8 w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {CREDITS.slice(0, visibleCredits).map((credit, index) => (
          <motion.div
            key={credit.type}
            className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{credit.icon}</span>
              <span className="font-medium text-foreground">{credit.type}</span>
            </div>
            <span className="text-green-500 font-semibold">
              R$ {(credit.value / 1000).toFixed(1)}k
            </span>
          </motion.div>
        ))}
      </motion.div>

      {visibleCredits === CREDITS.length && (
        <motion.p
          className="text-sm text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Média de créditos recuperados: R$ 47k por empresa
        </motion.p>
      )}
    </div>
  );
}
