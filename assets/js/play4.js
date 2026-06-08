/* Math Ridge Play 1-4 local game: Chunking Repeated Values.
   The global shell owns timer, top shelf, ladder, background, and Next Climb visibility. */
(function () {
	"use strict";

	const PLAY_ID = "1_4";
	const PLAY_SECTION = "1-4";
	const PLAY_TITLE = "Distribution and Grouping Foundations";
	const PLAY_COMPLETE_KEY = "mathRidge_playComplete_1_4";
	const PLAY_CERT_KEY = "mathRidge_cert_1_4";
	const ROOT_GATE_UNLOCK_KEY = "mathRidge_rootGateUnlocked_chapter_1";
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
	let progressThemeTimer = null;
	let pageHasStartedClimb = false;
	let latestRaceRank = null;
	let latestSavedRaceSeconds = null;
	let completedSteps = new Set();
	let selectedCountChoice = null;
	let selectedSplitChoice = null;

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
		localStorage.setItem(ROOT_GATE_UNLOCK_KEY, "true");
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
		return turtleScore >= 7 && turtleScore <= 9;
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
			const plus = index < count - 1 ? '<span class="op">+</span>' : "";
			return `<span class="num">${value}</span>${plus}`;
		}).join("");
	}

	function fitRepeatedLineToFrame() {
		const line = byId("repeatedLine");
		if (!line) return;

		line.classList.add("is-measuring");
		line.style.removeProperty("--play4-fit-size");

		window.requestAnimationFrame(() => {
			const available = line.clientWidth;
			const needed = line.scrollWidth;
			if (!available || !needed || needed <= available) {
				line.classList.remove("is-measuring");
				return;
			}

			const currentSize = Number.parseFloat(window.getComputedStyle(line).fontSize) || 16;
			const fittedSize = Math.max(10, Math.floor(currentSize * (available / needed) * 100) / 100);
			line.style.setProperty("--play4-fit-size", `${fittedSize}px`);
			line.classList.add("is-fitted");
			line.classList.remove("is-measuring");
		});
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
		const repeatedLine = byId("repeatedLine");
		if (repeatedLine) {
			const itemCount = Math.max(1, current.multiplicity * 2 - 1);
			repeatedLine.style.setProperty("--play4-item-count", itemCount);
			repeatedLine.style.removeProperty("--play4-fit-size");
			repeatedLine.classList.toggle("is-compact", itemCount >= 15);
			repeatedLine.classList.remove("is-fitted");
			repeatedLine.innerHTML = repeatedAdditionHTML(current.multiplicity, current.value);
			fitRepeatedLineToFrame();
		}

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

	function setChoiceFeedback(id, text, className = "feedback") {
		const feedback = byId(id);
		if (!feedback) return;
		feedback.textContent = text;
		feedback.className = className;
	}

	function clearArmedButton(id) {
		const button = byId(id);
		if (!button) return;
		button.disabled = false;
		button.removeAttribute("aria-disabled");
		button.classList.remove("is-play-armed");
		button.removeAttribute("data-trial-armed");
		button.removeAttribute("data-trial-pointer-first-arm");
	}

	function disableChoiceStep(stepId, buttonId) {
		const step = byId(stepId);
		step?.querySelectorAll(".choice").forEach(item => {
			item.style.pointerEvents = "none";
			item.setAttribute("aria-disabled", "true");
		});
		const button = byId(buttonId);
		if (button) {
			button.disabled = true;
			button.setAttribute("aria-disabled", "true");
		}
	}

	function makeChoice(text, isCorrect, stepKey) {
		const choice = document.createElement("div");
		choice.className = "choice";
		choice.textContent = text;
		choice.dataset.correct = isCorrect ? "true" : "false";
		choice.dataset.stepKey = stepKey;
		choice.onclick = () => {
			touchClimbTimer();
			if (completedSteps.has(stepKey)) return;

			choice.parentElement?.querySelectorAll(".choice").forEach(item => item.classList.remove("selected"));
			choice.classList.add("selected");

			if (stepKey === "count") {
				selectedCountChoice = choice;
				setChoiceFeedback("countFeedback", "Choice selected. Double tap Check Count to confirm.", "feedback good-text");
			} else if (stepKey === "split") {
				selectedSplitChoice = choice;
				setChoiceFeedback("splitFeedback", "Choice selected. Double tap Check Split to confirm.", "feedback good-text");
			}

			shell()?.playSfx?.("firstTap");
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
		selectedCountChoice = null;
		clearArmedButton("checkCountButton");
		setChoiceFeedback("countFeedback", "");
		const options = getCountChoiceOptions().map(num => ({
			text: `${numberWords[num]} ${current.value}s`,
			correct: num === current.multiplicity
		})).sort(() => Math.random() - 0.5);

		options.forEach(item => {
			box.appendChild(makeChoice(item.text, item.correct, "count"));
		});
	}

	function checkCountChoice() {
		touchClimbTimer();
		if (completedSteps.has("count")) return;

		if (!selectedCountChoice) {
			setChoiceFeedback("countFeedback", "Select one count option first.", "feedback warning-text");
			return;
		}

		if (selectedCountChoice.dataset.correct === "true") {
			selectedCountChoice.classList.add("correct-flash");
			setChoiceFeedback("countFeedback", `✅ Correct. There are ${current.multiplicity} copies.`, "feedback good-text");
			disableChoiceStep("countStep", "checkCountButton");
			markCorrectStep("count");
			showStep("notationStep", "outerInput");
			return;
		}

		selectedCountChoice.classList.add("wrong-flash");
		setChoiceFeedback("countFeedback", `Not yet. Count how many ${current.value}s appear in the addition line.`, "feedback bad-text");
		markMistake();
		window.setTimeout(() => selectedCountChoice?.classList.remove("wrong-flash"), 550);
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
		selectedSplitChoice = null;
		clearArmedButton("checkSplitButton");
		setChoiceFeedback("splitFeedback", "");
		const correct = splitText();
		const choices = [
			{ text: correct, correct: true },
			{ text: `5(${current.value})+${current.secondChunk}`, correct: false },
			{ text: `${current.secondChunk}(${current.value})+5(${current.secondChunk})`, correct: false }
		].sort(() => Math.random() - 0.5);

		choices.forEach(item => {
			box.appendChild(makeChoice(item.text, item.correct, "split"));
		});
	}

	function checkSplitChoice() {
		touchClimbTimer();
		if (completedSteps.has("split")) return;

		if (!selectedSplitChoice) {
			setChoiceFeedback("splitFeedback", "Select one split option first.", "feedback warning-text");
			return;
		}

		if (selectedSplitChoice.dataset.correct === "true") {
			selectedSplitChoice.classList.add("correct-flash");
			setChoiceFeedback("splitFeedback", "✅ Correct split. Now solve each chunk.", "feedback good-text");
			disableChoiceStep("splitStep", "checkSplitButton");
			markCorrectStep("split");
			byId("chunkVisual").innerHTML = chunkVisualHTML();
			setText("chunkALabel", `5(${current.value})`);
			setText("chunkBLabel", `${current.secondChunk}(${current.value})`);
			showStep("chunkVisualStep", "chunkAInput");
			return;
		}

		selectedSplitChoice.classList.add("wrong-flash");
		setChoiceFeedback("splitFeedback", `Not yet. Keep the repeated value ${current.value} in both chunks.`, "feedback bad-text");
		markMistake();
		window.setTimeout(() => selectedSplitChoice?.classList.remove("wrong-flash"), 550);
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
			scrollToCompleteResult();
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

	function scrollToCompleteResult() {
		if (shell()?.scrollToPremiumElement) {
			shell().scrollToPremiumElement("completeStep", 14, {
				delay: 220,
				duration: 900,
				slow: true
			});
			return;
		}
		const element = byId("completeStep");
		if (!element) return;
		window.setTimeout(() => element.scrollIntoView({ behavior: "smooth", block: "center" }), 220);
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
			selectedCountChoice = null;
			selectedSplitChoice = null;
			updateTurtleBoard();
		}

		setFeedback("", "feedback");
		["countFeedback", "notationFeedback", "splitFeedback", "chunkAFeedback", "chunkBFeedback", "finalFeedback"].forEach(id => {
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
		clearArmedButton("checkCountButton");
		clearArmedButton("checkSplitButton");
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
			selectedCountChoice = null;
			selectedSplitChoice = null;
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
		shell()?.playSfx?.("wrong");
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
			turtleScore = Math.min(10, turtleScore + 1);
			gameScoreAwarded = true;
			earnedScore = true;
			message = turtleScore >= 10
				? "🎁 Score 10 reached! Certificate unlocked."
				: "🏁 Flawless chunking path! +1 score. Next Climb is ready.";
		} else {
			gameScoreAwarded = true;
			message = "🏁 Climb finished. Final answer is correct. This run had a mistake, so no score point is added. Next Climb is ready.";
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
			if (!achievementShown) {
				window.setTimeout(showAchievementPopup, 700);
			}
			return;
		}

		shell()?.finishCorrectClimb?.({ message, scroll: false });
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
function openSavedCertificateFromCabin() {
		return shell()?.openSavedCertificateFromCabin?.();
	}
	function attachEvents() {
		prepareNumberOnlyInputs();

		let fitResizeTimer = 0;
		window.addEventListener("resize", () => {
			window.clearTimeout(fitResizeTimer);
			fitResizeTimer = window.setTimeout(fitRepeatedLineToFrame, 120);
		});

		if (document.fonts?.ready) {
			document.fonts.ready.then(fitRepeatedLineToFrame).catch(() => {});
		}

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
	window.checkCountChoice = checkCountChoice;
	window.checkNotation = checkNotation;
	window.checkSplitChoice = checkSplitChoice;
	window.checkChunkA = checkChunkA;
	window.checkChunkB = checkChunkB;
	window.checkFinalAnswer = checkFinalAnswer;
	window.nextClimb = nextClimb;
	window.resetPracticeGame = resetPracticeGame;
	window.resetChallenge = resetChallenge;
	initPlay4();
})();
