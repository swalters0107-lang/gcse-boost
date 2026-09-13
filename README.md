# GCSE Boost V0.11A.14 — Static Profile Button Repair

Root cause fixed:
The Home page already contains a static `profileLaunch` button. The previous launcher
function saw that the button existed and returned before attaching its click handler.

V0.11A.14:
- explicitly binds the existing Profile button to `showProfile`
- also binds it during DOMContentLoaded as a robust fallback
- static HTML now calls `showProfile()` directly
- retains Estimated Current Grades, categories, Coverage Balance, Smart Variety,
  profiles, MCQ mix, answer lock and all V0.11A.13 learning logic
