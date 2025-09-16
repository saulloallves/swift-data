import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search } from "lucide-react";
import { OnboardingFormData } from "@/hooks/useOnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersonalDataStepProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
}

export const PersonalDataStep = ({ data, onUpdate, onNext }: PersonalDataStepProps) => {
  const [isLoadingCpf, setIsLoadingCpf] = useState(false);

  const handleCpfLookup = async (cpf: string) => {
    if (cpf.length !== 11) return;

    setIsLoadingCpf(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('api-lookup', {
        body: { type: 'cpf', value: cpf }
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

  const handleSubmit = () => {
    if (!data.cpf_rnm || !data.full_name || !data.contact) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    onNext();
  };

  return (
    <div className="form-section">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <div className="relative">
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={data.cpf_rnm}
              onChange={(e) => onUpdate({ cpf_rnm: e.target.value })}
              onBlur={(e) => handleCpfLookup(e.target.value)}
              maxLength={11}
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
            disabled={isLoadingCpf}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            value={data.birth_date}
            onChange={(e) => onUpdate({ birth_date: e.target.value })}
            disabled={isLoadingCpf}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nacionalidade</Label>
          <Input
            id="nationality"
            placeholder="Nacionalidade"
            value={data.nationality}
            onChange={(e) => onUpdate({ nationality: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Telefone/Contato *</Label>
          <Input
            id="contact"
            placeholder="(11) 99999-9999"
            value={data.contact}
            onChange={(e) => onUpdate({ contact: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_type">Tipo de Proprietário</Label>
          <Select value={data.owner_type} onValueChange={(value) => onUpdate({ owner_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
              <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Escolaridade</Label>
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
          <Label htmlFor="previous_profession">Profissão Anterior</Label>
          <Input
            id="previous_profession"
            placeholder="Sua profissão anterior"
            value={data.previous_profession}
            onChange={(e) => onUpdate({ previous_profession: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previous_salary_range">Faixa Salarial Anterior</Label>
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
            onCheckedChange={(checked) => onUpdate({ was_referred: checked as boolean })}
          />
          <Label htmlFor="was_referred">Foi indicado por alguém?</Label>
        </div>

        {data.was_referred && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referrer_name">Nome do Indicador</Label>
              <Input
                id="referrer_name"
                placeholder="Nome completo"
                value={data.referrer_name}
                onChange={(e) => onUpdate({ referrer_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referrer_unit_code">Código da Unidade do Indicador</Label>
              <Input
                id="referrer_unit_code"
                placeholder="Código da unidade"
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
            <Label htmlFor="other_activities_description">Descreva suas outras atividades</Label>
            <Textarea
              id="other_activities_description"
              placeholder="Descreva suas outras atividades profissionais"
              value={data.other_activities_description}
              onChange={(e) => onUpdate({ other_activities_description: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="availability">Disponibilidade</Label>
          <Select value={data.availability} onValueChange={(value) => onUpdate({ availability: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Período Integral">Período Integral</SelectItem>
              <SelectItem value="Meio Período">Meio Período</SelectItem>
              <SelectItem value="Fins de Semana">Fins de Semana</SelectItem>
              <SelectItem value="Flexível">Flexível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discovery_source">Como conheceu a franquia?</Label>
          <Select value={data.discovery_source} onValueChange={(value) => onUpdate({ discovery_source: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Internet">Internet</SelectItem>
              <SelectItem value="Indicação">Indicação</SelectItem>
              <SelectItem value="Feira de Franquias">Feira de Franquias</SelectItem>
              <SelectItem value="Redes Sociais">Redes Sociais</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSubmit} className="px-8">
          Próximo
        </Button>
      </div>
    </div>
  );
};