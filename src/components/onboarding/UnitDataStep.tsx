import { useState, useEffect, useRef, useMemo } from "react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCnpj, cleanCnpj, formatCep, cleanCep, formatPhoneNumber, cleanPhoneNumber } from "@/lib/utils";

// Função para formatar horário de funcionamento XX:XX-XX:XX
const formatOperatingHours = (value: string) => {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!cleaned) return '';
  
  // Formata os números progressivamente
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}:${cleaned.slice(6, 8)}`;
  }
};

// Função para formatar horário com texto livre (domingo e feriados)
const formatOperatingHoursWithText = (value: string) => {
  // Se contém apenas números, aplica a máscara
  if (/^\d+$/.test(value.replace(/[:\-]/g, ''))) {
    return formatOperatingHours(value);
  }
  // Caso contrário, permite texto livre
  return value;
};

// Função para limpar horário de funcionamento (manter apenas números)
const cleanOperatingHours = (value: string) => {
  return value.replace(/\D/g, '');
};

// Função para limpar horário com texto livre (domingo e feriados)
const cleanOperatingHoursWithText = (value: string) => {
  // Se contém apenas números e separadores, limpa para aplicar máscara
  if (/^[\d:\-]+$/.test(value)) {
    return value.replace(/\D/g, '');
  }
  // Caso contrário, mantém o texto original
  return value;
};

interface UnitDataStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  linkExistingUnit: (unitId: string) => Promise<boolean>;
}

export const UnitDataStep = ({ data, onUpdate, onNext, onPrevious, linkExistingUnit }: UnitDataStepProps) => {
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [showExistingUnitModal, setShowExistingUnitModal] = useState(false);
  const [isLinkingUnit, setIsLinkingUnit] = useState(false);
  const [existingUnitInfo, setExistingUnitInfo] = useState<{
    fantasy_name: string;
    franqueado_name: string;
    unit_id: string;
  } | null>(null);
  
  // Estados para o sistema de sugestões de unidades antigas
  const [oldUnitSuggestions, setOldUnitSuggestions] = useState<{group_code: number, group_name: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingOldUnits, setIsLoadingOldUnits] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const groupCodeInputRef = useRef<HTMLInputElement>(null);
  
  // Cache de unidades e estados de validação
  const [allUnitsCache, setAllUnitsCache] = useState<{group_code: number, group_name: string}[]>([]);
  const [isValidUnitSelected, setIsValidUnitSelected] = useState(false);
  const [selectedUnitCode, setSelectedUnitCode] = useState<number | null>(null);
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  // Carregar cache de unidades na inicialização
  useEffect(() => {
    const loadUnitsCache = async () => {
      if (isCacheLoaded) return;
      
      try {
        console.log('📦 Carregando cache de unidades...');
        const { data: rawData, error } = await supabase
          .from('unidades_old' as any)
          .select('group_code, group_name')
          .not('group_code', 'is', null)
          .not('group_name', 'is', null)
          .order('group_code', { ascending: true });

        if (error) throw error;

        const validUnits = (rawData || []).map((unit: any) => ({
          group_code: Number(unit.group_code),
          group_name: unit.group_name
        }));

        setAllUnitsCache(validUnits);
        setIsCacheLoaded(true);
        console.log('✅ Cache carregado:', validUnits.length, 'unidades disponíveis');
      } catch (error) {
        console.error('❌ Erro ao carregar cache:', error);
      }
    };

    loadUnitsCache();
  }, [isCacheLoaded]);

  // Função para buscar sugestões usando o cache local
  const searchOldUnits = (groupCode: string) => {
    if (!groupCode || groupCode.length < 1) {
      setOldUnitSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!isCacheLoaded || !allUnitsCache || allUnitsCache.length === 0) {
      console.log('⏳ Cache ainda carregando ou vazio...');
      return;
    }

    console.log('🔍 Buscando no cache para código:', groupCode);
    
    // Filtrar unidades do cache
    const filteredData = allUnitsCache
      .filter(unit => {
        const unitCode = unit.group_code.toString();
        const searchCode = groupCode.toString();
        return unitCode.includes(searchCode);
      })
      .sort((a, b) => {
        // Priorizar resultados que começam com o código digitado
        const aCode = a.group_code.toString();
        const bCode = b.group_code.toString();
        const searchCode = groupCode.toString();
        
        const aStartsWithSearch = aCode.startsWith(searchCode);
        const bStartsWithSearch = bCode.startsWith(searchCode);
        
        if (aStartsWithSearch && !bStartsWithSearch) return -1;
        if (!aStartsWithSearch && bStartsWithSearch) return 1;
        
        return a.group_code - b.group_code;
      });

    console.log('🎯 Filtrados do cache:', filteredData.length);

    if (filteredData.length > 0) {
      const suggestions = filteredData.slice(0, 15);
      setOldUnitSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setOldUnitSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounce para a busca de unidades antigas
  const debouncedSearchOldUnits = useMemo(
    () => debounce(searchOldUnits, 200),
    [allUnitsCache, isCacheLoaded]
  );

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          groupCodeInputRef.current && !groupCodeInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Função para lidar com clique na sugestão
  const handleSuggestionClick = (suggestion: {group_code: number, group_name: string}) => {
    console.log('✅ Sugestão selecionada:', suggestion);
    
    // Marcar como unidade válida selecionada
    setIsValidUnitSelected(true);
    setSelectedUnitCode(suggestion.group_code);
    
    // Dados da unidade têm PESO MAIOR - sempre sobrescrever o nome
    onUpdate({ 
      group_code: suggestion.group_code,
      group_name: suggestion.group_name // Nome da unidade tem prioridade
    });
    
    setShowSuggestions(false);
    setOldUnitSuggestions([]);
    
    console.log('🎯 Unidade validada:', suggestion.group_code);
  };

  // Limpar sugestões quando CNPJ for preenchido
  useEffect(() => {
    if (data.cnpj && data.cnpj.trim() !== '') {
      setOldUnitSuggestions([]);
      setShowSuggestions(false);
    }
  }, [data.cnpj]);

  const checkExistingCnpj = async (cnpj: string) => {
    console.log('🔍 Verificando CNPJ existente:', cnpj);
    
    // Primeiro, buscar a unidade
    const { data: unidade, error: unidadeError } = await supabase
      .from('unidades')
      .select('id, fantasy_name')
      .eq('cnpj', cnpj)
      .maybeSingle();

    console.log('📋 Resultado da consulta unidade:', { unidade, unidadeError });

    if (unidadeError) throw unidadeError;

    if (!unidade) {
      console.log('❌ Unidade não encontrada');
      return { exists: false };
    }

    console.log('✅ Unidade encontrada, buscando franqueado associado...');
    
    // Se a unidade existe, buscar o franqueado associado
    const { data: relacao, error: relacaoError } = await supabase
      .from('franqueados_unidades')
      .select(`
        franqueados!fk_franqueados_unidades_franqueado_id(
          full_name
        )
      `)
      .eq('unidade_id', unidade.id)
      .limit(1)
      .maybeSingle();

    console.log('👤 Resultado da consulta franqueado:', { relacao, relacaoError });

    if (relacaoError) throw relacaoError;

    // Sempre retornar que existe se a unidade foi encontrada
    const unitData = {
      fantasy_name: unidade.fantasy_name || 'Unidade sem nome',
      franqueado_name: (relacao?.franqueados as any)?.full_name || 'Franqueado não encontrado',
      unit_id: unidade.id
    };
    
    console.log('🚨 Unidade já existe! Dados:', unitData);
    
    return {
      exists: true,
      unitData
    };
  };

  const handleLinkExistingUnit = async () => {
    if (!existingUnitInfo?.unit_id) return;
    
    setIsLinkingUnit(true);
    try {
      const success = await linkExistingUnit(existingUnitInfo.unit_id);
      if (success) {
        setShowExistingUnitModal(false);
        setExistingUnitInfo(null);
        onNext(); // Advance to next step
      }
    } catch (error) {
      console.error('Error linking existing unit:', error);
    } finally {
      setIsLinkingUnit(false);
    }
  };

  const handleRegisterNewUnit = () => {
    setShowExistingUnitModal(false);
    setExistingUnitInfo(null);
    // Clear CNPJ field to allow new registration
    onUpdate({ cnpj: '' });
  };

  const handleCnpjLookup = async (cnpj: string) => {
    const cleanedCnpj = cleanCnpj(cnpj);
    console.log('🔍 CNPJ lookup iniciado:', { cnpj, cleanedCnpj, length: cleanedCnpj.length });
    
    if (cleanedCnpj.length !== 14) {
      console.log('❌ CNPJ inválido, cancelando lookup');
      return;
    }

    setIsLoadingCnpj(true);
    try {
      console.log('🚀 Verificando se CNPJ já existe no banco...');
      
      // Primeiro, verificar se o CNPJ já existe no banco
      const existingUnit = await checkExistingCnpj(cleanedCnpj);
      
      console.log('📊 Resultado da verificação:', existingUnit);
      
      if (existingUnit.exists && existingUnit.unitData) {
        console.log('🚨 CNPJ já existe! Mostrando modal...', existingUnit.unitData);
        setExistingUnitInfo(existingUnit.unitData);
        setShowExistingUnitModal(true);
        console.log('🎭 Modal deveria estar aberto agora!');
        return;
      }

      console.log('✅ CNPJ não existe, consultando API externa...');
      
      // Se não existe, prosseguir com a consulta na API externa
      const { data: result, error } = await supabase.functions.invoke('api-lookup', {
        body: { type: 'cnpj', value: cleanedCnpj }
      });

      if (error) throw error;

      if (result?.success) {
        const fantasyName = result.data.nome || result.data.razao_social || "";
        
        onUpdate({
          fantasy_name: fantasyName,
          // REMOVIDO: não mais atualizar group_name aqui, pois o nome vem da seleção do código da unidade
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

  // REMOVIDO: Função updateGroupName não é mais necessária
  // O nome da unidade agora vem apenas da seleção do código da unidade

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
        
        // REMOVIDO: Não mais atualizar group_name aqui, pois o nome vem da seleção do código da unidade
        
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
    
    // VALIDAÇÃO OBRIGATÓRIA: Verificar se unidade válida foi selecionada
    if (data.group_code && !isValidUnitSelected) {
      toast.error("⚠️ Você deve selecionar uma unidade válida da lista de sugestões. Não é permitido digitar códigos aleatórios.");
      return;
    }
    
    // Validação do complemento quando marcado como obrigatório
    const hasValidComplement = !data.has_unit_complement || 
      (data.has_unit_complement && data.unit_address_complement && data.unit_address_complement !== "Sem Complemento");
    
    // Validação da fase de implementação quando a fase é implantação
    const hasValidImplementationPhase = data.store_phase !== "implantacao" || 
      (data.store_phase === "implantacao" && data.store_imp_phase);
    
    // Validação de vagas de estacionamento quando marcado
    const hasValidParkingSpots = !data.has_parking || (data.has_parking && data.parking_spots && data.parking_spots > 0);
    
    // Validação de endereço do estacionamento parceiro quando marcado
    const hasValidPartnerParking = !data.has_partner_parking || (data.has_partner_parking && data.partner_parking_address);
    
    if (!cleanedCnpj || !data.group_name || !data.group_code || !data.store_model || !data.store_phase || !hasValidImplementationPhase || 
        !cleanedCep || !data.unit_address || !data.unit_number_address || !hasValidComplement || !data.unit_neighborhood ||
        !data.unit_city || !data.unit_state || !data.unit_uf ||
        !data.email || !data.instagram_profile || !hasValidParkingSpots || !hasValidPartnerParking ||
        !data.operation_mon || !data.operation_tue || !data.operation_wed || !data.operation_thu || 
        !data.operation_fri || !data.operation_sat || !data.operation_sun || !data.operation_hol) {
      const missingFields = [];
      if (!cleanedCnpj) missingFields.push("CNPJ");
      if (!data.group_name) missingFields.push("Nome da Unidade");
      if (!data.group_code) missingFields.push("Código da Unidade");
      if (!data.store_model) missingFields.push("Modelo da Loja");
      if (!data.store_phase) missingFields.push("Fase da Loja");
      if (!hasValidImplementationPhase) missingFields.push("Fase de Implantação");
      if (!cleanedCep) missingFields.push("CEP");
      if (!data.unit_address) missingFields.push("Logradouro");
      if (!data.unit_number_address) missingFields.push("Número");
      if (!hasValidComplement) missingFields.push("Complemento");
      if (!data.unit_neighborhood) missingFields.push("Bairro");
      if (!data.unit_city) missingFields.push("Cidade");
      if (!data.unit_state) missingFields.push("Estado");
      if (!data.unit_uf) missingFields.push("UF");
      if (!data.email) missingFields.push("Email da Unidade");
      if (!data.instagram_profile) missingFields.push("Instagram da Unidade");
      if (!hasValidParkingSpots) missingFields.push("Vagas de Estacionamento");
      if (!hasValidPartnerParking) missingFields.push("Endereço do Estacionamento Parceiro");
      if (!data.operation_mon) missingFields.push("Segunda-feira");
      if (!data.operation_tue) missingFields.push("Terça-feira");
      if (!data.operation_wed) missingFields.push("Quarta-feira");
      if (!data.operation_thu) missingFields.push("Quinta-feira");
      if (!data.operation_fri) missingFields.push("Sexta-feira");
      if (!data.operation_sat) missingFields.push("Sábado");
      if (!data.operation_sun) missingFields.push("Domingo");
      if (!data.operation_hol) missingFields.push("Feriados");
      
      if (missingFields.length > 0) {
        toast.error(`Preencha todos os campos obrigatórios: ${missingFields.join(", ")}`);
        return;
      }
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

              <div className="space-y-2 relative">
                <Label htmlFor="group_code">Código da Unidade *</Label>
                <div className="relative">
                  <Input
                    ref={groupCodeInputRef}
                    id="group_code"
                    placeholder="Digite para buscar (ex: 1101)"
                    maxLength={4}
                    value={data.group_code || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      
                      // Invalidar seleção quando usuário digitar
                      if (value !== selectedUnitCode?.toString()) {
                        setIsValidUnitSelected(false);
                        setSelectedUnitCode(null);
                      }
                      
                      onUpdate({ group_code: value ? Number(value) : undefined });
                      
                      // Buscar sugestões se tiver pelo menos 1 dígito
                      if (value && value.length >= 1) {
                        debouncedSearchOldUnits(value);
                      } else {
                        setShowSuggestions(false);
                        setOldUnitSuggestions([]);
                      }
                    }}
                    onFocus={() => {
                      if (data.group_code) {
                        debouncedSearchOldUnits(data.group_code.toString());
                      }
                    }}
                    className={`${isValidUnitSelected && data.group_code 
                      ? "border-green-500 focus:border-green-600" 
                      : data.group_code && !isValidUnitSelected 
                        ? "border-destructive focus:border-destructive"
                        : ""} ${!isCacheLoaded ? "bg-muted" : ""}`}
                    disabled={!isCacheLoaded}
                  />
                  {isLoadingOldUnits && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
                
                {/* Dropdown de sugestões */}
                {showSuggestions && oldUnitSuggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-80 overflow-auto"
                  >
                    <div className="p-2 text-xs text-muted-foreground border-b bg-muted/50">
                      📍 {oldUnitSuggestions.length} de até 15 sugestões (das 694 unidades disponíveis):
                    </div>
                    {oldUnitSuggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.group_code}-${index}`}
                        className="px-3 py-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-semibold text-primary">
                            #{suggestion.group_code}
                          </span>
                          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                            Clique para usar
                          </span>
                        </div>
                        <div className="text-sm text-foreground leading-relaxed">
                          {suggestion.group_name}
                        </div>
                      </div>
                    ))}
                    <div className="p-2 text-xs text-muted-foreground text-center bg-muted/30">
                      💡 Digite mais números para refinar a busca entre todas as 694 unidades
                    </div>
                  </div>
                )}
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
                <Label htmlFor="store_model">Modelo da Loja *</Label>
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
                <Label htmlFor="store_phase">Fase da Loja *</Label>
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
                  <Label htmlFor="store_imp_phase">Fase de Implantação *</Label>
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
                <Label htmlFor="unit_number_address">Número *</Label>
                <Input
                  id="unit_number_address"
                  placeholder="Número"
                  value={data.unit_number_address}
                  onChange={(e) => onUpdate({ unit_number_address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_unit_complement"
                    checked={data.has_unit_complement || false}
                    onCheckedChange={(checked) => {
                      const updates: any = { has_unit_complement: !!checked };
                      if (!checked) {
                        updates.unit_address_complement = "Sem Complemento";
                      } else if (data.unit_address_complement === "Sem Complemento") {
                        updates.unit_address_complement = "";
                      }
                      onUpdate(updates);
                    }}
                  />
                  <Label htmlFor="has_unit_complement">Possui complemento?</Label>
                </div>
                {data.has_unit_complement && (
                  <div className="space-y-2">
                    <Label htmlFor="unit_address_complement">Complemento *</Label>
                    <Input
                      id="unit_address_complement"
                      placeholder="Apartamento, sala, etc."
                      value={data.unit_address_complement === "Sem Complemento" ? "" : data.unit_address_complement}
                      onChange={(e) => onUpdate({ unit_address_complement: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_neighborhood">Bairro *</Label>
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
                    // REMOVIDO: não mais atualizar group_name quando cidade muda
                  }}
                  disabled={isLoadingCep}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_state">Estado *</Label>
                <Input
                  id="unit_state"
                  placeholder="Estado"
                  value={data.unit_state}
                  onChange={(e) => onUpdate({ unit_state: e.target.value })}
                  disabled={isLoadingCep}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_uf">UF *</Label>
                <Input
                  id="unit_uf"
                  placeholder="UF"
                  value={data.unit_uf}
                  onChange={(e) => {
                    onUpdate({ unit_uf: e.target.value });
                    // REMOVIDO: não mais atualizar group_name quando UF muda
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
                <Label htmlFor="email">Email da Unidade *</Label>
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
                  value={formatPhoneNumber(data.phone || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanPhoneNumber(e.target.value);
                    onUpdate({ phone: cleanedValue });
                  }}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_profile">Instagram da Unidade *</Label>
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
                  <Label htmlFor="parking_spots">Vagas de Estacionamento *</Label>
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
                  <Label htmlFor="partner_parking_address">Endereço do Estacionamento Parceiro *</Label>
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
                <Label htmlFor="operation_mon">Segunda-feira *</Label>
                <Input
                  id="operation_mon"
                  placeholder="08:00-18:00"
                  value={formatOperatingHours(data.operation_mon || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHours(e.target.value);
                    onUpdate({ operation_mon: cleanedValue });
                  }}
                  maxLength={11}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_tue">Terça-feira *</Label>
                <Input
                  id="operation_tue"
                  placeholder="08:00-18:00"
                  value={formatOperatingHours(data.operation_tue || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHours(e.target.value);
                    onUpdate({ operation_tue: cleanedValue });
                  }}
                  maxLength={11}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_wed">Quarta-feira *</Label>
                <Input
                  id="operation_wed"
                  placeholder="08:00-18:00"
                  value={formatOperatingHours(data.operation_wed || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHours(e.target.value);
                    onUpdate({ operation_wed: cleanedValue });
                  }}
                  maxLength={11}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_thu">Quinta-feira *</Label>
                <Input
                  id="operation_thu"
                  placeholder="08:00-18:00"
                  value={formatOperatingHours(data.operation_thu || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHours(e.target.value);
                    onUpdate({ operation_thu: cleanedValue });
                  }}
                  maxLength={11}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_fri">Sexta-feira *</Label>
                <Input
                  id="operation_fri"
                  placeholder="08:00-18:00"
                  value={formatOperatingHours(data.operation_fri || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHours(e.target.value);
                    onUpdate({ operation_fri: cleanedValue });
                  }}
                  maxLength={11}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_sat">Sábado *</Label>
                <Input
                  id="operation_sat"
                  placeholder="08:00-18:00"
                  value={formatOperatingHours(data.operation_sat || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHours(e.target.value);
                    onUpdate({ operation_sat: cleanedValue });
                  }}
                  maxLength={11}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_sun">Domingo *</Label>
                <Input
                  id="operation_sun"
                  placeholder="08:00-18:00 ou Fechado"
                  value={formatOperatingHoursWithText(data.operation_sun || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHoursWithText(e.target.value);
                    onUpdate({ operation_sun: cleanedValue });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_hol">Feriados *</Label>
                <Input
                  id="operation_hol"
                  placeholder="08:00-18:00 ou Fechado"
                  value={formatOperatingHoursWithText(data.operation_hol || "")}
                  onChange={(e) => {
                    const cleanedValue = cleanOperatingHoursWithText(e.target.value);
                    onUpdate({ operation_hol: cleanedValue });
                  }}
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

      {/* Modal de CNPJ já existente */}
      <AlertDialog open={showExistingUnitModal} onOpenChange={setShowExistingUnitModal}>
        <AlertDialogContent className="max-w-2xl w-full mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Unidade já cadastrada</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {existingUnitInfo ? (
                <>
                  A unidade <strong>{existingUnitInfo.fantasy_name}</strong> já foi cadastrada por{' '}
                  <strong>{existingUnitInfo.franqueado_name}</strong>.
                  <br /><br />
                  Você pode vincular esta unidade ao seu cadastro ou cadastrar uma nova unidade.
                </>
              ) : (
                'Esta unidade já foi cadastrada por outro franqueado.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogAction 
              onClick={handleLinkExistingUnit}
              disabled={isLinkingUnit}
              className="bg-primary hover:bg-primary/90"
            >
              {isLinkingUnit ? 'Vinculando...' : 'Vincular esta unidade ao meu cadastro'}
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleRegisterNewUnit}>
              Cadastrar uma unidade nova
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
