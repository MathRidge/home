(function () {
  "use strict";

  const progressBar = document.getElementById("readerProgressBar");
  const READ_KEY = "mathRidge_mangaPrologueSeen_v1";

  function updateProgress() {
    if (!progressBar) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
    progressBar.style.transform = `scaleX(${progress})`;

    if (progress > 0.98) {
      try { localStorage.setItem(READ_KEY, "true"); } catch (error) {}
    }
  }

  function markImagesLoaded() {
    document.querySelectorAll(".manga-page").forEach(image => {
      if (image.complete) image.classList.add("is-loaded");
      image.addEventListener("load", () => {
        image.classList.add("is-loaded");
        updateProgress();
      }, { once: true });
    });
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  window.addEventListener("orientationchange", updateProgress);
  document.addEventListener("DOMContentLoaded", () => {
    markImagesLoaded();
    updateProgress();
  });
  window.addEventListener("load", updateProgress);
})();
