import { useState, useEffect } from "react";
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
  MUNICIPIOS_PRINCIPAIS,
  CST_OPTIONS,
  UNIDADE_OPTIONS,
} from "./rtcConstants";

const itemSchema = z.object({
  ncm: z.string()
    .transform(val => val.replace(/\D/g, "")) // Remove non-digits
    .pipe(z.string().length(8, "NCM deve ter exatamente 8 dígitos numéricos")),
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
    }
  }, [watchedUf, selectedUf, setValue]);

  const municipios = MUNICIPIOS_PRINCIPAIS[selectedUf] || [];

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
              <Select
                value={watch("municipio")?.toString() || ""}
                onValueChange={(value) => {
                  const codigo = parseInt(value);
                  setValue("municipio", codigo);
                  const mun = municipios.find((m) => m.codigo === codigo);
                  setMunicipioNome(mun?.nome || "");
                }}
                disabled={!selectedUf}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Selecione o município" />
                </SelectTrigger>
                <SelectContent>
                  {municipios.map((mun) => (
                    <SelectItem key={mun.codigo} value={mun.codigo.toString()}>
                      {mun.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {/* NCM */}
                  <div className="space-y-2">
                    <Label>NCM</Label>
                    <div className="flex gap-2">
                      <Input
                        {...register(`itens.${index}.ncm`)}
                        placeholder="6910.11.00 ou 69101100"
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
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
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
