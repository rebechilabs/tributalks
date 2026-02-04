import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DemoStepScore() {
  const [score, setScore] = useState(0);
  const targetScore = 72;

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => {
        if (prev >= targetScore) {
          clearInterval(interval);
          return targetScore;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // Calcula ângulo do gauge (0-180 graus)
  const rotation = (score / 100) * 180 - 90;

  // Calcula a cor baseada no score
  const getScoreColor = () => {
    if (score < 40) return "hsl(var(--destructive))";
    if (score < 70) return "hsl(var(--warning, 38 92% 50%))";
    return "hsl(var(--primary))";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Gauge circular */}
        <svg width="200" height="120" viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score / 100 }}
            transition={{ duration: 0.1 }}
          />

          {/* Needle */}
          <motion.g
            style={{ transformOrigin: "100px 100px" }}
            animate={{ rotate: rotation }}
            transition={{ duration: 0.1 }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </motion.g>
          
          {/* Center dot */}
          <circle cx="100" cy="100" r="8" fill="hsl(var(--foreground))" />
        </svg>

        {/* Score number */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.span
            className="text-5xl font-bold text-foreground"
            key={score}
          >
            {score}
          </motion.span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
      </motion.div>

      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-foreground">Score Tributário Calculado</h3>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: score >= targetScore ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full font-semibold text-lg">
            Nota B
          </span>
        </motion.div>

        <p className="text-muted-foreground">
          Sua empresa está na média do setor
        </p>
      </motion.div>
    </div>
  );
}
