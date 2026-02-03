import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { useEffect, useState } from "react";

export function DemoStepClara() {
  const [typingText, setTypingText] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const question = "Como a Reforma vai afetar minha empresa?";
  const answer =
    "Com base nos seus dados, a CBS e IBS vão substituir PIS/COFINS e ICMS. Sua carga tributária estimada aumenta 8,5%. Recomendo ajustar preços ou otimizar margens.";

  useEffect(() => {
    const timer = setTimeout(() => setShowAnswer(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showAnswer) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= answer.length) {
        setTypingText(answer.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [showAnswer]);

  return (
    <div className="flex flex-col h-full gap-4 max-w-lg mx-auto">
      <motion.div
        className="flex-1 flex flex-col gap-4 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* User question */}
        <motion.div
          className="flex gap-3 justify-end"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
            <p className="text-sm">{question}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Clara typing indicator */}
        {showAnswer && !typingText && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <motion.span
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Clara answer */}
        {typingText && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-foreground">
                {typingText}
                {typingText.length < answer.length && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.p
        className="text-sm text-muted-foreground text-center pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Clara AI responde 24/7 com base nos seus dados reais
      </motion.p>
    </div>
  );
}
