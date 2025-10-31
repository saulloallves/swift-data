import { FileText, Shield, UserCheck } from "lucide-react";

export interface TermData {
  key: string;
  title: string;
  content: string;
  icon: typeof FileText;
  description: string;
}

export const termsData: Record<string, TermData> = {
  system: {
    key: "system",
    title: "Termo de Uso do Sistema",
    description: "Aceito os termos de uso da plataforma e sistema de gestão da franquia",
    icon: FileText,
    content: `TERMO DE USO DO SISTEMA DE SUPORTE – GiraBot Franquia Cresci e Perdi

Este Termo de Uso regula as condições de utilização do GiraBot, sistema oficial de suporte automatizado da Franquia Cresci e Perdi, voltado ao atendimento de franqueados e colaboradores, com o objetivo de esclarecer direitos, deveres e limites de uso da ferramenta.

## Objeto

O presente termo tem por finalidade estabelecer as condições de uso do GiraBot, abrangendo o acesso ao suporte automatizado, envio de solicitações, recebimento de respostas, geração de tickets e demais funcionalidades disponíveis.

## Responsabilidades do Usuário

• Manter seus dados de identificação corretos e atualizados;

• Utilizar o GiraBot com ética, clareza e responsabilidade, evitando envio de informações falsas ou incompletas;

• Reportar imediatamente à franqueadora qualquer falha, acesso indevido ou comportamento suspeito no sistema.

## Propriedade Intelectual

Todo o conteúdo, estrutura e tecnologia do GiraBot são de propriedade exclusiva da Franquia Cresci e Perdi, incluindo scripts, fluxos de atendimento, imagens, automações e base de dados.

É proibida qualquer reprodução, cópia ou distribuição sem autorização expressa da franqueadora.

## Limitações de Responsabilidade

• A Cresci e Perdi não garante funcionamento ininterrupto do GiraBot, podendo haver instabilidades, manutenções ou falhas técnicas;

• A franqueadora não se responsabiliza por eventuais perdas decorrentes do uso indevido do sistema;

• O uso do GiraBot é feito por conta e risco do usuário, exceto em caso de falha comprovadamente causada por dolo ou negligência da franqueadora.

## Penalidades e Rescisão

• O uso indevido do sistema, tentativa de manipulação, envio de conteúdo ofensivo ou desrespeito às normas poderá resultar no bloqueio temporário ou definitivo do acesso ao GiraBot;

• Medidas legais cabíveis poderão ser adotadas conforme a gravidade da infração.

## Disposições Finais

• Este Termo poderá ser atualizado a qualquer momento, com aviso prévio via canais oficiais;

• O uso contínuo do GiraBot implica aceitação plena das condições aqui apresentadas.`
  },
  confidentiality: {
    key: "confidentiality",
    title: "Termo de Confidencialidade",
    description: "Comprometo-me a manter sigilo sobre informações confidenciais da franquia",
    icon: Shield,
    content: `TERMO DE CONFIDENCIALIDADE – GiraBot

Este Termo de Confidencialidade estabelece as diretrizes para o tratamento de informações sigilosas acessadas ou compartilhadas por meio do GiraBot, sistema oficial de suporte aos franqueados e colaboradores da Franquia Cresci e Perdi.

## Definição de Informações Confidenciais

Consideram-se informações confidenciais todos os dados, documentos, mensagens, imagens, fluxos, materiais técnicos e operacionais, estratégias, conteúdos de treinamentos, manuais, acessos e quaisquer outras informações compartilhadas pelo GiraBot que não sejam de domínio público e que estejam sob posse ou responsabilidade da Cresci e Perdi.

## Obrigações do Usuário

• Manter o mais absoluto sigilo sobre qualquer informação acessada ou transmitida pelo GiraBot;

• Não compartilhar, copiar, distribuir ou utilizar as informações para finalidades pessoais, comerciais ou não autorizadas;

• Proteger o acesso ao sistema e evitar que terceiros não autorizados tenham acesso aos dados fornecidos via GiraBot.

## Exceções à Confidencialidade

O dever de confidencialidade não se aplica às informações que:

• Já sejam públicas de forma legítima;

• Sejam obtidas de terceiros por meios legais, sem restrições de sigilo;

• Sejam exigidas por ordem judicial ou por obrigação legal, desde que a Cresci e Perdi seja notificada imediatamente sobre tal exigência.

## Vigência do Termo

Este termo entra em vigor a partir do momento em que o usuário acessa o GiraBot e permanece válido enquanto houver qualquer relação ativa com o sistema ou com a Franquia Cresci e Perdi.

## Disposições Gerais

• O presente termo poderá ser modificado a qualquer tempo, mediante publicação atualizada nos canais oficiais;

• O uso continuado do sistema implica o aceite automático das atualizações do presente termo.

## Observação

Este documento é de leitura obrigatória, mas não requer assinatura digital. Ao utilizar o GiraBot, o usuário declara estar ciente das cláusulas aqui apresentadas e se compromete a cumpri-las integralmente.`
  },
  lgpd: {
    key: "lgpd",
    title: "Termo LGPD",
    description: "Autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados",
    icon: UserCheck,
    content: `AUTORIZAÇÃO PARA USO DE DADOS PESSOAIS

## Finalidade do Tratamento

Os meus dados poderão ser utilizados para cadastro, comunicação, prestação de serviços, marketing e demais atividades relacionadas à operação da franquia.

## Natureza dos Dados Coletados

Os dados coletados poderão incluir, mas não se limitam a: nome, endereço, contato (telefone e e-mail), dados de identificação e demais informações fornecidas voluntariamente.

## Direitos do Titular

Estou ciente de que poderei, a qualquer tempo, exercer meus direitos de acesso, correção, exclusão e portabilidade dos meus dados, conforme previsto na LGPD.

## Compartilhamento de Dados

Os meus dados poderão ser compartilhados com terceiros somente para os fins previstos, sempre garantindo a segurança e a confidencialidade exigidas pela legislação.

## Prazo de Armazenamento

Os dados serão armazenados pelo período necessário para cumprir as finalidades mencionadas ou enquanto houver interesse legítimo na sua manutenção, respeitando os prazos legais.

## Revogação

Esta autorização poderá ser revogada a qualquer tempo, mediante solicitação formal, sem prejuízo da legalidade do tratamento realizado anteriormente à revogação.

## Consentimento

Ao aceitar este termo, você consente com o tratamento dos seus dados pessoais nas condições aqui estabelecidas, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD) - Lei nº 13.709/2018.`
  }
};

export const getTermByKey = (key: string): TermData | undefined => {
  return termsData[key];
};