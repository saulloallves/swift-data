import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import logoCP from "@/assets/logo-cresci-perdi.png";

export const CheckStatus = () => {
  const [protocol, setProtocol] = useState('');
  const [searchProtocol, setSearchProtocol] = useState('');

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['onboarding-status', searchProtocol],
    queryFn: async () => {
      if (!searchProtocol) return null;

      const { data, error } = await supabase
        .from('onboarding_requests')
        .select('*')
        .eq('request_number', searchProtocol)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!searchProtocol,
    retry: false,
  });

  const handleSearch = () => {
    if (protocol.trim()) {
      setSearchProtocol(protocol.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      variant: 'default' | 'secondary' | 'destructive' | 'outline',
      label: string,
      icon: React.ReactNode,
      color: string
    }> = {
      pending: {
        variant: 'secondary',
        label: 'Pendente',
        icon: <Clock className="h-4 w-4" />,
        color: 'text-yellow-600'
      },
      processing: {
        variant: 'default',
        label: 'Em Análise',
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        color: 'text-blue-600'
      },
      approved: {
        variant: 'default',
        label: 'Aprovado',
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: 'text-green-600'
      },
      rejected: {
        variant: 'destructive',
        label: 'Rejeitado',
        icon: <XCircle className="h-4 w-4" />,
        color: 'text-red-600'
      },
      error: {
        variant: 'destructive',
        label: 'Erro',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-red-600'
      }
    };

    return configs[status] || configs.pending;
  };

  const getRequestTypeMessage = (requestType: string) => {
    const messages: Record<string, string> = {
      new_franchisee_new_unit: 'Novo Franqueado + Nova Unidade',
      existing_franchisee_new_unit: 'Franqueado Existente + Nova Unidade',
      new_franchisee_existing_unit: 'Novo Franqueado + Unidade Existente'
    };

    return messages[requestType] || requestType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoCP} alt="Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">Consultar Status</h1>
                <p className="text-sm text-muted-foreground">Acompanhe seu cadastro</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Digite seu Protocolo</CardTitle>
            <CardDescription>
              Insira o número do protocolo recebido após o cadastro para consultar o status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: ONB-2025-00001"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="font-mono"
              />
              <Button 
                onClick={handleSearch} 
                disabled={!protocol.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="pt-6 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Buscando...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && searchProtocol && !isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Protocolo não encontrado</AlertTitle>
            <AlertDescription>
              Nenhum cadastro foi encontrado com o protocolo <strong>{searchProtocol}</strong>.
              Verifique se digitou corretamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Success State - Request Found */}
        {request && !isLoading && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-mono">{request.request_number}</CardTitle>
                    <CardDescription>
                      Enviado em {formatDate(request.submitted_at)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusConfig(request.status).icon}
                    <Badge variant={getStatusConfig(request.status).variant}>
                      {getStatusConfig(request.status).label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tipo de Cadastro
                  </p>
                  <p className="text-sm">
                    {getRequestTypeMessage(request.request_type)}
                  </p>
                </div>

                {request.franchisee_email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </p>
                    <p className="text-sm">{request.franchisee_email}</p>
                  </div>
                )}

                {request.reviewed_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Revisado em
                    </p>
                    <p className="text-sm">{formatDate(request.reviewed_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status-specific messages */}
            {request.status === 'approved' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Cadastro Aprovado!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Seu cadastro foi aprovado com sucesso. Você receberá um email com as próximas instruções para acessar o sistema.
                </AlertDescription>
              </Alert>
            )}

            {request.status === 'rejected' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Cadastro Rejeitado</AlertTitle>
                <AlertDescription>
                  {request.rejection_reason ? (
                    <>
                      <p className="font-semibold mb-1">Motivo:</p>
                      <p>{request.rejection_reason}</p>
                      <p className="mt-2">Entre em contato conosco para mais informações.</p>
                    </>
                  ) : (
                    <p>Entre em contato conosco para mais informações sobre a rejeição.</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {request.status === 'pending' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Aguardando Análise</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Seu cadastro está na fila de aprovação. Nossa equipe analisará em até 2 dias úteis e você será notificado por email.
                </AlertDescription>
              </Alert>
            )}

            {request.status === 'processing' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertTitle className="text-blue-800">Em Análise</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Seu cadastro está sendo analisado pela nossa equipe neste momento. Em breve você receberá uma resposta.
                </AlertDescription>
              </Alert>
            )}

            {request.status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro no Processamento</AlertTitle>
                <AlertDescription>
                  {request.rejection_reason ? (
                    <>
                      <p className="font-semibold mb-1">Detalhes:</p>
                      <p>{request.rejection_reason}</p>
                      <p className="mt-2">Nossa equipe foi notificada e entrará em contato.</p>
                    </>
                  ) : (
                    <p>Houve um erro ao processar seu cadastro. Nossa equipe foi notificada e entrará em contato.</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchProtocol && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground space-y-2">
                <Search className="w-12 h-12 mx-auto opacity-20" />
                <p>Digite um protocolo acima para consultar o status</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
