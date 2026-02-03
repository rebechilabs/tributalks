import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export function DemoStepUpload() {
  const [progress, setProgress] = useState(0);
  const [filesProcessed, setFilesProcessed] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    const filesInterval = setInterval(() => {
      setFilesProcessed((prev) => {
        if (prev >= 47) {
          clearInterval(filesInterval);
          return 47;
        }
        return prev + 3;
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(filesInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Upload className="w-16 h-16 text-primary" />
        </motion.div>
        
        {/* Arquivos flutuando */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ x: -100 + i * 50, y: -50, opacity: 0 }}
            animate={{ 
              x: 0, 
              y: 0, 
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <FileText className="w-8 h-8 text-muted-foreground" />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="text-center space-y-4 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-foreground">Enviando XMLs</h3>
        
        <p className="text-muted-foreground">
          Processando {filesProcessed} de 47 notas fiscais...
        </p>

        {/* Progress bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <motion.div
          className="flex items-center justify-center gap-2 text-sm"
          animate={{ opacity: progress === 100 ? 1 : 0.7 }}
        >
          {progress === 100 ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-green-500 font-medium">Upload concluído!</span>
            </>
          ) : (
            <span className="text-muted-foreground">{progress}%</span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
