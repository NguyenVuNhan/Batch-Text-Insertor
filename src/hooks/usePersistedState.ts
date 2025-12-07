import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'batch-text-insertion-state';

interface PersistedState {
  names: string[];
  lastTextStyle?: {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    color: string;
    textDecoration: string;
    textTransform: string;
    letterSpacing: number;
    lineHeight: number;
    textShadow: string;
    opacity: number;
  };
}

/**
 * Load persisted state from localStorage
 */
export function loadPersistedState(): PersistedState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return null;
}

/**
 * Save state to localStorage
 */
export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save persisted state:', error);
  }
}

/**
 * Custom hook for persisted state
 */
export function usePersistedState<T>(
  key: keyof PersistedState,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    const persisted = loadPersistedState();
    if (persisted && key in persisted) {
      return persisted[key] as T;
    }
    return initialValue;
  });

  const setPersistedValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof newValue === 'function' 
          ? (newValue as (prev: T) => T)(prev) 
          : newValue;
        
        // Save to localStorage
        const currentState = loadPersistedState() || { names: [] };
        savePersistedState({
          ...currentState,
          [key]: resolved,
        });
        
        return resolved;
      });
    },
    [key]
  );

  return [value, setPersistedValue];
}

/**
 * Hook to auto-save names list
 */
export function useAutoSaveNames(names: string[]): void {
  useEffect(() => {
    const currentState = loadPersistedState() || { names: [] };
    savePersistedState({
      ...currentState,
      names,
    });
  }, [names]);
}

/**
 * Hook to load initial names from localStorage
 */
export function useInitialNames(): string[] {
  const persisted = loadPersistedState();
  return persisted?.names || [];
}
