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

	const progressMap = {
		"1_1": { section: "1-1", title: "Terms", certificateTitle: "Signed Term Structure", playFile: "play1.html", nextId: "1_2" },
		"1_2": { section: "1-2", title: "Team Terms", certificateTitle: "Positive and Negative Term Balance", playFile: "play2.html", nextId: "1_3" },
		"1_3": { section: "1-3", title: "Sign Simplify", certificateTitle: "Sign Simplification Fluency", playFile: "play3.html", nextId: "1_4" },
		"1_4": { section: "1-4", title: "Chunking", certificateTitle: "Distribution and Grouping Foundations", playFile: "play4.html", nextId: "2_1" },
		"2_1": { section: "2-1", title: "Fraction Shelves", certificateTitle: "Fraction Equivalence and Reduction", playFile: "play5.html", nextId: "2_2" },
		"2_2": { section: "2-2", title: "Prime Pieces", certificateTitle: "Prime Factorization Fluency", playFile: "play6.html", nextId: "2_3" },
		"2_3": { section: "2-3", title: "Fraction Products", certificateTitle: "Fraction Product Structure", playFile: "play7.html", nextId: "2_4" },
		"2_4": { section: "2-4", title: "Exponential Count", certificateTitle: "Exponential Pattern Recognition", playFile: "play8.html", nextId: "" }
	};

	let totalRaceMs = 0;
	let climbStartMs = null;
	let timerInterval = null;
	let cachedRecords = [];
	let premiumScrollTimer = null;
	let bottomDrawerCloseTimer = null;
	let armedBottomControl = null;
	let armedBottomControlTimer = null;
	let pendingExitTarget = null;
	let suppressBottomDrawerUntil = 0;

	function byId(id) {
		return document.getElementById(id);
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

	function getPreferredCertificateName(fallback = "Math Ridge Champion") {
		const profile = readPlayerProfile();
		const name = profile?.certificateName || profile?.nickname || fallback;
		return String(name || fallback).trim() || fallback;
	}

	function applyPlayerProfileToCertificateInput() {
		const profile = readPlayerProfile();
		const input = byId("playerNameInput");
		if (!profile || !input) return;

		input.value = getPreferredCertificateName();
		input.readOnly = true;
		input.classList.add("profile-locked-input");

		const label = document.querySelector('label[for="playerNameInput"]');
		if (label) label.textContent = "Story Profile Certificate Name";

		const note = document.querySelector("#namePopup .proof-note");
		if (note && !note.dataset.profileLocked) {
			note.dataset.profileLocked = "true";
			note.textContent = "Your official certificate and optional world record use the name sealed in your Story Profile.";
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
		const button = byId("nextClimbButton");
		if (!button) return false;

		if (!options.force && document.body.dataset.finalCorrectReady === "true") {
			return false;
		}

		document.body.dataset.finalCorrectReady = "false";
		button.dataset.finalCorrectReady = "false";
		button.classList.add("hidden", "locked-button");
		button.hidden = true;
		button.disabled = true;
		button.setAttribute("disabled", "disabled");
		button.setAttribute("aria-disabled", "true");
		button.style.removeProperty("display");
		button.style.removeProperty("visibility");
		button.style.removeProperty("pointer-events");
		button.style.removeProperty("opacity");
		return true;
	}

	function showNextClimbButton(options = {}) {
		const button = byId("nextClimbButton");
		if (!button) return false;

		const scroll = options.scroll !== false;
		document.body.dataset.finalCorrectReady = "true";
		button.dataset.finalCorrectReady = "true";
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

		if (scroll && isMobilePlayView()) {
			openBottomDrawer({ temporary: true, duration: 6200 });
		} else if (scroll) {
			window.setTimeout(() => scrollToPremiumElement("bottomControls", 18), 120);
		}

		return true;
	}

	function startClimbTimer(options = {}) {
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
		showNextClimbButton({ scroll: options.scroll !== false });
		return true;
	}

	function finishFinalCorrectRound(options = {}) {
		return finishCorrectClimb(options);
	}

	function scrollToPremiumElement(id, extraOffset = 14) {
		const element = byId(id);
		if (!element) return false;

		if (premiumScrollTimer) window.clearTimeout(premiumScrollTimer);
		premiumScrollTimer = window.setTimeout(() => {
			const shelf = document.querySelector(".challenge-board");
			const shelfHeight = shelf ? shelf.getBoundingClientRect().height : 0;
			const y = window.scrollY + element.getBoundingClientRect().top - shelfHeight - extraOffset;
			const mobile = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
			if (mobile) suppressBottomDrawerUntil = Date.now() + 900;
			window.scrollTo({ top: Math.max(0, y), behavior: mobile ? "auto" : "smooth" });
		}, 40);

		return true;
	}

	function isMobilePlayView() {
		return Boolean(window.matchMedia && window.matchMedia("(max-width: 760px)").matches);
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
		clearArmedBottomControl();
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
			if (href) window.location.href = href;
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
			armedBottomControlTimer = window.setTimeout(clearArmedBottomControl, 3400);
			return;
		}

		clearArmedBottomControl();
		if (isExitControl(target) && isActiveClimbRisk()) {
			event.preventDefault();
			event.stopImmediatePropagation();
			showExitConfirm(target);
		}
	}

	function setupBottomDrawer() {
		const controls = byId("bottomControls");
		if (!controls || controls.dataset.drawerReady === "true") return;
		controls.dataset.drawerReady = "true";
		document.body.classList.add("has-play-bottom-drawer");

		const tab = document.createElement("button");
		tab.type = "button";
		tab.className = "play-bottom-drawer-tab";
		tab.innerHTML = `<span>${getBottomDrawerTitle()}</span><strong>Controls</strong>`;
		tab.addEventListener("click", event => {
			event.preventDefault();
			if (controls.classList.contains("is-open")) closeBottomDrawer();
			else openBottomDrawer({ temporary: false });
		});
		controls.insertBefore(tab, controls.firstChild);

		let lastScrollY = window.scrollY;
		window.addEventListener("scroll", () => {
			const currentY = window.scrollY;
			if (isMobilePlayView() && Date.now() > suppressBottomDrawerUntil && currentY > lastScrollY + 8 && currentY > 80) {
				openBottomDrawer({ temporary: true });
			}
			lastScrollY = currentY;
		}, { passive: true });

		controls.addEventListener("focusin", () => openBottomDrawer({ temporary: false }));
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
		const safeName = getPreferredCertificateName(name || "Math Ridge Champion");
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
			studentName: data.studentName || data.name || getPreferredCertificateName(),
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

	document.addEventListener("DOMContentLoaded", () => {
		updateTimerPanel();
		hideNextClimbButton({ force: true });
		setupBottomDrawer();
		watchPlayerProfileNameInput();
	});

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
		getPreferredCertificateName,
		applyPlayerProfileToCertificateInput,
		getProgressMeta,
		saveTrailProgress,
		readTrailCertificate,
		getProgressThemeNameByScore,
		applyProgressThemeByScore,
		reviveProgressTurtle,
		updateShelf
	};

	window.MathRidgePlay = api;
	window.showLadderPopup = showLadderPopup;
	window.closeLadderPopup = closeLadderPopup;
	window.loadLadderRecords = loadLadderRecords;
	window.rememberMountainTrailReturn = rememberMountainTrailReturn;
})();
