// 주차별 쪼꼬 발달 정보 (크기 비유는 통용되는 근사치)
export interface WeeklyInfo {
  week: number;
  emoji: string;
  compare: string;
  length: string;
  note: string;
}

export const WEEKLY: WeeklyInfo[] = [
  { week: 4, emoji: "🌱", compare: "양귀비 씨앗", length: "0.2cm", note: "착상 완료! 신경관이 만들어지기 시작해요." },
  { week: 5, emoji: "🌰", compare: "참깨", length: "0.4cm", note: "아기집이 보이는 시기. 심장이 뛸 준비를 해요." },
  { week: 6, emoji: "🫘", compare: "렌틸콩", length: "0.6cm", note: "심장이 뛰기 시작해요! 분당 100회 이상." },
  { week: 7, emoji: "🫐", compare: "블루베리", length: "1.0cm", note: "팔다리 싹이 나오고 뇌가 빠르게 자라요." },
  { week: 8, emoji: "🍓", compare: "라즈베리", length: "1.6cm", note: "손가락·발가락이 구분되기 시작해요." },
  { week: 9, emoji: "🍒", compare: "체리", length: "2.3cm", note: "꼬리가 사라지고 점점 사람 모습을 갖춰가요." },
  { week: 10, emoji: "🍊", compare: "금귤", length: "3.1cm", note: "이제 공식적으로 태아! 주요 장기가 모두 자리를 잡았어요." },
  { week: 11, emoji: "🍈", compare: "무화과", length: "4.1cm", note: "머리가 몸의 절반 크기. 손톱이 자라기 시작해요." },
  { week: 12, emoji: "🍋", compare: "라임", length: "5.4cm", note: "반사 신경이 발달해요. 안정기 진입!" },
  { week: 13, emoji: "🫛", compare: "완두콩 꼬투리", length: "7.4cm", note: "세상에 하나뿐인 지문이 만들어져요." },
  { week: 14, emoji: "🍋", compare: "레몬", length: "8.7cm", note: "표정을 지을 수 있어요. 2분기 시작!" },
  { week: 15, emoji: "🍎", compare: "사과", length: "10.1cm", note: "빛을 감지하기 시작하고, 딸꾹질도 해요." },
  { week: 16, emoji: "🥑", compare: "아보카도", length: "11.6cm", note: "소리를 듣기 시작해요. 태담을 시작하기 좋은 때!" },
  { week: 17, emoji: "🍐", compare: "서양배", length: "13.0cm", note: "피하지방이 생기기 시작해요." },
  { week: 18, emoji: "🍠", compare: "고구마", length: "14.2cm", note: "태동을 느낄 수 있는 시기! 첫 태동을 기록해요." },
  { week: 19, emoji: "🥭", compare: "망고", length: "15.3cm", note: "피부를 보호하는 태지가 생겨요." },
  { week: 20, emoji: "🍌", compare: "바나나", length: "25cm", note: "임신 절반 지점! 이제 머리끝부터 발끝까지 재요." },
  { week: 21, emoji: "🥕", compare: "당근", length: "26.7cm", note: "양수를 삼키는 연습 중. 태동이 뚜렷해져요." },
  { week: 22, emoji: "🍈", compare: "파파야", length: "27.8cm", note: "눈썹과 눈꺼풀이 완성됐어요." },
  { week: 23, emoji: "🍊", compare: "자몽", length: "28.9cm", note: "바깥 소리에 반응해요. 아빠 목소리를 들려주세요." },
  { week: 24, emoji: "🌽", compare: "옥수수", length: "30cm", note: "폐가 발달 중이고 청력이 예민해져요." },
  { week: 25, emoji: "🥬", compare: "순무", length: "34.6cm", note: "머리카락 색이 정해지는 시기예요." },
  { week: 26, emoji: "🧅", compare: "대파", length: "35.6cm", note: "눈을 뜨기 시작하고 호흡 연습을 해요." },
  { week: 27, emoji: "🥦", compare: "콜리플라워", length: "36.6cm", note: "렘수면이 시작 — 꿈을 꿀 수도 있어요." },
  { week: 28, emoji: "🍆", compare: "가지", length: "37.6cm", note: "3분기 시작! 하루 태동 10회 체크를 시작해요." },
  { week: 29, emoji: "🎃", compare: "단호박", length: "38.6cm", note: "근육과 폐가 성숙해지고 뇌가 빠르게 발달해요." },
  { week: 30, emoji: "🥬", compare: "양배추", length: "39.9cm", note: "이제 몸무게가 쑥쑥 늘어나는 시기." },
  { week: 31, emoji: "🥥", compare: "코코넛", length: "41.1cm", note: "오감이 모두 발달했어요." },
  { week: 32, emoji: "🎃", compare: "호박", length: "42.4cm", note: "머리를 아래로 돌리는 시기예요." },
  { week: 33, emoji: "🍍", compare: "파인애플", length: "43.7cm", note: "뼈가 단단해져요 (머리뼈는 출산을 위해 말랑)." },
  { week: 34, emoji: "🍈", compare: "멜론", length: "45cm", note: "폐가 거의 완성! 출산가방 쌀 때예요." },
  { week: 35, emoji: "🍈", compare: "허니듀 멜론", length: "46.2cm", note: "신장이 완성되고 살이 통통하게 올라요." },
  { week: 36, emoji: "🥬", compare: "로메인 상추", length: "47.4cm", note: "이제 매주 검진! 골반으로 내려갈 준비를 해요." },
  { week: 37, emoji: "🌿", compare: "근대 한 단", length: "48.6cm", note: "만삭! 이제 언제 나와도 괜찮아요." },
  { week: 38, emoji: "🥬", compare: "리크 한 단", length: "49.8cm", note: "태지가 벗겨지고 피부가 매끈해져요." },
  { week: 39, emoji: "🍉", compare: "미니 수박", length: "50.7cm", note: "폐와 뇌가 마지막 스퍼트 중!" },
  { week: 40, emoji: "🎃", compare: "큰 호박", length: "51.2cm", note: "드디어 예정일! 쪼꼬를 곧 만나요 👶" },
  { week: 41, emoji: "🍉", compare: "수박", length: "51.5cm", note: "조금 늦어도 괜찮아요. 병원과 상의해요." },
];

export function weeklyInfo(week: number): WeeklyInfo | undefined {
  if (week < 4) return WEEKLY[0];
  if (week > 41) return WEEKLY[WEEKLY.length - 1];
  return WEEKLY.find((w) => w.week === week);
}
