import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Search, Calculator, RotateCcw, Loader2 } from "lucide-react";
import { NCMSearchModal } from "./NCMSearchModal";
import {
  UF_OPTIONS,
  CST_OPTIONS,
  UNIDADE_OPTIONS,
} from "./rtcConstants";
import { useMunicipios } from "@/hooks/useMunicipios";

// Detecta automaticamente: NCM (8 dígitos para produtos) ou NBS (5-9 dígitos para serviços)
const codigoSchema = z.string()
  .min(1, "Informe o código NCM ou NBS")
  .transform(val => val.replace(/\D/g, "")) // Remove non-digits (dots, dashes, etc.)
  .refine(
    val => [5, 6, 7, 8, 9].includes(val.length),
    { message: "Código inválido: informe NCM (8 dígitos) ou NBS (5 a 9 dígitos, ex: 1.0501)" }
  );

const itemSchema = z.object({
  ncm: codigoSchema, // Campo unificado que aceita NCM ou NBS
  descricao: z.string().optional(),
  quantidade: z.number().min(0.01, "Quantidade inválida"),
  unidade: z.string().min(1, "Selecione a unidade"),
  valorUnitario: z.number().min(0.01, "Valor inválido"),
  cst: z.string().min(1, "Selecione o CST"),
});

const formSchema = z.object({
  uf: z.string().min(1, "Selecione a UF"),
  municipio: z.number().min(1, "Selecione o município"),
  itens: z.array(itemSchema).min(1, "Adicione ao menos um item"),
});

export type TaxFormData = z.infer<typeof formSchema>;

interface TaxCalculatorFormProps {
  onSubmit: (data: TaxFormData, municipioNome: string) => Promise<void>;
  isLoading: boolean;
}

