# Supabase 연동 가이드

부부 계정 공유(체크리스트·일기·이름 실시간 동기화)와 초음파 앨범을 켜는 방법.
**약 10분 소요, 무료 플랜으로 충분.** 키를 설정하기 전까지 앱은 지금처럼
localStorage 모드로 동작하므로 서두르지 않아도 된다.

## 1. 프로젝트 생성 (3분)

1. https://supabase.com → GitHub로 로그인 → **New project**
2. 설정:
   - Name: `zzokko`
   - Database Password: 생성 후 안전한 곳에 보관 (다시 쓸 일은 거의 없음)
   - Region: **Northeast Asia (Seoul)**
3. 생성 완료까지 1~2분 대기

## 2. 스키마 적용 (1분)

1. 왼쪽 메뉴 **SQL Editor** → New query
2. 이 저장소의 [`supabase/schema.sql`](../supabase/schema.sql) 내용 전체를
   붙여넣고 **Run**
3. "Success. No rows returned" 확인
   - 테이블 7개, 보안 정책(RLS), 비공개 사진 버킷, 실시간 동기화까지 한 번에 생성됨

## 3. 이메일 로그인 설정 (1분)

1. **Authentication → Sign In / Up → Email** 활성화 확인 (기본 켜짐)
2. 편의를 위해 **Confirm email을 끄는 것을 추천** (부부 2명만 쓰는 앱이라
   메일 인증 없이 가입 즉시 로그인). 켜두면 가입 시 확인 메일을 눌러야 함.

## 4. Vercel에 키 등록 (2분)

1. Supabase 대시보드 → **Project Settings → API**에서 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Vercel → zzokko 프로젝트 → **Settings → Environment Variables**에 위 2개 추가
   (Production/Preview/Development 모두 체크)
3. **Deployments → 최신 배포 → ⋯ → Redeploy** (환경변수는 재배포 후 반영)

## 5. 앱에서 가족 공간 만들기 (2분)

1. https://zzokko.vercel.app 접속 → 홈의 상태 칩(📱/🔒) 탭 → **공유 설정**
2. 회원가입 → 역할 선택(아빠) → **새 가족 공간 만들기** (성 입력: 선택)
3. 발급된 **6자리 초대 코드**를 배우자에게 전달
4. 배우자 휴대폰: 같은 페이지에서 회원가입 → 역할 선택(엄마) →
   **초대 코드로 참여**
5. 끝! 이제 체크리스트·일기·이름·앨범이 실시간으로 공유됨

## 로컬 개발

`web/.env.local` 파일을 만들고 같은 2개 값을 넣으면 로컬에서도 공유 모드로 동작
(`web/.env.example` 참고). 커밋되지 않도록 .gitignore에 이미 포함되어 있음.

## 보안 메모

- 모든 테이블에 RLS(행 수준 보안)가 걸려 있어 **가족 멤버만** 자기 가족
  데이터를 읽고 쓸 수 있다. anon 키가 공개되어도 남의 데이터엔 접근 불가.
- 사진 버킷은 비공개이며 1시간짜리 서명 URL로만 표시된다.
- 초대 코드는 6자리(31자 알파벳)로 무차별 대입이 어렵지만, 공개된 곳에
  올리지는 말 것.
