import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCnpj, cleanCnpj, formatCep, cleanCep } from "@/lib/utils";

interface UnitDataStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const UnitDataStep = ({ data, onUpdate, onNext, onPrevious }: UnitDataStepProps) => {
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleCnpjLookup = async (cnpj: string) => {
    const cleanedCnpj = cleanCnpj(cnpj);
    if (cleanedCnpj.length !== 14) return;

    setIsLoadingCnpj(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('api-lookup', {
        body: { type: 'cnpj', value: cleanedCnpj }
      });

      if (error) throw error;

      if (result?.success) {
        const fantasyName = result.data.nome || result.data.razao_social || "";
        const dynamicGroupName = `${fantasyName} - ${data.unit_city}/${data.unit_uf}`;
        
        onUpdate({
          fantasy_name: fantasyName,
          group_name: dynamicGroupName,
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

  // Update group_name when city or UF changes
  const updateGroupName = () => {
    if (data.fantasy_name && data.unit_city && data.unit_uf) {
      const dynamicGroupName = `${data.fantasy_name} - ${data.unit_city}/${data.unit_uf}`;
      onUpdate({ group_name: dynamicGroupName });
    }
  };

  const handleCepLookup = async (cep: string) => {
    const cleanedCep = cleanCep(cep);
    if (cleanedCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('api-lookup', {
        body: { type: 'cep', value: cleanedCep }
      });

      if (error) throw error;

      if (result?.success) {
        const updates = {
          unit_address: result.data.logradouro || "",
          unit_neighborhood: result.data.bairro || "",
          unit_city: result.data.localidade || "",
          unit_state: result.data.localidade || "",
          unit_uf: result.data.uf || "",
        };
        
        onUpdate(updates);
        
        // Update group_name if fantasy_name exists
        if (data.fantasy_name) {
          const dynamicGroupName = `${data.fantasy_name} - ${updates.unit_city}/${updates.unit_uf}`;
          onUpdate({ group_name: dynamicGroupName });
        }
        
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
    const cleanedCnpj = cleanCnpj(data.cnpj || "");
    const cleanedCep = cleanCep(data.unit_postal_code || "");
    if (!cleanedCnpj || !data.group_name || !data.group_code || !cleanedCep || !data.unit_address || !data.unit_city) {
      toast.error("Preencha todos os campos obrigatórios da unidade e endereço");
      return;
    }
    onNext();
  };

  return (
    <>
      <div className="form-section">
        <div className="space-y-8">
          {/* Dados Básicos da Unidade */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados Básicos da Unidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <div className="relative">
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={formatCnpj(data.cnpj || "")}
                    onChange={(e) => {
                      const cleanedValue = cleanCnpj(e.target.value);
                      onUpdate({ cnpj: cleanedValue });
                    }}
                    onBlur={(e) => handleCnpjLookup(e.target.value)}
                    maxLength={18}
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
                <Select
                  value={data.store_model}
                  onValueChange={(value) => onUpdate({ store_model: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo da loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Júnior</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="padrao">Padrão</SelectItem>
                    <SelectItem value="intermediaria">Intermediária</SelectItem>
                    <SelectItem value="mega store">Mega Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_phase">Fase da Loja</Label>
                <Select
                  value={data.store_phase}
                  onValueChange={(value) => {
                    onUpdate({ store_phase: value });
                    // Reset store_imp_phase when changing store_phase
                    if (value === "operacao") {
                      onUpdate({ store_imp_phase: "" });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fase da loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operacao">Operação</SelectItem>
                    <SelectItem value="implantacao">Implantação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.store_phase === "implantacao" && (
                <div className="space-y-2">
                  <Label htmlFor="store_imp_phase">Fase de Implementação</Label>
                  <Select
                    value={data.store_imp_phase}
                    onValueChange={(value) => onUpdate({ store_imp_phase: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fase de implementação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="integracao">Integração</SelectItem>
                      <SelectItem value="treinamento">Treinamento</SelectItem>
                      <SelectItem value="procura de ponto">Procura de Ponto</SelectItem>
                      <SelectItem value="estruturacao">Estruturação</SelectItem>
                      <SelectItem value="compras">Compras</SelectItem>
                      <SelectItem value="inauguracao">Inauguração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Endereço da Unidade */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Endereço da Unidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="unit_postal_code">CEP da Unidade *</Label>
                <div className="relative">
                  <Input
                    id="unit_postal_code"
                    placeholder="00000-000"
                    value={formatCep(data.unit_postal_code || "")}
                    onChange={(e) => {
                      const cleanedValue = cleanCep(e.target.value);
                      onUpdate({ unit_postal_code: cleanedValue });
                    }}
                    onBlur={(e) => handleCepLookup(e.target.value)}
                    maxLength={9}
                    className={isLoadingCep ? "api-loading" : ""}
                  />
                  {isLoadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_address">Logradouro da Unidade *</Label>
                <Input
                  id="unit_address"
                  placeholder="Rua, Avenida, etc."
                  value={data.unit_address}
                  onChange={(e) => onUpdate({ unit_address: e.target.value })}
                  disabled={isLoadingCep}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_number_address">Número</Label>
                <Input
                  id="unit_number_address"
                  placeholder="Número"
                  value={data.unit_number_address}
                  onChange={(e) => onUpdate({ unit_number_address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_address_complement">Complemento</Label>
                <Input
                  id="unit_address_complement"
                  placeholder="Apartamento, sala, etc."
                  value={data.unit_address_complement}
                  onChange={(e) => onUpdate({ unit_address_complement: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_neighborhood">Bairro</Label>
                <Input
                  id="unit_neighborhood"
                  placeholder="Bairro"
                  value={data.unit_neighborhood}
                  onChange={(e) => onUpdate({ unit_neighborhood: e.target.value })}
                  disabled={isLoadingCep}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_city">Cidade *</Label>
                <Input
                  id="unit_city"
                  placeholder="Cidade"
                  value={data.unit_city}
                  onChange={(e) => {
                    onUpdate({ unit_city: e.target.value });
                    setTimeout(updateGroupName, 0);
                  }}
                  disabled={isLoadingCep}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_state">Estado</Label>
                <Input
                  id="unit_state"
                  placeholder="Estado"
                  value={data.unit_state}
                  onChange={(e) => onUpdate({ unit_state: e.target.value })}
                  disabled={isLoadingCep}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_uf">UF</Label>
                <Input
                  id="unit_uf"
                  placeholder="UF"
                  value={data.unit_uf}
                  onChange={(e) => {
                    onUpdate({ unit_uf: e.target.value });
                    setTimeout(updateGroupName, 0);
                  }}
                  disabled={isLoadingCep}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Configurações da Unidade */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Configurações da Unidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email da Unidade</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@unidade.com"
                  value={data.email}
                  onChange={(e) => onUpdate({ email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone da Unidade</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={data.phone}
                  onChange={(e) => onUpdate({ phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_profile">Instagram da Unidade</Label>
                <Input
                  id="instagram_profile"
                  placeholder="@unidade_instagram"
                  value={data.instagram_profile}
                  onChange={(e) => onUpdate({ instagram_profile: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_parking"
                    checked={data.has_parking}
                    onCheckedChange={(checked) => onUpdate({ has_parking: checked as boolean })}
                  />
                  <Label htmlFor="has_parking">Tem estacionamento próprio</Label>
                </div>
              </div>

              {data.has_parking && (
                <div className="space-y-2">
                  <Label htmlFor="parking_spots">Vagas de Estacionamento</Label>
                  <Input
                    id="parking_spots"
                    type="number"
                    placeholder="Número de vagas"
                    value={data.parking_spots || ""}
                    onChange={(e) => onUpdate({ parking_spots: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_partner_parking"
                    checked={data.has_partner_parking}
                    onCheckedChange={(checked) => onUpdate({ has_partner_parking: checked as boolean })}
                  />
                  <Label htmlFor="has_partner_parking">Tem parceria com estacionamento</Label>
                </div>
              </div>

              {data.has_partner_parking && (
                <div className="space-y-2">
                  <Label htmlFor="partner_parking_address">Endereço do Estacionamento Parceiro</Label>
                  <Input
                    id="partner_parking_address"
                    placeholder="Endereço do estacionamento parceiro"
                    value={data.partner_parking_address}
                    onChange={(e) => onUpdate({ partner_parking_address: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchases_active"
                    checked={data.purchases_active}
                    onCheckedChange={(checked) => onUpdate({ purchases_active: checked as boolean })}
                  />
                  <Label htmlFor="purchases_active">Compras ativas</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sales_active"
                    checked={data.sales_active}
                    onCheckedChange={(checked) => onUpdate({ sales_active: checked as boolean })}
                  />
                  <Label htmlFor="sales_active">Vendas ativas</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Horários de Funcionamento */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Horários de Funcionamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="operation_mon">Segunda-feira</Label>
                <Input
                  id="operation_mon"
                  placeholder="08:00-18:00"
                  value={data.operation_mon}
                  onChange={(e) => onUpdate({ operation_mon: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_tue">Terça-feira</Label>
                <Input
                  id="operation_tue"
                  placeholder="08:00-18:00"
                  value={data.operation_tue}
                  onChange={(e) => onUpdate({ operation_tue: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_wed">Quarta-feira</Label>
                <Input
                  id="operation_wed"
                  placeholder="08:00-18:00"
                  value={data.operation_wed}
                  onChange={(e) => onUpdate({ operation_wed: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_thu">Quinta-feira</Label>
                <Input
                  id="operation_thu"
                  placeholder="08:00-18:00"
                  value={data.operation_thu}
                  onChange={(e) => onUpdate({ operation_thu: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_fri">Sexta-feira</Label>
                <Input
                  id="operation_fri"
                  placeholder="08:00-18:00"
                  value={data.operation_fri}
                  onChange={(e) => onUpdate({ operation_fri: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_sat">Sábado</Label>
                <Input
                  id="operation_sat"
                  placeholder="08:00-18:00"
                  value={data.operation_sat}
                  onChange={(e) => onUpdate({ operation_sat: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_sun">Domingo</Label>
                <Input
                  id="operation_sun"
                  placeholder="08:00-18:00"
                  value={data.operation_sun}
                  onChange={(e) => onUpdate({ operation_sun: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_hol">Feriados</Label>
                <Input
                  id="operation_hol"
                  placeholder="08:00-18:00 ou Fechado"
                  value={data.operation_hol}
                  onChange={(e) => onUpdate({ operation_hol: e.target.value })}
                />
              </div>
            </div>
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

      {/* Loading Overlays */}
      {isLoadingCnpj && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg text-center max-w-sm mx-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Buscando dados da empresa...</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto localizamos as informações do CNPJ
            </p>
          </div>
        </div>
      )}

      {isLoadingCep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg text-center max-w-sm mx-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Buscando endereço da unidade...</h3>
            <p className="text-sm text-muted-foreground">
              Localizando dados do CEP da unidade
            </p>
          </div>
        </div>
      )}
    </>
  );
};