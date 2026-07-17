# 쪼꼬 (Zzokko) 👶

태명 **쪼꼬**의 임신·출산 준비를 위한 저장소.

- 출산예정일: **2027-03-17** (임신확인일 2026-07-15, 일태아)
- 주수 계산 기준일(LMP 상당일): 2026-06-10

## 📅 출산 준비 캘린더

[`calendar/zzokko-pregnancy.ics`](calendar/zzokko-pregnancy.ics) — 검진, 정부 지원
신청, 준비물, 마일스톤 등 **44개 이벤트**가 담긴 iCalendar 파일.

### Google Calendar로 가져오기

1. [Google Calendar](https://calendar.google.com) 접속 (PC 웹 기준)
2. 오른쪽 위 ⚙️ → **설정** → 왼쪽 메뉴 **가져오기/내보내기**
3. `zzokko-pregnancy.ics` 파일 선택
4. 가져올 캘린더 선택 — **"쪼꼬"라는 새 캘린더를 먼저 만들고 거기로 가져오는 것을 추천**
   (나중에 한꺼번에 켜고 끄거나 와이프와 캘린더 단위로 공유하기 편함)
5. **가져오기** 클릭 → 모든 이벤트에 전날 오전 9시 알림 포함

> 병원 검진 이벤트는 표준 시기 기준의 **가안**입니다. 실제 병원 예약일이 잡히면
> 해당 이벤트를 드래그해서 옮겨 쓰세요.

### 캘린더 다시 생성하기

날짜나 이벤트를 수정하려면 [`scripts/generate_ics.py`](scripts/generate_ics.py)의
`EVENTS` 목록을 고친 뒤:

```bash
python3 scripts/generate_ics.py > calendar/zzokko-pregnancy.ics
```

## 📱 쪼꼬 앱 계획

태교, 작명, 검진 체크리스트, 초음파 앨범 등 쪼꼬와 관련된 모든 것을 담을 앱의
기능 제안과 로드맵: [`docs/APP_PLAN.md`](docs/APP_PLAN.md)

## ⚠️ 참고

- 정부 지원금 금액·조건(국민행복카드, 첫만남이용권, 부모급여 등)은 변동될 수
  있으니 신청 시점에 정부24/복지로에서 재확인하세요.
- 이 저장소에는 개인 식별 정보(주민등록번호 등)를 넣지 않습니다.
