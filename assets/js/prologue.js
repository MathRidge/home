(function () {
  "use strict";

  const progressBar = document.getElementById("readerProgressBar");
  const loadingGate = document.getElementById("prologueLoadingGate");
  const loadingBar = document.getElementById("prologueLoadingBar");
  const loadingText = document.getElementById("prologueLoadingText");
  const orientationNote = document.getElementById("prologueOrientationNote");
  const beginButton = document.getElementById("prologueBeginButton");
  const READ_KEY = "mathRidge_mangaPrologueSeen_v1";
  const PROLOGUE_LOADED_KEY = "mathRidge_prologueLoaded_v1";
  const VOICE_BASE = "voice/Mira/";
  const VOICE_TRIGGER_SCREEN_RATIO = 0.5;
  const NEXT_SCENE_PREFETCH = [
    "story-stage-1-1.html",
    "assets/css/story-stage-1-1.css?v=20260604-fit-dialogue",
    "assets/js/story-stage-1-1.js?v=20260604-sprite-decode",
    "assets/images/bg-scene/Stage-1-1/story-bg-s01-arrival.png",
    "assets/images/bg-scene/Stage-1-1/story-bg-cipher_ridge.png",
    "assets/images/Mira-sprite/Mira-sprite-alpha-png/mira-holding-hat.png",
    "assets/images/Mira-sprite/Mira-sprite-alpha-webp/mira-neutral-fb.webp",
    "voice/Mira/mira-come-on.mp3",
    "voice/Mira/mira-cipher-ridge-town-is-not-far-from-here.mp3",
    "voice/sound/summer-outdoor-sounds.mp3"
  ];
  const voiceCues = new Map([
    ["mira-apology", "mira-im-sorry-i-think-i-brought-you-here.mp3"]
  ]);
  const playedVoiceCues = new Set();
  const voiceAudioCache = new Map();
  let activeVoice = null;
  let pendingVoiceCue = null;
  let prologueAssetsReady = false;
  let prologueStarted = false;
  let nextScenePrefetched = false;

  function voiceUrl(file) {
    return `${VOICE_BASE}${encodeURIComponent(file)}`;
  }

  function prepareVoiceFile(file) {
    if (!file || typeof Audio !== "function") return null;
    if (voiceAudioCache.has(file)) return voiceAudioCache.get(file);

    const audio = new Audio(voiceUrl(file));
    audio.preload = "auto";
    audio.volume = 0.95;
    try { audio.load(); } catch (error) {}
    voiceAudioCache.set(file, audio);
    return audio;
  }

  function prepareVoiceCues() {
    voiceCues.forEach(file => prepareVoiceFile(file));
  }

  function isPhonePortrait() {
    return Boolean(window.matchMedia && window.matchMedia("(max-width: 920px) and (orientation: portrait)").matches);
  }

  function setLoadingProgress(done, total, text) {
    const percent = total ? Math.round((done / total) * 100) : 0;
    if (loadingBar) loadingBar.style.width = `${Math.max(8, Math.min(100, percent))}%`;
    if (loadingText) loadingText.textContent = text || `Loading ${percent}%`;
  }

  function syncBeginState() {
    if (!beginButton) return;
    const needsLandscape = isPhonePortrait();
    beginButton.disabled = !prologueAssetsReady || needsLandscape;
    beginButton.textContent = !prologueAssetsReady
      ? "Loading"
      : needsLandscape
        ? "Turn Sideways"
        : "Begin";
    if (orientationNote) {
      orientationNote.textContent = needsLandscape
        ? "Turn your phone sideways before beginning so the story opens in a wider view."
        : "Ready. Tap Begin when you are comfortable.";
    }
  }

  function hasLoadedThisSession() {
    try { return sessionStorage.getItem(PROLOGUE_LOADED_KEY) === "true"; }
    catch (error) { return false; }
  }

  function rememberLoadedThisSession() {
    try { sessionStorage.setItem(PROLOGUE_LOADED_KEY, "true"); }
    catch (error) {}
  }

  function preloadImageElement(image) {
    return new Promise(resolve => {
      const done = () => {
        image.classList.add("is-loaded");
        resolve(image.currentSrc || image.src);
      };
      if (image.complete && image.naturalWidth) {
        if (typeof image.decode === "function") image.decode().then(done).catch(done);
        else done();
        return;
      }
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
    });
  }

  function preloadVoiceFile(file) {
    return new Promise(resolve => {
      const audio = prepareVoiceFile(file);
      if (!audio) {
        resolve(file);
        return;
      }
      if (audio.readyState >= 3) {
        resolve(file);
        return;
      }
      const done = () => resolve(file);
      audio.addEventListener("canplaythrough", done, { once: true });
      audio.addEventListener("loadeddata", done, { once: true });
      audio.addEventListener("error", done, { once: true });
      try { audio.load(); } catch (error) { done(); }
      window.setTimeout(done, 4200);
    });
  }

  function unlockPrologueAudio() {
    const prepared = voiceAudioCache.values().next().value;
    if (!prepared || typeof prepared.cloneNode !== "function") return;
    const audio = prepared.cloneNode(true);
    audio.muted = true;
    audio.volume = 0;
    const attempt = audio.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.then(() => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }).catch(() => {});
    }
  }

  function beginPrologue() {
    if (!beginButton || beginButton.disabled || prologueStarted) return;
    prologueStarted = true;
    rememberLoadedThisSession();
    unlockPrologueAudio();
    retryPendingVoiceCue();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    prefetchNextSceneAssets();
    loadingGate?.classList.add("is-hidden");
    document.body.classList.remove("prologue-loading");
    window.setTimeout(() => loadingGate?.setAttribute("hidden", ""), 380);
    updateProgress();
  }

  function prefetchNextSceneAssets() {
    if (nextScenePrefetched) return;
    nextScenePrefetched = true;
    NEXT_SCENE_PREFETCH.forEach(url => {
      if (/\.(png|webp|jpe?g)$/i.test(url)) {
        const image = new Image();
        image.src = url;
        return;
      }
      if (/\.(mp3|wav|ogg)$/i.test(url) && typeof Audio === "function") {
        const audio = new Audio(url);
        audio.preload = "auto";
        try { audio.load(); } catch (error) {}
        return;
      }
      fetch(url).catch(() => {});
    });
  }

  function preloadPrologueAssets() {
    if (hasLoadedThisSession()) {
      prologueAssetsReady = true;
      prologueStarted = true;
      document.body.classList.remove("prologue-loading");
      document.body.classList.add("prologue-preload-seen");
      loadingGate?.setAttribute("hidden", "");
      prepareVoiceCues();
      prefetchNextSceneAssets();
      updateProgress();
      return;
    }

    const images = Array.from(document.querySelectorAll(".manga-page"));
    const voices = Array.from(voiceCues.values());
    const tasks = [
      ...images.map(image => () => preloadImageElement(image)),
      ...voices.map(file => () => preloadVoiceFile(file))
    ];
    const total = Math.max(1, tasks.length);
    let done = 0;

    setLoadingProgress(0, total, "Loading manga pages and Mira's voice...");
    syncBeginState();

    Promise.allSettled(tasks.map(task => task().finally(() => {
      done += 1;
      setLoadingProgress(done, total, done >= total ? "Prologue ready." : `Loading ${done} of ${total} assets...`);
    }))).then(() => {
      prologueAssetsReady = true;
      rememberLoadedThisSession();
      setLoadingProgress(total, total, "Prologue ready.");
      syncBeginState();
    });
  }

  function createVoiceAudio(file) {
    const prepared = prepareVoiceFile(file);
    const audio = prepared && typeof prepared.cloneNode === "function"
      ? prepared.cloneNode(true)
      : new Audio(voiceUrl(file));

    audio.preload = "auto";
    audio.volume = 0.95;
    try { audio.currentTime = 0; } catch (error) {}
    return audio;
  }

  function stopVoice() {
    if (!activeVoice) return;
    activeVoice.pause();
    activeVoice.removeAttribute("src");
    activeVoice.load();
    activeVoice = null;
  }

  function playVoiceCue(cue, file) {
    if (!cue || !file || playedVoiceCues.has(cue)) return;
    if (pendingVoiceCue?.cue === cue) return;

    stopVoice();
    const audio = createVoiceAudio(file);
    activeVoice = audio;
    audio.preload = "auto";
    audio.volume = 0.95;

    const attempt = audio.play();
    if (attempt && typeof attempt.then === "function") {
      attempt
        .then(() => {
          playedVoiceCues.add(cue);
          pendingVoiceCue = null;
        })
        .catch(() => {
          pendingVoiceCue = { cue, file };
        });
    } else {
      playedVoiceCues.add(cue);
      pendingVoiceCue = null;
    }
  }

  function retryPendingVoiceCue() {
    prepareVoiceCues();
    if (!pendingVoiceCue) return;
    const { cue, file } = pendingVoiceCue;
    pendingVoiceCue = null;
    playVoiceCue(cue, file);
  }

  function checkVoiceCues() {
    document.querySelectorAll("[data-voice-cue]").forEach(page => {
      const cue = page.dataset.voiceCue;
      if (!cue || playedVoiceCues.has(cue)) return;

      const rect = page.getBoundingClientRect();
      if (!rect.height || rect.bottom < 0) return;

      const triggerRatio = Number(page.dataset.voiceTrigger || 0.85);
      const triggerY = rect.top + rect.height * triggerRatio;
      const triggerLine = window.innerHeight * VOICE_TRIGGER_SCREEN_RATIO;
      if (triggerY > triggerLine) return;

      playVoiceCue(cue, voiceCues.get(cue));
    });
  }

  function updateProgress() {
    if (!progressBar) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
    progressBar.style.transform = `scaleX(${progress})`;

    if (progress > 0.98) {
      try { localStorage.setItem(READ_KEY, "true"); } catch (error) {}
    }

    checkVoiceCues();
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
  window.addEventListener("resize", () => {
    syncBeginState();
    updateProgress();
  });
  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => {
      syncBeginState();
      updateProgress();
    }, 180);
  });
  window.addEventListener("pointerdown", retryPendingVoiceCue, { passive: true });
  window.addEventListener("touchstart", retryPendingVoiceCue, { passive: true });
  window.addEventListener("keydown", retryPendingVoiceCue);
  window.addEventListener("pagehide", stopVoice);
  document.addEventListener("DOMContentLoaded", () => {
    prepareVoiceCues();
    markImagesLoaded();
    preloadPrologueAssets();
    beginButton?.addEventListener("click", beginPrologue);
    syncBeginState();
  });
  window.addEventListener("load", updateProgress);
})();
