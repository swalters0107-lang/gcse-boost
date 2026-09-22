# LevelUp10 V0.23.2.2 — Student Class Join

Parent Dashboard now derives Level from the same 250-XP level rule as the learner app and Mastery from the existing curriculum mastery evidence in the linked student cloud state. No new progress table or SQL migration is required.

# LevelUp10 V0.23.1.2 — Parent Registration Fix

Fixes account-role creation so Student, Parent and Teacher selections are persisted to `profiles.role`.

## Required Supabase step
Run `supabase_v02312_role_registration_fix.sql` once before creating a new Parent or Teacher account.

The app now verifies the database role immediately after sign-up and shows an explicit error instead of silently opening the wrong account type.

V0.23.1 Parent linking and V0.23.1.1 recovery behaviour are retained.


V0.23.2.1: preserves the Profile view across Android/PWA pull-to-refresh; Home still returns home intentionally and active mission resume remains unchanged.
\nV0.23.2.1: Parent Dashboard now shows per-subject learning status and a read-only Full Progress view using the student's existing mastery evidence.\n
V0.23.2.1: role-based app shell. Parent and teacher accounts route directly to their dashboards on sign-in/start/refresh and cannot enter the learner Home/Profile/Shop/Mission shell. Parent full progress remains read-only.

V0.23.2.1: Parent Full Progress now derives subject evidence directly from canonical state.history rows. It no longer depends on learner-side curriculumArea/skill migration metadata. Adds read-only grade estimates from the same history evidence.

V0.23.2.1 Teacher V1: teacher-only dashboard, class creation, reusable expiring join codes, roster and read-only student progress. Student join continues through existing join_class_with_code RPC.

V0.23.2.2: Student Cloud Account adds Join a Class. It calls the existing secure join_class_with_code RPC, accepts the teacher 8-character code, keeps the learner experience unchanged, and leaves teacher access read-only.


## V0.23.4.2
Fixes the Starting Assessment completion handoff: completion is flushed to Supabase before onboarding closes, then the learner is taken directly into a normal 8-question mission. This prevents stale cloud state from reopening Question 1.


## V0.23.4.3 — Balanced Adaptive Missions
Normal 8-question missions now target 3–5 skills rather than allowing one weak topic to dominate. The weakest evidenced skills are prioritised, difficulty mixes consolidation/current/stretch around the learner target grade, recent fingerprints/patterns are strongly avoided, and the Home mission reason describes the mission as focusing on the learner's weakest subject skills.


## V0.23.8.0 — Teacher Class Overview
- Adds class-level mastery, 7-day activity, strongest/developing subject summary.
- Adds per-student strongest/developing subject and last activity.
- Adds transparent Needs Attention flags for no evidence, 14+ days inactivity, or <50% recent accuracy after at least 3 attempts.
- Keeps individual read-only Progress view.
- No Supabase schema change required.

## V0.23.8.0 — Class Lessons
- Student class cards are clickable and open a dedicated class page.
- Teachers can set/update the current lesson for each class.
- Student class page shows the current lesson and starts an 8-question lesson using the existing adaptive question engine.
- Run `supabase_v02380_class_lessons.sql` once in Supabase before testing.

## V0.23.8.1 — Stability Fix
- Profile and other app overlays now replace Home from the top of the viewport and return cleanly to Home.
- Mission categories are canonicalised so class lessons such as `All Maths` use the valid adaptive subject pool.
- Curriculum-focus fallback remains inside the learner's subject, tier and selected-course filters.
- Boss Battle question selection now respects the same tier and selected-course filters.
- No Supabase schema change is required.
