# GCSE Boost V0.11B.5.2 — Dragon Cloud Trigger Fix

Fixes the forced Dragon QA trigger so it survives the asynchronous cloud learner identity hand-off. `?dragon=1` is captured into sessionStorage and retried after Home renders; it is consumed only when the Dragon battle starts. Normal 4% post-mission encounter behaviour is unchanged.
