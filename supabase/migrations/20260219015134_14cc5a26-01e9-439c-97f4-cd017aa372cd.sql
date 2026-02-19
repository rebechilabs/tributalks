
CREATE OR REPLACE FUNCTION public.infer_macro_segmento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.setor IN ('servicos_profissionais','tecnologia_saas',
    'corretagem_seguros','educacao','saude',
    'logistica_transporte','imobiliario') THEN
    NEW.segmento := 'servicos';
  ELSIF NEW.setor IN ('ecommerce','varejo_fisico',
    'distribuicao_atacado','alimentacao_bares_restaurantes') THEN
    NEW.segmento := 'comercio';
  ELSIF NEW.setor IN ('industria_alimentos_bebidas',
    'industria_metal_mecanica','agro','construcao_incorporacao') THEN
    NEW.segmento := 'industria';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
