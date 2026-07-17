# Vercel 배포 가이드

쪼꼬 앱(`web/`)을 Vercel에 배포하는 방법. 한 번 연결하면 이후 푸시마다 자동 재배포된다.

## 최초 연결 (약 2분)

1. https://vercel.com/new 접속 → GitHub 계정으로 로그인
2. **Import Git Repository**에서 `seun1217/zzokko` 선택
   - 목록에 없으면 *Adjust GitHub App Permissions*로 zzokko 저장소 접근 허용
3. 설정 화면에서 딱 한 가지만 변경:
   - **Root Directory** → `Edit` 클릭 → `web` 선택
   - Framework Preset은 Next.js로 자동 감지됨. 환경변수 등 나머지는 그대로.
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
