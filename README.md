# LevelUp10 V0.23.1.1 — Account Recovery Fix

Build based on V0.23.1 Parent Accounts.

## Fixes
- Adds **SIGN OUT / USE ANOTHER ACCOUNT** to the platform-connection error screen.
- Recovery sign-out bypasses student progress saving so a deleted/incomplete account cannot trap the user.
- Detects a missing `profiles` row explicitly before treating an account as a student.
- Bumps the PWA/service-worker cache to `levelup10-v02311` so the fix deploys cleanly.

No Supabase schema change is required for this recovery fix. The V0.23.1 parent dashboard SQL remains the current parent-dashboard migration.
