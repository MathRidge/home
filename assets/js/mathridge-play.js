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

	let totalRaceMs = 0;
	let climbStartMs = null;
	let timerInterval = null;
	let cachedRecords = [];

	function byId(id) {
		return document.getElementById(id);
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

		if (scroll) {
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

		window.setTimeout(() => {
			const shelf = document.querySelector(".challenge-board");
			const shelfHeight = shelf ? shelf.getBoundingClientRect().height : 0;
			const y = window.scrollY + element.getBoundingClientRect().top - shelfHeight - extraOffset;
			window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
		}, 30);

		return true;
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
		const safeName = String(name || "Math Ridge Champion").trim() || "Math Ridge Champion";
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
			applyProgressThemeByScore(score, Boolean(options.delayedTheme));
		}

		if (options.message) setStatusMessage(options.message);
	}

	document.addEventListener("DOMContentLoaded", () => {
		updateTimerPanel();
		hideNextClimbButton({ force: true });
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
		getProgressThemeNameByScore,
		applyProgressThemeByScore,
		updateShelf
	};

	window.MathRidgePlay = api;
	window.showLadderPopup = showLadderPopup;
	window.closeLadderPopup = closeLadderPopup;
	window.loadLadderRecords = loadLadderRecords;
	window.rememberMountainTrailReturn = rememberMountainTrailReturn;
})();
