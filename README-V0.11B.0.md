# GCSE Boost V0.11B.0 — Cloud Sign-In Foundation

Built on the confirmed V0.11A.29.2 baseline.

Adds:
- Supabase student sign in
- Supabase student account creation
- persistent cloud session
- cloud profile recognition (profiles table)
- sign out
- visible Cloud Account status on Home

Safety for this stage:
- existing local learner profiles/progress remain unchanged
- no student progress is uploaded yet
- no cloud data overwrites local data
- only the Supabase publishable key is included; no service-role/database secret

Also retains the V0.11A.29 mission-answer repair and V0.11A.29.2 Home-button repair.
