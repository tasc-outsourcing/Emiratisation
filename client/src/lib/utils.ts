import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "AED"): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function calculateRiskLevel(percentage: number): "low" | "medium" | "high" {
  if (percentage <= 25) return "low";
  if (percentage <= 50) return "medium";
  return "high";
}