export function TaxCalculatorForm({ onSubmit, isLoading }: TaxCalculatorFormProps) {
  const [ncmModalOpen, setNcmModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [selectedUf, setSelectedUf] = useState("");
  const [municipioNome, setMunicipioNome] = useState("");
  const [municipioSearch, setMunicipioSearch] = useState("");
  
  // Fetch municipalities dynamically from API
  const { municipios: allMunicipios, isLoading: municipiosLoading, error: municipiosError } = useMunicipios(selectedUf);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uf: "",
      municipio: 0,
      itens: [
        {
          ncm: "",
          descricao: "",
          quantidade: 1,
          unidade: "UN",
          valorUnitario: 0,
          cst: "000",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });

  const watchedUf = watch("uf");
  const watchedItens = watch("itens");

  useEffect(() => {
    if (watchedUf !== selectedUf) {
      setSelectedUf(watchedUf);
      setValue("municipio", 0);
      setMunicipioNome("");
      setMunicipioSearch("");
    }
  }, [watchedUf, selectedUf, setValue]);

  // Filter municipalities based on search
  const filteredMunicipios = useMemo(() => {
    if (!municipioSearch.trim()) return allMunicipios;
    const searchLower = municipioSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return allMunicipios.filter(m => 
      m.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchLower)
    );
  }, [allMunicipios, municipioSearch]);
  // No longer needed - municipios come from useMunicipios hook
  // const municipios = MUNICIPIOS_PRINCIPAIS[selectedUf] || [];
  const totalBase = watchedItens.reduce(
    (acc, item) => acc + (item.quantidade || 0) * (item.valorUnitario || 0),
    0
  );

  const handleNCMSelect = (ncm: string, descricao: string) => {
    if (activeItemIndex !== null) {
      setValue(`itens.${activeItemIndex}.ncm`, ncm);
      setValue(`itens.${activeItemIndex}.descricao`, descricao);
    }
    setNcmModalOpen(false);
  };

  const handleFormSubmit = async (data: TaxFormData) => {
    await onSubmit(data, municipioNome);
  };

  const handleReset = () => {
    reset();
    setSelectedUf("");
    setMunicipioNome("");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <>
      <NCMSearchModal
        open={ncmModalOpen}
        onOpenChange={setNcmModalOpen}
        onSelect={handleNCMSelect}
      />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Location Selection */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">
              Localização da Operação
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uf">Estado (UF)</Label>
              <Select
                value={watchedUf}
                onValueChange={(value) => setValue("uf", value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {UF_OPTIONS.map((uf) => (
                    <SelectItem key={uf.value} value={uf.value}>
                      {uf.value} - {uf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.uf && (
                <p className="text-sm text-destructive">{errors.uf.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipio">Município</Label>
              {municipiosLoading ? (
                <div className="flex items-center gap-2 h-10 px-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando municípios...
                </div>
              ) : municipiosError ? (
                <p className="text-sm text-destructive">{municipiosError}</p>
              ) : (
                <>
                  {/* Search input for large municipality lists */}
                  {allMunicipios.length > 50 && (
                    <Input
                      type="text"
                      placeholder="Filtrar municípios..."
                      value={municipioSearch}
                      onChange={(e) => setMunicipioSearch(e.target.value)}
                      className="mb-2"
                    />
                  )}
                  <Select
                    value={watch("municipio")?.toString() || ""}
                    onValueChange={(value) => {
                      const codigo = parseInt(value);
                      setValue("municipio", codigo);
                      const mun = allMunicipios.find((m) => parseInt(m.codigo_ibge) === codigo);
                      setMunicipioNome(mun?.nome || "");
                    }}
                    disabled={!selectedUf || allMunicipios.length === 0}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder={
                        !selectedUf 
                          ? "Selecione o estado primeiro" 
                          : allMunicipios.length === 0 
                            ? "Nenhum município encontrado" 
                            : "Selecione o município"
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {filteredMunicipios.slice(0, 100).map((mun) => (
                        <SelectItem key={mun.codigo_ibge} value={mun.codigo_ibge}>
                          {mun.nome}
                        </SelectItem>
                      ))}
                      {filteredMunicipios.length > 100 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                          Mostrando 100 de {filteredMunicipios.length} - use o filtro acima
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {allMunicipios.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {allMunicipios.length} municípios disponíveis
                    </p>
                  )}
                </>
              )}
              {errors.municipio && (
                <p className="text-sm text-destructive">
                  {errors.municipio.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">
                Itens da Operação
              </CardTitle>
              <Badge variant="secondary">{fields.length} item(ns)</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-lg border border-border bg-background space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Item {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* NCM/NBS */}
                  <div className="space-y-2">
                    <Label>
                      NCM / NBS
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {(() => {
                          const code = watchedItens[index]?.ncm?.replace(/\D/g, "") || "";
                          if (code.length === 8) return "(Produto)";
                          if (code.length === 9) return "(Serviço)";
                          return "";
                        })()}
                      </span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        {...register(`itens.${index}.ncm`)}
                        placeholder="NCM: 8 dígitos | NBS: 9 dígitos"
                        className={`bg-card border-border font-mono ${errors.itens?.[index]?.ncm ? 'border-destructive' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setActiveItemIndex(index);
                          setNcmModalOpen(true);
                        }}
                        title="Buscar NCM de produto"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Produtos: NCM 8 dígitos (ex: 69101100) • Serviços: NBS 5-9 dígitos (ex: 1.0501)
                    </p>
                    {errors.itens?.[index]?.ncm && (
                      <p className="text-xs text-destructive">
                        {errors.itens[index].ncm?.message}
                      </p>
                    )}
                    {watchedItens[index]?.descricao && (
                      <p className="text-xs text-muted-foreground truncate">
                        {watchedItens[index].descricao}
                      </p>
                    )}
                  </div>

                  {/* CST */}
                  <div className="space-y-2">
                    <Label>CST (Código de Situação Tributária)</Label>
                    <Select
                      value={watchedItens[index]?.cst || ""}
                      onValueChange={(value) =>
                        setValue(`itens.${index}.cst`, value)
                      }
                    >
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {CST_OPTIONS.map((cst) => (
                          <SelectItem key={cst.value} value={cst.value}>
                            {cst.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantidade */}
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register(`itens.${index}.quantidade`, {
                        valueAsNumber: true,
                      })}
                      className="bg-card border-border"
                    />
                  </div>

                  {/* Unidade */}
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select
                      value={watchedItens[index]?.unidade || ""}
                      onValueChange={(value) =>
                        setValue(`itens.${index}.unidade`, value)
                      }
                    >
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADE_OPTIONS.map((un) => (
                          <SelectItem key={un.value} value={un.value}>
                            {un.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Valor Unitário */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Valor Unitário (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register(`itens.${index}.valorUnitario`, {
                        valueAsNumber: true,
                      })}
                      className="bg-card border-border"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                append({
                  ncm: "",
                  descricao: "",
                  quantidade: 1,
                  unidade: "UN",
                  valorUnitario: 0,
                  cst: "000",
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-card border-border">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base de Cálculo Total</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(totalBase)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Calcular Tributos
          </Button>
        </div>
      </form>
    </>
  );
}
