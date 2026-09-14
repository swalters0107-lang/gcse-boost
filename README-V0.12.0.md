# LevelUp10 V0.12.0 — Platform Foundation

Built from the confirmed stable V0.11B.5.3 baseline.

## Changes
- Authenticated user is treated as the LevelUp10 identity.
- On cloud sign-in, ensures membership of the `gcse` app in `user_apps`.
- Ensures a non-destructive `gcse_profiles` row exists.
- Updates `last_opened_at` for the GCSE app.
- Existing `student_data` remains the canonical GCSE progress store.
- Existing mission resume, Dragon Encounter, profile layout and cloud sync are preserved.
- Cloud Account panel confirms `LevelUp10 app: GCSE ✓`.

No existing learner progress is migrated or deleted in this release.
