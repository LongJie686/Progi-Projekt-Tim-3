import { useState, useEffect, useCallback } from 'react';

interface UseDebounceResult<T> {
  debouncedValue: T;
  setValue: (value: T) => void;
  isDebouncing: boolean;
}

export function useDebounce<T>(initialValue: T, delay: number = 300): UseDebounceResult<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return { debouncedValue, setValue, isDebouncing };
}

export default useDebounce;