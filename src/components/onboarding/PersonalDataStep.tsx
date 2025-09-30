import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Loader2, Search, AlertTriangle } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCpf, cleanCpf, formatPhoneNumber, cleanPhoneNumber, formatCurrency, cleanCurrency, formatCep, cleanCep } from "@/lib/utils";

interface PersonalDataStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
}

export const PersonalDataStep = ({ data, onUpdate, onNext }: PersonalDataStepProps) => {
  const [isLoadingCpf, setIsLoadingCpf] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const [cpfAlreadyExists, setCpfAlreadyExists] = useState(false);
  const [existingCpfData, setExistingCpfData] = useState<{ full_name: string; created_at: string } | null>(null);
  const [showCpfExistsModal, setShowCpfExistsModal] = useState(false);
  const [phoneAlreadyExists, setPhoneAlreadyExists] = useState(false);
  const [existingPhoneData, setExistingPhoneData] = useState<{ full_name: string; created_at: string } | null>(null);
  const [showPhoneExistsModal, setShowPhoneExistsModal] = useState(false);

  const checkCpfInDatabase = async (cpf: string) => {
    try {
      const { data: existingFranqueado, error } = await supabase
        .from('franqueados')
        .select('full_name, created_at')
        .eq('cpf_rnm', cpf)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        exists: !!existingFranqueado,
        data: existingFranqueado
      };
    } catch (error) {
      console.error('Error checking CPF in database:', error);
      return { exists: false, data: null };
    }
  };

  const handleCpfLookup = async (cpf: string) => {
    const cleanedCpf = cleanCpf(cpf);
    if (cleanedCpf.length !== 11) return;

    setIsLoadingCpf(true);
    
    try {
      // Primeiro, verificar se o CPF já existe no banco
      const { exists, data: existingData } = await checkCpfInDatabase(cleanedCpf);
      
      if (exists && existingData) {
        setExistingCpfData({
          full_name: existingData.full_name,
          created_at: existingData.created_at
        });
        setCpfAlreadyExists(true);
        setShowCpfExistsModal(true);
        setIsLoadingCpf(false);
        return;
      }

      // Se não existe no banco, continuar com a API externa
      const { data: result, error } = await supabase.functions.invoke('api-lookup', {
        body: { type: 'cpf', value: cleanedCpf }
      });

      if (error) throw error;

      if (result?.success) {
        onUpdate({
          full_name: result.data.nome || "",
          birth_date: result.data.nascimento || "",
        });
        toast.success("Dados encontrados e preenchidos automaticamente");
      } else {
        toast.warning("CPF não encontrado na base de dados");
      }
    } catch (error) {
      console.error('CPF lookup error:', error);
      toast.error("Erro ao buscar dados do CPF");
    } finally {
      setIsLoadingCpf(false);
    }
  };

  const handleClearCpfData = () => {
    onUpdate({ 
      cpf_rnm: "",
      full_name: "",
      birth_date: ""
    });
    setCpfAlreadyExists(false);
    setExistingCpfData(null);
    setShowCpfExistsModal(false);
  };

  const checkPhoneInDatabase = async (phone: string) => {
    try {
      console.log('Querying database for phone:', phone);
      const { data: existingFranqueados, error } = await supabase
        .from('franqueados')
        .select('full_name, created_at')
        .eq('contact', phone)
        .order('created_at', { ascending: true })
        .limit(1);

      console.log('Database query result:', { data: existingFranqueados, error });

      if (error) {
        console.log('Database error:', error);
        throw error;
      }

      const existingFranqueado = existingFranqueados?.[0];
      const result = {
        exists: !!existingFranqueado,
        data: existingFranqueado
      };
      
      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('Error checking phone in database:', error);
      return { exists: false, data: null };
    }
  };

  const handlePhoneValidation = async (phone: string) => {
    const cleanedPhone = cleanPhoneNumber(phone);
    console.log('Phone validation triggered:', { original: phone, cleaned: cleanedPhone });
    
    if (cleanedPhone.length < 10) {
      console.log('Phone too short, skipping validation');
      return;
    }

    setIsLoadingPhone(true);
    
    try {
      console.log('Checking phone in database:', cleanedPhone);
      const { exists, data: existingData } = await checkPhoneInDatabase(cleanedPhone);
      
      if (exists && existingData) {
        setExistingPhoneData({
          full_name: existingData.full_name,
          created_at: existingData.created_at
        });
        setPhoneAlreadyExists(true);
        setShowPhoneExistsModal(true);
        setIsLoadingPhone(false);
        return;
      }
    } catch (error) {
      console.error('Phone validation error:', error);
    } finally {
      setIsLoadingPhone(false);
    }
  };

  const handleClearPhoneData = () => {
    onUpdate({ contact: "" });
    setPhoneAlreadyExists(false);
    setExistingPhoneData(null);
    setShowPhoneExistsModal(false);
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
        onUpdate({
          franchisee_address: result.data.logradouro || "",
          franchisee_neighborhood: result.data.bairro || "",
          franchisee_city: result.data.localidade || "",
          franchisee_state: result.data.localidade || "",
          franchisee_uf: result.data.uf || "",
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
    const cleanedCpf = cleanCpf(data.cpf_rnm);
    const errors = [];

    // Campos obrigatórios básicos
    if (!cleanedCpf) errors.push("CPF");
    if (!data.full_name) errors.push("Nome Completo");
    if (!data.birth_date) errors.push("Data de Nascimento");
    if (!data.nationality) errors.push("Nacionalidade");
    if (!data.franchisee_email) errors.push("E-mail");
    if (!data.contact) errors.push("Telefone/Contato");
    if (!data.owner_type) errors.push("Tipo de Proprietário");
    if (!data.education) errors.push("Escolaridade");
    if (!data.previous_profession) errors.push("Profissão Anterior");
    if (!data.previous_salary_range) errors.push("Faixa Salarial Anterior");
    if (!data.instagram) errors.push("Instagram Pessoal");

    // Campos de endereço obrigatórios
    const cleanedCep = cleanCep(data.franchisee_postal_code || "");
    if (!cleanedCep) errors.push("CEP");
    if (!data.franchisee_address) errors.push("Logradouro");
    if (!data.franchisee_number_address) errors.push("Número");
    if (data.has_complement && !data.franchisee_address_complement) errors.push("Complemento");
    if (!data.franchisee_neighborhood) errors.push("Bairro");
    if (!data.franchisee_city) errors.push("Cidade");
    if (!data.franchisee_state) errors.push("Estado");
    if (!data.franchisee_uf) errors.push("UF");

    // Outros campos obrigatórios
    if (!data.availability) errors.push("Disponibilidade");
    if (!data.was_referred && !data.discovery_source) errors.push("Como conheceu a franquia");

    // Campos condicionais obrigatórios
    if (data.was_referred) {
      if (!data.referrer_name) errors.push("Nome do Indicador");
      if (!data.referrer_unit_code) errors.push("Código da Unidade do Indicador");
    }

    if (data.has_other_activities) {
      if (!data.other_activities_description) errors.push("Descrição das outras atividades");
    }

    if (data.receives_prolabore) {
      if (!data.prolabore_value || data.prolabore_value === 0) errors.push("Valor do Pró-labore");
    }

    if (errors.length > 0) {
      toast.error(`Preencha todos os campos obrigatórios: ${errors.join(", ")}`);
      return;
    }

    // Atualiza o CPF e CEP limpos antes de continuar
    onUpdate({ 
      cpf_rnm: cleanedCpf,
      franchisee_postal_code: cleanedCep
    });
    onNext();
  };

  return (
    <>
      <div className="form-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <div className="relative">
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formatCpf(data.cpf_rnm)}
              onChange={(e) => {
                const formatted = formatCpf(e.target.value);
                onUpdate({ cpf_rnm: formatted });
              }}
              onBlur={(e) => {
                const cleaned = cleanCpf(e.target.value);
                onUpdate({ cpf_rnm: cleaned });
                handleCpfLookup(cleaned);
              }}
              maxLength={14}
              className={isLoadingCpf ? "api-loading" : ""}
            />
            {isLoadingCpf && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              placeholder="Digite seu nome completo"
              value={data.full_name}
              onChange={(e) => onUpdate({ full_name: e.target.value })}
              disabled={isLoadingCpf || cpfAlreadyExists || phoneAlreadyExists}
            />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_date">Data de Nascimento *</Label>
            <Input
              id="birth_date"
              type="date"
              value={data.birth_date}
              onChange={(e) => onUpdate({ birth_date: e.target.value })}
              disabled={isLoadingCpf || cpfAlreadyExists || phoneAlreadyExists}
            />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nacionalidade *</Label>
          <Select value={data.nationality} onValueChange={(value) => onUpdate({ nationality: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Brasileiro(a)">Brasileiro(a)</SelectItem>
              <SelectItem value="Estrangeiro(a)">Estrangeiro(a)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="franchisee_email">E-mail *</Label>
          <Input
            id="franchisee_email"
            type="email"
            placeholder="e-mail pessoal"
            value={data.franchisee_email}
            onChange={(e) => onUpdate({ franchisee_email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Telefone/Contato *</Label>
          <div className="relative">
            <Input
              id="contact"
              placeholder="(11) 99999-9999"
              value={formatPhoneNumber(data.contact)}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                onUpdate({ contact: formatted });
              }}
              onBlur={(e) => {
                const cleaned = cleanPhoneNumber(e.target.value);
                onUpdate({ contact: cleaned });
                handlePhoneValidation(cleaned);
              }}
              maxLength={15}
              className={isLoadingPhone ? "api-loading" : ""}
              disabled={cpfAlreadyExists}
            />
            {isLoadingPhone && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Proprietário *</Label>
          <RadioGroup 
            value={data.owner_type} 
            onValueChange={(value) => onUpdate({ owner_type: value })}
            className="flex flex-row gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Principal" id="owner_principal" />
              <Label htmlFor="owner_principal" className="font-normal cursor-pointer">Principal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sócio" id="owner_socio" />
              <Label htmlFor="owner_socio" className="font-normal cursor-pointer">Sócio</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Escolaridade *</Label>
          <Select value={data.education} onValueChange={(value) => onUpdate({ education: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ensino Fundamental">Ensino Fundamental</SelectItem>
              <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
              <SelectItem value="Ensino Superior">Ensino Superior</SelectItem>
              <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
              <SelectItem value="Mestrado">Mestrado</SelectItem>
              <SelectItem value="Doutorado">Doutorado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="previous_profession">Profissão Anterior *</Label>
          <Input
            id="previous_profession"
            placeholder="Sua profissão anterior"
            value={data.previous_profession}
            onChange={(e) => onUpdate({ previous_profession: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previous_salary_range">Faixa Salarial Anterior *</Label>
          <Select value={data.previous_salary_range} onValueChange={(value) => onUpdate({ previous_salary_range: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Até R$ 2.000">Até R$ 2.000</SelectItem>
              <SelectItem value="R$ 2.001 - R$ 5.000">R$ 2.001 - R$ 5.000</SelectItem>
              <SelectItem value="R$ 5.001 - R$ 10.000">R$ 5.001 - R$ 10.000</SelectItem>
              <SelectItem value="R$ 10.001 - R$ 20.000">R$ 10.001 - R$ 20.000</SelectItem>
              <SelectItem value="Acima de R$ 20.000">Acima de R$ 20.000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram Pessoal *</Label>
          <Input
            id="instagram"
            placeholder="@seuusuario"
            value={data.instagram}
            onChange={(e) => onUpdate({ instagram: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <ImageDropzone
            value={data.profile_image}
            onChange={(url) => onUpdate({ profile_image: url })}
            label="Foto de Perfil"
          />
        </div>
      </div>

      {/* Endereço Pessoal */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Endereço Pessoal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="postal_code">CEP *</Label>
            <div className="relative">
              <Input
                id="postal_code"
                placeholder="00000-000"
                value={formatCep(data.franchisee_postal_code || "")}
                onChange={(e) => {
                  const cleanedValue = cleanCep(e.target.value);
                  onUpdate({ franchisee_postal_code: cleanedValue });
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
            <Label htmlFor="address">Logradouro *</Label>
            <Input
              id="address"
              placeholder="Rua, Avenida..."
              value={data.franchisee_address}
              onChange={(e) => onUpdate({ franchisee_address: e.target.value })}
              disabled={isLoadingCep}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number_address">Número *</Label>
            <Input
              id="number_address"
              placeholder="123"
              value={data.franchisee_number_address}
              onChange={(e) => onUpdate({ franchisee_number_address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_complement"
                checked={data.has_complement}
                onCheckedChange={(checked) => {
                  onUpdate({ 
                    has_complement: checked as boolean,
                    franchisee_address_complement: checked ? "" : "Sem Complemento"
                  });
                }}
              />
              <Label htmlFor="has_complement">Possui complemento?</Label>
            </div>
            
            {data.has_complement && (
              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento *</Label>
                <Input
                  id="address_complement"
                  placeholder="Apto, Sala, etc."
                  value={data.franchisee_address_complement}
                  onChange={(e) => onUpdate({ franchisee_address_complement: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              placeholder="Bairro"
              value={data.franchisee_neighborhood}
              onChange={(e) => onUpdate({ franchisee_neighborhood: e.target.value })}
              disabled={isLoadingCep}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              placeholder="Cidade"
              value={data.franchisee_city}
              onChange={(e) => onUpdate({ franchisee_city: e.target.value })}
              disabled={isLoadingCep}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              placeholder="Estado"
              value={data.franchisee_state}
              onChange={(e) => onUpdate({ franchisee_state: e.target.value })}
              disabled={isLoadingCep}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">UF *</Label>
            <Input
              id="uf"
              placeholder="SP"
              value={data.franchisee_uf}
              onChange={(e) => onUpdate({ franchisee_uf: e.target.value })}
              disabled={isLoadingCep}
              maxLength={2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="was_entrepreneur"
            checked={data.was_entrepreneur}
            onCheckedChange={(checked) => onUpdate({ was_entrepreneur: checked as boolean })}
          />
          <Label htmlFor="was_entrepreneur">Já foi empreendedor antes?</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="was_referred"
            checked={data.was_referred}
            onCheckedChange={(checked) => {
              onUpdate({ 
                was_referred: checked as boolean,
                discovery_source: checked ? "Indicação" : ""
              });
            }}
          />
          <Label htmlFor="was_referred">Foi indicado por alguém?</Label>
        </div>

        {data.was_referred && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referrer_name">Nome da Pessoa *</Label>
              <Input
                id="referrer_name"
                placeholder="Nome completo"
                value={data.referrer_name}
                onChange={(e) => onUpdate({ referrer_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referrer_unit_code">Nome da Unidade ou Código *</Label>
              <Input
                id="referrer_unit_code"
                placeholder="Nome ou código da unidade"
                value={data.referrer_unit_code}
                onChange={(e) => onUpdate({ referrer_unit_code: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_other_activities"
            checked={data.has_other_activities}
            onCheckedChange={(checked) => onUpdate({ has_other_activities: checked as boolean })}
          />
          <Label htmlFor="has_other_activities">Possui outras atividades profissionais?</Label>
        </div>

        {data.has_other_activities && (
          <div className="space-y-2">
            <Label htmlFor="other_activities_description">Descreva suas outras atividades *</Label>
            <Textarea
              id="other_activities_description"
              placeholder="Descreva suas outras atividades profissionais"
              value={data.other_activities_description}
              onChange={(e) => onUpdate({ other_activities_description: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="availability">Disponibilidade *</Label>
          <Select value={data.availability} onValueChange={(value) => onUpdate({ availability: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Integral">Integral</SelectItem>
              <SelectItem value="Parcial">Parcial</SelectItem>
              <SelectItem value="Apoio em Eventos">Apoio em Eventos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!data.was_referred && (
          <div className="space-y-2">
            <Label htmlFor="discovery_source">Como conheceu a franquia? *</Label>
            <Select value={data.discovery_source} onValueChange={(value) => onUpdate({ discovery_source: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Internet">Internet</SelectItem>
                <SelectItem value="Feira de Franquias">Feira de Franquias</SelectItem>
                <SelectItem value="Redes Sociais">Redes Sociais</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="receives_prolabore"
            checked={data.receives_prolabore}
            onCheckedChange={(checked) => onUpdate({ receives_prolabore: checked as boolean })}
          />
          <Label htmlFor="receives_prolabore">Recebe pró-labore?</Label>
        </div>

        {data.receives_prolabore && (
          <div className="space-y-2">
            <Label htmlFor="prolabore_value">Valor do Pró-labore (R$) *</Label>
            <Input
              id="prolabore_value"
              placeholder="R$ 0,00"
              value={formatCurrency(data.prolabore_value || 0)}
              onChange={(e) => {
                const cleanValue = cleanCurrency(e.target.value);
                onUpdate({ prolabore_value: cleanValue });
              }}
            />
          </div>
        )}
      </div>

      {/* Loading Overlays */}
      {isLoadingCpf && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg text-center max-w-sm mx-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Buscando dados do franqueado...</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto localizamos suas informações pessoais
            </p>
          </div>
        </div>
      )}

      {isLoadingCep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg text-center max-w-sm mx-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Buscando endereço pessoal...</h3>
            <p className="text-sm text-muted-foreground">
              Localizando dados do seu CEP
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <Button onClick={handleSubmit} className="px-8" disabled={cpfAlreadyExists || phoneAlreadyExists}>
          Próximo
        </Button>
      </div>

      {/* Modal de CPF já cadastrado */}
      <AlertDialog open={showCpfExistsModal}>
        <AlertDialogContent 
          className="max-w-md w-full mx-4"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              CPF já cadastrado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm space-y-2">
              <p>Este CPF já está cadastrado no sistema:</p>
              {existingCpfData && (
                <div className="bg-muted p-3 rounded-lg">
                  <p><strong>Nome:</strong> {existingCpfData.full_name}</p>
                  <p><strong>Cadastrado em:</strong> {new Date(existingCpfData.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              <p className="text-muted-foreground">
                Cada CPF pode ter apenas um cadastro. Por favor, utilize outro CPF ou entre em contato conosco se este for um erro.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={handleClearCpfData}
              className="w-full"
            >
              Usar outro CPF
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Telefone já cadastrado */}
      <AlertDialog open={showPhoneExistsModal}>
        <AlertDialogContent 
          className="max-w-md w-full mx-4"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Telefone já cadastrado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm space-y-2">
              <p>Esse telefone já foi cadastrado por: <strong>{existingPhoneData?.full_name}</strong>, favor realizar o seu cadastro com outro telefone.</p>
              {existingPhoneData && (
                <div className="bg-muted p-3 rounded-lg">
                  <p><strong>Cadastrado em:</strong> {new Date(existingPhoneData.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={handleClearPhoneData}
              className="w-full"
            >
              Usar outro telefone
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
};