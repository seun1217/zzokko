import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** http(s)로 파싱되는 주소인지 확인. 빈 값·플레이스홀더·오타를 걸러낸다. */
function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 이 모듈은 빌드 중 프리렌더에서도 평가된다. createClient가 여기서 예외를
 * 던지면 빌드 전체가 실패하므로(잘못된 환경변수 하나로 배포가 통째로 막힌다)
 * 설정이 성립할 때만 클라이언트를 만든다.
 */
function initSupabase(): SupabaseClient | null {
  const trimmedUrl = url?.trim();
  const trimmedKey = anonKey?.trim();

  if (!trimmedUrl || !trimmedKey) return null;

  if (!isHttpUrl(trimmedUrl)) {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL이 올바른 http(s) 주소가 아니라 " +
        "localStorage 단독 모드로 동작한다.",
    );
    return null;
  }

  try {
    return createClient(trimmedUrl, trimmedKey);
  } catch (error) {
    console.warn(
      "[supabase] 클라이언트 생성에 실패해 localStorage 단독 모드로 동작한다.",
      error,
    );
    return null;
  }
}

/** 환경변수가 없거나 잘못됐으면 null — 앱은 localStorage 단독 모드로 동작한다. */
export const supabase: SupabaseClient | null = initSupabase();

export const supabaseConfigured = supabase !== null;
