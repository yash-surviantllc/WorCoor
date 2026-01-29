import { useEffect, useState } from "react"

/**
 * Simple debounce hook for primitive values (string/number/boolean).
 * Returns the latest value only after the specified delay has elapsed.
 */
export const useDebounce = <T>(value: T, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
