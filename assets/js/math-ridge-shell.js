/* math-ridge-shell.js
   Shared Math Ridge shell behavior for Index + Note pages.
   Owns fixed topbar, mobile drawer, reading progress, hash return, and
   the mobile two-tap confirmation helper used by Index interactions. */

(function () {
  "use strict";

  const MOBILE_MENU_QUERY = "(max-width: 680px)";
  const MOBILE_CONFIRM_QUERY = "(max-width: 760px)";
  const MOBILE_CONFIRM_DURATION = 5600;
  const MOBILE_CONFIRM_NOTE = "Ridge controls use two taps: first to arm, second to enter.";

  let mobileConfirmTarget = null;
  let mobileConfirmTimer = null;
  let drawerCloseTimer = null;

  function matchesQuery(query) {
    return Boolean(window.matchMedia && window.matchMedia(query).matches);
  }

  function isMobileDrawer() {
    return matchesQuery(MOBILE_MENU_QUERY);
  }

  function isMobileConfirmMode() {
    return matchesQuery(MOBILE_CONFIRM_QUERY);
  }

  function getMenu() {
    return document.getElementById("noteTopActions");
  }

  function getMenuButton() {
    return document.querySelector(".hamburger-btn");
  }

  function clearMobileConfirm(exceptTarget) {
    if (mobileConfirmTarget && mobileConfirmTarget !== exceptTarget) {
      mobileConfirmTarget.classList.remove("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
      mobileConfirmTarget.removeAttribute("data-touch-preview-active");
      mobileConfirmTarget.removeAttribute("data-mobile-confirm-ready");
    }

    if (!exceptTarget) mobileConfirmTarget = null;

    if (mobileConfirmTimer) {
      window.clearTimeout(mobileConfirmTimer);
      mobileConfirmTimer = null;
    }
  }

  function markMobileConfirm(target, options = {}) {
    if (!target) return;
    const { duration = MOBILE_CONFIRM_DURATION, keepOthers = false } = options;

    if (!keepOthers) clearMobileConfirm(target);

    mobileConfirmTarget = target;
    target.classList.add("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
    target.setAttribute("data-touch-preview-active", "true");
    target.setAttribute("data-mobile-confirm-ready", "true");

    if (options.label) target.setAttribute("aria-label", options.label);

    if (mobileConfirmTimer) window.clearTimeout(mobileConfirmTimer);
    mobileConfirmTimer = window.setTimeout(() => clearMobileConfirm(), duration);
  }

  function isConfirmDisabled(target) {
    return !target ||
      target.disabled ||
      target.hasAttribute("disabled") ||
      target.getAttribute("aria-disabled") === "true";
  }

  function requireMobileConfirm(event, target, options = {}) {
    if (!isMobileConfirmMode() || !target || isConfirmDisabled(target)) return false;

    if (target.dataset.mobileConfirmReady === "true") {
      clearMobileConfirm(target);
      target.classList.remove("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
      target.removeAttribute("data-touch-preview-active");
      target.removeAttribute("data-mobile-confirm-ready");
      mobileConfirmTarget = null;
      return false;
    }

    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    markMobileConfirm(target, options);
    return true;
  }

  function disarmConfirmedTarget(target) {
    clearMobileConfirm(target);
    if (target) {
      target.classList.remove("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
      target.removeAttribute("data-touch-preview-active");
      target.removeAttribute("data-mobile-confirm-ready");
    }
    mobileConfirmTarget = null;
  }

  function activateConfirmedDrawerTarget(target) {
    if (!target) return false;

    const inlineAction = target.getAttribute("onclick") || "";
    const showSectionMatch = inlineAction.match(/showSection\('([^']+)'\)/);
    const indexSectionMatch = inlineAction.match(/goToIndexSection\('([^']+)'\)/);

    disarmConfirmedTarget(target);

    if (showSectionMatch && typeof window.showSection === "function") {
      window.showSection(showSectionMatch[1]);
      return true;
    }

    if (indexSectionMatch && typeof window.goToIndexSection === "function") {
      window.goToIndexSection(indexSectionMatch[1]);
      return true;
    }

    if (/goToPlay\(\)/.test(inlineAction) && typeof window.goToPlay === "function") {
      window.goToPlay();
      return true;
    }

    if (target.tagName === "A" && target.href) {
      window.location.href = target.href;
      return true;
    }

    return false;
  }

  function injectMobileConfirmNote() {
    const menu = getMenu();
    if (!menu || menu.querySelector(".mobile-confirm-note")) return;

    const note = document.createElement("div");
    note.className = "mobile-confirm-note";
    note.textContent = MOBILE_CONFIRM_NOTE;
    menu.appendChild(note);
  }

  function toggleNoteMenu(force) {
    const menu = getMenu();
    const button = getMenuButton();
    if (!menu) return;

    injectMobileConfirmNote();

    const shouldOpen = isMobileDrawer() &&
      (typeof force === "boolean" ? force : !menu.classList.contains("open"));

    if (drawerCloseTimer) {
      window.clearTimeout(drawerCloseTimer);
      drawerCloseTimer = null;
    }

    if (shouldOpen) {
      menu.classList.remove("closing");
      menu.classList.add("open");
      document.body.classList.add("note-menu-open");
    } else {
      if (menu.classList.contains("open")) {
        menu.classList.add("closing");
        drawerCloseTimer = window.setTimeout(() => {
          menu.classList.remove("open", "closing");
          drawerCloseTimer = null;
        }, 340);
      } else {
        menu.classList.remove("closing");
      }

      document.body.classList.remove("note-menu-open");
    }

    if (!shouldOpen) clearMobileConfirm();

    if (button) {
      button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }
  }

  function goToIndexSection(section) {
    toggleNoteMenu(false);

    const target = section === "trail" || section === "mountain-trail"
      ? "quest"
      : (section === "menu" ? "quick" : (section || "home"));

    const config = window.MathRidgeNote || {};
    const indexLink = (config.indexLink || "index.html").split("#")[0] || "index.html";
    window.location.href = `${indexLink}#${encodeURIComponent(target)}`;
  }

  function closeNoteMenuOnEscape(event) {
    if (event.key === "Escape") {
      toggleNoteMenu(false);
      clearMobileConfirm();
    }
  }

  function updateReadingProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0
      ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100))
      : 0;

    document.documentElement.style.setProperty("--note-scroll-progress", `${percent}%`);
  }

  function isDrawerOpen() {
    return isMobileDrawer() && document.body.classList.contains("note-menu-open");
  }

  function handleDrawerConfirmClick(event) {
    if (!isDrawerOpen()) return;

    const menu = getMenu();
    const target = event.target?.closest?.("button, a");
    if (!menu || !target || !menu.contains(target)) return;
    if (target.classList.contains("mobile-confirm-note")) return;
    if (isConfirmDisabled(target)) return;

    // On the Index drawer only, the currently visible section is a pressed marker,
    // not a navigation target. On Note pages, Trail still returns to the Trail.
    if (document.body.classList.contains("index-page") && target.classList.contains("active-section")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      markMobileConfirm(target, { duration: 1200 });
      return;
    }

    if (target.dataset.mobileConfirmReady === "true" && activateConfirmedDrawerTarget(target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    requireMobileConfirm(event, target, { duration: MOBILE_CONFIRM_DURATION });
  }

  function handleDrawerPointerDown(event) {
    if (!isDrawerOpen()) return;
    const menu = getMenu();
    const target = event.target?.closest?.("button, a");
    if (!menu || !target || !menu.contains(target) || isConfirmDisabled(target)) return;

    if (target.dataset.mobileConfirmReady === "true" && activateConfirmedDrawerTarget(target)) {
      return;
    }

    if (event.pointerType === "mouse") return;
    target.classList.add("is-pressed");
    window.setTimeout(() => target.classList.remove("is-pressed"), 260);
  }

  function bindShellEvents() {
    injectMobileConfirmNote();

    document.addEventListener("keydown", closeNoteMenuOnEscape);
    document.addEventListener("click", handleDrawerConfirmClick, true);
    document.addEventListener("pointerdown", handleDrawerPointerDown, { passive: true });

    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", () => {
      updateReadingProgress();
      clearMobileConfirm();
      if (!isMobileDrawer()) toggleNoteMenu(false);
    });

    window.addEventListener("orientationchange", clearMobileConfirm);

    updateReadingProgress();
  }

  window.toggleNoteMenu = toggleNoteMenu;
  window.goToIndexSection = goToIndexSection;
  window.updateReadingProgress = updateReadingProgress;
  window.MathRidgeMobileConfirm = {
    isMode: isMobileConfirmMode,
    require: requireMobileConfirm,
    mark: markMobileConfirm,
    clear: clearMobileConfirm
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindShellEvents);
  } else {
    bindShellEvents();
  }
})();
