import {Dispatch, SetStateAction, useState} from 'react';

export enum LocalStorageKeys {
  API_KEY = 'DEDUPOTRON_API_KEY',
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