import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a value is not empty, returning a default value if it is
 * @param value The value to check
 * @param defaultValue Optional default value to return if empty (defaults to "unassigned")
 * @returns The original value if not empty, otherwise the default value
 */
export function ensureNonEmptyValue<T>(
  value: T | null | undefined,
  defaultValue: T | string = "unassigned",
): T | string {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    return defaultValue
  }
  return value
}
