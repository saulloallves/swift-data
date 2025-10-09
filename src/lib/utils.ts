import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCpf(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara 000.000.000-00
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
}

export function cleanCpf(value: string): string {
  // Remove todos os caracteres não numéricos
  return value.replace(/\D/g, '');
}

export function formatPhoneNumber(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara (XX) XXXXX-XXXX
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
}

export function cleanPhoneNumber(value: string): string {
  // Remove todos os caracteres não numéricos
  return value.replace(/\D/g, '');
}

export function formatCurrency(value: string | number): string {
  // Se for número, converte para string formatada
  if (typeof value === 'number') {
    // Aplica limite máximo de 10 milhões
    const limitedValue = Math.min(value, 10000000);
    return limitedValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) {
    return 'R$ 0,00';
  }
  
  // Converte para número (centavos) e depois para reais
  let numberValue = parseInt(numbers) / 100;
  
  // Aplica limite máximo de 10 milhões
  numberValue = Math.min(numberValue, 10000000);
  
  // Formata para moeda brasileira
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function cleanCurrency(value: string): number {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return 0;
  
  // Converte para número dividindo por 100 (centavos)
  let numberValue = parseInt(numbers) / 100;
  
  // Aplica limite máximo de 10 milhões
  return Math.min(numberValue, 10000000);
}

export function formatCnpj(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara 00.000.000/0000-00
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  } else {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
}

export function cleanCnpj(value: string): string {
  // Remove todos os caracteres não numéricos
  return value.replace(/\D/g, '');
}

export function formatCep(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara 00000-000
  if (numbers.length <= 5) {
    return numbers;
  } else {
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }
}

export function cleanCep(value: string): string {
  // Remove todos os caracteres não numéricos
  return value.replace(/\D/g, '');
}
