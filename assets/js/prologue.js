(function () {
  "use strict";

  const progressBar = document.getElementById("readerProgressBar");
  const READ_KEY = "mathRidge_mangaPrologueSeen_v1";
  const VOICE_BASE = "voice/Mira/";
  const VOICE_TRIGGER_DELAY_MS = 5000;
  const voiceReadyAt = performance.now() + VOICE_TRIGGER_DELAY_MS;
  const voiceCues = new Map([
    ["mira-apology", "mira-im-sorry-i-think-i-brought-you-here.mp3"]
  ]);
  const playedVoiceCues = new Set();
  const voiceAudioCache = new Map();
  let activeVoice = null;
  let pendingVoiceCue = null;

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
    if (performance.now() < voiceReadyAt) return;
    document.querySelectorAll("[data-voice-cue]").forEach(page => {
      const cue = page.dataset.voiceCue;
      if (!cue || playedVoiceCues.has(cue)) return;

      const rect = page.getBoundingClientRect();
      if (!rect.height || rect.bottom < 0) return;

      const triggerRatio = Number(page.dataset.voiceTrigger || 0.85);
      const triggerY = rect.top + rect.height * triggerRatio;
      const triggerLine = window.innerHeight * 0.72;
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
  window.addEventListener("resize", updateProgress);
  window.addEventListener("orientationchange", updateProgress);
  window.addEventListener("pointerdown", retryPendingVoiceCue, { passive: true });
  window.addEventListener("touchstart", retryPendingVoiceCue, { passive: true });
  window.addEventListener("keydown", retryPendingVoiceCue);
  window.addEventListener("pagehide", stopVoice);
  document.addEventListener("DOMContentLoaded", () => {
    prepareVoiceCues();
    markImagesLoaded();
    updateProgress();
    window.setTimeout(updateProgress, VOICE_TRIGGER_DELAY_MS);
  });
  window.addEventListener("load", updateProgress);
})();
