/*
  Math Ridge Note Engine
  Shared note-page behavior.
  Supports standard answer boxes, prime-piece answers, fraction-notepad answers, and signed-number notepad answers.
*/

(function () {
  "use strict";

  function getNoteConfig() {
    if (window.MathRidgeNote) return window.MathRidgeNote;

    const noteId = document.body?.dataset?.noteId;
    const allNotes = window.MathRidgeNotes || {};

    if (!noteId) {
      console.warn("Math Ridge Note: Missing body data-note-id.");
      return null;
    }

    if (!allNotes[noteId]) {
      console.warn("Math Ridge Note: No setup found for note id:", noteId);
      return null;
    }

    window.MathRidgeNote = {
      noteId,
      ...allNotes[noteId]
    };

    return window.MathRidgeNote;
  }

  const note = getNoteConfig();
  if (!note) return;

  const state = {
    solved: new Set()
  };
  const CONFIRM_NAV_DELAY_MS = 780;

  const storageKey = "mathRidge_noteComplete_" + note.noteId;
  const oldVisitedKey = "mathRidge_noteVisited_" + note.noteId;
  const ROOT_GATE_PASS_KEYS = ["mathRidge_rootGatePassed_chapter_1", "mathRidge_testPassed_chapter_1"];

  function noteUnlockedKey(id) {
    return "mathRidge_noteUnlocked_" + id;
  }

  function notePlayCompleteKey(id) {
    return "mathRidge_playComplete_" + id;
  }

  function noteCertificateKey(id) {
    return "mathRidge_cert_" + id;
  }

  function readNoteCertificate(id) {
    try {
      return JSON.parse(localStorage.getItem(noteCertificateKey(id)));
    } catch (error) {
      return null;
    }
  }

  function hasRootGatePass() {
    try {
      return ROOT_GATE_PASS_KEYS.some(key => localStorage.getItem(key) === "true");
    } catch (error) {
      return false;
    }
  }

  function hasNoteAccess(id) {
    try {
      const cert = readNoteCertificate(id);
      if (id === "2_1a" && hasRootGatePass()) return true;
      return localStorage.getItem(noteUnlockedKey(id)) === "true" ||
        localStorage.getItem("mathRidge_noteComplete_" + id) === "true" ||
        localStorage.getItem(notePlayCompleteKey(id)) === "true" ||
        Boolean(cert && cert.completed);
    } catch (error) {
      return false;
    }
  }

  if (!hasNoteAccess(note.noteId)) {
    window.location.replace(note.noteId === "1_1" ? "prologue.html" : "index.html?view=quest");
    return;
  }

  function warmNavigationTarget(url) {
    if (!url || url === "#") return;
    try { fetch(url, { cache: "force-cache" }).catch(() => {}); }
    catch (error) {}
  }

  function navigateAfterConfirm(url) {
    if (!url || url === "#") return;
    warmNavigationTarget(url);
    window.setTimeout(() => {
      window.location.href = url;
    }, CONFIRM_NAV_DELAY_MS);
  }

  function normalizeAnswer(value) {
    return String(value)
      .trim()
      .replace(/\s+/g, "")
      .replace(/−/g, "-")
      .replace(/÷/g, "/")
      .replace(/^\+/, "");
  }

  function normalizePrimePieces(value) {
    return String(value)
      .toLowerCase()
      .replaceAll("×", "x")
      .replace(/[()]/g, " ")
      .split(/[^0-9]+/)
      .filter(Boolean)
      .map(Number)
      .filter(Number.isInteger)
      .sort((a, b) => a - b);
  }

  function sameNumberList(student, expected) {
    const sortedExpected = [...expected].sort((a, b) => a - b);
    return student.length === sortedExpected.length && student.every((value, index) => value === sortedExpected[index]);
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function parseFraction(value) {
    const raw = String(value).trim().replace(/−/g, "-").replace(/\s+/g, "");
    if (!raw) return null;

    if (/^-?\d+$/.test(raw)) {
      return { n: Number(raw), d: 1 };
    }

    const match = raw.match(/^(-?\d+)\/(-?\d+)$/);
    if (!match) return null;

    let n = Number(match[1]);
    let d = Number(match[2]);

    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;

    if (d < 0) {
      n *= -1;
      d *= -1;
    }

    return { n, d };
  }

  function simplest(frac) {
    const g = gcd(frac.n, frac.d);
    return { n: frac.n / g, d: frac.d / g };
  }

  function sameFractionValue(a, b) {
    return a && b && a.n * b.d === b.n * a.d;
  }

  function sameExactFraction(a, b) {
    return a && b && a.n === b.n && a.d === b.d;
  }

  function checkFractionStatus(userValue, answer) {
    const given = parseFraction(userValue);
    const target = parseFraction(answer);

    if (!given || !target) return "wrong";

    const reducedGiven = simplest(given);

    if (sameExactFraction(given, target) && sameExactFraction(reducedGiven, target)) {
      return "correct";
    }

    if (sameFractionValue(given, target)) {
      return "reduce";
    }

    return "wrong";
  }

  function isCorrect(userValue, problem) {
    if (problem.answerType === "primePieces") {
      return sameNumberList(normalizePrimePieces(userValue), problem.answer);
    }

    if (problem.answerType === "simplestFraction") {
      return checkFractionStatus(userValue, problem.answer) === "correct";
    }

    return normalizeAnswer(userValue) === normalizeAnswer(problem.answer);
  }

  function getEl(id) {
    return document.getElementById(id);
  }

  function isFractionLayout(problem) {
    return problem && (
      problem.inputLayout === "fraction" ||
      problem.answerLayout === "fraction" ||
      problem.inputMode === "fraction" ||
      problem.inputMode === "fractionNotepad" ||
      problem.inputMode === "fractionPad"
    );
  }

  function isSignedNumberLayout(problem) {
    return problem && (
      problem.inputLayout === "signedNumber" ||
      problem.answerLayout === "signedNumber" ||
      problem.inputMode === "signedNumber" ||
      problem.answerType === "signedNumber"
    );
  }

  function isPrimePiecesLayout(problem) {
    return problem && (
      problem.inputLayout === "primePieces" ||
      problem.answerLayout === "primePieces" ||
      problem.inputMode === "primePieces" ||
      problem.inputMode === "primePiecesNotepad"
    );
  }

  function fractionParts(answer) {
    const frac = parseFraction(answer);
    if (!frac) return { n: "", d: "" };
    return { n: String(frac.n), d: String(frac.d) };
  }

  function signedParts(answer) {
    const raw = String(answer ?? "")
      .trim()
      .replace(/−/g, "-")
      .replace(/\s+/g, "");

    if (!raw) return { sign: "", size: "" };

    const sign = raw.startsWith("-") ? "-" : "+";
    const size = raw.replace(/^[+-]/, "").replace(/[^0-9]/g, "");
    return { sign, size };
  }

  function safeId(index, part) {
    return `answer${index}${part}`;
  }

  function syncFractionHidden(index) {
    const top = getEl(safeId(index, "Top"));
    const bottom = getEl(safeId(index, "Bottom"));
    const hidden = getEl("answer" + index);
    if (!top || !bottom || !hidden) return "";

    const value = `${top.value.trim()}/${bottom.value.trim()}`;
    hidden.value = value;
    return value;
  }

  function syncSignedHidden(index) {
    const plus = getEl(safeId(index, "Plus"));
    const minus = getEl(safeId(index, "Minus"));
    const sizeInput = getEl(safeId(index, "Size"));
    const hidden = getEl("answer" + index);
    if (!sizeInput || !hidden) return "";

    const sign = plus && plus.classList.contains("selected")
      ? "+"
      : (minus && minus.classList.contains("selected") ? "-" : "");
    const size = String(sizeInput.value || "").replace(/[^0-9]/g, "");
    sizeInput.value = size;

    const value = sign && size ? `${sign}${size}` : "";
    hidden.value = value;
    return value;
  }

  function primePieceCount(problem) {
    if (Number.isInteger(problem?.pieceCount) && problem.pieceCount > 0) return problem.pieceCount;
    if (Array.isArray(problem?.answer)) return problem.answer.length;
    return 4;
  }

  function syncPrimePiecesHidden(index, problem) {
    const hidden = getEl("answer" + index);
    if (!hidden) return "";

    const count = primePieceCount(problem);
    const pieces = [];
    for (let pieceIndex = 0; pieceIndex < count; pieceIndex++) {
      const input = getEl(safeId(index, "Piece" + pieceIndex));
      if (!input) continue;
      input.value = String(input.value || "").replace(/[^0-9]/g, "");
      if (input.value.trim()) pieces.push(input.value.trim());
    }

    const value = pieces.join(" ");
    hidden.value = value;
    return value;
  }

  function getStudentAnswer(index, problem) {
    if (isFractionLayout(problem)) return syncFractionHidden(index);
    if (isSignedNumberLayout(problem)) return syncSignedHidden(index);
    if (isPrimePiecesLayout(problem)) return syncPrimePiecesHidden(index, problem);
    const input = getEl("answer" + index);
    return input ? input.value : "";
  }

  function setStudentAnswer(index, problem, value) {
    if (isFractionLayout(problem)) {
      const top = getEl(safeId(index, "Top"));
      const bottom = getEl(safeId(index, "Bottom"));
      const hidden = getEl("answer" + index);
      const parts = fractionParts(value);
      if (top) top.value = parts.n;
      if (bottom) bottom.value = parts.d;
      if (hidden) hidden.value = `${parts.n}/${parts.d}`;
      return;
    }

    if (isSignedNumberLayout(problem)) {
      const plus = getEl(safeId(index, "Plus"));
      const minus = getEl(safeId(index, "Minus"));
      const sizeInput = getEl(safeId(index, "Size"));
      const hidden = getEl("answer" + index);
      const parts = signedParts(value);
      if (plus) {
        plus.classList.toggle("selected", parts.sign === "+");
        plus.setAttribute("aria-pressed", parts.sign === "+" ? "true" : "false");
      }
      if (minus) {
        minus.classList.toggle("selected", parts.sign === "-");
        minus.setAttribute("aria-pressed", parts.sign === "-" ? "true" : "false");
      }
      if (sizeInput) sizeInput.value = parts.size;
      if (hidden) hidden.value = parts.sign && parts.size ? `${parts.sign}${parts.size}` : "";
      return;
    }

    if (isPrimePiecesLayout(problem)) {
      const values = Array.isArray(value) ? value : normalizePrimePieces(value);
      const hidden = getEl("answer" + index);
      const count = primePieceCount(problem);
      for (let pieceIndex = 0; pieceIndex < count; pieceIndex++) {
        const input = getEl(safeId(index, "Piece" + pieceIndex));
        if (input) input.value = values[pieceIndex] == null ? "" : String(values[pieceIndex]);
      }
      if (hidden) hidden.value = values.join(" ");
      return;
    }

    const input = getEl("answer" + index);
    if (input) input.value = formatAnswer(value);
  }

  function lockStudentAnswer(index, problem) {
    if (isFractionLayout(problem)) {
      [safeId(index, "Top"), safeId(index, "Bottom")].forEach((id) => {
        const input = getEl(id);
        if (input) input.setAttribute("readonly", "readonly");
      });
      return;
    }

    if (isSignedNumberLayout(problem)) {
      [safeId(index, "Plus"), safeId(index, "Minus")].forEach((id) => {
        const button = getEl(id);
        if (button) button.setAttribute("disabled", "disabled");
      });
      const sizeInput = getEl(safeId(index, "Size"));
      if (sizeInput) sizeInput.setAttribute("readonly", "readonly");
      return;
    }

    if (isPrimePiecesLayout(problem)) {
      const count = primePieceCount(problem);
      for (let pieceIndex = 0; pieceIndex < count; pieceIndex++) {
        const input = getEl(safeId(index, "Piece" + pieceIndex));
        if (input) input.setAttribute("readonly", "readonly");
      }
      return;
    }

    const input = getEl("answer" + index);
    if (input) input.setAttribute("readonly", "readonly");
  }

  function focusStudentAnswer(index, problem) {
    if (isFractionLayout(problem)) {
      const top = getEl(safeId(index, "Top"));
      const bottom = getEl(safeId(index, "Bottom"));
      const target = top && !top.value.trim() ? top : bottom || top;
      if (target) {
        target.focus();
        target.select();
      }
      return;
    }

    if (isSignedNumberLayout(problem)) {
      const sizeInput = getEl(safeId(index, "Size"));
      if (sizeInput) {
        sizeInput.focus();
        sizeInput.select();
      }
      return;
    }

    if (isPrimePiecesLayout(problem)) {
      const count = primePieceCount(problem);
      let target = null;
      for (let pieceIndex = 0; pieceIndex < count; pieceIndex++) {
        const input = getEl(safeId(index, "Piece" + pieceIndex));
        if (input && !input.value.trim()) {
          target = input;
          break;
        }
        if (!target && input) target = input;
      }
      if (target) {
        target.focus();
        target.select();
      }
      return;
    }

    const input = getEl("answer" + index);
    if (input) {
      input.focus();
      input.select();
    }
  }

  function setButtonLabels() {
    const label = note.startLabel || "Start Climb";

    const topClimbBtn = getEl("topClimbBtn");
    const dockClimbBtn = getEl("dockClimbBtn");

    if (topClimbBtn) topClimbBtn.textContent = label;
    if (dockClimbBtn) dockClimbBtn.textContent = label;

    const unlockTitle = document.querySelector(".unlock-dock strong");
    if (unlockTitle && note.readyTitle) unlockTitle.textContent = note.readyTitle;

    const modalTitle = getEl("modalTitle");
    if (modalTitle && note.modalTitle) modalTitle.textContent = note.modalTitle;

    const modalText = document.querySelector("#unlockModal .modal-card p");
    if (modalText && note.modalText) modalText.textContent = note.modalText;
  }

  function renderStandardAnswer(problem, index) {
    const inputMode = problem.inputMode || "numeric";
    const placeholder = problem.placeholder || "?";
    const label = problem.inputLabel || "Answer";

    return `
      <div class="problem-row">
        <label for="answer${index}">${label}</label>
        <input
          id="answer${index}"
          class="answer-input"
          type="text"
          inputmode="${inputMode}"
          autocomplete="off"
          placeholder="${placeholder}"
          aria-label="Answer for practice ${index + 1}"
          onkeydown="handlePracticeEnter(event, ${index})"
        />
        <button class="check-one" type="button" onclick="checkAnswer(${index})">Check</button>
        <span class="feedback" id="feedback${index}" aria-live="polite"></span>
      </div>
    `;
  }

  function renderFractionAnswer(problem, index) {
    const label = problem.inputLabel || "Simplest fraction";
    const topLabel = problem.topLabel || "top";
    const bottomLabel = problem.bottomLabel || "bottom";

    return `
      <div class="problem-row problem-row-fraction">
        <span class="fraction-answer-label" id="answerLabel${index}">${label}</span>
        <span class="fraction-notepad" role="group" aria-labelledby="answerLabel${index}">
          <input
            id="answer${index}Top"
            class="answer-input fraction-piece fraction-top-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="${problem.topPlaceholder || "top"}"
            aria-label="${topLabel} for practice ${index + 1}"
            oninput="handleFractionInput(event, ${index}, 'Top')"
            onkeydown="handleFractionKey(event, ${index}, 'Top')"
          />
          <span class="fraction-slash" aria-hidden="true">/</span>
          <input
            id="answer${index}Bottom"
            class="answer-input fraction-piece fraction-bottom-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="${problem.bottomPlaceholder || "bottom"}"
            aria-label="${bottomLabel} for practice ${index + 1}"
            oninput="handleFractionInput(event, ${index}, 'Bottom')"
            onkeydown="handleFractionKey(event, ${index}, 'Bottom')"
          />
          <span class="fraction-notepad-caption">top shelf / bottom shelf</span>
        </span>
        <input id="answer${index}" class="answer-hidden-value" type="text" tabindex="-1" aria-hidden="true" />
        <button class="check-one" type="button" onclick="checkAnswer(${index})">Check</button>
        <span class="feedback" id="feedback${index}" aria-live="polite"></span>
      </div>
    `;
  }

  function renderSignedNumberAnswer(problem, index) {
    const label = problem.inputLabel || "Build the final answer";
    const signLabel = problem.signLabel || "outside sign";
    const sizeLabel = problem.sizeLabel || "answer size";

    return `
      <div class="problem-row problem-row-signed">
        <span class="signed-answer-label" id="answerLabel${index}">${label}</span>
        <span class="signed-notepad" role="group" aria-labelledby="answerLabel${index}">
          <span class="signed-choice-row" aria-label="${signLabel}">
            <button
              id="answer${index}Plus"
              class="signed-sign-btn signed-plus"
              type="button"
              aria-pressed="false"
              onclick="chooseSignedAnswerSign(${index}, '+')"
            >+</button>
            <button
              id="answer${index}Minus"
              class="signed-sign-btn signed-minus"
              type="button"
              aria-pressed="false"
              onclick="chooseSignedAnswerSign(${index}, '-')"
            >−</button>
          </span>
          <input
            id="answer${index}Size"
            class="answer-input signed-size-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="${problem.sizePlaceholder || "size"}"
            aria-label="${sizeLabel} for practice ${index + 1}"
            oninput="handleSignedSizeInput(event, ${index})"
            onkeydown="handleSignedKey(event, ${index})"
          />
          <span class="signed-notepad-caption">outside sign + inside size</span>
        </span>
        <input id="answer${index}" class="answer-hidden-value" type="text" tabindex="-1" aria-hidden="true" />
        <button class="check-one" type="button" onclick="checkAnswer(${index})">Check</button>
        <span class="feedback" id="feedback${index}" aria-live="polite"></span>
      </div>
    `;
  }

  function renderPrimePiecesAnswer(problem, index) {
    const label = problem.inputLabel || "Prime pieces";
    const count = primePieceCount(problem);
    const pieces = Array.from({ length: count }, (_, pieceIndex) => `
          <input
            id="answer${index}Piece${pieceIndex}"
            class="prime-piece-cell"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="?"
            aria-label="Prime piece ${pieceIndex + 1} for practice ${index + 1}"
            oninput="handlePrimePieceInput(event, ${index}, ${pieceIndex})"
            onkeydown="handlePrimePieceKey(event, ${index}, ${pieceIndex})"
          />${pieceIndex < count - 1 ? '<span class="prime-times" aria-hidden="true">×</span>' : ''}
    `).join("");

    return `
      <div class="problem-row problem-row-prime">
        <span class="prime-pieces-answer-label" id="answerLabel${index}">${label}</span>
        <span class="prime-pieces-notepad" role="group" aria-labelledby="answerLabel${index}">
          ${pieces}
          <span class="prime-notepad-caption">one prime piece per box</span>
        </span>
        <input id="answer${index}" class="answer-hidden-value" type="text" tabindex="-1" aria-hidden="true" />
        <button class="check-one" type="button" onclick="checkAnswer(${index})">Check</button>
        <span class="feedback" id="feedback${index}" aria-live="polite"></span>
      </div>
    `;
  }

  function renderPractice() {
    const list = getEl("practiceList");
    if (!list || !Array.isArray(note.problems)) return;

    list.innerHTML = note.problems.map((problem, index) => {
      const answerRow = isPrimePiecesLayout(problem)
        ? renderPrimePiecesAnswer(problem, index)
        : (isFractionLayout(problem)
          ? renderFractionAnswer(problem, index)
          : (isSignedNumberLayout(problem)
            ? renderSignedNumberAnswer(problem, index)
            : renderStandardAnswer(problem, index)));

      return `
        <article class="problem-card" id="problem${index}">
          <div class="problem-head">
            <div class="problem-title">${problem.prompt}</div>
            <button class="pill-btn" type="button" onclick="showHint(${index})">Show Hint</button>
          </div>
          ${answerRow}
          <div class="hint" id="hint${index}">${problem.hint}</div>
        </article>
      `;
    }).join("");
  }

  function formatAnswer(answer) {
    if (Array.isArray(answer)) return answer.join(" × ");
    return String(answer);
  }

  function updateProgress() {
    const total = note.problems?.length || 0;

    for (let i = 0; i < total; i++) {
      const bar = getEl("bar" + i);
      if (bar) bar.classList.toggle("done", state.solved.has(i));
    }

    const complete = total > 0 && state.solved.size >= total;
    const topClimbBtn = getEl("topClimbBtn");
    const dockClimbBtn = getEl("dockClimbBtn");
    const unlockText = getEl("unlockText");

    [topClimbBtn, dockClimbBtn].forEach((btn) => {
      if (!btn) return;
      btn.disabled = !complete;
      btn.classList.toggle("ready", complete);
    });

    if (unlockText) {
      unlockText.textContent = complete
        ? (note.unlockedText || "Unlocked! You may begin the climb.")
        : (note.lockedText || "Locked until all practice checks are correct.");
    }

    if (complete) {
      localStorage.setItem(storageKey, "true");
      localStorage.removeItem(oldVisitedKey);
    }

    return complete;
  }

  function restoreIfComplete() {
    if (localStorage.getItem(storageKey) !== "true") return;

    note.problems.forEach((problem, index) => {
      state.solved.add(index);

      const card = getEl("problem" + index);
      const feedback = getEl("feedback" + index);

      setStudentAnswer(index, problem, problem.answer);
      lockStudentAnswer(index, problem);
      if (card) card.classList.add("correct");
      if (feedback) feedback.textContent = "Correct ✓";
    });

    updateProgress();
  }

  function showTrialLockedReturn() {
    let params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (error) {
      return;
    }

    if (params.get("trialLocked") !== "manual") return;

    const unlockText = getEl("unlockText");
    if (unlockText) {
      unlockText.textContent = note.lockedText || "Complete the manual checks before beginning the trial.";
    }

    const dock = document.querySelector(".unlock-dock");
    if (dock) {
      dock.classList.add("manual-required");
      setTimeout(() => dock.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
    }
  }

  window.showHint = function showHint(index) {
    const hint = getEl("hint" + index);
    if (hint) hint.classList.add("show");
  };

  window.handleFractionInput = function handleFractionInput(event, index, part) {
    const input = event.target;
    const raw = input.value || "";
    const pastedFraction = raw.match(/(-?\d+)\s*\/\s*(-?\d+)/);

    if (pastedFraction) {
      const top = getEl(safeId(index, "Top"));
      const bottom = getEl(safeId(index, "Bottom"));
      if (top) top.value = pastedFraction[1].replace(/[^0-9]/g, "");
      if (bottom) bottom.value = pastedFraction[2].replace(/[^0-9]/g, "");
      syncFractionHidden(index);
      if (bottom) bottom.focus();
      return;
    }

    input.value = raw.replace(/[^0-9]/g, "");
    syncFractionHidden(index);
  };

  window.handleFractionKey = function handleFractionKey(event, index, part) {
    if (event.key === "/" || event.key === "ArrowRight") {
      if (part === "Top") {
        event.preventDefault();
        const bottom = getEl(safeId(index, "Bottom"));
        if (bottom) bottom.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" && part === "Bottom") {
      event.preventDefault();
      const top = getEl(safeId(index, "Top"));
      if (top) top.focus();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (part === "Top") {
        const bottom = getEl(safeId(index, "Bottom"));
        if (bottom && !bottom.value.trim()) {
          bottom.focus();
          return;
        }
      }
      window.checkAnswer(index);
    }
  };

  window.chooseSignedAnswerSign = function chooseSignedAnswerSign(index, sign) {
    const plus = getEl(safeId(index, "Plus"));
    const minus = getEl(safeId(index, "Minus"));
    const sizeInput = getEl(safeId(index, "Size"));

    if ((plus && plus.disabled) || (minus && minus.disabled)) return;

    if (plus) {
      plus.classList.toggle("selected", sign === "+");
      plus.setAttribute("aria-pressed", sign === "+" ? "true" : "false");
    }
    if (minus) {
      minus.classList.toggle("selected", sign === "-");
      minus.setAttribute("aria-pressed", sign === "-" ? "true" : "false");
    }

    syncSignedHidden(index);
    if (sizeInput && !sizeInput.readOnly) sizeInput.focus();
  };

  window.handleSignedSizeInput = function handleSignedSizeInput(event, index) {
    const input = event.target;
    const raw = input.value || "";
    const signMatch = raw.match(/[+\-−]/);

    if (signMatch) {
      window.chooseSignedAnswerSign(index, signMatch[0] === "+" ? "+" : "-");
    }

    input.value = raw.replace(/[^0-9]/g, "");
    syncSignedHidden(index);
  };

  window.handleSignedKey = function handleSignedKey(event, index) {
    if (event.key === "+") {
      event.preventDefault();
      window.chooseSignedAnswerSign(index, "+");
      return;
    }

    if (event.key === "-" || event.key === "−") {
      event.preventDefault();
      window.chooseSignedAnswerSign(index, "-");
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      window.checkAnswer(index);
    }
  };

  window.handlePrimePieceInput = function handlePrimePieceInput(event, index, pieceIndex) {
    const input = event.target;
    const problem = note.problems[index];
    const count = primePieceCount(problem);
    const raw = String(input.value || "");

    const distributed = normalizePrimePieces(raw);
    if (distributed.length > 1 || /^\d{2,}$/.test(raw)) {
      const pieces = distributed.length > 1 ? distributed.map(String) : raw.split("");
      for (let offset = 0; offset < pieces.length && pieceIndex + offset < count; offset++) {
        const target = getEl(safeId(index, "Piece" + (pieceIndex + offset)));
        if (target) target.value = String(pieces[offset]).replace(/[^0-9]/g, "").slice(0, 2);
      }
      syncPrimePiecesHidden(index, problem);
      const nextIndex = Math.min(count - 1, pieceIndex + pieces.length);
      const next = getEl(safeId(index, "Piece" + nextIndex));
      if (next) {
        next.focus();
        next.select();
      }
      return;
    }

    input.value = raw.replace(/[^0-9]/g, "").slice(0, 2);
    syncPrimePiecesHidden(index, problem);

    if (input.value.length >= 1 && pieceIndex < count - 1 && /^[2357]$/.test(input.value)) {
      const next = getEl(safeId(index, "Piece" + (pieceIndex + 1)));
      if (next && !next.value.trim()) next.focus();
    }
  };

  window.handlePrimePieceKey = function handlePrimePieceKey(event, index, pieceIndex) {
    const problem = note.problems[index];
    const count = primePieceCount(problem);

    if ([" ", "x", "X", "×", "*", ",", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      const next = getEl(safeId(index, "Piece" + Math.min(count - 1, pieceIndex + 1)));
      if (next) {
        next.focus();
        next.select();
      }
      return;
    }

    if ((event.key === "Backspace" || event.key === "ArrowLeft") && !event.target.value && pieceIndex > 0) {
      event.preventDefault();
      const previous = getEl(safeId(index, "Piece" + (pieceIndex - 1)));
      if (previous) {
        previous.focus();
        previous.select();
      }
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      window.checkAnswer(index);
    }
  };

  window.checkAnswer = function checkAnswer(index) {
    const problem = note.problems[index];
    const card = getEl("problem" + index);
    const feedback = getEl("feedback" + index);
    const hint = getEl("hint" + index);

    if (!problem || !card || !feedback) return;

    const userValue = getStudentAnswer(index, problem);

    if (isCorrect(userValue, problem)) {
      state.solved.add(index);
      card.classList.add("correct");
      card.classList.remove("wrong");
      feedback.textContent = "Correct ✓";
      lockStudentAnswer(index, problem);
      if (hint) hint.classList.remove("show");

      const completeNow = updateProgress();
      if (completeNow) {
        const modal = getEl("unlockModal");
        if (modal && !modal.dataset.shown) {
          modal.dataset.shown = "true";
          setTimeout(() => modal.classList.add("show"), 250);
        }
      }
    } else {
      state.solved.delete(index);
      card.classList.add("wrong");
      card.classList.remove("correct");

      if (problem.answerType === "primePieces" && !normalizePrimePieces(userValue).length) {
        feedback.textContent = "Type the prime pieces";
      } else if (problem.answerType === "simplestFraction" && checkFractionStatus(userValue, problem.answer) === "reduce") {
        feedback.textContent = "Reduce more";
      } else if (isFractionLayout(problem)) {
        feedback.textContent = "Check both shelves";
      } else if (isSignedNumberLayout(problem)) {
        feedback.textContent = userValue ? "Check the outside sign and size" : "Choose a sign and type the size";
      } else {
        feedback.textContent = "Try again";
      }

      if (hint) hint.classList.add("show");
      focusStudentAnswer(index, problem);
      updateProgress();
    }
  };

  window.handlePracticeEnter = function handlePracticeEnter(event, index) {
    if (event.key === "Enter") {
      event.preventDefault();
      window.checkAnswer(index);
    }
  };

  window.closeModal = function closeModal() {
    const modal = getEl("unlockModal");
    if (modal) modal.classList.remove("show");
  };

  window.goToPlay = function goToPlay() {
    if (!note.playLink) return;
    const suppressSound = Date.now() < Number(window.__mathRidgeSuppressNextGoToPlaySoundUntil || 0);
    if (!suppressSound) window.MathRidgeMobileConfirm?.play?.("secondTap");
    window.__mathRidgeSuppressNextGoToPlaySoundUntil = 0;
    navigateAfterConfirm(note.playLink);
  };

  document.addEventListener("DOMContentLoaded", function () {
    setButtonLabels();
    renderPractice();
    restoreIfComplete();
    updateProgress();
    showTrialLockedReturn();
  });
})();
