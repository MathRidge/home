(function () {
  "use strict";

  const TIME_LIMIT_SECONDS = 35 * 60;
  const TOTAL_QUESTIONS = 50;
  const PASSING_CORRECT = 46;
  const CHAPTER_PASS_KEY = "mathRidge_testPassed_chapter_2";
  const CHAPTER_RESULT_KEY = "mathRidge_testResult_chapter_2";
  const CHAPTER_RESULT_LEGACY_KEY = "mathRidge_testResult_chapter2";
  const CHAPTER_RESULT_DATA_KEY = "mathRidge_testResult_chapter_2_data";
  const CHAPTER_ATTEMPTS_KEY = "mathRidge_testAttempts_chapter_2";
  const CHAPTER_ATTEMPT_HISTORY_KEY = "mathRidge_testAttemptHistory_chapter_2";
  const TEST_RESULT_CERTIFICATE_IMAGE = "assets/images/test-results/math_ridge_certificate_mastery_template_true_alpha.png?v=20260608-mastery-certificate";
  const PLAYER_PROFILE_KEY = "mathRidge_playerProfile_v1";
  const CERTIFICATE_FULL_NAME_KEY = "mathRidge_certificateFullName_v1";
  const CHAPTER_TWO_PLAY_IDS = ["2_1a", "2_1", "2_2", "2_3", "2_4"];
  const VALID_EXP_BASES = [2, 3, 5, 7, 11, 13];

  const splitDivisionPool = [
    { value: 132, divisor: 3, chunk: 120 },
    { value: 141, divisor: 3, chunk: 120 },
    { value: 168, divisor: 4, chunk: 160 },
    { value: 155, divisor: 5, chunk: 150 },
    { value: 186, divisor: 6, chunk: 180 },
    { value: 224, divisor: 7, chunk: 210 },
    { value: 126, divisor: 3, chunk: 120 },
    { value: 165, divisor: 5, chunk: 150 },
    { value: 208, divisor: 8, chunk: 160 },
    { value: 248, divisor: 4, chunk: 240 }
  ];

  const oneSplitReductionPool = [
    { topCount: 7, bottomCount: 11, group: 2 },
    { topCount: 7, bottomCount: 9, group: 3 },
    { topCount: 5, bottomCount: 7, group: 5 },
    { topCount: 5, bottomCount: 8, group: 4 },
    { topCount: 11, bottomCount: 13, group: 2 }
  ];

  const directReductionPool = [
    { top: 16, bottom: 24 },
    { top: 21, bottom: 27 },
    { top: 15, bottom: 35 },
    { top: 24, bottom: 36 },
    { top: 35, bottom: 49 }
  ];

  const primePiecePool = [
    { value: 12, factors: [2, 2, 3] },
    { value: 18, factors: [2, 3, 3] },
    { value: 20, factors: [2, 2, 5] },
    { value: 28, factors: [2, 2, 7] },
    { value: 30, factors: [2, 3, 5] },
    { value: 42, factors: [2, 3, 7] },
    { value: 45, factors: [3, 3, 5] },
    { value: 63, factors: [3, 3, 7] },
    { value: 70, factors: [2, 5, 7] },
    { value: 75, factors: [3, 5, 5] }
  ];

  const fractionProductPool = [
    { operation: "multiply", first: { top: 2, bottom: 3 }, second: { top: 9, bottom: 10 } },
    { operation: "multiply", first: { top: 4, bottom: 5 }, second: { top: 15, bottom: 8 } },
    { operation: "multiply", first: { top: 18, bottom: 25 }, second: { top: 35, bottom: 24 } },
    { operation: "multiply", first: { top: 32, bottom: 45 }, second: { top: 27, bottom: 56 } },
    { operation: "multiply", first: { top: 40, bottom: 63 }, second: { top: 21, bottom: 50 } },
    { operation: "divide", first: { top: 2, bottom: 5 }, second: { top: 6, bottom: 25 } },
    { operation: "divide", first: { top: 3, bottom: 8 }, second: { top: 9, bottom: 20 } },
    { operation: "divide", first: { top: 28, bottom: 45 }, second: { top: 35, bottom: 54 } },
    { operation: "divide", first: { top: 30, bottom: 49 }, second: { top: 45, bottom: 56 } },
    { operation: "divide", first: { top: 24, bottom: 49 }, second: { top: 36, bottom: 56 } }
  ];

  const exponentShelfPool = [
    { first: { top: 56, bottom: 45 }, second: { top: 54, bottom: 162 } },
    { first: { top: 48, bottom: 35 }, second: { top: 63, bottom: 72 } },
    { first: { top: 72, bottom: 50 }, second: { top: 45, bottom: 108 } },
    { first: { top: 40, bottom: 63 }, second: { top: 98, bottom: 45 } },
    { first: { top: 84, bottom: 55 }, second: { top: 121, bottom: 98 } },
    { first: { top: 91, bottom: 72 }, second: { top: 54, bottom: 65 } },
    { first: { top: 64, bottom: 75 }, second: { top: 45, bottom: 56 } },
    { first: { top: 96, bottom: 81 }, second: { top: 27, bottom: 64 } },
    { first: { top: 125, bottom: 42 }, second: { top: 98, bottom: 75 } },
    { first: { top: 108, bottom: 49 }, second: { top: 35, bottom: 90 } }
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
  const correctionCompletePanel = document.getElementById("correctionCompletePanel");
  const correctionRetryButton = document.getElementById("correctionRetryButton");
  const submitButton = examForm?.querySelector(".submit-button");

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (error) { return null; }
  }

  function cleanCertificateName(value, fallback = "Math Ridge Scholar") {
    const clean = String(value || "").replace(/\s+/g, " ").trim();
    return clean ? clean.slice(0, 48) : fallback;
  }

  function preferredCertificateName() {
    const profile = readJSON(PLAYER_PROFILE_KEY) || {};
    const savedFullName = (() => {
      try { return localStorage.getItem(CERTIFICATE_FULL_NAME_KEY); }
      catch (error) { return ""; }
    })();
    const earnedCert = CHAPTER_TWO_PLAY_IDS
      .concat(["1_1", "1_2", "1_3", "1_4"])
      .map(id => readJSON(`mathRidge_cert_${id}`))
      .find(cert => cert?.studentName || cert?.certificateName);

    return cleanCertificateName(
      savedFullName ||
      profile.certificateName ||
      profile.playerName ||
      profile.nickname ||
      earnedCert?.studentName ||
      earnedCert?.certificateName
    );
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

  function hasAllChapterTwoRelics() {
    return CHAPTER_TWO_PLAY_IDS.every(id => hasCertificate(id) || hasCompletedPlay(id));
  }

  function isTestReady() {
    try {
      const localPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname) &&
        new URLSearchParams(window.location.search).get("preview") === "unlock";
      return localPreview ||
        localStorage.getItem(CHAPTER_PASS_KEY) === "true" ||
        hasAllChapterTwoRelics() ||
        hasCertificate("2_4") ||
        hasCompletedPlay("2_4");
    } catch (error) {
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function product(list) {
    return list.reduce((total, value) => total * value, 1);
  }

  function gcd(a, b) {
    let x = Math.abs(Number(a) || 0);
    let y = Math.abs(Number(b) || 0);
    while (y) [x, y] = [y, x % y];
    return x || 1;
  }

  function reduceFraction(top, bottom) {
    const g = gcd(top, bottom);
    return { top: top / g, bottom: bottom / g };
  }

  function countMap(list) {
    const map = {};
    list.forEach(value => {
      map[value] = (map[value] || 0) + 1;
    });
    return map;
  }

  function primeFactorsOf(value) {
    const factors = [];
    let rest = Math.abs(Number(value || 0));
    VALID_EXP_BASES.forEach(base => {
      while (rest > 1 && rest % base === 0) {
        factors.push(base);
        rest /= base;
      }
    });
    return rest === 1 ? factors : [];
  }

  function sameCountMap(a, b) {
    return VALID_EXP_BASES.every(base => Number(a?.[base] || 0) === Number(b?.[base] || 0));
  }

  function fractionHTML(top, bottom, className = "") {
    return `<span class="fraction ${className}"><span class="top">${top}</span><span class="bottom">${bottom}</span></span>`;
  }

  function fractionInputHTML(topField, bottomField) {
    return `
      <span class="fraction answer-fraction">
        <span class="top"><input class="fraction-input" data-field="${topField}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="${topField}"></span>
        <span class="bottom"><input class="fraction-input" data-field="${bottomField}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="${bottomField}"></span>
      </span>
    `;
  }

  function inputHTML(field, label, className = "exam-input") {
    return `<input class="${className}" data-field="${field}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="${escapeHTML(label)}" />`;
  }

  function baseQuestion(type, stageLabel, concept, relicName, difficulty) {
    return {
      id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      stageLabel,
      concept,
      relicName,
      difficulty
    };
  }

  function makeSplitDivisionQuestion(item, index) {
    const leftover = item.value - item.chunk;
    return {
      ...baseQuestion("split-division", "2-1a", "Split Shelf Division", "Shelf Scale", index < 4 ? "friendly" : "steady"),
      value: item.value,
      divisor: item.divisor,
      chunk: item.chunk,
      leftover,
      chunkCount: item.chunk / item.divisor,
      leftoverCount: leftover / item.divisor,
      answer: item.value / item.divisor
    };
  }

  function makeOneSplitReductionQuestion(item) {
    return {
      ...baseQuestion("one-split-reduction", "2-1b", "One Shared Group", "Shelf Scale", "method"),
      top: item.topCount * item.group,
      bottom: item.bottomCount * item.group,
      topCount: item.topCount,
      bottomCount: item.bottomCount,
      group: item.group,
      reducedTop: item.topCount,
      reducedBottom: item.bottomCount
    };
  }

  function makeDirectReductionQuestion(item) {
    const reduced = reduceFraction(item.top, item.bottom);
    return {
      ...baseQuestion("direct-reduction", "2-1b", "Fraction Shelves", "Shelf Scale", "direct"),
      top: item.top,
      bottom: item.bottom,
      reducedTop: reduced.top,
      reducedBottom: reduced.bottom
    };
  }

  function makePrimePieceQuestion(item) {
    return {
      ...baseQuestion("prime-pieces", "2-2", "Prime Pieces", "Primewood Seed", "factor"),
      value: item.value,
      factors: item.factors
    };
  }

  function makeFractionProductQuestion(seed, index) {
    const afterSecond = seed.operation === "divide"
      ? { top: seed.second.bottom, bottom: seed.second.top }
      : { ...seed.second };
    const numerator = seed.first.top * afterSecond.top;
    const denominator = seed.first.bottom * afterSecond.bottom;
    const reduced = reduceFraction(numerator, denominator);

    return {
      ...baseQuestion("fraction-product", "2-3", seed.operation === "divide" ? "Reciprocal Division" : "Fraction Product", "Fraction Loom", index < 5 ? "multiply" : "divide"),
      operation: seed.operation,
      first: { ...seed.first },
      second: { ...seed.second },
      afterSecond,
      reducedTop: reduced.top,
      reducedBottom: reduced.bottom
    };
  }

  function makeExponentShelfQuestion(seed, index) {
    const topFactors = [
      ...primeFactorsOf(seed.first.top),
      ...primeFactorsOf(seed.second.top)
    ];
    const bottomFactors = [
      ...primeFactorsOf(seed.first.bottom),
      ...primeFactorsOf(seed.second.bottom)
    ];
    const topCounts = countMap(topFactors);
    const bottomCounts = countMap(bottomFactors);
    const reduced = reduceFraction(seed.first.top * seed.second.top, seed.first.bottom * seed.second.bottom);

    return {
      ...baseQuestion("exponent-shelf", "2-4", "Exponent Shelf Packing", "Power Tally", index < 4 ? "steady" : index < 8 ? "strong" : "hard"),
      first: { ...seed.first },
      second: { ...seed.second },
      topCounts,
      bottomCounts,
      reducedTop: reduced.top,
      reducedBottom: reduced.bottom
    };
  }

  function buildExamQuestions() {
    const generated = [
      ...splitDivisionPool.map(makeSplitDivisionQuestion),
      ...oneSplitReductionPool.map(makeOneSplitReductionQuestion),
      ...directReductionPool.map(makeDirectReductionQuestion),
      ...primePiecePool.map(makePrimePieceQuestion),
      ...fractionProductPool.map(makeFractionProductQuestion),
      ...exponentShelfPool.map(makeExponentShelfQuestion)
    ];
    return shuffle(generated);
  }

  function renderSplitDivision(question) {
    return `
      <div class="question-expression">${fractionHTML(question.value, question.divisor, "large-fraction")}</div>
      <div class="method-panel">
        <strong>Show the split shelf</strong>
        <div class="split-row">
          <span>${question.value}</span>
          <span class="arrow-mark">-&gt;</span>
          ${inputHTML("chunk", "friendly chunk")}
          <span class="chunk-plus">+</span>
          ${inputHTML("leftover", "leftover")}
        </div>
        <div class="split-row">
          ${inputHTML("chunkCount", "friendly chunk count")}
          <span class="chunk-plus">+</span>
          ${inputHTML("leftoverCount", "leftover count")}
          <span class="arrow-mark">-&gt;</span>
          ${inputHTML("answer", "final count")}
        </div>
      </div>
    `;
  }

  function renderOneSplitReduction(question) {
    return `
      <div class="question-expression">Reduce ${fractionHTML(question.top, question.bottom, "large-fraction")}</div>
      <div class="method-panel">
        <strong>Rewrite as shared groups</strong>
        <div class="method-row">
          <span class="group-formula">${inputHTML("topCount", "top count")}<span>(</span>${inputHTML("topGroup", "top group")}<span>)</span></span>
          <span class="op-symbol">/</span>
          <span class="group-formula">${inputHTML("bottomCount", "bottom count")}<span>(</span>${inputHTML("bottomGroup", "bottom group")}<span>)</span></span>
        </div>
        <div class="fraction-answer-row">
          <span class="method-label">Simplest name</span>
          ${fractionInputHTML("answerTop", "answerBottom")}
        </div>
      </div>
    `;
  }

  function renderDirectReduction(question) {
    return `
      <div class="question-expression">Simplify ${fractionHTML(question.top, question.bottom, "large-fraction")}</div>
      <div class="method-panel">
        <strong>Write the simplest name</strong>
        <div class="fraction-answer-row">${fractionInputHTML("answerTop", "answerBottom")}</div>
      </div>
    `;
  }

  function renderPrimePieces(question) {
    return `
      <div class="question-expression">Break <strong>${question.value}</strong> into three pieces.</div>
      <div class="method-panel">
        <strong>Three factor boxes</strong>
        <div class="prime-piece-row">
          ${inputHTML("factorA", "factor 1")}
          <span class="tiny-times">x</span>
          ${inputHTML("factorB", "factor 2")}
          <span class="tiny-times">x</span>
          ${inputHTML("factorC", "factor 3")}
        </div>
      </div>
    `;
  }

  function renderFractionProduct(question) {
    const op = question.operation === "divide" ? "&divide;" : "&times;";
    return `
      <div class="question-expression">
        ${fractionHTML(question.first.top, question.first.bottom, "large-fraction")}
        <span class="op-symbol">${op}</span>
        ${fractionHTML(question.second.top, question.second.bottom, "large-fraction")}
      </div>
      <div class="method-panel">
        <strong>Write the simplest result</strong>
        <div class="fraction-answer-row">${fractionInputHTML("answerTop", "answerBottom")}</div>
      </div>
    `;
  }

  function renderExponentShelf(question) {
    return `
      <div class="question-expression">
        ${fractionHTML(question.first.top, question.first.bottom, "large-fraction")}
        <span class="op-symbol">&times;</span>
        ${fractionHTML(question.second.top, question.second.bottom, "large-fraction")}
      </div>
      <div class="method-panel">
        <strong>Pack the shelves with exponents</strong>
        <div class="exp-row">
          <span class="method-label">Top shelf exponential form</span>
          <input class="exp-input-wide" data-field="topExp" type="text" inputmode="text" autocomplete="off" aria-label="top shelf exponential form" />
          <button type="button" data-exp-insert data-target-field="topExp">^</button>
          <div class="exp-preview" data-preview-for="topExp"></div>
        </div>
        <div class="exp-row">
          <span class="method-label">Bottom shelf exponential form</span>
          <input class="exp-input-wide" data-field="bottomExp" type="text" inputmode="text" autocomplete="off" aria-label="bottom shelf exponential form" />
          <button type="button" data-exp-insert data-target-field="bottomExp">^</button>
          <div class="exp-preview" data-preview-for="bottomExp"></div>
        </div>
        <div class="fraction-answer-row">
          <span class="method-label">Simplest form</span>
          ${fractionInputHTML("answerTop", "answerBottom")}
        </div>
      </div>
    `;
  }

  function renderQuestionBody(question) {
    if (question.type === "split-division") return renderSplitDivision(question);
    if (question.type === "one-split-reduction") return renderOneSplitReduction(question);
    if (question.type === "direct-reduction") return renderDirectReduction(question);
    if (question.type === "prime-pieces") return renderPrimePieces(question);
    if (question.type === "fraction-product") return renderFractionProduct(question);
    return renderExponentShelf(question);
  }

  function renderQuestion(question, index) {
    return `
      <article class="question-card ${question.type}" data-index="${index}">
        <div class="question-meta">
          <span>Question ${index + 1}</span>
          <span>${escapeHTML(question.stageLabel)} ${escapeHTML(question.difficulty)}</span>
        </div>
        <p>${escapeHTML(question.concept)} - ${escapeHTML(question.relicName)}</p>
        ${renderQuestionBody(question)}
        <div class="question-feedback" aria-live="polite"></div>
      </article>
    `;
  }

  function renderExam() {
    hideCorrectionCompletePanel();
    questions = buildExamQuestions();
    questionGrid.innerHTML = questions.map(renderQuestion).join("");
    updateAnsweredCount();
    updateExponentPreviews();
  }

  function questionCards() {
    return [...questionGrid.querySelectorAll(".question-card")];
  }

  function fieldValue(card, field) {
    return String(card.querySelector(`[data-field="${field}"]`)?.value || "").trim();
  }

  function integerField(card, field) {
    const raw = fieldValue(card, field);
    if (raw === "") return null;
    const clean = raw.replace(/[^\d]/g, "");
    if (!clean) return null;
    const value = Number(clean);
    return Number.isSafeInteger(value) ? value : null;
  }

  function fractionAnswer(card) {
    const top = integerField(card, "answerTop");
    const bottom = integerField(card, "answerBottom");
    return { top, bottom, answered: top !== null && bottom !== null && bottom > 0 };
  }

  function formatFractionAnswer(answer) {
    if (!answer || !answer.answered) return "blank";
    return `${answer.top}/${answer.bottom}`;
  }

  function allIntegersPresent(card, fields) {
    return fields.every(field => integerField(card, field) !== null);
  }

  function parseExponentExpression(raw) {
    const text = String(raw || "").trim();
    if (!text) return null;

    const normalized = text
      .replace(/[\u00d7\u00b7]/g, "x")
      .replace(/\s+/g, "x");
    const chunks = normalized.split(/[xX*]+/).filter(Boolean);
    if (!chunks.length) return null;

    const counts = {};
    for (const chunk of chunks) {
      const match = chunk.match(/^(\d+)(?:\^(\d+))?$/);
      if (!match) return null;
      const base = Number(match[1]);
      const exponent = match[2] ? Number(match[2]) : 1;
      if (!VALID_EXP_BASES.includes(base) || !Number.isInteger(exponent) || exponent < 1 || exponent > 9) {
        return null;
      }
      counts[base] = (counts[base] || 0) + exponent;
    }
    return counts;
  }

  function hasRequiredExponentNotation(raw, expectedCounts) {
    const text = String(raw || "").replace(/\s+/g, "");
    return VALID_EXP_BASES.every(base => {
      const count = Number(expectedCounts?.[base] || 0);
      if (count <= 1) return true;
      const pattern = new RegExp(`(^|[xX*\\u00d7\\u00b7])${base}\\^${count}($|[xX*\\u00d7\\u00b7])`);
      return pattern.test(text);
    });
  }

  function answerForCard(card) {
    const question = questions[Number(card.dataset.index)];
    if (!question) return { answered: false, correct: false, display: "blank" };

    if (question.type === "split-division") {
      const fields = ["chunk", "leftover", "chunkCount", "leftoverCount", "answer"];
      const answered = allIntegersPresent(card, fields);
      const correct = answered &&
        integerField(card, "chunk") === question.chunk &&
        integerField(card, "leftover") === question.leftover &&
        integerField(card, "chunkCount") === question.chunkCount &&
        integerField(card, "leftoverCount") === question.leftoverCount &&
        integerField(card, "answer") === question.answer;
      return { answered, correct, display: answered ? `${integerField(card, "chunk")}+${integerField(card, "leftover")} -> ${integerField(card, "answer")}` : "blank" };
    }

    if (question.type === "one-split-reduction") {
      const fields = ["topCount", "topGroup", "bottomCount", "bottomGroup"];
      const fraction = fractionAnswer(card);
      const answered = allIntegersPresent(card, fields) && fraction.answered;
      const correct = answered &&
        integerField(card, "topCount") === question.topCount &&
        integerField(card, "topGroup") === question.group &&
        integerField(card, "bottomCount") === question.bottomCount &&
        integerField(card, "bottomGroup") === question.group &&
        fraction.top === question.reducedTop &&
        fraction.bottom === question.reducedBottom;
      return { answered, correct, display: answered ? `${formatFractionAnswer(fraction)}` : "blank" };
    }

    if (question.type === "direct-reduction" || question.type === "fraction-product") {
      const fraction = fractionAnswer(card);
      const correct = fraction.answered && fraction.top === question.reducedTop && fraction.bottom === question.reducedBottom;
      return { answered: fraction.answered, correct, display: formatFractionAnswer(fraction) };
    }

    if (question.type === "prime-pieces") {
      const fields = ["factorA", "factorB", "factorC"];
      const answered = allIntegersPresent(card, fields);
      const values = fields.map(field => integerField(card, field));
      const correct = answered && values.every(value => value > 1) && product(values) === question.value;
      return { answered, correct, display: answered ? values.join(" x ") : "blank" };
    }

    const fraction = fractionAnswer(card);
    const topExpRaw = fieldValue(card, "topExp");
    const bottomExpRaw = fieldValue(card, "bottomExp");
    const topCounts = parseExponentExpression(topExpRaw);
    const bottomCounts = parseExponentExpression(bottomExpRaw);
    const answered = Boolean(topExpRaw && bottomExpRaw && fraction.answered);
    const correct = answered &&
      sameCountMap(topCounts, question.topCounts) &&
      sameCountMap(bottomCounts, question.bottomCounts) &&
      hasRequiredExponentNotation(topExpRaw, question.topCounts) &&
      hasRequiredExponentNotation(bottomExpRaw, question.bottomCounts) &&
      fraction.top === question.reducedTop &&
      fraction.bottom === question.reducedBottom;
    return { answered, correct, display: answered ? `${topExpRaw} / ${bottomExpRaw}; ${formatFractionAnswer(fraction)}` : "blank" };
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
    const input = card.querySelector("input:not(:disabled)");
    if (input) window.setTimeout(() => input.focus({ preventScroll: true }), 180);
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

    const answer = answerForCard(card);
    const feedback = card.querySelector(".question-feedback");

    if (!answer.answered) {
      card.classList.add("is-unanswered", "is-wrong", "needs-correction");
      if (feedback) feedback.textContent = "Add every required part for this correction.";
      updateAnsweredCount();
      focusCorrectionCard(card);
      return false;
    }

    card.classList.remove("is-unanswered");

    if (answer.correct) {
      card.classList.remove("is-wrong", "needs-correction", "is-correction-active");
      card.classList.add("is-correct", "is-correction-fixed");
      setCardControls(card, false);
      if (feedback) feedback.textContent = "Corrected for practice.";

      const nextCard = correctionCards()[0];
      if (nextCard) {
        examMessage.textContent = "Good correction. Moving to the next red question.";
        updateAnsweredCount();
        if (options.scrollNext !== false) scrollToCorrectionCard(nextCard, 240);
      } else {
        completeCorrections();
      }
      return true;
    }

    card.classList.add("is-wrong", "needs-correction", "is-correction-active");
    if (feedback) feedback.textContent = `Your new answer: ${answer.display}. Try again.`;
    examMessage.textContent = "Not yet. Adjust this answer before moving on.";
    updateAnsweredCount();
    focusCorrectionCard(card);
    return false;
  }

  function scheduleCorrectionCheck(card, delay = 520) {
    if (!correctionMode || !card?.classList.contains("needs-correction")) return;
    const savedTimer = correctionTimers.get(card);
    if (savedTimer) window.clearTimeout(savedTimer);
    const timer = window.setTimeout(() => {
      correctionTimers.delete(card);
      evaluateCorrectionCard(card, { scrollNext: false });
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
    timerCard?.classList.toggle("is-warning", remaining <= 120);
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

  function questionBreakdown() {
    return questions.reduce((map, question) => {
      map[question.stageLabel] = (map[question.stageLabel] || 0) + 1;
      return map;
    }, {});
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
      checkpoint: "chapter_2_prime_element_vision",
      studentName: preferredCertificateName(),
      completedAt,
      requiredCorrect: PASSING_CORRECT,
      totalQuestions: TOTAL_QUESTIONS,
      passed: result.passed,
      correct: result.correct,
      errors: result.errors,
      percent: result.percent,
      usedSeconds: result.usedSeconds,
      timeLimitSeconds: TIME_LIMIT_SECONDS,
      breakdown: questionBreakdown()
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
      localStorage.setItem(CHAPTER_RESULT_KEY, TEST_RESULT_CERTIFICATE_IMAGE);
      localStorage.setItem(CHAPTER_RESULT_LEGACY_KEY, TEST_RESULT_CERTIFICATE_IMAGE);

      if (result.passed) {
        localStorage.setItem(CHAPTER_PASS_KEY, "true");
      }
    } catch (error) {}

    return attemptRecord;
  }

  function gradeExam(options = {}) {
    if (finished) return;
    hideCorrectionCompletePanel();
    clearCorrectionTimers();

    if (!options.forced) {
      const firstMissing = firstUnansweredCard();
      if (firstMissing) {
        markUnansweredCards();
        examMessage.textContent = "Every required part must be filled before submitting.";
        firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    finished = true;
    stopTimer();

    let correct = 0;
    const cards = questionCards();

    cards.forEach(card => {
      const answer = answerForCard(card);
      const feedback = card.querySelector(".question-feedback");
      if (answer.correct) correct += 1;

      card.classList.remove("is-unanswered");
      card.classList.toggle("is-correct", answer.correct);
      card.classList.toggle("is-wrong", !answer.correct);
      card.classList.toggle("needs-correction", !answer.correct);
      setCardControls(card, !answer.correct);

      if (feedback) {
        feedback.textContent = answer.correct
          ? "Correct on first submit."
          : `Your answer: ${answer.display}. Try this one again for practice.`;
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
      : "Perfect first run. Chapter 2 is fully proven.";
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

  function showResult(result) {
    resultCard.classList.toggle("pass", result.passed);
    resultCard.classList.toggle("fail", !result.passed);
    resultTitle.textContent = result.passed ? "Prime Element Vision Proven" : "Prime Element Vision Needs Review";
    scoreRing.textContent = `${result.percent}%`;

    resultSummary.textContent = result.passed
      ? "You passed the Chapter 2 checkpoint. Your Prime Element Vision mastery result is saved on this device."
      : result.forced
        ? "Time expired before the test was complete. Your first score is locked. Correct the red questions for practice, then retake the test when you are ready."
        : "The Chapter 2 test needs 46 correct answers. Your first score is locked. Correct the red questions for practice, then retake the test.";

    resultStats.innerHTML = `
      <div><strong>${result.correct}/50</strong><span>correct</span></div>
      <div><strong>${result.errors}</strong><span>errors</span></div>
      <div><strong>${formatTime(result.usedSeconds)}</strong><span>time used</span></div>
      <div><strong>${positiveInteger(result.attempts, positiveInteger(result.attemptNumber, 1))}</strong><span>attempts</span></div>
    `;

    resultLayer.classList.remove("hidden");
  }

  function updateExponentPreviewForInput(input) {
    const card = input.closest(".question-card");
    const field = input.dataset.field;
    const preview = card?.querySelector(`[data-preview-for="${field}"]`);
    if (!preview) return;
    const counts = parseExponentExpression(input.value);
    if (!counts) {
      preview.textContent = input.value.trim() ? "Use form like 2^4 x 3^3 x 7." : "";
      return;
    }
    const html = VALID_EXP_BASES
      .filter(base => counts[base])
      .map(base => {
        const count = counts[base];
        return count > 1
          ? `<span class="base">${base}</span><sup>${count}</sup>`
          : `<span class="base">${base}</span>`;
      })
      .join(" x ");
    preview.innerHTML = html;
  }

  function updateExponentPreviews() {
    questionGrid.querySelectorAll(".exp-input-wide").forEach(updateExponentPreviewForInput);
  }

  function insertExponentCaret(button) {
    const card = button.closest(".question-card");
    const target = card?.querySelector(`[data-field="${button.dataset.targetField}"]`);
    if (!target || target.disabled) return;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    target.value = `${target.value.slice(0, start)}^${target.value.slice(end)}`;
    target.focus();
    target.setSelectionRange(start + 1, start + 1);
    updateExponentPreviewForInput(target);
  }

  function startExam() {
    hideCorrectionCompletePanel();
    clearCorrectionTimers();
    renderExam();
    startPanel.classList.add("hidden");
    examForm.classList.remove("hidden");
    startTimer();
    questionGrid.querySelector("input")?.focus();
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
      submitButton.textContent = "Submit Test";
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
    const expButton = event.target.closest("[data-exp-insert]");
    if (expButton) {
      insertExponentCaret(expButton);
      return;
    }
  });

  questionGrid?.addEventListener("input", event => {
    const input = event.target;
    if (!input.matches("input")) return;
    const card = input.closest(".question-card");
    card?.classList.remove("is-unanswered");

    if (input.classList.contains("exp-input-wide")) {
      updateExponentPreviewForInput(input);
    } else {
      input.value = input.value.replace(/[^\d]/g, "");
    }

    updateAnsweredCount();
    if (correctionMode) scheduleCorrectionCheck(card, 700);
  });

  questionGrid?.addEventListener("keydown", event => {
    if (event.key !== "Enter" || !event.target.matches("input")) return;
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

  if (!isTestReady()) {
    startExamButton.disabled = true;
    startExamButton.textContent = "Chapter 2 Test Locked";
    const message = startPanel?.querySelector("p");
    if (message) {
      message.textContent = "Complete the Chapter 2 trail through 2-4 before attempting the Prime Element Vision Test.";
    }
  }

  window.MathRidgeChapter2Test = {
    buildExamQuestions,
    parseExponentExpression,
    sameCountMap,
    reduceFraction,
    gradeExam,
    resetExam
  };
})();
