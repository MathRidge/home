/* Math Ridge Play 1-3 local game: Sign Fixer Challenge.
   The global shell owns timer, top shelf, ladder, background, and Next Climb visibility. */
(function () {
	"use strict";

	const PLAY_ID = "1_3";
	const PLAY_SECTION = "1-3";
	const PLAY_TITLE = "Sign Simplification Fluency";
	const PLAY_COMPLETE_KEY = "mathRidge_playComplete_1_3";
	const PLAY_CERT_KEY = "mathRidge_cert_1_3";
	const NEXT_NOTE_UNLOCK_KEY = "mathRidge_noteUnlocked_1_4";
	const NEXT_STAGE_UNLOCK_KEY = "mathRidge_stageUnlocked_1_4";
	const GLOBAL_RECORD_FALLBACK = "https://mathridge-play1-records.primelearning-math-kevin.workers.dev/?game=play3";
	const CERT_SIGNATURE = "Presented by Math Ridge Creator: Kuan-Yuan Huang";

	let currentProblem = null;
	let selectedTerm = null;
	let turtleScore = 0;
	let stage = 1;
	let runCorrectCount = 0;
	let mistakesThisRound = 0;
	let roundScoreAwarded = false;
	let achievementShown = false;
	let confettiTimer = null;
	let latestRaceRank = null;
	let latestSavedRaceSeconds = null;
	let progressThemeTimer = null;
	let sortConfirmed = false;
	let boxPickStep = 0;
	let pickedBigger = false;
	let pickedSmaller = false;
	let totalsConfirmed = false;
	let boxComplete = false;
	let signCompassRelicActive = false;
	let termStoneRelicActive = false;
	let manualOutsideSign = null;
	let manualOperation = null;
	let boxData = {};
	let finalAnswered = false;
	let finalAnswerSign = null;
	let pageHasStartedClimb = false;

	function shell() {
		return window.MathRidgePlay || null;
	}

	function byId(id) {
		return document.getElementById(id);
	}

	function setText(id, text) {
		const element = byId(id);
		if (element) element.textContent = text;
	}

	function safeText(value) {
		return String(value || "").replace(/[<>]/g, "").trim();
	}

	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function shuffle(array) {
		return array
			.map(value => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(item => item.value);
	}

	function keepDigitsOnly(value) {
		return String(value || "").replace(/[^\d]/g, "");
	}

	function displaySign(sign) {
		if (sign === "-") return "\u2212";
		return sign === "+" ? "+" : "?";
	}

	function getCorrectFinalSign() {
		return currentProblem && currentProblem.finalValue < 0 ? "-" : "+";
	}

	function getBoxSolution() {
		if (!currentProblem) return null;
		const pos = currentProblem.positiveTotal;
		const neg = currentProblem.negativeTotal;
		const posSize = Math.abs(pos);
		const negSize = Math.abs(neg);
		const positiveLeads = posSize > negSize;
		const larger = positiveLeads ? pos : neg;
		const smaller = positiveLeads ? neg : pos;
		return {
			larger,
			smaller,
			firstSize: Math.max(posSize, negSize),
			secondSize: Math.min(posSize, negSize),
			outsideSign: larger > 0 ? "+" : "-",
			operation: "-"
		};
	}

	function hasOppositeSizePair(values) {
		const signsBySize = new Map();

		for (const value of values) {
			const size = Math.abs(value);
			const sign = value < 0 ? -1 : 1;
			const signs = signsBySize.get(size) || new Set();
			if (signs.has(-sign)) return true;
			signs.add(sign);
			signsBySize.set(size, signs);
		}

		return false;
	}

	function fallbackFormatRaceTime(ms) {
		const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	}

	function formatRaceTime(ms) {
		return shell() ? shell().formatRaceTime(ms) : fallbackFormatRaceTime(ms);
	}

	function formatRaceSeconds(seconds) {
		return formatRaceTime(Number(seconds || 0) * 1000);
	}

	function getRaceMs() {
		return shell() ? shell().getTotalRaceMs() : 0;
	}

	function startClimbTimer() {
		if (turtleScore >= 10) return;
		if (shell()) shell().startClimbTimer({ hideNext: false });
	}

	function stopClimbTimer(addToTotal = true) {
		if (shell()) shell().stopClimbTimer(addToTotal);
	}

	function resetRaceTimer() {
		latestRaceRank = null;
		latestSavedRaceSeconds = null;
		if (shell()) shell().resetRaceTimer();
	}

	function rankText(rank) {
		if (rank === 1) return "🥇 1st Place World Time Champion";
		if (rank === 2) return "🥈 2nd Place World Time";
		if (rank === 3) return "🥉 3rd Place World Time";
		return "";
	}

	function completePlayProgress() {
		localStorage.setItem(PLAY_COMPLETE_KEY, "true");
		localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
		localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
	}

	function getDifficultySettings() {
		if (turtleScore <= 3) return { termCount: 4, maxValue: 7, complexCount: 2 };
		if (turtleScore <= 6) return { termCount: 5, maxValue: 9, complexCount: 3 };
		return { termCount: 6, maxValue: 12, complexCount: 3 };
	}

	function formatSigned(value, first = false) {
		const size = Math.abs(value);
		if (first) return value < 0 ? `−${size}` : `${size}`;
		return value < 0 ? `−${size}` : `+${size}`;
	}

	function makeTerm(size, type, isFirst) {
		let original = "";
		let value = size;

		if (type === "plainPositive") {
			value = size;
			original = isFirst ? `${size}` : `+${size}`;
		} else if (type === "plainNegative") {
			value = -size;
			original = `−${size}`;
		} else if (type === "plusNegative") {
			value = -size;
			original = `+(−${size})`;
		} else if (type === "plusPositive") {
			value = size;
			original = `+(+${size})`;
		} else if (type === "minusPositive") {
			value = -size;
			original = `−(+${size})`;
		} else if (type === "minusNegative") {
			value = size;
			original = `−(−${size})`;
		}

		return {
			original,
			value,
			fixed: formatSigned(value),
			size: Math.abs(value),
			complex: type !== "plainPositive" && type !== "plainNegative"
		};
	}

	function formatExpression(values) {
		return values.map((value, index) => formatSigned(value, index === 0)).join(" ");
	}

	function generateProblem() {
		const settings = getDifficultySettings();
		const types = ["plainPositive", "plainNegative", "plusNegative", "minusNegative", "minusPositive", "plusPositive"];
		let safety = 0;

		while (safety < 500) {
			safety++;
			const terms = [];

			for (let i = 0; i < settings.termCount; i++) {
				const type = types[randomInt(0, types.length - 1)];
				terms.push(makeTerm(randomInt(1, settings.maxValue), type, i === 0));
			}

			const complexCount = terms.filter(term => term.complex).length;
			const values = terms.map(term => term.value);
			const hasPositive = values.some(value => value > 0);
			const hasNegative = values.some(value => value < 0);
			const hasOppositeDuplicateSize = hasOppositeSizePair(values);
			const total = values.reduce((sum, value) => sum + value, 0);

			if (complexCount >= settings.complexCount && hasPositive && hasNegative && !hasOppositeDuplicateSize && total !== 0) {
				const positiveTotal = values.filter(value => value > 0).reduce((sum, value) => sum + value, 0);
				const negativeTotal = values.filter(value => value < 0).reduce((sum, value) => sum + value, 0);
				if (Math.abs(positiveTotal) !== Math.abs(negativeTotal)) {
					return {
						terms,
						values,
						original: terms.map(term => term.original).join(" "),
						fixedExpression: formatExpression(values),
						positiveTotal,
						negativeTotal,
						finalValue: total
					};
				}
			}
		}

		return {
			terms: [
				makeTerm(4, "minusNegative", true),
				makeTerm(5, "plainNegative", false),
				makeTerm(3, "plusNegative", false),
				makeTerm(7, "plainPositive", false)
			],
			values: [4, -5, -3, 7],
			original: "−(−4) −5 +(−3) +7",
			fixedExpression: "4 −5 −3 +7",
			positiveTotal: 11,
			negativeTotal: -8,
			finalValue: 3
		};
	}

	function makeWrongChoices(problem) {
		const values = problem.values;
		const choices = new Set([problem.fixedExpression]);

		const wrong1 = values.map((value, index) => formatSigned(index === 0 ? -value : value, index === 0)).join(" ");
		const wrong2 = values.map((value, index) => formatSigned(index % 2 === 0 ? value : -value, index === 0)).join(" ");
		const wrong3 = values.map((value, index) => formatSigned(value < 0 ? Math.abs(value) : -value, index === 0)).join(" ");

		[wrong1, wrong2, wrong3].forEach(choice => choices.add(choice));

		while (choices.size < 4) {
			const mutated = values.map((value, index) => {
				const next = Math.random() < 0.45 ? -value : value;
				return formatSigned(next, index === 0);
			}).join(" ");
			choices.add(mutated);
		}

		return shuffle([...choices]).slice(0, 4);
	}

	function getRequiredProgressSteps() {
		return currentProblem ? 5 : 5;
	}

	function updateTurtleBoard(message = "") {
		const requiredSteps = getRequiredProgressSteps();
		const progressPercent = requiredSteps > 0
			? Math.min(100, Math.round((runCorrectCount / requiredSteps) * 100))
			: 0;

		if (shell() && typeof shell().updateShelf === "function") {
			shell().updateShelf({
				score: turtleScore,
				stage,
				progressPercent,
				message: message || undefined
			});
			return;
		}

		setText("scoreText", `Score: ${turtleScore}`);
		setText("stageText", `Stage: ${stage}`);
		const track = byId("turtleTrack");
		if (track) {
			track.style.setProperty("--progress", `${progressPercent}%`);
			if (!track.querySelector(".progress-fill")) track.insertAdjacentHTML("afterbegin", '<div class="progress-fill"></div>');
			if (!track.querySelector(".progress-turtle")) track.insertAdjacentHTML("beforeend", '<div class="progress-turtle">🐢</div>');
		}
		if (message) setText("challengeMessage", message);
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
		const board = byId("challengeBoard") || document.querySelector(".challenge-board");
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

	function setNextClimbLocked(isLocked) {
		if (shell()) {
			if (isLocked) return shell().hideNextClimbButton({ force: true });
			return shell().showNextClimbButton({ scroll: true });
		}

		const button = byId("nextClimbButton");
		if (!button) return false;
		button.disabled = isLocked;
		button.classList.toggle("locked-button", isLocked);
		button.classList.toggle("hidden", isLocked);
		button.hidden = isLocked;
		return true;
	}

	function setChallengeMessage(message) {
		if (shell() && typeof shell().setStatusMessage === "function") {
			shell().setStatusMessage(message);
		} else {
			setText("challengeMessage", message);
		}
	}

	function scrollToPremiumElement(id, extraGap = 14, delay = 80) {
		window.setTimeout(() => {
			if (shell() && typeof shell().scrollToPremiumElement === "function") {
				shell().scrollToPremiumElement(id, extraGap);
				return;
			}
			byId(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
		}, delay);
	}

	function scrollToStepOneStart() {
		if (!pageHasStartedClimb) return;
		scrollToPremiumElement("expressionBoard", 12, 80);
	}

	function scrollToBottomControls(delay = 240) {
		if (!pageHasStartedClimb) return;
		scrollToPremiumElement("bottomControls", 18, delay);
	}

	function markCorrectStep() {
		if (roundScoreAwarded) return;

		const requiredSteps = getRequiredProgressSteps();
		// The final answer is the only real finish trigger.
		runCorrectCount = Math.min(runCorrectCount + 1, Math.max(0, requiredSteps - 1));

		const message = mistakesThisRound === 0
			? "Good. Keep the turtle moving. Finish the bar without a mistake."
			: "Keep practicing. This climb already has a mistake, so it cannot earn a score.";

		updateTurtleBoard(message);
	}

	function markMistake(message = "Not yet. Try again.") {
		if (roundScoreAwarded || finalAnswered) return message;

		shell()?.playSfx?.("wrong");
		stopClimbTimer(true);
		mistakesThisRound++;
		runCorrectCount = 0;

		let status;
		if (mistakesThisRound > 1 && turtleScore > 0) {
			turtleScore--;
			popScoreChange("−1", "minus");
			status = "Second mistake in this round. Turtle loses 1 score, but score cannot go below 0.";
		} else if (mistakesThisRound > 1) {
			status = "Second mistake in this round. Score is already 0, so keep practicing.";
		} else {
			status = "Mistake made. Progress bar cleared. This climb cannot earn a score now, but finish it to unlock Next Climb.";
		}

		updateTurtleBoard(status);
		shakeScoreBoard();
		return message;
	}

	function completeRoundAfterFinalAnswer() {
		if (roundScoreAwarded) return;

		const requiredSteps = getRequiredProgressSteps();
		runCorrectCount = requiredSteps;
		roundScoreAwarded = true;

		let message;
		if (mistakesThisRound === 0) {
			turtleScore = Math.min(10, turtleScore + 1);
			popScoreChange("+1", "plus");
			fadeCompletionTurtle();

			if (turtleScore >= 10) {
				completePlayProgress();
				message = "🎁 Score 10 reached! Certificate unlocked.";
			} else {
				message = "✅ Correct final answer. +1 score. Press Next Climb to start the next problem.";
			}
		} else {
			message = "✅ Correct final answer. This climb had a mistake, so it does not earn a score. Press Next Climb to try another problem.";
		}

		updateTurtleBoard(message);

		if (turtleScore >= 10) {
			stopClimbTimer(true);
			setNextClimbLocked(true);
			setChallengeMessage("🎁 Score 10 reached! Certificate unlocked.");
			if (!achievementShown) window.setTimeout(showAchievementPopup, 700);
			return;
		}

		if (shell() && typeof shell().finishCorrectClimb === "function") {
			shell().finishCorrectClimb({ message, scroll: true });
		} else {
			stopClimbTimer(true);
			setNextClimbLocked(false);
			setChallengeMessage(message);
		}
	}

	function showClimbGate() {
		stopClimbTimer(false);
		byId("climbStartGate")?.classList.remove("hidden");
		byId("playArea")?.classList.add("hidden");
		setChallengeMessage("Press START the Climb when you are ready.");
	}

	function startClimbFromGate() {
		pageHasStartedClimb = true;
		byId("climbStartGate")?.classList.add("hidden");
		byId("playArea")?.classList.remove("hidden");
		setChallengeMessage(`Climb ${getRequiredProgressSteps()} clean steps to score.`);
		startClimbTimer();
		scrollToStepOneStart();
	}

	function renderChoices() {
		const grid = byId("choiceGrid");
		if (!grid) return;
		grid.innerHTML = "";

		makeWrongChoices(currentProblem).forEach(choice => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "choice-card";
			button.textContent = choice;
			button.onclick = () => checkSignChoice(button, choice);
			grid.appendChild(button);
		});
	}

	function checkSignChoice(button, choice) {
		startClimbTimer();
		if (button.classList.contains("correct") || button.classList.contains("wrong")) return;

		if (choice !== currentProblem.fixedExpression) {
			button.classList.add("wrong");
			setText("signFeedback", markMistake("Not yet. Fix only the stacked signs."));
			byId("signFeedback").className = "feedback bad-text";
			return;
		}

		button.classList.add("correct");
		document.querySelectorAll(".choice-card").forEach(card => { card.disabled = true; });
		setText("signFeedback", "✅ Correct. Now sort the fixed signed terms.");
		byId("signFeedback").className = "feedback good-text";
		renderTerms();
		byId("sortStep")?.classList.remove("hidden");
		markCorrectStep();
		scrollToPremiumElement("sortStep", 12, 80);
	}

	function renderTerms() {
		const bank = byId("termBank");
		if (!bank) return;
		bank.innerHTML = "";
		selectedTerm = null;
		sortConfirmed = false;
		const confirmButton = byId("confirmSortButton");
		if (confirmButton) {
			confirmButton.disabled = false;
			confirmButton.removeAttribute("aria-disabled");
			confirmButton.classList.remove("is-play-armed");
			confirmButton.removeAttribute("data-trial-armed");
		}

		currentProblem.values.forEach((value, index) => {
			const term = document.createElement("div");
			term.className = `term ${value > 0 ? "plus" : "minus"}`;
			term.dataset.value = String(value);
			term.dataset.index = String(index);
			term.textContent = formatSigned(value);
			term.onclick = event => {
				event.stopPropagation();
				selectTerm(term);
			};
			bank.appendChild(term);
		});
	}

	function selectTerm(term) {
		if (sortConfirmed) return;
		document.querySelectorAll(".term").forEach(item => item.classList.remove("selected"));
		selectedTerm = term;
		term.classList.add("selected");
	}

	function placeSelectedTerm(zone) {
		startClimbTimer();

		if (!selectedTerm) {
			setText("sortFeedback", "Tap a signed number first.");
			byId("sortFeedback").className = "feedback warning-text";
			return;
		}

		selectedTerm.classList.remove("selected");
		selectedTerm.classList.add("placed");
		zone.querySelector(".zone-drop")?.appendChild(selectedTerm);
		selectedTerm = null;

		setText("sortFeedback", "Placed. You may move it again, then double tap Confirm Sort.");
		byId("sortFeedback").className = "feedback good-text";
	}

	function confirmSortTeams() {
		startClimbTimer();
		if (sortConfirmed) return;

		if (byId("termBank")?.querySelectorAll(".term").length) {
			setText("sortFeedback", "Place every signed term before confirming.");
			byId("sortFeedback").className = "feedback warning-text";
			return;
		}

		const misplaced = Array.from(document.querySelectorAll("#plusTeam .term, #minusTeam .term")).filter(term => {
			const value = Number(term.dataset.value);
			const expectedParent = value > 0 ? "plusTeam" : "minusTeam";
			return term.parentElement?.id !== expectedParent;
		});

		if (misplaced.length) {
			setText("sortFeedback", "Not yet. Move each signed term to its matching team, then confirm again.");
			byId("sortFeedback").className = "feedback warning-text";
			return;
		}

		sortConfirmed = true;
		document.querySelectorAll("#sortStep .term").forEach(term => {
			term.classList.remove("selected");
			term.classList.add("placed");
			term.onclick = null;
		});
		const confirmButton = byId("confirmSortButton");
		if (confirmButton) {
			confirmButton.disabled = true;
			confirmButton.setAttribute("aria-disabled", "true");
		}
		setText("sortFeedback", "✅ Sort confirmed. Now add each team total.");
		byId("sortFeedback").className = "feedback good-text";
		markCorrectStep();
		showTotalStep();
	}

	function renderMiniTeamList(id, values) {
		const list = byId(id);
		if (!list) return;
		list.innerHTML = "";
		values.forEach(value => {
			const item = document.createElement("span");
			item.className = `term ${value > 0 ? "plus" : "minus"}`;
			item.textContent = formatSigned(value);
			list.appendChild(item);
		});
	}

	function showTotalStep() {
		totalsConfirmed = false;
		signCompassRelicActive = false;
		byId("totalStep")?.classList.remove("relic-safe-step");
		renderMiniTeamList("positiveTeamList", currentProblem.values.filter(value => value > 0));
		renderMiniTeamList("negativeTeamList", currentProblem.values.filter(value => value < 0));

		["positiveTotalInput", "negativeTotalInput"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.value = "";
			input.disabled = false;
			input.removeAttribute("aria-disabled");
			input.style.borderColor = "";
		});
		const confirmButton = byId("confirmTotalsButton");
		if (confirmButton) {
			confirmButton.disabled = false;
			confirmButton.removeAttribute("aria-disabled");
			confirmButton.classList.remove("is-play-armed");
			confirmButton.removeAttribute("data-trial-armed");
		}
		const assist = byId("signCompassAssist");
		assist?.classList.remove("is-active", "relic-safe-step");
		const relicButton = assist?.querySelector("button");
		if (relicButton) {
			relicButton.disabled = false;
			relicButton.removeAttribute("aria-disabled");
		}
		setText("totalFeedback", "");
		byId("totalFeedback").className = "feedback";
		byId("totalStep")?.classList.remove("hidden");
		scrollToPremiumElement("totalStep", 12, 80);
	}

	function useSignCompassRelic() {
		if (totalsConfirmed) return;
		signCompassRelicActive = true;
		const positiveInput = byId("positiveTotalInput");
		const negativeInput = byId("negativeTotalInput");
		if (positiveInput) positiveInput.value = Math.abs(currentProblem.positiveTotal);
		if (negativeInput) negativeInput.value = Math.abs(currentProblem.negativeTotal);
		const assist = byId("signCompassAssist");
		assist?.classList.add("is-active", "relic-safe-step");
		const button = assist?.querySelector("button");
		if (button) {
			button.disabled = true;
			button.setAttribute("aria-disabled", "true");
		}
		byId("totalStep")?.classList.add("relic-safe-step");
		shell()?.playSfx?.("relic");
		setText("totalFeedback", "Sign Compass filled both team totals. Double tap Confirm Totals when you are ready.");
		byId("totalFeedback").className = "feedback good-text";
	}

	function confirmTeamTotals() {
		startClimbTimer();
		if (totalsConfirmed) return;
		const positiveInput = byId("positiveTotalInput");
		const negativeInput = byId("negativeTotalInput");
		const positiveSize = Number(keepDigitsOnly(positiveInput?.value || ""));
		const negativeSize = Number(keepDigitsOnly(negativeInput?.value || ""));
		if (positiveInput) positiveInput.value = positiveSize || "";
		if (negativeInput) negativeInput.value = negativeSize || "";

		if (!positiveSize || !negativeSize) {
			setText("totalFeedback", "Fill both team totals before confirming.");
			byId("totalFeedback").className = "feedback warning-text";
			return;
		}

		if (positiveSize !== Math.abs(currentProblem.positiveTotal) || negativeSize !== Math.abs(currentProblem.negativeTotal)) {
			setText("totalFeedback", markMistake("Not yet. Add each team again before confirming."));
			byId("totalFeedback").className = "feedback bad-text";
			return;
		}

		totalsConfirmed = true;
		[positiveInput, negativeInput, byId("confirmTotalsButton")].forEach(control => {
			if (!control) return;
			control.disabled = true;
			control.setAttribute("aria-disabled", "true");
		});
		setText("totalFeedback", "Correct totals. Now build the bigger-sign box.");
		byId("totalFeedback").className = "feedback good-text";
		markCorrectStep();
		showBoxStep();
	}

	function resetBoxPreview() {
		setText("outsideSign", "?");
		setText("firstSize", "__");
		setText("insideOperation", displaySign("-"));
		setText("secondSize", "__");
	}

	function showBoxStep() {
		boxPickStep = 0;
		pickedBigger = false;
		pickedSmaller = false;
		boxComplete = false;
		termStoneRelicActive = false;
		manualOutsideSign = null;
		manualOperation = null;
		boxData = {};
		const pos = currentProblem.positiveTotal;
		const neg = currentProblem.negativeTotal;
		const solution = getBoxSolution();

		const summary = byId("teamSummary");
		if (summary) {
			summary.innerHTML = `
				<div>Positive total: +${Math.abs(pos)}</div>
				<div>Negative total: ${displaySign("-")}${Math.abs(neg)}</div>
			`;
		}

		resetBoxPreview();
		setText("boxFeedback", "");
		byId("boxFeedback").className = "feedback";
		byId("boxStep")?.classList.remove("relic-safe-step");
		byId("termStoneAssist")?.classList.remove("is-active", "relic-safe-step");
		const relicButton = byId("termStoneAssist")?.querySelector("button");
		if (relicButton) {
			relicButton.disabled = false;
			relicButton.removeAttribute("aria-disabled");
		}
		byId("manualBoxControls")?.classList.remove("hidden");

		const buttons = [
			{ value: pos, text: `+${Math.abs(pos)}` },
			{ value: neg, text: `${displaySign("-")}${Math.abs(neg)}` }
		];

		const holder = byId("totalButtons");
		if (holder) {
			holder.innerHTML = "";
			holder.classList.add("hidden");
			shuffle(buttons).forEach(data => {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "total-choice";
				button.textContent = data.text;
				button.dataset.value = String(data.value);
				button.onclick = () => pickTotal(button, Number(data.value), solution.larger, solution.smaller);
				holder.appendChild(button);
			});
		}

		["boxFirstSizeInput", "boxSecondSizeInput"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.value = "";
			input.disabled = false;
			input.removeAttribute("aria-disabled");
			input.style.borderColor = "";
		});
		document.querySelectorAll(".manual-sign-btn, .manual-op-btn").forEach(button => {
			button.classList.remove("selected");
			button.disabled = false;
			button.removeAttribute("aria-disabled");
		});
		const checkButton = byId("checkBoxButton");
		if (checkButton) {
			checkButton.disabled = false;
			checkButton.removeAttribute("aria-disabled");
			checkButton.classList.remove("is-play-armed");
			checkButton.removeAttribute("data-trial-armed");
		}

		byId("boxStep")?.classList.remove("hidden");
		scrollToPremiumElement("boxStep", 12, 80);
	}

	function updateManualBoxPreview() {
		if (termStoneRelicActive || boxComplete) return;
		const firstValue = keepDigitsOnly(byId("boxFirstSizeInput")?.value || "");
		const secondValue = keepDigitsOnly(byId("boxSecondSizeInput")?.value || "");
		if (manualOutsideSign) setText("outsideSign", displaySign(manualOutsideSign));
		setText("insideOperation", displaySign(manualOperation || "-"));
		setText("firstSize", firstValue || "__");
		setText("secondSize", secondValue || "__");
	}

	function selectBoxOutsideSign(sign, button) {
		if (boxComplete) return;
		manualOutsideSign = sign === "-" ? "-" : "+";
		document.querySelectorAll(".manual-sign-btn").forEach(item => item.classList.remove("selected"));
		button?.classList.add("selected");
		updateManualBoxPreview();
		setText("boxFeedback", "Outside sign selected. Choose the operation and fill the sizes.");
		byId("boxFeedback").className = "feedback";
	}

	function selectBoxOperation(operation, button) {
		if (boxComplete) return;
		manualOperation = operation === "+" ? "+" : "-";
		document.querySelectorAll(".manual-op-btn").forEach(item => item.classList.remove("selected"));
		button?.classList.add("selected");
		updateManualBoxPreview();
		setText("boxFeedback", "Operation selected. Fill the box sizes, then check the box.");
		byId("boxFeedback").className = "feedback";
	}

	function useTermStoneRelic() {
		if (boxComplete) return;
		termStoneRelicActive = true;
		boxPickStep = 0;
		pickedBigger = false;
		pickedSmaller = false;
		byId("termStoneAssist")?.classList.add("is-active", "relic-safe-step");
		const relicButton = byId("termStoneAssist")?.querySelector("button");
		if (relicButton) {
			relicButton.disabled = true;
			relicButton.setAttribute("aria-disabled", "true");
		}
		byId("manualBoxControls")?.classList.add("hidden");
		byId("totalButtons")?.classList.remove("hidden");
		byId("boxStep")?.classList.add("relic-safe-step");
		resetBoxPreview();
		shell()?.playSfx?.("relic");
		setText("boxFeedback", "Tap the larger size total first, then the smaller size total.");
		byId("boxFeedback").className = "feedback good-text";
	}

	function pickTotal(button, value, bigger, smaller) {
		startClimbTimer();
		if (!termStoneRelicActive || boxComplete) return;

		if (button.classList.contains("selected")) return;

		if (boxPickStep === 0) {
			if (value !== bigger) {
				button.classList.add("wrong-pick");
				setText("boxFeedback", "The Term Stone is asking for the larger size first.");
				byId("boxFeedback").className = "feedback warning-text";
				window.setTimeout(() => button.classList.remove("wrong-pick"), 500);
				return;
			}

			button.classList.add("selected");
			button.disabled = true;
			setText("outsideSign", displaySign(bigger > 0 ? "+" : "-"));
			setText("firstSize", Math.abs(bigger));
			setText("insideOperation", displaySign("-"));
			boxPickStep = 1;
			pickedBigger = true;
			setText("boxFeedback", "Larger size placed. Now tap the smaller size.");
			byId("boxFeedback").className = "feedback good-text";
			return;
		}

		if (boxPickStep === 1) {
			if (value !== smaller) {
				button.classList.add("wrong-pick");
				setText("boxFeedback", "The second box needs the smaller size.");
				byId("boxFeedback").className = "feedback warning-text";
				window.setTimeout(() => button.classList.remove("wrong-pick"), 500);
				return;
			}

			button.classList.add("selected");
			button.disabled = true;
			setText("secondSize", Math.abs(smaller));
			boxPickStep = 2;
			pickedSmaller = true;
			setText("boxFeedback", "Box filled. Double tap Check Box to confirm it.");
			byId("boxFeedback").className = "feedback good-text";
		}
	}

	function lockBoxStepControls() {
		byId("boxStep")?.classList.add("is-locked");
		byId("boxStep")?.querySelectorAll("button, input").forEach(control => {
			control.disabled = true;
			control.setAttribute("aria-disabled", "true");
		});
	}

	function setFinalStepLocked(isLocked) {
		byId("finalStep")?.classList.toggle("is-locked", isLocked);
		byId("finalStep")?.querySelectorAll("button, input").forEach(control => {
			control.disabled = isLocked;
			if (isLocked) {
				control.setAttribute("aria-disabled", "true");
			} else {
				control.removeAttribute("aria-disabled");
			}
		});
	}

	function copyBoxToFinalStep(solution) {
		setText("finalOutsideSign", displaySign(solution.outsideSign));
		setText("finalFirstSize", solution.firstSize);
		setText("finalInsideOperation", displaySign(solution.operation));
		setText("finalSecondSize", solution.secondSize);
	}

	function showFinalStep() {
		const solution = boxData.firstSize ? boxData : getBoxSolution();
		copyBoxToFinalStep(solution);
		finalAnswered = false;
		finalAnswerSign = null;
		setFinalStepLocked(false);
		setText("answerPreviewSign", "?");
		setText("answerPreviewSize", "__");
		byId("answerPreview")?.classList.remove("filled");
		byId("chooseFinalPositive")?.classList.remove("selected");
		byId("chooseFinalNegative")?.classList.remove("selected");
		const finalInput = byId("finalAnswerInput");
		if (finalInput) {
			finalInput.value = "";
			finalInput.style.borderColor = "#b9dcff";
			finalInput.disabled = false;
			finalInput.removeAttribute("aria-disabled");
		}
		setText("finalFeedback", "");
		byId("finalFeedback").className = "feedback";
		byId("finalStep")?.classList.remove("hidden");
		scrollToPremiumElement("finalStep", 12, 80);
	}

	function checkBoxSetup() {
		startClimbTimer();
		if (boxComplete) return;
		const solution = getBoxSolution();
		const firstSize = Number(keepDigitsOnly(byId("boxFirstSizeInput")?.value || byId("firstSize")?.textContent || ""));
		const secondSize = Number(keepDigitsOnly(byId("boxSecondSizeInput")?.value || byId("secondSize")?.textContent || ""));
		const outside = termStoneRelicActive ? solution.outsideSign : manualOutsideSign;
		const operation = termStoneRelicActive ? "-" : manualOperation;

		if (!outside || !operation || !firstSize || !secondSize) {
			setText("boxFeedback", "Finish the outside sign, operation, and both box sizes first.");
			byId("boxFeedback").className = "feedback warning-text";
			return;
		}

		if (outside !== solution.outsideSign || operation !== solution.operation || firstSize !== solution.firstSize || secondSize !== solution.secondSize) {
			setText("boxFeedback", markMistake("Not yet. The larger size goes first, the smaller size goes second, and the larger sign goes outside."));
			byId("boxFeedback").className = "feedback bad-text";
			return;
		}

		boxComplete = true;
		pickedBigger = true;
		pickedSmaller = true;
		boxData = Object.assign({}, solution);
		setText("outsideSign", displaySign(solution.outsideSign));
		setText("firstSize", solution.firstSize);
		setText("insideOperation", displaySign(solution.operation));
		setText("secondSize", solution.secondSize);
		lockBoxStepControls();
		setText("boxFeedback", "Box confirmed. Now simplify it.");
		byId("boxFeedback").className = "feedback good-text";
		markCorrectStep();
		showFinalStep();
	}
	function selectFinalAnswerSign(sign) {
		finalAnswerSign = sign === "-" ? "-" : "+";
		byId("chooseFinalPositive")?.classList.toggle("selected", finalAnswerSign === "+");
		byId("chooseFinalNegative")?.classList.toggle("selected", finalAnswerSign === "-");
		setText("answerPreviewSign", displaySign(finalAnswerSign));
		setText("finalFeedback", "Now type the answer size.");
		byId("finalFeedback").className = "feedback";
		updateFinalAnswerPreview();
		byId("finalAnswerInput")?.focus();
	}

	function updateFinalAnswerPreview() {
		const input = byId("finalAnswerInput");
		if (!input) return;
		input.value = keepDigitsOnly(input.value);
		setText("answerPreviewSign", finalAnswerSign ? displaySign(finalAnswerSign) : "?");
		setText("answerPreviewSize", input.value || "__");
		byId("answerPreview")?.classList.toggle("filled", Boolean(finalAnswerSign && input.value));
	}

	function checkFinalAnswer() {
		startClimbTimer();

		if (!boxComplete) {
			setText("finalFeedback", "Build the box first.");
			byId("finalFeedback").className = "feedback bad-text";
			return;
		}

		if (finalAnswered) return;

		const input = byId("finalAnswerInput");
		if (!input) return;
		input.value = keepDigitsOnly(input.value);
		updateFinalAnswerPreview();
		const answerSize = Number(input.value);
		const correctSize = Math.abs(currentProblem.finalValue);
		const correctSign = getCorrectFinalSign();

		if (!finalAnswerSign) {
			setText("finalFeedback", "Warning! Be sure to choose a sign.");
			byId("finalFeedback").className = "feedback warning-text";
			return;
		}

		if (!input.value) {
			input.style.borderColor = "#f2b84b";
			setText("finalFeedback", "Warning! Make sure you fill in the size.");
			byId("finalFeedback").className = "feedback warning-text";
			return;
		}

		if (finalAnswerSign !== correctSign) {
			input.style.borderColor = "#ef7777";
			setText("finalFeedback", markMistake("Not yet. The final sign comes from the bigger total outside the box."));
			byId("finalFeedback").className = "feedback bad-text";
			return;
		}

		if (answerSize !== correctSize) {
			input.style.borderColor = "#ef7777";
			setText("finalFeedback", markMistake("Not yet. Subtract the smaller size from the bigger size."));
			byId("finalFeedback").className = "feedback bad-text";
			return;
		}

		finalAnswered = true;
		input.style.borderColor = "#6cc070";
		setText("answerPreviewSign", displaySign(correctSign));
		setText("answerPreviewSize", correctSize);
		byId("answerPreview")?.classList.add("filled");
		setText("finalFeedback", "✅ Correct final answer.");
		byId("finalFeedback").className = "feedback good-text";
		setFinalStepLocked(true);
		completeRoundAfterFinalAnswer();
	}

	function resetRoundUI() {
		setText("problemDisplay", currentProblem.original);
		byId("signFixStep")?.classList.remove("hidden");
		byId("sortStep")?.classList.add("hidden");
		byId("totalStep")?.classList.add("hidden");
		byId("totalStep")?.classList.remove("relic-safe-step");
		byId("boxStep")?.classList.add("hidden");
		byId("boxStep")?.classList.remove("is-locked");
		byId("boxStep")?.classList.remove("relic-safe-step");
		setFinalStepLocked(false);
		byId("finalStep")?.classList.add("hidden");

		["signFeedback", "sortFeedback", "totalFeedback", "boxFeedback", "finalFeedback"].forEach(id => setText(id, ""));
		["plusTeam", "minusTeam", "termBank", "totalButtons", "choiceGrid", "positiveTeamList", "negativeTeamList"].forEach(id => {
			const element = byId(id);
			if (element) element.innerHTML = "";
		});

		setText("outsideSign", "?");
		setText("firstSize", "__");
		setText("insideOperation", displaySign("-"));
		setText("secondSize", "__");
		setText("finalOutsideSign", "?");
		setText("finalFirstSize", "__");
		setText("finalInsideOperation", displaySign("-"));
		setText("finalSecondSize", "__");
		finalAnswerSign = null;
		sortConfirmed = false;
		manualOutsideSign = null;
		manualOperation = null;
		boxData = {};
		signCompassRelicActive = false;
		termStoneRelicActive = false;
		totalsConfirmed = false;
		boxComplete = false;
		const finalInput = byId("finalAnswerInput");
		if (finalInput) {
			finalInput.value = "";
			finalInput.style.borderColor = "#b9dcff";
		}
		setText("answerPreviewSign", "?");
		setText("answerPreviewSize", "__");
		byId("answerPreview")?.classList.remove("filled");
		byId("chooseFinalPositive")?.classList.remove("selected");
		byId("chooseFinalNegative")?.classList.remove("selected");
		["positiveTotalInput", "negativeTotalInput", "boxFirstSizeInput", "boxSecondSizeInput"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.value = "";
			input.disabled = false;
			input.removeAttribute("aria-disabled");
			input.style.borderColor = "";
		});
		document.querySelectorAll(".manual-sign-btn, .manual-op-btn").forEach(button => {
			button.classList.remove("selected");
			button.disabled = false;
			button.removeAttribute("aria-disabled");
		});
		document.querySelectorAll("#signCompassAssist, #termStoneAssist").forEach(card => card.classList.remove("is-active", "relic-safe-step"));
		const confirmSortButton = byId("confirmSortButton");
		if (confirmSortButton) {
			confirmSortButton.disabled = false;
			confirmSortButton.removeAttribute("aria-disabled");
			confirmSortButton.classList.remove("is-play-armed");
			confirmSortButton.removeAttribute("data-trial-armed");
		}

		renderChoices();
	}

	function startRound() {
		currentProblem = generateProblem();
		selectedTerm = null;
		runCorrectCount = 0;
		mistakesThisRound = 0;
		roundScoreAwarded = false;
		sortConfirmed = false;
		boxPickStep = 0;
		pickedBigger = false;
		pickedSmaller = false;
		totalsConfirmed = false;
		boxComplete = false;
		signCompassRelicActive = false;
		termStoneRelicActive = false;
		manualOutsideSign = null;
		manualOperation = null;
		boxData = {};
		finalAnswered = false;
		setNextClimbLocked(true);
		resetRoundUI();
		updateTurtleBoard();
	}

	function nextClimb() {
		if (turtleScore >= 10) {
			completePlayProgress();
			showAchievementPopup();
			return false;
		}

		stage++;
		stopClimbTimer(false);
		startRound();

		byId("climbStartGate")?.classList.add("hidden");
		byId("playArea")?.classList.remove("hidden");
		setChallengeMessage(`Stage ${stage}: Climb ${getRequiredProgressSteps()} clean steps to score.`);
		updateTurtleBoard();

		if (shell()) {
			shell().applyProgressThemeByScore(turtleScore, true);
			shell().startNextClimbTimer();
		} else {
			startClimbTimer();
		}

		scrollToStepOneStart();
		return true;
	}

	function showAchievementPopup() {
		if (achievementShown) return;
		achievementShown = true;
		completePlayProgress();
		stopClimbTimer(true);
		setNextClimbLocked(true);
		startConfetti();

		const input = byId("playerNameInput");
		if (input) input.value = "";

		const popup = byId("namePopup");
		if (popup) popup.style.display = "flex";
		document.body.classList.add("modal-open");

		window.setTimeout(() => input?.focus(), 200);
	}

	function closeCertificatePopup() {
		const certificatePopup = byId("certificatePopup");
		if (certificatePopup) certificatePopup.style.display = "none";
		document.body.classList.remove("modal-open");
		stopConfetti();

		const params = new URLSearchParams(window.location.search);
		if (params.get("from") === "cabin" && params.get("mode") === "redownload") {
			try {
				sessionStorage.setItem("mathRidge_open_section", "cabin");
			} catch (error) {}
			window.location.href = "index.html";
			return;
		}

		if (turtleScore >= 10) scrollToBottomControls(180);
	}

	function savePlayCertificateProgress({ studentName, formattedDate, formattedTime, raceTimeText, rankMessage }) {
		if (typeof shell()?.saveTrailProgress === "function") {
			return shell().saveTrailProgress({
				id: PLAY_ID,
				studentName,
				displayDate: formattedDate,
				displayTime: formattedTime,
				timeDisplay: raceTimeText,
				rank: latestRaceRank,
				rankText: rankMessage,
				score: turtleScore,
				stage
			});
		}

		const certData = {
			completed: true,
			id: PLAY_ID,
			section: PLAY_SECTION,
			title: PLAY_TITLE,
			playFile: "play3.html",
			studentName: studentName || "Math Ridge Champion",
			completedAt: new Date().toISOString(),
			displayDate: formattedDate,
			displayTime: formattedTime,
			racingLabel: "Trail 1-3",
			raceTime: raceTimeText || formatRaceTime(getRaceMs()),
			rankText: rankMessage || ""
		};

		localStorage.setItem(PLAY_COMPLETE_KEY, "true");
		localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
		localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
		localStorage.setItem(PLAY_CERT_KEY, JSON.stringify(certData));
	}

	async function submitWorldRecord(name, timeMs) {
		if (shell() && typeof shell().submitWorldRecord === "function") {
			const result = await shell().submitWorldRecord(name, timeMs);
			if (result) return result;
		}

		const timeSeconds = Math.max(1, Math.round(Number(timeMs || 0) / 1000));
		const response = await fetch(GLOBAL_RECORD_FALLBACK, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ game: "play3", name, timeSeconds })
		});

		const data = await response.json();
		if (!data.ok) throw new Error(data.error || "Could not save record.");
		return data;
	}

	async function createCertificateFromName() {
		const nameInput = byId("playerNameInput");
		const finalName = safeText(nameInput?.value || "") || "Math Ridge Champion";
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

		setText("certName", finalName);
		setText("certRaceTime", "");
		setText("certRank", "");
		setText("certDate", `Completed on ${formattedDate}`);

		savePlayCertificateProgress({
			studentName: finalName,
			formattedDate,
			formattedTime,
			raceTimeText,
			rankMessage
		});

		if (button) {
			button.disabled = false;
			button.textContent = "Create My Certificate";
		}

		const namePopup = byId("namePopup");
		const certificatePopup = byId("certificatePopup");
		if (namePopup) namePopup.style.display = "none";
		if (certificatePopup) certificatePopup.style.display = "flex";
		document.body.classList.add("modal-open");
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
				piece.style.background = colors[randomInt(0, colors.length - 1)];
				piece.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
				piece.style.transform = `rotate(${Math.random() * 180}deg)`;
				layer.appendChild(piece);
				window.setTimeout(() => piece.remove(), 4500);
			}
		}, 180);

		window.setTimeout(stopConfetti, 6500);
	}

	function stopConfetti() {
		if (confettiTimer) {
			window.clearInterval(confettiTimer);
			confettiTimer = null;
		}
		const layer = byId("confettiLayer");
		if (layer) layer.innerHTML = "";
	}

	function drawParchmentTexture(ctx, width, height) {
		ctx.save();
		ctx.globalAlpha = 0.08;
		for (let i = 0; i < 1400; i++) {
			const x = Math.random() * width;
			const y = Math.random() * height;
			const radius = Math.random() * 2.2 + 0.4;
			ctx.fillStyle = Math.random() > 0.5 ? "#9b6b2f" : "#fff7d8";
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 0.12;
		for (let y = 120; y < height - 120; y += 34) {
			ctx.strokeStyle = "#c89d54";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(120, y + Math.sin(y) * 3);
			ctx.bezierCurveTo(width * 0.33, y - 5, width * 0.66, y + 5, width - 120, y - 2);
			ctx.stroke();
		}
		ctx.restore();
	}

	function saveCertificateImage() {
		let certData = {};
		try {
			certData = JSON.parse(localStorage.getItem(PLAY_CERT_KEY) || "{}");
		} catch (error) {}

		const name = byId("certName")?.textContent || certData.studentName || "Math Ridge Champion";
		const completedDate = byId("certDate")?.textContent || `Completed on ${certData.displayDate || ""}`;

		if (shell()?.downloadOfficialCertificate) {
			shell().downloadOfficialCertificate({
				studentName: name,
				certificateTitle: PLAY_TITLE,
				bodyText: "for demonstrating fluency with stacked signs and parity-based sign simplification.",
				dateText: completedDate,
				signature: CERT_SIGNATURE,
				filename: "math-ridge-sign-simplification-fluency-certificate.png"
			});
			return;
		}

		const canvas = document.createElement("canvas");
		canvas.width = 1400;
		canvas.height = 1050;
		const ctx = canvas.getContext("2d");

		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, "#fffaf0");
		gradient.addColorStop(0.5, "#fff0c8");
		gradient.addColorStop(1, "#f7df9e");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		drawParchmentTexture(ctx, canvas.width, canvas.height);

		ctx.strokeStyle = "#7a4b00";
		ctx.lineWidth = 16;
		ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
		ctx.strokeStyle = "#d4a73c";
		ctx.lineWidth = 8;
		ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);
		ctx.strokeStyle = "rgba(122, 75, 0, 0.55)";
		ctx.lineWidth = 3;
		ctx.strokeRect(96, 96, canvas.width - 192, canvas.height - 192);

		ctx.textAlign = "center";
		ctx.fillStyle = "#7a4b00";
		ctx.font = "bold 72px Georgia";
		ctx.fillText("Math Ridge", 700, 170);

		ctx.fillStyle = "#24304f";
		ctx.font = "bold 56px Georgia";
		ctx.fillText("Certificate of Achievement", 700, 275);

		ctx.fillStyle = "#b87900";
		ctx.font = "bold 46px Georgia";
		ctx.fillText("Sign Simplification Fluency", 700, 350);

		ctx.fillStyle = "#24304f";
		ctx.font = "30px Georgia";
		ctx.fillText("Presented to", 700, 430);

		ctx.fillStyle = "#0f5a9a";
		ctx.font = "bold 62px Georgia";
		ctx.fillText(name, 700, 510);

		ctx.strokeStyle = "#d4a73c";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(390, 535);
		ctx.lineTo(1010, 535);
		ctx.stroke();

		ctx.fillStyle = "#24304f";
		ctx.font = "30px Georgia";
		ctx.fillText("for demonstrating fluency with stacked signs", 700, 610);
		ctx.fillText("and parity-based sign simplification.", 700, 650);

		ctx.fillStyle = "#24304f";
		ctx.font = "28px Georgia";
		ctx.fillText(completedDate, 700, 735);

		ctx.fillStyle = "#7a4b00";
		ctx.font = "italic 30px Georgia";
		ctx.fillText(CERT_SIGNATURE, 700, 890);

		const link = document.createElement("a");
		link.download = "math-ridge-play-1-3-certificate.webp";
		link.href = canvas.toDataURL("image/webp", 0.92);
		link.click();
	}

	function openSavedCertificateFromCabin() {
		const params = new URLSearchParams(window.location.search);
		if (params.get("certificate") !== PLAY_ID || params.get("mode") !== "redownload") return;

		let certData = {};
		try {
			certData = JSON.parse(localStorage.getItem(PLAY_CERT_KEY) || "{}");
		} catch (error) {}

		if (!certData.completed) return;

		setText("certName", certData.studentName || "Math Ridge Champion");
		setText("certRaceTime", "");
		setText("certRank", "");
		setText("certDate", `Completed on ${certData.displayDate || ""}`);
		const popup = byId("certificatePopup");
		if (popup) popup.style.display = "flex";
		document.body.classList.add("modal-open");
	}

	function attachEvents() {
		document.querySelectorAll(".zone").forEach(zone => {
			zone.addEventListener("click", () => placeSelectedTerm(zone));
		});

		const finalInput = byId("finalAnswerInput");
		if (finalInput) {
			finalInput.addEventListener("input", updateFinalAnswerPreview);
			finalInput.addEventListener("keydown", event => {
				if (event.key === "Enter") checkFinalAnswer();
			});
		}

		["positiveTotalInput", "negativeTotalInput", "boxFirstSizeInput", "boxSecondSizeInput"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.addEventListener("input", () => {
				input.value = keepDigitsOnly(input.value);
				if (id === "boxFirstSizeInput" || id === "boxSecondSizeInput") updateManualBoxPreview();
			});
			input.addEventListener("keydown", event => {
				if (event.key === "Enter") {
					if (id === "positiveTotalInput" || id === "negativeTotalInput") confirmTeamTotals();
					else checkBoxSetup();
				}
			});
		});

		document.addEventListener("keydown", event => {
			if (event.key !== "Escape") return;

			if (window.closeLadderPopup) window.closeLadderPopup();

			const namePopup = byId("namePopup");
			if (namePopup && namePopup.style.display === "flex") {
				namePopup.style.display = "none";
				document.body.classList.remove("modal-open");
			}

			const certificatePopup = byId("certificatePopup");
			if (certificatePopup && certificatePopup.style.display === "flex") closeCertificatePopup();
		});
	}

	function initPlay3() {
		attachEvents();
		resetRaceTimer();
		startRound();
		showClimbGate();
		setNextClimbLocked(true);
		window.setTimeout(openSavedCertificateFromCabin, 350);
	}

	window.MathRidgeLocal = {
		getScore: () => turtleScore,
		getStage: () => stage,
		getRequiredProgressSteps: () => getRequiredProgressSteps()
	};

	window.startClimbFromGate = startClimbFromGate;
	window.checkSignChoice = checkSignChoice;
	window.confirmSortTeams = confirmSortTeams;
	window.useSignCompassRelic = useSignCompassRelic;
	window.confirmTeamTotals = confirmTeamTotals;
	window.useTermStoneRelic = useTermStoneRelic;
	window.selectBoxOutsideSign = selectBoxOutsideSign;
	window.selectBoxOperation = selectBoxOperation;
	window.checkBoxSetup = checkBoxSetup;
	window.selectFinalAnswerSign = selectFinalAnswerSign;
	window.checkFinalAnswer = checkFinalAnswer;
	window.nextClimb = nextClimb;
	window.createCertificateFromName = createCertificateFromName;
	window.closeCertificatePopup = closeCertificatePopup;
	window.saveCertificateImage = saveCertificateImage;

	initPlay3();
})();
