// 쪼꼬 임신 기준 정보 (임신확인서 기준)
export const NICKNAME = "쪼꼬";
export const EDD = new Date(2027, 2, 17); // 분만예정일 2027-03-17
export const LMP = new Date(2026, 5, 10); // 주수 계산 기준일 (EDD - 280일)
export const TOTAL_DAYS = 280;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 자정 기준 로컬 날짜 */
export function todayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** a → b 사이 일수 (b - a) */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/** "2026-07-20" → 로컬 Date */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface Gestation {
  /** LMP 기준 경과 일수 */
  days: number;
  week: number;
  day: number;
  /** 출산예정일까지 남은 일수 (D-n) */
  dday: number;
  /** 0~1 진행률 */
  progress: number;
  trimester: 1 | 2 | 3;
}

export function gestationAt(date: Date): Gestation {
  const days = daysBetween(LMP, date);
  const week = Math.floor(days / 7);
  return {
    days,
    week,
    day: days % 7,
    dday: daysBetween(date, EDD),
    progress: Math.min(Math.max(days / TOTAL_DAYS, 0), 1),
    trimester: week < 14 ? 1 : week < 28 ? 2 : 3,
  };
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatDateKo(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`;
}

export function formatMonthKo(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${y}년 ${m}월`;
}
