/* math-ridge-shell.js
   Shared Math Ridge shell behavior for Index + Note pages.
   Owns fixed topbar, mobile drawer, reading progress, hash return, and
   the mobile two-tap confirmation helper used by Index interactions. */

(function () {
  "use strict";

  const MOBILE_MENU_QUERY = "(max-width: 680px), (max-width: 980px) and (orientation: landscape) and (hover: none) and (pointer: coarse)";
  const MOBILE_CONFIRM_QUERY = "(max-width: 760px), (hover: none) and (pointer: coarse)";
  const MOBILE_CONFIRM_DURATION = 5600;
  const MOBILE_CONFIRM_NOTE = "Tap once to light a place. Tap again to travel.";
  const SHELL_SOUND_BASE = "voice/sound/";
  const INDEX_LOADED_KEY = "mathRidge_indexLoaded_v2";
  const POINTER_TAP_GUARD_MS = 1400;
  const CONFIRM_NAV_DELAY_MS = 780;
  const shellSfxPresets = {
    firstTap: { file: "first tap.mp3", volume: 0.55, start: 0.08, maxMs: 1120, fadeOut: 240 },
    secondTap: { file: "second tap.mp3", volume: 0.58, start: 0.08, maxMs: 1120, fadeOut: 240 }
  };
  const INDEX_PRELOAD_IMAGE_GROUPS = [
    {
      label: "Warming up sounds and trail paths...",
      images: [
        "assets/images/logo/math-ridge-logo.webp",
        "assets/images/logo/logold.svg",
        "assets/images/logo/MathRidge_AppIcon_true_alpha.png",
        "assets/images/logo/mathridge_eighth_notes_true_alpha_v2_256px.png"
      ]
    },
    {
      label: "Painting the ridge backgrounds...",
      images: [
        "assets/images/backgrounds/desktop/student-overlook-wide-desktop.webp",
        "assets/images/backgrounds/desktop/fantasy-trail-blue-desktop.webp",
        "assets/images/backgrounds/desktop/study-cabin-desktop.webp",
        "assets/images/backgrounds/desktop/study-room-template-desktop.webp",
        "assets/images/backgrounds/desktop/desk-closeup-desktop.webp",
        "assets/images/backgrounds/desktop/sunrise-cloud-trail-desktop.webp",
        "assets/images/backgrounds/mobile/student-overlook-portrait-tall-mobile.webp",
        "assets/images/backgrounds/mobile/fantasy-trail-blue-mobile.webp",
        "assets/images/backgrounds/mobile/study-cabin-mobile.webp",
        "assets/images/backgrounds/mobile/study-room-template-mobile.webp",
        "assets/images/backgrounds/mobile/desk-closeup-mobile.webp",
        "assets/images/backgrounds/mobile/mathridge-background.png"
      ]
    },
    {
      label: "Preparing cabin and vault banners...",
      images: [
        "assets/images/index-ui/maintain_trail_title_card_desktop_1079x125.webp",
        "assets/images/index-ui/maintain_trail_title_card_mobile_353x207.webp",
        "assets/images/index-ui/study_desk_title_card_desktop_1079x125.webp",
        "assets/images/index-ui/study_desk_title_card_mobile_353x207.webp",
        "assets/images/index-ui/The Cabin Banner 1080 x 270 mobile.png",
        "assets/images/index-ui/The Cabin Banner 353x207 mobile.png",
        "assets/images/index-ui/message_desk_title_card_desktop_1079x150.webp",
        "assets/images/index-ui/message_desk_title_card_mobile_353x207.webp",
        "assets/images/index-ui/Message 353x207 mobile vertical.png",
        "assets/images/index-ui/Message 780x320 mobile horizontal.png",
        "assets/images/index-ui/cabin_interactive_mobile_vertical.png",
        "assets/images/index-ui/cabin_interactive_mobile_horizontal.png"
      ]
    },
    {
      label: "Laying out the mountain maps...",
      images: [
        "assets/images/index-ui/Chapter 1 map.png",
        "assets/images/index-ui/Chapter 2 map.png",
        "assets/images/index-ui/Manual card bg.png",
        "assets/images/index-ui/Trail card bg.png"
      ]
    },
    {
      label: "Polishing relic and certificate vaults...",
      images: [
        "assets/images/index-ui/relic_vaults_mobile_vertical.png",
        "assets/images/index-ui/relict_vaults_mobile_horizontal.png",
        "assets/images/index-ui/relics mobile vertical loop.png",
        "assets/images/index-ui/relic_display_vault.png",
        "assets/images/index-ui/Certificate Wall mobile vertical.png",
        "assets/images/index-ui/Certificate Wall mobile horizontal.png",
        "assets/images/index-ui/Certificate wall vertical background loop.png",
        "assets/images/index-ui/certificate wall horizontal background loop.png",
        "assets/images/index-ui/certificate_display_vault_clean.png",
        "assets/images/index-ui/certificate_display_vault_prefilled.png",
        "assets/images/test-results/math_ridge_certificate_true_alpha.png",
        "assets/images/test-results/math_ridge_certificate_prefilled_template_true_alpha.png",
        "assets/images/test-results/math_ridge_certificate_mastery_template_true_alpha.png",
        "assets/images/test-results/chapter-1-test-result.svg",
        "assets/images/test-results/chapter-2-test-result.svg"
      ]
    },
    {
      label: "Setting relics on the shelves...",
      images: [
        "assets/images/relic/term_stone.png",
        "assets/images/relic/sign_compass_relic_alpha.png",
        "assets/images/relic/parity_prism_true_alpha.png",
        "assets/images/relic/factor_forge_alpha.png",
        "assets/images/relic/shelf_scale_inactive.png",
        "assets/images/relic/Shelf_Scale_Relic_True_Alpha.png",
        "assets/images/relic/primewood_seed_relic_preview.png",
        "assets/images/relic/primewood_seed_relic_true_alpha.png",
        "assets/images/relic/fraction_loom_relic_preview.png",
        "assets/images/relic/fraction_loom_relic_true_alpha.png",
        "assets/images/relic/power_tally_relic_preview.png",
        "assets/images/relic/power_tally_relic_true_alpha.png"
      ]
    },
    {
      label: "Preparing stage cards...",
      images: [
        "assets/images/stages/stage-1-1-trail-start.webp",
        "assets/images/stages/stage-1-2-mountain-peak.webp",
        "assets/images/stages/stage-1-3-mountain-trail.webp",
        "assets/images/stages/stage-1-4-mountain-cabin.webp",
        "assets/images/stages/stage-2-1-mountain-library.webp",
        "assets/images/stages/stage-2-2-ancient-tree.webp",
        "assets/images/stages/stage-2-3-math-workstation.webp",
        "assets/images/stages/stage-2-4-exponential-bloom.webp"
      ]
    }
  ];

  let mobileConfirmTarget = null;
  let mobileConfirmTimer = null;
  let drawerCloseTimer = null;
  const shellSfxCache = new Map();
  const decodedShellSfxCache = new Map();
  const shellSfxBuffers = new Map();
  const shellSfxLastPlayedAt = new Map();
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

  function warmNavigationTarget(url) {
    if (!url || url === "#") return;
    try { fetch(url, { cache: "force-cache" }).catch(() => {}); }
    catch (error) {}
  }

  function navigateAfterConfirm(url) {
    if (!url || url === "#") return;
    warmNavigationTarget(url);
    window.setTimeout(() => {
      window.location.href = url;
    }, CONFIRM_NAV_DELAY_MS);
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

  function playSingleShellSfx(name, options = {}) {
    const cue = shellSfxPresets[name];
    if (!cue?.file || typeof Audio !== "function") return null;
    const now = performance.now();
    if (!options.force && name === "firstTap" && now - (shellSfxLastPlayedAt.get(name) || 0) < 130) {
      return null;
    }
    shellSfxLastPlayedAt.set(name, now);
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

  function playShellSfx(name, options = {}) {
    if (name === "secondTap" && !options.single) {
      playSingleShellSfx("firstTap", { force: true });
      window.setTimeout(() => playSingleShellSfx("secondTap", { force: true }), 58);
      return null;
    }

    return playSingleShellSfx(name, options);
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

  function consumePointerFirstTapPlayed(target) {
    if (!target?.dataset || target.dataset.pointerFirstTapPlayed !== "true") return false;
    const playedAt = Number(target.dataset.pointerFirstTapAt || 0);
    const isFresh = !playedAt || Date.now() - playedAt <= POINTER_TAP_GUARD_MS;
    target.removeAttribute("data-pointer-first-tap-played");
    target.removeAttribute("data-pointer-first-tap-at");
    return isFresh;
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
    if (!consumePointerFirstTapPlayed(target)) {
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
      navigateAfterConfirm(indexSectionUrl(indexSectionMatch[1]));
      return true;
    }

    if (/goToPlay\(\)/.test(inlineAction) && typeof window.goToPlay === "function") {
      window.__mathRidgeSuppressNextGoToPlaySoundUntil = Date.now() + 1200;
      window.goToPlay();
      return true;
    }

    if (target.tagName === "A" && target.href) {
      navigateAfterConfirm(target.href);
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
    window.location.href = indexSectionUrl(section);
  }

  function indexSectionUrl(section) {
    const target = section === "trail" || section === "mountain-trail"
      ? "quest"
      : (section === "menu" ? "quick" : (section || "home"));

    const config = window.MathRidgeNote || {};
    const indexLink = (config.indexLink || "index.html").split("#")[0] || "index.html";
    return `${indexLink}#${encodeURIComponent(target)}`;
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

  function uniqueIndexPreloadImages() {
    const images = INDEX_PRELOAD_IMAGE_GROUPS.flatMap(group => group.images || []);
    return Array.from(new Set(images.filter(Boolean)));
  }

  function indexPreloadMessage(percent) {
    const groups = INDEX_PRELOAD_IMAGE_GROUPS;
    if (!groups.length) return "Preparing the Ridge...";
    const index = Math.min(groups.length - 1, Math.floor((Math.max(0, Math.min(99, percent)) / 100) * groups.length));
    return groups[index]?.label || "Preparing the Ridge...";
  }

  function preloadIndexImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      let settled = false;
      const done = ok => {
        if (settled) return;
        settled = true;
        resolve({ src, ok });
      };

      image.decoding = "async";
      image.onload = () => done(true);
      image.onerror = () => done(false);
      image.src = src;
    });
  }

  function runIndexPreloadWork(onProgress) {
    const soundTasks = ["firstTap", "secondTap"].map(name => {
      prepareShellSfx(name);
      const bufferTask = prepareShellSfxBuffer(name);
      return bufferTask || Promise.resolve(name);
    });
    const imageTasks = uniqueIndexPreloadImages().map(preloadIndexImage);
    const tasks = [...soundTasks, ...imageTasks];
    const total = Math.max(1, tasks.length);
    let completed = 0;

    onProgress?.(0, total);

    const trackedTasks = tasks.map(task => Promise.resolve(task)
      .catch(error => error)
      .then(result => {
        completed += 1;
        onProgress?.(completed, total, result);
        return result;
      }));

    return Promise.allSettled(trackedTasks);
  }

  function setIndexLoadProgress(percent, text) {
    const bar = document.getElementById("indexLoadingBar");
    const label = document.getElementById("indexLoadingText");
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    if (label && text) label.textContent = text;
  }

  function hasIndexLoadedThisSession() {
    try { return sessionStorage.getItem(INDEX_LOADED_KEY) === "true"; }
    catch (error) { return false; }
  }

  function rememberIndexLoadedThisSession() {
    try { sessionStorage.setItem(INDEX_LOADED_KEY, "true"); }
    catch (error) {}
  }

  function prepareIndexLoadingGate() {
    const gate = document.getElementById("indexLoadingGate");
    const beginButton = document.getElementById("indexBeginButton");
    if (!gate || !beginButton) return;
    const skipGate = hasIndexLoadedThisSession();
    if (skipGate) {
      gate.classList.add("is-hidden");
      gate.setAttribute("hidden", "");
      document.body.classList.remove("is-index-loading");
      document.body.classList.add("index-preload-seen");
    }

    let preloadSettled = false;
    let gateReady = false;
    const preloadWork = runIndexPreloadWork((completed, total) => {
      if (skipGate || gateReady) return;
      const percent = Math.min(96, Math.round(10 + (completed / total) * 84));
      setIndexLoadProgress(percent, indexPreloadMessage(percent));
    }).then(result => {
      preloadSettled = true;
      return result;
    });
    const minimumDisplay = new Promise(resolve => window.setTimeout(resolve, 620));
    const safetyTimeout = new Promise(resolve => window.setTimeout(() => resolve("timeout"), 10000));

    if (!skipGate) setIndexLoadProgress(10, "Warming up sounds and trail paths...");

    Promise.race([
      Promise.all([preloadWork, minimumDisplay]).then(() => "ready"),
      safetyTimeout
    ]).then(status => {
      if (skipGate) return;
      gateReady = true;
      gate.classList.add("is-ready");
      beginButton.disabled = false;
      beginButton.textContent = "Begin";
      setIndexLoadProgress(100, status === "timeout" && !preloadSettled
        ? "Ready to climb. Final art keeps warming."
        : "Ready to climb.");
    });

    const begin = () => {
      if (beginButton.disabled) return;
      unlockShellAudioContext();
      prepareShellSfx("firstTap");
      prepareShellSfx("secondTap");
      playShellSfx("secondTap");
      rememberIndexLoadedThisSession();
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
      if (!consumePointerFirstTapPlayed(target)) {
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

  function handleTopActionConfirmClick(event) {
    if (!isMobileConfirmMode() || isDrawerOpen()) return;
    if (document.body.classList.contains("index-page")) return;

    const menu = getMenu();
    const target = event.target?.closest?.("#noteTopActions button, #noteTopActions a");
    if (!menu || !target || !menu.contains(target)) return;
    if (target.classList.contains("mobile-confirm-note")) return;
    if (isConfirmDisabled(target)) return;

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
      target.setAttribute("data-pointer-first-tap-at", String(Date.now()));
      window.setTimeout(() => {
        if (Date.now() - Number(target.dataset.pointerFirstTapAt || 0) >= POINTER_TAP_GUARD_MS) {
          target.removeAttribute("data-pointer-first-tap-played");
          target.removeAttribute("data-pointer-first-tap-at");
        }
      }, POINTER_TAP_GUARD_MS + 80);
    }
    target.classList.add("is-pressed");
    window.setTimeout(() => target.classList.remove("is-pressed"), 260);
  }

  function handleTopActionPointerDown(event) {
    unlockShellAudioContext();
    if (!isMobileConfirmMode() || isDrawerOpen()) return;
    if (document.body.classList.contains("index-page")) return;
    if (event.pointerType === "mouse") return;

    const menu = getMenu();
    const target = event.target?.closest?.("#noteTopActions button, #noteTopActions a");
    if (!menu || !target || !menu.contains(target) || isConfirmDisabled(target)) return;

    if (target.dataset.mobileConfirmReady === "true" && activateConfirmedDrawerTarget(target)) {
      return;
    }

    playShellSfx("firstTap");
    target.setAttribute("data-pointer-first-tap-played", "true");
    target.setAttribute("data-pointer-first-tap-at", String(Date.now()));
    window.setTimeout(() => {
      if (Date.now() - Number(target.dataset.pointerFirstTapAt || 0) >= POINTER_TAP_GUARD_MS) {
        target.removeAttribute("data-pointer-first-tap-played");
        target.removeAttribute("data-pointer-first-tap-at");
      }
    }, POINTER_TAP_GUARD_MS + 80);
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
    document.addEventListener("click", handleTopActionConfirmClick, true);
    document.addEventListener("pointerdown", handleDrawerPointerDown, { passive: true });
    document.addEventListener("pointerdown", handleTopActionPointerDown, { passive: true });

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
