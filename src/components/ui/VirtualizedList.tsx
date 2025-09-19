import React from 'react';
import { useVirtualScrollContainer } from '../../hooks/useVirtualization';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

/**
 * Composant de liste virtualisée pour améliorer les performances
 * avec de grandes listes d'éléments
 */
function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualizedListProps<T>) {
  const {
    containerProps,
    spacerProps,
    itemsContainerProps,
    visibleItems,
    startIndex
  } = useVirtualScrollContainer(items, itemHeight, containerHeight, overscan);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    onScroll?.(scrollTop);
  };

  return (
    <div
      {...containerProps}
      className={`virtualized-list ${className}`}
      onScroll={handleScroll}
    >
      <div {...spacerProps}>
        <div {...itemsContainerProps}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="virtualized-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualizedList;
