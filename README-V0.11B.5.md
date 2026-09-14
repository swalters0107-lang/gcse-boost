# GCSE Boost V0.11B.5 — Rare Dragon Encounter

Built from the confirmed-stable V0.11B.4.2.2 baseline.

## Dragon rules
- Rare 4% roll after a completed normal mission, starting after 3 completed missions.
- Maximum one naturally-triggered encounter per UTC date.
- 20 mixed-subject questions; today's school timetable is ignored.
- No repeated question pattern inside an encounter.
- Questions respect the learner's existing Foundation/Higher and course-option filters.
- Exactly 3 Dragon lives, separate from normal learner lives.
- No Recovery Round in a Dragon Encounter.
- Lose all 3 lives: Dragon escapes, no 1,000-coin reward.
- Complete all 20: +1,000 Boost Coins.
- Correct answers still earn the normal +10 XP.
- Encounter questions/state persist once created, preventing close/reopen rerolls.

## Test hook
For the existing Test learner only, open `?dragonTest=1` on the app URL to force a pending Dragon Encounter for QA. This does not alter the live 4% encounter rate.
