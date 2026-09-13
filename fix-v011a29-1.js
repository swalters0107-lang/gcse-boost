/* GCSE Boost V0.11A.29.1 — Always Available Home */
(() => {
  "use strict";

  function enableHomeButton() {
    const btn = document.getElementById("lessonBack");
    if (!btn) return;

    btn.disabled = false;
    btn.removeAttribute("disabled");
    btn.classList.remove("disabled");
    btn.style.pointerEvents = "auto";
    btn.style.opacity = "1";

    // Replace any earlier handler that blocks HOME during recovery/boss/readiness.
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);

    fresh.disabled = false;
    fresh.removeAttribute("disabled");
    fresh.style.pointerEvents = "auto";
    fresh.style.opacity = "1";

    fresh.addEventListener("click", (e) => {
      e.preventDefault();

      // Abandon current unfinished session. No completion XP/coins are awarded.
      try {
        session = null;
      } catch (_) {}

      try {
        closeOverlays();
      } catch (_) {}

      try {
        show("home");
      } catch (_) {
        document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
        const home = document.getElementById("home");
        if (home) home.classList.remove("hidden");
      }

      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  // Keep HOME enabled even when render/recovery logic attempts to disable it.
  const observer = new MutationObserver(enableHomeButton);
  const lesson = document.getElementById("lesson");
  if (lesson) observer.observe(lesson, {
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "class", "style"]
  });

  enableHomeButton();
  console.info("GCSE Boost V0.11A.29.1 Always Available Home loaded");
})();