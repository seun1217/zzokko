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

배포는 성공했는데 `/`를 포함한 모든 페이지가 404로 뜨는 증상.

### 증상 구별법

```sh
curl -sI https://zzokko.vercel.app | grep x-vercel-error
```

- `x-vercel-error: DEPLOYMENT_NOT_FOUND` → 그 도메인에 붙은 배포가 아예 없음
  (프로젝트 미생성, 도메인 미할당, 또는 Production Branch 설정 문제)
- `x-vercel-error: NOT_FOUND` → **배포는 있는데 내보낸 결과물에 그 경로가 없음**
  = 아래의 Framework Preset 문제

`NOT_FOUND`인 경우 다음으로 무엇이 서빙되고 있는지 확인한다:

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://zzokko.vercel.app/icon-192.png
```

여기서 **200**이 나오면 `web/public/`의 파일만 서빙되고 있다는 뜻이다.
`/login`, `/manifest.webmanifest` 같은 Next.js 라우트는 404인데
`web/public/` 안의 아이콘 4개만 200이면 진단 확정.

### 원인

Framework Preset이 **Other**로 잡혀 있으면 Vercel은 Output Directory를
`public`(있으면) 또는 `.`로 정한다. 즉 `npm run build`는 1분 넘게 정상
실행되지만 결과물인 `.next`는 버려지고 `web/public/`만 정적으로 서빙된다.
그래서 빌드 로그는 초록불인데 모든 라우트가 404가 된다.

Root Directory를 나중에 `web`으로 바꿔도 Preset은 Other로 남아 있기 때문에
(최초 임포트 시 저장소 루트에 `package.json`이 없어 프레임워크 미감지)
이 상태가 계속 유지된다.

### 해결

`web/vercel.json`이 빌드 설정 네 가지를 모두 명시하고 있고, 이 값들은
대시보드 Project Settings보다 **우선한다**:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

`framework`만 지정하면 대시보드에 걸린 Output Directory / Build Command
Override를 못 이긴다(Other 프리셋은 Build Command Override가 기본으로
켜져 있다). 그래서 네 가지를 전부 적는다.

이 파일은 Root Directory 기준으로 읽히므로 저장소 루트가 아니라
반드시 `web/vercel.json`이어야 한다.

### 그래도 안 고쳐지면

`vercel.json`은 **새 배포가 실행되어야** 반영된다. 커밋을 푸시했는데도
그대로면 대시보드에서 다음을 확인한다:

1. Settings → Git — GitHub 저장소가 연결되어 있는지. 연결이 없으면
   푸시해도 재배포가 안 된다(커밋에 Vercel 상태 체크가 안 붙는 걸로 확인 가능).
2. Settings → Git → **Production Branch**가
   `claude/pregnancy-schedule-app-plan-o33g7a`인지. 다른 값이면 푸시가
   Preview 배포만 만들고 프로덕션 도메인은 그대로 404다.
3. Deployments 탭 → 최신 배포 → **Redeploy**로 강제 재배포.
4. Settings → Build and Deployment에서 Framework Preset을 직접
   **Next.js**로 바꾸고 Build Command / Output Directory의 Override 토글을
   꺼도 된다(`vercel.json`과 동일한 결과).
