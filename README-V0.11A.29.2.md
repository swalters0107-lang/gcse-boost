# GCSE Boost V0.11A.29.2 — Home Button Repair

This is the safe follow-up to V0.11A.29.

Root cause found in the live V0.11A.28/29 code:
`lockCurrentAnswer()` disabled every button inside the lesson except NEXT.
The HOME button has class `ghost`, not `back`, so it was disabled after an answer
and remained disabled when Recovery started.

Fix:
- Excludes `lessonBack` from answer locking.
- Re-enables HOME once after each question render.
- No MutationObserver.
- No DOM cloning.
- Keeps V0.11A.29 category cleanup and MCQ answer randomisation.

Upload all files in this ZIP to the repository root.
