/* Math Ridge Trail 2-1a: Split Shelf Division. */
(function () {
  "use strict";

  const MANUAL_COMPLETE_KEY = "mathRidge_noteComplete_2_1a";
  const NEXT_NOTE_UNLOCK_KEY = "mathRidge_noteUnlocked_2_1";
  const NEXT_STAGE_UNLOCK_KEY = "mathRidge_stageUnlocked_2_1";
  const TOTAL_STEPS = 4;

  const problems = [
    { value: 132, group: 3, chunk: 120, distractors: [130, 100] },
    { value: 141, group: 3, chunk: 120, distractors: [140, 130] },
    { value: 56, group: 2, chunk: 40, distractors: [50, 30] },
    { value: 84, group: 3, chunk: 60, distractors: [80, 70] },
    { value: 165, group: 5, chunk: 150, distractors: [160, 140] },
    { value: 96, group: 4, chunk: 80, distractors: [90, 70] },
    { value: 126, group: 3, chunk: 120, distractors: [100, 90] },
    { value: 72, group: 2, chunk: 60, distractors: [70, 50] },
    { value: 135, group: 5, chunk: 100, distractors: [130, 120] },
    { value: 108, group: 3, chunk: 90, distractors: [100, 80] }
  ];

  let score = 0;
  let stage = 1;
  let runSteps = 0;
  let mistakes = 0;
  let current = null;
  let used = [];
  let chosenChunk = null;
  let finishedRound = false;
  let achievementShown = false;

  function shell() {
    return window.MathRidgePlay || {};
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function text(id, value) {
    const element = byId(id);
    if (element) element.textContent = value;
  }

  function show(id, visible = true) {
    byId(id)?.classList.toggle("hidden", !visible);
  }

  function lockStep(id) {
    const step = byId(id);
    if (!step) return;
    step.classList.add("is-step-locked");
    step.querySelectorAll("button, input").forEach(control => {
      control.disabled = true;
      control.setAttribute("aria-disabled", "true");
    });
  }

  function unlockStep(id) {
    const step = byId(id);
    if (!step) return;
    step.classList.remove("is-step-locked");
    step.querySelectorAll("button, input").forEach(control => {
      control.disabled = false;
      control.removeAttribute("aria-disabled");
    });
  }

  function cleanNumberInput(input) {
    if (!input) return "";
    input.value = String(input.value || "").replace(/\D/g, "").slice(0, 4);
    return input.value;
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function nextProblem() {
    if (used.length >= problems.length) used = [];
    const available = problems.filter(problem => !used.includes(problem));
    current = available[Math.floor(Math.random() * available.length)];
    used.push(current);
    current.leftover = current.value - current.chunk;
    current.chunkAnswer = current.chunk / current.group;
    current.leftoverAnswer = current.leftover / current.group;
    current.answer = current.chunkAnswer + current.leftoverAnswer;
    chosenChunk = null;
    finishedRound = false;
  }

  function progressPercent() {
    return Math.min(100, Math.round((runSteps / TOTAL_STEPS) * 100));
  }

  function updateBoard(message = "") {
    shell().updateShelf?.({
      score,
      stage,
      progressPercent: progressPercent(),
      message: message || (score ? "Keep splitting shelves into friendly chunks." : "Press START the Climb when ready."),
      reviveTurtle: true
    });
  }

  function markStep(message) {
    runSteps = Math.min(TOTAL_STEPS, runSteps + 1);
    updateBoard(message);
  }

  function markWrong(element, message) {
    mistakes += 1;
    runSteps = 0;
    element?.classList?.add("wrong");
    updateBoard(message || "Try again. Find the friendly split.");
    shell().playSfx?.("wrong");
  }

  function resetInputs() {
    ["chunkStep", "leftoverStep", "divideStep", "finalStep"].forEach(unlockStep);
    ["leftoverInput", "friendlyAnswerInput", "leftoverAnswerInput", "finalInput"].forEach(id => {
      const input = byId(id);
      if (input) {
        input.value = "";
        input.style.borderColor = "";
      }
    });
    ["chunkFeedback", "leftoverFeedback", "divideFeedback", "finalFeedback", "feedback"].forEach(id => text(id, ""));
    document.querySelectorAll(".choice-grid button").forEach(button => button.classList.remove("selected", "wrong"));
  }

  function renderProblem() {
    resetInputs();
    text("divisionDisplay", `${current.value} ÷ ${current.group}`);
    text("problemHint", `Split ${current.value} into a friendly chunk for groups of ${current.group}.`);
    show("chunkStep", true);
    show("leftoverStep", false);
    show("divideStep", false);
    show("finalStep", false);
    show("completeStep", false);

    const options = shuffle([current.chunk, ...current.distractors]);
    const choices = byId("chunkChoices");
    if (choices) {
      choices.innerHTML = options.map(value => `
        <button type="button" onclick="chooseFriendlyChunk(${value}, this)">
          <strong>${value}</strong>
          <span>${value} ÷ ${current.group}</span>
        </button>
      `).join("");
    }
  }

  function loadRound() {
    nextProblem();
    renderProblem();
    updateBoard("Choose the friendly chunk first.");
    shell().hideNextClimbButton?.({ force: true });
    shell().scrollToPremiumElement?.("playArea");
  }

  window.startClimbFromGate = function startClimbFromGate() {
    byId("climbStartGate")?.classList.add("hidden");
    byId("playArea")?.classList.remove("hidden");
    document.querySelector(".game")?.classList.add("climb-active");
    score = 0;
    stage = 1;
    runSteps = 0;
    mistakes = 0;
    achievementShown = false;
    used = [];
    shell().resetRaceTimer?.();
    shell().startClimbTimer?.();
    loadRound();
  };

  window.chooseFriendlyChunk = function chooseFriendlyChunk(value, button) {
    shell().startClimbTimer?.();
    document.querySelectorAll("#chunkChoices button").forEach(btn => btn.classList.remove("selected", "wrong"));
    if (value !== current.chunk) {
      markWrong(button, `${value} is not the friendly chunk. Look for a chunk that belongs to ${current.group}s.`);
      text("chunkFeedback", `Try again. ${current.chunk} works because ${current.chunk} ÷ ${current.group} = ${current.chunkAnswer}.`);
      return;
    }

    chosenChunk = value;
    button.classList.add("selected");
    text("chunkFeedback", `Correct. ${current.chunk} is friendly for groups of ${current.group}.`);
    text("splitPreview", `${current.value} = ${current.chunk} + ___`);
    lockStep("chunkStep");
    show("leftoverStep", true);
    markStep("Friendly chunk chosen. Now find the leftover shelf.");
    shell().scrollToPremiumElement?.("leftoverStep");
  };

  window.checkLeftover = function checkLeftover() {
    const input = byId("leftoverInput");
    const value = Number(cleanNumberInput(input));
    if (!input?.value) {
      text("leftoverFeedback", "Type the leftover shelf.");
      input?.focus();
      return;
    }

    if (value !== current.leftover) {
      input.style.borderColor = "#ef7777";
      markWrong(input, `Subtract: ${current.value} - ${current.chunk}.`);
      text("leftoverFeedback", "The leftover is what remains after the friendly chunk is removed.");
      return;
    }

    input.style.borderColor = "#6cc070";
    text("leftoverFeedback", `Correct. ${current.value} = ${current.chunk} + ${current.leftover}.`);
    text("dividePreview", `${current.chunk} ÷ ${current.group} = ___ and ${current.leftover} ÷ ${current.group} = ___`);
    text("friendlyDivideLabel", `${current.chunk} ÷ ${current.group}`);
    text("leftoverDivideLabel", `${current.leftover} ÷ ${current.group}`);
    lockStep("leftoverStep");
    show("divideStep", true);
    markStep("Leftover found. Now divide each chunk.");
  };

  window.checkChunkAnswers = function checkChunkAnswers() {
    const friendlyInput = byId("friendlyAnswerInput");
    const leftoverInput = byId("leftoverAnswerInput");
    const friendlyValue = Number(cleanNumberInput(friendlyInput));
    const leftoverValue = Number(cleanNumberInput(leftoverInput));

    if (!friendlyInput?.value || !leftoverInput?.value) {
      text("divideFeedback", "Fill both chunk answers.");
      (!friendlyInput?.value ? friendlyInput : leftoverInput)?.focus();
      return;
    }

    if (friendlyValue !== current.chunkAnswer || leftoverValue !== current.leftoverAnswer) {
      if (friendlyValue !== current.chunkAnswer) friendlyInput.style.borderColor = "#ef7777";
      if (leftoverValue !== current.leftoverAnswer) leftoverInput.style.borderColor = "#ef7777";
      markWrong(null, "One chunk count needs checking.");
      text("divideFeedback", `${current.chunk} ÷ ${current.group} = ${current.chunkAnswer}. ${current.leftover} ÷ ${current.group} = ${current.leftoverAnswer}.`);
      return;
    }

    friendlyInput.style.borderColor = "#6cc070";
    leftoverInput.style.borderColor = "#6cc070";
    text("divideFeedback", "Correct. Now add the group counts.");
    text("finalPreview", `${current.chunkAnswer} + ${current.leftoverAnswer} = ___`);
    lockStep("divideStep");
    show("finalStep", true);
    markStep("Both chunks divided. Add the group counts.");
  };

  window.checkFinalAnswer = function checkFinalAnswer() {
    if (finishedRound) {
      shell().finishCorrectClimb?.({ message: "This split is finished. Tap Next Climb to continue.", scroll: true });
      return;
    }

    const input = byId("finalInput");
    const value = Number(cleanNumberInput(input));
    if (!input?.value) {
      text("finalFeedback", "Type the final group count.");
      input?.focus();
      return;
    }

    if (value !== current.answer) {
      input.style.borderColor = "#ef7777";
      markWrong(input, `Add ${current.chunkAnswer} + ${current.leftoverAnswer}.`);
      text("finalFeedback", "The final answer is the two group counts added together.");
      return;
    }

    input.style.borderColor = "#6cc070";
    finishedRound = true;
    runSteps = TOTAL_STEPS;
    score = Math.min(10, score + (mistakes ? 0 : 1));
    text("finalFeedback", `Finished. ${current.value} ÷ ${current.group} = ${current.answer}.`);
    byId("completedFlow").innerHTML = `${current.value} = ${current.chunk} + ${current.leftover}<br>${current.chunk} ÷ ${current.group} = ${current.chunkAnswer}<br>${current.leftover} ÷ ${current.group} = ${current.leftoverAnswer}<br>${current.chunkAnswer} + ${current.leftoverAnswer} = ${current.answer}`;
    lockStep("finalStep");
    show("completeStep", true);

    if (score >= 10) {
      finishAchievement();
      return;
    }

    updateBoard(`${current.value} ÷ ${current.group} = ${current.answer}. Next Climb is ready.`);
    shell().finishCorrectClimb?.({ message: "Split Shelf solved. Next Climb is ready.", scroll: true });
  };

  window.nextClimb = function nextClimb() {
    stage += 1;
    runSteps = 0;
    mistakes = 0;
    shell().startNextClimbTimer?.();
    shell().hideNextClimbButton?.({ force: true });
    loadRound();
  };

  function finishAchievement() {
    if (achievementShown) return;
    achievementShown = true;
    try {
      localStorage.setItem("mathRidge_playComplete_2_1a", "true");
      localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
      localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
    } catch (error) {}
    shell().stopClimbTimer?.(true);
    shell().hideNextClimbButton?.({ force: true });
    showAchievementPopup();
  }

  window.showAchievementPopup = function showAchievementPopup() {
    const popup = byId("namePopup");
    if (popup) popup.style.display = "flex";
  };

  window.createCertificateFromName = function createCertificateFromName() {
    const name = byId("playerNameInput")?.value.trim() || "Math Ridge Champion";
    const date = new Date();
    const raceTime = shell().formatRaceTime?.(shell().getTotalRaceMs?.() || 0) || "";
    try {
      localStorage.setItem("mathRidge_cert_2_1a", JSON.stringify({
        completed: true,
        completedAt: date.toISOString(),
        displayDate: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        studentName: name,
        certificateTitle: "Split Shelf Division",
        stage: "2-1a",
        score,
        raceTime,
        timeDisplay: raceTime
      }));
      localStorage.setItem("mathRidge_playComplete_2_1a", "true");
      localStorage.setItem(NEXT_NOTE_UNLOCK_KEY, "true");
      localStorage.setItem(NEXT_STAGE_UNLOCK_KEY, "true");
    } catch (error) {}

    text("certName", name);
    text("certDate", date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    const race = byId("certRaceTime");
    if (race && raceTime) {
      race.hidden = false;
      race.textContent = `Completed time: ${raceTime}`;
    }
    byId("namePopup").style.display = "none";
    byId("certificatePopup").style.display = "flex";
    shell().playCertificateSfx?.();
  };

  window.closeCertificatePopup = function closeCertificatePopup() {
    const popup = byId("certificatePopup");
    if (popup) popup.style.display = "none";
  };

  window.saveCertificateImage = function saveCertificateImage() {
    const name = byId("certName")?.textContent || "Math Ridge Champion";
    shell().downloadOfficialCertificate?.({
      studentName: name,
      certificateTitle: "Split Shelf Division",
      bodyText: "for demonstrating division through friendly chunks, leftover shelves, and distributed group counts.",
      dateText: byId("certDate")?.textContent || "",
      fileName: "math-ridge-split-shelf-division-certificate.png"
    });
  };

  window.showLadderPopup = function showLadderPopup() {
    const popup = byId("ladderPopup");
    if (popup) popup.style.display = "flex";
    window.loadLadderRecords?.(false);
  };

  window.closeLadderPopup = function closeLadderPopup() {
    const popup = byId("ladderPopup");
    if (popup) popup.style.display = "none";
  };

  window.loadLadderRecords = function loadLadderRecords() {
    shell().loadLadderRecords?.(false);
  };

  document.addEventListener("DOMContentLoaded", () => {
    try {
      if (localStorage.getItem(MANUAL_COMPLETE_KEY) !== "true") {
        window.location.replace("note2-1a.html?trialLocked=manual");
        return;
      }
    } catch (error) {}
    updateBoard();
  });
})();
