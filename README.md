# LevelUp10 V0.23.1.6 — Parent Progress Summary

Parent Dashboard now derives Level from the same 250-XP level rule as the learner app and Mastery from the existing curriculum mastery evidence in the linked student cloud state. No new progress table or SQL migration is required.

# LevelUp10 V0.23.1.2 — Parent Registration Fix

Fixes account-role creation so Student, Parent and Teacher selections are persisted to `profiles.role`.

## Required Supabase step
Run `supabase_v02312_role_registration_fix.sql` once before creating a new Parent or Teacher account.

The app now verifies the database role immediately after sign-up and shows an explicit error instead of silently opening the wrong account type.

V0.23.1 Parent linking and V0.23.1.1 recovery behaviour are retained.


V0.23.1.6: preserves the Profile view across Android/PWA pull-to-refresh; Home still returns home intentionally and active mission resume remains unchanged.
\nV0.23.1.6: Parent Dashboard now shows per-subject learning status and a read-only Full Progress view using the student's existing mastery evidence.\n
V0.23.1.6: role-based app shell. Parent and teacher accounts route directly to their dashboards on sign-in/start/refresh and cannot enter the learner Home/Profile/Shop/Mission shell. Parent full progress remains read-only.
