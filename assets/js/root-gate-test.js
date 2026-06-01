(function () {
  "use strict";

  const TIME_LIMIT_SECONDS = 10 * 60;
  const TOTAL_QUESTIONS = 40;
  const PASSING_CORRECT = 37;
  const ROOT_GATE_UNLOCK_KEY = "mathRidge_rootGateUnlocked_chapter_1";
  const ROOT_GATE_PASS_KEY = "mathRidge_rootGatePassed_chapter_1";
  const CHAPTER_PASS_KEY = "mathRidge_testPassed_chapter_1";
  const CHAPTER_RESULT_KEY = "mathRidge_testResult_chapter_1";
  const CHAPTER_RESULT_DATA_KEY = "mathRidge_testResult_chapter_1_data";
  const CHAPTER_ATTEMPTS_KEY = "mathRidge_testAttempts_chapter_1";
  const CHAPTER_ATTEMPT_HISTORY_KEY = "mathRidge_testAttemptHistory_chapter_1";
  const CHAPTER_TWO_NOTE_KEY = "mathRidge_noteUnlocked_2_1";
  const CHAPTER_TWO_STAGE_KEY = "mathRidge_stageUnlocked_2_1";

  const sections = [
    { id: "1_1", label: "1-1", name: "Term Stone", concept: "Signed terms" },
    { id: "1_2", label: "1-2", name: "Sign Compass", concept: "Term teams" },
    { id: "1_3", label: "1-3", name: "Parity Prism", concept: "Sign stacks" },
    { id: "1_4", label: "1-4", name: "Factor Forge", concept: "Repeated groups" }
  ];
  const questionPlan = [
    ["easy", 3],
    ["medium", 3],
    ["hard", 4]
  ];

  let questions = [];
  let startedAt = 0;
  let timerId = 0;
  let finished = false;
  let correctionMode = false;
  let correctionTimers = new WeakMap();

  const startPanel = document.getElementById("startPanel");
  const startExamButton = document.getElementById("startExamButton");
  const examForm = document.getElementById("examForm");
  const questionGrid = document.getElementById("questionGrid");
  const timerText = document.getElementById("timerText");
  const timerCard = document.querySelector(".timer-card");
  const answeredCount = document.getElementById("answeredCount");
  const examMessage = document.getElementById("examMessage");
  const resultLayer = document.getElementById("resultLayer");
  const resultCard = document.getElementById("resultCard");
  const resultTitle = document.getElementById("resultTitle");
  const resultSummary = document.getElementById("resultSummary");
  const resultStats = document.getElementById("resultStats");
  const scoreRing = document.getElementById("scoreRing");
  const reviewButton = document.getElementById("reviewButton");
  const retryButton = document.getElementById("retryButton");
  const resultStoryLink = document.getElementById("resultStoryLink");
  const correctionCompletePanel = document.getElementById("correctionCompletePanel");
  const correctionRetryButton = document.getElementById("correctionRetryButton");
  const submitButton = examForm?.querySelector(".submit-button");

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (error) { return null; }
  }

  function positiveInteger(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
  }

  function hasCertificate(id) {
    const cert = readJSON(`mathRidge_cert_${id}`);
    return Boolean(cert && cert.completed);
  }

  function hasCompletedPlay(id) {
    try { return localStorage.getItem(`mathRidge_playComplete_${id}`) === "true"; }
    catch (error) { return false; }
  }

  function hasAllChapterOneRelics() {
    return ["1_1", "1_2", "1_3", "1_4"].every(id => hasCertificate(id) || hasCompletedPlay(id));
  }

  function isGateReady() {
    try {
      const localPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname) &&
        new URLSearchParams(window.location.search).get("preview") === "unlock";
      if (localPreview) return true;

      return localStorage.getItem(ROOT_GATE_UNLOCK_KEY) === "true" ||
        localStorage.getItem(ROOT_GATE_PASS_KEY) === "true" ||
        hasAllChapterOneRelics();
    } catch (error) {
      return false;
    }
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomChoice(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }

  function signedTerm(value, first = false) {
    const size = Math.abs(value);
    if (first) return value < 0 ? `-${size}` : `${size}`;
    return value < 0 ? ` - ${size}` : ` + ${size}`;
  }

  function signedExpression(values) {
    return values.map((value, index) => signedTerm(value, index === 0)).join("");
  }

  function hasOppositeSizePair(values) {
    const positiveSizes = new Set();
    const negativeSizes = new Set();

    return values.some(value => {
      const size = Math.abs(value);
      if (value > 0) {
        if (negativeSizes.has(size)) return true;
        positiveSizes.add(size);
      }
      if (value < 0) {
        if (positiveSizes.has(size)) return true;
        negativeSizes.add(size);
      }
      return false;
    });
  }

  function nonZeroValues(factory) {
    let problem = factory();
    let guard = 0;
    while ((!problem || problem.answer === 0 || problem.hasOppositeSizePair) && guard < 50) {
      problem = factory();
      guard += 1;
    }
    return problem;
  }

  function makeQuestion(stage, difficulty, expression, answer) {
    return {
      id: `${stage.id}-${difficulty}-${Math.random().toString(36).slice(2, 8)}`,
      stage: stage.id,
      stageLabel: stage.label,
      relicName: stage.name,
      concept: stage.concept,
      difficulty,
      expression,
      answer,
      negative: answer < 0,
      size: Math.abs(answer)
    };
  }

  function generateStage11(stage, difficulty) {
    return nonZeroValues(() => {
      const easy = difficulty === "easy";
      const hard = difficulty === "hard";
      const count = hard ? 3 : 2;
      const max = easy ? 9 : hard ? 18 : 14;
      const values = [];

      for (let i = 0; i < count; i += 1) {
        const size = randomInt(easy ? 2 : 4, max);
        values.push(randomChoice([-1, 1]) * size);
      }

      if (easy && values[0] * values[1] < 0 && Math.random() < 0.5) {
        values[1] *= -1;
      }

      const answer = sum(values);
      return {
        ...makeQuestion(stage, difficulty, signedExpression(values), answer),
        hasOppositeSizePair: hasOppositeSizePair(values)
      };
    });
  }

  function generateStage12(stage, difficulty) {
    return nonZeroValues(() => {
      const count = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 7;
      const max = difficulty === "easy" ? 9 : difficulty === "medium" ? 14 : 18;
      const values = [];

      for (let i = 0; i < count; i += 1) {
        const size = randomInt(2, max);
        values.push(randomChoice([-1, 1]) * size);
      }

      const positiveTotal = values.filter(value => value > 0).reduce((total, value) => total + value, 0);
      const negativeTotal = Math.abs(values.filter(value => value < 0).reduce((total, value) => total + value, 0));
      if (positiveTotal === negativeTotal) values[0] += 1;

      const answer = sum(values);
      return {
        ...makeQuestion(stage, difficulty, signedExpression(values), answer),
        hasOppositeSizePair: hasOppositeSizePair(values)
      };
    });
  }

  function signStack(size, negativeCount) {
    return `${"-".repeat(negativeCount)}${size}`;
  }

  function signedStackValue(size, negativeCount) {
    return negativeCount % 2 === 0 ? size : -size;
  }

  function generateStage13(stage, difficulty) {
    return nonZeroValues(() => {
      const count = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
      const maxNegatives = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
      const pieces = [];
      const values = [];

      for (let i = 0; i < count; i += 1) {
        const size = randomInt(2, difficulty === "hard" ? 14 : 10);
        const negatives = randomInt(1, maxNegatives);
        pieces.push(signStack(size, negatives));
        values.push(signedStackValue(size, negatives));
      }

      const expression = pieces.join(" + ");
      const answer = sum(values);
      return {
        ...makeQuestion(stage, difficulty, expression, answer),
        hasOppositeSizePair: hasOppositeSizePair(values)
      };
    });
  }

  function generateStage14(stage, difficulty) {
    const value = randomInt(2, difficulty === "hard" ? 9 : 7);

    if (difficulty === "easy") {
      const copies = randomInt(2, 9);
      return makeQuestion(stage, difficulty, `${copies}(${value})`, copies * value);
    }

    if (difficulty === "medium") {
      const a = randomInt(3, 7);
      const b = randomInt(2, 6);
      return makeQuestion(stage, difficulty, `${a}(${value}) + ${b}(${value})`, (a + b) * value);
    }

    const a = randomInt(5, 9);
    const b = randomInt(2, 6);
    const c = randomInt(2, 5);
    return makeQuestion(stage, difficulty, `${a}(${value}) + ${b}(${value}) + ${c}(${value})`, (a + b + c) * value);
  }

  function generateForStage(stage, difficulty) {
    if (stage.id === "1_1") return generateStage11(stage, difficulty);
    if (stage.id === "1_2") return generateStage12(stage, difficulty);
    if (stage.id === "1_3") return generateStage13(stage, difficulty);
    return generateStage14(stage, difficulty);
  }

  function buildExamQuestions() {
    const generated = [];
    sections.forEach(stage => {
      questionPlan.forEach(([difficulty, count]) => {
        const seen = new Set();
        for (let i = 0; i < count; i += 1) {
          let problem = generateForStage(stage, difficulty);
          let guard = 0;
          while (seen.has(problem.expression) && guard < 20) {
            problem = generateForStage(stage, difficulty);
            guard += 1;
          }
          seen.add(problem.expression);
          generated.push(problem);
        }
      });
    });
    return shuffle(generated);
  }

  function renderQuestion(question, index) {
    return `
      <article class="question-card" data-index="${index}">
        <div class="question-meta">
          <span>Question ${index + 1}</span>
          <span>${question.stageLabel} ${question.difficulty}</span>
        </div>
        <p>${question.concept} - ${question.relicName}</p>
        <div class="question-expression">${question.expression}</div>
        <div class="answer-row" aria-label="Final answer">
          <button class="minus-toggle" type="button" data-minus-toggle aria-pressed="false" aria-label="Turn on minus sign for question ${index + 1}">[-]</button>
          <label class="signed-size-box">
            <span class="answer-minus-mark" aria-hidden="true">-</span>
            <input class="size-input" type="number" inputmode="numeric" min="0" step="1" placeholder="size" aria-label="Answer size for question ${index + 1}" />
          </label>
        </div>
        <div class="question-feedback" aria-live="polite"></div>
      </article>
    `;
  }

  function renderExam() {
    hideCorrectionCompletePanel();
    questions = buildExamQuestions();
    questionGrid.innerHTML = questions.map(renderQuestion).join("");
    updateAnsweredCount();
  }

  function questionCards() {
    return [...questionGrid.querySelectorAll(".question-card")];
  }

  function answerForCard(card) {
    const sizeInput = card.querySelector(".size-input");
    const negative = card.querySelector("[data-minus-toggle]")?.classList.contains("active") || false;
    const rawSize = String(sizeInput?.value || "").trim();
    const size = Number(rawSize);
    const answered = rawSize !== "" && Number.isFinite(size) && Number.isInteger(size) && size >= 0;
    return { answered, negative, size: Math.abs(size) };
  }

  function formatAnswer(answer) {
    if (!answer || !answer.answered) return "blank";
    if (answer.size === 0) return "0";
    return `${answer.negative ? "-" : ""}${answer.size}`;
  }

  function setCardControls(card, enabled) {
    card.querySelectorAll("button, input").forEach(control => {
      control.disabled = !enabled;
    });
  }

  function correctionCards() {
    return questionCards().filter(card => card.classList.contains("needs-correction"));
  }

  function clearCorrectionTimers() {
    correctionTimers = new WeakMap();
  }

  function focusCorrectionCard(card) {
    if (!card) return;
    questionCards().forEach(item => item.classList.toggle("is-correction-active", item === card));
    const input = card.querySelector(".size-input");
    if (input && !input.disabled) {
      window.setTimeout(() => input.focus({ preventScroll: true }), 220);
    }
  }

  function scrollToCorrectionCard(card, delay = 120) {
    if (!card) return;
    window.setTimeout(() => {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      focusCorrectionCard(card);
    }, delay);
  }

  function showCorrectionCompletePanel() {
    correctionCompletePanel?.classList.remove("hidden");
    window.setTimeout(() => {
      correctionCompletePanel?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);
  }

  function hideCorrectionCompletePanel() {
    correctionCompletePanel?.classList.add("hidden");
  }

  function completeCorrections() {
    correctionMode = false;
    clearCorrectionTimers();
    questionCards().forEach(card => card.classList.remove("is-correction-active", "needs-correction"));
    examMessage.textContent = "All corrections are complete. The original score stays locked.";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Corrections Complete";
    }
    updateAnsweredCount();
    showCorrectionCompletePanel();
  }

  function evaluateCorrectionCard(card, options = {}) {
    if (!correctionMode || !card?.classList.contains("needs-correction")) return false;

    const index = Number(card.dataset.index);
    const question = questions[index];
    const answer = answerForCard(card);
    const feedback = card.querySelector(".question-feedback");

    if (!answer.answered) {
      card.classList.add("is-unanswered", "is-wrong", "needs-correction");
      if (feedback) feedback.textContent = "Add your answer for this correction.";
      updateAnsweredCount();
      focusCorrectionCard(card);
      return false;
    }

    const isCorrect = answer.negative === question.negative && answer.size === question.size;
    card.classList.remove("is-unanswered");

    if (isCorrect) {
      card.classList.remove("is-wrong", "needs-correction", "is-correction-active");
      card.classList.add("is-correct", "is-correction-fixed");
      setCardControls(card, false);
      if (feedback) feedback.textContent = "Corrected for practice.";

      const nextCard = correctionCards()[0];
      if (nextCard) {
        examMessage.textContent = "Good correction. Moving to the next red question.";
        updateAnsweredCount();
        if (options.scrollNext !== false) scrollToCorrectionCard(nextCard, 260);
      } else {
        completeCorrections();
      }
      return true;
    }

    card.classList.add("is-wrong", "needs-correction", "is-correction-active");
    if (feedback) feedback.textContent = `Your new answer: ${formatAnswer(answer)}. Try again.`;
    examMessage.textContent = "Not yet. Adjust this answer before moving on.";
    updateAnsweredCount();
    focusCorrectionCard(card);
    return false;
  }

  function scheduleCorrectionCheck(card, delay = 420) {
    if (!correctionMode || !card?.classList.contains("needs-correction")) return;
    const savedTimer = correctionTimers.get(card);
    if (savedTimer) window.clearTimeout(savedTimer);
    const timer = window.setTimeout(() => {
      correctionTimers.delete(card);
      evaluateCorrectionCard(card);
    }, delay);
    correctionTimers.set(card, timer);
  }

  function updateAnsweredCount() {
    if (correctionMode) {
      const remaining = correctionCards().length;
      answeredCount.textContent = remaining === 1
        ? "1 correction remaining"
        : `${remaining} corrections remaining`;
      return;
    }

    const answered = questionCards().filter(card => answerForCard(card).answered).length;
    answeredCount.textContent = `${answered} / ${TOTAL_QUESTIONS} answered`;
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safe / 60);
    const rest = safe % 60;
    return `${minutes}:${String(rest).padStart(2, "0")}`;
  }

  function elapsedSeconds() {
    if (!startedAt) return 0;
    return Math.floor((Date.now() - startedAt) / 1000);
  }

  function secondsRemaining() {
    return Math.max(0, TIME_LIMIT_SECONDS - elapsedSeconds());
  }

  function updateTimer() {
    const remaining = secondsRemaining();
    timerText.textContent = formatTime(remaining);
    timerCard?.classList.toggle("is-warning", remaining <= 90);

    if (remaining <= 0 && !finished) {
      gradeExam({ forced: true, reason: "Time expired." });
    }
  }

  function startTimer() {
    startedAt = Date.now();
    updateTimer();
    timerId = window.setInterval(updateTimer, 250);
  }

  function stopTimer() {
    if (timerId) window.clearInterval(timerId);
    timerId = 0;
  }

  function firstUnansweredCard() {
    return questionCards().find(card => !answerForCard(card).answered);
  }

  function markUnansweredCards() {
    let first = null;
    questionCards().forEach(card => {
      const unanswered = !answerForCard(card).answered;
      card.classList.toggle("is-unanswered", unanswered);
      if (unanswered && !first) first = card;
    });
    return first;
  }

  function gradeExam(options = {}) {
    if (finished) return;
    hideCorrectionCompletePanel();
    clearCorrectionTimers();

    if (!options.forced) {
      const firstMissing = firstUnansweredCard();
      if (firstMissing) {
        markUnansweredCards();
        examMessage.textContent = "Every answer must be filled before submitting.";
        firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    finished = true;
    stopTimer();

    let correct = 0;
    const cards = questionCards();

    cards.forEach((card, index) => {
      const question = questions[index];
      const answer = answerForCard(card);
      const isCorrect = answer.answered && answer.negative === question.negative && answer.size === question.size;
      const feedback = card.querySelector(".question-feedback");

      if (isCorrect) correct += 1;

      card.classList.remove("is-unanswered");
      card.classList.toggle("is-correct", isCorrect);
      card.classList.toggle("is-wrong", !isCorrect);
      card.classList.toggle("needs-correction", !isCorrect);
      setCardControls(card, !isCorrect);

      if (feedback) {
        feedback.textContent = isCorrect
          ? "Correct on first submit."
          : `Your answer: ${formatAnswer(answer)}. Try this one again for practice.`;
      }
    });

    const percent = (correct / TOTAL_QUESTIONS) * 100;
    const roundedPercent = Math.round(percent * 10) / 10;
    const usedSeconds = Math.min(elapsedSeconds(), TIME_LIMIT_SECONDS);
    const errors = TOTAL_QUESTIONS - correct;
    const passed = correct >= PASSING_CORRECT && !options.forced;

    correctionMode = errors > 0;
    if (submitButton) {
      submitButton.disabled = !correctionMode;
      submitButton.textContent = correctionMode ? "Check Corrections" : "Corrections Complete";
    }
    examMessage.textContent = correctionMode
      ? "Original score is locked. Correct the red questions for practice."
      : "Perfect first run. The Root Gate accepts your answers.";
    updateAnsweredCount();

    const saved = saveResult({ correct, errors, percent: roundedPercent, usedSeconds, passed, forced: Boolean(options.forced) });
    showResult({ correct, errors, percent: roundedPercent, usedSeconds, passed, forced: Boolean(options.forced), reason: options.reason || "", ...saved });
  }

  function checkCorrections() {
    if (!correctionMode) return;

    const firstReady = correctionCards().find(card => answerForCard(card).answered);
    const target = firstReady || correctionCards()[0];

    if (!target) {
      completeCorrections();
      return;
    }

    evaluateCorrectionCard(target);
  }

  function resultImageDataUrl(result) {
    const status = result.passed ? "Root Gate Opened" : "Root Gate Sealed";
    const color = result.passed ? "#79d09b" : "#ef7777";
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const attemptNumber = positiveInteger(result.attemptNumber);
    const attemptLine = attemptNumber ? `Attempt ${attemptNumber}` : "Chapter 1: Term Vision Checkpoint";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
        <rect width="900" height="560" rx="26" fill="#081526"/>
        <rect x="28" y="28" width="844" height="504" rx="18" fill="#102238" stroke="#f2b84b" stroke-width="4"/>
        <text x="450" y="96" text-anchor="middle" fill="#ffe7a8" font-family="Georgia, serif" font-size="46" font-weight="700">Math Ridge</text>
        <text x="450" y="152" text-anchor="middle" fill="${color}" font-family="Arial, sans-serif" font-size="38" font-weight="800">${status}</text>
        <text x="450" y="226" text-anchor="middle" fill="#fff7e8" font-family="Arial, sans-serif" font-size="78" font-weight="900">${result.percent}%</text>
        <text x="450" y="286" text-anchor="middle" fill="#fff7e8" font-family="Arial, sans-serif" font-size="30">${result.correct}/40 correct</text>
        <text x="450" y="340" text-anchor="middle" fill="#d9c8aa" font-family="Arial, sans-serif" font-size="25">Errors: ${result.errors} | Time: ${formatTime(result.usedSeconds)}</text>
        <text x="450" y="410" text-anchor="middle" fill="#ffe7a8" font-family="Arial, sans-serif" font-size="25">${attemptLine}</text>
        <text x="450" y="462" text-anchor="middle" fill="#d9c8aa" font-family="Arial, sans-serif" font-size="22">${date}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function readAttemptHistory() {
    const saved = readJSON(CHAPTER_ATTEMPT_HISTORY_KEY);
    return Array.isArray(saved) ? saved : [];
  }

  function recordAttempt(result, completedAt) {
    const history = readAttemptHistory();
    const savedCount = positiveInteger(localStorage.getItem(CHAPTER_ATTEMPTS_KEY));
    const attemptNumber = Math.max(savedCount, history.length) + 1;
    const attempt = {
      attemptNumber,
      completedAt,
      passed: result.passed,
      correct: result.correct,
      errors: result.errors,
      percent: result.percent,
      usedSeconds: result.usedSeconds,
      forced: Boolean(result.forced)
    };
    const nextHistory = [...history, attempt].slice(-50);

    localStorage.setItem(CHAPTER_ATTEMPTS_KEY, String(attemptNumber));
    localStorage.setItem(CHAPTER_ATTEMPT_HISTORY_KEY, JSON.stringify(nextHistory));

    return {
      attemptNumber,
      attempts: attemptNumber,
      attemptHistory: nextHistory
    };
  }

  function saveResult(result) {
    const completedAt = new Date().toISOString();
    let attemptRecord = {
      attemptNumber: 1,
      attempts: 1,
      attemptHistory: []
    };

    const payload = {
      version: 1,
      checkpoint: "chapter_1_root_gate",
      completedAt,
      requiredCorrect: PASSING_CORRECT,
      totalQuestions: TOTAL_QUESTIONS,
      passed: result.passed,
      correct: result.correct,
      errors: result.errors,
      percent: result.percent,
      usedSeconds: result.usedSeconds,
      timeLimitSeconds: TIME_LIMIT_SECONDS
    };

    try {
      attemptRecord = recordAttempt(result, completedAt);
      const bestAttempt = attemptRecord.attemptHistory.reduce((best, attempt) => {
        if (!best || Number(attempt.percent) > Number(best.percent)) return attempt;
        return best;
      }, null);
      const resultWithAttempt = {
        ...result,
        ...attemptRecord,
        bestPercent: bestAttempt ? bestAttempt.percent : result.percent,
        bestCorrect: bestAttempt ? bestAttempt.correct : result.correct
      };
      const payloadWithAttempt = {
        ...payload,
        attemptNumber: attemptRecord.attemptNumber,
        attempts: attemptRecord.attempts,
        bestPercent: resultWithAttempt.bestPercent,
        bestCorrect: resultWithAttempt.bestCorrect
      };

      localStorage.setItem(CHAPTER_RESULT_DATA_KEY, JSON.stringify(payloadWithAttempt));
      localStorage.setItem(CHAPTER_RESULT_KEY, resultImageDataUrl(resultWithAttempt));
      localStorage.setItem(ROOT_GATE_UNLOCK_KEY, "true");

      if (result.passed) {
        localStorage.setItem(ROOT_GATE_PASS_KEY, "true");
        localStorage.setItem(CHAPTER_PASS_KEY, "true");
        localStorage.setItem(CHAPTER_TWO_NOTE_KEY, "true");
        localStorage.setItem(CHAPTER_TWO_STAGE_KEY, "true");
      }
    } catch (error) {}

    return attemptRecord;
  }

  function showResult(result) {
    resultCard.classList.toggle("pass", result.passed);
    resultCard.classList.toggle("fail", !result.passed);
    resultTitle.textContent = result.passed ? "Root Gate Opened" : "Root Gate Still Sealed";
    scoreRing.textContent = `${result.percent}%`;

    resultSummary.textContent = result.passed
      ? "You passed the Chapter 1 checkpoint. Chapter 2-1 is now unlocked on this device."
      : result.forced
        ? "Time expired before the Root Gate opened. Your first score is locked. Correct the red questions for practice, then retake the exam when you are ready."
        : "The Root Gate needs 37 correct answers. Your first score is locked. Correct the red questions for practice, then retake the exam.";

    if (resultStoryLink) {
      resultStoryLink.href = result.passed
        ? "story-root-gate-result.html?outcome=pass"
        : "story-root-gate-result.html?outcome=fail";
      resultStoryLink.textContent = result.passed ? "View Gate Opening Scene" : "View Retry Scene";
    }

    resultStats.innerHTML = `
      <div><strong>${result.correct}/40</strong><span>correct</span></div>
      <div><strong>${result.errors}</strong><span>errors</span></div>
      <div><strong>${formatTime(result.usedSeconds)}</strong><span>time used</span></div>
      <div><strong>${positiveInteger(result.attempts, positiveInteger(result.attemptNumber, 1))}</strong><span>attempts</span></div>
    `;

    resultLayer.classList.remove("hidden");
  }

  function startExam() {
    hideCorrectionCompletePanel();
    clearCorrectionTimers();
    renderExam();
    startPanel.classList.add("hidden");
    examForm.classList.remove("hidden");
    startTimer();
    questionGrid.querySelector(".size-input")?.focus();
  }

  function resetExam() {
    finished = false;
    correctionMode = false;
    clearCorrectionTimers();
    stopTimer();
    startedAt = 0;
    timerText.textContent = formatTime(TIME_LIMIT_SECONDS);
    timerCard?.classList.remove("is-warning");
    resultLayer.classList.add("hidden");
    hideCorrectionCompletePanel();
    examForm.classList.add("hidden");
    startPanel.classList.remove("hidden");
    examMessage.textContent = "Answer every question before submitting.";
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Exam";
    }
    questionGrid.innerHTML = "";
    updateAnsweredCount();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  startExamButton?.addEventListener("click", startExam);

  examForm?.addEventListener("submit", event => {
    event.preventDefault();
    if (correctionMode) {
      checkCorrections();
      return;
    }
    gradeExam();
  });

  questionGrid?.addEventListener("click", event => {
    const button = event.target.closest("[data-minus-toggle]");
    if (!button || (finished && !correctionMode)) return;

    const card = button.closest(".question-card");
    if (correctionMode && !card?.classList.contains("needs-correction")) return;

    const active = !button.classList.contains("active");
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    card?.classList.toggle("answer-negative", active);
    card?.classList.remove("is-unanswered");
    updateAnsweredCount();
    if (correctionMode) scheduleCorrectionCheck(card, 160);
  });

  questionGrid?.addEventListener("input", event => {
    if (!event.target.matches(".size-input")) return;
    const card = event.target.closest(".question-card");
    if (correctionMode && !card?.classList.contains("needs-correction")) return;
    card?.classList.remove("is-unanswered");
    updateAnsweredCount();
    if (correctionMode) scheduleCorrectionCheck(card, 480);
  });

  questionGrid?.addEventListener("change", event => {
    if (!event.target.matches(".size-input")) return;
    const card = event.target.closest(".question-card");
    if (correctionMode && card?.classList.contains("needs-correction")) {
      evaluateCorrectionCard(card);
    }
  });

  questionGrid?.addEventListener("keydown", event => {
    if (event.key !== "Enter" || !event.target.matches(".size-input")) return;
    const card = event.target.closest(".question-card");
    if (correctionMode && card?.classList.contains("needs-correction")) {
      event.preventDefault();
      evaluateCorrectionCard(card);
    }
  });

  reviewButton?.addEventListener("click", () => {
    resultLayer.classList.add("hidden");
    const firstCorrection = correctionCards()[0];
    if (firstCorrection) scrollToCorrectionCard(firstCorrection, 80);
    else examForm.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  retryButton?.addEventListener("click", resetExam);
  correctionRetryButton?.addEventListener("click", resetExam);

  try {
    if (localStorage.getItem("mathRidge_playComplete_1_4") === "true") {
      localStorage.setItem(ROOT_GATE_UNLOCK_KEY, "true");
    }
  } catch (error) {}

  if (!isGateReady()) {
    startExamButton.disabled = true;
    startExamButton.textContent = "Root Gate Locked";
    const message = startPanel?.querySelector("p");
    if (message) {
      message.textContent = "Collect all four Chapter 1 relics before attempting the Root Gate Exam.";
    }
  }

  window.MathRidgeRootGate = {
    buildExamQuestions,
    checkCorrections,
    questionPlan,
    gradeExam,
    resetExam
  };
})();
