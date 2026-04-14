import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a size string like "120 sqm" to "120 sqm (157 steps)"
 * Uses approximate ratio: 1 sqm ≈ 1.31 steps
 * Skips non-sqm values like "5 Hectares"
 */
export function addStepCount(sizeStr: string): string {
  const match = sizeStr.match(/^([\d,]+)\s*sqm$/i);
  if (!match) return sizeStr;
  const sqm = parseInt(match[1].replace(/,/g, ''), 10);
  const steps = Math.round(sqm * 1.31);
  return `${match[1]} sqm (${steps.toLocaleString()} steps)`;
}
