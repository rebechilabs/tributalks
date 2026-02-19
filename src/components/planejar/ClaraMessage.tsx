import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClaraMessageProps {
  message: string;
  typewriter?: boolean;
  className?: string;
}

export function ClaraMessage({ message, typewriter = true, className }: ClaraMessageProps) {
  const [displayedText, setDisplayedText] = useState(typewriter ? '' : message);
  const [done, setDone] = useState(!typewriter);

  useEffect(() => {
    if (!typewriter) {
      setDisplayedText(message);
      setDone(true);
      return;
    }

    setDisplayedText('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [message, typewriter]);

  return (
    <div className={cn("flex gap-3 items-start", className)}>
      <div className="shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
        <p className="text-sm text-foreground leading-relaxed">
          {displayedText}
          {!done && <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />}
        </p>
      </div>
    </div>
  );
}
