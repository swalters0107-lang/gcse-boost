# GCSE Boost V0.11B.2 — Cloud Save System

- Supabase becomes the source of truth for a signed-in learner.
- Existing local test progress is not migrated; an empty cloud learner starts fresh.
- Cloud state is loaded at sign-in/startup and cached locally for offline use.
- App saves are debounced to Supabase after missions, answers, rewards, shop/profile/timetable changes.
- Scalar progress fields (XP, coins, streak, lives, missions, boss wins) are kept in sync with the full JSON state.
- Save Now and Sign Out are available in Cloud Account.
- V0.11A.29.2 Home/Recovery fixes remain included.
