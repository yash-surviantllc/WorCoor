import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll<T extends HTMLElement>(
  options: UseInfiniteScrollOptions
): React.RefObject<T> {
  const { hasMore, onLoadMore, threshold = 0.1, rootMargin = '0px' } = options;

  const observerRef = useRef<IntersectionObserver>();
  const containerRef = useRef<T | null>(null);

  const lastElementRef = useCallback(
    (node: T | null) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [hasMore, onLoadMore, threshold, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return containerRef as React.RefObject<T>;
}
