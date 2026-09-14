# GCSE Boost V0.11B.5.1 — Dragon Test Trigger Fix

- Fixes the forced Dragon QA URL.
- `?dragon=1` now creates a Dragon encounter immediately without requiring a timetable or completed mission.
- Legacy `?dragonTest=1` also works.
- The force parameter is consumed after creating the encounter, preventing repeated forced encounters when returning Home.
- Normal rare encounter behaviour remains 4% after eligible completed missions, max once per day.
- Preserves V0.11B.4.2.2 mission-resume and cloud fixes.
