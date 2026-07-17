"use client";

import { useEffect, useState } from "react";

/** localStorage 동기화 상태. 마운트 전에는 initial 값을 반환한다. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // 손상된 데이터는 무시하고 초기값 사용
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 공간 부족 등은 조용히 무시
    }
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}
