import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddressStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const AddressStep = ({ data, onUpdate, onNext, onPrevious }: AddressStepProps) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleCepLookup = async (cep: string) => {
    if (cep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('api-lookup', {
        body: { type: 'cep', value: cep }
      });

      if (error) throw error;

      if (result?.success) {
        onUpdate({
          unit_address: result.data.logradouro || "",
          unit_neighborhood: result.data.bairro || "",
          unit_city: result.data.localidade || "",
          unit_state: result.data.localidade || "",
          unit_uf: result.data.uf || "",
        });
        toast.success("Endereço encontrado e preenchido automaticamente");
      } else {
        toast.warning("CEP não encontrado");
      }
    } catch (error) {
      console.error('CEP lookup error:', error);
      toast.error("Erro ao buscar dados do CEP");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSubmit = () => {
    if (!data.unit_postal_code || !data.unit_address || !data.unit_city) {
      toast.error("Preencha todos os campos obrigatórios de endereço");
      return;
    }
    onNext();
  };

  return (
    <div className="form-section">
      <h3 className="text-lg font-semibold mb-6">Endereço da Unidade</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="postal_code">CEP *</Label>
          <div className="relative">
            <Input
              id="postal_code"
              placeholder="00000-000"
              value={data.unit_postal_code}
              onChange={(e) => onUpdate({ unit_postal_code: e.target.value })}
              onBlur={(e) => handleCepLookup(e.target.value)}
              maxLength={8}
              className={isLoadingCep ? "api-loading" : ""}
            />
            {isLoadingCep && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Logradouro *</Label>
          <Input
            id="address"
            placeholder="Rua, Avenida, etc."
            value={data.unit_address}
            onChange={(e) => onUpdate({ unit_address: e.target.value })}
            disabled={isLoadingCep}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number_address">Número</Label>
          <Input
            id="number_address"
            placeholder="Número"
            value={data.unit_number_address}
            onChange={(e) => onUpdate({ unit_number_address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_complement">Complemento</Label>
          <Input
            id="address_complement"
            placeholder="Apartamento, bloco, etc."
            value={data.unit_address_complement}
            onChange={(e) => onUpdate({ unit_address_complement: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            placeholder="Bairro"
            value={data.unit_neighborhood}
            onChange={(e) => onUpdate({ unit_neighborhood: e.target.value })}
            disabled={isLoadingCep}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            placeholder="Cidade"
            value={data.unit_city}
            onChange={(e) => onUpdate({ unit_city: e.target.value })}
            disabled={isLoadingCep}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            placeholder="Estado"
            value={data.unit_state}
            onChange={(e) => onUpdate({ unit_state: e.target.value })}
            disabled={isLoadingCep}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="uf">UF</Label>
          <Input
            id="uf"
            placeholder="UF"
            value={data.unit_uf}
            onChange={(e) => onUpdate({ unit_uf: e.target.value })}
            disabled={isLoadingCep}
            maxLength={2}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={onPrevious} variant="outline">
          Anterior
        </Button>
        <Button onClick={handleSubmit}>
          Próximo
        </Button>
      </div>
    </div>
  );
};