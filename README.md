# GCSE Boost V0.11A.3 — Question Mix Fix

Normal 8-question missions now explicitly build the intended mix:
- up to 5 multiple-choice questions
- up to 2 short/calculation questions
- up to 1 written/application question
- fallback fills only where a subject pool genuinely lacks a type
- final order is shuffled

The previous bug happened because the anti-repetition pass was applied to the combined
8-question candidate list and could discard the MCQ candidates while filling the mission.

Also improves algebra wording at display time:
`Solve 8x + 4 = 132.` becomes `Solve 8x + 4 = 132. What is x?`

Account Foundation, full 8-question missions and GitHub Pages fixes are retained.
