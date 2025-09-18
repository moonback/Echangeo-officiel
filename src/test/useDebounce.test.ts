import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 300 });
    expect(result.current).toBe('initial'); // Should not change immediately

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('changed');
  });

  it('should handle multiple rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // Multiple rapid changes
    rerender({ value: 'change1', delay: 300 });
    rerender({ value: 'change2', delay: 300 });
    rerender({ value: 'change3', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('change3'); // Should be the last value
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => 
      useDebouncedCallback(mockCallback, 300)
    );

    // Call multiple times rapidly
    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    expect(mockCallback).not.toHaveBeenCalled();

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('arg3');
  });

  it('should handle cleanup on unmount', () => {
    const mockCallback = vi.fn();
    const { result, unmount } = renderHook(() => 
      useDebouncedCallback(mockCallback, 300)
    );

    act(() => {
      result.current('test');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
