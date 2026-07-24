# 쪼꼬 앱 (web)

쪼꼬 출산 준비 PWA — Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.

## 실행

```bash
cd web
npm install
npm run dev     # http://localhost:3000
npm run build   # 프로덕션 빌드
```

## 화면 구성

| 경로 | 화면 | 상태 |
|---|---|---|
| `/` | 홈 — D-day, 주수, 진행률, 이번 주 쪼꼬 크기, 다가오는 일정 | ✅ 동작 |
| `/checklist` | 체크리스트 — 44개 검진·행정·준비물 일정 (월별 그룹, 완료 체크) | ✅ 동작 |
| `/journal` | 태담 일기 — 아빠/엄마가 쪼꼬에게 남기는 기록 | ✅ 동작 |
| `/names` | 이름 후보 — 후보 등록 + 부부 별점 랭킹 | ✅ 동작 |
| `/album` | 초음파 앨범 (업로드·타임라인, 비공개 저장소) | ✅ 공유 모드에서 |
| `/login` | 공유 설정 — 로그인, 가족 공간 생성/초대 코드 참여 | ✅ 동작 |

## 데이터 모드

Supabase 환경변수(`web/.env.example` 참고) 유무에 따라 자동 전환:

- **미설정 (local 모드)**: 체크·일기·이름을 localStorage에 저장 (기기별).
  앨범은 잠김. 지금 배포 상태.
- **설정 (공유 모드)**: 부부가 각자 로그인해 같은 "가족 공간"을 공유.
  체크리스트·일기·이름·앨범이 실시간(Realtime) 동기화. RLS로 가족 외 접근 차단.
  설정 방법: [`../docs/SUPABASE.md`](../docs/SUPABASE.md)

- 기준 정보(예정일 2027-03-17)는 [`lib/pregnancy.ts`](lib/pregnancy.ts)에 있음
- 체크리스트 시드 [`data/tasks.json`](data/tasks.json)은 저장소 루트의 캘린더
  데이터에서 생성: `python3 scripts/export_tasks_json.py > web/data/tasks.json`
- DB 스키마: [`../supabase/schema.sql`](../supabase/schema.sql)

## PWA

`app/manifest.ts` + `public/icon-*.png` 구성. 브라우저에서 "홈 화면에 추가"로
설치 가능 (오프라인 캐싱용 서비스워커는 이후 단계).

## 배포 (Vercel)

프로젝트 루트 디렉터리를 `web`으로 지정하면 나머지는 자동 감지.
자세한 단계: [`../docs/DEPLOY.md`](../docs/DEPLOY.md)
