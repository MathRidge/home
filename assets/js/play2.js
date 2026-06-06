/* Play 1-2 Local Game: Positive Negative Showdown
   Owns only the local game concept: term generation, sorting, totals,
   ring solving, scoring, certificate text/image, and Play2-specific states. */
(function () {
	"use strict";

	const shell = window.MathRidgePlay;
	const GLOBAL_RECORD_FALLBACK = "https://mathridge-play1-records.primelearning-math-kevin.workers.dev/?game=play2";

	let terms = [];
	let selectedTerm = null;
	let positiveTotal = 0;
	let negativeTotal = 0;
	let ringStep = 0;
	let selectedRingChoice = null;
	let ringData = {};
	let wrongAnswerCount = 0;
	let finalAnswerSign = null;
	let termStoneRelicActive = false;
	let manualOutsideSign = null;
	let manualOperation = null;

	let termCountComplete = false;
	let teamSortComplete = false;
	let positiveTotalComplete = false;
	let negativeTotalComplete = false;
	let ringFirstComplete = false;
	let ringSecondComplete = false;
	let finalAnswerCompleted = false;

	let turtleScore = 0;
	let stage = 1;
	let runCorrectCount = 0;
	let mistakesThisGame = 0;
	let gameScoreAwarded = false;
	let achievementShown = false;
	let confettiTimer = null;

	let latestRaceRank = null;
	let latestSavedRaceSeconds = null;

	const termBank = document.getElementById("termBank");
	const zones = document.querySelectorAll(".zone");
	const feedback = document.getElementById("feedback");

	function byId(id) {
		return document.getElementById(id);
	}

	function formatRaceTime(ms) {
		return shell ? shell.formatRaceTime(ms) : fallbackFormatRaceTime(ms);
	}

	function fallbackFormatRaceTime(ms) {
		const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	}

	function formatRaceSeconds(seconds) {
		return formatRaceTime(Number(seconds || 0) * 1000);
	}

	function getRaceMs() {
		return shell ? shell.getTotalRaceMs() : 0;
	}

	function startClimbTimer() {
		if (turtleScore >= 10) return;
		if (shell) shell.startClimbTimer({ hideNext: false });
	}

	function stopClimbTimer(addToTotal = true) {
		if (shell) shell.stopClimbTimer(addToTotal);
	}

	function resetRaceTimer() {
		latestRaceRank = null;
		latestSavedRaceSeconds = null;
		if (shell) shell.resetRaceTimer();
	}

	function showClimbGate() {
		stopClimbTimer(false);
		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.remove("hidden");
		if (playArea) playArea.classList.add("hidden");
		setChallengeMessage("Press START the Climb when you are ready.");
	}

	function startClimbFromGate() {
		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.add("hidden");
		if (playArea) playArea.classList.remove("hidden");

		if (!terms.length) {
			generateTerms();
			renderTerms();
		}

		setChallengeMessage(`Climb ${getRequiredProgressSteps()} clean steps to score.`);
		startClimbTimer();
		scrollToStepOneStart();
	}

	function rankText(rank) {
		if (rank === 1) return "🥇 1st Place World Time Champion";
		if (rank === 2) return "🥈 2nd Place World Time";
		if (rank === 3) return "🥉 3rd Place World Time";
		return "";
	}

	async function submitWorldRecord(name, timeMs) {
		if (shell && typeof shell.submitWorldRecord === "function") {
			const result = await shell.submitWorldRecord(name, timeMs);
			if (result) return result;
		}

		const timeSeconds = Math.max(1, Math.round(Number(timeMs || 0) / 1000));
		const response = await fetch(GLOBAL_RECORD_FALLBACK, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ game: "play2", name, timeSeconds })
		});

		const data = await response.json();
		if (!data.ok) throw new Error(data.error || "Could not save record.");
		return data;
	}

	function getProgressThemeForScore(scoreNumber) {
		if (shell && typeof shell.getProgressThemeNameByScore === "function") {
			return shell.getProgressThemeNameByScore(scoreNumber);
		}
		if (scoreNumber >= 7) return "purple";
		if (scoreNumber >= 4) return "blue";
		return "neutral";
	}

	function toggleMiniHelper(button) {
		const helper = button.closest(".mini-helper");
		if (!helper) return;

		const isExpanded = helper.classList.toggle("focus-expanded");
		helper.classList.toggle("focus-collapsed", !isExpanded);
		button.textContent = isExpanded ? "Hide hint" : "Show hint";
	}

	function updateFocusHintMode() {
		const focusMode = turtleScore >= 4;

		document.querySelectorAll(".mini-helper").forEach(helper => {
			let toggle = helper.querySelector(".focus-hint-toggle");

			if (focusMode) {
				if (!toggle) {
					toggle = document.createElement("button");
					toggle.type = "button";
					toggle.className = "focus-hint-toggle";
					toggle.textContent = "Show hint";
					toggle.onclick = () => toggleMiniHelper(toggle);
					helper.insertBefore(toggle, helper.firstChild);
				}

				helper.classList.add("focus-collapsed");
				helper.classList.remove("focus-expanded");
				toggle.textContent = "Show hint";
				toggle.style.display = "inline-block";
			} else {
				helper.classList.remove("focus-collapsed", "focus-expanded");
				if (toggle) toggle.style.display = "none";
			}
		});

		const ringHint = document.querySelector("#ringHint .hint-text");
		if (ringHint && focusMode) {
			const holder = byId("ringHint");
			let toggle = holder ? holder.querySelector(".focus-hint-toggle") : null;

			if (holder && !toggle) {
				toggle = document.createElement("button");
				toggle.type = "button";
				toggle.className = "focus-hint-toggle";
				toggle.textContent = "Show hint";
				toggle.onclick = () => {
					ringHint.classList.toggle("focus-hint-hidden");
					toggle.textContent = ringHint.classList.contains("focus-hint-hidden") ? "Show hint" : "Hide hint";
				};
				holder.insertBefore(toggle, ringHint);
			}

			ringHint.classList.add("focus-hint-hidden");
		}
	}

	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getRequiredProgressSteps() {
		// Term count + confirmed sorting + positive total + negative total
		// + two ring setup steps + final ring answer.
		return terms.length > 0 ? 7 : 7;
	}

	function getTermCountRange() {
		if (turtleScore <= 3) return { minTerms: 4, maxTerms: 5 };
		if (turtleScore <= 6) return { minTerms: 5, maxTerms: 6 };
		return { minTerms: 6, maxTerms: 7 };
	}

	function getDifficultyRange() {
		if (turtleScore <= 3) return { minTotal: 2, maxTotal: 18, minValue: 1, maxValue: 7 };
		if (turtleScore <= 6) return { minTotal: 3, maxTotal: 24, minValue: 1, maxValue: 9 };
		return { minTotal: 5, maxTotal: 34, minValue: 2, maxValue: 12 };
	}

	function generateTerms() {
		const difficulty = getDifficultyRange();
		const termRange = getTermCountRange();
		let safety = 0;

		while (safety < 1000) {
			safety++;
			const result = [];
			const termCount = randomInt(termRange.minTerms, termRange.maxTerms);
			const positiveCount = randomInt(2, termCount - 2);
			const negativeCount = termCount - positiveCount;

			for (let i = 0; i < positiveCount; i++) {
				result.push(randomInt(difficulty.minValue, difficulty.maxValue));
			}

			for (let i = 0; i < negativeCount; i++) {
				result.push(-randomInt(difficulty.minValue, difficulty.maxValue));
			}

			result.sort(() => Math.random() - 0.5);

			const positiveTerms = result.filter(value => value > 0);
			const negativeTermSizes = result.filter(value => value < 0).map(value => Math.abs(value));
			const negativeSizeSet = new Set(negativeTermSizes);
			const posTotal = positiveTerms.reduce((sum, value) => sum + value, 0);
			const negTotal = negativeTermSizes.reduce((sum, value) => sum + value, 0);

			const positiveInRange = posTotal >= difficulty.minTotal && posTotal <= difficulty.maxTotal;
			const negativeInRange = negTotal >= difficulty.minTotal && negTotal <= difficulty.maxTotal;
			const notTie = posTotal !== negTotal;
			const noMatchingOppositeNumbers = positiveTerms.every(value => !negativeSizeSet.has(value));

			if (positiveInRange && negativeInRange && notTie && noMatchingOppositeNumbers) {
				terms = result;
				positiveTotal = posTotal;
				negativeTotal = -negTotal;
				return;
			}
		}

		terms = [4, -2, 3, -5, -1];
		positiveTotal = 7;
		negativeTotal = -8;
	}

	function scrollToPremiumElement(id, extraGap = 14, delay = 0) {
		window.setTimeout(() => {
			const element = byId(id);
			if (!element) return;
			if (element.classList && element.classList.contains("hidden")) return;

			if (shell) {
				shell.scrollToPremiumElement(id, extraGap);
				return;
			}

			const shelf = document.querySelector(".challenge-board");
			const shelfHeight = shelf ? shelf.getBoundingClientRect().height : 0;
			const y = window.scrollY + element.getBoundingClientRect().top - shelfHeight - extraGap;
			window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
		}, delay);
	}

	function scrollToStepOneStart() {
		scrollToPremiumElement("expressionBoard", 12, 0);
	}

	function scrollToBottomControls() {
		scrollToPremiumElement("bottomControls", 18, 0);
	}

	function scrollToCenter(id) {
		requestAnimationFrame(() => scrollToPremiumElement(id, 12, 80));
	}

	function formatSigned(value) {
		return value > 0 ? `+${value}` : `−${Math.abs(value)}`;
	}

	function formatExpressionLine() {
		return terms.map((value, index) => {
			const size = Math.abs(value);
			if (index === 0) return value < 0 ? `−${size}` : `${size}`;
			return value < 0 ? `−${size}` : `+${size}`;
		}).join("");
	}

	function renderExpressionLine() {
		const expressionLine = byId("expressionLine");
		if (expressionLine) expressionLine.textContent = formatExpressionLine();
	}

	function prepareTermCountInput() {
		const input = byId("termCountInput");
		if (!input) return;
		input.value = "";
		input.style.borderColor = "#b9dcff";
	}

	function checkTermCountFromInput() {
		startClimbTimer();
		if (termCountComplete) return;

		const input = byId("termCountInput");
		const countFeedback = byId("countFeedback");
		if (!input || !countFeedback) return;

		input.value = sanitizeDigitText(input.value);
		const choice = Number(input.value);

		if (!input.value || choice !== terms.length) {
			input.style.borderColor = "#ef7777";
			countFeedback.textContent = "Not yet. Count each signed number as one term.";
			countFeedback.className = "feedback bad-text";
			markMistake();
			return;
		}

		termCountComplete = true;
		input.style.borderColor = "#6cc070";
		countFeedback.textContent = "✅ Correct. Now the terms become movable objects.";
		countFeedback.className = "feedback good-text";
		byId("termBank")?.classList.remove("hidden");
		byId("sortStep")?.classList.remove("hidden");
		byId("zones")?.classList.remove("hidden");
		byId("confirmTeamsButton")?.classList.remove("hidden");
		markCorrectStep();
		scrollToCenter("sortStep");
	}

	function renderTerms() {
		renderExpressionLine();
		prepareTermCountInput();
		if (!termBank) return;
		termBank.innerHTML = "";

		terms.forEach(value => {
			const term = document.createElement("div");
			term.className = `term ${value > 0 ? "plus" : "minus"}`;
			term.dataset.value = String(value);
			term.textContent = formatSigned(value);
			term.onclick = event => {
				event.stopPropagation();
				selectTerm(term);
			};
			termBank.appendChild(term);
		});
	}

	function updateTurtleBoard() {
		const requiredSteps = getRequiredProgressSteps();
		const progressPercent = requiredSteps > 0
			? Math.min(100, Math.round((runCorrectCount / requiredSteps) * 100))
			: 0;

		if (shell) {
			shell.updateShelf({
				score: turtleScore,
				stage,
				progressPercent
			});
		} else {
			const scoreText = byId("scoreText");
			if (scoreText) scoreText.textContent = `Score: ${turtleScore}`;
			const stageText = byId("stageText");
			if (stageText) stageText.textContent = `Stage: ${stage}`;
			const turtleTrack = byId("turtleTrack");
			if (turtleTrack) {
				turtleTrack.style.setProperty("--progress", `${progressPercent}%`);
				turtleTrack.classList.remove("theme-neutral", "theme-blue", "theme-purple");
				turtleTrack.classList.add(`theme-${getProgressThemeForScore(turtleScore)}`);
				turtleTrack.innerHTML = '<div class="progress-fill"></div><div class="progress-turtle">🐢</div>';
			}
		}

		updateFocusHintMode();

		if (turtleScore >= 10) {
			setChallengeMessage("🎁 10 scores! Show your parent and save your certificate.");
			if (!achievementShown) showAchievementPopup();
		} else if (turtleScore >= 6) {
			setChallengeMessage("🏆 6 scores! You mastered this concept.");
		} else if (turtleScore >= 3) {
			setChallengeMessage("🌟 3 scores! You understand the concept.");
		}
	}

	function setChallengeMessage(message) {
		if (shell) {
			shell.setStatusMessage(message);
			return;
		}
		const challengeMessage = byId("challengeMessage");
		if (challengeMessage) challengeMessage.textContent = message;
	}

	function popScoreChange(text, type) {
		const scoreText = byId("scoreText");
		if (!scoreText) return;

		const pop = document.createElement("span");
		pop.className = `score-pop ${type === "plus" ? "plus-pop" : "minus-pop"}`;
		pop.textContent = text;
		scoreText.appendChild(pop);

		window.setTimeout(() => pop.remove(), 2100);
	}

	function shakeScoreBoard() {
		const board = document.querySelector(".challenge-board");
		if (!board) return;

		board.classList.remove("shake-board");
		void board.offsetWidth;
		board.classList.add("shake-board");
		window.setTimeout(() => board.classList.remove("shake-board"), 500);
	}

	function fadeCompletionTurtle() {
		const turtle = document.querySelector(".progress-turtle");
		if (!turtle) return;

		turtle.classList.remove("turtle-fade-away");
		void turtle.offsetWidth;
		turtle.classList.add("turtle-fade-away");
	}

	function resetNextClimbForNewPlay2Round() {
		finalAnswerCompleted = false;
		document.body.dataset.play2FinalAnswerCorrect = "false";
		if (shell) return shell.hideNextClimbButton({ force: true });
		return false;
	}

	function markCorrectStep() {
		if (finalAnswerCompleted) return;
		runCorrectCount = Math.min(getRequiredProgressSteps(), runCorrectCount + 1);

		if (mistakesThisGame === 0) {
			setChallengeMessage("Good. Keep the turtle moving. Finish the bar without a mistake.");
		} else {
			setChallengeMessage("Keep going. This climb had a mistake, so finish it for practice, then use Next Climb for a new scoring chance.");
		}

		updateTurtleBoard();
	}

	function markMistake() {
		if (finalAnswerCompleted) return;
		shell?.playSfx?.("wrong");

		// Match the original Play2 timing behavior: a mistake clears the active
		// progress run and banks the time already spent. The timer starts again
		// on the next student action.
		stopClimbTimer(true);
		mistakesThisGame++;
		runCorrectCount = 0;
		let lostScoreNow = false;

		if (mistakesThisGame > 1 && turtleScore > 0) {
			turtleScore--;
			lostScoreNow = true;
			setChallengeMessage("Second mistake in the same game. Turtle loses 1 score, but score cannot go below 0.");
		} else if (mistakesThisGame > 1) {
			setChallengeMessage("Second mistake in the same game. Score is already 0, so keep practicing without losing more.");
		} else {
			setChallengeMessage("Mistake made. Progress bar cleared. This climb cannot earn a score now, but finish it to unlock Next Climb.");
		}

		updateTurtleBoard();
		shakeScoreBoard();

		if (lostScoreNow) popScoreChange("−1", "minus");
	}

	function resetChallenge() {
		turtleScore = 0;
		stage = 1;
		runCorrectCount = 0;
		mistakesThisGame = 0;
		gameScoreAwarded = false;
		achievementShown = false;
		resetRaceTimer();
		resetNextClimbForNewPlay2Round();
		stopConfetti();
		generateTerms();
		renderTerms();
		resetGame({ keepClimbProgress: false });
		setChallengeMessage("Press START the Climb when you are ready.");
		updateTurtleBoard();
		showClimbGate();
	}

	function startConfetti() {
		const layer = byId("confettiLayer");
		if (!layer) return;

		const colors = ["#ffd36e", "#86c7ff", "#ff8fab", "#95d5b2", "#cdb4db"];
		stopConfetti();

		confettiTimer = window.setInterval(() => {
			for (let i = 0; i < 8; i++) {
				const piece = document.createElement("div");
				piece.className = "confetti-piece";
				piece.style.left = `${Math.random() * 100}%`;
				piece.style.background = colors[Math.floor(Math.random() * colors.length)];
				piece.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
				layer.appendChild(piece);
				window.setTimeout(() => piece.remove(), 5200);
			}
		}, 180);
	}

	function stopConfetti() {
		if (confettiTimer) {
			window.clearInterval(confettiTimer);
			confettiTimer = null;
		}

		const layer = byId("confettiLayer");
		if (layer) layer.innerHTML = "";
	}

	function selectTerm(term) {
		if (teamSortComplete || term?.getAttribute("aria-disabled") === "true") return;
		startClimbTimer();
		if (!termCountComplete) {
			const countFeedback = byId("countFeedback");
			if (countFeedback) {
				countFeedback.textContent = "Count the terms first. Then the pieces can move.";
				countFeedback.className = "feedback bad-text";
			}
			return;
		}

		document.querySelectorAll(".term").forEach(item => item.classList.remove("selected"));
		selectedTerm = term;
		term.classList.add("selected");
		if (feedback) {
			feedback.textContent = "Now tap Positive Team or Negative Team.";
			feedback.className = "feedback";
		}
	}

	function attachTermBankAndZoneEvents() {
		if (termBank) {
			termBank.addEventListener("click", () => {
				if (teamSortComplete) return;
				if (selectedTerm) startClimbTimer();
				if (!selectedTerm) {
					if (feedback) feedback.textContent = "Tap a number first.";
					return;
				}

				termBank.appendChild(selectedTerm);
				selectedTerm.classList.remove("selected");
				selectedTerm = null;
				if (feedback) feedback.textContent = "Moved back to the middle.";
				updateTeamConfirmState();
			});
		}

		zones.forEach(zone => {
			zone.addEventListener("click", () => {
				if (teamSortComplete) return;
				if (selectedTerm) startClimbTimer();
				if (!selectedTerm) {
					if (feedback) feedback.textContent = "Tap a number first.";
					return;
				}

				const value = Number(selectedTerm.dataset.value);
				const tappedZone = zone.dataset.zone;
				const target = tappedZone === "plus" ? byId("plusTeam") : byId("minusTeam");
				if (!target) return;

				target.appendChild(selectedTerm);
				selectedTerm.classList.remove("selected");
				selectedTerm = null;

				if (feedback) {
					feedback.textContent = "Placed. You can still move it before confirming.";
					feedback.className = "feedback";
				}
				updateTeamConfirmState();
			});
		});
	}

	function getTeamValues(teamId) {
		const team = byId(teamId);
		if (!team) return [];
		return [...team.querySelectorAll(".term")].map(term => Number(term.dataset.value));
	}

	function checkIfSortingFinished() {
		const placedCount = getTeamValues("plusTeam").length + getTeamValues("minusTeam").length;

		if (placedCount === terms.length) {
			if (feedback) {
				feedback.textContent = "All terms are placed. Double tap Confirm Teams when you are ready.";
				feedback.className = "feedback good-text";
			}
		}
	}

	function updateTeamConfirmState() {
		const button = byId("confirmTeamsButton");
		if (!button || teamSortComplete) return;
		const placedCount = getTeamValues("plusTeam").length + getTeamValues("minusTeam").length;
		const ready = placedCount === terms.length;
		button.disabled = !ready;
		button.classList.toggle("locked-button", !ready);
		button.setAttribute("aria-disabled", ready ? "false" : "true");
		checkIfSortingFinished();
	}

	function lockSortedTeams() {
		byId("sortStep")?.classList.add("is-locked");
		document.querySelectorAll("#termBank .term, #zones .term").forEach(term => {
			term.classList.remove("selected");
			term.setAttribute("aria-disabled", "true");
		});
		const button = byId("confirmTeamsButton");
		if (button) {
			button.disabled = true;
			button.setAttribute("aria-disabled", "true");
			button.classList.add("is-locked");
		}
		selectedTerm = null;
	}

	function confirmTeams() {
		startClimbTimer();
		if (teamSortComplete) return;
		const plusValues = getTeamValues("plusTeam");
		const minusValues = getTeamValues("minusTeam");
		const placedCount = plusValues.length + minusValues.length;
		if (placedCount !== terms.length) {
			if (feedback) {
				feedback.textContent = "Place every term before confirming the teams.";
				feedback.className = "feedback warning-text";
			}
			return;
		}

		const wrongPlus = plusValues.some(value => value < 0);
		const wrongMinus = minusValues.some(value => value > 0);
		if (wrongPlus || wrongMinus) {
			if (feedback) {
				feedback.textContent = "Not yet. Check the signs, move anything misplaced, then confirm again.";
				feedback.className = "feedback bad-text";
			}
			markMistake();
			return;
		}

		teamSortComplete = true;
		lockSortedTeams();
		if (feedback) {
			feedback.textContent = "Correct sorting. Now add the positive team total.";
			feedback.className = "feedback good-text";
		}
		markCorrectStep();
		renderMiniList("positiveMiniList", plusValues);
		byId("positiveTotalStep")?.classList.remove("hidden");
		scrollToCenter("positiveTotalStep");
		window.setTimeout(() => byId("positiveInput")?.focus(), 450);
	}

	function renderMiniList(containerId, values) {
		const container = byId(containerId);
		if (!container) return;
		container.innerHTML = "";

		values.forEach(value => {
			const mini = document.createElement("div");
			mini.className = `mini-term ${value > 0 ? "plus" : "minus"}`;
			mini.textContent = formatSigned(value);
			container.appendChild(mini);
		});

		updateFocusHintMode();
	}

	function sanitizeDigitText(raw) {
		return String(raw || "").replace(/[^0-9]/g, "");
	}

	function getExpectedManualSize(inputId) {
		if (inputId !== "manualFirstSize" && inputId !== "manualSecondSize") return 0;
		const biggerSize = Math.max(positiveTotal, Math.abs(negativeTotal));
		const smallerSize = Math.min(positiveTotal, Math.abs(negativeTotal));
		return inputId === "manualFirstSize" ? biggerSize : smallerSize;
	}

	function trimManualSizeInput(input) {
		const expectedSize = getExpectedManualSize(input.id);
		if (!expectedSize) return;
		const expectedDigits = String(expectedSize).length;
		input.value = input.value.slice(0, expectedDigits);
		if (input.id === "manualFirstSize" && input.value.length >= expectedDigits) {
			byId("manualSecondSize")?.focus();
		}
	}

	function setupMathInputFiltering() {
		document.addEventListener("input", event => {
			if (!event.target.classList) return;

			if (event.target.matches("input") && byId("playArea") && !byId("playArea").classList.contains("hidden")) {
				startClimbTimer();
			}

			if (event.target.classList.contains("count-input")) {
				event.target.value = sanitizeDigitText(event.target.value);
				return;
			}

			if (event.target.classList.contains("size-input")) {
				event.target.value = sanitizeDigitText(event.target.value);
				trimManualSizeInput(event.target);

				if (event.target.id === "positiveInput") {
					updateSizePreview("positiveInput", "positivePreviewSize", "positivePreview");
				}

				if (event.target.id === "negativeInput") {
					updateSizePreview("negativeInput", "negativePreviewSize", "negativePreview");
				}

				if (event.target.id === "ringAnswerSize") {
					updateFinalAnswerPreview();
				}

				if (event.target.id === "manualFirstSize" || event.target.id === "manualSecondSize") {
					updateManualRingPreview();
				}
			}
		});

		document.addEventListener("keydown", event => {
			if (event.key !== "Enter") return;

			if (event.target.id === "termCountInput") checkTermCountFromInput();
			if (event.target.id === "positiveInput") checkPositiveTotal();
			if (event.target.id === "negativeInput") checkNegativeTotal();
			if (event.target.id === "ringAnswerSize") checkRingAnswer();
		});
	}

	function updateSizePreview(inputId, previewSizeId, previewId) {
		const input = byId(inputId);
		const previewSize = byId(previewSizeId);
		const preview = byId(previewId);
		if (!input || !previewSize || !preview) return;

		const value = sanitizeDigitText(input.value);
		input.value = value;
		previewSize.textContent = value || "__";
		preview.classList.toggle("filled", Boolean(value));
	}

	function checkPositiveTotal() {
		startClimbTimer();
		if (positiveTotalComplete) return;

		const input = byId("positiveInput");
		const positiveFeedback = byId("positiveFeedback");
		if (!input || !positiveFeedback) return;

		updateSizePreview("positiveInput", "positivePreviewSize", "positivePreview");
		const answer = Number(input.value);

		if (input.value && answer === positiveTotal) {
			positiveTotalComplete = true;
			input.style.borderColor = "#6cc070";
			positiveFeedback.textContent = "✅ Correct. The positive team is ready.";
			positiveFeedback.className = "feedback good-text";
			markCorrectStep();
			renderMiniList("negativeMiniList", getTeamValues("minusTeam"));
			byId("negativeTotalStep")?.classList.remove("hidden");
			scrollToCenter("negativeTotalStep");
			window.setTimeout(() => byId("negativeInput")?.focus(), 450);
		} else {
			input.style.borderColor = "#ef7777";
			positiveFeedback.textContent = "Not yet. Add only the plus numbers, then type the size.";
			positiveFeedback.className = "feedback bad-text";
			markMistake();
		}
	}

	function checkNegativeTotal() {
		startClimbTimer();
		if (negativeTotalComplete) return;

		const input = byId("negativeInput");
		const negativeFeedback = byId("negativeFeedback");
		if (!input || !negativeFeedback) return;

		updateSizePreview("negativeInput", "negativePreviewSize", "negativePreview");
		const answerSize = Number(input.value);
		const correctSize = Math.abs(negativeTotal);

		if (input.value && answerSize === correctSize) {
			negativeTotalComplete = true;
			input.style.borderColor = "#6cc070";
			negativeFeedback.textContent = "✅ Correct. The negative team is ready.";
			negativeFeedback.className = "feedback good-text";
			markCorrectStep();
			startRingBuilder();
			scrollToCenter("ringBuilder");
		} else {
			input.style.borderColor = "#ef7777";
			negativeFeedback.textContent = "Not yet. Add the minus numbers, then type the size after the − sign.";
			negativeFeedback.className = "feedback bad-text";
			markMistake();
		}
	}

	function startRingBuilder() {
		ringStep = 1;
		ringFirstComplete = false;
		ringSecondComplete = false;
		finalAnswerSign = null;
		termStoneRelicActive = false;
		manualOutsideSign = null;
		manualOperation = null;

		ringData = {
			plus: { sign: "+", size: positiveTotal, value: positiveTotal },
			minus: { sign: "−", size: Math.abs(negativeTotal), value: negativeTotal },
			first: null,
			second: null
		};

		const ringBuilder = byId("ringBuilder");
		const totalButtons = byId("totalButtons");
		if (!ringBuilder || !totalButtons) return;

		ringBuilder.classList.remove("hidden");
		ringBuilder.classList.remove("relic-safe-step");
		byId("buildRing")?.classList.remove("hidden");
		byId("outsideSign").textContent = "?";
		byId("firstSize").textContent = "__";
		byId("ringOperation").textContent = "−";
		byId("secondSize").textContent = "__";
		byId("finalBuilt").textContent = "";

		totalButtons.innerHTML = `
			<div class="relic-assist-card" id="termStoneAssist">
				<img class="relic-assist-img" src="assets/images/relic/term_stone.png" alt="" loading="lazy" decoding="async">
				<div>
					<strong>Term Stone Support</strong>
					<span id="termStoneAssistText">Optional: let the Term Stone guide the bigger-first ring setup.</span>
				</div>
				<button type="button" class="relic-assist-button" onclick="useTermStoneRelic()">Use Relic</button>
			</div>
			<div class="ring-working-terms" aria-label="current signed totals for the ring">
				<span>Working with</span>
				<strong class="ring-working-term plus">${formatSigned(positiveTotal)}</strong>
				<strong class="ring-working-term minus">${formatSigned(negativeTotal)}</strong>
			</div>
			<div class="manual-ring-card" id="manualRingSetup">
				<h3>Manual Ring Build</h3>
				<p>Select the outside sign, select the inner operation, then type the bigger and smaller sizes.</p>
				<div class="manual-ring-row">
					<span>Outside sign</span>
					<button type="button" class="manual-sign-btn plus" onclick="selectManualOutsideSign('+', this)">+</button>
					<button type="button" class="manual-sign-btn minus" onclick="selectManualOutsideSign('−', this)">−</button>
				</div>
				<div class="manual-ring-row">
					<span>Inside operation</span>
					<button type="button" class="manual-op-btn" onclick="selectManualOperation('+', this)">+</button>
					<button type="button" class="manual-op-btn" onclick="selectManualOperation('-', this)">-</button>
				</div>
				<div class="manual-ring-inputs">
					<label>Bigger size<input id="manualFirstSize" class="size-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off"></label>
					<label>Smaller size<input id="manualSecondSize" class="size-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off"></label>
				</div>
				<button type="button" class="primary-action" onclick="checkManualRingSetup()">Check Ring Setup</button>
			</div>
			<div class="relic-total-row hidden" id="relicTotalChoices">
				<div class="total-choice plus" onclick="chooseRingNumber('plus', this)">+${positiveTotal}</div>
				<div class="total-choice minus" onclick="chooseRingNumber('minus', this)">−${Math.abs(negativeTotal)}</div>
			</div>
		`;

		if (feedback) {
			feedback.textContent = "🥊 Totals are ready. Build the ring.";
			feedback.className = "feedback good-text";
		}
	}

	function useTermStoneRelic() {
		if (ringStep !== 1 || finalAnswerCompleted) return;
		termStoneRelicActive = true;
		byId("manualRingSetup")?.classList.add("hidden");
		byId("relicTotalChoices")?.classList.remove("hidden");
		const card = byId("termStoneAssist");
		const text = byId("termStoneAssistText");
		const button = card?.querySelector("button");
		byId("ringBuilder")?.classList.add("relic-safe-step");
		card?.classList.add("is-active");
		if (text) text.textContent = "Relic active: pick the larger size first, then the other total. The ring will place itself.";
		if (button) {
			button.disabled = true;
			button.hidden = true;
			button.textContent = "Relic Active";
		}
		if (feedback) {
			feedback.textContent = "Term Stone is awake. Compare sizes only: larger first, smaller second.";
			feedback.className = "feedback good-text";
		}
		shell?.playSfx?.("relic");
	}

	function selectManualOutsideSign(sign, button) {
		manualOutsideSign = sign;
		document.querySelectorAll(".manual-sign-btn").forEach(btn => btn.classList.remove("selected"));
		button?.classList.add("selected");
		updateManualRingPreview();
		if (feedback) {
			feedback.textContent = "Outside sign selected. Now choose the inside operation and fill the sizes.";
			feedback.className = "feedback good-text";
		}
	}

	function selectManualOperation(operation, button) {
		manualOperation = operation;
		document.querySelectorAll(".manual-op-btn").forEach(btn => btn.classList.remove("selected"));
		button?.classList.add("selected");
		updateManualRingPreview();
		if (feedback) {
			feedback.textContent = "Operation selected. Fill both box sizes, then check the ring setup.";
			feedback.className = "feedback good-text";
		}
	}

	function updateManualRingPreview() {
		if (termStoneRelicActive || ringStep >= 3) return;
		const firstValue = sanitizeDigitText(byId("manualFirstSize")?.value || "");
		const secondValue = sanitizeDigitText(byId("manualSecondSize")?.value || "");
		if (manualOutsideSign) byId("outsideSign").textContent = manualOutsideSign;
		byId("ringOperation").textContent = manualOperation || "−";
		byId("firstSize").textContent = firstValue || "__";
		byId("secondSize").textContent = secondValue || "__";
	}

	function checkManualRingSetup() {
		const firstInput = byId("manualFirstSize");
		const secondInput = byId("manualSecondSize");
		if (!firstInput || !secondInput || finalAnswerCompleted || ringStep >= 3) return;
		startClimbTimer();

		const firstSize = Number(sanitizeDigitText(firstInput.value));
		const secondSize = Number(sanitizeDigitText(secondInput.value));
		firstInput.value = firstSize ? String(firstSize) : "";
		secondInput.value = secondSize ? String(secondSize) : "";

		const plusSize = positiveTotal;
		const minusSize = Math.abs(negativeTotal);
		const positiveLeads = plusSize >= minusSize;
		const correctSign = positiveLeads ? "+" : "−";
		const correctFirst = Math.max(plusSize, minusSize);
		const correctSecond = Math.min(plusSize, minusSize);
		const correctOperation = "-";

		if (!manualOutsideSign || !manualOperation || !firstInput.value || !secondInput.value) {
			if (feedback) {
				feedback.textContent = "Fill every part: outside sign, inside operation, bigger size, and smaller size.";
				feedback.className = "feedback warning-text";
			}
			return;
		}

		const correct = manualOutsideSign === correctSign
			&& manualOperation === correctOperation
			&& firstSize === correctFirst
			&& secondSize === correctSecond;

		if (!correct) {
			if (feedback) {
				feedback.textContent = "Not yet. Build it like the Term Stone would: bigger size first, smaller size second, subtract inside.";
				feedback.className = "feedback bad-text";
			}
			markMistake();
			return;
		}

		ringData.first = { sign: correctSign, size: correctFirst, value: positiveLeads ? positiveTotal : negativeTotal };
		ringData.second = { sign: positiveLeads ? "−" : "+", size: correctSecond, value: positiveLeads ? negativeTotal : positiveTotal };
		byId("outsideSign").textContent = correctSign;
		byId("firstSize").textContent = correctFirst;
		byId("ringOperation").textContent = correctOperation;
		byId("secondSize").textContent = correctSecond;
		byId("finalBuilt").innerHTML = "";

		byId("manualRingSetup")?.classList.add("is-locked");
		byId("manualRingSetup")?.querySelectorAll("button, input").forEach(control => {
			control.disabled = true;
			control.setAttribute("aria-disabled", "true");
		});

		if (!ringFirstComplete) {
			ringFirstComplete = true;
			markCorrectStep();
		}
		if (!ringSecondComplete) {
			ringSecondComplete = true;
			markCorrectStep();
		}
		if (feedback) {
			feedback.textContent = "Correct. You built the ring manually. Now simplify the term.";
			feedback.className = "feedback good-text";
		}
		showRingAnswerInput();
		ringStep = 3;
	}

	function chooseRingNumber(type, clickedButton) {
		const chosen = ringData[type];
		if (!chosen || finalAnswerCompleted) return;
		if (ringStep >= 3) return;
		startClimbTimer();

		const allChoices = document.querySelectorAll(".total-choice");
		if (termStoneRelicActive && (ringStep === 1 || ringStep === 2)) {
			const plusSize = positiveTotal;
			const minusSize = Math.abs(negativeTotal);
			const positiveLeads = plusSize >= minusSize;
			const firstType = positiveLeads ? "plus" : "minus";
			const secondType = positiveLeads ? "minus" : "plus";
			if (ringStep === 1) {
				if (type !== firstType) {
					allChoices.forEach(button => button.classList.remove("selected", "wrong-pick"));
					clickedButton.classList.add("wrong-pick");
					window.setTimeout(() => clickedButton.classList.remove("wrong-pick"), 450);
					if (feedback) {
						feedback.textContent = "Term Stone is looking for the bigger size first. Tap the larger total to begin.";
						feedback.className = "feedback good-text";
					}
					return;
				}
				selectedRingChoice = type;
				ringData.first = {
					sign: positiveLeads ? "+" : "−",
					size: Math.max(plusSize, minusSize),
					value: positiveLeads ? positiveTotal : negativeTotal
				};
				ringData.second = {
					sign: positiveLeads ? "−" : "+",
					size: Math.min(plusSize, minusSize),
					value: positiveLeads ? negativeTotal : positiveTotal
				};
				allChoices.forEach(button => {
					button.classList.remove("selected", "wrong-pick");
				});
				clickedButton.classList.add("selected");
				byId("outsideSign").textContent = ringData.first.sign;
				byId("firstSize").textContent = ringData.first.size;
				byId("ringOperation").textContent = "−";
				byId("secondSize").textContent = "__";
				byId("finalBuilt").innerHTML = "";
				if (!ringFirstComplete) {
					ringFirstComplete = true;
					markCorrectStep();
				}
				if (feedback) {
					feedback.textContent = `${chosen.sign}${chosen.size} leads. Now tap the smaller total to finish the ring.`;
					feedback.className = "feedback good-text";
				}
				ringStep = 2;
				return;
			}
			if (type === selectedRingChoice) {
				if (feedback) {
					feedback.textContent = "That total is already selected. Tap the other total to finish the relic setup.";
					feedback.className = "feedback good-text";
				}
				return;
			}
			if (type !== secondType) {
				if (feedback) {
					feedback.textContent = "The bigger size is already in the ring. Tap the smaller total next.";
					feedback.className = "feedback good-text";
				}
				return;
			}
			selectedRingChoice = firstType;
			allChoices.forEach(button => {
				const isUsed = button.getAttribute("onclick")?.includes(`'${firstType}'`) || button.getAttribute("onclick")?.includes(`'${secondType}'`);
				button.classList.toggle("selected", isUsed);
				button.classList.add("is-locked");
				button.setAttribute("aria-disabled", "true");
			});
			byId("outsideSign").textContent = ringData.first.sign;
			byId("firstSize").textContent = ringData.first.size;
			byId("ringOperation").textContent = "−";
			byId("secondSize").textContent = ringData.second.size;
			byId("finalBuilt").innerHTML = "";
			if (!ringFirstComplete) {
				ringFirstComplete = true;
				markCorrectStep();
			}
			if (!ringSecondComplete) {
				ringSecondComplete = true;
				markCorrectStep();
			}
			if (feedback) {
				feedback.textContent = `Term Stone placed the ring: ${ringData.first.sign}${ringData.first.size} leads, then ${ringData.second.size} goes inside.`;
				feedback.className = "feedback good-text";
			}
			showRingAnswerInput();
			ringStep = 3;
			return;
		}

		if (ringStep === 1) {
			allChoices.forEach(button => {
				button.classList.remove("selected");
				button.classList.remove("wrong-pick");
			});

			const otherType = type === "plus" ? "minus" : "plus";
			const other = ringData[otherType];

			if (chosen.size < other.size) {
				clickedButton.classList.add("wrong-pick");
				if (feedback) {
					feedback.textContent = termStoneRelicActive
						? `The Term Stone hums. ${chosen.sign}${chosen.size} is smaller, so choose the larger size first.`
						: `${chosen.sign}${chosen.size} is smaller. It cannot lead. Try the bigger total first.`;
					feedback.className = termStoneRelicActive ? "feedback good-text" : "feedback bad-text";
				}
				if (!termStoneRelicActive) markMistake();
				window.setTimeout(() => clickedButton.classList.remove("wrong-pick"), 500);
				return;
			}

			clickedButton.classList.add("selected");
			selectedRingChoice = type;
			ringData.first = chosen;
			ringData.second = other;
			byId("outsideSign").textContent = chosen.sign;
			byId("firstSize").textContent = chosen.size;
			byId("ringOperation").textContent = "−";
			byId("secondSize").textContent = "__";
			byId("finalBuilt").innerHTML = "";

			if (feedback) {
				feedback.textContent = `${chosen.sign}${chosen.size} leads. Its sign moves outside. Now place the other term next; it will subtract inside the ring.`;
				feedback.className = "feedback good-text";
			}

			if (!ringFirstComplete) {
				ringFirstComplete = true;
				markCorrectStep();
			}

			ringStep = 2;
			return;
		}

		if (ringStep === 2) {
			if (type === selectedRingChoice) {
				if (feedback) {
					feedback.textContent = "That number is already in the first spot. Tap the other total.";
					feedback.className = "feedback bad-text";
				}
				markMistake();
				return;
			}

			byId("secondSize").textContent = ringData.second.size;
			byId("ringOperation").textContent = "−";
			if (feedback) {
				feedback.textContent = "Great. Now simplify the term: choose + or -, then fill in the size.";
				feedback.className = "feedback good-text";
			}

			if (!ringSecondComplete) {
				ringSecondComplete = true;
				markCorrectStep();
			}

			allChoices.forEach(button => {
				button.classList.add("is-locked");
				button.setAttribute("aria-disabled", "true");
			});
			showRingAnswerInput();
			ringStep = 3;
		}
	}

	function showRingAnswerInput() {
		wrongAnswerCount = 0;
		finalAnswerSign = null;

		const finalBuilt = byId("finalBuilt");
		if (!finalBuilt) return;
		byId("step6RingSolve")?.classList.remove("relic-safe-step");

		finalBuilt.innerHTML = `
			<div id="step6RingSolve" class="final-answer-builder ring-solve-step ${termStoneRelicActive ? "relic-safe-step" : ""}">
				<h2>Step 6: Simplify the Term</h2>

				<div class="build-ring step6-ring-copy" aria-label="ring expression">
					<span>${ringData.first.sign}</span>
					<span class="ring-box">
						<span>${ringData.first.size}</span>
						<span class="inside-minus">−</span>
						<span>${ringData.second.size}</span>
					</span>
				</div>

				<p class="step-instruction">Choose the final sign, then type the size.</p>

				<div class="final-sign-choice" role="group" aria-label="choose final answer sign">
					<button type="button" id="chooseFinalPositive" class="sign-choice-card positive-choice" onclick="selectFinalAnswerSign('+')">+</button>
					<button type="button" id="chooseFinalNegative" class="sign-choice-card negative-choice" onclick="selectFinalAnswerSign('−')">−</button>
				</div>

				<div class="answer-size-row final-answer-entry">
					<span id="finalSignPreview" class="fixed-sign pending-sign">?</span>
					<input id="ringAnswerSize" class="size-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="size" aria-label="final answer size">
				</div>

				<div class="final-answer-preview-line">Final answer: <span id="finalAnswerPreview">__</span></div>
				<button class="primary-action" onclick="checkRingAnswer()">Check Answer</button>
				<div class="feedback" id="ringFeedback"></div>
				<div id="ringHint"></div>
			</div>
		`;

		byId("buildRing")?.classList.add("hidden");
		scrollToCenter("step6RingSolve");
		window.setTimeout(() => byId("ringAnswerSize")?.focus(), 120);
	}

	function selectFinalAnswerSign(sign) {
		if (finalAnswerCompleted) return;
		finalAnswerSign = sign;
		const preview = byId("finalSignPreview");
		const positive = byId("chooseFinalPositive");
		const negative = byId("chooseFinalNegative");
		const input = byId("ringAnswerSize");
		const ringFeedback = byId("ringFeedback");

		if (preview) {
			preview.textContent = sign;
			preview.classList.remove("pending-sign");
			preview.classList.toggle("positive-sign", sign === "+");
			preview.classList.toggle("negative-sign", sign === "−");
		}

		if (positive) positive.classList.toggle("selected", sign === "+");
		if (negative) negative.classList.toggle("selected", sign === "−");

		if (ringFeedback) {
			ringFeedback.textContent = "Now type the size.";
			ringFeedback.className = "feedback";
		}

		updateFinalAnswerPreview();
		if (input) input.focus();
	}

	function updateFinalAnswerPreview() {
		const preview = byId("finalAnswerPreview");
		const input = byId("ringAnswerSize");
		if (!preview || !input) return;

		const size = sanitizeDigitText(input.value);
		input.value = size;
		preview.textContent = finalAnswerSign && size ? `${finalAnswerSign}${size}` : "__";
	}

	function lockFinalAnswerStep() {
		const step = byId("step6RingSolve");
		if (!step) return;
		step.classList.add("is-locked");
		step.querySelectorAll("button, input").forEach(control => {
			control.disabled = true;
			control.setAttribute("aria-disabled", "true");
		});
	}

	function finishPlay2FinalAnswer(finalText, scroll = true) {
		finalAnswerCompleted = true;
		document.body.dataset.play2FinalAnswerCorrect = "true";
		lockFinalAnswerStep();

		const earnedScore = mistakesThisGame === 0;
		const message = earnedScore
			? `🏁 Climb finished. Final answer ${finalText} is correct. +1 score earned.`
			: `🏁 Climb finished. Final answer ${finalText} is correct. This run had a mistake, so no score point is added.`;

		if (turtleScore >= 10) {
			if (shell) {
				shell.stopClimbTimer(true);
				shell.hideNextClimbButton({ force: true });
				shell.setStatusMessage("🎁 10 scores! Save your certificate and continue to the next note.");
			}
			showAchievementPopup();
			return true;
		}

		if (shell) {
			shell.finishCorrectClimb({ message: `${message} Next Climb is ready.`, scroll });
		} else {
			setChallengeMessage(`${message} Next Climb is ready.`);
		}

		return true;
	}

	function checkRingAnswer() {
		startClimbTimer();
		if (finalAnswerCompleted) return;

		const input = byId("ringAnswerSize");
		const ringFeedback = byId("ringFeedback");
		const hintBox = byId("ringHint");
		if (!input) return;

		input.value = sanitizeDigitText(input.value);
		updateFinalAnswerPreview();

		const typedSize = Number(input.value);
		const correctSize = Math.abs(ringData.first.size - ringData.second.size);
		const correctSign = ringData.first.sign;

		if (!finalAnswerSign) {
			if (ringFeedback) {
				ringFeedback.textContent = "Warning! Be sure to choose a sign.";
				ringFeedback.className = "feedback warning-text";
			}
			if (hintBox) {
				hintBox.innerHTML = '<div class="hint-text">Choose + or - first. This reminder does not remove progress.</div>';
				updateFocusHintMode();
			}
			return;
		}

		if (!input.value) {
			input.style.borderColor = "#f2b84b";
			if (ringFeedback) {
				ringFeedback.textContent = "Warning! Make sure you fill in the size.";
				ringFeedback.className = "feedback warning-text";
			}
			if (hintBox) {
				hintBox.innerHTML = '<div class="hint-text">Type the size after choosing the sign. This reminder does not remove progress.</div>';
				updateFocusHintMode();
			}
			return;
		}

		if (finalAnswerSign !== correctSign) {
			markMistake();
			if (ringFeedback) {
				ringFeedback.textContent = "Not yet. The sign should match the bigger total outside the ring.";
				ringFeedback.className = "feedback bad-text";
			}
			if (hintBox) {
				hintBox.innerHTML = `<div class="hint-text">The outside sign should be ${correctSign}.</div>`;
				updateFocusHintMode();
			}
			return;
		}

		if (input.value && typedSize === correctSize) {
			input.style.borderColor = "#67c587";
			const finalText = `${correctSign}${correctSize}`;
			const finalPreview = byId("finalAnswerPreview");
			if (finalPreview) finalPreview.textContent = finalText;

			if (ringFeedback) {
				ringFeedback.textContent = `✅ Correct. Final answer is ${finalText}.`;
				ringFeedback.className = "feedback good-text";
			}

			if (hintBox) {
				hintBox.innerHTML = '<div class="hint-text">✅ Correct. The final sign and size match the ring. This climb is complete.</div>';
				updateFocusHintMode();
			}

			runCorrectCount = getRequiredProgressSteps();

			if (mistakesThisGame === 0 && !gameScoreAwarded) {
				turtleScore = Math.min(10, turtleScore + 1);
				gameScoreAwarded = true;
				updateTurtleBoard();
				fadeCompletionTurtle();
				popScoreChange("+1", "plus");
			} else {
				gameScoreAwarded = true;
				updateTurtleBoard();
			}

			finishPlay2FinalAnswer(finalText, true);
			return;
		}

		wrongAnswerCount++;
		input.style.borderColor = "#ef7777";
		markMistake();

		if (hintBox) {
			hintBox.innerHTML = `<div class="hint-text">Not yet. Subtract ${ringData.first.size} − ${ringData.second.size}, then type the size after the ${correctSign} sign.</div>`;
			updateFocusHintMode();
		}

		if (ringFeedback) {
			ringFeedback.textContent = `Not yet. This is attempt ${wrongAnswerCount}. Subtract the ring sizes and keep the ${correctSign} sign.`;
			ringFeedback.className = "feedback bad-text";
		}
	}

	function resetGame(options = { keepClimbProgress: false }) {
		if (!options.keepClimbProgress) {
			runCorrectCount = 0;
			mistakesThisGame = 0;
			gameScoreAwarded = false;
			resetNextClimbForNewPlay2Round();
		}

		selectedTerm = null;
		selectedRingChoice = null;
		termCountComplete = false;
		teamSortComplete = false;
		positiveTotalComplete = false;
		negativeTotalComplete = false;
		ringFirstComplete = false;
		ringSecondComplete = false;
		finalAnswerCompleted = false;
		finalAnswerSign = null;
		ringStep = 0;
		ringData = {};
		wrongAnswerCount = 0;
		document.body.dataset.play2FinalAnswerCorrect = "false";

		document.querySelectorAll(".term").forEach(term => {
			term.classList.remove("selected");
			term.removeAttribute("aria-disabled");
			if (termBank) termBank.appendChild(term);
		});

		const resetValue = id => {
			const element = byId(id);
			if (element) element.value = "";
		};

		const clearText = id => {
			const element = byId(id);
			if (element) element.textContent = "";
		};

		byId("plusTeam") && (byId("plusTeam").innerHTML = "");
		byId("minusTeam") && (byId("minusTeam").innerHTML = "");
		byId("positiveMiniList") && (byId("positiveMiniList").innerHTML = "");
		byId("negativeMiniList") && (byId("negativeMiniList").innerHTML = "");

		["positiveInput", "negativeInput", "termCountInput"].forEach(id => {
			resetValue(id);
			const input = byId(id);
			if (input) input.style.borderColor = "#b9dcff";
		});

		const positivePreviewSize = byId("positivePreviewSize");
		if (positivePreviewSize) positivePreviewSize.textContent = "__";
		const negativePreviewSize = byId("negativePreviewSize");
		if (negativePreviewSize) negativePreviewSize.textContent = "__";
		byId("positivePreview")?.classList.remove("filled");
		byId("negativePreview")?.classList.remove("filled");

		if (feedback) {
			feedback.textContent = "";
			feedback.className = "feedback";
		}

		clearText("positiveFeedback");
		clearText("negativeFeedback");
		clearText("countFeedback");

		byId("termBank")?.classList.add("hidden");
		byId("sortStep")?.classList.add("hidden");
		byId("sortStep")?.classList.remove("is-locked");
		byId("zones")?.classList.add("hidden");
		const confirmTeamsButton = byId("confirmTeamsButton");
		if (confirmTeamsButton) {
			confirmTeamsButton.disabled = true;
			confirmTeamsButton.classList.add("hidden");
			confirmTeamsButton.classList.add("locked-button");
			confirmTeamsButton.classList.remove("is-locked", "is-play-armed");
			confirmTeamsButton.setAttribute("aria-disabled", "true");
			confirmTeamsButton.removeAttribute("data-trial-armed");
		}
		const instruction = byId("instruction");
		if (instruction) instruction.textContent = "Step 1: Count the signed numbers first.";
		byId("positiveTotalStep")?.classList.add("hidden");
		byId("negativeTotalStep")?.classList.add("hidden");
		byId("ringBuilder")?.classList.add("hidden");
		byId("ringBuilder")?.classList.remove("relic-safe-step");
		byId("buildRing")?.classList.remove("hidden");

		const totalButtons = byId("totalButtons");
		if (totalButtons) totalButtons.innerHTML = "";
		const outsideSign = byId("outsideSign");
		if (outsideSign) outsideSign.textContent = "?";
		const firstSize = byId("firstSize");
		if (firstSize) firstSize.textContent = "__";
		const ringOperation = byId("ringOperation");
		if (ringOperation) ringOperation.textContent = "−";
		const secondSize = byId("secondSize");
		if (secondSize) secondSize.textContent = "__";
		const finalBuilt = byId("finalBuilt");
		if (finalBuilt) finalBuilt.innerHTML = "";

		updateTurtleBoard();
	}

	function nextClimb() {
		if (turtleScore >= 10) return false;

		finalAnswerCompleted = false;
		document.body.dataset.play2FinalAnswerCorrect = "false";
		resetNextClimbForNewPlay2Round();
		stage++;
		resetGame({ keepClimbProgress: false });
		if (termBank) termBank.innerHTML = "";
		generateTerms();
		renderTerms();

		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.add("hidden");
		if (playArea) playArea.classList.remove("hidden");

		setChallengeMessage(`Stage ${stage}: Climb ${getRequiredProgressSteps()} clean steps to score.`);
		updateTurtleBoard();
		if (shell) {
			shell.applyProgressThemeByScore(turtleScore, true);
			shell.startNextClimbTimer();
		} else {
			startClimbTimer();
		}

		scrollToStepOneStart();
		return true;
	}

	function resetPracticeGame() {
		stopClimbTimer(false);
		resetGame({ keepClimbProgress: true });
		showClimbGate();
		if (feedback) {
			feedback.textContent = "Practice reset. Turtle score and climb progress did not change.";
			feedback.className = "feedback good-text";
		}
	}

	function showAchievementPopup() {
		if (achievementShown) return;
		achievementShown = true;
		startConfetti();

		const nameInput = byId("playerNameInput");
		if (nameInput) nameInput.value = "";

		const namePopup = byId("namePopup");
		if (namePopup) namePopup.style.display = "flex";

		window.setTimeout(() => nameInput?.focus(), 200);
	}

	async function createCertificateFromName() {
		const nameInput = byId("playerNameInput");
		const finalName = (nameInput?.value || "").trim() || "Math Ridge Champion";
		const now = new Date();
		const button = document.querySelector("#namePopup button");
		const raceMs = getRaceMs();

		if (button) {
			button.disabled = true;
			button.textContent = "Saving world record...";
		}

		const formattedDate = now.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});

		const formattedTime = now.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true
		});

		let rankMessage = "";
		let raceTimeText = formatRaceTime(raceMs);

		try {
			const result = await submitWorldRecord(finalName, raceMs);
			if (result) {
				latestRaceRank = result.rank || null;
				latestSavedRaceSeconds = result.record?.timeSeconds || Math.round(raceMs / 1000);
				rankMessage = result.topThree ? rankText(result.rank) : "";
				raceTimeText = result.record?.timeDisplay || formatRaceSeconds(result.record?.timeSeconds || latestSavedRaceSeconds);
			} else {
				rankMessage = "World record could not save. Certificate still created.";
			}
		} catch (error) {
			rankMessage = "World record could not save. Certificate still created.";
		}

		byId("certName").textContent = finalName;
		byId("certRaceTime").textContent = "";
		byId("certRank").textContent = "";
		byId("certDate").textContent = `Completed on ${formattedDate}`;

		if (shell && typeof shell.saveTrailProgress === "function") {
			shell.saveTrailProgress({
				id: "1_2",
				studentName: finalName,
				displayDate: formattedDate,
				displayTime: formattedTime,
				timeDisplay: raceTimeText,
				rank: latestRaceRank,
				rankText: rankMessage,
				score: turtleScore,
				stage
			});
		}

		if (button) {
			button.disabled = false;
			button.textContent = "Create My Certificate";
		}

		const namePopup = byId("namePopup");
		const certificatePopup = byId("certificatePopup");
		if (namePopup) namePopup.style.display = "none";
		if (certificatePopup) certificatePopup.style.display = "flex";
	}

	function closeCertificatePopup() {
		const certificatePopup = byId("certificatePopup");
		if (certificatePopup) certificatePopup.style.display = "none";
		stopConfetti();
	}

	function saveCertificateImage() {
		const name = byId("certName")?.textContent || "Math Ridge Champion";
		const date = byId("certDate")?.textContent || "";

		if (shell?.downloadOfficialCertificate) {
			shell.downloadOfficialCertificate({
				studentName: name,
				certificateTitle: "Positive and Negative Term Balance",
				bodyText: "for demonstrating understanding of grouping positive and negative terms by sign.",
				dateText: date,
				signature: "Presented by Math Ridge Creator: Kuan-Yuan Huang",
				filename: "math-ridge-positive-negative-term-balance-certificate.png"
			});
			return;
		}

		const canvas = document.createElement("canvas");
		canvas.width = 1200;
		canvas.height = 1000;
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#fff8db";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = "#d4a73c";
		ctx.lineWidth = 18;
		ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);
		ctx.lineWidth = 5;
		ctx.strokeRect(85, 85, canvas.width - 170, canvas.height - 170);

		ctx.textAlign = "center";
		ctx.fillStyle = "#7a4b00";
		ctx.font = "bold 54px Georgia";
		ctx.fillText("Math Ridge", 600, 150);

		ctx.fillStyle = "#24304f";
		ctx.font = "bold 48px Georgia";
		ctx.fillText("Certificate of Achievement", 600, 245);

		ctx.fillStyle = "#b87900";
		ctx.font = "bold 42px Georgia";
		ctx.fillText("Positive and Negative Term Balance", 600, 315);

		ctx.fillStyle = "#24304f";
		ctx.font = "30px Georgia";
		ctx.fillText("Presented to", 600, 390);

		ctx.fillStyle = "#1f6fb8";
		ctx.font = "bold 60px Georgia";
		ctx.fillText(name, 600, 470);

		ctx.fillStyle = "#24304f";
		ctx.font = "28px Georgia";
		ctx.fillText("for demonstrating understanding of grouping", 600, 550);
		ctx.fillText("positive and negative terms by sign.", 600, 590);

		ctx.fillStyle = "#24304f";
		ctx.font = "bold 24px Georgia";
		ctx.fillText(date, 600, 670);

		ctx.fillStyle = "#7a4b00";
		ctx.font = "italic 28px Georgia";
		ctx.fillText("Presented by Math Ridge Creator: Kuan-Yuan Huang", 600, 885);

		const link = document.createElement("a");
		link.download = "math-ridge-positive-negative-showdown-certificate.webp";
		link.href = canvas.toDataURL("image/webp", 0.92);
		link.click();
	}

	function initPlay2() {
		setupMathInputFiltering();
		attachTermBankAndZoneEvents();
		resetNextClimbForNewPlay2Round();
		resetGame({ keepClimbProgress: false });
		if (termBank) termBank.innerHTML = "";
		generateTerms();
		renderTerms();
		setChallengeMessage("Press START the Climb when you are ready.");
		updateTurtleBoard();
		showClimbGate();
	}

	window.MathRidgeLocal = {
		getScore: () => turtleScore,
		getStage: () => stage,
		getRequiredProgressSteps: () => getRequiredProgressSteps()
	};

	window.startClimbFromGate = startClimbFromGate;
	window.checkTermCountFromInput = checkTermCountFromInput;
	window.confirmTeams = confirmTeams;
	window.checkPositiveTotal = checkPositiveTotal;
	window.checkNegativeTotal = checkNegativeTotal;
	window.useTermStoneRelic = useTermStoneRelic;
	window.selectManualOutsideSign = selectManualOutsideSign;
	window.selectManualOperation = selectManualOperation;
	window.checkManualRingSetup = checkManualRingSetup;
	window.chooseRingNumber = chooseRingNumber;
	window.selectFinalAnswerSign = selectFinalAnswerSign;
	window.checkRingAnswer = checkRingAnswer;
	window.nextClimb = nextClimb;
	window.resetPracticeGame = resetPracticeGame;
	window.resetChallenge = resetChallenge;
	window.createCertificateFromName = createCertificateFromName;
	window.closeCertificatePopup = closeCertificatePopup;
	window.saveCertificateImage = saveCertificateImage;

	initPlay2();
})();
