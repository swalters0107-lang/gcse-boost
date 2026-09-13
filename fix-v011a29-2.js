/* GCSE Boost V0.11A.29.2 — Home Button Repair
   Root cause: lockCurrentAnswer() disabled every #lesson button except NEXT.
   lessonBack uses class "ghost", so it was being disabled after an answer.
*/
(() => {
  "use strict";

  // Replace only the answer-lock routine. HOME must never be locked.
  lockCurrentAnswer = function () {
    document
      .querySelectorAll("#lesson input,#lesson textarea,#lesson select,.answer")
      .forEach(el => {
        el.disabled = true;
        el.classList.add("answer-locked");
        el.setAttribute("aria-disabled", "true");
      });

    document.querySelectorAll("#lesson button").forEach(el => {
      if (el.id !== "nextBtn" && el.id !== "lessonBack" && !el.classList.contains("back")) {
        el.disabled = true;
        el.classList.add("check-locked");
      }
    });

    const homeBtn = document.getElementById("lessonBack");
    if (homeBtn) {
      homeBtn.disabled = false;
      homeBtn.classList.remove("check-locked", "answer-locked");
      homeBtn.removeAttribute("aria-disabled");
    }
  };

  // A button may already be disabled when moving into Recovery.
  // Re-enable it once whenever a question is rendered.
  const baseRenderV011A29 = render;
  render = function () {
    const result = baseRenderV011A29.apply(this, arguments);
    const homeBtn = document.getElementById("lessonBack");
    if (homeBtn) {
      homeBtn.disabled = false;
      homeBtn.classList.remove("check-locked", "answer-locked");
      homeBtn.removeAttribute("aria-disabled");
    }
    return result;
  };

  console.info("GCSE Boost V0.11A.29.2 Home Button Repair loaded");
})();