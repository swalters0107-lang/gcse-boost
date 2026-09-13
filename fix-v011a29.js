/* GCSE Boost V0.11A.29 — Mission & Answer Engine Repair
   Loaded after V0.11A.28 app.js so the existing app/data stays intact.
*/
(() => {
  "use strict";

  // Preserve V0.11A.28 implementations.
  const baseNormalise = normalise;

  // Fisher-Yates shuffle that carries the correct-answer flag with the option.
  function shuffleMCQ(q) {
    if (!q || q.kind !== "mcq" || !Array.isArray(q.choices) || q.choices.length < 2) return q;

    const pairs = q.choices.map((value, index) => ({
      value,
      correct: index === q.correctIndex
    }));

    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    q.choices = pairs.map(x => x.value);
    q.correctIndex = pairs.findIndex(x => x.correct);
    q.expected = q.choices[q.correctIndex];
    return q;
  }

  // Apply unbiased answer placement to every MCQ in every subject.
  normalise = function(q) {
    return shuffleMCQ(baseNormalise(q));
  };

  // Starting a mission must remove the category/course overlay first.
  start = function(subject = todaySubject(), category = "All") {
    try {
      closeOverlays();
      const qs = choose(subject, 8, category);
      if (!qs.length) throw Error("No questions");
      state.lives = 3;
      save();
      session = {
        subject,
        category,
        qs,
        index: 0,
        correct: 0,
        answered: false,
        isReadiness: false,
        isBoss: false,
        recoveries: 0,
        sessionMistakes: []
      };
      show("lesson");
      render();
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      fail("M01", e);
    }
  };

  console.info("GCSE Boost V0.11A.29 mission/answer repair loaded");
})();