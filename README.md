# GCSE Boost V0.11A.15 — Profile Runtime Fix

Actual root cause:
V0.11A.11 introduced `escapeHtml()` calls for Categories and Estimated Grades, but the
application did not define that helper. Opening Profile called `gradeCardsHTML()`,
which called the missing function and threw a JavaScript ReferenceError. The button
was clickable, but the profile renderer crashed immediately, making it appear dead.

Fix:
- adds the missing `escapeHtml()` helper
- retains the direct Profile click binding from V0.11A.14
- keeps Estimated Current Grades, category selection, Coverage Balance, Smart Variety,
  division coverage, profiles, MCQ mix and answer locking
