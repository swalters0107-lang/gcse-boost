# LevelUp10 V0.21.4 — Per-Skill Evidence Tracking

This patch keeps the existing unit-level mastery but correctly attributes each new answer to the curriculum skill shown in the expanded cards.

## Fixes
- Sport Science questions now roll up into the visible R180/R181/R182/R183 skill rows.
- Historical answers are only migrated when the saved question can be matched back to a real bank question.
- New answers store the canonical curriculum skill.
- Unit mastery remains independent from skill mastery.
- Untested skills remain New rather than inheriting the whole-unit percentage.
- Adaptive question scoring now uses the same canonical skill bucket.

Build/cache version: V0.21.4.
