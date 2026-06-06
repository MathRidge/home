/* Math Ridge Play 1-5 local game: Fraction Reduction.
   The global shell owns timer, top shelf, ladder, background, and Next Climb visibility. */
(function () {
	"use strict";

	const PLAY_ID = "2_1";
	const PLAY_SECTION = "2-1";
	const PLAY_TITLE = "Fraction Equivalence and Reduction";
	const PLAY_COMPLETE_KEY = "mathRidge_playComplete_2_1";
	const PLAY_CERT_KEY = "mathRidge_cert_2_1";
	const NEXT_NOTE_UNLOCK_KEY = "mathRidge_noteUnlocked_2_2";
	const NEXT_STAGE_UNLOCK_KEY = "mathRidge_stageUnlocked_2_2";
	const CERT_SIGNATURE = "Presented by Math Ridge Creator: Kuan-Yuan Huang";
	const TOTAL_STEPS = 12;
	const GROUPS = [2, 3, 5];

	const BASE_FRACTION_PAIRS = [
		[2, 7], [2, 9], [3, 8], [4, 7], [4, 9],
		[5, 6], [5, 8], [5, 9], [3, 7], [2, 5]
	];

	const PROBLEM_PATHS = {
		1: [[2], [3], [5]],
		2: [[2, 2], [2, 3], [2, 5], [3, 3], [3, 5]],
		3: [[2, 2, 2], [2, 2, 3], [2, 2, 5], [2, 3, 3], [2, 3, 5], [3, 3, 3]],
		4: [[2, 2, 2, 2], [2, 2, 2, 3], [2, 2, 3, 3], [2, 2, 3, 5]]
	};

	const usedProblemKeysByDepth = {
		1: new Set(),
		2: new Set(),
		3: new Set(),
		4: new Set()
	};

	let current = null;
	let turtleScore = 0;
	let stage = 1;
	let stageStarted = false;
	let pageHasStartedClimb = false;
	let runCorrectCount = 0;
	let mistakesThisGame = 0;
	let gameScoreAwarded = false;
	let finalAnswered = false;
	let achievementShown = false;
	let confettiTimer = null;
	let progressThemeTimer = null;
	let reductionCycle = 0;
	let completedSteps = new Set();
	let latestRaceRank = null;
	let latestSavedRaceSeconds = null;

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

	function formatRaceTime(ms) {
		return shell()?.formatRaceTime ? shell().formatRaceTime(ms) : fallbackFormatRaceTime(ms);
	}

	function fallbackFormatRaceTime(ms) {
		const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	}

	function getRaceMs() {
		return shell()?.getTotalRaceMs ? shell().getTotalRaceMs() : 0;
	}

	function rankText(rank) {
		if (rank === 1) return "🥇 1st Place World Time Champion";
		if (rank === 2) return "🥈 2nd Place World Time";
		if (rank === 3) return "🥉 3rd Place World Time";
		return "";
	}

	function touchClimbTimer() {
		if (!pageHasStartedClimb || !stageStarted || turtleScore >= 10 || finalAnswered) return;
		shell()?.startClimbTimer?.();
	}

	function stopClimbTimer(addToTotal = true) {
		shell()?.stopClimbTimer?.(addToTotal);
	}

	function resetRaceTimer() {
		shell()?.resetRaceTimer?.();
	}

	function hideNextClimb() {
		if (shell()?.hideNextClimbButton) {
			shell().hideNextClimbButton({ force: true });
			return;
		}

		const button = byId("nextClimbButton");
		if (!button) return;
		button.classList.add("hidden", "locked-button");
		button.hidden = true;
		button.disabled = true;
		button.setAttribute("disabled", "disabled");
	}

	function completePlayProgress() {
		try {
			localStorage.setItem(PLAY_COMPLETE_KEY, "true");
			localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
			localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
		} catch (error) {
			// Local storage may be unavailable in restricted previews.
		}
	}

	function randomItem(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	function isHintLevel() { return turtleScore <= 3; }
	function isMiddleLevel() { return turtleScore >= 4 && turtleScore <= 6; }
	function isHardLevel() { return turtleScore >= 7 && turtleScore <= 9; }

	function targetDepth() {
		if (isHardLevel()) return 3;
		if (isMiddleLevel()) return 2;
		return 1;
	}

	function multiplyFactors(factors) {
		return factors.reduce((product, factor) => product * factor, 1);
	}

	function makeProblemKey(depth, top, bottom) {
		return `${depth}:${top}/${bottom}`;
	}

	function buildProblemDeck(depth) {
		const paths = PROBLEM_PATHS[depth] || PROBLEM_PATHS[3];
		const deck = [];

		BASE_FRACTION_PAIRS.forEach(([baseTop, baseBottom]) => {
			paths.forEach(path => {
				const multiplier = multiplyFactors(path);
				const top = baseTop * multiplier;
				const bottom = baseBottom * multiplier;
				deck.push({
					key: makeProblemKey(depth, top, bottom),
					originalTop: top,
					originalBottom: bottom,
					top,
					bottom,
					baseTop,
					baseBottom,
					factors: [...path]
				});
			});
		});

		return deck;
	}

	function makeProblem() {
		const depth = targetDepth();
		const deck = buildProblemDeck(depth);
		let unusedDeck = deck.filter(problem => !usedProblemKeysByDepth[depth].has(problem.key));

		if (unusedDeck.length === 0) {
			usedProblemKeysByDepth[depth].clear();
			unusedDeck = deck;
		}

		const made = randomItem(unusedDeck);
		usedProblemKeysByDepth[depth].add(made.key);

		current = {
			originalTop: made.originalTop,
			originalBottom: made.originalBottom,
			top: made.top,
			bottom: made.bottom,
			baseTop: made.baseTop,
			baseBottom: made.baseBottom,
			factors: [...made.factors],
			chosenGroup: null,
			history: [`${made.top}/${made.bottom}`],
			finished: false
		};
	}

	function fractionHTML(top, bottom) {
		return `<span class="fraction"><span class="top">${top}</span><span class="bottom">${bottom}</span></span>`;
	}

	function fractionTrailHTML() {
		return current.history.map((item, index) => {
			const [top, bottom] = item.split("/");
			const isCurrent = index === current.history.length - 1;
			const fractionClass = isCurrent ? "current-fraction" : "past-fraction";
			const arrow = index < current.history.length - 1 ? '<span class="trail-arrow">→</span>' : "";
			return `<span class="trail-fraction ${fractionClass}">${fractionHTML(top, bottom)}</span>${arrow}`;
		}).join("");
	}

	function updateFractionDisplay() {
		const display = byId("fractionDisplay");
		if (display) display.innerHTML = fractionTrailHTML();
	}

	function sharedGroups() {
		return GROUPS.filter(group => current.top % group === 0 && current.bottom % group === 0);
	}

	function setHint(id, text) {
		const box = byId(id);
		if (!box) return;
		box.textContent = text;
		box.classList.toggle("hidden-hint", !isHintLevel());
	}

	function updateHints() {
		setHint("choiceHint", "Check both shelves. Can both group by 2, by 3, or by 5? If none work, choose “It’s completely reduced.”");
		if (current.chosenGroup) {
			setHint("topHint", `${current.top} should be written as something(${current.chosenGroup}).`);
			setHint("bottomHint", `${current.bottom} should be written as something(${current.chosenGroup}).`);
			setHint("shrinkHint", `After the matching (${current.chosenGroup}) drops out, keep the outside numbers.`);
		}
	}

	function renderGroupChoices() {
		const box = byId("groupChoices");
		if (!box) return;
		box.innerHTML = "";

		const choices = [
			{ text: "Group by 2s", value: 2 },
			{ text: "Group by 3s", value: 3 },
			{ text: "Group by 5s", value: 5 },
			{ text: "It’s completely reduced", value: null }
		];

		choices.forEach(item => {
			const choice = document.createElement("button");
			choice.type = "button";
			choice.className = "choice";
			choice.textContent = item.text;
			choice.onclick = () => handleGroupChoice(choice, item.value);
			box.appendChild(choice);
		});
	}

	function exampleGuideHTML() {
		return `
			<details class="example-guide">
				<summary>Need an example?</summary>
				<p>Example: four 3s can be written as <strong>4(3)</strong>.</p>
			</details>
		`;
	}

	function prepareRewriteSteps() {
		byId("topPrompt").innerHTML = `
			Rewrite the top shelf number: <b class="focus-number">${current.top}</b>.
			How many groups of <strong>${current.chosenGroup}</strong> are inside it?
			${exampleGuideHTML()}
		`;
		byId("bottomPrompt").innerHTML = `
			Rewrite the bottom shelf number: <b class="focus-number">${current.bottom}</b>.
			How many groups of <strong>${current.chosenGroup}</strong> are inside it?
			${exampleGuideHTML()}
		`;
		updateHints();
		prepareCurrentInputFlow();
	}

	function keepDigitsOnly(input, maxLength = null) {
		let cleaned = input.value.replace(/\D/g, "");
		if (maxLength !== null) cleaned = cleaned.slice(0, maxLength);
		input.value = cleaned;
		return cleaned;
	}

	function focusNextField(nextInput) {
		if (!nextInput) return;
		window.setTimeout(() => {
			nextInput.focus();
			nextInput.select();
		}, 40);
	}

	function configurePairInputs(firstId, secondId, firstExpected, secondExpected, doneSelector = null) {
		const firstInput = byId(firstId);
		const secondInput = byId(secondId);
		if (!firstInput || !secondInput) return;

		const firstLength = String(firstExpected || "").length;
		const secondLength = String(secondExpected || "").length;

		firstInput.maxLength = firstLength;
		secondInput.maxLength = secondLength;

		firstInput.oninput = () => {
			touchClimbTimer();
			const raw = firstInput.value.replace(/\D/g, "");
			if (raw.length > firstLength) {
				firstInput.value = raw.slice(0, firstLength);
				secondInput.value = raw.slice(firstLength, firstLength + secondLength);
				focusNextField(secondInput);
				return;
			}
			firstInput.value = raw.slice(0, firstLength);
			if (firstInput.value.length >= firstLength) focusNextField(secondInput);
		};

		secondInput.oninput = () => {
			touchClimbTimer();
			keepDigitsOnly(secondInput, secondLength);
			if (secondInput.value.length >= secondLength && doneSelector) {
				window.setTimeout(() => document.querySelector(doneSelector)?.focus(), 40);
			}
		};
	}

	function prepareCurrentInputFlow() {
		if (!current || !current.chosenGroup) return;
		const group = current.chosenGroup;
		configurePairInputs("topOuterInput", "topInnerInput", current.top / group, group, "#topStep button");
		configurePairInputs("bottomOuterInput", "bottomInnerInput", current.bottom / group, group, "#bottomStep button");
		configurePairInputs("newTopInput", "newBottomInput", current.top / group, current.bottom / group, "#shrinkStep button");
	}

	function handleGroupChoice(choice, selected) {
		if (finalAnswered) return;
		if (!stageStarted) {
			const feedback = byId("feedback");
			if (feedback) feedback.textContent = "Press START the Climb first. The timer begins when the question is uncovered.";
			return;
		}

		touchClimbTimer();
		if (choice.classList.contains("correct-flash")) return;

		const possibleGroups = sharedGroups();
		const noGroupLeft = possibleGroups.length === 0;
		const isCorrectGroup = selected !== null && possibleGroups.includes(selected);
		const isCorrectFinish = selected === null && noGroupLeft;

		if (isCorrectGroup || isCorrectFinish) {
			choice.classList.add("correct-flash");
			const feedback = byId("feedback");
			if (feedback) {
				feedback.textContent = "✅ Correct. Keep going.";
				feedback.className = "feedback good-text";
			}

			if (isCorrectFinish) {
				finishProblem();
			} else {
				current.chosenGroup = selected;
				markCorrectStep(`group-${reductionCycle}`);
				prepareRewriteSteps();
				showStep("topStep", "topOuterInput");
			}
			return;
		}

		choice.classList.add("wrong-flash");
		const feedback = byId("feedback");
		if (feedback) {
			feedback.textContent = selected === null
				? "Not yet. Both shelves can still share a group of 2, 3, or 5."
				: `Not yet. Both shelves must fit into groups of ${selected}. Try another choice.`;
			feedback.className = "feedback bad-text";
		}
		markMistake();
		window.setTimeout(() => choice.classList.remove("wrong-flash"), 550);
	}

	function checkTopRewrite() {
		if (!stageStarted) {
			setText("feedback", "Press START the Climb first.");
			return;
		}
		touchClimbTimer();

		const outer = Number(byId("topOuterInput").value.trim());
		const inner = Number(byId("topInnerInput").value.trim());
		const box = byId("topFeedback");
		const expectedOuter = current.top / current.chosenGroup;

		if (outer === expectedOuter && inner === current.chosenGroup) {
			if (box) {
				box.textContent = `✅ Correct. ${current.top} can be written as ${expectedOuter}(${current.chosenGroup}).`;
				box.className = "feedback good-text";
			}
			markCorrectStep(`top-${reductionCycle}`);
			showStep("bottomStep", "bottomOuterInput");
			return;
		}

		if (box) {
			box.textContent = `Not yet. The inside value should be ${current.chosenGroup}. What outside number makes the top shelf?`;
			box.className = "feedback bad-text";
		}
		markMistake();
	}

	function checkBottomRewrite() {
		if (!stageStarted) {
			setText("feedback", "Press START the Climb first.");
			return;
		}
		touchClimbTimer();

		const outer = Number(byId("bottomOuterInput").value.trim());
		const inner = Number(byId("bottomInnerInput").value.trim());
		const box = byId("bottomFeedback");
		const expectedOuter = current.bottom / current.chosenGroup;

		if (outer === expectedOuter && inner === current.chosenGroup) {
			if (box) {
				box.textContent = `✅ Correct. ${current.bottom} can be written as ${expectedOuter}(${current.chosenGroup}).`;
				box.className = "feedback good-text";
			}
			markCorrectStep(`bottom-${reductionCycle}`);
			prepareShrinkStep();
			showStep("shrinkStep", "newTopInput");
			return;
		}

		if (box) {
			box.textContent = `Not yet. The bottom shelf must also use (${current.chosenGroup}).`;
			box.className = "feedback bad-text";
		}
		markMistake();
	}

	function prepareShrinkStep() {
		const newTop = current.top / current.chosenGroup;
		const newBottom = current.bottom / current.chosenGroup;
		byId("rewritePreview").innerHTML = `
			${fractionHTML(`${newTop}(${current.chosenGroup})`, `${newBottom}(${current.chosenGroup})`)}
			<span>→</span>
			${fractionHTML("?", "?")}
		`;
		updateHints();
		prepareCurrentInputFlow();
	}

	function checkShrink() {
		if (!stageStarted) {
			setText("feedback", "Press START the Climb first.");
			return;
		}
		touchClimbTimer();

		const newTop = Number(byId("newTopInput").value.trim());
		const newBottom = Number(byId("newBottomInput").value.trim());
		const box = byId("shrinkFeedback");
		const expectedTop = current.top / current.chosenGroup;
		const expectedBottom = current.bottom / current.chosenGroup;

		if (newTop === expectedTop && newBottom === expectedBottom) {
			if (box) {
				box.textContent = `✅ Correct. The smaller name is ${expectedTop}/${expectedBottom}.`;
				box.className = "feedback good-text";
			}

			markCorrectStep(`shrink-${reductionCycle}`);
			current.top = expectedTop;
			current.bottom = expectedBottom;
			current.history.push(`${current.top}/${current.bottom}`);
			current.chosenGroup = null;
			reductionCycle += 1;

			resetCycleSteps();
			updateFractionDisplay();
			renderGroupChoices();
			updateHints();
			setText("instruction", "Nice reduction. Check the new fraction again: group by 2, group by 3, group by 5, or completely reduced.");
			setText("groupChoiceTitle", "After simplifying, both shelves can still...");
			showActiveChoiceArea();
			const feedback = byId("feedback");
			if (feedback) {
				feedback.textContent = "✅ Smaller name found. Keep checking until no shared group remains.";
				feedback.className = "feedback good-text";
			}
			return;
		}

		if (box) {
			box.textContent = "Not yet. Drop the matching group and keep the outside numbers.";
			box.className = "feedback bad-text";
		}
		markMistake();
	}

	function resetCycleSteps() {
		["topStep", "bottomStep", "shrinkStep"].forEach(id => byId(id)?.classList.add("hidden"));
		["topFeedback", "bottomFeedback", "shrinkFeedback"].forEach(id => {
			const box = byId(id);
			if (!box) return;
			box.textContent = "";
			box.className = "feedback";
		});
		["topOuterInput", "topInnerInput", "bottomOuterInput", "bottomInnerInput", "newTopInput", "newBottomInput"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.value = "";
			input.style.borderColor = "#b9dcff";
		});
		const preview = byId("rewritePreview");
		if (preview) preview.innerHTML = "";
	}

	function finishProblem() {
		if (finalAnswered) return;
		current.finished = true;
		showCompleteStep();
		completeRoundAfterFinalAnswer();
	}

	function showCompleteStep() {
		byId("completedFlow").innerHTML = current.history
			.map(item => `<span class="flow-piece">${item}</span>`)
			.join("<span>→</span>");
		const feedback = byId("feedback");
		if (feedback) {
			feedback.textContent = "✅ Complete. This fraction cannot group further using 2, 3, or 5.";
			feedback.className = "feedback good-text";
		}
		showOnlyPanel("completeStep", { focus: true });
	}

	function allPanelIds() {
		return ["choiceStep", "topStep", "bottomStep", "shrinkStep", "completeStep"];
	}

	function showOnlyPanel(activeId, options = { focus: true }) {
		allPanelIds().forEach(id => {
			const panel = byId(id);
			if (!panel) return;
			panel.classList.toggle("hidden", id !== activeId);
			panel.classList.toggle("focus-page", id === activeId && activeId !== "choiceStep");
		});
		if (options.focus) focusPremiumView(activeId);
	}

	function showActiveChoiceArea(options = { focus: true }) {
		showOnlyPanel("choiceStep", options);
	}

	function showStep(stepId, focusId) {
		showOnlyPanel(stepId);
		if (focusId) {
			window.setTimeout(() => {
				const target = byId(focusId);
				if (target?.focus) target.focus({ preventScroll: true });
			}, 420);
		}
	}

	function focusPremiumView(id) {
		if (id === "choiceStep") {
			focusQuestionView();
			return;
		}

		if (id === "completeStep") {
			focusCompleteView();
			return;
		}

		const element = byId(id);
		if (!element) return;
		window.setTimeout(() => {
			const rect = element.getBoundingClientRect();
			const shelf = document.querySelector(".challenge-board");
			const fixedTop = shelf ? shelf.getBoundingClientRect().height + 12 : 130;
			const available = window.innerHeight - fixedTop;
			const targetTop = window.scrollY + rect.top - fixedTop + (rect.height / 2) - (available / 2);
			window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
		}, 120);
	}

	function focusQuestionView() {
		const currentTopShelf = document.querySelector("#fractionDisplay .current-fraction .fraction .top") || document.querySelector("#fractionDisplay .fraction .top");
		const fallback = byId("problemCard");
		const element = currentTopShelf || fallback;
		if (!element) return;
		window.setTimeout(() => {
			const shelf = document.querySelector(".challenge-board");
			const fixedTop = shelf ? shelf.getBoundingClientRect().height + 12 : 130;
			const rect = element.getBoundingClientRect();
			const targetTop = window.scrollY + rect.top - fixedTop - 16;
			window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
		}, 120);
	}

	function focusCompleteView() {
		const element = byId("completeStep") || byId("completeMessage");
		if (!element) return;
		window.setTimeout(() => {
			const shelf = document.querySelector(".challenge-board");
			const fixedTop = shelf ? shelf.getBoundingClientRect().height + 12 : 130;
			const rect = element.getBoundingClientRect();
			const available = window.innerHeight - fixedTop;
			const targetTop = window.scrollY + rect.top - fixedTop + (rect.height / 2) - (available / 2);
			window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
		}, 160);
	}

	function resetProblemOnly() {
		const feedback = byId("feedback");
		if (feedback) {
			feedback.textContent = "";
			feedback.className = "feedback";
		}
		resetCycleSteps();
		byId("completeStep")?.classList.add("hidden");
		const completedFlow = byId("completedFlow");
		if (completedFlow) completedFlow.innerHTML = "";
	}

	function startNewProblem(options = {}) {
		const resetClimbProgress = options.resetClimbProgress !== false;
		if (resetClimbProgress) {
			runCorrectCount = 0;
			mistakesThisGame = 0;
			completedSteps = new Set();
			gameScoreAwarded = false;
			finalAnswered = false;
			reductionCycle = 0;
		}

		makeProblem();
		resetProblemOnly();
		updateFractionDisplay();
		renderGroupChoices();
		updateHints();
		setText("instruction", "Look at the current fraction. Choose a shared group for both shelves, or choose that it is completely reduced.");
		setText("groupChoiceTitle", "Current fraction: both shelves can...");
		showActiveChoiceArea({ focus: options.focus !== false });
		updateTurtleBoard(options.message || (stageStarted ? `Stage ${stage}: reduce the fraction until no shared group remains.` : "Press START the Climb when you are ready."));
	}

	function updateTurtleBoard(message) {
		const progressPercent = Math.min(100, Math.round((runCorrectCount / TOTAL_STEPS) * 100));
		const defaultMessage = !stageStarted
			? "Press START the Climb when you are ready."
			: mistakesThisGame > 0
				? "Keep practicing. This run already has an error, so finish it and use Next Climb for a fresh score chance."
				: isHardLevel()
					? "Purple level: reduce with focus and speed."
					: isMiddleLevel()
						? "Blue level: same pattern, smoother pace."
						: "Leaf level: choose a shared group and reduce carefully.";

		if (shell()?.updateShelf) {
			shell().updateShelf({ score: turtleScore, stage, progressPercent, message: message || defaultMessage });
		} else {
			setText("scoreText", `Score: ${turtleScore}`);
			setText("stageText", `Stage: ${stage}`);
			const turtleTrack = byId("turtleTrack");
			if (turtleTrack) turtleTrack.style.setProperty("--progress", `${progressPercent}%`);
			setText("challengeMessage", message || defaultMessage);
		}
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

	function animateTurtleFinish() {
		const turtle = document.querySelector(".progress-turtle");
		if (!turtle) return;
		turtle.classList.remove("turtle-fade-away");
		void turtle.offsetWidth;
		turtle.classList.add("turtle-fade-away");
	}

	function markCorrectStep(stepKey) {
		if (finalAnswered || gameScoreAwarded) return false;
		if (stepKey && completedSteps.has(stepKey)) return false;
		if (stepKey) completedSteps.add(stepKey);
		runCorrectCount = Math.min(TOTAL_STEPS - 1, runCorrectCount + 1);

		const message = mistakesThisGame === 0
			? "Good. Keep the turtle moving."
			: "Keep practicing. This run already has an error, so finish it and use Next Climb for a fresh score chance.";

		updateTurtleBoard(message);
		return true;
	}

	function markMistake() {
		if (finalAnswered) return;
		shell()?.playSfx?.("wrong");
		stopClimbTimer(true);
		mistakesThisGame++;
		runCorrectCount = 0;
		completedSteps.clear();
		shakeScoreBoard();

		let message;
		if (mistakesThisGame > 1 && turtleScore > 0) {
			turtleScore--;
			message = "Second mistake in the same run. Turtle loses 1 score, but score cannot go below 0.";
			window.setTimeout(() => popScoreChange("−1", "minus"), 80);
		} else if (mistakesThisGame > 1) {
			message = "Second mistake in the same run. Score is already 0, so keep practicing.";
		} else {
			message = "Mistake made. Climb cleared. This run cannot earn a score now. Finish it, then press Next Climb.";
		}

		updateTurtleBoard(message);
	}

	function completeRoundAfterFinalAnswer() {
		if (finalAnswered) return;
		finalAnswered = true;
		runCorrectCount = TOTAL_STEPS;

		let earnedScore = false;
		let message;

		if (!gameScoreAwarded && mistakesThisGame === 0) {
			turtleScore = Math.min(10, turtleScore + 1);
			gameScoreAwarded = true;
			earnedScore = true;
			message = turtleScore >= 10
				? "🎁 Score 10 reached! Certificate unlocked."
				: "🏁 Clean reduction path! +1 score. Next Climb is ready.";
		} else {
			gameScoreAwarded = true;
			message = "🏁 Fraction reduced. This run had a mistake, so no score point is added. Next Climb is ready.";
		}

		const masteryComplete = turtleScore >= 10;
		if (masteryComplete) completePlayProgress();
		updateTurtleBoard(message);

		if (earnedScore) {
			window.setTimeout(() => {
				animateTurtleFinish();
				popScoreChange("+1", "plus");
			}, 120);
		}

		if (masteryComplete) {
			stopClimbTimer(true);
			hideNextClimb();
			focusCompleteView();
			if (!achievementShown) {
				window.setTimeout(showAchievementPopup, 700);
			}
			return;
		}

		shell()?.finishCorrectClimb?.({ message, scroll: false });
		focusCompleteView();
	}

	function showClimbGate() {
		stopClimbTimer(false);
		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.remove("hidden");
		if (playArea) playArea.classList.add("hidden");
		stageStarted = false;
		pageHasStartedClimb = false;
		updateTurtleBoard("Press START the Climb when you are ready.");
	}

	function startClimbFromGate() {
		stageStarted = true;
		pageHasStartedClimb = true;
		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.add("hidden");
		if (playArea) playArea.classList.remove("hidden");
		hideNextClimb();
		updateTurtleBoard(`Climb ${TOTAL_STEPS} clean progress steps to score.`);
		shell()?.startClimbTimer?.();
		focusQuestionView();
	}

	function nextClimb() {
		if (turtleScore >= 10) {
			completePlayProgress();
			showAchievementPopup();
			return;
		}

		stage++;
		if (progressThemeTimer) window.clearTimeout(progressThemeTimer);
		stopClimbTimer(false);
		stageStarted = true;
		pageHasStartedClimb = true;
		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.add("hidden");
		if (playArea) playArea.classList.remove("hidden");
		startNewProblem({ resetClimbProgress: true, focus: false, message: `Stage ${stage}: reduce the fraction until no shared group remains.` });
		shell()?.startNextClimbTimer?.();
		progressThemeTimer = window.setTimeout(() => {
			shell()?.applyProgressThemeByScore?.(turtleScore, true);
		}, 300);
		focusQuestionView();
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

	function showAchievementPopup() {
		if (achievementShown) return;
		achievementShown = true;
		stopClimbTimer(true);
		completePlayProgress();
		shell()?.showNextClimbButton?.({ scroll: false });
		startConfetti();

		const nameInput = byId("playerNameInput");
		if (nameInput) nameInput.value = "";

		const popup = byId("namePopup");
		if (popup) popup.style.display = "flex";
		document.body.classList.add("modal-open");
		window.setTimeout(() => nameInput?.focus(), 200);
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
			studentName: studentName || "Math Ridge Champion",
			completedAt: new Date().toISOString(),
			displayDate: formattedDate,
			displayTime: formattedTime,
			raceTime: raceTimeText || formatRaceTime(getRaceMs()),
			rankText: rankMessage || ""
		};

		try {
			localStorage.setItem(PLAY_COMPLETE_KEY, "true");
			localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
			localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
			localStorage.setItem(PLAY_CERT_KEY, JSON.stringify(certData));
		} catch (error) {}
	}

	async function createCertificateFromName() {
		const nameInput = byId("playerNameInput");
		const finalName = safeText(nameInput?.value || "") || "Math Ridge Champion";
		const now = new Date();
		const button = document.querySelector("#namePopup button");

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
		let raceTimeText = formatRaceTime(getRaceMs());

		try {
			const result = await shell()?.submitWorldRecord?.(finalName, getRaceMs());
			if (result) {
				latestRaceRank = result.rank || null;
				latestSavedRaceSeconds = result.record?.timeSeconds || null;
				rankMessage = result.topThree ? rankText(result.rank) : "";
				raceTimeText = result.record?.timeDisplay
					|| (result.record?.timeSeconds ? formatRaceTime(result.record.timeSeconds * 1000) : raceTimeText);
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

	function closeCertificatePopup() {
		const popup = byId("certificatePopup");
		if (popup) popup.style.display = "none";
		document.body.classList.remove("modal-open");
		stopConfetti();

		const params = new URLSearchParams(window.location.search);
		if (params.get("from") === "cabin" && params.get("mode") === "redownload") {
			try {
				sessionStorage.setItem("mathRidge_open_section", "cabin");
			} catch (error) {}
			window.location.href = "index.html";
		}
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
				bodyText: "for demonstrating understanding of equivalent fractions and careful fraction reduction.",
				dateText: completedDate,
				signature: CERT_SIGNATURE,
				filename: "math-ridge-fraction-equivalence-reduction-certificate.png"
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
		ctx.fillText("Fraction Equivalence and Reduction", 700, 350);

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
		ctx.fillText("for demonstrating understanding of equivalent fractions", 700, 610);
		ctx.fillText("and careful fraction reduction.", 700, 650);

		ctx.fillStyle = "#24304f";
		ctx.font = "28px Georgia";
		ctx.fillText(completedDate, 700, 735);

		ctx.fillStyle = "#7a4b00";
		ctx.font = "italic 30px Georgia";
		ctx.fillText(CERT_SIGNATURE, 700, 890);

		const link = document.createElement("a");
		link.download = "math-ridge-play-1-5-certificate.webp";
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
		document.addEventListener("keydown", event => {
			if (event.key === "Enter") {
				if (event.target.id === "topOuterInput" || event.target.id === "topInnerInput") checkTopRewrite();
				if (event.target.id === "bottomOuterInput" || event.target.id === "bottomInnerInput") checkBottomRewrite();
				if (event.target.id === "newTopInput" || event.target.id === "newBottomInput") checkShrink();
			}

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

	function initPlay5() {
		attachEvents();
		resetRaceTimer();
		startNewProblem({ resetClimbProgress: true, focus: false });
		showClimbGate();
		hideNextClimb();
		window.setTimeout(openSavedCertificateFromCabin, 350);
	}

	window.MathRidgeLocal = {
		getScore: () => turtleScore,
		getStage: () => stage,
		getRequiredProgressSteps: () => TOTAL_STEPS
	};

	window.startClimbFromGate = startClimbFromGate;
	window.checkTopRewrite = checkTopRewrite;
	window.checkBottomRewrite = checkBottomRewrite;
	window.checkShrink = checkShrink;
	window.nextClimb = nextClimb;
	window.createCertificateFromName = createCertificateFromName;
	window.closeCertificatePopup = closeCertificatePopup;
	window.saveCertificateImage = saveCertificateImage;

	initPlay5();
})();
