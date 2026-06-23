import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Indian Rupee formatting: ₹ symbol with lakh/crore digit grouping
// (e.g. ₹1,25,000). Whole amounts show no decimals; fractional ones keep them.
const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number) {
  return priceFormatter.format(value)
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
