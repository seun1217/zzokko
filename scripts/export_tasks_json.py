#!/usr/bin/env python3
"""generate_ics.py의 EVENTS를 웹앱 체크리스트 시드 JSON으로 변환.

사용법:
  python3 scripts/export_tasks_json.py > web/data/tasks.json
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from generate_ics import EVENTS  # noqa: E402

CATEGORY_BY_EMOJI = {
    "📋": "행정·지원금",
    "🏥": "병원·검진",
    "💛": "마일스톤",
    "🍼": "준비물",
    "💰": "보험·돈",
    "👶": "마일스톤",
}


def main() -> None:
    tasks = []
    for i, (day, summary, description) in enumerate(EVENTS, start=1):
        emoji = summary.split()[0]
        tasks.append({
            "id": f"zzokko-{i:04d}",
            "date": day.isoformat(),
            "title": summary,
            "category": CATEGORY_BY_EMOJI.get(emoji, "기타"),
            "description": description,
        })
    tasks.sort(key=lambda t: (t["date"], t["id"]))
    json.dump(tasks, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
