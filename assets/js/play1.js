/* Math Ridge Trail 1-1 local game: Term Stone Trial.
   The global shell owns timer, ladder, progress shelf, and Next Climb visibility. */
(function () {
	"use strict";

	const CERT_KEY = "mathRidge_cert_1_1";
	const MANUAL_COMPLETE_KEY = "mathRidge_noteComplete_1_1";
	const CERT_SIGNATURE = "Presented by Math Ridge Creator: Kuan-Yuan Huang";

	function hasCompletedManual() {
		try {
			return localStorage.getItem(MANUAL_COMPLETE_KEY) === "true";
		} catch (error) {
			return false;
		}
	}

	if (!hasCompletedManual()) {
		try {
			sessionStorage.setItem("mathRidgeReturnView", "quest");
			sessionStorage.setItem("mathRidge_open_section", "quest");
		} catch (error) {}
		window.location.replace("note1.html?trialLocked=manual");
		return;
	}

	const problemDecks = {};
	const usedProblemDecks = {};

	let currentProblem = {};
	let expected = {};
	let chosenSignType = null;
	let chosenBiggerTerm = null;
	let chosenBiggerSize = null;
	let chosenOutsideSign = null;
	let chosenOperation = null;
	let chosenFinalAnswerSign = null;

	let turtleScore = 0;
	let stage = 1;
	let stageStarted = false;
	let runCorrectCount = 0;
	let mistakesThisProblem = 0;
	let gameScoreAwarded = false;
	let earnedProgressSteps = new Set();
	let achievementShown = false;
	let certificateReturnInProgress = false;

	const fallbackShell = {
		formatRaceTime(ms) {
			const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			return `${minutes}:${String(seconds).padStart(2, "0")}`;
		},
		getTotalRaceMs() { return 0; },
		startClimbTimer() {},
		stopClimbTimer() {},
		startNextClimbTimer() {},
		resetRaceTimer() {},
		reviveProgressTurtle() {
			document.querySelector(".progress-turtle")?.classList.remove("turtle-fade-away");
		},
		scrollToPremiumElement(id) {
			window.setTimeout(() => {
				document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
			}, 80);
		},
		updateShelf(options) {
			const scoreText = document.getElementById("scoreText");
			if (scoreText) scoreText.textContent = `Score: ${options.score || 0}`;
			const stageText = document.getElementById("stageText");
			if (stageText) stageText.textContent = `Stage: ${options.stage || 1}`;
			const track = document.getElementById("turtleTrack");
			if (track) {
				track.style.setProperty("--progress", `${options.progressPercent || 0}%`);
				track.innerHTML = '<div class="progress-fill"></div><div class="progress-turtle">🐢</div>';
				if (options.reviveTurtle || options.resetTurtle) {
					track.querySelector(".progress-turtle")?.classList.remove("turtle-fade-away");
				}
			}
			if (options.message) {
				const message = document.getElementById("challengeMessage");
				if (message) message.textContent = options.message;
			}
		},
		finishCorrectClimb(options = {}) {
			if (options.message) {
				const message = document.getElementById("challengeMessage");
				if (message) message.textContent = options.message;
			}
			const button = document.getElementById("nextClimbButton");
			if (button) {
				button.classList.remove("hidden", "locked-button");
				button.hidden = false;
				button.disabled = false;
			}
		},
		hideNextClimbButton() {
			const button = document.getElementById("nextClimbButton");
			if (button) {
				button.classList.add("hidden", "locked-button");
				button.hidden = true;
				button.disabled = true;
			}
		},
		submitWorldRecord: async () => null,
		loadLadderRecords: async () => []
	};

	function shell() {
		return window.MathRidgePlay || fallbackShell;
	}

	function byId(id) {
		return document.getElementById(id);
	}

	function setText(id, value) {
		const element = byId(id);
		if (element) element.textContent = value;
	}

	function getDifficultySettings() {
		if (turtleScore <= 6) return { min: 1, max: 10 };
		return { min: 12, max: 25 };
	}

	function shuffleList(list) {
		const copy = [...list];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function difficultyKey(settings) {
		return `${settings.min}-${settings.max}`;
	}

	function problemKey(problem) {
		return `${problem.a},${problem.b}`;
	}

	function buildProblemDeck(settings) {
		const deck = [];

		for (let aSize = settings.min; aSize <= settings.max; aSize++) {
			for (let bSize = settings.min; bSize <= settings.max; bSize++) {
				if (aSize === bSize) continue;

				for (const aSign of [1, -1]) {
					for (const bSign of [1, -1]) {
						deck.push({ a: aSize * aSign, b: bSize * bSign });
					}
				}
			}
		}

		return shuffleList(deck);
	}

	function generateProblem() {
		const settings = getDifficultySettings();
		const key = difficultyKey(settings);

		if (!problemDecks[key]) {
			problemDecks[key] = buildProblemDeck(settings);
			usedProblemDecks[key] = new Set();
		}

		const deck = problemDecks[key];
		if (usedProblemDecks[key].size >= deck.length) usedProblemDecks[key].clear();

		const available = deck.filter(problem => !usedProblemDecks[key].has(problemKey(problem)));
		const chosen = available[Math.floor(Math.random() * available.length)];
		usedProblemDecks[key].add(problemKey(chosen));

		return { ...chosen };
	}

	function formatTerm(n, isFirst = false) {
		const size = Math.abs(n);
		const sign = n >= 0 ? "+" : "-";
		return isFirst ? `${sign}${size}` : `${sign} ${size}`;
	}

	function keepDigitsOnly(input, maxLength = null) {
		let cleaned = String(input.value || "").replace(/\D/g, "");
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

	function getRequiredProgressSteps() {
		return 5;
	}

	function getProgressPercent() {
		return Math.min(100, Math.round((runCorrectCount / getRequiredProgressSteps()) * 100));
	}

	function progressMessage() {
		if (turtleScore >= 10) return "🏅 Score 10 complete. 1-2 is unlocked! Create your certificate, then continue to the next trail.";
		if (!stageStarted) return "Press START the Climb when ready.";
		if (turtleScore >= 6) return "🏆 6 scores! You mastered this concept.";
		if (turtleScore >= 3) return "🌟 3 scores! You understand the concept.";
		return `Climb ${getRequiredProgressSteps()} clean steps to score.`;
	}

	function updateTurtleBoard(message = "", options = {}) {
		shell().updateShelf({
			score: turtleScore,
			stage,
			progressPercent: getProgressPercent(),
			message: message || progressMessage(),
			reviveTurtle: Boolean(options.reviveTurtle),
			resetTurtle: Boolean(options.resetTurtle)
		});

		if (turtleScore >= 10 && !achievementShown) {
			showAchievementPopup();
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

	function scrollToCenter(id) {
		window.requestAnimationFrame(() => {
			shell().scrollToPremiumElement(id, 12, { delay: 80, duration: 760, slow: true });
		});
	}

	function scrollToActiveClimbStart() {
		scrollToCenter("problemCard");
	}

	function prepareSmartNumberInputs() {
		const firstInput = byId("firstNumInput");
		const secondInput = byId("secondNumInput");
		const finalInput = byId("finalAnswerInput");
		if (!firstInput || !secondInput || !finalInput) return;

		const bigLength = String(expected.biggerSize || "").length;
		const smallLength = String(expected.smallerSize || "").length;
		const answerLength = String(Math.abs(expected.finalAnswer) || "").length;

		firstInput.maxLength = bigLength;
		secondInput.maxLength = smallLength;
		finalInput.maxLength = answerLength;

		firstInput.oninput = () => {
			if (stageStarted) shell().startClimbTimer();
			const value = keepDigitsOnly(firstInput, null);
			if (value.length > bigLength) {
				firstInput.value = value.slice(0, bigLength);
				secondInput.value = value.slice(bigLength, bigLength + smallLength);
				focusNextField(secondInput);
				return;
			}

			firstInput.value = value.slice(0, bigLength);
			if (firstInput.value.length >= bigLength) focusNextField(secondInput);
		};

		secondInput.oninput = () => {
			if (stageStarted) shell().startClimbTimer();
			const value = keepDigitsOnly(secondInput, smallLength);
			if (value.length >= smallLength) {
				window.setTimeout(() => {
					document.querySelector("#boxStep button[onclick='checkBox()']")?.focus();
				}, 40);
			}
		};

		finalInput.oninput = () => {
			if (stageStarted) shell().startClimbTimer();
			const value = keepDigitsOnly(finalInput, answerLength);
			updateFinalAnswerPreview();
			if (value.length >= answerLength) {
				window.setTimeout(() => {
					document.querySelector("#answerArea button[onclick='checkFinalAnswer()']")?.focus();
				}, 40);
			}
		};

		[firstInput, secondInput, finalInput].forEach(input => {
			input.onkeydown = event => {
				if (event.key !== "Enter") return;
				if (input === finalInput) checkFinalAnswer();
				else if (input === secondInput) checkBox();
			};
		});
	}

	function setupExpected() {
		const a = currentProblem.a;
		const b = currentProblem.b;
		const aSign = a >= 0 ? "+" : "-";
		const bSign = b >= 0 ? "+" : "-";
		const aSize = Math.abs(a);
		const bSize = Math.abs(b);
		const sameSign = aSign === bSign;
		const biggerTerm = aSize > bSize ? "first" : "second";
		const biggerSize = Math.max(aSize, bSize);
		const smallerSize = Math.min(aSize, bSize);
		const outsideSign = biggerTerm === "first" ? aSign : bSign;
		const otherSign = biggerTerm === "first" ? bSign : aSign;
		const operation = sameSign ? "+" : "-";

		expected = {
			sameOrDifferent: sameSign ? "same" : "different",
			biggerTerm,
			biggerSize,
			smallerSize,
			outsideSign,
			otherSign,
			operation,
			finalAnswer: a + b
		};
	}

	function updateGuidanceText() {
		const outsideTitle = byId("outsideSignTitle");
		const operationTitle = byId("operationTitle");
		const operationRuleText = byId("operationRuleText");

		if (!outsideTitle || !operationTitle || !operationRuleText) return;

		if (turtleScore <= 3) {
			outsideTitle.textContent = "Tap the sign carried by the bigger size. That sign goes outside.";
			operationTitle.textContent = "Look at the other term. Same sign uses addition. Different sign uses subtraction.";
			operationRuleText.hidden = false;
			return;
		}

		outsideTitle.textContent = "Bigger size sign goes outside.";
		operationTitle.textContent = "Same sign uses addition. Different sign uses subtraction.";
		operationRuleText.hidden = true;
	}

	function renderProblem() {
		const problemText = byId("problemText");
		const miniProblem = byId("miniProblem");
		const step2OriginalGiven = byId("step2OriginalGiven");
		const boxOriginalGiven = byId("boxOriginalGiven");
		const sizeOptions = byId("sizeOptions");
		if (!problemText || !miniProblem || !sizeOptions) return;

		const aText = formatTerm(currentProblem.a, true);
		const bText = formatTerm(currentProblem.b, false);
		const aSize = Math.abs(currentProblem.a);
		const bSize = Math.abs(currentProblem.b);
		const markup = `
			<span class="term ${currentProblem.a >= 0 ? "plus" : "minus"}">${aText}</span>
			<span class="term ${currentProblem.b >= 0 ? "plus" : "minus"}">${bText}</span>
		`;

		problemText.innerHTML = markup;
		miniProblem.innerHTML = markup;
		if (step2OriginalGiven) step2OriginalGiven.innerHTML = `<span class="given-label">Original given</span>${markup}`;
		if (boxOriginalGiven) boxOriginalGiven.innerHTML = `<span class="given-label">Original given</span>${markup}`;

		sizeOptions.innerHTML = `
			<button class="choice-btn size-choice term-choice" onclick="chooseBiggerTerm('first', this)">
				<span class="term-choice-label">1st term</span>
				<strong class="${currentProblem.a >= 0 ? "plus-text" : "minus-text"}">${aText}</strong>
				<span class="term-choice-size">carries size ${aSize}</span>
			</button>
			<button class="choice-btn size-choice term-choice" onclick="chooseBiggerTerm('second', this)">
				<span class="term-choice-label">2nd term</span>
				<strong class="${currentProblem.b >= 0 ? "plus-text" : "minus-text"}">${bText}</strong>
				<span class="term-choice-size">carries size ${bSize}</span>
			</button>
		`;

		updateGuidanceText();
	}

	function resetSteps(keepClimbProgress = false) {
		chosenSignType = null;
		chosenBiggerTerm = null;
		chosenBiggerSize = null;
		chosenOutsideSign = null;
		chosenOperation = null;
		chosenFinalAnswerSign = null;

		if (!keepClimbProgress) {
			runCorrectCount = 0;
			mistakesThisProblem = 0;
			gameScoreAwarded = false;
			earnedProgressSteps = new Set();
		}

		document.querySelectorAll(".choice-btn, .sign-btn, .op-btn, .final-sign-btn").forEach(button => {
			button.classList.remove("selected", "wrong");
		});

		byId("step1")?.classList.remove("hidden");
		byId("step2")?.classList.add("hidden");
		byId("builder")?.classList.add("hidden");
		byId("boxStep")?.classList.add("hidden");
		byId("answerArea")?.classList.add("hidden");

		setText("outsideSignDisplay", "?");
		byId("outsideSignDisplay")?.classList.remove("filled");
		setText("operationDisplay", "?");
		byId("operationDisplay")?.classList.remove("filled");

		["firstNumInput", "secondNumInput", "finalAnswerInput"].forEach(id => {
			const input = byId(id);
			if (input) {
				input.value = "";
				input.style.borderColor = "";
			}
		});

		setText("finalPreviewSign", "?");
		setText("finalPreviewSize", "__");
		byId("finalAnswerPreview")?.classList.remove("filled");
		setText("answerFeedback", "");
		setBuiltBoxText("");

		const feedback = byId("feedback");
		if (feedback) {
			feedback.textContent = "Start with Step 1.";
			feedback.style.color = "";
		}
	}

	function markCorrectStep(stepKey) {
		if (gameScoreAwarded) return false;

		if (stepKey && earnedProgressSteps.has(stepKey)) {
			updateTurtleBoard("Step already counted. Keep going to the next step.");
			return false;
		}

		if (stepKey) earnedProgressSteps.add(stepKey);
		runCorrectCount = Math.min(getRequiredProgressSteps(), runCorrectCount + 1);

		const message = mistakesThisProblem === 0
			? "Good. Keep the turtle moving. Finish the bar without a mistake."
			: "Keep practicing. This problem already has an error, so use Next Climb for the next score chance.";

		updateTurtleBoard(message);
		return true;
	}

	function markMistake() {
		if (stageStarted) shell().startClimbTimer();
		shell().playSfx?.("wrong");
		mistakesThisProblem += 1;
		runCorrectCount = 0;

		let lostScoreNow = false;
		let message;

		if (mistakesThisProblem > 1 && turtleScore > 0) {
			turtleScore -= 1;
			lostScoreNow = true;
			message = "Second mistake in the same problem. Turtle loses 1 score, but score cannot go below 0.";
		} else if (mistakesThisProblem > 1) {
			message = "Second mistake in the same problem. Score is already 0, so keep practicing without losing more.";
		} else {
			message = "Mistake made. Progress bar cleared. This problem cannot earn a score now.";
		}

		updateTurtleBoard(message);
		shakeScoreBoard();
		if (lostScoreNow) popScoreChange("−1", "minus");
	}

	function markWrong(button, message) {
		if (button) button.classList.add("wrong");
		const feedback = byId("feedback");
		if (feedback) feedback.textContent = message;
		markMistake();

		window.setTimeout(() => {
			if (button) button.classList.remove("wrong");
		}, 500);
	}

	function startClimbFromGate() {
		if (stageStarted || turtleScore >= 10) return;

		document.querySelector(".game")?.classList.add("climb-active");
		stageStarted = true;
		byId("climbStartGate")?.classList.add("hidden");
		byId("playArea")?.classList.remove("hidden");
		byId("step1")?.classList.remove("hidden");
		document.querySelector(".rule-box")?.classList.add("revealed");

		shell().hideNextClimbButton({ force: true });
		shell().startClimbTimer();
		const feedback = byId("feedback");
		if (feedback) {
			feedback.textContent = "Climb started. Begin with Step 1.";
			feedback.style.color = "#248a2f";
		}
		updateTurtleBoard(`Climb ${getRequiredProgressSteps()} clean steps to score.`);
		scrollToActiveClimbStart();
	}

	function nextClimb() {
		if (turtleScore >= 10) return;

		document.querySelector(".game")?.classList.add("climb-active");
		stage += 1;
		stageStarted = true;
		currentProblem = generateProblem();
		setupExpected();
		renderProblem();
		resetSteps(false);
		prepareSmartNumberInputs();

		byId("climbStartGate")?.classList.add("hidden");
		byId("playArea")?.classList.remove("hidden");
		byId("step1")?.classList.remove("hidden");
		shell().startNextClimbTimer();

		shell().reviveProgressTurtle?.();
		const message = `Stage ${stage}: climb ${getRequiredProgressSteps()} clean steps to score.`;
		const feedback = byId("feedback");
		if (feedback) {
			feedback.textContent = "New climb started. Begin with Step 1.";
			feedback.style.color = "#248a2f";
		}
		updateTurtleBoard(message, { reviveTurtle: true });
		scrollToActiveClimbStart();
	}

	function chooseSignType(type, button) {
		if (stageStarted) shell().startClimbTimer();
		document.querySelectorAll(".op-btn").forEach(btn => btn.classList.remove("selected"));

		if (type !== expected.sameOrDifferent) {
			markWrong(
				button,
				type === "same" ? "Try again. These signs are different." : "Try again. These signs are the same."
			);
			return;
		}

		button.classList.add("selected");
		chosenSignType = type;
		pickOperation(type === "same" ? "+" : "-", button);
	}

	function chooseBiggerTerm(term, button) {
		if (stageStarted) shell().startClimbTimer();
		document.querySelectorAll("#step1 .choice-btn").forEach(btn => btn.classList.remove("selected"));

		if (term !== expected.biggerTerm) {
			const label = expected.biggerTerm === "first" ? "1st" : "2nd";
			markWrong(button, `Look at the sizes only. The bigger size is carried by the ${label} term.`);
			return;
		}

		button.classList.add("selected");
		chosenBiggerTerm = term;
		chosenBiggerSize = expected.biggerSize;
		markCorrectStep("step1-bigger-size");
		byId("step2")?.classList.remove("hidden");
		scrollToCenter("step2");

		const feedback = byId("feedback");
		if (feedback) feedback.textContent = "Good. Now choose the sign carried by that bigger size.";
	}

	function chooseBiggerSize(size, button) {
		if (size === Math.abs(currentProblem.a)) return chooseBiggerTerm("first", button);
		if (size === Math.abs(currentProblem.b)) return chooseBiggerTerm("second", button);
		markWrong(button, "Pick the term position: 1st or 2nd.");
	}

	function displaySign(sign) {
		return sign === "+" ? "+" : "-";
	}

	function setBuiltBoxText(value) {
		setText("builtBoxText", value);
		setText("builtBoxTextAnswer", value ? value.replace(/^Original question:\s*.*?\s*\|\s*/i, "") : "");
	}

	function problemPlainText() {
		return `${formatTerm(currentProblem.a, true)} ${formatTerm(currentProblem.b, false)}`;
	}

	function builtBoxLine() {
		return `Original question: ${problemPlainText()} | Box setup: ${displaySign(expected.outsideSign)}(${expected.biggerSize} ${expected.operation === "+" ? "+" : "-"} ${expected.smallerSize})`;
	}

	function boxSetupLine() {
		return `Box setup: ${displaySign(expected.outsideSign)}(${expected.biggerSize} ${expected.operation === "+" ? "+" : "-"} ${expected.smallerSize})`;
	}

	function chooseOutsideSign(sign, button) {
		if (stageStarted) shell().startClimbTimer();
		document.querySelectorAll("#step2 .sign-btn").forEach(btn => btn.classList.remove("selected"));

		if (sign !== expected.outsideSign) {
			markWrong(button, `Look at the bigger size. Its sign is ${displaySign(expected.outsideSign)}.`);
			return;
		}

		button.classList.add("selected");
		chosenOutsideSign = sign;
		setText("outsideSignDisplay", displaySign(sign));
		byId("outsideSignDisplay")?.classList.add("filled");
		markCorrectStep("step2-outside-sign");
		byId("builder")?.classList.remove("hidden");
		scrollToCenter("builder");

		const feedback = byId("feedback");
		if (feedback) feedback.textContent = "Correct. The bigger size sign is locked outside. Now choose the operation from the other term.";
	}

	function pickOutsideSign(sign, button) {
		chooseOutsideSign(sign, button);
	}

	function pickOperation(operation, button) {
		if (stageStarted) shell().startClimbTimer();
		document.querySelectorAll(".op-btn").forEach(btn => btn.classList.remove("selected"));

		if (!chosenOutsideSign) {
			markWrong(button, "Choose the bigger size sign before the sign relationship.");
			return;
		}

		if (operation !== expected.operation) {
			markWrong(button, expected.operation === "+"
				? "These signs are the same. Same signs add."
				: "These signs are different. Different signs subtract."
			);
			return;
		}

		button.classList.add("selected");
		chosenOperation = operation;
		chosenSignType = operation === "+" ? "same" : "different";
		setText("operationDisplay", operation === "+" ? "+" : "-");
		byId("operationDisplay")?.classList.add("filled");
		const firstInput = byId("firstNumInput");
		const secondInput = byId("secondNumInput");
		if (firstInput) firstInput.value = "";
		if (secondInput) secondInput.value = "";
		setBuiltBoxText("");
		markCorrectStep("step3-operation");
		byId("boxStep")?.classList.remove("hidden");

		const feedback = byId("feedback");
		if (feedback) feedback.textContent = "Operation is locked. Fill the box: big size first, smaller size second.";
		scrollToCenter("boxStep");
		window.setTimeout(() => firstInput?.focus(), 560);
	}

	function checkBox() {
		if (stageStarted) shell().startClimbTimer();
		const firstInput = byId("firstNumInput");
		const secondInput = byId("secondNumInput");
		const firstValue = firstInput?.value.trim() || "";
		const secondValue = secondInput?.value.trim() || "";
		const firstNum = Number(firstValue);
		const secondNum = Number(secondValue);
		const feedback = byId("feedback");

		if (!firstValue || !secondValue) {
			if (feedback) feedback.textContent = "Fill both box sizes first: bigger size, then smaller size.";
			if (!firstValue) firstInput?.focus();
			else secondInput?.focus();
			return;
		}

		if (chosenOutsideSign !== expected.outsideSign) {
			if (feedback) feedback.textContent = `Try again. The outside sign should be ${expected.outsideSign === "+" ? "+" : "-"}.`;
			markMistake();
			return;
		}

		if (firstNum !== expected.biggerSize) {
			if (feedback) feedback.textContent = "Try again. The bigger size must go first.";
			markMistake();
			return;
		}

		if (chosenOperation !== expected.operation) {
			if (feedback) {
				feedback.textContent = expected.operation === "+"
					? "Try again. Same signs add inside the box."
					: "Try again. Different signs subtract inside the box.";
			}
			markMistake();
			return;
		}

		if (secondNum !== expected.smallerSize) {
			if (feedback) feedback.textContent = "Try again. The smaller size goes second.";
			markMistake();
			return;
		}

		markCorrectStep("step4-box-fill");
		byId("answerArea")?.classList.remove("hidden");
		setBuiltBoxText(builtBoxLine());

		if (feedback) feedback.textContent = "Box is correct. Now solve it.";
		scrollToCenter("answerArea");
	}

	function updateFinalAnswerPreview() {
		const preview = byId("finalAnswerPreview");
		const signSlot = byId("finalPreviewSign");
		const sizeSlot = byId("finalPreviewSize");
		const input = byId("finalAnswerInput");
		if (!preview || !signSlot || !sizeSlot || !input) return;

		signSlot.textContent = chosenFinalAnswerSign === "+" ? "+" : chosenFinalAnswerSign === "-" ? "-" : "?";
		sizeSlot.textContent = input.value.trim() || "__";
		preview.classList.toggle("filled", Boolean(chosenFinalAnswerSign && input.value.trim()));
	}

	function pickFinalAnswerSign(sign, button) {
		if (stageStarted) shell().startClimbTimer();
		document.querySelectorAll(".final-sign-btn").forEach(btn => btn.classList.remove("selected", "wrong"));
		button.classList.add("selected");
		chosenFinalAnswerSign = sign;
		updateFinalAnswerPreview();
		const feedback = byId("feedback");
		if (feedback) feedback.textContent = "Answer sign selected. Now type the answer size.";
		byId("finalAnswerInput")?.focus();
	}

	function finishFinalAnswer(finalText) {
		runCorrectCount = getRequiredProgressSteps();

		let message;
		if (mistakesThisProblem === 0 && !gameScoreAwarded) {
			turtleScore = Math.min(10, turtleScore + 1);
			gameScoreAwarded = true;
			fadeCompletionTurtle();
			popScoreChange("+1", "plus");
			message = `🏁 Climb finished. Final answer ${finalText} is correct. +1 score earned.`;
		} else {
			gameScoreAwarded = true;
			message = `🏁 Climb finished. Final answer ${finalText} is correct. This run had a mistake, so no score point is added.`;
		}

		stageStarted = false;
		updateTurtleBoard(message);

		if (turtleScore >= 10) {
			shell().stopClimbTimer(true);
			shell().hideNextClimbButton({ force: true });
			showAchievementPopup();
			return;
		}

		shell().finishCorrectClimb({
			message: `${message} Next Climb is ready.`,
			scroll: true
		});
	}

	function checkFinalAnswer() {
		if (gameScoreAwarded && !stageStarted) {
			shell().finishCorrectClimb({ message: "✅ This climb is already finished. Tap Next Climb to continue.", scroll: true });
			return;
		}

		if (stageStarted) shell().startClimbTimer();
		const input = byId("finalAnswerInput");
		const answerFeedback = byId("answerFeedback");
		if (!input || !answerFeedback) return;

		const correctSign = expected.finalAnswer >= 0 ? "+" : "-";
		const correctSize = Math.abs(expected.finalAnswer);
		const typedSize = Number(input.value.trim());

		if (!chosenFinalAnswerSign) {
			answerFeedback.textContent = "Choose the answer sign first.";
			answerFeedback.style.color = "#c0392b";
			const feedback = byId("feedback");
			if (feedback) feedback.textContent = "Tap + or - before checking the answer. This reminder does not count as a mistake.";
			return;
		}

		if (!input.value.trim()) {
			answerFeedback.textContent = "Type the answer size.";
			answerFeedback.style.color = "#c0392b";
			const feedback = byId("feedback");
			if (feedback) feedback.textContent = "Type the number size before checking. This reminder does not count as a mistake.";
			input.style.borderColor = "#ef7777";
			return;
		}

		if (chosenFinalAnswerSign !== correctSign) {
			answerFeedback.textContent = "Check the answer sign.";
			answerFeedback.style.color = "#c0392b";
			const feedback = byId("feedback");
			if (feedback) feedback.textContent = "Try again. Choose the correct + or - sign.";
			document.querySelectorAll(".final-sign-btn.selected").forEach(btn => btn.classList.add("wrong"));
			markMistake();
			return;
		}

		if (typedSize !== correctSize) {
			answerFeedback.textContent = "Try again. Check the size of the answer.";
			answerFeedback.style.color = "#c0392b";
			const feedback = byId("feedback");
			if (feedback) feedback.textContent = "Try again. The sign may be right, but the size needs checking.";
			input.style.borderColor = "#ef7777";
			markMistake();
			return;
		}

		const finalText = `${correctSign}${correctSize}`;
		answerFeedback.textContent = "Correct! Great pattern work.";
		answerFeedback.style.color = "#248a2f";
		const feedback = byId("feedback");
		if (feedback) feedback.textContent = `Finished. Final answer is ${finalText}.`;
		input.style.borderColor = "#6cc070";
		byId("finalAnswerPreview")?.classList.add("filled");

		markCorrectStep("step5-final-answer");
		finishFinalAnswer(finalText);
	}

	function resetChallenge() {
		turtleScore = 0;
		stage = 1;
		stageStarted = false;
		runCorrectCount = 0;
		mistakesThisProblem = 0;
		gameScoreAwarded = false;
		earnedProgressSteps = new Set();
		achievementShown = false;
		shell().resetRaceTimer();
		shell().hideNextClimbButton({ force: true });
		Object.keys(usedProblemDecks).forEach(key => usedProblemDecks[key].clear());
		stopConfetti();
		loadFirstClimb();
	}

	function rankText(rank) {
		if (rank === 1) return "🥇 1st Place World Time Champion";
		if (rank === 2) return "🥈 2nd Place World Time";
		if (rank === 3) return "🥉 3rd Place World Time";
		return "";
	}

function startConfetti() {
		return shell()?.startConfetti?.();
	}
function stopConfetti() {
		return shell()?.stopConfetti?.();
	}
function showAchievementPopup() {
		achievementShown = true;
		return shell()?.showAchievementPopup?.();
	}
async function createCertificateFromName() {
		return shell()?.createCertificateFromName?.();
	}
function closeCertificatePopup() {
		return shell()?.closeCertificatePopup?.();
	}
function saveCertificateImage() {
		return shell()?.saveCertificateImage?.();
	}
	function loadFirstClimb() {
		document.querySelector(".game")?.classList.remove("climb-active");
		stage = 1;
		stageStarted = false;
		currentProblem = generateProblem();
		setupExpected();
		renderProblem();
		resetSteps(false);
		prepareSmartNumberInputs();
		byId("climbStartGate")?.classList.remove("hidden");
		byId("playArea")?.classList.add("hidden");
		shell().hideNextClimbButton({ force: true });
		shell().updateTimerPanel?.();
		shell().reviveProgressTurtle?.();
		updateTurtleBoard("Press START the Climb when you are ready.", { reviveTurtle: true });
	}

	function init() {
		window.MathRidgeLocal = {
			getScore: () => turtleScore,
			getStage: () => stage
		};

		window.startClimbFromGate = startClimbFromGate;
		window.startClimb = startClimbFromGate;
		window.nextClimb = nextClimb;
		window.chooseSignType = chooseSignType;
		window.chooseBiggerTerm = chooseBiggerTerm;
		window.chooseBiggerSize = chooseBiggerSize;
		window.chooseOutsideSign = chooseOutsideSign;
		window.pickOutsideSign = pickOutsideSign;
		window.pickOperation = pickOperation;
		window.checkBox = checkBox;
		window.pickFinalAnswerSign = pickFinalAnswerSign;
		window.checkFinalAnswer = checkFinalAnswer;
		window.resetChallenge = resetChallenge;
		loadFirstClimb();
		shell().openSavedCertificateFromCabin?.();
	}

	init();
})();
