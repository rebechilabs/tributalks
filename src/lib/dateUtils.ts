import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converts a date to Brasília timezone (America/Sao_Paulo - GMT-3)
 */
export function toBrasiliaTime(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Get the UTC time
  const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
  
  // Brasília is UTC-3 (no daylight saving since 2019)
  const brasiliaOffset = -3 * 60 * 60 * 1000;
  
  return new Date(utcTime + brasiliaOffset);
}

/**
 * Format a date in Brasília timezone with the specified format
 */
export function formatBrasilia(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy 'às' HH:mm"
): string {
  const brasiliaDate = toBrasiliaTime(date);
  return format(brasiliaDate, formatStr, { locale: ptBR });
}

/**
 * Format relative time (e.g., "há 2 horas") from Brasília perspective
 */
export function formatDistanceBrasilia(
  date: Date | string,
  options?: { addSuffix?: boolean }
): string {
  const brasiliaDate = toBrasiliaTime(date);
  const nowBrasilia = toBrasiliaTime(new Date());
  
  // Calculate the difference and apply to now for accurate relative time
  const diff = brasiliaDate.getTime() - nowBrasilia.getTime();
  const adjustedDate = new Date(Date.now() + diff);
  
  return formatDistanceToNow(adjustedDate, { 
    addSuffix: options?.addSuffix ?? true, 
    locale: ptBR 
  });
}

/**
 * Get current time in Brasília
 */
export function nowBrasilia(): Date {
  return toBrasiliaTime(new Date());
}
