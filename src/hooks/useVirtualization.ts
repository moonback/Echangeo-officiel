import { useState, useEffect, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Nombre d'éléments à rendre en plus pour le scroll fluide
}

interface VirtualizationResult<T> {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

/**
 * Hook pour la virtualisation de listes longues
 * Améliore les performances en ne rendant que les éléments visibles
 */
export function useVirtualization<T>(
  items: T[],
  scrollTop: number,
  options: VirtualizationOptions
): VirtualizationResult<T> {
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    totalHeight,
    offsetY
  };
}

/**
 * Hook pour créer un scroll container virtuel
 * Retourne les props nécessaires pour le container et les éléments
 */
export function useVirtualScrollContainer<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const virtualization = useVirtualization(items, scrollTop, {
    itemHeight,
    containerHeight,
    overscan
  });

  const containerProps = {
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const
    },
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };

  const spacerProps = {
    style: {
      height: virtualization.totalHeight,
      position: 'relative' as const
    }
  };

  const itemsContainerProps = {
    style: {
      transform: `translateY(${virtualization.offsetY}px)`,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0
    }
  };

  return {
    containerProps,
    spacerProps,
    itemsContainerProps,
    visibleItems: virtualization.visibleItems,
    startIndex: virtualization.startIndex
  };
}
