import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNullable(value: string | null | undefined, fallback = "Sin dato") {
  return value && value.trim().length > 0 ? value : fallback;
}

export const INTEREST_OPTIONS = ["alto", "medio", "bajo"] as const;
export const INTERACTION_OPTIONS = ["nota", "llamada", "reunion", "correo", "seguimiento", "otro"] as const;
