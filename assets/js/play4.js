/* Math Ridge Play 1-4 local game: Chunking Repeated Values.
   The global shell owns timer, top shelf, ladder, background, and Next Climb visibility. */
(function () {
	"use strict";

	const PLAY_ID = "1_4";
	const PLAY_SECTION = "1-4";
	const PLAY_TITLE = "Distribution and Grouping Foundations";
	const PLAY_COMPLETE_KEY = "mathRidge_playComplete_1_4";
	const PLAY_CERT_KEY = "mathRidge_cert_1_4";
	const NEXT_NOTE_UNLOCK_KEY = "mathRidge_noteUnlocked_2_1";
	const NEXT_STAGE_UNLOCK_KEY = "mathRidge_stageUnlocked_2_1";
	const CERT_SIGNATURE = "Presented by Math Ridge Creator: Kuan-Yuan Huang";
	const TOTAL_STEPS = 6;

	let current = null;
	let turtleScore = 0;
	let stage = 1;
	let runCorrectCount = 0;
	let mistakesThisGame = 0;
	let gameScoreAwarded = false;
	let finalAnswered = false;
	let achievementShown = false;
	let confettiTimer = null;
	let progressThemeTimer = null;
	let pageHasStartedClimb = false;
	let latestRaceRank = null;
	let latestSavedRaceSeconds = null;
	let completedSteps = new Set();

	const numberWords = {
		2: "two", 3: "three", 4: "four", 5: "five", 6: "six",
		7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve"
	};

	const problemBanks = {};
	const usedProblemKeys = {};

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
		if (!pageHasStartedClimb || turtleScore >= 10 || finalAnswered) return;
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
		localStorage.setItem(PLAY_COMPLETE_KEY, "true");
		localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
		localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
	}

	function randomItem(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	function shuffleList(list) {
		const copy = [...list];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function getDeckLevel() {
		if (turtleScore <= 3) return "hint";
		if (turtleScore <= 6) return "middle";
		return "hard";
	}

	function isHintLevel() {
		return turtleScore <= 3;
	}

	function isMiddleLevel() {
		return turtleScore >= 4 && turtleScore <= 6;
	}

	function isHardLevel() {
		return turtleScore >= 7;
	}

	function getPoolsForLevel(level) {
		if (level === "hint") {
			return { valuePool: [2, 3, 4], multiplicityPool: [6, 7, 8] };
		}

		if (level === "middle") {
			return { valuePool: [2, 3, 4], multiplicityPool: [7, 8, 9] };
		}

		return { valuePool: [6, 7, 8], multiplicityPool: [6, 7, 8, 9] };
	}

	function buildProblemDeck(level) {
		const deck = [];
		const { valuePool, multiplicityPool } = getPoolsForLevel(level);

		multiplicityPool.forEach(multiplicity => {
			valuePool.forEach(value => {
				deck.push({ multiplicity, value });
			});
		});

		return shuffleList(deck);
	}

	function problemKey(problem) {
		return `${problem.multiplicity}x${problem.value}`;
	}

	function makeProblem() {
		const currentLevel = getDeckLevel();

		if (!problemBanks[currentLevel]) {
			problemBanks[currentLevel] = buildProblemDeck(currentLevel);
			usedProblemKeys[currentLevel] = new Set();
		}

		let bank = problemBanks[currentLevel];
		let used = usedProblemKeys[currentLevel];

		if (used.size >= bank.length) {
			used.clear();
			problemBanks[currentLevel] = buildProblemDeck(currentLevel);
			bank = problemBanks[currentLevel];
			used = usedProblemKeys[currentLevel];
		}

		let available = bank.filter(problem => !used.has(problemKey(problem)));

		if (available.length === 0) {
			used.clear();
			available = bank;
		}

		const picked = randomItem(available);
		used.add(problemKey(picked));

		const multiplicity = picked.multiplicity;
		const value = picked.value;
		const secondChunk = multiplicity - 5;

		current = {
			multiplicity,
			value,
			secondChunk,
			chunkA: 5 * value,
			chunkB: secondChunk * value,
			answer: multiplicity * value
		};
	}

	function repeatedAdditionText(count, value) {
		return Array(count).fill(String(value)).join("+");
	}

	function repeatedAdditionHTML(count, value) {
		return Array(count).fill(0).map((_, index) => {
			const plus = index < count - 1 ? "<span>+</span>" : "";
			return `<span class="num">${value}</span>${plus}`;
		}).join("");
	}

	function chunkVisualHTML() {
		return `
			<span class="flow-piece">(${repeatedAdditionText(5, current.value)})</span>
			<span>+</span>
			<span class="flow-piece">(${repeatedAdditionText(current.secondChunk, current.value)})</span>
		`;
	}

	function notationText() {
		return `${current.multiplicity}(${current.value})`;
	}

	function splitText() {
		return `5(${current.value})+${current.secondChunk}(${current.value})`;
	}

	function keepNumbersOnly(input, maxLength = null) {
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

	function prepareNumberOnlyInputs() {
		document.querySelectorAll(".number-only").forEach(input => {
			input.oninput = () => {
				touchClimbTimer();
				keepNumbersOnly(input);
			};
		});
	}

	function prepareSmartNotationInputs() {
		const outerInput = byId("outerInput");
		const innerInput = byId("innerInput");
		if (!outerInput || !innerInput || !current) return;

		const outerLength = String(current.multiplicity).length;
		const innerLength = String(current.value).length;
		outerInput.maxLength = outerLength;
		innerInput.maxLength = innerLength;

		outerInput.oninput = () => {
			touchClimbTimer();
			const value = keepNumbersOnly(outerInput, outerLength);
			if (value.length >= outerLength) focusNextField(innerInput);
		};

		innerInput.oninput = () => {
			touchClimbTimer();
			const value = keepNumbersOnly(innerInput, innerLength);
			if (value.length >= innerLength) {
				window.setTimeout(() => {
					document.querySelector("#notationStep button[onclick='checkNotation()']")?.focus();
				}, 40);
			}
		};
	}

	function toggleNotationExample() {
		const example = byId("notationExample");
		const toggle = byId("notationExampleToggle");
		if (!example || !toggle) return;
		const isHidden = example.classList.toggle("hidden");
		toggle.textContent = isHidden ? "Show Example" : "Hide Example";
	}

	function updateNotationExampleMode() {
		const example = byId("notationExample");
		const toggle = byId("notationExampleToggle");
		if (!example || !toggle) return;
		example.classList.add("hidden");
		toggle.textContent = "Show Example";
		toggle.classList.add("focus-toggle");
	}

	function setHint(id, text) {
		const box = byId(id);
		if (!box) return;

		box.textContent = text;
		const focusMode = !isHintLevel();
		box.classList.toggle("focus-hint", focusMode);
		box.classList.toggle("hidden-hint", focusMode);

		let toggle = byId(`${id}Toggle`);
		if (!toggle) {
			toggle = document.createElement("button");
			toggle.id = `${id}Toggle`;
			toggle.type = "button";
			toggle.className = "hint-toggle";
			box.parentNode.insertBefore(toggle, box);
		}

		toggle.classList.toggle("hidden-toggle", !focusMode);
		toggle.textContent = box.classList.contains("hidden-hint") ? "Show hint" : "Hide hint";
		toggle.onclick = () => {
			box.classList.toggle("hidden-hint");
			toggle.textContent = box.classList.contains("hidden-hint") ? "Show hint" : "Hide hint";
		};
	}

	function updateProblemText() {
		byId("repeatedLine").innerHTML = repeatedAdditionHTML(current.multiplicity, current.value);

		const levelText = isHardLevel()
			? "Challenge level: hints are tucked away so you can focus."
			: isMiddleLevel()
				? "Practice level: hints are tucked away so you can focus."
				: "Hint level: values are 2, 3, or 4. Hints are shown.";

		const difficultyLine = byId("difficultyLine");
		difficultyLine.textContent = levelText;
		difficultyLine.classList.toggle("hidden-hint", !isHintLevel());

		setHint("countHint", `Count each ${current.value}. The total count is the multiplicity.`);
		setHint("notationHint", "Write the number of copies first. Put the repeated value inside parentheses.");
		setHint("splitHint", `Split ${current.multiplicity} copies into 5 copies and ${current.secondChunk} leftover copies.`);
		setHint("chunkAHint", `5(${current.value}) means ${current.value}+${current.value}+${current.value}+${current.value}+${current.value}.`);
		setHint("chunkBHint", `${current.secondChunk}(${current.value}) means ${numberWords[current.secondChunk]} ${current.value}s.`);
		setHint("finalHint", `Add the two chunk totals: ${current.chunkA}+${current.chunkB}.`);
		updateNotationExampleMode();
	}

	function setFeedback(text, className = "feedback") {
		const feedback = byId("feedback");
		if (!feedback) return;
		feedback.textContent = text;
		feedback.className = className;
	}

	function makeChoice(text, isCorrect, stepKey, onCorrect, wrongMessage) {
		const choice = document.createElement("div");
		choice.className = "choice";
		choice.textContent = text;
		choice.onclick = () => {
			touchClimbTimer();
			if (choice.classList.contains("correct-flash") || completedSteps.has(stepKey)) return;

			if (isCorrect) {
				choice.classList.add("correct-flash");
				choice.parentElement?.querySelectorAll(".choice").forEach(item => {
					item.style.pointerEvents = "none";
				});
				setFeedback("✅ Correct. Keep going.", "feedback good-text");
				markCorrectStep(stepKey);
				onCorrect();
			} else {
				choice.classList.add("wrong-flash");
				setFeedback(wrongMessage, "feedback bad-text");
				markMistake();
				window.setTimeout(() => choice.classList.remove("wrong-flash"), 550);
			}
		};
		return choice;
	}

	function getCountChoiceOptions() {
		const correct = current.multiplicity;
		const options = [correct];

		while (options.length < 3) {
			const nearby = correct + randomItem([-2, -1, 1, 2]);
			if (nearby >= 6 && nearby <= 12 && !options.includes(nearby)) options.push(nearby);
		}

		return options;
	}

	function renderCountChoices() {
		const box = byId("countChoices");
		box.innerHTML = "";
		const options = getCountChoiceOptions().map(num => ({
			text: `${numberWords[num]} ${current.value}s`,
			correct: num === current.multiplicity
		})).sort(() => Math.random() - 0.5);

		options.forEach(item => {
			box.appendChild(makeChoice(
				item.text,
				item.correct,
				"count",
				() => showStep("notationStep", "outerInput"),
				`Not yet. Count how many ${current.value}s appear in the addition line.`
			));
		});
	}

	function checkNotation() {
		touchClimbTimer();
		if (completedSteps.has("notation")) return;

		const outer = Number(keepNumbersOnly(byId("outerInput")));
		const inner = Number(keepNumbersOnly(byId("innerInput")));
		const note = byId("notationFeedback");

		if (outer === current.multiplicity && inner === current.value) {
			note.textContent = `✅ Correct. ${notationText()} means ${numberWords[current.multiplicity]} ${current.value}s.`;
			note.className = "feedback good-text";
			markCorrectStep("notation");
			showStep("splitStep", "splitChoices");
			return;
		}

		if (outer === current.value && inner === current.multiplicity) {
			note.textContent = "Almost. The result is still true, but for this lesson we read multiplicity first. Try rearranging the values.";
			note.className = "feedback bad-text";
			markMistake();
			return;
		}

		note.textContent = "Not yet. How many copies first? What value is repeated inside?";
		note.className = "feedback bad-text";
		markMistake();
	}

	function renderSplitChoices() {
		const box = byId("splitChoices");
		box.innerHTML = "";
		const correct = splitText();
		const choices = [
			{ text: correct, correct: true },
			{ text: `5(${current.value})+${current.secondChunk}`, correct: false },
			{ text: `${current.secondChunk}(${current.value})+5(${current.secondChunk})`, correct: false }
		].sort(() => Math.random() - 0.5);

		choices.forEach(item => {
			box.appendChild(makeChoice(
				item.text,
				item.correct,
				"split",
				() => {
					byId("chunkVisual").innerHTML = chunkVisualHTML();
					setText("chunkALabel", `5(${current.value})`);
					setText("chunkBLabel", `${current.secondChunk}(${current.value})`);
					showStep("chunkVisualStep", "chunkAInput");
				},
				`Not yet. Keep the repeated value ${current.value} in both chunks.`
			));
		});
	}

	function checkChunkA() {
		touchClimbTimer();
		if (completedSteps.has("chunkA")) return;

		const input = byId("chunkAInput");
		const box = byId("chunkAFeedback");
		if (Number(keepNumbersOnly(input)) === current.chunkA) {
			box.textContent = `✅ Correct. 5(${current.value})=${current.chunkA}.`;
			box.className = "feedback good-text";
			input.style.borderColor = "#6cc070";
			markCorrectStep("chunkA");
			showStep("chunkBStep", "chunkBInput");
			return;
		}

		box.textContent = `Not yet. Use the first visual chunk and add five ${current.value}s.`;
		box.className = "feedback bad-text";
		input.style.borderColor = "#ef7777";
		markMistake();
	}

	function checkChunkB() {
		touchClimbTimer();
		if (completedSteps.has("chunkB")) return;

		const input = byId("chunkBInput");
		const box = byId("chunkBFeedback");
		if (Number(keepNumbersOnly(input)) === current.chunkB) {
			box.textContent = `✅ Correct. ${current.secondChunk}(${current.value})=${current.chunkB}.`;
			box.className = "feedback good-text";
			input.style.borderColor = "#6cc070";
			markCorrectStep("chunkB");
			byId("finalPreview").innerHTML = `<span class="flow-piece">${current.chunkA}</span><span>+</span><span class="flow-piece">${current.chunkB}</span><span>=</span><span class="flow-piece">?</span>`;
			showStep("finalStep", "finalInput");
			return;
		}

		box.textContent = `Not yet. Add ${numberWords[current.secondChunk]} ${current.value}s.`;
		box.className = "feedback bad-text";
		input.style.borderColor = "#ef7777";
		markMistake();
	}

	function checkFinalAnswer() {
		touchClimbTimer();
		if (finalAnswered) return;

		const input = byId("finalInput");
		const box = byId("finalFeedback");
		if (Number(keepNumbersOnly(input)) === current.answer) {
			box.textContent = `✅ Correct! ${current.chunkA}+${current.chunkB}=${current.answer}.`;
			box.className = "feedback good-text";
			input.style.borderColor = "#6cc070";
			markCorrectStep("final");
			showCompleteStep();
			completeRoundAfterFinalAnswer();
			scrollToCenter("completeStep");
			return;
		}

		box.textContent = `Not yet. Add ${current.chunkA}+${current.chunkB}.`;
		box.className = "feedback bad-text";
		input.style.borderColor = "#ef7777";
		markMistake();
	}

	function showCompleteStep() {
		byId("completedFlow").innerHTML = `
			<span class="flow-piece">${repeatedAdditionText(current.multiplicity, current.value)}</span>
			<span>=</span>
			<span class="flow-piece">${notationText()}</span>
			<span>=</span>
			<span class="flow-piece">${splitText()}</span>
			<span>=</span>
			<span class="flow-piece">${current.chunkA}+${current.chunkB}</span>
			<span>=</span>
			<span class="flow-piece">${current.answer}</span>
		`;
		byId("completeStep").classList.remove("hidden");
	}

	function showStep(stepId, focusId) {
		byId(stepId).classList.remove("hidden");
		if (stepId === "splitStep") renderSplitChoices();
		scrollToCenter(stepId);
		window.setTimeout(() => {
			const target = byId(focusId);
			if (target && target.focus) target.focus();
		}, 300);
	}

	function scrollToCenter(id) {
		if (shell()?.scrollToPremiumElement) {
			shell().scrollToPremiumElement(id, 14);
			return;
		}
		const element = byId(id);
		if (!element) return;
		window.setTimeout(() => element.scrollIntoView({ behavior: "smooth", block: "center" }), 160);
	}

	function scrollToStepOneStart() {
		scrollToCenter("problemCard");
	}

	function resetProblemOnly(options = { resetClimbProgress: false }) {
		if (options.resetClimbProgress) {
			runCorrectCount = 0;
			mistakesThisGame = 0;
			gameScoreAwarded = false;
			finalAnswered = false;
			completedSteps = new Set();
			updateTurtleBoard();
		}

		setFeedback("", "feedback");
		["notationFeedback", "chunkAFeedback", "chunkBFeedback", "finalFeedback"].forEach(id => {
			const element = byId(id);
			if (!element) return;
			element.textContent = "";
			element.className = "feedback";
		});

		["outerInput", "innerInput", "chunkAInput", "chunkBInput", "finalInput"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.value = "";
			input.style.borderColor = "#b9dcff";
		});

		["notationStep", "splitStep", "chunkVisualStep", "chunkBStep", "finalStep", "completeStep"].forEach(id => {
			byId(id).classList.add("hidden");
		});

		byId("countStep").classList.remove("hidden");
		byId("splitChoices").innerHTML = "";
		byId("chunkVisual").innerHTML = "";
		byId("finalPreview").innerHTML = "";
		byId("completedFlow").innerHTML = "";
	}

	function startNewProblem(options = { resetClimbProgress: true }) {
		hideNextClimb();
		makeProblem();
		if (options.resetClimbProgress !== false) {
			runCorrectCount = 0;
			mistakesThisGame = 0;
			gameScoreAwarded = false;
			finalAnswered = false;
			completedSteps = new Set();
		}
		resetProblemOnly({ resetClimbProgress: false });
		prepareSmartNotationInputs();
		updateProblemText();
		renderCountChoices();
		setText("instruction", "Step 1: Count how many copies of the same value you see.");
		updateNotationExampleMode();
		updateTurtleBoard();
	}

	function updateTurtleBoard(message) {
		const progressPercent = Math.min(100, Math.round((runCorrectCount / TOTAL_STEPS) * 100));

		if (shell()?.updateShelf) {
			shell().updateShelf({ score: turtleScore, stage, progressPercent, message });
		} else {
			setText("scoreText", `Score: ${turtleScore}`);
			setText("stageText", `Stage: ${stage}`);
			const turtleTrack = byId("turtleTrack");
			if (turtleTrack) turtleTrack.style.setProperty("--progress", `${progressPercent}%`);
			if (message) setText("challengeMessage", message);
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
		if (gameScoreAwarded && stepKey !== "final") return false;
		if (stepKey && completedSteps.has(stepKey)) return false;
		if (stepKey) completedSteps.add(stepKey);

		runCorrectCount = Math.min(TOTAL_STEPS, runCorrectCount + 1);

		const message = mistakesThisGame === 0
			? "Good. Keep the turtle moving."
			: "Keep practicing. This run already has an error, so finish it and use Next Climb for a fresh score chance.";

		updateTurtleBoard(message);
		return true;
	}

	function markMistake() {
		if (finalAnswered) return;
		stopClimbTimer(true);
		mistakesThisGame++;
		runCorrectCount = 0;
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

		if (!gameScoreAwarded && mistakesThisGame === 0 && completedSteps.size >= TOTAL_STEPS) {
			turtleScore++;
			gameScoreAwarded = true;
			earnedScore = true;
			message = turtleScore >= 10
				? "🎁 Score 10 reached! Certificate unlocked."
				: "🏁 Flawless chunking path! +1 score. Next Climb is ready.";
		} else {
			gameScoreAwarded = true;
			message = "🏁 Climb finished. Final answer is correct. This run had a mistake, so no score point is added. Next Climb is ready.";
		}

		if (turtleScore >= 10) completePlayProgress();
		updateTurtleBoard(message);
		shell()?.finishCorrectClimb?.({ message, scroll: true });

		if (earnedScore) {
			window.setTimeout(() => {
				animateTurtleFinish();
				popScoreChange("+1", "plus");
			}, 120);
		}

		if (turtleScore >= 10 && !achievementShown) {
			window.setTimeout(showAchievementPopup, 700);
		}
	}

	function showClimbGate() {
		stopClimbTimer(false);
		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.remove("hidden");
		if (playArea) playArea.classList.add("hidden");
		pageHasStartedClimb = false;
		updateTurtleBoard("Press START the Climb when you are ready.");
	}

	function startClimbFromGate() {
		pageHasStartedClimb = true;
		const gate = byId("climbStartGate");
		const playArea = byId("playArea");
		if (gate) gate.classList.add("hidden");
		if (playArea) playArea.classList.remove("hidden");
		hideNextClimb();
		updateTurtleBoard(`Climb ${TOTAL_STEPS} clean steps to score.`);
		shell()?.startClimbTimer?.();
		scrollToStepOneStart();
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
		startNewProblem({ resetClimbProgress: true });
		pageHasStartedClimb = true;
		updateTurtleBoard(`Stage ${stage}: complete one clean progress bar to score.`);
		shell()?.startNextClimbTimer?.();
		progressThemeTimer = window.setTimeout(() => {
			shell()?.applyProgressThemeByScore?.(turtleScore, true);
		}, 300);
		scrollToStepOneStart();
	}

	function resetPracticeGame() {
		stopClimbTimer(false);
		hideNextClimb();
		runCorrectCount = 0;
		mistakesThisGame = 0;
		gameScoreAwarded = false;
		finalAnswered = false;
		completedSteps = new Set();
		resetProblemOnly({ resetClimbProgress: false });
		renderCountChoices();
		setFeedback("Practice reset. Turtle score did not change.", "feedback good-text");
		updateTurtleBoard("Current problem reset. Press START or continue the climb when ready.");
		if (pageHasStartedClimb) shell()?.startClimbTimer?.();
		scrollToCenter("countStep");
	}

	function resetChallenge() {
		stopClimbTimer(false);
		resetRaceTimer();
		turtleScore = 0;
		stage = 1;
		runCorrectCount = 0;
		mistakesThisGame = 0;
		gameScoreAwarded = false;
		finalAnswered = false;
		achievementShown = false;
		completedSteps = new Set();
		latestRaceRank = null;
		latestSavedRaceSeconds = null;
		Object.keys(usedProblemKeys).forEach(level => usedProblemKeys[level].clear());
		stopConfetti();
		hideNextClimb();
		startNewProblem({ resetClimbProgress: true });
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

		localStorage.setItem(PLAY_COMPLETE_KEY, "true");
		localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
		localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
		localStorage.setItem(PLAY_CERT_KEY, JSON.stringify(certData));
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
		ctx.fillText("Distribution and Grouping Foundations", 700, 350);

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
		ctx.fillText("for demonstrating understanding of repeated addition,", 700, 610);
		ctx.fillText("grouping, and early distributive reasoning.", 700, 650);

		ctx.fillStyle = "#24304f";
		ctx.font = "28px Georgia";
		ctx.fillText(completedDate, 700, 735);

		ctx.fillStyle = "#7a4b00";
		ctx.font = "italic 30px Georgia";
		ctx.fillText(CERT_SIGNATURE, 700, 890);

		const link = document.createElement("a");
		link.download = "math-ridge-play-1-4-certificate.webp";
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
		prepareNumberOnlyInputs();

		document.addEventListener("keydown", event => {
			if (event.key === "Enter") {
				if (event.target.id === "outerInput" || event.target.id === "innerInput") checkNotation();
				if (event.target.id === "chunkAInput") checkChunkA();
				if (event.target.id === "chunkBInput") checkChunkB();
				if (event.target.id === "finalInput") checkFinalAnswer();
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

	function initPlay4() {
		attachEvents();
		resetRaceTimer();
		startNewProblem({ resetClimbProgress: true });
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
	window.toggleNotationExample = toggleNotationExample;
	window.checkNotation = checkNotation;
	window.checkChunkA = checkChunkA;
	window.checkChunkB = checkChunkB;
	window.checkFinalAnswer = checkFinalAnswer;
	window.nextClimb = nextClimb;
	window.resetPracticeGame = resetPracticeGame;
	window.resetChallenge = resetChallenge;
	window.createCertificateFromName = createCertificateFromName;
	window.closeCertificatePopup = closeCertificatePopup;
	window.saveCertificateImage = saveCertificateImage;

	initPlay4();
})();
