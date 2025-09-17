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
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  }
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) {
    return 'R$ 0,00';
  }
  
  // Converte para número (centavos) e depois para reais
  const numberValue = parseInt(numbers) / 100;
  
  // Formata para moeda brasileira
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function cleanCurrency(value: string): number {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return 0;
  
  // Converte para número dividindo por 100 (centavos)
  return parseInt(numbers) / 100;
}
