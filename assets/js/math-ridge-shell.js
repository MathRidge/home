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
  const SHELL_SOUND_BASE = "voice/sound/";
  const shellSfxPresets = {
    firstTap: { file: "first tap.mp3", volume: 0.55, start: 0.08, maxMs: 1120, fadeOut: 240 },
    secondTap: { file: "second tap.mp3", volume: 0.58, start: 0.08, maxMs: 1120, fadeOut: 240 }
  };
  const INDEX_PRELOAD_IMAGES = [
    "assets/images/logo/math-ridge-logo.webp",
    "assets/images/backgrounds/desktop/student-overlook-wide-desktop.webp",
    "assets/images/backgrounds/desktop/fantasy-trail-blue-desktop.webp",
    "assets/images/backgrounds/desktop/study-cabin-desktop.webp",
    "assets/images/backgrounds/desktop/study-room-template-desktop.webp",
    "assets/images/backgrounds/desktop/desk-closeup-desktop.webp"
  ];

  let mobileConfirmTarget = null;
  let mobileConfirmTimer = null;
  let drawerCloseTimer = null;
  const shellSfxCache = new Map();
  const decodedShellSfxCache = new Map();
  const shellSfxBuffers = new Map();
  let shellAudioContext = null;

  function matchesQuery(query) {
    return Boolean(window.matchMedia && window.matchMedia(query).matches);
  }

  function isMobileDrawer() {
    return matchesQuery(MOBILE_MENU_QUERY);
  }

  function isMobileConfirmMode() {
    return matchesQuery(MOBILE_CONFIRM_QUERY);
  }

  function shellSoundUrl(file) {
    return `${SHELL_SOUND_BASE}${encodeURIComponent(file)}`;
  }

  function getShellAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!shellAudioContext) shellAudioContext = new AudioContextClass();
    return shellAudioContext;
  }

  function unlockShellAudioContext() {
    const context = getShellAudioContext();
    if (!context) return;
    if (context.state === "suspended") context.resume().catch(() => {});
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0;
    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    source.connect(gain).connect(context.destination);
    try { source.start(0); } catch (error) {}
  }

  function prepareShellSfxBuffer(name) {
    const cue = shellSfxPresets[name];
    const context = getShellAudioContext();
    if (!cue?.file || !context) return null;
    if (shellSfxBuffers.has(name)) return Promise.resolve(shellSfxBuffers.get(name));
    if (decodedShellSfxCache.has(name)) return decodedShellSfxCache.get(name);
    const promise = fetch(shellSoundUrl(cue.file))
      .then(response => response.arrayBuffer())
      .then(buffer => context.decodeAudioData(buffer))
      .then(buffer => {
        shellSfxBuffers.set(name, buffer);
        return buffer;
      });
    decodedShellSfxCache.set(name, promise);
    return promise;
  }

  function playShellBufferNow(name, buffer) {
    const cue = shellSfxPresets[name];
    const context = getShellAudioContext();
    if (!cue?.file || !context || !buffer) return false;
    if (context.state === "suspended") context.resume().catch(() => {});
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = Math.max(0, Math.min(1, Number(cue.volume || 0.4)));
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    try {
      source.start(0, Math.min(Math.max(0, Number(cue.start || 0)), Math.max(0, buffer.duration - 0.01)));
    } catch (error) {
      return false;
    }
    return true;
  }

  function playShellSfxBuffer(name) {
    const cue = shellSfxPresets[name];
    const context = getShellAudioContext();
    if (!cue?.file || !context) return false;
    if (context.state === "suspended") context.resume().catch(() => {});
    if (shellSfxBuffers.has(name)) return playShellBufferNow(name, shellSfxBuffers.get(name));
    const bufferPromise = prepareShellSfxBuffer(name);
    if (!bufferPromise) return false;
    bufferPromise.then(buffer => playShellBufferNow(name, buffer)).catch(() => {});
    return true;
  }

  function stopShellSfxAudio(audio) {
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }

  function prepareShellSfx(name) {
    const cue = shellSfxPresets[name];
    if (!cue?.file || typeof Audio !== "function") return null;
    if (shellSfxCache.has(name)) return shellSfxCache.get(name);

    const audio = new Audio(shellSoundUrl(cue.file));
    audio.preload = "auto";
    audio.volume = Math.max(0, Math.min(1, Number(cue.volume || 0.4)));
    try { audio.load(); } catch (error) {}
    shellSfxCache.set(name, audio);
    prepareShellSfxBuffer(name)?.catch(() => {});
    return audio;
  }

  function createShellSfxAudio(name, cue) {
    const prepared = prepareShellSfx(name);
    const audio = prepared && typeof prepared.cloneNode === "function"
      ? prepared.cloneNode(true)
      : new Audio(shellSoundUrl(cue.file));

    audio.preload = "auto";
    audio.volume = Math.max(0, Math.min(1, Number(cue.volume || 0.4)));
    try { audio.currentTime = Math.max(0, Number(cue.start || 0)); } catch (error) {}
    return audio;
  }

  function playShellSfx(name) {
    const cue = shellSfxPresets[name];
    if (!cue?.file || typeof Audio !== "function") return null;
    unlockShellAudioContext();
    if (playShellSfxBuffer(name)) return null;

    const audio = createShellSfxAudio(name, cue);
    const durationMs = Math.max(0, Number(cue.maxMs || 0));
    const fadeMs = Math.max(0, Number(cue.fadeOut || 0));
    const volume = Math.max(0, Math.min(1, Number(cue.volume || 0.4)));
    let fadeTimer = null;
    let stopTimer = null;

    audio.preload = "auto";
    audio.volume = volume;
    try { audio.currentTime = Math.max(0, Number(cue.start || 0)); } catch (error) {}
    audio.addEventListener("ended", () => stopShellSfxAudio(audio), { once: true });
    audio.addEventListener("error", () => stopShellSfxAudio(audio), { once: true });

    if (durationMs) {
      if (fadeMs && durationMs > fadeMs + 80) {
        window.setTimeout(() => {
          const started = performance.now();
          fadeTimer = window.setInterval(() => {
            const progress = Math.min(1, (performance.now() - started) / fadeMs);
            audio.volume = Math.max(0, volume * (1 - progress));
            if (progress >= 1) {
              window.clearInterval(fadeTimer);
              fadeTimer = null;
            }
          }, 40);
        }, Math.max(0, durationMs - fadeMs));
      }
      stopTimer = window.setTimeout(() => {
        if (fadeTimer) window.clearInterval(fadeTimer);
        stopShellSfxAudio(audio);
      }, durationMs);
    }

    const attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        if (fadeTimer) window.clearInterval(fadeTimer);
        if (stopTimer) window.clearTimeout(stopTimer);
        stopShellSfxAudio(audio);
      });
    }
    return audio;
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
      playShellSfx("secondTap");
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
    if (target.dataset.pointerFirstTapPlayed === "true") {
      target.removeAttribute("data-pointer-first-tap-played");
    } else {
      playShellSfx("firstTap");
    }
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

    playShellSfx("secondTap");
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

  function preloadIndexImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      const done = () => resolve(src);
      image.onload = done;
      image.onerror = done;
      image.src = src;
    });
  }

  function setIndexLoadProgress(percent, text) {
    const bar = document.getElementById("indexLoadingBar");
    const label = document.getElementById("indexLoadingText");
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    if (label && text) label.textContent = text;
  }

  function prepareIndexLoadingGate() {
    const gate = document.getElementById("indexLoadingGate");
    const beginButton = document.getElementById("indexBeginButton");
    if (!gate || !beginButton) return;

    const loadSounds = ["firstTap", "secondTap"].map(name => {
      prepareShellSfx(name);
      return prepareShellSfxBuffer(name);
    }).filter(Boolean);
    const loadImages = INDEX_PRELOAD_IMAGES.map(preloadIndexImage);
    const preloadWork = Promise.allSettled([...loadSounds, ...loadImages]);
    const minimumDisplay = new Promise(resolve => window.setTimeout(resolve, 620));
    const safetyTimeout = new Promise(resolve => window.setTimeout(resolve, 3600));

    setIndexLoadProgress(38, "Warming up sounds and trail paths...");

    Promise.race([
      Promise.all([preloadWork, minimumDisplay]),
      safetyTimeout
    ]).then(() => {
      gate.classList.add("is-ready");
      beginButton.disabled = false;
      beginButton.textContent = "Begin";
      setIndexLoadProgress(100, "Ready to climb.");
    });

    const begin = () => {
      if (beginButton.disabled) return;
      unlockShellAudioContext();
      prepareShellSfx("firstTap");
      prepareShellSfx("secondTap");
      playShellSfx("secondTap");
      gate.classList.add("is-hidden");
      document.body.classList.remove("is-index-loading");
      window.setTimeout(() => gate.setAttribute("hidden", ""), 420);
    };

    beginButton.addEventListener("pointerdown", unlockShellAudioContext, { passive: true });
    beginButton.addEventListener("click", begin);
    beginButton.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") begin();
    });
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
      if (target.dataset.pointerFirstTapPlayed === "true") {
        target.removeAttribute("data-pointer-first-tap-played");
      } else {
        playShellSfx("firstTap");
      }
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
    unlockShellAudioContext();
    if (!isDrawerOpen()) return;
    const menu = getMenu();
    const target = event.target?.closest?.("button, a");
    if (!menu || !target || !menu.contains(target) || isConfirmDisabled(target)) return;

    if (target.dataset.mobileConfirmReady === "true" && activateConfirmedDrawerTarget(target)) {
      return;
    }

    if (event.pointerType === "mouse") return;
    if (target.dataset.mobileConfirmReady !== "true") {
      playShellSfx("firstTap");
      target.setAttribute("data-pointer-first-tap-played", "true");
      window.setTimeout(() => target.removeAttribute("data-pointer-first-tap-played"), 360);
    }
    target.classList.add("is-pressed");
    window.setTimeout(() => target.classList.remove("is-pressed"), 260);
  }

  function bindShellEvents() {
    prepareShellSfx("firstTap");
    prepareShellSfx("secondTap");
    injectMobileConfirmNote();
    prepareIndexLoadingGate();

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
    clear: clearMobileConfirm,
    play: playShellSfx
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindShellEvents);
  } else {
    bindShellEvents();
  }
})();
