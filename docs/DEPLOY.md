# Vercel 배포 가이드

쪼꼬 앱(`web/`)을 Vercel에 배포하는 방법. 한 번 연결하면 이후 푸시마다 자동 재배포된다.

## 최초 연결 (약 2분)

1. https://vercel.com/new 접속 → GitHub 계정으로 로그인
2. **Import Git Repository**에서 `seun1217/zzokko` 선택
   - 목록에 없으면 *Adjust GitHub App Permissions*로 zzokko 저장소 접근 허용
3. 설정 화면에서 두 가지를 확인:
   - **Root Directory** → `Edit` 클릭 → `web` 선택
   - **Framework Preset**이 `Next.js`인지 확인. Root Directory를 바꾸기 전에
     저장소 루트를 먼저 훑기 때문에 `Other`로 잡혀 있을 수 있다. `Other`로
     두면 빌드는 성공해도 모든 페이지가 404가 된다(아래 문제 해결 참고).
   - 환경변수 등 나머지는 그대로.
4. **Deploy** 클릭 → 1~2분 뒤 `https://<프로젝트명>.vercel.app` 발급

## 배포 후 확인

- 발급된 URL을 휴대폰에서 열기
- 홈 화면에 추가(iOS: 공유 → 홈 화면에 추가 / Android: 설치 배너)하면
  하트 아이콘의 "쪼꼬" 앱으로 설치됨

## 자동 배포 동작

- 현재 GitHub 기본 브랜치는 `claude/pregnancy-schedule-app-plan-o33g7a`
  (유일한 브랜치)라 이 브랜치 푸시가 곧 프로덕션 배포다.
- 나중에 `main` 브랜치를 만들어 기본 브랜치를 바꾸면, Vercel 프로젝트
  Settings → Git → Production Branch도 함께 확인할 것.

## 도메인 (선택)

Settings → Domains에서 무료 `*.vercel.app` 서브도메인 이름을 바꾸거나
(예: `zzokko.vercel.app`이 비어 있다면 사용 가능) 보유한 도메인을 연결할 수 있다.

## 문제 해결: 모든 페이지가 404일 때

배포 로그는 초록불인데 `/`를 포함한 모든 페이지가 404로 뜨는 증상.

핵심은 **Vercel이 빌드에 실패하면 직전에 성공한 배포를 계속 서빙한다**는 점이다.
그래서 최신 커밋이 계속 실패해도 도메인은 조용히 옛 배포를 붙들고 있고,
겉으로는 "배포는 됐는데 404"처럼 보인다.

### 1단계 — 배포가 있긴 한지

```sh
curl -sI https://zzokko.vercel.app | grep x-vercel-error
```

- `DEPLOYMENT_NOT_FOUND` → 도메인에 붙은 배포가 아예 없음
  (프로젝트 미생성, 도메인 미할당, Production Branch 설정 문제)
- `NOT_FOUND` → 배포는 있는데 그 결과물에 해당 경로가 없음 → 2단계로

### 2단계 — 최신 빌드가 실제로 성공했는지

여기서 대시보드를 봐야 한다. Deployments 탭에서 최신 배포가 **Error**면
도메인이 서빙 중인 건 그 배포가 아니라 마지막 **Ready** 배포다.

`VERCEL_TOKEN`이 있으면 CLI 없이도 확인할 수 있다:

```sh
curl -sS -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?limit=10" |
  python3 -c "import json,sys;[print(d['state'],d.get('target'),d['url']) for d in json.load(sys.stdin)['deployments']]"
```

실패한 배포의 빌드 로그는 이렇게 꺼낸다:

```sh
curl -sS -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v3/deployments/<deployment-id>/events?limit=300" |
  python3 -c "import json,sys;[print(e.get('text','')) for e in json.load(sys.stdin)]"
```

### 실제로 겪은 원인: 환경변수 하나가 빌드를 통째로 깨뜨림

`web/lib/supabase.ts`는 모듈 최상단에서 Supabase 클라이언트를 만든다.
이 모듈은 **빌드 중 프리렌더 단계에서도 평가되기 때문에**, 여기서 예외가
나면 페이지 생성이 멈추고 빌드 전체가 실패한다.

Vercel 프로젝트에 `NEXT_PUBLIC_SUPABASE_URL`이 http(s) 주소가 아닌 값으로
들어 있으면 정확히 이 일이 벌어진다:

```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
Error occurred prerendering page "/_not-found"
⨯ Next.js build worker exited with code: 1
```

로컬에서는 그 환경변수가 아예 없어 `url && anonKey` 가드에 걸려 `null`이
되므로 빌드가 멀쩡히 통과한다. 그래서 **로컬은 되는데 Vercel만 깨지는**
형태로 나타난다.

현재는 URL 형식까지 검증해서 잘못된 값이면 클라이언트를 만들지 않고
localStorage 단독 모드로 떨어지도록 고쳐 두었다. 잘못된 환경변수 하나로
배포가 막히지는 않는다.

다만 **커플 공유 기능을 쓰려면 값 자체는 제대로 넣어야 한다.**
Settings → Environment Variables에서 확인할 것:

- `NEXT_PUBLIC_SUPABASE_URL` → `https://<project-ref>.supabase.co` 형태
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public 키

둘 다 안 쓸 거면 아예 **삭제**하는 편이 낫다. 비워 두거나 플레이스홀더를
남겨 두면 헷갈리기만 한다. 값을 바꾼 뒤에는 재배포해야 반영된다.

### 빌드 설정이 의심될 때

`web/vercel.json`이 빌드 설정 네 가지를 명시하고 있고, 이 값들은 대시보드
Project Settings보다 **우선한다**:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

Framework Preset이 `Other`로 잡히면 Vercel은 Output Directory를
`public`(있으면) 또는 `.`로 정한다. 그러면 빌드는 성공해도 `.next`가 버려지고
`web/public/`의 아이콘 파일들만 정적으로 서빙돼 모든 라우트가 404가 된다.
아래처럼 아이콘만 200이면 이 상태다:

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://zzokko.vercel.app/icon-192.png  # 200
curl -s -o /dev/null -w "%{http_code}\n" https://zzokko.vercel.app/login         # 404
```

`vercel.json`이 네 값을 모두 고정하므로 대시보드가 어떤 상태든 이 조합으로
빌드된다. 이 파일은 Root Directory 기준으로 읽히므로 저장소 루트가 아니라
반드시 `web/vercel.json`이어야 한다.

### 그 밖에 확인할 것

1. Settings → Git — GitHub 저장소 연결 여부. 연결이 없으면 푸시해도 재배포가 안 된다.
2. Settings → Git → **Production Branch**가
   `claude/pregnancy-schedule-app-plan-o33g7a`인지. 다른 값이면 푸시가
   Preview 배포만 만들고 프로덕션 도메인은 그대로다.
3. Deployments 탭 → **Redeploy**로 강제 재배포.
