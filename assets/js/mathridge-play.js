/* Math Ridge Global Play Shell
   Shared systems only: timer, top shelf, progress theme, next-climb gate,
   world ladder, scrolling, and trail return memory.
   Local play files own question generation, scoring rules, and game-specific UI. */
(function () {
	"use strict";

	const bodyPlayClass = document.body
		? Array.from(document.body.classList).find(className => /^play-\d+$/.test(className))
		: "play-2";
	const detectedPlayNumber = bodyPlayClass ? Number(bodyPlayClass.replace("play-", "")) : 2;

	const defaultConfig = {
		playNumber: detectedPlayNumber || 2,
		playId: detectedPlayNumber ? `1_${detectedPlayNumber}` : "1_2",
		gameKey: detectedPlayNumber ? `play${detectedPlayNumber}` : "play2",
		stageLabel: detectedPlayNumber ? `1-${detectedPlayNumber}` : "1-2",
		recordWorkerBase: "https://mathridge-play1-records.primelearning-math-kevin.workers.dev/"
	};

	const config = Object.assign({}, defaultConfig, window.MathRidgePlayConfig || {});
	window.MathRidgePlayConfig = config;
	const PLAYER_PROFILE_KEY = "mathRidge_playerProfile_v1";
	const CERTIFICATE_FULL_NAME_KEY = "mathRidge_certificateFullName_v1";
	const SOUND_BASE = "voice/sound/";
	const MUSIC_BASE = "bg-music/";
	const MUSIC_ENABLED_KEY = "mathRidge_trialMusicEnabled_v1";
	const OFFICIAL_CERTIFICATE_TEMPLATE = {
		src: "assets/images/test-results/math_ridge_certificate_prefilled_template_true_alpha.png?v=20260607-prefilled-certificate",
		width: 1086,
		height: 1448
	};
	const CERT_SERIF = '"Playfair Display", "Palatino Linotype", Georgia, serif';
	const CERT_SCRIPT = '"Snell Roundhand", "Bickham Script Pro", "Edwardian Script ITC", "Brush Script MT", "Segoe Script", cursive';
	const CERT_BODY_SERIF = '"Inter", "Trebuchet MS", Arial, sans-serif';
	const CONFIRM_NAV_DELAY_MS = 780;
	const POINTER_SFX_SUPPRESS_MS = 1400;
	const sfxPresets = {
		firstTap: { file: "first tap.mp3", volume: 0.55, start: 0.08, maxMs: 1200, fadeOut: 240 },
		secondTap: { file: "second tap.mp3", volume: 0.58, start: 0.08, maxMs: 1200, fadeOut: 240 },
		correct: { file: "correct.mp3", volume: 0.44, maxMs: 1500, fadeOut: 320 },
		wrong: { file: "wrong.mp3", volume: 0.3, maxMs: 900, fadeOut: 180 },
		relic: { file: "enchanted-spell-casting.mp3", start: 0, end: 1.55, volume: 0.34, fadeOut: 260 },
		certificatePaper: { file: "certificate-paper-rustle.mp3", start: 0, end: 2.2, volume: 0.42, fadeOut: 520 },
		certificateStamp: { file: "certificate-stamp.mp3", start: 0, end: 2.1, volume: 0.48, fadeOut: 460 },
		certificateFanfare: { file: "certificate-fanfare.mp3", start: 0, end: 2.25, volume: 0.48, fadeOut: 700 }
	};

	const progressMap = {
		"1_1": { section: "1-1", title: "Terms", certificateTitle: "Signed Term Structure", playFile: "play1.html", nextId: "1_2" },
		"1_2": { section: "1-2", title: "Team Terms", certificateTitle: "Positive and Negative Term Balance", playFile: "play2.html", nextId: "1_3" },
		"1_3": { section: "1-3", title: "Sign Simplify", certificateTitle: "Sign Simplification Fluency", playFile: "play3.html", nextId: "1_4" },
		"1_4": { section: "1-4", title: "Chunking", certificateTitle: "Distribution and Grouping Foundations", playFile: "play4.html", nextId: "2_1a" },
		"2_1a": { section: "2-1a", title: "Split Shelf", certificateTitle: "Split Shelf Division", playFile: "play2-1a.html", nextId: "2_1" },
		"2_1": { section: "2-1b", title: "Fraction Shelves", certificateTitle: "Fraction Equivalence and Reduction", playFile: "play5.html", nextId: "2_2" },
		"2_2": { section: "2-2", title: "Prime Pieces", certificateTitle: "Prime Factorization Fluency", playFile: "play6.html", nextId: "2_3" },
		"2_3": { section: "2-3", title: "Fraction Products", certificateTitle: "Fraction Product Structure", playFile: "play7.html", nextId: "2_4" },
		"2_4": { section: "2-4", title: "Exponential Count", certificateTitle: "Exponential Pattern Recognition", playFile: "play8.html", nextId: "" }
	};

	let totalRaceMs = 0;
	let climbStartMs = null;
	let timerInterval = null;
	let cachedRecords = [];
	let premiumScrollTimer = null;
	let premiumScrollFrame = null;
	let bottomDrawerCloseTimer = null;
	let armedBottomControl = null;
	let armedBottomControlTimer = null;
	let armedTrialControl = null;
	let armedTrialControlTimer = null;
	let pendingExitTarget = null;
	const sfxAudioCache = new Map();
	const decodedSfxCache = new Map();
	const sfxBuffers = new Map();
	const sfxLastPlayedAt = new Map();
	let officialCertificateTemplateImage = null;
	let officialCertificateTemplatePromise = null;
	const trialMusicCue = { path: `${MUSIC_BASE}trial-music.MOV?v=20260606-current-mov`, start: 0, volume: 1, restartOnEnd: true, crossfade: 0, fadeIn: 0, useElementAudio: true };
	const playAmbienceByPage = new Map([
		[1, trialMusicCue],
		[2, trialMusicCue],
		[3, trialMusicCue],
		[4, trialMusicCue],
		[5, trialMusicCue],
		[6, trialMusicCue],
		[7, trialMusicCue],
		[8, trialMusicCue]
	]);
	let activePlayAmbience = null;
	let activePlayAmbienceKey = "";
	let pendingPlayAmbience = null;
	let playAudioContext = null;
	let trialMusicEnabled = readTrialMusicEnabled();

	function byId(id) {
		return document.getElementById(id);
	}

	function soundUrl(file) {
		return `${SOUND_BASE}${encodeURIComponent(file)}`;
	}

	function ambienceUrl(cue) {
		if (cue?.path) return cue.path;
		return soundUrl(cue?.file || "");
	}

	function readTrialMusicEnabled() {
		try {
			return localStorage.getItem(MUSIC_ENABLED_KEY) !== "false";
		} catch (error) {
			return true;
		}
	}

	function saveTrialMusicEnabled(enabled) {
		trialMusicEnabled = Boolean(enabled);
		try {
			localStorage.setItem(MUSIC_ENABLED_KEY, trialMusicEnabled ? "true" : "false");
		} catch (error) {}
	}

	function syncMusicToggleButton() {
		const button = byId("trialMusicToggle");
		if (!button) return;
		button.classList.toggle("is-muted", !trialMusicEnabled);
		button.setAttribute("aria-pressed", trialMusicEnabled ? "false" : "true");
		button.setAttribute("aria-label", trialMusicEnabled ? "Turn music off" : "Turn music on");
		button.title = trialMusicEnabled ? "Turn music off" : "Turn music on";
	}

	function setTrialMusicEnabled(enabled, options = {}) {
		saveTrialMusicEnabled(enabled);
		syncMusicToggleButton();
		if (!trialMusicEnabled) {
			stopPlayAmbience();
			return false;
		}
		return options.play !== false ? playPageAmbience({ force: true }) : true;
	}

	function toggleTrialMusic() {
		setTrialMusicEnabled(!trialMusicEnabled);
	}

	function ensureTrialMusicToggle() {
		let button = byId("trialMusicToggle");
		if (!button) {
			button = document.createElement("button");
			button.type = "button";
			button.id = "trialMusicToggle";
			button.className = "trial-music-toggle";
			button.innerHTML = '<span class="trial-music-note" aria-hidden="true"><img src="assets/images/logo/mathridge_eighth_notes_true_alpha_v2_256px.png" alt="" /></span>';
			button.addEventListener("click", toggleTrialMusic);
			document.body.appendChild(button);
		}
		syncMusicToggleButton();
		return button;
	}

	function setupDoubleTapZoomGuard() {
		document.addEventListener("dblclick", event => {
			if (!document.body?.classList.contains("play-page")) return;
			event.preventDefault();
		}, { capture: true });
	}

	function normalizeSfx(cue) {
		if (!cue) return null;
		if (typeof cue === "string") return Object.assign({}, sfxPresets[cue] || { file: cue }, { _cacheName: cue });
		if (typeof cue === "object") {
			const preset = cue.name ? sfxPresets[cue.name] || {} : {};
			return Object.assign({}, preset, cue, cue.name ? { _cacheName: cue.name } : {});
		}
		return null;
	}

	function stopSfxAudio(audio) {
		if (!audio) return;
		audio.pause();
		audio.removeAttribute("src");
		audio.load();
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

	function getPlayAudioContext() {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		if (!AudioContextClass) return null;
		if (!playAudioContext) playAudioContext = new AudioContextClass();
		return playAudioContext;
	}

	function unlockPlayAudioContext() {
		const context = getPlayAudioContext();
		if (!context) return;
		if (context.state === "suspended") context.resume().catch(() => {});
		const source = context.createBufferSource();
		const gain = context.createGain();
		gain.gain.value = 0;
		source.buffer = context.createBuffer(1, 1, context.sampleRate);
		source.connect(gain).connect(context.destination);
		try { source.start(0); } catch (error) {}
	}

	function prepareSfxBuffer(cueLike) {
		const cue = normalizeSfx(cueLike);
		const context = getPlayAudioContext();
		if (!cue?.file || !context) return null;
		const cacheName = cue._cacheName || cue.file;
		if (sfxBuffers.has(cacheName)) return Promise.resolve(sfxBuffers.get(cacheName));
		if (decodedSfxCache.has(cacheName)) return decodedSfxCache.get(cacheName);
		const promise = fetch(soundUrl(cue.file))
			.then(response => response.arrayBuffer())
			.then(buffer => context.decodeAudioData(buffer))
			.then(buffer => {
				sfxBuffers.set(cacheName, buffer);
				return buffer;
			});
		decodedSfxCache.set(cacheName, promise);
		return promise;
	}

	function playSfxBufferNow(cue) {
		const context = getPlayAudioContext();
		const cacheName = cue._cacheName || cue.file;
		const buffer = sfxBuffers.get(cacheName);
		if (!context || !buffer) return false;
		if (context.state === "suspended") context.resume().catch(() => {});

		const source = context.createBufferSource();
		const gain = context.createGain();
		const startAt = Math.max(0, Number(cue.start || 0));
		const endAt = Number(cue.end);
		const maxMs = Number(cue.maxMs);
		const hasEnd = Number.isFinite(endAt) && endAt > startAt;
		const durationMs = hasEnd
			? (endAt - startAt) * 1000
			: Number.isFinite(maxMs) && maxMs > 0
				? maxMs
				: 0;
		const fadeMs = Math.max(0, Number(cue.fadeOut || 0));
		const volume = Number.isFinite(cue.volume) ? Math.max(0, Math.min(1, Number(cue.volume))) : 0.35;
		const safeStart = Math.min(startAt, Math.max(0, buffer.duration - 0.01));

		source.buffer = buffer;
		gain.gain.value = volume;
		source.connect(gain).connect(context.destination);
		if (durationMs && fadeMs && durationMs > fadeMs + 80) {
			window.setTimeout(() => {
				const now = context.currentTime;
				gain.gain.cancelScheduledValues(now);
				gain.gain.setValueAtTime(gain.gain.value, now);
				gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
			}, Math.max(0, durationMs - fadeMs));
		}
		if (durationMs) window.setTimeout(() => {
			try { source.stop(); } catch (error) {}
		}, durationMs);
		try { source.start(0, safeStart); }
		catch (error) { return false; }
		return true;
	}

	function prepareSfx(name) {
		const cue = normalizeSfx(name);
		if (!cue?.file || typeof Audio !== "function") return null;
		const cacheName = cue._cacheName || cue.file;
		if (sfxAudioCache.has(cacheName)) return sfxAudioCache.get(cacheName);

		const audio = new Audio(soundUrl(cue.file));
		audio.preload = "auto";
		audio.volume = Number.isFinite(cue.volume) ? Math.max(0, Math.min(1, Number(cue.volume))) : 0.35;
		try { audio.load(); } catch (error) {}
		sfxAudioCache.set(cacheName, audio);
		prepareSfxBuffer(cue)?.catch(() => {});
		return audio;
	}

	function createSfxAudio(cue) {
		const cacheName = cue._cacheName || cue.file;
		const prepared = cacheName ? prepareSfx(cacheName) : null;
		const audio = prepared && typeof prepared.cloneNode === "function"
			? prepared.cloneNode(true)
			: new Audio(soundUrl(cue.file));

		audio.preload = "auto";
		audio.volume = Number.isFinite(cue.volume) ? Math.max(0, Math.min(1, Number(cue.volume))) : 0.35;
		try { audio.currentTime = 0; } catch (error) {}
		return audio;
	}

	function playSingleSfx(cueLike, options = {}) {
		const cue = normalizeSfx(cueLike);
		if (!cue?.file) return null;
		const delay = Math.max(0, Number(options.delay ?? cue.delay ?? 0));
		if (delay && !options._delayed) {
			window.setTimeout(() => playSingleSfx(cueLike, Object.assign({}, options, { delay: 0, _delayed: true })), delay);
			return null;
		}
		const cacheName = cue._cacheName || cue.file;
		const now = performance.now();
		if (!options.force && cacheName === "firstTap" && now - (sfxLastPlayedAt.get(cacheName) || 0) < 130) return null;
		sfxLastPlayedAt.set(cacheName, now);
		unlockPlayAudioContext();
		if (playSfxBufferNow(cue)) return null;
		prepareSfxBuffer(cue)?.catch(() => {});

		const play = () => {
			const audio = createSfxAudio(cue);
			const startAt = Math.max(0, Number(cue.start || 0));
			const endAt = Number(cue.end);
			const maxMs = Number(cue.maxMs);
			const hasEnd = Number.isFinite(endAt) && endAt > startAt;
			const durationMs = hasEnd
				? (endAt - startAt) * 1000
				: Number.isFinite(maxMs) && maxMs > 0
					? maxMs
					: 0;
			const fadeMs = Math.max(0, Number(cue.fadeOut || 0));
			const volume = Number.isFinite(cue.volume) ? Math.max(0, Math.min(1, Number(cue.volume))) : 0.35;
			let fadeTimer = null;
			let stopTimer = null;

			audio.preload = "auto";
			audio.volume = volume;
			audio.addEventListener("ended", () => stopSfxAudio(audio), { once: true });
			audio.addEventListener("error", () => stopSfxAudio(audio), { once: true });

			const begin = () => {
				if (startAt && audio.duration && startAt < audio.duration) {
					try { audio.currentTime = startAt; } catch (error) {}
				}

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
						stopSfxAudio(audio);
					}, durationMs);
				}

				const attempt = audio.play();
				if (attempt && typeof attempt.catch === "function") {
					attempt.catch(() => {
						if (fadeTimer) window.clearInterval(fadeTimer);
						if (stopTimer) window.clearTimeout(stopTimer);
						stopSfxAudio(audio);
					});
				}
			};

			if (audio.readyState >= 1) begin();
			else {
				audio.addEventListener("loadedmetadata", begin, { once: true });
				audio.load();
			}
			return audio;
		};

		return play();
	}

	function playSfx(cueLike, options = {}) {
		const cue = normalizeSfx(cueLike);
		if (cue?._cacheName === "secondTap" && !options.single) {
			playSingleSfx("firstTap", { force: true });
			window.setTimeout(() => playSingleSfx("secondTap", { force: true }), 58);
			return null;
		}
		return playSingleSfx(cueLike, options);
	}

	function playAmbienceKey(config) {
		if (!config) return "";
		return `${config.path || config.file}|${Number(config.start || 0)}`;
	}

	function stopPlayAmbience() {
		pendingPlayAmbience = null;
		if (!activePlayAmbience) {
			activePlayAmbienceKey = "";
			return;
		}
		if (activePlayAmbience.timers) {
			activePlayAmbience.timers.forEach(timer => window.clearTimeout(timer));
			activePlayAmbience.timers.clear();
		}
		if (activePlayAmbience.fadeTimers) {
			activePlayAmbience.fadeTimers.forEach(timer => window.clearInterval(timer));
			activePlayAmbience.fadeTimers.clear();
		}
		if (activePlayAmbience.gains) {
			activePlayAmbience.gains.forEach(gain => {
				try { gain.disconnect(); } catch (error) {}
			});
			activePlayAmbience.gains.clear();
		}
		if (activePlayAmbience.sources) {
			activePlayAmbience.sources.forEach(source => {
				try { source.disconnect(); } catch (error) {}
			});
			activePlayAmbience.sources.clear();
		}
		if (activePlayAmbience.audios) {
			activePlayAmbience.audios.forEach(audio => {
				audio.pause();
				audio.removeAttribute("src");
				audio.load();
			});
			activePlayAmbience.audios.clear();
		} else {
			activePlayAmbience.pause?.();
			activePlayAmbience.removeAttribute?.("src");
			activePlayAmbience.load?.();
		}
		activePlayAmbience = null;
		activePlayAmbienceKey = "";
	}

	function attachAmbienceGain(session, audio) {
		if (!session || !audio || session.gains?.has(audio)) return session?.gains?.get(audio) || null;
		const context = getPlayAudioContext();
		if (!context) return null;
		if (!session.gains) session.gains = new Map();
		if (!session.sources) session.sources = new Map();
		try {
			const source = context.createMediaElementSource(audio);
			const gain = context.createGain();
			gain.gain.value = 0;
			source.connect(gain).connect(context.destination);
			session.sources.set(audio, source);
			session.gains.set(audio, gain);
			return gain;
		} catch (error) {
			return null;
		}
	}

	function getAmbienceLevel(session, audio) {
		const gain = session?.gains?.get(audio);
		return gain ? Number(gain.gain.value || 0) : Number(audio?.volume || 0);
	}

	function setAmbienceLevel(session, audio, value) {
		const safeValue = Math.max(0, Math.min(1, Number(value || 0)));
		const gain = session?.gains?.get(audio);
		if (gain) {
			gain.gain.value = safeValue;
		} else if (audio) {
			audio.volume = safeValue;
		}
	}

	function fadeAmbienceVolume(session, audio, targetVolume, durationMs = 1200, onDone = null) {
		if (!session || !audio) return;
		if (!session.useElementAudio) attachAmbienceGain(session, audio);
		const startVolume = getAmbienceLevel(session, audio);
		const startedAt = performance.now();
		const safeDuration = Math.max(80, Number(durationMs || 0));
		const timer = window.setInterval(() => {
			if (activePlayAmbience !== session) {
				window.clearInterval(timer);
				return;
			}
			const progress = Math.min(1, (performance.now() - startedAt) / safeDuration);
			setAmbienceLevel(session, audio, startVolume + (targetVolume - startVolume) * progress);
			if (progress >= 1) {
				window.clearInterval(timer);
				session.fadeTimers.delete(timer);
				if (onDone) onDone();
			}
		}, 40);
		session.fadeTimers.add(timer);
	}

	function createAmbienceAudio(ambience) {
		const audio = new Audio(ambienceUrl(ambience));
		audio.preload = "auto";
		audio.loop = false;
		audio.volume = 0;
		return audio;
	}

	function shouldRestartAmbience(ambience) {
		return Boolean(ambience && ambience.restartOnEnd);
	}

	function restartAmbienceAudio(session, audio, ambience, targetVolume) {
		if (!session || activePlayAmbience !== session || !shouldRestartAmbience(ambience)) return;
		try { audio.currentTime = Math.max(0, Number(ambience.start || 0)); } catch (error) {}
		setAmbienceLevel(session, audio, 0);
		const attempt = audio.play();
		if (attempt && typeof attempt.then === "function") {
			attempt.then(() => fadeAmbienceVolume(session, audio, targetVolume, Number(ambience.fadeIn || 900))).catch(() => {
				if (activePlayAmbience === session) pendingPlayAmbience = { config: ambience };
			});
		} else {
			fadeAmbienceVolume(session, audio, targetVolume, Number(ambience.fadeIn || 900));
		}
	}

	function scheduleAmbienceCrossfade(session, audio, ambience, targetVolume) {
		if (!session || activePlayAmbience !== session || !shouldRestartAmbience(ambience)) return;
		const crossfadeSeconds = Math.max(0, Number(ambience.crossfade || 0));
		if (!crossfadeSeconds || !audio.duration || audio.duration <= crossfadeSeconds + 4) {
			return;
		}

		const leadMs = Math.max(900, (audio.duration - crossfadeSeconds) * 1000);
		const timer = window.setTimeout(() => {
			if (activePlayAmbience !== session) return;
			const nextAudio = createAmbienceAudio(ambience);
			session.audios.add(nextAudio);
			const started = startAmbienceAudio(session, nextAudio, ambience, targetVolume, {
				skipStart: true,
				fallbackAudio: audio,
				crossfadeFrom: audio,
				crossfadeMs: crossfadeSeconds * 1000
			});
			if (!started) restartAmbienceAudio(session, audio, ambience, targetVolume);
		}, leadMs);
		session.timers.add(timer);
	}

	function startAmbienceAudio(session, audio, ambience, targetVolume, options = {}) {
		if (!session || activePlayAmbience !== session) return false;
		if (!session.useElementAudio) attachAmbienceGain(session, audio);
		const startAt = options.skipStart ? 0 : Math.max(0, Number(ambience.start || 0));
		const applyStartPosition = () => {
			if (activePlayAmbience !== session) return;
			if (startAt && audio.duration && startAt < audio.duration) {
				try { audio.currentTime = startAt; } catch (error) {}
			}
		};
		const afterMetadata = () => {
			applyStartPosition();
			scheduleAmbienceCrossfade(session, audio, ambience, targetVolume);
		};
		if (audio.readyState >= 1) afterMetadata();
		else {
			audio.addEventListener("loadedmetadata", afterMetadata, { once: true });
			audio.addEventListener("error", () => {
				if (activePlayAmbience === session) stopPlayAmbience();
			}, { once: true });
			audio.load();
		}
		if (!audio._mathRidgeEndedRestartBound) {
			audio._mathRidgeEndedRestartBound = true;
			audio.addEventListener("ended", () => {
				restartAmbienceAudio(session, audio, ambience, targetVolume);
			});
		}

		const attempt = audio.play();
		if (attempt && typeof attempt.then === "function") {
			attempt.then(() => {
				if (activePlayAmbience === session) {
					pendingPlayAmbience = null;
					fadeAmbienceVolume(session, audio, targetVolume, Number(ambience.fadeIn || 1200));
					if (options.crossfadeFrom) {
						fadeAmbienceVolume(session, options.crossfadeFrom, 0, Number(options.crossfadeMs || 1200), () => {
							options.crossfadeFrom.pause();
							session.audios.delete(options.crossfadeFrom);
							options.crossfadeFrom.removeAttribute("src");
							options.crossfadeFrom.load();
						});
					}
				}
			}).catch(() => {
				if (activePlayAmbience === session) {
					pendingPlayAmbience = { config: ambience };
					if (options.fallbackAudio) restartAmbienceAudio(session, options.fallbackAudio, ambience, targetVolume);
				}
			});
		} else {
			pendingPlayAmbience = null;
			fadeAmbienceVolume(session, audio, targetVolume, Number(ambience.fadeIn || 1200));
		}
		return true;
	}

	function playPageAmbience(options = {}) {
		if (!trialMusicEnabled) {
			stopPlayAmbience();
			return false;
		}

		const ambience = playAmbienceByPage.get(Number(config.playNumber)) || null;
		if (!ambience) {
			stopPlayAmbience();
			return false;
		}

		const key = playAmbienceKey(ambience);
		if (!options.force && activePlayAmbience && activePlayAmbienceKey === key && !pendingPlayAmbience) {
			return true;
		}

		stopPlayAmbience();
		unlockPlayAudioContext();

		const targetVolume = Number.isFinite(ambience.volume) ? Math.max(0, Math.min(1, Number(ambience.volume))) : 0.025;
		const session = {
			audios: new Set(),
			timers: new Set(),
			fadeTimers: new Set(),
			gains: new Map(),
			sources: new Map(),
			useElementAudio: ambience.useElementAudio === true
		};
		const audio = createAmbienceAudio(ambience);
		session.audios.add(audio);
		activePlayAmbience = session;
		activePlayAmbienceKey = key;
		pendingPlayAmbience = { config: ambience };
		return startAmbienceAudio(session, audio, ambience, targetVolume);
	}

	function retryPlayAmbience() {
		if (!trialMusicEnabled) return false;
		if (!pendingPlayAmbience) return false;
		return playPageAmbience({ force: true });
	}

	function preparePlayAmbience() {
		if (!trialMusicEnabled) return null;
		const ambience = playAmbienceByPage.get(Number(config.playNumber));
		if (!ambience || typeof Audio !== "function") return null;
		const audio = new Audio(ambienceUrl(ambience));
		audio.preload = "auto";
		audio.volume = 0;
		try { audio.load(); } catch (error) {}
		return audio;
	}

	function playCertificateSfx() {
		playSfx("certificatePaper");
		playSfx("certificateStamp", { delay: 620 });
		playSfx("certificateFanfare", { delay: 1120 });
	}

	function ensureTopNextClimbButton() {
		const button = byId("nextClimbButton");
		const board = document.querySelector(".challenge-board");
		if (!button || !board) return null;

		let tray = byId("nextClimbInlineTray");
		if (!tray) {
			tray = document.createElement("div");
			tray.id = "nextClimbInlineTray";
			tray.className = "next-climb-inline-tray";
		}

		const completeStep = byId("completeStep");
		const canMoveAfterComplete = config.nextClimbAfterComplete !== false;
		const finalCardReady = canMoveAfterComplete && completeStep && !completeStep.classList.contains("hidden") && !completeStep.hidden;
		if (finalCardReady && completeStep.parentElement) {
			completeStep.insertAdjacentElement("afterend", tray);
			tray.classList.add("is-after-complete-card");
		} else {
			const status = byId("challengeMessage");
			if (status?.parentNode === board) {
				status.insertAdjacentElement("afterend", tray);
			} else {
				board.appendChild(tray);
			}
			tray.classList.remove("is-after-complete-card");
		}

		if (button.parentElement !== tray) {
			tray.appendChild(button);
		}

		button.classList.add("inline-next-climb-button");
		syncNextClimbPreviewTheme(button);
		return button;
	}

	function syncNextClimbPreviewTheme(button = byId("nextClimbButton")) {
		if (!button) return;
		const local = window.MathRidgeLocal || {};
		const score = typeof local.getScore === "function" ? Number(local.getScore()) : Number(local.score || 0);
		const previewTheme = getProgressThemeNameByScore(score + 1);
		button.classList.remove("next-climb-preview-neutral", "next-climb-preview-blue", "next-climb-preview-purple");
		button.classList.add(`next-climb-preview-${previewTheme}`);
		button.dataset.nextClimbPreview = previewTheme;
	}

	function pulseTopNextClimbButton() {
		const button = ensureTopNextClimbButton();
		if (!button) return;
		button.classList.remove("is-ready-pulse");
		void button.offsetWidth;
		button.classList.add("is-ready-pulse");
	}

	function setStepControlsLocked(step, locked) {
		if (!step) return;
		step.classList.toggle("is-step-locked", locked);
		step.querySelectorAll("button, input, select, textarea").forEach(control => {
			if (locked) {
				control.disabled = true;
				control.setAttribute("aria-disabled", "true");
			} else {
				control.disabled = false;
				control.removeAttribute("aria-disabled");
			}
		});
	}

	function syncCompletedStepLocks() {
		const finalReady = document.body.dataset.finalCorrectReady === "true";
		document.querySelectorAll(".play-area").forEach(area => {
			const steps = Array.from(area.querySelectorAll(".step-card"));
			const visibleSteps = steps.filter(step => !step.hidden && !step.classList.contains("hidden"));
			const lastVisible = visibleSteps[visibleSteps.length - 1] || null;
			steps.forEach(step => {
				const shouldLock = Boolean(lastVisible && visibleSteps.includes(step) && (finalReady || step !== lastVisible));
				setStepControlsLocked(step, shouldLock);
			});
		});
	}

	function watchStepLocks() {
		if (typeof MutationObserver === "undefined") return;
		const area = document.querySelector(".play-area");
		if (!area || area.dataset.stepLockObserverReady === "true") return;
		area.dataset.stepLockObserverReady = "true";
		const observer = new MutationObserver(() => syncCompletedStepLocks());
		observer.observe(area, {
			attributes: true,
			attributeFilter: ["class", "hidden"],
			subtree: true
		});
		syncCompletedStepLocks();
	}

	function readPlayerProfile() {
		try {
			const profile = JSON.parse(localStorage.getItem(PLAYER_PROFILE_KEY));
			if (!profile || typeof profile !== "object") return null;
			return profile;
		} catch (error) {
			return null;
		}
	}

	function cleanCertificateName(value, fallback = "") {
		const clean = String(value || "")
			.trim()
			.replace(/\s+/g, " ")
			.slice(0, 48);
		return clean || fallback;
	}

	function readOfficialCertificateName() {
		try {
			return cleanCertificateName(localStorage.getItem(CERTIFICATE_FULL_NAME_KEY));
		} catch (error) {
			return "";
		}
	}

	function saveOfficialCertificateName(name) {
		const existing = readOfficialCertificateName();
		if (existing) return existing;

		const clean = cleanCertificateName(name);
		if (!clean) return "";

		try {
			localStorage.setItem(CERTIFICATE_FULL_NAME_KEY, clean);

			const profile = readPlayerProfile();
			if (profile && typeof profile === "object") {
				localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(Object.assign({}, profile, {
					certificateName: clean,
					certificateNameLocked: true,
					certificateNameSavedAt: new Date().toISOString()
				})));
			}
		} catch (error) {
			// Storage may be unavailable in private or embedded previews.
		}

		return clean;
	}

	function getPreferredCertificateName(fallback = "Math Ridge Champion") {
		const officialName = readOfficialCertificateName();
		if (officialName) return officialName;

		const profile = readPlayerProfile();
		const name = profile?.certificateName || profile?.nickname || fallback;
		return String(name || fallback).trim() || fallback;
	}

	function resolveCertificateName(inputName, fallback = "Math Ridge Champion") {
		const officialName = readOfficialCertificateName();
		if (officialName) return officialName;

		const typedName = cleanCertificateName(inputName);
		if (typedName) return saveOfficialCertificateName(typedName) || typedName;

		return getPreferredCertificateName(fallback);
	}

	function applyPlayerProfileToCertificateInput() {
		const input = byId("playerNameInput");
		if (!input) return;

		const officialName = readOfficialCertificateName();
		const label = document.querySelector('label[for="playerNameInput"]');
		const note = document.querySelector("#namePopup .proof-note");

		if (officialName) {
			input.value = officialName;
			input.readOnly = true;
			input.classList.add("profile-locked-input");

			if (label) label.textContent = "Official Certificate Name";
			if (note && !note.dataset.officialNameLocked) {
				note.dataset.officialNameLocked = "true";
				note.textContent = "This official name is saved on this device for all future Math Ridge certificates.";
			}
			return;
		}

		input.readOnly = false;
		input.classList.remove("profile-locked-input");
		input.placeholder = "Student Full Name";

		if (label) label.textContent = "Full Name for Certificate";
		if (note && !note.dataset.officialNamePrompt) {
			note.dataset.officialNamePrompt = "true";
			note.textContent = "Type the student's full name once. This name will be saved on this device for future certificates.";
		}
	}

	function watchPlayerProfileNameInput() {
		applyPlayerProfileToCertificateInput();

		const popup = byId("namePopup");
		if (!popup || typeof MutationObserver === "undefined") return;

		const observer = new MutationObserver(() => {
			applyPlayerProfileToCertificateInput();
		});
		observer.observe(popup, { attributes: true, attributeFilter: ["class", "style"] });
	}

	function clampNumber(value, min, max) {
		return Math.min(max, Math.max(min, Number(value || 0)));
	}

	function formatRaceTime(ms) {
		const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	}

	function formatRaceSeconds(seconds) {
		return formatRaceTime(Number(seconds || 0) * 1000);
	}

	function getCurrentClimbMs() {
		return climbStartMs === null ? 0 : Date.now() - climbStartMs;
	}

	function getTotalRaceMs() {
		return totalRaceMs + getCurrentClimbMs();
	}

	function updateTimerPanel() {
		const totalText = formatRaceTime(getTotalRaceMs());
		const climbText = formatRaceTime(getCurrentClimbMs());

		const panel = byId("timerPanel");
		if (panel) panel.textContent = `⏱ Time: ${totalText} | This climb: ${climbText}`;

		const raceTimer = byId("raceTimer");
		if (raceTimer) raceTimer.textContent = totalText;

		const climbTimer = byId("climbTimer");
		if (climbTimer) climbTimer.textContent = climbText;
	}

	function hideNextClimbButton(options = {}) {
		const button = ensureTopNextClimbButton() || byId("nextClimbButton");
		if (!button) return false;

		if (!options.force && document.body.dataset.finalCorrectReady === "true") {
			return false;
		}

		document.body.dataset.finalCorrectReady = "false";
		button.dataset.finalCorrectReady = "false";
		delete button.dataset.nextClimbSoundPlayed;
		button.classList.add("hidden", "locked-button");
		button.hidden = true;
		button.disabled = true;
		button.setAttribute("disabled", "disabled");
		button.setAttribute("aria-disabled", "true");
		button.style.removeProperty("display");
		button.style.removeProperty("visibility");
		button.style.removeProperty("pointer-events");
		button.style.removeProperty("opacity");
		byId("playBottomDrawerLauncher")?.classList.remove("is-ready");
		syncCompletedStepLocks();
		return true;
	}

	function showNextClimbButton(options = {}) {
		if (typeof options === "boolean") options = { scroll: options };
		const button = ensureTopNextClimbButton() || byId("nextClimbButton");
		if (!button) return false;

		document.body.dataset.finalCorrectReady = "true";
		button.dataset.finalCorrectReady = "true";
		syncNextClimbPreviewTheme(button);
		button.classList.remove("hidden", "locked-button", "disabled", "is-disabled");
		button.hidden = false;
		button.disabled = false;
		button.removeAttribute("disabled");
		button.removeAttribute("aria-hidden");
		button.setAttribute("aria-disabled", "false");
		button.style.setProperty("display", "inline-flex", "important");
		button.style.setProperty("visibility", "visible", "important");
		button.style.setProperty("pointer-events", "auto", "important");
		button.style.setProperty("opacity", "1", "important");
		button.textContent = button.textContent.trim() || "Next Climb";
		if (options.sound !== false && button.dataset.nextClimbSoundPlayed !== "true") {
			playSfx(options.sound || "correct");
			button.dataset.nextClimbSoundPlayed = "true";
		}
		syncCompletedStepLocks();
		pulseTopNextClimbButton();
		if (options.scroll) {
			scrollToPremiumElement("nextClimbInlineTray", 18, {
				delay: 180,
				duration: 760,
				slow: true
			});
		}

		return true;
	}

	function startClimbTimer(options = {}) {
		playPageAmbience();
		if (options.hideNext !== false) hideNextClimbButton({ force: true });
		if (climbStartMs !== null) return false;

		climbStartMs = Date.now();
		updateTimerPanel();

		if (!timerInterval) {
			timerInterval = window.setInterval(updateTimerPanel, 250);
		}

		return true;
	}

	function stopClimbTimer(addToTotal = true) {
		if (climbStartMs !== null && addToTotal) {
			totalRaceMs += Date.now() - climbStartMs;
		}

		climbStartMs = null;

		if (timerInterval) {
			window.clearInterval(timerInterval);
			timerInterval = null;
		}

		updateTimerPanel();
		return true;
	}

	function startNextClimbTimer() {
		hideNextClimbButton({ force: true });
		stopClimbTimer(false);
		reviveProgressTurtle();
		return startClimbTimer({ hideNext: false });
	}

	function resetRaceTimer() {
		if (timerInterval) window.clearInterval(timerInterval);
		timerInterval = null;
		totalRaceMs = 0;
		climbStartMs = null;
		updateTimerPanel();
	}

	function setStatusMessage(message) {
		const status = byId("challengeMessage");
		if (status && message) status.textContent = message;
	}

	function finishCorrectClimb(options = {}) {
		stopClimbTimer(true);
		if (options.message) setStatusMessage(options.message);
		showNextClimbButton({ scroll: options.scroll !== false, sound: options.sound });
		return true;
	}

	function finishFinalCorrectRound(options = {}) {
		return finishCorrectClimb(options);
	}

	function animatePremiumScroll(targetY, duration = 680) {
		const startY = window.scrollY || window.pageYOffset || 0;
		const distance = Math.max(0, targetY) - startY;
		if (Math.abs(distance) < 4) return;

		if (premiumScrollFrame) window.cancelAnimationFrame(premiumScrollFrame);

		const startTime = performance.now();
		const ease = progress => 1 - Math.pow(1 - progress, 3);

		const step = now => {
			const progress = Math.min(1, (now - startTime) / duration);
			window.scrollTo(0, startY + distance * ease(progress));
			if (progress < 1) {
				premiumScrollFrame = window.requestAnimationFrame(step);
			} else {
				premiumScrollFrame = null;
			}
		};

		premiumScrollFrame = window.requestAnimationFrame(step);
	}

	function scrollToPremiumElement(id, extraOffset = 14, options = {}) {
		const element = byId(id);
		if (!element) return false;

		if (premiumScrollTimer) window.clearTimeout(premiumScrollTimer);
		premiumScrollTimer = window.setTimeout(() => {
			const shelf = document.querySelector(".challenge-board");
			const shelfHeight = shelf ? shelf.getBoundingClientRect().height : 0;
			const y = window.scrollY + element.getBoundingClientRect().top - shelfHeight - extraOffset;
			const mobile = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
			const targetY = Math.max(0, y);
			if (mobile || options.slow === true) {
				animatePremiumScroll(targetY, Number(options.duration || 720));
			} else {
				window.scrollTo({ top: targetY, behavior: "smooth" });
			}
		}, Number(options.delay ?? 40));

		return true;
	}

	function isMobilePlayView() {
		return Boolean(window.matchMedia && window.matchMedia("(max-width: 1024px), (hover: none) and (pointer: coarse)").matches);
	}

	function getBottomDrawerTitle() {
		const footerText = document.querySelector(".game-footer")?.textContent?.trim();
		if (footerText) return footerText;
		return document.title.replace(/^Math Ridge\s*\|\s*/i, "Math Ridge | ");
	}

	function clearArmedBottomControl() {
		if (armedBottomControl) {
			armedBottomControl.classList.remove("is-play-armed");
			armedBottomControl.removeAttribute("data-play-armed");
		}
		armedBottomControl = null;
		if (armedBottomControlTimer) {
			window.clearTimeout(armedBottomControlTimer);
			armedBottomControlTimer = null;
		}
	}

	function openBottomDrawer(options = {}) {
		const controls = byId("bottomControls");
		if (!controls) return false;
		controls.classList.add("is-open");
		document.body.classList.add("play-bottom-drawer-open");
		const launcher = byId("playBottomDrawerLauncher");
		if (launcher) {
			launcher.setAttribute("aria-expanded", "true");
			launcher.setAttribute("aria-label", "Close play controls");
			launcher.classList.remove("is-ready");
		}
		if (bottomDrawerCloseTimer) window.clearTimeout(bottomDrawerCloseTimer);
		if (options.temporary !== false) {
			bottomDrawerCloseTimer = window.setTimeout(() => {
				if (!controls.matches(":focus-within")) closeBottomDrawer();
			}, Number(options.duration || 4200));
		}
		return true;
	}

	function closeBottomDrawer() {
		const controls = byId("bottomControls");
		if (!controls) return false;
		controls.classList.remove("is-open");
		document.body.classList.remove("play-bottom-drawer-open");
		const launcher = byId("playBottomDrawerLauncher");
		if (launcher) {
			launcher.setAttribute("aria-expanded", "false");
			launcher.setAttribute("aria-label", "Open play controls");
		}
		clearArmedBottomControl();
		return true;
	}

	function markBottomDrawerNeedsAttention() {
		const launcher = byId("playBottomDrawerLauncher");
		if (!launcher) return false;
		launcher.classList.add("is-ready");
		launcher.setAttribute("aria-label", "Open play controls. Next Climb is ready.");
		return true;
	}

	function isExitControl(target) {
		const href = target?.getAttribute?.("href") || "";
		return Boolean(
			target?.classList?.contains("trail-return") ||
			target?.classList?.contains("note-return") ||
			/index\.html|note\d+\.html/i.test(href)
		);
	}

	function isActiveClimbRisk() {
		const playAreaActive = Boolean(document.querySelector(".play-area:not(.hidden)"));
		const climbGateReady = Boolean(document.querySelector(".climb-gate:not(.hidden)"));
		const playPageActive = document.body.classList.contains("play-page");
		const popupOpen = Boolean(document.querySelector(".achievement-popup[style*='flex'], .achievement-popup.show"));
		return !popupOpen && (climbStartMs !== null || playAreaActive || climbGateReady || playPageActive);
	}

	function ensureExitConfirmModal() {
		let modal = byId("playExitConfirm");
		if (modal) return modal;

		modal = document.createElement("div");
		modal.id = "playExitConfirm";
		modal.className = "play-exit-confirm";
		modal.setAttribute("role", "dialog");
		modal.setAttribute("aria-modal", "true");
		modal.setAttribute("aria-labelledby", "playExitConfirmTitle");
		modal.innerHTML = `
			<div class="play-exit-card">
				<h2 id="playExitConfirmTitle">Exit This Climb?</h2>
				<p>The game is still open. Leaving now can interrupt this climb. Do you wish to exit the game now?</p>
				<div class="play-exit-actions">
					<button type="button" class="secondary-action" data-play-exit-no>No</button>
					<button type="button" class="primary-action" data-play-exit-yes>Yes, Exit</button>
				</div>
			</div>
		`;
		document.body.appendChild(modal);
		modal.querySelector("[data-play-exit-no]")?.addEventListener("click", () => {
			modal.classList.remove("show");
			pendingExitTarget = null;
		});
		modal.querySelector("[data-play-exit-yes]")?.addEventListener("click", () => {
			const target = pendingExitTarget;
			pendingExitTarget = null;
			modal.classList.remove("show");
			if (!target) return;
			if ((target.getAttribute("onclick") || "").includes("rememberMountainTrailReturn")) {
				rememberMountainTrailReturn();
			}
			const href = target.getAttribute("href");
			if (href) {
				playSfx("secondTap");
				navigateAfterConfirm(target.href || href);
			}
		});
		return modal;
	}

	function showExitConfirm(target) {
		pendingExitTarget = target;
		const modal = ensureExitConfirmModal();
		modal.classList.add("show");
		modal.querySelector("[data-play-exit-no]")?.focus();
	}

	function handleBottomControlClick(event) {
		const controls = byId("bottomControls");
		if (!controls) return;
		const target = event.target?.closest?.("#bottomControls a, #bottomControls button");
		if (!target || target.classList.contains("play-bottom-drawer-tab")) return;
		if (target.disabled || target.getAttribute("aria-disabled") === "true") return;

		if (!isMobilePlayView()) {
			if (isExitControl(target) && isActiveClimbRisk()) {
				event.preventDefault();
				event.stopImmediatePropagation();
				showExitConfirm(target);
			}
			return;
		}

		openBottomDrawer({ temporary: true, duration: 5200 });

		if (armedBottomControl !== target || target.dataset.playArmed !== "true") {
			event.preventDefault();
			event.stopImmediatePropagation();
			clearArmedBottomControl();
			armedBottomControl = target;
			target.dataset.playArmed = "true";
			target.classList.add("is-play-armed");
			if (target.dataset.playPointerFirstTapPlayed === "true") {
				target.removeAttribute("data-play-pointer-first-tap-played");
			} else {
				playSfx("firstTap");
			}
			armedBottomControlTimer = window.setTimeout(clearArmedBottomControl, 3400);
			return;
		}

		clearArmedBottomControl();
		if (target.dataset.playPointerSecondTapPlayed === "true") {
			target.removeAttribute("data-play-pointer-second-tap-played");
		} else {
			playSfx("secondTap");
		}
		if (isExitControl(target) && isActiveClimbRisk()) {
			event.preventDefault();
			event.stopImmediatePropagation();
			showExitConfirm(target);
			return;
		}

		if (target.tagName === "A") {
			const href = target.getAttribute("href");
			if (href && href !== "#") {
				event.preventDefault();
				event.stopImmediatePropagation();
				navigateAfterConfirm(target.href);
			}
		}
	}

	function clearArmedTrialControl(exceptTarget = null) {
		if (armedTrialControl && armedTrialControl !== exceptTarget) {
			armedTrialControl.classList.remove("is-play-armed");
			armedTrialControl.removeAttribute("data-trial-armed");
			armedTrialControl.removeAttribute("aria-describedby");
			armedTrialControl.removeAttribute("data-trial-pointer-first-arm");
		}

		if (!exceptTarget) armedTrialControl = null;

		if (armedTrialControlTimer) {
			window.clearTimeout(armedTrialControlTimer);
			armedTrialControlTimer = null;
		}
	}

	function isTrialCheckButton(target) {
		if (!target || !target.matches("button")) return false;
		const action = target.getAttribute("onclick") || "";
		const label = (target.textContent || "").trim();
		return /\bcheck[A-Z_\(]/.test(action)
			|| /\bconfirm[A-Z_\(]/.test(action)
			|| /^check\b/i.test(label)
			|| /^confirm\b/i.test(label);
	}

	function isTrialArmTarget(target) {
		if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") return false;
		if (!target.closest(".play-area")) return false;
		if (target.closest("#bottomControls, .achievement-popup, .modal-backdrop, .play-exit-confirm")) return false;
		if (target.matches("a, input, select, textarea, label")) return false;
		if (!isTrialCheckButton(target)) return false;
		return true;
	}

	function armTrialControl(target) {
		clearArmedTrialControl(target);
		armedTrialControl = target;
		target.dataset.trialArmed = "true";
		target.classList.add("is-play-armed");
		playSfx("firstTap");
		armedTrialControlTimer = window.setTimeout(() => clearArmedTrialControl(), 3600);
	}

	function handleTrialControlPointerDown(event) {
		const target = event.target?.closest?.("button");
		if (!isTrialArmTarget(target)) return;
		if (armedTrialControl === target && target.dataset.trialArmed === "true") return;
		event.preventDefault();
		event.stopImmediatePropagation();
		target.dataset.trialPointerFirstArm = "true";
		armTrialControl(target);
	}

	function handleTrialControlClick(event) {
		const target = event.target?.closest?.("button");
		if (!isTrialArmTarget(target)) return;

		if (target.dataset.trialPointerFirstArm === "true") {
			event.preventDefault();
			event.stopImmediatePropagation();
			target.removeAttribute("data-trial-pointer-first-arm");
			return;
		}

		if (armedTrialControl !== target || target.dataset.trialArmed !== "true") {
			event.preventDefault();
			event.stopImmediatePropagation();
			armTrialControl(target);
			return;
		}

		clearArmedTrialControl();
		playSfx("secondTap");
	}

	function isReadyNextClimbButton(target) {
		return Boolean(target
			&& target.id === "nextClimbButton"
			&& !target.disabled
			&& target.getAttribute("aria-disabled") !== "true"
			&& !target.hidden
			&& !target.classList.contains("hidden"));
	}

	function handleNextClimbPointerDown(event) {
		const target = event.target?.closest?.("#nextClimbButton");
		if (!isReadyNextClimbButton(target)) return;
		unlockPlayAudioContext();
		playSfx("secondTap");
		target.dataset.nextClimbPointerReleasePlayed = "true";
		window.setTimeout(() => target.removeAttribute("data-next-climb-pointer-release-played"), POINTER_SFX_SUPPRESS_MS);
	}

	function handleNextClimbClick(event) {
		const target = event.target?.closest?.("#nextClimbButton");
		if (!isReadyNextClimbButton(target)) return;
		if (target.dataset.nextClimbPointerReleasePlayed === "true") {
			target.removeAttribute("data-next-climb-pointer-release-played");
			return;
		}
		playSfx("secondTap");
	}

	function setupBottomDrawer() {
		const controls = byId("bottomControls");
		if (!controls || controls.dataset.drawerReady === "true") return;
		controls.dataset.drawerReady = "true";
		document.body.classList.add("has-play-bottom-drawer");

		const launcher = document.createElement("button");
		launcher.type = "button";
		launcher.id = "playBottomDrawerLauncher";
		launcher.className = "play-bottom-drawer-launcher";
		launcher.setAttribute("aria-controls", "bottomControls");
		launcher.setAttribute("aria-expanded", "false");
		launcher.setAttribute("aria-label", "Open play controls");
		launcher.innerHTML = `
			<span class="play-bottom-launcher-icon" aria-hidden="true"><i></i><i></i><i></i></span>
			<span class="play-bottom-launcher-label">Controls</span>
		`;
		launcher.addEventListener("click", event => {
			event.preventDefault();
			if (controls.classList.contains("is-open")) closeBottomDrawer();
			else openBottomDrawer({ temporary: false });
		});
		launcher.addEventListener("pointerdown", () => {
			if (isMobilePlayView()) {
				unlockPlayAudioContext();
				playSfx("firstTap");
			}
		}, { passive: true });
		document.body.appendChild(launcher);

		const tab = document.createElement("button");
		tab.type = "button";
		tab.className = "play-bottom-drawer-tab";
		tab.innerHTML = `<span>${getBottomDrawerTitle()}</span><strong>Close</strong>`;
		tab.addEventListener("click", event => {
			event.preventDefault();
			if (controls.classList.contains("is-open")) closeBottomDrawer();
			else openBottomDrawer({ temporary: false });
		});
		controls.insertBefore(tab, controls.firstChild);

		controls.addEventListener("focusin", () => openBottomDrawer({ temporary: false }));
		controls.addEventListener("pointerdown", event => {
			if (!isMobilePlayView()) return;
			const target = event.target?.closest?.("#bottomControls a, #bottomControls button");
			if (!target || target.classList.contains("play-bottom-drawer-tab")) return;
			if (target.disabled || target.getAttribute("aria-disabled") === "true") return;

			unlockPlayAudioContext();
			if (target.dataset.playArmed === "true") {
				playSfx("secondTap");
				target.setAttribute("data-play-pointer-second-tap-played", "true");
				window.setTimeout(() => target.removeAttribute("data-play-pointer-second-tap-played"), POINTER_SFX_SUPPRESS_MS);
				return;
			}

			playSfx("firstTap");
			target.setAttribute("data-play-pointer-first-tap-played", "true");
			window.setTimeout(() => target.removeAttribute("data-play-pointer-first-tap-played"), POINTER_SFX_SUPPRESS_MS);
		}, { passive: true });
		document.addEventListener("click", handleBottomControlClick, true);
		document.addEventListener("pointerdown", event => {
			if (!isMobilePlayView()) return;
			if (!controls.classList.contains("is-open")) return;
			if (!event.target.closest("#bottomControls, #playExitConfirm")) closeBottomDrawer();
		}, { passive: true });
	}

	function getRecordUrl(limit) {
		const url = new URL(config.recordWorkerBase || defaultConfig.recordWorkerBase);
		url.searchParams.set("game", config.gameKey || defaultConfig.gameKey);
		if (limit) url.searchParams.set("limit", String(limit));
		return url.toString();
	}

	function normalizeRecords(data) {
		const raw = Array.isArray(data)
			? data
			: (data && (data.records || data.results || data.leaderboard || data.data)) || [];

		return raw.map(record => {
			const seconds = Number(record.timeSeconds || record.seconds || 0);
			const ms = Number(record.ms || record.timeMs || record.raceMs || 0);
			return {
				name: record.name || record.player || record.playerName || "Math Ridge Champion",
				timeDisplay: record.timeDisplay || record.time || record.displayTime || (seconds ? formatRaceSeconds(seconds) : ms ? formatRaceTime(ms) : "recorded"),
				timeSeconds: seconds,
				ms
			};
		});
	}

	function recordTimeText(record) {
		if (record.timeDisplay) return record.timeDisplay;
		if (record.timeSeconds) return formatRaceSeconds(record.timeSeconds);
		if (record.ms) return formatRaceTime(record.ms);
		return "recorded";
	}

	function renderLadderRecords(records = [], showAll = false) {
		const list = byId("ladderRecordList") || byId("recordList");
		if (!list) return;

		const view = showAll ? records.slice(0, 10) : records.slice(0, 3);
		if (!view.length) {
			list.className = "record-list empty";
			list.textContent = "No world records yet.";
			return;
		}

		list.className = "record-list";
		list.innerHTML = view.map((record, index) => {
			const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
			const safeName = String(record.name || "Math Ridge Champion").replace(/[<>]/g, "");
			return `<div>${medal} ${safeName} — ${recordTimeText(record)}</div>`;
		}).join("");
	}

	async function loadLadderRecords(showAll = false) {
		const list = byId("ladderRecordList") || byId("recordList");
		if (list) {
			list.className = "record-list empty";
			list.textContent = "Loading world records...";
		}

		try {
			const response = await fetch(getRecordUrl(showAll ? 10 : 3), { method: "GET", cache: "no-store" });
			const data = await response.json();
			if (data && data.ok === false) throw new Error(data.error || "Could not load records.");
			cachedRecords = normalizeRecords(data);
			renderLadderRecords(cachedRecords, showAll);
			return cachedRecords;
		} catch (error) {
			if (list) {
				list.className = "record-list empty";
				list.textContent = "World records could not load. Practice still works.";
			}
			return [];
		}
	}

	function getLocalRunState() {
		const local = window.MathRidgeLocal || {};
		const score = typeof local.getScore === "function" ? local.getScore() : Number(local.score || 0);
		const stage = typeof local.getStage === "function" ? local.getStage() : Number(local.stage || 1);
		return { score, stage };
	}

	function showLadderPopup() {
		const runBox = byId("ladderRunBox");
		const state = getLocalRunState();

		if (runBox) {
			runBox.innerHTML = `
				<div>Your Run</div>
				<div>Score: ${state.score}</div>
				<div>Stage: ${state.stage}</div>
				<div>Active Time: ${formatRaceTime(getTotalRaceMs())}</div>
			`;
		}

		document.body.classList.add("modal-open");
		const popup = byId("ladderPopup");
		if (popup) popup.style.display = "flex";
		loadLadderRecords(false);
	}

	function closeLadderPopup() {
		const popup = byId("ladderPopup");
		if (popup) popup.style.display = "none";
		document.body.classList.remove("modal-open");
	}

	async function submitWorldRecord(name, timeMs = getTotalRaceMs()) {
		const safeName = readOfficialCertificateName()
			|| cleanCertificateName(name, "")
			|| getPreferredCertificateName("Math Ridge Champion");
		const ms = Math.max(1, Math.round(Number(timeMs || getTotalRaceMs())));
		const timeSeconds = Math.max(1, Math.round(ms / 1000));

		try {
			const response = await fetch(getRecordUrl(), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					game: config.gameKey || defaultConfig.gameKey,
					name: safeName,
					timeSeconds,
					timeMs: ms,
					ms,
					timeDisplay: formatRaceTime(ms)
				})
			});

			const data = await response.json().catch(() => ({}));
			if (!response.ok || data.ok === false) throw new Error(data.error || "Could not save record.");
			cachedRecords = normalizeRecords(data);
			if (cachedRecords.length) renderLadderRecords(cachedRecords, true);
			return data;
		} catch (error) {
			return null;
		}
	}

	function rememberMountainTrailReturn() {
		try {
			sessionStorage.setItem("mathRidgeReturnView", "quest");
		} catch (error) {
			// Session storage may be unavailable in some embedded previews.
		}
	}

	function progressKey(kind, id = config.playId) {
		return `mathRidge_${kind}_${id}`;
	}

	function getProgressMeta(id = config.playId) {
		const fallback = {
			section: config.stageLabel || id.replace("_", "-"),
			title: config.stageLabel || "Math Ridge Trail",
			certificateTitle: config.stageLabel || "Math Ridge Trail",
			playFile: `${config.gameKey || "play"}.html`,
			nextId: ""
		};

		return Object.assign({}, fallback, progressMap[id] || {});
	}

	function saveTrailProgress(data = {}) {
		const id = data.id || config.playId;
		const meta = getProgressMeta(id);
		const now = data.completedAt || new Date().toISOString();
		const timeText = data.timeDisplay || data.raceTimeText || data.raceTime || formatRaceTime(getTotalRaceMs());
		const certData = {
			completed: true,
			id,
			section: data.section || meta.section,
			title: data.title || meta.title,
			certificateTitle: data.certificateTitle || meta.certificateTitle,
			playFile: data.playFile || meta.playFile,
			studentName: resolveCertificateName(data.studentName || data.name),
			completedAt: now,
			displayDate: data.displayDate || data.formattedDate || "",
			displayTime: data.displayTime || data.formattedTime || "",
			score: data.score,
			stage: data.stage,
			timeDisplay: timeText,
			raceTime: timeText,
			rank: data.rank || null,
			rankText: data.rankText || data.rankMessage || ""
		};

		try {
			localStorage.setItem(progressKey("playComplete", id), "true");
			localStorage.setItem(progressKey("cert", id), JSON.stringify(certData));

			if (meta.nextId) {
				localStorage.setItem(progressKey("noteUnlocked", meta.nextId), "true");
				localStorage.setItem(progressKey("stageUnlocked", meta.nextId), "true");
			}
		} catch (error) {
			// Local storage can be blocked in private or embedded previews.
		}

		return certData;
	}

	function readTrailCertificate(id = config.playId) {
		try {
			return JSON.parse(localStorage.getItem(progressKey("cert", id)));
		} catch (error) {
			return null;
		}
	}

	function getProgressThemeNameByScore(score) {
		score = Number(score || 0);
		if (score >= 7) return "purple";
		if (score >= 4) return "blue";
		return "neutral";
	}

	function applyProgressThemeByScore(score, delayed = false) {
		const track = byId("turtleTrack") || document.querySelector(".turtle-track");
		if (!track) return;

		const apply = () => {
			track.classList.remove("theme-neutral", "theme-blue", "theme-purple");
			track.classList.add(`theme-${getProgressThemeNameByScore(score)}`);
		};

		if (delayed) {
			track.classList.add("theme-transitioning");
			window.setTimeout(() => {
				apply();
				window.setTimeout(() => track.classList.remove("theme-transitioning"), 320);
			}, 300);
		} else {
			apply();
		}
	}

	function ensureProgressPieces(track) {
		if (!track) return;
		if (!track.querySelector(".progress-fill")) {
			track.insertAdjacentHTML("afterbegin", '<div class="progress-fill"></div>');
		}
		if (!track.querySelector(".progress-turtle")) {
			track.insertAdjacentHTML("beforeend", '<div class="progress-turtle">🐢</div>');
		}
	}

	function reviveProgressTurtle(track = byId("turtleTrack")) {
		const turtle = track?.querySelector?.(".progress-turtle");
		if (!turtle) return;
		turtle.classList.remove("turtle-fade-away");
		turtle.style.removeProperty("animation");
		turtle.style.removeProperty("opacity");
		turtle.style.removeProperty("transform");
	}

	function updateShelf(scoreOrOptions = {}, maybeStage, maybeProgressPercent) {
		const options = typeof scoreOrOptions === "object"
			? scoreOrOptions
			: { score: scoreOrOptions, stage: maybeStage, progressPercent: maybeProgressPercent };

		const score = Number(options.score || 0);
		const stage = Number(options.stage || 1);
		const progressPercent = clampNumber(options.progressPercent, 0, 100);

		const scoreText = byId("scoreText");
		if (scoreText) scoreText.textContent = `Score: ${score}`;

		const stageText = byId("stageText");
		if (stageText) stageText.textContent = `Stage: ${stage}`;

		const track = byId("turtleTrack");
		if (track) {
			track.style.setProperty("--progress", `${progressPercent}%`);
			ensureProgressPieces(track);
			if (options.reviveTurtle || options.resetTurtle) reviveProgressTurtle(track);
			applyProgressThemeByScore(score, Boolean(options.delayedTheme));
		}

		if (options.message) setStatusMessage(options.message);
	}

	function drawRoundedRect(ctx, x, y, width, height, radius) {
		const safeRadius = Math.min(radius, width / 2, height / 2);
		ctx.beginPath();
		ctx.moveTo(x + safeRadius, y);
		ctx.lineTo(x + width - safeRadius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
		ctx.lineTo(x + width, y + height - safeRadius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
		ctx.lineTo(x + safeRadius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
		ctx.lineTo(x, y + safeRadius);
		ctx.quadraticCurveTo(x, y, x + safeRadius, y);
		ctx.closePath();
	}

	function wrapCanvasLines(ctx, text, maxWidth) {
		const words = String(text || "").trim().split(/\s+/).filter(Boolean);
		const lines = [];
		let line = "";

		words.forEach(word => {
			const test = line ? `${line} ${word}` : word;
			if (ctx.measureText(test).width > maxWidth && line) {
				lines.push(line);
				line = word;
			} else {
				line = test;
			}
		});

		if (line) lines.push(line);
		return lines.length ? lines : [""];
	}

	function drawCenteredCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
		const lines = wrapCanvasLines(ctx, text, maxWidth).slice(0, maxLines);
		lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
		return y + Math.max(0, lines.length - 1) * lineHeight;
	}

	function setCanvasFont(ctx, { style = "", weight = "", size = 32, family = CERT_SERIF } = {}) {
		ctx.font = [style, weight, `${Math.round(size)}px`, family].filter(Boolean).join(" ");
	}

	function fitCanvasFont(ctx, text, { style = "", weight = "", maxSize = 64, minSize = 28, family = CERT_SERIF, maxWidth = 900 } = {}) {
		let size = maxSize;
		do {
			setCanvasFont(ctx, { style, weight, size, family });
			if (ctx.measureText(String(text || "")).width <= maxWidth || size <= minSize) break;
			size -= 2;
		} while (size >= minSize);
		return size;
	}

	function drawFittedCenteredText(ctx, text, x, y, maxWidth, options = {}) {
		const size = fitCanvasFont(ctx, text, { ...options, maxWidth });
		ctx.fillText(String(text || ""), x, y);
		return { size, y };
	}

	function loadOfficialCertificateTemplate() {
		if (officialCertificateTemplateImage?.complete && officialCertificateTemplateImage.naturalWidth) {
			return Promise.resolve(officialCertificateTemplateImage);
		}

		if (officialCertificateTemplatePromise) return officialCertificateTemplatePromise;

		officialCertificateTemplatePromise = new Promise((resolve, reject) => {
			const image = new Image();
			image.decoding = "async";
			image.onload = () => {
				officialCertificateTemplateImage = image;
				resolve(image);
			};
			image.onerror = reject;
			image.src = OFFICIAL_CERTIFICATE_TEMPLATE.src;
		});

		return officialCertificateTemplatePromise;
	}

	function waitForCertificateFonts() {
		try {
			if (document.fonts?.ready) return document.fonts.ready.catch(() => {});
		} catch (error) {}
		return Promise.resolve();
	}

	function prepareOfficialCertificatePopup() {
		const border = document.querySelector("#certificateCard .cert-border");
		if (!border) return;

		border.classList.add("prefilled-certificate-template");
		const title = String(border.querySelector("h3")?.textContent || "Math Ridge Achievement").trim();
		let stageLine = border.querySelector("#certStage");
		if (!stageLine) {
			stageLine = document.createElement("div");
			stageLine.id = "certStage";
			stageLine.className = "cert-stage";
			const firstDate = border.querySelector(".cert-date, .cert-rank, .cert-signature");
			if (firstDate) border.insertBefore(stageLine, firstDate);
			else border.appendChild(stageLine);
		} else {
			stageLine.classList.add("cert-stage");
		}

		if (!stageLine.textContent.trim()) {
			stageLine.textContent = `Academic Focus: ${title}`;
		}
	}

	function drawCertificateCorner(ctx, x, y, flipX = 1, flipY = 1) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(flipX, flipY);
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = "rgba(112, 69, 27, 0.58)";
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(96, 0);
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 96);
		ctx.stroke();

		ctx.strokeStyle = "rgba(200, 150, 55, 0.68)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(18, 18);
		ctx.lineTo(82, 18);
		ctx.moveTo(18, 18);
		ctx.lineTo(18, 82);
		ctx.moveTo(38, 36);
		ctx.lineTo(68, 36);
		ctx.moveTo(36, 38);
		ctx.lineTo(36, 68);
		ctx.stroke();

		ctx.fillStyle = "rgba(200, 150, 55, 0.46)";
		ctx.beginPath();
		ctx.arc(18, 18, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}

	function drawOfficialCertificateBackground(ctx, width, height) {
		const parchment = ctx.createLinearGradient(0, 0, 0, height);
		parchment.addColorStop(0, "#fffaf0");
		parchment.addColorStop(0.34, "#f8e7bd");
		parchment.addColorStop(0.68, "#edd39b");
		parchment.addColorStop(1, "#fff3cf");
		ctx.fillStyle = parchment;
		ctx.fillRect(0, 0, width, height);

		ctx.save();
		ctx.globalAlpha = 0.12;
		for (let i = 0; i < 820; i++) {
			const x = (i * 73) % width;
			const y = (i * 41) % height;
			const size = 0.8 + ((i * 17) % 9) / 10;
			ctx.fillStyle = i % 3 === 0 ? "#7d4f1d" : "#c89637";
			ctx.fillRect(x, y, size, size);
		}
		ctx.restore();

		ctx.save();
		ctx.translate(width / 2, height / 2);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "rgba(88, 55, 22, 0.042)";
		ctx.font = "bold 315px Georgia, serif";
		ctx.fillText("MR", 0, 54);
		ctx.restore();
	}

	function drawOfficialCertificateFrame(ctx, width, height) {
		ctx.save();
		drawRoundedRect(ctx, 44, 44, width - 88, height - 88, 28);
		ctx.lineWidth = 18;
		ctx.strokeStyle = "#c89637";
		ctx.stroke();

		drawRoundedRect(ctx, 82, 82, width - 164, height - 164, 18);
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#70451b";
		ctx.stroke();

		drawRoundedRect(ctx, 112, 112, width - 224, height - 224, 12);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(112, 69, 27, 0.44)";
		ctx.stroke();

		ctx.strokeStyle = "rgba(200, 150, 55, 0.72)";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(260, 126);
		ctx.lineTo(width - 260, 126);
		ctx.moveTo(260, height - 126);
		ctx.lineTo(width - 260, height - 126);
		ctx.stroke();

		drawCertificateCorner(ctx, 126, 126, 1, 1);
		drawCertificateCorner(ctx, width - 126, 126, -1, 1);
		drawCertificateCorner(ctx, 126, height - 126, 1, -1);
		drawCertificateCorner(ctx, width - 126, height - 126, -1, -1);
		ctx.restore();
	}

	function drawOfficialCertificateSeal(ctx, x, y, radius) {
		ctx.save();
		const seal = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 4, x, y, radius);
		seal.addColorStop(0, "#fff6cf");
		seal.addColorStop(0.46, "#f2b84b");
		seal.addColorStop(1, "#8c551d");
		ctx.fillStyle = seal;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#70451b";
		ctx.stroke();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(255, 247, 232, 0.72)";
		ctx.beginPath();
		ctx.arc(x, y, radius - 11, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = "#4d2d12";
		ctx.font = `bold ${Math.round(radius * 0.72)}px Georgia, serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("MR", x, y + 1);
		ctx.restore();
	}

	function createOfficialCertificateCanvas(options = {}) {
		const canvas = document.createElement("canvas");
		const templateImage = options.templateImage || officialCertificateTemplateImage;
		canvas.width = Number(options.width || templateImage?.naturalWidth || OFFICIAL_CERTIFICATE_TEMPLATE.width);
		canvas.height = Number(options.height || templateImage?.naturalHeight || OFFICIAL_CERTIFICATE_TEMPLATE.height);
		const ctx = canvas.getContext("2d");
		const width = canvas.width;
		const height = canvas.height;
		const studentName = cleanCertificateName(options.studentName || options.name, "Math Ridge Champion");
		const certificateTitle = String(options.certificateTitle || "Math Ridge Achievement").trim();
		const dateText = String(options.dateText || options.date || "").trim();
		const focusText = String(options.focusText || options.stageText || `Academic Focus: ${certificateTitle}`).trim();
		const completedText = dateText
			? (/^completed/i.test(dateText) ? dateText : `Completed on ${dateText}`)
			: "";
		const bodyText = Array.isArray(options.bodyLines)
			? options.bodyLines.join(" ")
			: String(options.bodyText || options.bodyLines || "for demonstrating understanding, persistence, and careful mathematical reasoning.");

		if (templateImage?.complete && templateImage.naturalWidth) {
			ctx.drawImage(templateImage, 0, 0, width, height);
		} else {
			drawOfficialCertificateBackground(ctx, width, height);
			drawOfficialCertificateFrame(ctx, width, height);
			drawOfficialCertificateSeal(ctx, width / 2, Math.round(height * 0.137), 50);
		}

		ctx.textAlign = "center";
		ctx.textBaseline = "alphabetic";
		ctx.shadowColor = "rgba(255,255,255,0.72)";
		ctx.shadowBlur = 5;
		ctx.fillStyle = "#4f351c";
		const titleSize = fitCanvasFont(ctx, certificateTitle.toUpperCase(), {
			weight: "700",
			maxSize: width * 0.034,
			minSize: width * 0.023,
			family: CERT_SERIF,
			maxWidth: width * 0.70
		});
		setCanvasFont(ctx, {
			weight: "700",
			size: titleSize,
			family: CERT_SERIF
		});
		drawCenteredCanvasText(ctx, certificateTitle.toUpperCase(), width / 2, height * 0.365, width * 0.70, height * 0.034, 2);

		ctx.fillStyle = "#4d2d12";
		ctx.shadowColor = "rgba(255,255,255,0.70)";
		ctx.shadowBlur = 8;
		const nameFont = drawFittedCenteredText(ctx, studentName, width / 2, height * 0.525, width * 0.70, {
			style: "italic",
			weight: "400",
			maxSize: width * 0.082,
			minSize: width * 0.046,
			family: CERT_SCRIPT
		});
		const nameEnd = nameFont.y;
		ctx.shadowBlur = 0;

		ctx.strokeStyle = "rgba(143, 98, 30, 0.34)";
		ctx.lineWidth = Math.max(2, width * 0.002);
		ctx.beginPath();
		ctx.moveTo(width * 0.30, nameEnd + height * 0.028);
		ctx.lineTo(width * 0.70, nameEnd + height * 0.028);
		ctx.stroke();

		ctx.fillStyle = "#51341c";
		setCanvasFont(ctx, { style: "italic", weight: "500", size: width * 0.0235, family: CERT_SERIF });
		drawCenteredCanvasText(ctx, bodyText, width / 2, height * 0.620, width * 0.68, height * 0.030, 3);

		ctx.fillStyle = "#4f351c";
		const focusLine = focusText.toUpperCase();
		const focusSize = fitCanvasFont(ctx, focusLine, {
			weight: "700",
			maxSize: width * 0.021,
			minSize: width * 0.015,
			family: CERT_SERIF,
			maxWidth: width * 0.72
		});
		setCanvasFont(ctx, { weight: "700", size: focusSize, family: CERT_SERIF });
		ctx.fillText(focusLine, width / 2, height * 0.704);

		ctx.fillStyle = "#51341c";
		setCanvasFont(ctx, { weight: "650", size: width * 0.022, family: CERT_SERIF });
		if (completedText) ctx.fillText(completedText, width / 2, height * 0.742);

		return canvas;
	}

	function saveCanvasImage(canvas, filename, mimeType) {
		try {
			const link = document.createElement("a");
			link.download = filename;
			link.href = canvas.toDataURL(mimeType, 0.96);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (error) {
			const imageUrl = canvas.toDataURL("image/png");
			const win = window.open("");
			if (win) {
				win.document.write(`<title>Math Ridge Certificate</title><img src="${imageUrl}" style="max-width:100%;">`);
			} else {
				alert("Certificate image was created, but the browser blocked the download. Please allow pop-ups or try again.");
			}
		}
	}

	function downloadOfficialCertificate(options = {}) {
		const filename = options.filename || options.fileName || "math-ridge-official-certificate.png";
		const mimeType = options.mimeType || "image/png";
		if (options.sound !== false) playCertificateSfx();

		if (officialCertificateTemplateImage?.complete && officialCertificateTemplateImage.naturalWidth) {
			const canvas = createOfficialCertificateCanvas(options);
			saveCanvasImage(canvas, filename, mimeType);
			return canvas;
		}

		return Promise.all([loadOfficialCertificateTemplate(), waitForCertificateFonts()])
			.then(([templateImage]) => {
				const canvas = createOfficialCertificateCanvas({ ...options, templateImage });
				saveCanvasImage(canvas, filename, mimeType);
				return canvas;
			})
			.catch(() => {
				const canvas = createOfficialCertificateCanvas(options);
				saveCanvasImage(canvas, filename, mimeType);
				return canvas;
			});
	}

	document.addEventListener("DOMContentLoaded", () => {
		["firstTap", "secondTap", "correct", "wrong", "relic", "certificatePaper", "certificateStamp", "certificateFanfare"].forEach(prepareSfx);
		loadOfficialCertificateTemplate().catch(() => {});
		waitForCertificateFonts();
		prepareOfficialCertificatePopup();
		preparePlayAmbience();
		ensureTrialMusicToggle();
		setupDoubleTapZoomGuard();
		updateTimerPanel();
		ensureTopNextClimbButton();
		hideNextClimbButton({ force: true });
		setupBottomDrawer();
		watchStepLocks();
		watchPlayerProfileNameInput();
	});

	document.addEventListener("pointerdown", event => {
		if (!pendingPlayAmbience) return;
		if (!event.target.closest("button, a, input, select, textarea, label")) return;
		retryPlayAmbience();
	}, { capture: true, passive: true });

	document.addEventListener("pointerdown", handleTrialControlPointerDown, { capture: true });
	document.addEventListener("click", handleTrialControlClick, { capture: true });
	document.addEventListener("pointerdown", handleNextClimbPointerDown, { capture: true, passive: true });
	document.addEventListener("click", handleNextClimbClick, { capture: true });

	window.addEventListener("pagehide", stopPlayAmbience);

	const api = {
		config,
		formatRaceTime,
		formatRaceSeconds,
		getCurrentClimbMs,
		getTotalRaceMs,
		updateTimerPanel,
		startClimbTimer,
		stopClimbTimer,
		startNextClimbTimer,
		resetRaceTimer,
		scrollToPremiumElement,
		openBottomDrawer,
		closeBottomDrawer,
		setStatusMessage,
		finishCorrectClimb,
		finishFinalCorrectRound,
		showNextClimbButton,
		hideNextClimbButton,
		loadLadderRecords,
		renderLadderRecords,
		showLadderPopup,
		closeLadderPopup,
		submitWorldRecord,
		rememberMountainTrailReturn,
		readPlayerProfile,
		readOfficialCertificateName,
		saveOfficialCertificateName,
		resolveCertificateName,
		getPreferredCertificateName,
		applyPlayerProfileToCertificateInput,
		getProgressMeta,
		saveTrailProgress,
		readTrailCertificate,
		getProgressThemeNameByScore,
		applyProgressThemeByScore,
		reviveProgressTurtle,
		updateShelf,
		playSfx,
		playPageAmbience,
		stopPlayAmbience,
		setTrialMusicEnabled,
		toggleTrialMusic,
		playCertificateSfx,
		createOfficialCertificateCanvas,
		downloadOfficialCertificate
	};

	window.MathRidgePlay = api;
	window.showLadderPopup = showLadderPopup;
	window.closeLadderPopup = closeLadderPopup;
	window.loadLadderRecords = loadLadderRecords;
	window.rememberMountainTrailReturn = rememberMountainTrailReturn;
})();
