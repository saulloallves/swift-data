import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UnitDataStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const UnitDataStep = ({ data, onUpdate, onNext, onPrevious }: UnitDataStepProps) => {
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);

  const handleCnpjLookup = async (cnpj: string) => {
    if (cnpj.length !== 14) return;

    setIsLoadingCnpj(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('api-lookup', {
        body: { type: 'cnpj', value: cnpj }
      });

      if (error) throw error;

      if (result?.success) {
        onUpdate({
          group_name: result.data.nome || result.data.razao_social || "",
        });
        toast.success("Dados da empresa encontrados");
      } else {
        toast.warning("CNPJ não encontrado");
      }
    } catch (error) {
      console.error('CNPJ lookup error:', error);
      toast.error("Erro ao buscar dados do CNPJ");
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const handleSubmit = () => {
    if (!data.cnpj || !data.group_name || !data.group_code) {
      toast.error("Preencha todos os campos obrigatórios da unidade");
      return;
    }
    onNext();
  };

  return (
    <div className="form-section">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <div className="relative">
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={data.cnpj}
              onChange={(e) => onUpdate({ cnpj: e.target.value })}
              onBlur={(e) => handleCnpjLookup(e.target.value)}
              maxLength={14}
              className={isLoadingCnpj ? "api-loading" : ""}
            />
            {isLoadingCnpj && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="group_name">Nome da Unidade *</Label>
          <Input
            id="group_name"
            placeholder="Nome da unidade/franquia"
            value={data.group_name}
            onChange={(e) => onUpdate({ group_name: e.target.value })}
            disabled={isLoadingCnpj}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group_code">Código da Unidade *</Label>
          <Input
            id="group_code"
            type="number"
            placeholder="Código numérico da unidade"
            value={data.group_code || ""}
            onChange={(e) => onUpdate({ group_code: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_model">Modelo da Loja</Label>
          <Select value={data.store_model} onValueChange={(value) => onUpdate({ store_model: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Júnior</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="padrao">Padrão</SelectItem>
              <SelectItem value="intermediaria">Intermediária</SelectItem>
              <SelectItem value="mega_store">Mega Store</SelectItem>
              <SelectItem value="pontinha">Pontinha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_phase">Fase da Loja</Label>
          <Select value={data.store_phase} onValueChange={(value) => onUpdate({ store_phase: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="implantacao">Implantação</SelectItem>
              <SelectItem value="operacao">Operação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_imp_phase">Fase de Implementação</Label>
          <Select value={data.store_imp_phase} onValueChange={(value) => onUpdate({ store_imp_phase: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="integracao">Integração</SelectItem>
              <SelectItem value="treinamento">Treinamento</SelectItem>
              <SelectItem value="procura_de_ponto">Procura de Ponto</SelectItem>
              <SelectItem value="estruturacao">Estruturação</SelectItem>
              <SelectItem value="compras">Compras</SelectItem>
              <SelectItem value="inauguracao">Inauguração</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_unit">E-mail da Unidade</Label>
          <Input
            id="email_unit"
            type="email"
            placeholder="unidade@email.com"
            value={data.email_unit}
            onChange={(e) => onUpdate({ email_unit: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_unit">Telefone da Unidade</Label>
          <Input
            id="phone_unit"
            placeholder="(11) 99999-9999"
            value={data.phone_unit}
            onChange={(e) => onUpdate({ phone_unit: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_profile">Perfil do Instagram</Label>
          <Input
            id="instagram_profile"
            placeholder="@usuario_instagram"
            value={data.instagram_profile}
            onChange={(e) => onUpdate({ instagram_profile: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_parking"
            checked={data.has_parking}
            onCheckedChange={(checked) => onUpdate({ has_parking: checked as boolean })}
          />
          <Label htmlFor="has_parking">Possui estacionamento próprio?</Label>
        </div>

        {data.has_parking && (
          <div className="space-y-2">
            <Label htmlFor="parking_spots">Número de Vagas</Label>
            <Input
              id="parking_spots"
              type="number"
              placeholder="Número de vagas"
              value={data.parking_spots || ""}
              onChange={(e) => onUpdate({ parking_spots: parseInt(e.target.value) || 0 })}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_partner_parking"
            checked={data.has_partner_parking}
            onCheckedChange={(checked) => onUpdate({ has_partner_parking: checked as boolean })}
          />
          <Label htmlFor="has_partner_parking">Possui convênio com estacionamento?</Label>
        </div>

        {data.has_partner_parking && (
          <div className="space-y-2">
            <Label htmlFor="partner_parking_address">Endereço do Estacionamento Conveniado</Label>
            <Input
              id="partner_parking_address"
              placeholder="Endereço do estacionamento"
              value={data.partner_parking_address}
              onChange={(e) => onUpdate({ partner_parking_address: e.target.value })}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="purchases_active"
            checked={data.purchases_active}
            onCheckedChange={(checked) => onUpdate({ purchases_active: checked as boolean })}
          />
          <Label htmlFor="purchases_active">Compras ativas?</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sales_active"
            checked={data.sales_active}
            onCheckedChange={(checked) => onUpdate({ sales_active: checked as boolean })}
          />
          <Label htmlFor="sales_active">Vendas ativas?</Label>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">Horários de Funcionamento</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'operation_mon', label: 'Segunda' },
            { key: 'operation_tue', label: 'Terça' },
            { key: 'operation_wed', label: 'Quarta' },
            { key: 'operation_thu', label: 'Quinta' },
            { key: 'operation_fri', label: 'Sexta' },
            { key: 'operation_sat', label: 'Sábado' },
            { key: 'operation_sun', label: 'Domingo' },
            { key: 'operation_hol', label: 'Feriados' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                placeholder="08:00-18:00"
                value={data[key as keyof OnboardingFormData] as string}
                onChange={(e) => onUpdate({ [key]: e.target.value })}
              />
            </div>
          ))}
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