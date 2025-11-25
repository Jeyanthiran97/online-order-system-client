import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Sri Lankan Rupees
 * @param amount - The amount to format
 * @returns Formatted string with Rs. prefix
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "Rs. 0.00";
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "Rs. 0.00";
  return `Rs. ${numAmount.toFixed(2)}`;
}
