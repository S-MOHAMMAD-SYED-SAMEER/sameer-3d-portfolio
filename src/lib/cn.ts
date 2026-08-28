type ClassValue = string | false | null | undefined

/** Joins conditional class names. Keeps components free of ternary noise. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
