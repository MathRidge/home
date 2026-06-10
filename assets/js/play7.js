/* Math Ridge Play 2-3 local game: Fraction Multiplication and Division with Factor Trees.
   The global shell owns timer, top shelf, ladder, background, and Next Climb visibility. */
(function () {
	"use strict";

	const PLAY_ID = "2_3";
	const PLAY_SECTION = "2-3";
	const PLAY_TITLE = "Fraction Product Structure";
	const PLAY_COMPLETE_KEY = "mathRidge_playComplete_2_3";
	const PLAY_CERT_KEY = "mathRidge_cert_2_3";
	const NEXT_NOTE_UNLOCK_KEY = "mathRidge_noteUnlocked_2_4";
	const NEXT_STAGE_UNLOCK_KEY = "mathRidge_stageUnlocked_2_4";
	const CERT_SIGNATURE = "Presented by Math Ridge Creator: Kuan-Yuan Huang";
	const TOTAL_STEPS = 5;
	const PRIMES = [2, 3, 5, 7];
	const PROBLEM_BANKS = {
		easy: [
			{ operation: "multiply", first: { top: 2, bottom: 3 }, second: { top: 9, bottom: 10 } },
			{ operation: "multiply", first: { top: 4, bottom: 5 }, second: { top: 15, bottom: 8 } },
			{ operation: "multiply", first: { top: 6, bottom: 7 }, second: { top: 14, bottom: 15 } },
			{ operation: "multiply", first: { top: 8, bottom: 9 }, second: { top: 15, bottom: 20 } },
			{ operation: "divide", first: { top: 2, bottom: 5 }, second: { top: 6, bottom: 25 } },
			{ operation: "divide", first: { top: 3, bottom: 8 }, second: { top: 9, bottom: 20 } },
			{ operation: "divide", first: { top: 4, bottom: 15 }, second: { top: 8, bottom: 25 } },
			{ operation: "divide", first: { top: 6, bottom: 25 }, second: { top: 9, bottom: 10 } }
		],
		medium: [
			{ operation: "multiply", first: { top: 18, bottom: 25 }, second: { top: 35, bottom: 24 } },
			{ operation: "multiply", first: { top: 32, bottom: 45 }, second: { top: 27, bottom: 56 } },
			{ operation: "multiply", first: { top: 40, bottom: 63 }, second: { top: 21, bottom: 50 } },
			{ operation: "multiply", first: { top: 48, bottom: 35 }, second: { top: 25, bottom: 72 } },
			{ operation: "multiply", first: { top: 16, bottom: 25 }, second: { top: 35, bottom: 28 } },
			{ operation: "divide", first: { top: 28, bottom: 45 }, second: { top: 35, bottom: 54 } },
			{ operation: "divide", first: { top: 30, bottom: 49 }, second: { top: 45, bottom: 56 } },
			{ operation: "divide", first: { top: 24, bottom: 49 }, second: { top: 36, bottom: 56 } },
			{ operation: "divide", first: { top: 54, bottom: 35 }, second: { top: 45, bottom: 28 } }
		],
		hard: [
			{ operation: "multiply", first: { top: 48, bottom: 35 }, second: { top: 63, bottom: 80 } },
			{ operation: "multiply", first: { top: 96, bottom: 125 }, second: { top: 75, bottom: 64 } },
			{ operation: "multiply", first: { top: 90, bottom: 112 }, second: { top: 49, bottom: 75 } },
			{ operation: "multiply", first: { top: 64, bottom: 105 }, second: { top: 98, bottom: 45 } },
			{ operation: "divide", first: { top: 70, bottom: 81 }, second: { top: 42, bottom: 125 } },
			{ operation: "divide", first: { top: 84, bottom: 125 }, second: { top: 70, bottom: 81 } },
			{ operation: "divide", first: { top: 98, bottom: 81 }, second: { top: 63, bottom: 125 } },
			{ operation: "divide", first: { top: 75, bottom: 112 }, second: { top: 45, bottom: 98 } }
		]
	};

	const usedProblemKeys = new Set();

	let score = 0;
	let stage = 1;
	let round = null;
	let runCorrectCount = 0;
	let mistakesThisStage = 0;
	let stageEligible = true;
	let stageComplete = false;
	let stageStarted = false;
	let pageHasStartedClimb = false;
	let finalAnswered = false;
	let matchesChecked = false;
	let selectedSetupChoice = null;
	let selectedSetupButton = null;
	let achievementShown = false;
	let progressThemeTimer = null;
	let completedSteps = new Set();
	let latestRaceRank = null;
	let latestSavedRaceSeconds = null;

	function shell() { return window.MathRidgePlay || null; }
	function byId(id) { return document.getElementById(id); }
	function setText(id, text) { const element = byId(id); if (element) element.textContent = text; }
	function safeText(value) { return String(value || "").replace(/[<>]/g, "").trim(); }

	function fallbackFormatRaceTime(ms) {
		const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	}

	function formatRaceTime(ms) { return shell()?.formatRaceTime ? shell().formatRaceTime(ms) : fallbackFormatRaceTime(ms); }
	function getRaceMs() { return shell()?.getTotalRaceMs ? shell().getTotalRaceMs() : 0; }

	function rankText(rank) {
		if (rank === 1) return "🥇 1st Place World Time Champion";
		if (rank === 2) return "🥈 2nd Place World Time";
		if (rank === 3) return "🥉 3rd Place World Time";
		return "";
	}

	function touchClimbTimer() {
		if (!pageHasStartedClimb || !stageStarted || stageComplete || score >= 10) return;
		shell()?.startClimbTimer?.({ hideNext: false });
	}

	function stopClimbTimer(addToTotal = true) { shell()?.stopClimbTimer?.(addToTotal); }
	function resetRaceTimer() { shell()?.resetRaceTimer?.(); }

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
		} catch (error) {}
	}

	function shuffle(arr) {
		const copy = [...arr];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function gcd(a, b) { while (b) [a, b] = [b, a % b]; return Math.abs(a); }

	function countMap(arr) {
		const map = {};
		arr.forEach(n => map[n] = (map[n] || 0) + 1);
		return map;
	}

	function sameMultiset(a, b) {
		if (a.length !== b.length) return false;
		const A = countMap(a);
		const B = countMap(b);
		return PRIMES.every(p => (A[p] || 0) === (B[p] || 0));
	}

	function getDifficultyBand() {
		if (score <= 3) return "easy";
		if (score <= 6) return "medium";
		return "hard";
	}

	function primeFactorsOf(value) {
		const factors = [];
		let rest = Math.abs(Number(value || 0));
		if (!Number.isInteger(rest) || rest < 1) return [];
		PRIMES.forEach(prime => {
			while (rest % prime === 0) {
				factors.push(prime);
				rest /= prime;
			}
		});
		return rest === 1 ? factors : [];
	}

	function displayedValues(seed) {
		return [seed.first.top, seed.first.bottom, seed.second.top, seed.second.bottom].map(Number);
	}

	function isValidProblemSeed(seed, band) {
		const values = displayedValues(seed);
		if (values.some(value => !Number.isInteger(value) || value <= 1)) return false;
		if (new Set(values).size !== values.length) return false;
		if (seed.first.top === seed.first.bottom || seed.second.top === seed.second.bottom) return false;
		if (values.some(value => primeFactorsOf(value).length === 0)) return false;
		if (band === "easy" && values.some(value => value > 30)) return false;
		if (band === "medium" && values.some(value => value < 10 || value > 99)) return false;
		if (band === "hard" && (values.some(value => value < 10 || value > 144) || values.filter(value => value >= 100).length > 1)) return false;
		return true;
	}

	function makeProblemFromSeed(seed) {
		const first = { ...seed.first };
		const shownSecond = { ...seed.second };
		const operation = seed.operation === "divide" ? "divide" : "multiply";
		const afterSecond = operation === "divide"
			? { top: shownSecond.bottom, bottom: shownSecond.top }
			: { ...shownSecond };
		const topFactors = [
			...primeFactorsOf(first.top),
			...primeFactorsOf(afterSecond.top)
		];
		const bottomFactors = [
			...primeFactorsOf(first.bottom),
			...primeFactorsOf(afterSecond.bottom)
		];
		const numerator = first.top * afterSecond.top;
		const denominator = first.bottom * afterSecond.bottom;
		const g = gcd(numerator, denominator);
		const reducedTop = numerator / g;
		const reducedBottom = denominator / g;

		return {
			operation,
			first,
			shownSecond,
			afterSecond,
			correctSetup: { first, second: afterSecond, key: setupKey(first, afterSecond) },
			topFactors: shuffle(topFactors),
			bottomFactors: shuffle(bottomFactors),
			topParts: [first.top, afterSecond.top],
			bottomParts: [first.bottom, afterSecond.bottom],
			numerator,
			denominator,
			reducedTop,
			reducedBottom
		};
	}

	function problemFitsLearningRules(problem) {
		if (!problem) return false;
		if (problem.numerator === problem.denominator) return false;
		if (problem.reducedTop === 1 && problem.reducedBottom === 1) return false;
		if (!problem.topFactors.length || !problem.bottomFactors.length) return false;
		return true;
	}

	function fractionHtml(top, bottom) {
		return `<span class="fraction"><span class="top">${top}</span><span class="bottom">${bottom}</span></span>`;
	}

	function setupKey(f1, f2) {
		return `${f1.top}/${f1.bottom}x${f2.top}/${f2.bottom}`;
	}

	function setupHtml(f1, f2) {
		return `${fractionHtml(f1.top, f1.bottom)}<span class="op-symbol">×</span>${fractionHtml(f2.top, f2.bottom)}`;
	}

	function productExpressionHtml(parts) {
		return parts.map(value => `<span class="factor-part">${value}</span>`).join(`<span class="mini-op">×</span>`);
	}

	function makeProblem() {
		const band = getDifficultyBand();
		const candidates = shuffle(PROBLEM_BANKS[band] || PROBLEM_BANKS.easy)
			.filter(seed => isValidProblemSeed(seed, band))
			.map(makeProblemFromSeed)
			.filter(problemFitsLearningRules);

		for (const problem of candidates) {
			const key = `${band}|${problem.operation}|${problem.first.top}/${problem.first.bottom}|${problem.shownSecond.top}/${problem.shownSecond.bottom}`;
			if (usedProblemKeys.has(key) && usedProblemKeys.size < candidates.length) continue;
			if (usedProblemKeys.size >= candidates.length) usedProblemKeys.clear();
			usedProblemKeys.add(key);
			return problem;
		}

		return makeProblemFromSeed(PROBLEM_BANKS.easy[0]);
	}

	function renderProblem() {
		const op = round.operation === "divide" ? "÷" : "×";
		const problem = byId("problemDisplay");
		if (problem) {
			problem.innerHTML = `${fractionHtml(round.first.top, round.first.bottom)}<span class="op-symbol">${op}</span>${fractionHtml(round.shownSecond.top, round.shownSecond.bottom)}`;
			resizeOperationLine(problem);
		}
		const setup = byId("setupDisplay");
		if (setup) setup.textContent = "Choose the correct setup below.";
	}

	function resizeOperationLine(element) {
		if (!element) return;
		element.classList.remove("shrink-1", "shrink-2", "shrink-3");
		window.requestAnimationFrame(() => {
			if (element.scrollWidth <= element.clientWidth + 2) return;
			element.classList.add("shrink-1");
			window.requestAnimationFrame(() => {
				if (element.scrollWidth <= element.clientWidth + 2) return;
				element.classList.add("shrink-2");
				window.requestAnimationFrame(() => {
					if (element.scrollWidth <= element.clientWidth + 2) return;
					element.classList.add("shrink-3");
				});
			});
		});
	}

	function renderSetupChoices() {
		const grid = byId("setupChoices");
		if (!grid || !round) return;
		grid.innerHTML = "";

		const choices = new Map();
		function add(label, f1, f2) {
			const key = setupKey(f1, f2);
			if (!choices.has(key)) choices.set(key, { label, f1, f2, key });
		}

		add("correct", round.first, round.afterSecond);
		add("shown", round.first, round.shownSecond);
		add("flip first", { top: round.first.bottom, bottom: round.first.top }, round.afterSecond);
		add("flip second wrong", round.first, { top: round.afterSecond.bottom, bottom: round.afterSecond.top });
		add("flip both", { top: round.first.bottom, bottom: round.first.top }, { top: round.afterSecond.bottom, bottom: round.afterSecond.top });

		const view = shuffle([...choices.values()]).slice(0, 4);
		if (!view.some(choice => choice.key === round.correctSetup.key)) view[0] = choices.get(round.correctSetup.key);

		view.forEach(choice => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "choice-card";
			button.innerHTML = setupHtml(choice.f1, choice.f2);
			button.onclick = () => selectSetupChoice(button, choice);
			grid.appendChild(button);
			resizeOperationLine(button);
		});
	}

	function selectSetupChoice(button, choice) {
		if (stageComplete || completedSteps.has("setup")) return;
		touchClimbTimer();
		shell()?.playSfx?.("firstTap");
		selectedSetupChoice = choice;
		selectedSetupButton = button;
		document.querySelectorAll("#setupChoices .choice-card").forEach(card => card.classList.remove("selected"));
		button?.classList.add("selected");
		const setup = byId("setupDisplay");
		if (setup) setup.innerHTML = `Selected setup: ${setupHtml(choice.f1, choice.f2)}`;
		setLocalFeedback("setupFeedback", "Selection ready. Tap Check Setup twice to confirm.", "neutral");
	}

	function confirmSetupChoice() {
		if (stageComplete || completedSteps.has("setup")) return;
		touchClimbTimer();
		if (!selectedSetupChoice || !selectedSetupButton) {
			setLocalFeedback("setupFeedback", "Choose a setup first, then confirm it.", "bad");
			return;
		}
		checkSetupChoice(selectedSetupButton, selectedSetupChoice);
	}

	function buildInputs(id, count) {
		const wrap = byId(id);
		if (!wrap) return;
		wrap.innerHTML = "";
		for (let i = 0; i < count; i++) {
			const input = document.createElement("input");
			input.className = "factor-input";
			input.maxLength = 1;
			input.type = "text";
			input.inputMode = "numeric";
			input.pattern = "[0-9]*";
			input.setAttribute("aria-label", `${id === "topInputs" ? "top" : "bottom"} prime factor ${i + 1}`);
			input.addEventListener("input", () => {
				touchClimbTimer();
				input.value = input.value.replace(/[^2357]/g, "");
				if (input.value && input.nextElementSibling) input.nextElementSibling.focus();
			});
			input.addEventListener("keydown", event => {
				if (event.key === "Backspace" && !input.value && input.previousElementSibling) input.previousElementSibling.focus();
			});
			wrap.appendChild(input);
		}
	}

	function prepareAnswerInputs() {
		const topInput = byId("ansTop");
		const bottomInput = byId("ansBottom");
		if (!topInput || !bottomInput || !round) return;
		const topLength = String(round.reducedTop).length;
		const bottomLength = String(round.reducedBottom).length;
		topInput.maxLength = topLength;
		bottomInput.maxLength = bottomLength;
		topInput.oninput = () => {
			touchClimbTimer();
			let value = topInput.value.replace(/\D/g, "");
			if (value.length > topLength) {
				topInput.value = value.slice(0, topLength);
				bottomInput.value = value.slice(topLength, topLength + bottomLength);
				bottomInput.focus();
				return;
			}
			topInput.value = value.slice(0, topLength);
			if (topInput.value.length >= topLength) bottomInput.focus();
		};
		bottomInput.oninput = () => {
			touchClimbTimer();
			bottomInput.value = bottomInput.value.replace(/\D/g, "").slice(0, bottomLength);
		};
	}

	function getInputFactors(id) {
		return [...document.querySelectorAll(`#${id} input`)].map(input => Number(input.value)).filter(Boolean);
	}

	function resetStepVisuals() {
		["setupStep", "topStep", "bottomStep", "reduceStep", "completeStep"].forEach((id, index) => {
			const panel = byId(id);
			if (!panel) return;
			panel.classList.toggle("hidden", index !== 0);
		});
		["setupFeedback", "feedback"].forEach(id => {
			const box = byId(id);
			if (box) { box.textContent = ""; box.className = "feedback"; }
		});
		["ansTop", "ansBottom"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.value = "";
			input.style.borderColor = "#b9dcff";
		});
		const primeForm = byId("primeForm");
		if (primeForm) primeForm.innerHTML = "";
		const completeFlow = byId("completeFlow");
		if (completeFlow) completeFlow.innerHTML = "";
		const finalBlock = byId("finalAnswerBlock");
		if (finalBlock) finalBlock.classList.add("hidden");
		const setupButton = byId("checkSetupBtn");
		if (setupButton) {
			setupButton.disabled = false;
			setupButton.removeAttribute("aria-disabled");
			setupButton.classList.remove("is-play-armed");
		}
		selectedSetupChoice = null;
		selectedSetupButton = null;
		setText("completeMessage", "");
	}

	function newRound(options = {}) {
		round = makeProblem();
		runCorrectCount = 0;
		mistakesThisStage = 0;
		stageEligible = true;
		stageComplete = false;
		finalAnswered = false;
		matchesChecked = false;
		completedSteps = new Set();

		const topFocus = byId("topFocusValue");
		if (topFocus) topFocus.innerHTML = productExpressionHtml(round.topParts);
		const bottomFocus = byId("bottomFocusValue");
		if (bottomFocus) bottomFocus.innerHTML = productExpressionHtml(round.bottomParts);
		buildInputs("topInputs", round.topFactors.length);
		buildInputs("bottomInputs", round.bottomFactors.length);
		resetStepVisuals();
		renderProblem();
		renderSetupChoices();
		prepareAnswerInputs();
		updateDifficultyText();
		hideNextClimb();
		updateTurtleBoard(options.message || (stageStarted ? `Stage ${stage}: choose setup, factor, match, and reduce.` : "Press START the Climb when you are ready."));
	}

	function checkSetupChoice(button, choice) {
		touchClimbTimer();
		if (stageComplete || completedSteps.has("setup")) return;
		if (!choice || choice.key !== round.correctSetup.key) {
			button.classList.add("wrong");
			button.classList.remove("selected");
			selectedSetupChoice = null;
			selectedSetupButton = null;
			markMistake();
			setLocalFeedback("setupFeedback", round.operation === "divide" ? "Not yet. Only the fraction after ÷ flips." : "Not yet. Multiplication keeps both fractions in place.", "bad");
			return;
		}
		button.classList.add("correct");
		document.querySelectorAll("#setupChoices .choice-card").forEach(card => card.disabled = true);
		const setupButton = byId("checkSetupBtn");
		if (setupButton) {
			setupButton.disabled = true;
			setupButton.setAttribute("aria-disabled", "true");
			setupButton.classList.remove("is-play-armed");
		}
		const setup = byId("setupDisplay");
		if (setup) setup.innerHTML = `Correct setup: ${setupHtml(round.correctSetup.first, round.correctSetup.second)}`;
		markCorrectStep("setup");
		setLocalFeedback("setupFeedback", "✅ Correct setup. Now factor the top shelf.", "good");
		byId("topStep")?.classList.remove("hidden");
		focusPanel("topStep");
	}

	function getCrossMap() {
		const top = round.topFactors;
		const bottom = round.bottomFactors;
		const topCross = Array(top.length).fill(false);
		const bottomCross = Array(bottom.length).fill(false);
		for (let i = 0; i < top.length; i++) {
			for (let j = 0; j < bottom.length; j++) {
				if (!topCross[i] && !bottomCross[j] && top[i] === bottom[j]) {
					topCross[i] = true;
					bottomCross[j] = true;
					break;
				}
			}
		}
		return { topCross, bottomCross };
	}

	function buildPrimeForm(autoCross) {
		const wrap = byId("primeForm");
		if (!wrap || !round) return;
		wrap.innerHTML = "";
		const crossMap = autoCross ? getCrossMap() : {
			topCross: Array(round.topFactors.length).fill(false),
			bottomCross: Array(round.bottomFactors.length).fill(false)
		};

		const topLabel = document.createElement("strong");
		topLabel.textContent = "Top: ";
		wrap.appendChild(topLabel);
		round.topFactors.forEach((n, i) => {
			const chip = document.createElement("span");
			chip.className = "factor-chip top-chip";
			chip.dataset.side = "top";
			chip.dataset.index = String(i);
			chip.dataset.value = String(n);
			chip.textContent = String(n);
			if (crossMap.topCross[i]) chip.classList.add("crossed");
			updateFactorChipLabel(chip);
			chip.onclick = () => {
				touchClimbTimer();
				if (matchesChecked) return;
				chip.classList.toggle("crossed");
				updateFactorChipLabel(chip);
			};
			wrap.appendChild(chip);
		});

		const breakLine = document.createElement("span");
		breakLine.className = "break-line";
		wrap.appendChild(breakLine);

		const bottomLabel = document.createElement("strong");
		bottomLabel.textContent = "Bottom: ";
		wrap.appendChild(bottomLabel);
		round.bottomFactors.forEach((n, i) => {
			const chip = document.createElement("span");
			chip.className = "factor-chip bottom-chip";
			chip.dataset.side = "bottom";
			chip.dataset.index = String(i);
			chip.dataset.value = String(n);
			chip.textContent = String(n);
			if (crossMap.bottomCross[i]) chip.classList.add("crossed");
			updateFactorChipLabel(chip);
			chip.onclick = () => {
				touchClimbTimer();
				if (matchesChecked) return;
				chip.classList.toggle("crossed");
				updateFactorChipLabel(chip);
			};
			wrap.appendChild(chip);
		});
	}

	function updateFactorChipLabel(chip) {
		if (!chip) return;
		const value = chip.dataset.value || chip.textContent.replace(/[()]/g, "");
		chip.textContent = chip.classList.contains("crossed") ? `(${value})` : value;
	}

	function showMatchingPieces() {
		touchClimbTimer();
		if (score >= 3) {
			setFeedback("Show Matching Pieces is only available during the first 3 scores. Now try crossing the matches yourself.", "bad");
			return;
		}
		buildPrimeForm(true);
		setFeedback("Guided help used: matching pieces are crossed out for you. Now check the matches.", "neutral");
	}

	function crossingIsCorrect() {
		const selectedTop = [];
		const selectedBottom = [];
		document.querySelectorAll("#primeForm .factor-chip.crossed").forEach(chip => {
			const value = Number(chip.dataset.value || chip.textContent.replace(/[()]/g, ""));
			if (!value) return;
			if (chip.dataset.side === "top") selectedTop.push(value);
			else if (chip.dataset.side === "bottom") selectedBottom.push(value);
		});
		const expectedTop = [];
		const expectedBottom = [];
		PRIMES.forEach(prime => {
			const topCount = round.topFactors.filter(value => value === prime).length;
			const bottomCount = round.bottomFactors.filter(value => value === prime).length;
			const matchCount = Math.min(topCount, bottomCount);
			for (let i = 0; i < matchCount; i++) {
				expectedTop.push(prime);
				expectedBottom.push(prime);
			}
		});
		return sameMultiset(selectedTop, expectedTop) && sameMultiset(selectedBottom, expectedBottom);
	}

	function checkTop() {
		touchClimbTimer();
		if (stageComplete || completedSteps.has("top")) return;
		const entered = getInputFactors("topInputs");
		if (sameMultiset(entered, round.topFactors)) {
			markCorrectStep("top");
			byId("bottomStep")?.classList.remove("hidden");
			setFeedback("✅ Top shelf pieces match.", "good");
			focusPanel("bottomStep");
		} else {
			markMistake();
			setFeedback("Not yet. The top pieces must multiply back to the top shelf value.", "bad");
		}
	}

	function checkBottom() {
		touchClimbTimer();
		if (stageComplete || completedSteps.has("bottom")) return;
		const entered = getInputFactors("bottomInputs");
		if (sameMultiset(entered, round.bottomFactors)) {
			markCorrectStep("bottom");
			byId("reduceStep")?.classList.remove("hidden");
			buildPrimeForm(false);
			setFeedback("✅ Bottom shelf pieces match. Now cross out equal prime pieces.", "good");
			focusPanel("reduceStep");
		} else {
			markMistake();
			setFeedback("Not yet. The bottom pieces must multiply back to the bottom shelf value.", "bad");
		}
	}

	function checkMatches() {
		touchClimbTimer();
		if (stageComplete || completedSteps.has("matches")) return;
		if (!crossingIsCorrect()) {
			markMistake();
			setFeedback("Not yet. Only equal top-and-bottom prime pieces may be crossed out.", "bad");
			return;
		}
		matchesChecked = true;
		markCorrectStep("matches");
		document.querySelectorAll("#primeForm .factor-chip").forEach(chip => chip.setAttribute("aria-disabled", "true"));
		byId("finalAnswerBlock")?.classList.remove("hidden");
		setFeedback("✅ Matching pieces are correct. Now write the reduced fraction.", "good");
		focusPanel("finalAnswerBlock");
		byId("ansTop")?.focus();
	}

	function checkAnswer() {
		touchClimbTimer();
		if (stageComplete || finalAnswered) return;
		if (!matchesChecked) {
			setFeedback("Check the matching prime pieces first.", "bad");
			return;
		}
		const topInput = byId("ansTop");
		const bottomInput = byId("ansBottom");
		const a = Number(String(topInput?.value || "").replace(/\D/g, ""));
		const b = Number(String(bottomInput?.value || "").replace(/\D/g, ""));
		if (a === round.reducedTop && b === round.reducedBottom) {
			stageComplete = true;
			showComplete("Your setup, prime pieces, matched pieces, and reduced answer are complete.");
			completeRoundAfterFinalAnswer();
			return;
		}
		markMistake();
		setFeedback("Not yet. Multiply only the prime pieces that are not crossed out. If a shelf has no pieces left, write 1.", "bad");
	}

	function showComplete(crossNote) {
		byId("completeStep")?.classList.remove("hidden");
		const completeFlow = byId("completeFlow");
		if (completeFlow) {
			const op = round.operation === "divide" ? "÷" : "×";
			completeFlow.innerHTML = `
				${fractionHtml(round.first.top, round.first.bottom)}
				<span>${op}</span>
				${fractionHtml(round.shownSecond.top, round.shownSecond.bottom)}
				<span>→</span>
				${setupHtml(round.correctSetup.first, round.correctSetup.second)}
				<span>→</span>
				${fractionHtml(round.reducedTop, round.reducedBottom)}
			`;
		}
		let scoreText = stageEligible
			? "🏁 Turtle reached the score line."
			: "Practice stage completed. This run had a mistake, so it does not earn a score.";
		if (round.reducedBottom === 1) scoreText += ` ${round.reducedTop}/1 can also be written as ${round.reducedTop}.`;
		setText("completeMessage", `${scoreText} ${crossNote}`);
		setFeedback(
			stageEligible && mistakesThisStage === 0 && score >= 9
				? "✅ Factor tree fraction complete. Score 10 is ready for the certificate."
				: "✅ Factor tree fraction complete. Next Climb is unlocked below.",
			"good"
		);
		focusCompleteView();
	}

	function markCorrectStep(stepKey) {
		if (finalAnswered || stageComplete) return false;
		if (stepKey && completedSteps.has(stepKey)) return false;
		if (stepKey) completedSteps.add(stepKey);
		runCorrectCount = Math.min(TOTAL_STEPS - 1, runCorrectCount + 1);
		updateTurtleBoard(mistakesThisStage === 0
			? "Good. Keep the turtle moving."
			: "Keep practicing. This run already has an error, so finish it and use Next Climb for a fresh score chance.");
		return true;
	}

	function markMistake() {
		if (finalAnswered) return;
		shell()?.playSfx?.("wrong");
		stopClimbTimer(true);
		mistakesThisStage++;
		runCorrectCount = 0;
		stageEligible = false;
		shakeScoreBoard();
		let message;
		if (mistakesThisStage > 1 && score > 0) {
			score--;
			message = "Second mistake in the same stage. Turtle loses 1 score, but score cannot go below 0.";
			window.setTimeout(() => popScoreChange("−1", "minus"), 80);
		} else if (mistakesThisStage > 1) {
			message = "Second mistake in the same stage. Score is already 0, so keep practicing.";
		} else {
			message = "Mistake made. Turtle progress cleared. Finish this stage for practice, then use Next Climb for a fresh score chance.";
		}
		updateTurtleBoard(message);
	}

	function completeRoundAfterFinalAnswer() {
		if (finalAnswered) return;
		finalAnswered = true;
		runCorrectCount = TOTAL_STEPS;
		let earnedScore = false;
		let message;
		if (stageEligible && mistakesThisStage === 0) {
			score = Math.min(10, score + 1);
			earnedScore = true;
			message = score >= 10
				? "🎁 Score 10 reached! Certificate unlocked."
				: "🏁 Fraction factor tree complete! +1 score. Next Climb is ready.";
		} else {
			message = "🏁 Fraction factor tree complete. This run had a mistake, so no score point is added. Next Climb is ready.";
		}
		const masteryComplete = score >= 10;
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
			if (!achievementShown) window.setTimeout(showAchievementPopup, 700);
			return;
		}

		shell()?.finishCorrectClimb?.({ message, scroll: false });
		focusCompleteView();
	}

	function updateTurtleBoard(message) {
		const progressPercent = Math.min(100, Math.round((runCorrectCount / TOTAL_STEPS) * 100));
		const defaultMessage = !stageStarted
			? "Press START the Climb when you are ready."
			: mistakesThisStage > 0
				? "Keep practicing. This run already has an error, so finish it and use Next Climb for a fresh score chance."
				: score >= 7
					? "Purple level: flip, factor, and reduce with focus."
					: score >= 4
						? "Blue level: larger shelves, same reduce-early strategy."
						: "Leaf level: flip division, factor pieces, and match equals.";
		if (shell()?.updateShelf) {
			shell().updateShelf({ score, stage, progressPercent, message: message || defaultMessage });
		} else {
			setText("scoreText", `Score: ${score}`);
			setText("stageText", `Stage: ${stage}`);
			const turtleTrack = byId("turtleTrack");
			if (turtleTrack) turtleTrack.style.setProperty("--progress", `${progressPercent}%`);
			setText("challengeMessage", message || defaultMessage);
		}
	}

	function updateDifficultyText() {
		const btn = byId("showMatchBtn");
		if (!btn) return;
		const guided = score < 3;
		btn.disabled = !guided;
		btn.classList.toggle("hidden", !guided);
	}

	function setLocalFeedback(id, text, type) {
		const box = byId(id);
		if (!box) return;
		box.textContent = text;
		box.className = "feedback";
		if (type === "good") box.classList.add("good-text");
		if (type === "bad") box.classList.add("bad-text");
		if (type === "neutral") box.classList.add("neutral-text");
	}

	function setFeedback(text, type) { setLocalFeedback("feedback", text, type); }

	function focusPanel(id) {
		const element = byId(id);
		if (!element) return;
		if (shell()?.scrollToPremiumElement) {
			shell().scrollToPremiumElement(id, 14);
			return;
		}
		window.setTimeout(() => element.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
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

	function focusQuestionView() {
		const element = byId("problemCard") || byId("setupStep");
		if (!element) return;
		if (shell()?.scrollToPremiumElement) { shell().scrollToPremiumElement(element.id, 14); return; }
		element.scrollIntoView({ behavior: "smooth", block: "start" });
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
		if (score >= 10) {
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
		newRound({ message: `Stage ${stage}: choose setup, factor, match, and reduce.` });
		shell()?.startNextClimbTimer?.();
		progressThemeTimer = window.setTimeout(() => shell()?.applyProgressThemeByScore?.(score, true), 300);
		focusQuestionView();
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
		document.addEventListener("keydown", event => {
			if (event.key === "Enter") {
				if (event.target.closest("#topInputs")) checkTop();
				if (event.target.closest("#bottomInputs")) checkBottom();
				if (event.target.id === "ansTop" || event.target.id === "ansBottom") checkAnswer();
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
		window.addEventListener("resize", () => resizeOperationLine(byId("problemDisplay")));
	}

	function initPlay7() {
		attachEvents();
		resetRaceTimer();
		newRound({ message: "Press START the Climb when you are ready." });
		showClimbGate();
		hideNextClimb();
		window.setTimeout(openSavedCertificateFromCabin, 350);
	}

	window.MathRidgeLocal = {
		getScore: () => score,
		getStage: () => stage,
		getRequiredProgressSteps: () => TOTAL_STEPS
	};

	window.startClimbFromGate = startClimbFromGate;
	window.confirmSetupChoice = confirmSetupChoice;
	window.checkTop = checkTop;
	window.checkBottom = checkBottom;
	window.checkMatches = checkMatches;
	window.showMatchingPieces = showMatchingPieces;
	window.checkAnswer = checkAnswer;
	window.nextClimb = nextClimb;
	initPlay7();
})();
