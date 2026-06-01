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
	let achievementShown = false;
	let confettiTimer = null;
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

	function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
	function randomItem(list) { return list[Math.floor(Math.random() * list.length)]; }

	function shuffle(arr) {
		const copy = [...arr];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function product(arr) { return arr.reduce((a, b) => a * b, 1); }
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

	function getDifficultyRule() {
		if (score < 3) return { sharedMin: 1, sharedMax: 2, extraMin: 1, extraMax: 2 };
		if (score < 6) return { sharedMin: 2, sharedMax: 3, extraMin: 1, extraMax: 2 };
		return { sharedMin: 2, sharedMax: 4, extraMin: 2, extraMax: 3 };
	}

	function makeRandomFactors(count) {
		const list = [];
		for (let i = 0; i < count; i++) list.push(randomItem(PRIMES));
		return list;
	}

	function makeFinalFactors() {
		const rule = getDifficultyRule();
		const sharedCount = randInt(rule.sharedMin, rule.sharedMax);
		const shared = makeRandomFactors(sharedCount);
		const topExtra = makeRandomFactors(randInt(rule.extraMin, rule.extraMax));
		const bottomExtra = makeRandomFactors(randInt(rule.extraMin, rule.extraMax));
		return {
			topFactors: shuffle([...shared, ...topExtra]),
			bottomFactors: shuffle([...shared, ...bottomExtra])
		};
	}

	function splitFactors(factors) {
		const copy = shuffle(factors);
		if (copy.length <= 1) return [[copy[0] || 1], [1]];
		const cut = randInt(1, copy.length - 1);
		return [copy.slice(0, cut), copy.slice(cut)];
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

	function makeProblem() {
		let attempt = 0;
		while (attempt < 400) {
			attempt++;
			const made = makeFinalFactors();
			const [topA, topB] = splitFactors(made.topFactors);
			const [bottomA, bottomB] = splitFactors(made.bottomFactors);
			const first = { top: product(topA), bottom: product(bottomA) };
			const afterSecond = { top: product(topB), bottom: product(bottomB) };
			const operation = Math.random() < 0.5 ? "multiply" : "divide";
			const shownSecond = operation === "divide"
				? { top: afterSecond.bottom, bottom: afterSecond.top }
				: { ...afterSecond };
			const numerator = product(made.topFactors);
			const denominator = product(made.bottomFactors);
			if (numerator === denominator) continue;
			const g = gcd(numerator, denominator);
			const reducedTop = numerator / g;
			const reducedBottom = denominator / g;
			if (reducedTop === 1 && reducedBottom === 1) continue;

			const key = `${operation}|${first.top}/${first.bottom}|${shownSecond.top}/${shownSecond.bottom}|${numerator}/${denominator}`;
			if (usedProblemKeys.has(key) && usedProblemKeys.size < 80) continue;
			if (usedProblemKeys.size >= 80) usedProblemKeys.clear();
			usedProblemKeys.add(key);

			return {
				operation,
				first,
				shownSecond,
				afterSecond,
				correctSetup: { first, second: afterSecond, key: setupKey(first, afterSecond) },
				topFactors: made.topFactors,
				bottomFactors: made.bottomFactors,
				numerator,
				denominator,
				reducedTop,
				reducedBottom
			};
		}

		return {
			operation: "divide",
			first: { top: 2, bottom: 5 },
			shownSecond: { top: 6, bottom: 25 },
			afterSecond: { top: 25, bottom: 6 },
			correctSetup: { first: { top: 2, bottom: 5 }, second: { top: 25, bottom: 6 }, key: "2/5x25/6" },
			topFactors: [2, 5, 5],
			bottomFactors: [5, 2, 3],
			numerator: 50,
			denominator: 30,
			reducedTop: 5,
			reducedBottom: 3
		};
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
			button.onclick = () => checkSetupChoice(button, choice);
			grid.appendChild(button);
			resizeOperationLine(button);
		});
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

		setText("topFocusValue", round.numerator);
		setText("bottomFocusValue", round.denominator);
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
			markMistake();
			setLocalFeedback("setupFeedback", round.operation === "divide" ? "Not yet. Only the fraction after ÷ flips." : "Not yet. Multiplication keeps both fractions in place.", "bad");
			return;
		}
		button.classList.add("correct");
		document.querySelectorAll("#setupChoices .choice-card").forEach(card => card.disabled = true);
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
			chip.textContent = `(${n})`;
			if (crossMap.topCross[i]) chip.classList.add("crossed");
			chip.onclick = () => { touchClimbTimer(); if (!matchesChecked) chip.classList.toggle("crossed"); };
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
			chip.textContent = `(${n})`;
			if (crossMap.bottomCross[i]) chip.classList.add("crossed");
			chip.onclick = () => { touchClimbTimer(); if (!matchesChecked) chip.classList.toggle("crossed"); };
			wrap.appendChild(chip);
		});
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
		const correct = getCrossMap();
		let ok = true;
		document.querySelectorAll("#primeForm .factor-chip").forEach(chip => {
			const side = chip.dataset.side;
			const index = Number(chip.dataset.index);
			const crossed = chip.classList.contains("crossed");
			const shouldCross = side === "top" ? correct.topCross[index] : correct.bottomCross[index];
			if (crossed !== shouldCross) ok = false;
		});
		return ok;
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
		setFeedback("✅ Factor tree fraction complete. Next Climb is unlocked below.", "good");
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
		if (score >= 10) completePlayProgress();
		updateTurtleBoard(message);
		shell()?.finishCorrectClimb?.({ message, scroll: false });
		focusCompleteView();
		if (earnedScore) {
			window.setTimeout(() => {
				animateTurtleFinish();
				popScoreChange("+1", "plus");
			}, 120);
		}
		if (score >= 10 && !achievementShown) window.setTimeout(showAchievementPopup, 700);
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
		if (confettiTimer) { window.clearInterval(confettiTimer); confettiTimer = null; }
		const layer = byId("confettiLayer");
		if (layer) layer.innerHTML = "";
	}

	function showAchievementPopup() {
		if (achievementShown) return;
		achievementShown = true;
		completePlayProgress();
		stopClimbTimer(true);
		startConfetti();
		const input = byId("playerNameInput");
		if (input) input.value = "";
		const popup = byId("namePopup");
		if (popup) popup.style.display = "flex";
		document.body.classList.add("modal-open");
		window.setTimeout(() => input?.focus(), 200);
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

		try {
			localStorage.setItem(PLAY_CERT_KEY, JSON.stringify({
				completed: true,
				id: PLAY_ID,
				section: PLAY_SECTION,
				title: PLAY_TITLE,
				studentName: studentName || "Math Ridge Champion",
				completedAt: new Date().toISOString(),
				displayDate: formattedDate,
				displayTime: formattedTime,
				raceTime: raceTimeText,
				rankText: rankMessage || "",
				stage
			}));
		} catch (error) {}
	}

	async function createCertificateFromName() {
		const nameInput = byId("playerNameInput");
		const finalName = safeText(nameInput?.value || "") || "Math Ridge Champion";
		const now = new Date();
		const button = document.querySelector("#namePopup button");
		if (button) { button.disabled = true; button.textContent = "Saving world record..."; }

		const formattedDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
		const formattedTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

		let rankMessage = "";
		let raceTimeText = formatRaceTime(getRaceMs());
		try {
			const result = await shell()?.submitWorldRecord?.(finalName, getRaceMs());
			if (result) {
				latestRaceRank = result.rank || null;
				latestSavedRaceSeconds = result.record?.timeSeconds || null;
				rankMessage = result.topThree ? rankText(result.rank) : "";
				raceTimeText = result.record?.timeDisplay || (result.record?.timeSeconds ? formatRaceTime(result.record.timeSeconds * 1000) : raceTimeText);
			}
		} catch (error) {
			rankMessage = "World record could not save. Certificate still created.";
		}

		setText("certName", finalName);
		setText("certStage", "Academic Focus: Fraction Product Structure");
		setText("certRaceTime", "");
		setText("certRank", "");
		setText("certDate", `Completed on ${formattedDate}`);

		savePlayCertificateProgress({ studentName: finalName, formattedDate, formattedTime, raceTimeText, rankMessage });

		if (button) { button.disabled = false; button.textContent = "Create My Certificate"; }
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
			try { sessionStorage.setItem("mathRidge_open_section", "cabin"); } catch (error) {}
			window.location.href = "index.html";
		}
	}

	function drawParchmentTexture(ctx, width, height) {
		ctx.save();
		ctx.globalAlpha = 0.14;
		for (let i = 0; i < 240; i++) {
			ctx.fillStyle = Math.random() > 0.5 ? "#d8b76f" : "#fff8db";
			ctx.beginPath();
			ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.6 + 0.4, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	}

	function saveCertificateImage() {
		const name = byId("certName")?.textContent || "Math Ridge Champion";
		const completedDate = byId("certDate")?.textContent || "";
		const stageText = byId("certStage")?.textContent || "Academic Focus: Fraction Product Structure";
		const canvas = document.createElement("canvas");
		canvas.width = 1500;
		canvas.height = 1080;
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
		ctx.strokeRect(72, 72, canvas.width - 144, canvas.height - 144);
		ctx.strokeStyle = "rgba(122, 75, 0, 0.55)";
		ctx.lineWidth = 3;
		ctx.strokeRect(98, 98, canvas.width - 196, canvas.height - 196);

		ctx.textAlign = "center";
		ctx.fillStyle = "#7a4b00";
		ctx.font = "bold 76px Georgia";
		ctx.fillText("Math Ridge", 750, 175);
		ctx.fillStyle = "#24304f";
		ctx.font = "bold 56px Georgia";
		ctx.fillText("Certificate of Achievement", 750, 280);
		ctx.fillStyle = "#b87900";
		ctx.font = "bold 38px Georgia";
		ctx.fillText("Fraction Product Structure", 750, 352);
		ctx.fillStyle = "#24304f";
		ctx.font = "30px Georgia";
		ctx.fillText("Presented to", 750, 432);
		ctx.fillStyle = "#0f5a9a";
		ctx.font = "bold 64px Georgia";
		ctx.fillText(name, 750, 515);
		ctx.strokeStyle = "#d4a73c";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(390, 540);
		ctx.lineTo(1110, 540);
		ctx.stroke();
		ctx.fillStyle = "#24304f";
		ctx.font = "30px Georgia";
		ctx.fillText("for demonstrating fraction product structure,", 750, 620);
		ctx.fillText("reciprocal division, and careful reduction.", 750, 660);
		ctx.font = "bold 30px Georgia";
		ctx.fillText(stageText, 750, 720);
		ctx.fillStyle = "#24304f";
		ctx.font = "28px Georgia";
		ctx.fillText(completedDate, 750, 780);
		ctx.fillStyle = "#7a4b00";
		ctx.font = "italic 30px Georgia";
		ctx.fillText(CERT_SIGNATURE, 750, 925);

		const link = document.createElement("a");
		link.download = "math-ridge-play-2-3-certificate.webp";
		link.href = canvas.toDataURL("image/webp", 0.92);
		link.click();
	}

	function openSavedCertificateFromCabin() {
		const params = new URLSearchParams(window.location.search);
		if (params.get("certificate") !== PLAY_ID || params.get("mode") !== "redownload") return;
		let certData = {};
		try { certData = JSON.parse(localStorage.getItem(PLAY_CERT_KEY) || "{}"); } catch (error) {}
		if (!certData.completed) return;
		setText("certName", certData.studentName || "Math Ridge Champion");
		setText("certStage", "Academic Focus: Fraction Product Structure");
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
	window.checkTop = checkTop;
	window.checkBottom = checkBottom;
	window.checkMatches = checkMatches;
	window.showMatchingPieces = showMatchingPieces;
	window.checkAnswer = checkAnswer;
	window.nextClimb = nextClimb;
	window.createCertificateFromName = createCertificateFromName;
	window.closeCertificatePopup = closeCertificatePopup;
	window.saveCertificateImage = saveCertificateImage;

	initPlay7();
})();
