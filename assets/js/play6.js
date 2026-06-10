/* Math Ridge Play 1-6 local game: Prime Factor Trees.
   The global shell owns timer, top shelf, ladder, background, and Next Climb visibility. */
(function () {
	"use strict";

	const PLAY_ID = "2_2";
	const PLAY_SECTION = "2-2";
	const PLAY_TITLE = "Prime Factorization Fluency";
	const PLAY_COMPLETE_KEY = "mathRidge_playComplete_2_2";
	const PLAY_CERT_KEY = "mathRidge_cert_2_2";
	const NEXT_NOTE_UNLOCK_KEY = "mathRidge_noteUnlocked_2_3";
	const NEXT_STAGE_UNLOCK_KEY = "mathRidge_stageUnlocked_2_3";
	const CERT_SIGNATURE = "Presented by Math Ridge Creator: Kuan-Yuan Huang";
	const TOTAL_STEPS = 4;
	const PRIMES = [2, 3, 5, 7];

	const usedProblemDecks = {};
	const problemDecks = {};

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
	let shelfScaleRelicActive = false;
	let achievementShown = false;
	let progressThemeTimer = null;
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

	function fallbackFormatRaceTime(ms) {
		const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	}

	function formatRaceTime(ms) {
		return shell()?.formatRaceTime ? shell().formatRaceTime(ms) : fallbackFormatRaceTime(ms);
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
		if (!pageHasStartedClimb || !stageStarted || stageComplete || score >= 10) return;
		shell()?.startClimbTimer?.({ hideNext: false });
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

	function randInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function randomItem(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	function shuffle(arr) {
		const copy = [...arr];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function product(arr) {
		return arr.reduce((a, b) => a * b, 1);
	}

	function gcd(a, b) {
		while (b) [a, b] = [b, a % b];
		return Math.abs(a);
	}

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

	function sharedCount(a, b) {
		const A = countMap(a);
		const B = countMap(b);
		return PRIMES.reduce((sum, p) => sum + Math.min(A[p] || 0, B[p] || 0), 0);
	}

	function getDifficultyRule() {
		// All generated numbers are built from 2, 3, 5, and 7.
		if (score < 3) return { min: 4, max: 49, minShared: 1, maxShared: 2 };
		if (score < 6) return { min: 25, max: 98, minShared: 2, maxShared: 3 };
		return { min: 49, max: 245, minShared: 3, maxShared: 5 };
	}

	function buildValueFromFactors(factors) {
		return factors.reduce((total, factor) => total * factor, 1);
	}

	function difficultyKey(rule) {
		return `${rule.min}-${rule.max}-${rule.minShared}-${rule.maxShared}`;
	}

	function canonicalFactors(factors) {
		return [...factors].sort((a, b) => a - b).join("x");
	}

	function problemKeyFromFactors(topFactors, bottomFactors) {
		return `${canonicalFactors(topFactors)}/${canonicalFactors(bottomFactors)}`;
	}

	function makeFactorMultisetsForRule(rule) {
		const results = [];

		function walk(startIndex, current, value) {
			if (value >= rule.max) return;
			if (value >= rule.min) results.push([...current]);

			for (let i = startIndex; i < PRIMES.length; i++) {
				const nextValue = value * PRIMES[i];
				if (nextValue >= rule.max) continue;
				current.push(PRIMES[i]);
				walk(i, current, nextValue);
				current.pop();
			}
		}

		walk(0, [], 1);
		return results;
	}

	function buildProblemDeck(rule) {
		const allFactorSets = makeFactorMultisetsForRule(rule);
		const deck = [];
		const seen = new Set();

		for (const topFactors of allFactorSets) {
			for (const bottomFactors of allFactorSets) {
				const topValue = buildValueFromFactors(topFactors);
				const bottomValue = buildValueFromFactors(bottomFactors);
				if (topValue === bottomValue) continue;

				const actualShared = sharedCount(topFactors, bottomFactors);
				const smallerSide = Math.min(topFactors.length, bottomFactors.length);
				if (actualShared < rule.minShared) continue;
				if (actualShared > rule.maxShared) continue;
				if (actualShared >= smallerSide) continue;

				const key = problemKeyFromFactors(topFactors, bottomFactors);
				if (seen.has(key)) continue;
				seen.add(key);

				deck.push({ key, topFactors: [...topFactors], bottomFactors: [...bottomFactors] });
			}
		}

		return shuffle(deck);
	}

	function makeFactors() {
		const rule = getDifficultyRule();
		const key = difficultyKey(rule);

		if (!problemDecks[key]) {
			problemDecks[key] = buildProblemDeck(rule);
			usedProblemDecks[key] = new Set();
		}

		const deck = problemDecks[key];
		if (usedProblemDecks[key].size >= deck.length) usedProblemDecks[key].clear();

		let available = deck.filter(problem => !usedProblemDecks[key].has(problem.key));
		if (!available.length) {
			available = [{ key: "2x2x3/2x2x5", topFactors: [2, 2, 3], bottomFactors: [2, 2, 5] }];
		}

		const chosen = randomItem(available);
		usedProblemDecks[key].add(chosen.key);

		return {
			topFactors: shuffle(chosen.topFactors),
			bottomFactors: shuffle(chosen.bottomFactors)
		};
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
				if (event.key === "Backspace" && !input.value && input.previousElementSibling) {
					input.previousElementSibling.focus();
				}
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
		return [...document.querySelectorAll(`#${id} input`)]
			.map(input => Number(input.value))
			.filter(Boolean);
	}

	function resetStepVisuals() {
		["topStep", "bottomStep", "reduceStep", "finalStep", "completeStep"].forEach((id, index) => {
			const panel = byId(id);
			if (!panel) return;
			panel.classList.toggle("hidden", index !== 0);
		});

		["ansTop", "ansBottom"].forEach(id => {
			const input = byId(id);
			if (!input) return;
			input.value = "";
			input.style.borderColor = "#b9dcff";
		});

		const primeForm = byId("primeForm");
		if (primeForm) primeForm.innerHTML = "";
		const leftoverPreview = byId("leftoverPreview");
		if (leftoverPreview) {
			leftoverPreview.innerHTML = "";
			leftoverPreview.classList.add("hidden");
		}
		const assist = byId("shelfScaleAssist");
		if (assist) assist.classList.remove("is-active", "relic-safe-step");
		byId("reduceStep")?.classList.remove("relic-safe-step");
		const relicButton = assist?.querySelector("button");
		if (relicButton) {
			relicButton.disabled = false;
			relicButton.removeAttribute("aria-disabled");
		}
		const checkMatchesBtn = byId("checkMatchesBtn");
		if (checkMatchesBtn) {
			checkMatchesBtn.disabled = false;
			checkMatchesBtn.removeAttribute("aria-disabled");
			checkMatchesBtn.classList.remove("is-play-armed");
		}
		const completeFlow = byId("completeFlow");
		if (completeFlow) completeFlow.innerHTML = "";
		setText("completeMessage", "");
		setFeedback("", "");
	}

	function newRound(options = {}) {
		const made = makeFactors();
		const numerator = product(made.topFactors);
		const denominator = product(made.bottomFactors);
		const g = gcd(numerator, denominator);

		round = {
			topFactors: made.topFactors,
			bottomFactors: made.bottomFactors,
			numerator,
			denominator,
			reducedTop: numerator / g,
			reducedBottom: denominator / g
		};

		runCorrectCount = 0;
		mistakesThisStage = 0;
		stageEligible = true;
		stageComplete = false;
		finalAnswered = false;
		matchesChecked = false;
		shelfScaleRelicActive = false;
		completedSteps = new Set();

		setText("numDisplay", numerator);
		setText("denDisplay", denominator);
		setText("topFocusValue", numerator);
		setText("bottomFocusValue", denominator);

		buildInputs("topInputs", round.topFactors.length);
		buildInputs("bottomInputs", round.bottomFactors.length);
		resetStepVisuals();
		prepareAnswerInputs();
		updateDifficultyText();
		hideNextClimb();
		updateTurtleBoard(options.message || (stageStarted ? `Stage ${stage}: type prime pieces, match them, and reduce.` : "Press START the Climb when you are ready."));
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

	function useShelfScaleRelic() {
		touchClimbTimer();
		if (stageComplete || matchesChecked) return;
		shelfScaleRelicActive = true;
		buildPrimeForm(true);
		byId("shelfScaleAssist")?.classList.add("is-active", "relic-safe-step");
		const relicButton = byId("shelfScaleAssist")?.querySelector("button");
		if (relicButton) {
			relicButton.disabled = true;
			relicButton.setAttribute("aria-disabled", "true");
		}
		byId("reduceStep")?.classList.add("relic-safe-step");
		renderLeftoverPieces();
		shell()?.playSfx?.("relic");
		setFeedback("Shelf Scale used: matching pieces are crossed out and the leftover pieces are shown. Check the matching pieces to continue.", "neutral");
	}

	function showMatchingPieces() {
		useShelfScaleRelic();
	}

	function selectedCrossedFactors() {
		const top = [];
		const bottom = [];
		document.querySelectorAll("#primeForm .factor-chip.crossed").forEach(chip => {
			const value = Number(chip.dataset.value || chip.textContent.replace(/[()]/g, ""));
			if (!value) return;
			if (chip.dataset.side === "top") top.push(value);
			else if (chip.dataset.side === "bottom") bottom.push(value);
		});
		return { top, bottom };
	}

	function expectedCrossedFactors() {
		const top = [];
		const bottom = [];
		PRIMES.forEach(prime => {
			const topCount = round.topFactors.filter(value => value === prime).length;
			const bottomCount = round.bottomFactors.filter(value => value === prime).length;
			const matchCount = Math.min(topCount, bottomCount);
			for (let i = 0; i < matchCount; i++) {
				top.push(prime);
				bottom.push(prime);
			}
		});
		return { top, bottom };
	}

	function leftoverFactors() {
		const expected = expectedCrossedFactors();
		const topCounts = countMap(round.topFactors);
		const bottomCounts = countMap(round.bottomFactors);
		expected.top.forEach(value => topCounts[value] = Math.max(0, (topCounts[value] || 0) - 1));
		expected.bottom.forEach(value => bottomCounts[value] = Math.max(0, (bottomCounts[value] || 0) - 1));
		const top = [];
		const bottom = [];
		PRIMES.forEach(prime => {
			for (let i = 0; i < (topCounts[prime] || 0); i++) top.push(prime);
			for (let i = 0; i < (bottomCounts[prime] || 0); i++) bottom.push(prime);
		});
		return { top, bottom };
	}

	function piecesText(pieces) {
		return pieces.length ? pieces.join(" x ") : "1";
	}

	function renderLeftoverPieces() {
		const preview = byId("leftoverPreview");
		if (!preview) return;
		const leftovers = leftoverFactors();
		preview.innerHTML = `
			<strong>Leftover pieces</strong>
			<span>Top: ${piecesText(leftovers.top)}</span>
			<span>Bottom: ${piecesText(leftovers.bottom)}</span>
		`;
		preview.classList.remove("hidden");
	}

	function crossingIsCorrect() {
		const selected = selectedCrossedFactors();
		const expected = expectedCrossedFactors();
		return sameMultiset(selected.top, expected.top) && sameMultiset(selected.bottom, expected.bottom);
	}

	function checkTop() {
		touchClimbTimer();
		if (stageComplete || completedSteps.has("top")) return;
		const entered = getInputFactors("topInputs");

		if (sameMultiset(entered, round.topFactors)) {
			markCorrectStep("top");
			byId("bottomStep")?.classList.remove("hidden");
			setFeedback("✅ Numerator pieces match.", "good");
			focusPanel("bottomStep");
		} else {
			markMistake();
			setFeedback("Not yet. The numerator pieces must multiply back to the top shelf.", "bad");
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
			setFeedback("✅ Denominator pieces match. Now cross out matching pieces.", "good");
			focusPanel("reduceStep");
		} else {
			markMistake();
			setFeedback("Not yet. The denominator pieces must multiply back to the bottom shelf.", "bad");
		}
	}

	function checkMatchingPieces() {
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
		renderLeftoverPieces();
		byId("finalStep")?.classList.remove("hidden");
		setFeedback("✅ Matching pieces are correct. Now write the reduced fraction from the leftover pieces.", "good");
		focusPanel("finalStep");
		byId("ansTop")?.focus();
	}

	function checkAnswer() {
		touchClimbTimer();
		if (stageComplete || finalAnswered) return;
		if (!matchesChecked) {
			setFeedback("Check the matching pieces first.", "bad");
			return;
		}

		const topInput = byId("ansTop");
		const bottomInput = byId("ansBottom");
		const a = Number(String(topInput?.value || "").replace(/\D/g, ""));
		const b = Number(String(bottomInput?.value || "").replace(/\D/g, ""));

		if (a === round.reducedTop && b === round.reducedBottom) {
			stageComplete = true;
			const crossNote = shelfScaleRelicActive
				? "The Shelf Scale showed the leftover pieces, and your reduced fraction matches them."
				: "Your cross-out marks match the reduction.";
			showComplete(crossNote);
			completeRoundAfterFinalAnswer();
			return;
		}

		markMistake();
		setFeedback("Not yet. Multiply the leftover pieces. If a shelf has no pieces left, write 1.", "bad");
	}

	function showComplete(crossNote) {
		["topStep", "bottomStep", "reduceStep", "finalStep"].forEach(id => byId(id)?.classList.add("hidden"));
		byId("completeStep")?.classList.remove("hidden");

		const completeFlow = byId("completeFlow");
		if (completeFlow) {
			completeFlow.innerHTML = `
				<span class="fraction">
					<span class="top">${round.numerator}</span>
					<span class="bottom">${round.denominator}</span>
				</span>
				<span>→</span>
				<span class="fraction">
					<span class="top">${round.reducedTop}</span>
					<span class="bottom">${round.reducedBottom}</span>
				</span>
			`;
		}

		let scoreText = stageEligible
			? "🏁 Turtle reached the score line."
			: "Practice stage completed. This run had a mistake, so it does not earn a score.";

		if (round.reducedBottom === 1) {
			scoreText += ` ${round.reducedTop}/1 can also be written as ${round.reducedTop}.`;
		}

		setText("completeMessage", `${scoreText} ${crossNote}`);
		setFeedback(
			stageEligible && mistakesThisStage === 0 && score >= 9
				? "✅ Stage complete. Score 10 is ready for the certificate."
				: "✅ Stage complete. Next Climb is unlocked. Your active time is saved toward the certificate.",
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
				: "🏁 Prime factor tree complete! +1 score. Next Climb is ready.";
		} else {
			message = "🏁 Prime factor tree complete. This run had a mistake, so no score point is added. Next Climb is ready.";
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
			if (!achievementShown) {
				window.setTimeout(showAchievementPopup, 700);
			}
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
					? "Purple level: factor carefully and reduce with focus."
					: score >= 4
						? "Blue level: larger numbers, same prime-piece strategy."
						: "Leaf level: type the prime pieces, then match equals.";

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

	function setFeedback(text, type) {
		const box = byId("feedback");
		if (!box) return;
		box.textContent = text;
		box.className = "feedback";
		if (type === "good") box.classList.add("good-text");
		if (type === "bad") box.classList.add("bad-text");
		if (type === "neutral") box.classList.add("neutral-text");
	}

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
		const element = byId("problemCard") || byId("topStep");
		if (!element) return;
		if (shell()?.scrollToPremiumElement) {
			shell().scrollToPremiumElement(element.id, 14);
			return;
		}
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
		newRound({ message: `Stage ${stage}: type prime pieces, match them, and reduce.` });
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
	}

	function initPlay6() {
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
	window.useShelfScaleRelic = useShelfScaleRelic;
	window.checkMatchingPieces = checkMatchingPieces;
	window.showMatchingPieces = showMatchingPieces;
	window.checkAnswer = checkAnswer;
	window.nextClimb = nextClimb;
	initPlay6();
})();
