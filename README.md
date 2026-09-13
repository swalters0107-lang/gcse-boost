# GCSE Boost V0.11A.2 — Full Mission Fix

Fixes missions ending after one question.

Cause:
The anti-repetition fingerprint deliberately treats number/template variants as the
same question pattern. During mission construction that could collapse an 8-question
mission to only one question.

Fix:
- First preference still avoids recently served question patterns.
- If there are not enough different patterns, the mission fills with different actual
  questions rather than ending early.
- Exact duplicate prompts are still blocked inside the same mission.
- Normal missions return to the intended 8 questions.
- Boss Battles and Recovery use the same safe selector.
- V0.11A account foundation and GitHub Pages fixes are retained.
