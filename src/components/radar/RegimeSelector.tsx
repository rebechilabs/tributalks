import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { REGIME_CONFIGS, type RegimeType } from './regimeConfig';

interface RegimeSelectorProps {
  selectedRegime: RegimeType | null;
  onSelect: (regime: RegimeType) => void;
  onNext: () => void;
}

const REGIME_LIST: RegimeType[] = ['simples', 'presumido', 'real'];

export function RegimeSelector({ selectedRegime, onSelect, onNext }: RegimeSelectorProps) {
  const { user } = useAuth();
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-detect regime from DRE / company_profile
  useEffect(() => {
    if (!user || selectedRegime) return;

    const detect = async () => {
      // Try company_profile first
      const { data: profile } = await supabase
        .from('company_profile')
        .select('regime_tributario')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.regime_tributario) {
        const map: Record<string, RegimeType> = {
          simples_nacional: 'simples',
          simples: 'simples',
          lucro_presumido: 'presumido',
          presumido: 'presumido',
          lucro_real: 'real',
          real: 'real',
        };
        const mapped = map[profile.regime_tributario.toLowerCase()];
        if (mapped) {
          onSelect(mapped);
          setAutoDetected(true);
          return;
        }
      }

      // Try company_dre
      const { data: dre } = await supabase
        .from('company_dre')
        .select('input_regime_tributario')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dre?.input_regime_tributario) {
        const map: Record<string, RegimeType> = {
          simples_nacional: 'simples',
          simples: 'simples',
          lucro_presumido: 'presumido',
          presumido: 'presumido',
          lucro_real: 'real',
          real: 'real',
        };
        const mapped = map[dre.input_regime_tributario.toLowerCase()];
        if (mapped) {
          onSelect(mapped);
          setAutoDetected(true);
        }
      }
    };

    detect();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Qual é o seu regime tributário?</h2>
        <p className="text-muted-foreground text-sm">
          Selecione o regime para personalizar a análise de créditos
        </p>
        {autoDetected && (
          <p className="text-xs text-primary">
            ✓ Regime detectado automaticamente a partir dos seus dados
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REGIME_LIST.map((regimeId) => {
          const config = REGIME_CONFIGS[regimeId];
          const Icon = config.icon;
          const isSelected = selectedRegime === regimeId;

          return (
            <Card
              key={regimeId}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:border-primary/50'
              )}
              onClick={() => onSelect(regimeId)}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div
                  className={cn(
                    'mx-auto w-12 h-12 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-primary/20' : 'bg-muted'
                  )}
                >
                  <Icon className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <h3 className="font-semibold">{config.label}</h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!selectedRegime}>
          Próximo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
