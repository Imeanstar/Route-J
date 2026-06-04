import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Supabase 세션 저장소.
 * 웹 SSR(서버)에서는 window가 없으므로 AsyncStorage 대신 no-op → 크래시 방지.
 */
export function createAuthStorage() {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve(null);
        return Promise.resolve(window.localStorage.getItem(key));
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }
  return AsyncStorage;
}
