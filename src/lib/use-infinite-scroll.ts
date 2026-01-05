import { useEffect, useRef, useCallback } from "react"

interface UseInfiniteScrollOptions {
  hasMore: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll<T extends HTMLElement>({
  hasMore,
  onLoadMore,
  threshold = 300,
}: UseInfiniteScrollOptions) {
    
  const containerRef = useRef<T | null>(null)

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = container

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore()
    }
  }, [hasMore, onLoadMore, threshold])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return containerRef
}
