import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount
  return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`
}
