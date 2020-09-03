import {Dispatch, SetStateAction, useState} from 'react';

export enum LocalStorageKeys {
  API_KEY = 'DEDUPOTRON_API_KEY',
  SETTING_HIGHLIGHT_GEAR = 'DEDUPOTRON_SETTING_HIGHLIGHT_GEAR',
  SETTING_ONLY_DUPLICATES = 'DEDUPOTRON_SETTING_ONLY_DUPLICATES',
  SETTING_COMPACT = 'DEDUPOTRON_SETTING_COMPACT'
}

export default function useLocalStorage<T>(key: LocalStorageKeys, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
    }
  };

  return [storedValue, setValue] as [T, Dispatch<SetStateAction<T>>];
}