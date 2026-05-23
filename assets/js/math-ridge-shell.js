/* math-ridge-shell.js
   Shared Math Ridge shell behavior for all note pages.
   Depends on the common HTML ids/classes:
   #noteTopActions, .hamburger-btn, .drawer-backdrop, .reading-progress
*/

(function () {
  "use strict";

  const MOBILE_MENU_QUERY = "(max-width: 680px)";

  function isMobileDrawer() {
    return window.matchMedia(MOBILE_MENU_QUERY).matches;
  }

  function getMenu() {
    return document.getElementById("noteTopActions");
  }

  function getMenuButton() {
    return document.querySelector(".hamburger-btn");
  }

  function toggleNoteMenu(force) {
    const menu = getMenu();
    const button = getMenuButton();
    if (!menu) return;

    const shouldOpen = isMobileDrawer() &&
      (typeof force === "boolean" ? force : !menu.classList.contains("open"));

    menu.classList.toggle("open", shouldOpen);
    document.body.classList.toggle("note-menu-open", shouldOpen);

    if (button) {
      button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }
  }

  function goToIndexSection(section) {
    toggleNoteMenu(false);

    try {
      sessionStorage.setItem("mathRidge_open_section", section);
    } catch (error) {
      /* Storage can fail in private modes. Navigation should still work. */
    }

    const config = window.MathRidgeNote || {};
    window.location.href = config.indexLink || "index.html";
  }

  function closeNoteMenuOnEscape(event) {
    if (event.key === "Escape") toggleNoteMenu(false);
  }

  function updateReadingProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0
      ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100))
      : 0;

    document.documentElement.style.setProperty("--note-scroll-progress", `${percent}%`);
  }

  function bindShellEvents() {
    document.addEventListener("keydown", closeNoteMenuOnEscape);

    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);

    window.addEventListener("resize", () => {
      if (!isMobileDrawer()) toggleNoteMenu(false);
    });

    updateReadingProgress();
  }

  window.toggleNoteMenu = toggleNoteMenu;
  window.goToIndexSection = goToIndexSection;
  window.updateReadingProgress = updateReadingProgress;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindShellEvents);
  } else {
    bindShellEvents();
  }
})();
