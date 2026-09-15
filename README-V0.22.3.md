# LevelUp10 V0.22.3 — Evidence-weighted Mastery Display

This patch separates **accuracy** from **mastery progress**.

- A learner can no longer appear to have 100% mastery after only a few correct answers.
- Skill mastery display now weights accuracy by the amount of evidence collected.
- 100% mastery progress requires at least 8 recent answers for a skill.
- Curriculum-area progress requires a broader 20-answer evidence base.
- Existing adaptive question selection and raw answer history are retained.
- New / Developing / Secure / Mastered thresholds are unchanged.

Example: 2/2 correct = 100% raw accuracy, but only 25% mastery progress until more evidence is collected.
