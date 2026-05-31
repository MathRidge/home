/* index.js — Math Ridge Journey Hub local logic.
   Shared mobile drawer/navigation shell comes from math-ridge-shell.js. */

const lessons = [
  { id: "1_1", section: "1-1", tag: "Terms", title: "Terms", description: "Positive and negative terms. Addition and subtraction as term behavior.", noteFile: "note1.html", playFile: "play1.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "1_2", section: "1-2", tag: "Teams", title: "Team Terms", description: "Group many terms into two teams before combining.", noteFile: "note2.html", playFile: "play2.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "1_3", section: "1-3", tag: "Signs", title: "Sign Simplify", description: "Many signs simplify into one final sign behavior.", noteFile: "note3.html", playFile: "play3.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "1_4", section: "1-4", tag: "Chunking", title: "Chunking", description: "Multiplication, grouping, and distribution without negative signs yet.", noteFile: "note4.html", playFile: "play4.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "2_1", section: "2-1", tag: "Shelves", title: "Fraction Shelves", description: "Top shelf and bottom shelf. Equal fractions and reduction.", noteFile: "note5.html", playFile: "play5.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." },
  { id: "2_2", section: "2-2", tag: "Prime", title: "Prime Pieces", description: "Break values into 2, 3, 5, and 7 quickly.", noteFile: "note6.html", playFile: "play6.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." },
  { id: "2_3", section: "2-3", tag: "Fractions", title: "Fraction Products", description: "Use prime pieces across top and bottom shelves.", noteFile: "note7.html", playFile: "play7.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." },
  { id: "2_4", section: "2-4", tag: "Exponents", title: "Exponential Count", description: "Repeated prime pieces become counted pieces.", noteFile: "note8.html", playFile: "play8.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." }
];

const certificateList = lessons.map(({ id, section, title, playFile }) => ({ id, section, title, playFile }));

const stageCardThemes = {
  "1_1": "stage-1-1-trail-start",
  "1_2": "stage-1-2-mountain-peak",
  "1_3": "stage-1-3-mountain-trail",
  "1_4": "stage-1-4-mountain-cabin",
  "2_1": "stage-2-1-mountain-library",
  "2_2": "stage-2-2-ancient-tree",
  "2_3": "stage-2-3-math-workstation",
  "2_4": "stage-2-4-exponential-bloom"
};

function stageImageSlug(id) {
  return stageCardThemes[id] || "";
}

function stageImagePath(id) {
  const slug = stageImageSlug(id);
  return slug ? `assets/images/stages/${slug}.webp` : "";
}

function stageImagePrimary(id) {
  return stageImagePath(id);
}

function stageImageBackgroundValue(id) {
  const primary = stageImagePath(id);
  return primary ? `url('${primary}')` : "";
}

function handleStageImageFallback(img) {
  const card = img?.closest?.(".node-card");
  if (card) card.classList.add("stage-image-missing");
  if (img) img.remove();
}

const chapterTests = [
  {
    id: "chapter_1",
    chapter: "Chapter 1 Test",
    range: "Covers 1-1 to 1-4",
    title: "Term Vision Checkpoint",
    image: "assets/images/test-results/chapter-1-test-result.svg",
    storageKeys: ["mathRidge_testResult_chapter_1", "mathRidge_testResult_chapter1"],
    dataKey: "mathRidge_testResult_chapter_1_data",
    attemptsKey: "mathRidge_testAttempts_chapter_1",
    historyKey: "mathRidge_testAttemptHistory_chapter_1",
    note: "Pass the Root Gate Exam to open Chapter 2."
  },
  {
    id: "chapter_2",
    chapter: "Chapter 2 Test",
    range: "Covers 2-1 to 2-4",
    title: "Prime Element Vision Checkpoint",
    image: "assets/images/test-results/chapter-2-test-result.svg",
    storageKeys: ["mathRidge_testResult_chapter_2", "mathRidge_testResult_chapter2"],
    dataKey: "mathRidge_testResult_chapter_2_data",
    attemptsKey: "mathRidge_testAttempts_chapter_2",
    historyKey: "mathRidge_testAttemptHistory_chapter_2",
    note: "Use this result card after the Chapter 2 test is built."
  }
];

function storageKeyNote(id) { return `mathRidge_noteComplete_${id}`; }
function storageKeyNoteUnlocked(id) { return `mathRidge_noteUnlocked_${id}`; }
function storageKeyPlayComplete(id) { return `mathRidge_playComplete_${id}`; }
function storageKeyCert(id) { return `mathRidge_cert_${id}`; }

const TRAIL_STATE_KEY = "mathRidge_trail_state_v1";
const STAGE_REVEAL_HINT_KEY = "mathRidge_stageRevealHintSeen_v1";
const PLAYER_PROFILE_KEY = "mathRidge_playerProfile_v1";
const PROLOGUE_SEEN_KEY = "mathRidge_prologueSeen_v1";
const STORY_COMPLETE_1_1_KEY = "mathRidge_storyComplete_1_1";
const TERM_MANUAL_UNLOCK_KEY = storageKeyNoteUnlocked("1_1");
const ROOT_GATE_UNLOCK_KEY = "mathRidge_rootGateUnlocked_chapter_1";
const ROOT_GATE_PASS_KEY = "mathRidge_rootGatePassed_chapter_1";
const CHAPTER_ONE_TEST_PASS_KEY = "mathRidge_testPassed_chapter_1";

function isTermManualUnlocked() {
  try {
    return localStorage.getItem(TERM_MANUAL_UNLOCK_KEY) === "true" ||
      localStorage.getItem(storageKeyNote("1_1")) === "true" ||
      localStorage.getItem(storageKeyPlayComplete("1_1")) === "true" ||
      hasCertificate("1_1");
  } catch (error) {
    return false;
  }
}

function isStoryGateActive() {
  return !isTermManualUnlocked();
}

function canOpenSectionWhileGated(id) {
  return !isStoryGateActive() || ["home", "message"].includes(id);
}

function syncStoryGateState() {
  const gateActive = isStoryGateActive();
  document.body.classList.toggle("story-gated", gateActive);
  document.documentElement.classList.toggle("story-gated", gateActive);

  document.querySelectorAll(".top-actions button").forEach(button => {
    const label = button.textContent.trim().toLowerCase();
    const locked = gateActive && !["home", "message"].includes(label);
    button.disabled = locked;
    button.classList.toggle("story-locked", locked);
    if (locked) {
      button.setAttribute("aria-disabled", "true");
      button.title = "Finish Story 1-1 to unlock this area.";
    } else {
      button.removeAttribute("aria-disabled");
      button.removeAttribute("title");
    }
  });
}

function hasSeenStageRevealHint() {
  try { return localStorage.getItem(STAGE_REVEAL_HINT_KEY) === "true"; }
  catch (error) { return false; }
}

function syncStageRevealHintState() {
  document.body.classList.toggle("stage-reveal-hint-seen", hasSeenStageRevealHint());
}

function markStageRevealHintSeen() {
  try { localStorage.setItem(STAGE_REVEAL_HINT_KEY, "true"); } catch (error) {}
  syncStageRevealHintState();
}

function writeTrailStateSnapshot() {
  try {
    const lessonStates = lessons.map((lesson, index) => {
      const cert = readCertificate(lesson.id);
      return {
        id: lesson.id,
        section: lesson.section,
        noteUnlocked: isNoteUnlocked(index),
        noteComplete: hasCompletedNote(lesson.id),
        playUnlocked: isPlayUnlocked(index),
        playComplete: hasCompletedPlay(lesson.id),
        certificateEarned: Boolean(cert && cert.completed),
        certificateDate: cert?.completedAt || cert?.displayDate || ""
      };
    });

    localStorage.setItem(TRAIL_STATE_KEY, JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      lessons: lessonStates
    }));
  } catch (error) {
    /* Local storage can fail in private modes. The live unlock checks still work. */
  }
}

function readTrailStateSnapshot() {
  try { return JSON.parse(localStorage.getItem(TRAIL_STATE_KEY)); }
  catch (error) { return null; }
}

function readJSONStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch (error) { return null; }
}

function readCertificate(id) { return readJSONStorage(storageKeyCert(id)); }
function hasCertificate(id) {
  const cert = readCertificate(id);
  return Boolean(cert && cert.completed);
}
function hasCompletedNote(id) { return localStorage.getItem(storageKeyNote(id)) === "true"; }
function hasUnlockedNote(id) { return localStorage.getItem(storageKeyNoteUnlocked(id)) === "true"; }
function hasCompletedPlay(id) { return localStorage.getItem(storageKeyPlayComplete(id)) === "true"; }
function lessonIndex(id) { return lessons.findIndex(lesson => lesson.id === id); }
function isRootGatePassed() {
  return localStorage.getItem(ROOT_GATE_PASS_KEY) === "true" ||
    localStorage.getItem(CHAPTER_ONE_TEST_PASS_KEY) === "true";
}
function isChapterOneRelicsComplete() {
  return ["1_1", "1_2", "1_3", "1_4"].every(id => hasCertificate(id) || hasCompletedPlay(id));
}
function isRootGateUnlocked() {
  return isRootGatePassed() ||
    localStorage.getItem(ROOT_GATE_UNLOCK_KEY) === "true" ||
    isChapterOneRelicsComplete();
}

function isNoteUnlocked(index) {
  const lesson = lessons[index];

  if (lesson.chapter.startsWith("Chapter 2")) {
    if (!isRootGatePassed()) return false;
    if (lesson.id === "2_1") return true;
  }

  if (index === 0) return true;
  const previousLesson = lessons[index - 1];

  return (
    hasUnlockedNote(lesson.id) ||
    hasCertificate(previousLesson.id) ||
    hasCompletedPlay(previousLesson.id)
  );
}

function isPlayUnlocked(index) {
  const lesson = lessons[index];
  if (lesson.chapter.startsWith("Chapter 2") && !isRootGatePassed()) return false;
  return hasCompletedNote(lesson.id) || hasCertificate(lesson.id);
}

function certificateDateText(cert) {
  if (cert.displayDate) return cert.displayDate;
  if (!cert.completedAt) return "";
  return new Date(cert.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const pronounLabels = {
  they: "they / them",
  he: "he / him",
  she: "she / her"
};

function cleanIdentityValue(value, maxLength) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function readPlayerProfile() {
  const profile = readJSONStorage(PLAYER_PROFILE_KEY);
  if (!profile || typeof profile !== "object") return null;
  return profile;
}

function getPronounLabel(value) {
  return pronounLabels[value] || pronounLabels.they;
}

function renderPlayerIdentityState() {
  const form = document.getElementById("playerIdentityForm");
  const saved = document.getElementById("playerIdentitySaved");
  const nicknameInput = document.getElementById("playerNickname");
  const certificateInput = document.getElementById("certificateName");
  const profile = readPlayerProfile();

  if (!form || !saved) return;

  if (!profile) {
    form.classList.remove("identity-locked");
    form.querySelectorAll("input, button[type='submit']").forEach(control => {
      control.disabled = false;
    });
    saved.classList.add("hidden");
    saved.innerHTML = "";
    return;
  }

  if (nicknameInput) nicknameInput.value = profile.nickname || "";
  if (certificateInput) certificateInput.value = profile.certificateName || "";
  form.querySelectorAll(`input[name="pronoun"]`).forEach(input => {
    input.checked = input.value === (profile.pronoun || "they");
  });
  form.classList.add("identity-locked");
  form.querySelectorAll("input, button[type='submit']").forEach(control => {
    control.disabled = true;
  });

  saved.classList.remove("hidden");
  saved.innerHTML = `
    <strong>Story Profile Sealed</strong>
    <span>Mira will call you ${escapeHTML(profile.nickname || "Ridge Wanderer")}.</span>
    <span>Certificates and world records will use ${escapeHTML(profile.certificateName || profile.nickname || "Math Ridge Champion")}.</span>
    <span>Pronouns: ${escapeHTML(getPronounLabel(profile.pronoun))}</span>
    <button class="gold-btn" type="button" onclick="showSection('quest')">Step onto Math Ridge</button>
  `;
}

function handlePrologueChoice(choice) {
  const response = document.getElementById("prologueChoiceResponse");
  if (!response) return;

  const lines = {
    look: "Glowing symbols are carved into the wooden floor. They shift when you stare at them, almost like they are waiting for an answer.",
    mountain: "Mira lowers her voice. Math Ridge is ancient. Every trail teaches a different kind of magic, but no one reaches the top without learning.",
    pockets: "Your phone is gone. All you find is a small glowing pebble shaped like the number 1. It feels warm, like it knows the first trail is waiting."
  };

  response.textContent = lines[choice] || "Mira takes a breath and promises to guide you as far as she can.";
  response.classList.add("choice-response-active");
  try { localStorage.setItem(PROLOGUE_SEEN_KEY, "true"); } catch (error) {}
}

function savePlayerIdentity(event) {
  if (event) event.preventDefault();

  const existingProfile = readPlayerProfile();
  if (existingProfile) {
    renderPlayerIdentityState();
    return;
  }

  const form = document.getElementById("playerIdentityForm");
  if (!form) return;

  const data = new FormData(form);
  const nickname = cleanIdentityValue(data.get("nickname"), 24) || "Ridge Wanderer";
  const certificateName = cleanIdentityValue(data.get("certificateName"), 36) || nickname;
  const selectedPronoun = cleanIdentityValue(data.get("pronoun"), 8);
  const pronoun = pronounLabels[selectedPronoun] ? selectedPronoun : "they";
  const profile = {
    version: 1,
    nickname,
    certificateName,
    pronoun,
    pronounLabel: getPronounLabel(pronoun),
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(PROLOGUE_SEEN_KEY, "true");
  } catch (error) {}

  renderPlayerIdentityState();

  const saved = document.getElementById("playerIdentitySaved");
  if (saved) saved.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderTrail(options = {}) {
  const trail = document.getElementById("trailChapters");
  if (!trail) return;
  if (!options.force && trail.dataset.rendered === "true") return;

  const chapters = [...new Set(lessons.map(lesson => lesson.chapter))];

  trail.innerHTML = chapters.map(chapter => {
    const chapterLessons = lessons.filter(lesson => lesson.chapter === chapter);
    const chapterNote = chapterLessons[0].chapterNote;

    return `
      <div class="chapter-block">
        <div class="chapter-label"><strong>${escapeHTML(chapter)}</strong><span>${escapeHTML(chapterNote)}</span></div>
        <div class="node-grid">
          ${chapterLessons.map(renderTrailCard).join("")}
        </div>
        ${chapter.startsWith("Chapter 1") ? renderRootGateCard() : ""}
      </div>
    `;
  }).join("");

  trail.dataset.rendered = "true";
  writeTrailStateSnapshot();
  bindStageCardInteractions();
}

function renderRootGateCard() {
  const unlocked = isRootGateUnlocked();
  const passed = isRootGatePassed();
  const status = passed ? "Gate opened" : unlocked ? "Exam ready" : "Four relics required";
  const href = unlocked ? (passed ? "root-gate-test.html" : "story-root-gate.html") : "#";

  return `
    <article class="root-gate-card ${unlocked ? "" : "locked"} ${passed ? "passed" : ""}" aria-label="Root Gate Chapter 1 checkpoint">
      <div class="root-gate-mark" aria-hidden="true">I</div>
      <div class="root-gate-copy">
        <span>Chapter 1 Checkpoint</span>
        <h3>Root Gate Finale</h3>
        <p>A story finale leads into the formal 40-question mastery trial. Score 92% or higher within 10 minutes to open Chapter 2.</p>
      </div>
      <div class="root-gate-actions">
        <strong>${escapeHTML(status)}</strong>
        <a class="small-link root-gate-link ${unlocked ? "" : "locked"}" href="${href}" onclick="return handleRootGateClick(event)">${passed ? "Review / Retake" : unlocked ? "Begin Finale" : "Locked"}</a>
      </div>
    </article>
  `;
}

function stageRelicName(id) {
  const relics = {
    "1_1": "The Term Stone",
    "1_2": "The Sign Compass",
    "1_3": "The Parity Prism",
    "1_4": "The Factor Forge"
  };
  return relics[id] || "";
}

function stageRelicImage(id) {
  const relicImages = {
    "1_1": "assets/images/relic/term_stone.png",
    "1_2": "assets/images/relic/sign_compass_relic_alpha.png",
    "1_3": "assets/images/relic/parity_prism_true_alpha.png",
    "1_4": "assets/images/relic/factor_forge_alpha.png"
  };
  return relicImages[id] || "";
}

function earnedStageProof(lesson) {
  const relicName = stageRelicName(lesson.id);
  return relicName ? `${relicName} obtained` : "Stage achieved";
}

function renderTrailCard(lesson) {
  const index = lessonIndex(lesson.id);
  const noteUnlocked = isNoteUnlocked(index);
  const playUnlocked = isPlayUnlocked(index);
  const earned = hasCertificate(lesson.id);
  const primaryStageImage = noteUnlocked ? stageImagePrimary(lesson.id) : "";
  const imageStyle = "";
  const imageClass = primaryStageImage ? "stage-image" : "";
  const interactionClass = noteUnlocked ? "stage-tappable" : "";
  const stageArt = primaryStageImage
    ? `<div class="stage-art" aria-hidden="true"><img class="stage-art-img" src="${primaryStageImage}" alt="" loading="lazy" decoding="async" onerror="handleStageImageFallback(this)"></div>`
    : "";
  const relicName = stageRelicName(lesson.id);
  const relicImage = stageRelicImage(lesson.id);
  const relicProof = earned && relicName
    ? `<div class="stage-relic-proof ${relicImage ? "has-image" : ""}" aria-label="${escapeHTML(relicName)} obtained">${relicImage ? `<img class="stage-relic-img" src="${escapeHTML(relicImage)}" alt="" loading="lazy" decoding="async">` : ""}<span>Relic Obtained</span><strong>${escapeHTML(relicName)}</strong><em>Completed</em></div>`
    : "";

  return `
    <article class="node-card ${noteUnlocked ? "" : "locked"} ${imageClass} ${interactionClass}" data-lesson-id="${lesson.id}" data-note-unlocked="${noteUnlocked ? "true" : "false"}" data-play-unlocked="${playUnlocked ? "true" : "false"}" ${imageStyle}>
      ${stageArt}
      <div class="node-top">
        <div class="node-id">${lesson.section}</div>
        <div class="node-status">${escapeHTML(lesson.tag)}</div>
      </div>
      <div>
        <h3>${escapeHTML(lesson.title)}</h3>
        <p>${escapeHTML(lesson.description)}</p>
      </div>
      ${relicProof}
      <div class="lock-chip">${earned ? escapeHTML(earnedStageProof(lesson)) : playUnlocked ? "Trail open" : noteUnlocked ? "Manual open" : "Trail locked"}</div>
      <div class="node-actions">
        <a class="small-link note-link ${noteUnlocked ? "" : "locked"}" href="${noteUnlocked ? lesson.noteFile : "#"}" onclick="return handleNoteClick(event, '${lesson.id}')" aria-label="Open ${lesson.section} Manual"><span class="button-rune" aria-hidden="true">📖</span><span>Manual</span></a>
        <a class="small-link play-link ${playUnlocked ? "" : "locked"}" href="${playUnlocked ? lesson.playFile : "#"}" onclick="return handlePlayClick(event, '${lesson.id}')" aria-label="Open ${lesson.section} Trail"><span class="button-rune" aria-hidden="true">▶</span><span>Trail</span></a>
      </div>
    </article>
  `;
}

function bindStageCardInteractions() {
  document.querySelectorAll(".node-card.stage-tappable:not(.locked)").forEach(card => {
    if (card.dataset.stageBound === "true") return;
    card.dataset.stageBound = "true";

    let pressTimer;
    const addPressed = () => card.classList.add("is-pressed");
    const removePressed = () => {
      window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => card.classList.remove("is-pressed"), 180);
    };

    card.addEventListener("pointerdown", addPressed);
    card.addEventListener("pointerup", removePressed);
    card.addEventListener("pointercancel", removePressed);
    card.addEventListener("pointerleave", removePressed);
    card.addEventListener("focusin", addPressed);
    card.addEventListener("focusout", removePressed);
  });
}

function renderMenuLinks(options = {}) {
  const wrap = document.getElementById("chapterLinks");
  if (!wrap) return;
  if (!options.force && wrap.dataset.rendered === "true") return;

  const chapters = [...new Set(lessons.map(lesson => lesson.chapter))];

  wrap.innerHTML = chapters.map(chapter => {
    const items = lessons.filter(lesson => lesson.chapter === chapter);
    return `
      <div class="quick-box">
        <h3>${escapeHTML(chapter.replace(":", " —"))}</h3>
        <div class="link-list">
          ${items.map(renderMenuNotePlay).join("")}
        </div>
        ${chapter.startsWith("Chapter 1") ? renderMenuRootGateLink() : ""}
      </div>
    `;
  }).join("") + `
    <div class="reset-zone">
      <p>Want a fresh device run? This clears the saved Trail unlocks, Cabin achievements, and chapter test snapshots on this device only.</p>
      <button class="danger-btn reset-progress-btn" type="button" onclick="confirmResetProgress()"><span aria-hidden="true">↺</span> Reset All Progress</button>
    </div>
  `;

  wrap.dataset.rendered = "true";
  writeTrailStateSnapshot();
}

function renderMenuRootGateLink() {
  const unlocked = isRootGateUnlocked();
  const passed = isRootGatePassed();
  const href = unlocked ? (passed ? "root-gate-test.html" : "story-root-gate.html") : "#";
  return `
    <a class="jump-link root-gate-jump ${unlocked ? "" : "locked"}" href="${href}" onclick="return handleRootGateClick(event)">
      <span><i aria-hidden="true">I</i> Root Gate Finale</span><strong>${passed ? "Passed" : unlocked ? "Ready" : "Locked"}</strong>
    </a>
  `;
}

function renderMenuNotePlay(lesson) {
  const index = lessonIndex(lesson.id);
  const noteUnlocked = isNoteUnlocked(index);
  const playUnlocked = isPlayUnlocked(index);

  return `
    <a class="jump-link note-jump ${noteUnlocked ? "" : "locked"}" href="${noteUnlocked ? lesson.noteFile : "#"}" onclick="return handleNoteClick(event, '${lesson.id}')"><span><i aria-hidden="true">📖</i> ${lesson.section} Manual</span><strong>${noteUnlocked ? lesson.tag : "Locked"}</strong></a>
    <a class="jump-link play-jump ${playUnlocked ? "" : "locked"}" href="${playUnlocked ? lesson.playFile : "#"}" onclick="return handlePlayClick(event, '${lesson.id}')"><span><i aria-hidden="true">▶</i> ${lesson.section} Trail</span><strong>${playUnlocked ? "Enter" : "Locked"}</strong></a>
  `;
}

function handleNoteClick(event, id) {
  const index = lessonIndex(id);
  const lesson = lessons[index];

  if (!isNoteUnlocked(index)) {
    event.preventDefault();
    if (lesson.chapter.startsWith("Chapter 2") && !isRootGatePassed()) {
      showChapterTwoGateModal();
      return false;
    }
    showLockedProgressModal(`${lesson.section} Manual`);
    return false;
  }

  return true;
}

function handlePlayClick(event, id) {
  const index = lessonIndex(id);
  const lesson = lessons[index];

  if (!isPlayUnlocked(index)) {
    event.preventDefault();

    if (lesson.chapter.startsWith("Chapter 2") && !isRootGatePassed()) {
      showChapterTwoGateModal();
      return false;
    }

    if (isNoteUnlocked(index)) {
      showPlayNeedsNoteModal(lesson);
    } else {
      showLockedProgressModal(`${lesson.section} Trail`);
    }

    return false;
  }

  return true;
}

function handleRootGateClick(event) {
  if (!isRootGateUnlocked()) {
    event.preventDefault();
    showModal("Root Gate Locked", "Collect all four Chapter 1 relics before attempting the Root Gate Exam.", [
      { text: "Back to Mountain Trail", className: "gold-btn", action: () => showSection("quest") },
      { text: "OK", className: "pill-btn", action: closeModal }
    ]);
    return false;
  }

  return true;
}

function renderCertificateWall() {
  const wall = document.getElementById("certWall");
  if (!wall) return;

  wall.innerHTML = certificateList.map(item => {
    const cert = readCertificate(item.id);
    const earned = Boolean(cert && cert.completed);
    const name = earned ? (cert.studentName || cert.name || "Student") : "";
    const date = earned ? certificateDateText(cert) : "";
    const actionText = earned ? "View / Download" : "Not yet obtained";
    const statusText = earned ? "🏅 Earned" : "🔒 Locked";

    return `
      <button class="certificate-frame ${earned ? "earned" : "not-earned"}" type="button" onclick="openCertificateFrame('${item.id}')">
        <div class="certificate-mini">
          <div class="mini-cert-school">Math Ridge</div>
          <div class="mini-cert-rule" aria-hidden="true"></div>
          <strong>${item.section}</strong>
          <span>${escapeHTML(item.title)}</span>
          <div class="cert-status">${statusText}</div>
          ${earned ? `<div class="cert-name">${escapeHTML(name)}</div>` : ""}
          ${earned ? `<div class="cert-date">${escapeHTML(date)}</div>` : ""}
          <div class="cert-date">${actionText}</div>
        </div>
      </button>
    `;
  }).join("");

  writeTrailStateSnapshot();
}

function readTestResultImage(test) {
  for (const key of test.storageKeys || []) {
    const saved = localStorage.getItem(key);
    if (saved) return saved;
  }
  return test.image;
}

function readTestResultData(test) {
  return test.dataKey ? readJSONStorage(test.dataKey) : null;
}

function readTestAttemptHistory(test) {
  const saved = test.historyKey ? readJSONStorage(test.historyKey) : null;
  return Array.isArray(saved) ? saved : [];
}

function formatTestPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return `${Math.round(number * 10) / 10}%`;
}

function formatTestTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatTestDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function positiveTestInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function testAttemptCount(test, data, history) {
  const saved = test.attemptsKey ? positiveTestInteger(localStorage.getItem(test.attemptsKey)) : 0;
  return Math.max(
    data ? 1 : 0,
    saved,
    positiveTestInteger(data?.attempts),
    positiveTestInteger(data?.attemptNumber),
    history.length
  );
}

function bestTestAttempt(data, history) {
  const candidates = [...history];
  if (data) {
    candidates.push({
      correct: data.bestCorrect || data.correct,
      percent: data.bestPercent || data.percent,
      passed: data.passed
    });
  }
  return candidates.reduce((best, attempt) => {
    if (!best || Number(attempt.percent) > Number(best.percent)) return attempt;
    return best;
  }, null);
}

function renderTestResultStats(test) {
  const data = readTestResultData(test);
  const history = readTestAttemptHistory(test);
  const attempts = testAttemptCount(test, data, history);
  const best = bestTestAttempt(data, history);

  if (!data && attempts <= 0) {
    return `
      <div class="test-result-stats is-empty">
        <div><strong>--</strong><span>latest score</span></div>
        <div><strong>0</strong><span>attempts</span></div>
        <div><strong>--</strong><span>best score</span></div>
        <div><strong>Pending</strong><span>result</span></div>
      </div>
      <div class="test-attempt-note">No official attempt has been submitted yet.</div>
    `;
  }

  const latestScore = data ? `${Number(data.correct || 0)}/${Number(data.totalQuestions || 40)}` : "--";
  const bestScore = best ? `${Number(best.correct || 0)}/${Number(data?.totalQuestions || 40)}` : latestScore;
  const resultText = data?.passed ? "Passed" : "Retry";
  const dateText = formatTestDate(data?.completedAt);
  const attemptLabel = positiveTestInteger(data?.attemptNumber, attempts || 1);

  return `
    <div class="test-result-stats has-record">
      <div><strong>${escapeHTML(latestScore)}</strong><span>latest score</span></div>
      <div><strong>${escapeHTML(String(attempts))}</strong><span>attempts</span></div>
      <div><strong>${escapeHTML(bestScore)}</strong><span>best score</span></div>
      <div><strong>${escapeHTML(resultText)}</strong><span>${escapeHTML(formatTestPercent(data?.percent))}</span></div>
    </div>
    <div class="test-attempt-note">
      ${data ? `Last attempt ${escapeHTML(String(attemptLabel))}${dateText ? ` on ${escapeHTML(dateText)}` : ""} · Time ${escapeHTML(formatTestTime(data.usedSeconds))}` : "Attempt history registered."}
    </div>
  `;
}

function renderTestResults() {
  const grid = document.getElementById("testResultsGrid");
  if (!grid) return;

  grid.innerHTML = chapterTests.map(test => {
    const image = readTestResultImage(test);
    const isChapterOne = test.id === "chapter_1";
    const chapterOneAction = isChapterOne
      ? `<a class="pill-btn" href="${isRootGateUnlocked() ? (isRootGatePassed() ? "root-gate-test.html" : "story-root-gate.html") : "#"}" onclick="return handleRootGateClick(event)">${isRootGatePassed() ? "Review Root Gate Exam" : "Begin Root Gate Finale"}</a>`
      : `<button class="pill-btn" type="button" onclick="showModal('Chapter Test Coming Soon', '${escapeHTML(test.chapter)} will connect here when the chapter test page is ready.', [{ text: 'OK', className: 'gold-btn', action: closeModal }])">Open Test Plan</button>`;
    return `
      <article class="test-result-card">
        <h4>${escapeHTML(test.chapter)}</h4>
        <p><strong>${escapeHTML(test.title)}</strong><br>${escapeHTML(test.range)}</p>
        <div class="result-image-frame">
          <img src="${escapeHTML(image)}" alt="${escapeHTML(test.chapter)} result preview" />
        </div>
        ${renderTestResultStats(test)}
        <div class="result-note">${escapeHTML(test.note)}</div>
        <div class="result-card-actions">
          ${chapterOneAction}
        </div>
      </article>
    `;
  }).join("");
}

function openCertificateFrame(id) {
  const item = certificateList.find(cert => cert.id === id);
  if (!item) return;

  const cert = readCertificate(id);

  if (cert && cert.completed) {
    try {
      sessionStorage.setItem("mathRidge_certificate_return", "cabin");
      sessionStorage.setItem("mathRidge_open_section", "cabin");
      sessionStorage.setItem("mathRidgeReturnView", "cabin");
    } catch (error) {}

    window.location.href = `${item.playFile}?certificate=${encodeURIComponent(id)}&mode=redownload&from=cabin`;
    return;
  }

  showModal("Certificate Not Yet Obtained", "This certificate is not yet obtained. Do you wish to continue your Mountain Trail to earn it?", [
    { text: "Yes", className: "gold-btn", action: () => showSection("quest") },
    { text: "No", className: "pill-btn", action: closeModal }
  ]);
}

function showLockedProgressModal(targetLabel) {
  showModal("Trail Locked", `Continue your recent progress to unlock ${targetLabel}.`, [
    { text: "OK", className: "gold-btn", action: closeModal }
  ]);
}

function showPlayNeedsNoteModal(lesson) {
  showModal(
    "Trail Locked",
    `To unlock ${lesson.section} Trail, please finish the progress training in ${lesson.section} Manual first. Would you like to go to the Manual now?`,
    [
      { text: "Yes", className: "gold-btn", action: () => { window.location.href = lesson.noteFile; } },
      { text: "No", className: "pill-btn", action: closeModal }
    ]
  );
}

function showChapterTwoGateModal() {
  showModal("Root Gate Required", "Chapter 2 opens after you pass the Root Gate Exam with 92% or higher.", [
    { text: isRootGateUnlocked() ? "Begin Root Gate Finale" : "Back to Chapter 1", className: "gold-btn", action: () => {
      if (isRootGateUnlocked()) window.location.href = "story-root-gate.html";
      else showSection("quest");
    } },
    { text: "OK", className: "pill-btn", action: closeModal }
  ]);
}

function confirmResetProgress() {
  showModal("Erase Device Progress?", "This clears Trail unlocks, Cabin achievements, and chapter test snapshots saved on this device only.", [
    { text: "Yes, erase device progress", className: "danger-btn", action: resetAllProgress, confirmTwice: true },
    { text: "No, keep my progress", className: "pill-btn", action: closeModal, confirmTwice: true }
  ]);
}

function resetAllProgress() {
  lessons.forEach(lesson => {
    localStorage.removeItem(storageKeyNote(lesson.id));
    localStorage.removeItem(storageKeyNoteUnlocked(lesson.id));
    localStorage.removeItem(storageKeyPlayComplete(lesson.id));
    localStorage.removeItem(`mathRidge_noteVisited_${lesson.id}`);
    localStorage.removeItem(storageKeyCert(lesson.id));
  });

  try { localStorage.removeItem(TRAIL_STATE_KEY); } catch (error) {}
  try { localStorage.removeItem(STAGE_REVEAL_HINT_KEY); } catch (error) {}
  try { localStorage.removeItem(PLAYER_PROFILE_KEY); } catch (error) {}
  try { localStorage.removeItem(PROLOGUE_SEEN_KEY); } catch (error) {}
  try { localStorage.removeItem(STORY_COMPLETE_1_1_KEY); } catch (error) {}
  try { localStorage.removeItem(ROOT_GATE_UNLOCK_KEY); } catch (error) {}
  try { localStorage.removeItem(ROOT_GATE_PASS_KEY); } catch (error) {}
  try { localStorage.removeItem(CHAPTER_ONE_TEST_PASS_KEY); } catch (error) {}
  try { localStorage.removeItem("mathRidge_testResult_chapter_1_data"); } catch (error) {}

  chapterTests.forEach(test => {
    (test.storageKeys || []).forEach(key => localStorage.removeItem(key));
    if (test.dataKey) localStorage.removeItem(test.dataKey);
    if (test.attemptsKey) localStorage.removeItem(test.attemptsKey);
    if (test.historyKey) localStorage.removeItem(test.historyKey);
  });

  closeModal();
  renderPlayerIdentityState();
  syncStageRevealHintState();
  renderTrail({ force: true });
  renderMenuLinks({ force: true });
  renderCertificateWall();
  renderTestResults();
  syncStoryGateState();
  showSection("home");
}

const modalActionMap = new WeakMap();

function showModal(title, text, actions = []) {
  const titleEl = document.getElementById("modalTitle");
  const textEl = document.getElementById("modalText");
  const actionWrap = document.getElementById("modalActions");
  const modal = document.getElementById("ridgeModal");
  if (!titleEl || !textEl || !actionWrap || !modal) return;

  titleEl.textContent = title;
  textEl.textContent = text;
  actionWrap.innerHTML = "";

  const normalizedActions = actions.length ? actions : [{ text: "OK", className: "gold-btn", action: closeModal }];

  normalizedActions.forEach(action => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action.className || "gold-btn";
    button.textContent = action.text || "OK";

    if (action.confirmTwice) {
      button.dataset.mobileConfirm = "modal-reset";
      button.dataset.confirmText = action.text || "Confirm";
      button.setAttribute("aria-label", `${action.text || "Confirm"}. Tap twice on mobile to confirm.`);
    }

    modalActionMap.set(button, action.action || closeModal);
    button.addEventListener("click", action.action || closeModal);
    actionWrap.appendChild(button);
  });

  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("ridgeModal");
  if (modal) modal.classList.remove("show");
}

function showStoryGateModal() {
  showModal("Story First", "The full Mountain Trail opens after you finish Story 1-1 and receive the Term Manual.", [
    { text: "Begin Story", className: "gold-btn", action: () => { window.location.href = "prologue.html"; } },
    { text: "Message", className: "pill-btn", action: () => showSection("message") },
    { text: "OK", className: "pill-btn", action: closeModal }
  ]);
}

const sections = document.querySelectorAll(".view-section");
const shell = document.getElementById("appShell");
const bgClasses = ["quest-bg", "menu-bg", "cabin-bg", "message-bg", "prologue-bg"];

function updateActiveNav(id) {
  const labels = { home: "Home", quest: "Trail", quick: "Menu", cabin: "Cabin", message: "Message", prologue: "" };

  document.querySelectorAll(".top-actions button").forEach(button => {
    const isCurrent = button.textContent.trim() === labels[id];
    button.classList.toggle("active-section", isCurrent);
    button.classList.toggle("is-current-section", isCurrent);

    if (isCurrent) {
      button.setAttribute("aria-current", "page");
      button.setAttribute("data-current-section", "true");
    } else {
      button.removeAttribute("aria-current");
      button.removeAttribute("data-current-section");
    }
  });
}

function showSection(id, options = {}) {
  const { scroll = true, keepURL = false, silentGate = false } = options;
  let nextId = normalizeSectionName(id) || "home";
  const blockedByGate = !canOpenSectionWhileGated(nextId);

  if (blockedByGate) {
    nextId = "home";
  }

  if (typeof toggleNoteMenu === "function") toggleNoteMenu(false);
  if (window.MathRidgeMobileConfirm?.clear) window.MathRidgeMobileConfirm.clear();
  if (typeof clearStageSelection === "function") clearStageSelection();
  closeModal();

  sections.forEach(section => section.classList.remove("active"));

  const target = document.getElementById(nextId);
  if (target) target.classList.add("active");

  if (shell) {
    shell.classList.remove(...bgClasses);
    if (nextId === "quest") shell.classList.add("quest-bg");
    if (nextId === "quick") shell.classList.add("menu-bg");
    if (nextId === "cabin") shell.classList.add("cabin-bg");
    if (nextId === "message") shell.classList.add("message-bg");
    if (nextId === "prologue") shell.classList.add("prologue-bg");
  }

  if (nextId === "quest") renderTrail();
  if (nextId === "quick") renderMenuLinks();
  if (nextId === "cabin") {
    renderCertificateWall();
    renderTestResults();
    syncCabinPanelVisibility({ scroll: false });
  }

  updateActiveNav(nextId);
  syncStoryGateState();

  if (blockedByGate && !silentGate) showStoryGateModal();

  if (!keepURL && window.history && window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
}

function normalizeSectionName(value) {
  if (!value) return "";
  if (value === "trail" || value === "mountain-trail") return "quest";
  if (value === "menu") return "quick";
  if (value === "story") return "prologue";
  return value;
}

function openInitialSectionFromURL() {
  let target = "home";

  try {
    const savedTarget = sessionStorage.getItem("mathRidge_open_section") || sessionStorage.getItem("mathRidgeReturnView");
    if (savedTarget) {
      target = normalizeSectionName(savedTarget);
      sessionStorage.removeItem("mathRidge_open_section");
      sessionStorage.removeItem("mathRidgeReturnView");
    }
  } catch (error) {}

  const params = new URLSearchParams(window.location.search);
  const viewParam = normalizeSectionName(params.get("view"));
  const hashTarget = normalizeSectionName(window.location.hash.replace("#", ""));

  if (viewParam) target = viewParam;
  if (hashTarget) target = hashTarget;

  if (target === "prologue") {
    window.location.href = "prologue.html";
    return;
  }

  if (["quest", "quick", "cabin", "message"].includes(target)) {
    showSection(target, { scroll: false, keepURL: true, silentGate: true });
  } else {
    showSection("home", { scroll: false, keepURL: true });
  }
}

let cabinWallMobileOpen = false;

function isMobileMathRidgeView() {
  return Boolean(window.matchMedia && window.matchMedia("(max-width: 760px)").matches);
}

function getCabinPanel() {
  return document.querySelector(".cabin-panel");
}

function scrollCabinFocus(panel = "certificates") {
  const target = document.getElementById(panel === "tests" ? "testResultsTitle" : "certificateWallTitle");
  if (!target) return;

  window.setTimeout(() => {
    const topbar = document.querySelector(".topbar");
    const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 72;
    const y = window.scrollY + target.getBoundingClientRect().top - topbarHeight - 16;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, 180);
}

function syncCabinPanelVisibility(options = {}) {
  const panel = getCabinPanel();
  if (!panel) return;

  const open = !isMobileMathRidgeView() || cabinWallMobileOpen;
  panel.classList.toggle("certificate-wall-collapsed", !open);

  if (open && options.scroll) {
    const slider = document.getElementById("cabinSlider");
    scrollCabinFocus(slider?.dataset?.panel || "certificates");
  }
}

function toggleCertificateWall() {
  const slider = document.getElementById("cabinSlider");
  const currentPanel = slider?.dataset?.panel || "certificates";

  if (isMobileMathRidgeView()) {
    if (cabinWallMobileOpen && currentPanel === "certificates") {
      cabinWallMobileOpen = false;
      syncCabinPanelVisibility({ scroll: false });
      return;
    }

    cabinWallMobileOpen = true;
    showCabinPanel("certificates", { scroll: true });
    return;
  }

  showCabinPanel("certificates", { scroll: true });
}

function showCabinPanel(panel, options = {}) {
  const slider = document.getElementById("cabinSlider");
  const certTab = document.getElementById("certTab");
  const testTab = document.getElementById("testTab");
  if (!slider) return;

  const nextPanel = panel === "tests" ? "tests" : "certificates";
  cabinWallMobileOpen = true;
  slider.dataset.panel = nextPanel;
  certTab?.classList.toggle("active", nextPanel === "certificates");
  testTab?.classList.toggle("active", nextPanel === "tests");

  if (nextPanel === "tests") renderTestResults();
  if (nextPanel === "certificates") renderCertificateWall();

  syncCabinPanelVisibility({ scroll: false });
  if (options.scroll !== false) scrollCabinFocus(nextPanel);
}

function messageTone(kind, name) {
  const safeName = name || "Math Ridge friend";
  const tones = {
    "Math Question": `Thanks, ${safeName}. Your math question has been sent. I will read it like a real trail question and use it to make Math Ridge clearer.`,
    "Suggestion": `Thanks, ${safeName}. Your suggestion has been sent. Ideas like this help shape the next ridge with more focus and less confusion.`,
    "Thank You": `Thank you, ${safeName}. Your kind note has been sent. It means a lot and helps keep Math Ridge growing with heart.`,
    "Parent Testimonial": `Thank you, ${safeName}. Your parent testimonial has been sent. I will treat it with care and respect.`,
    "Bug Report": `Thanks, ${safeName}. Your bug report has been sent. This helps make the trail smoother for every student.`,
    "Other": `Thanks, ${safeName}. Your message has been sent successfully. I appreciate you taking time to write to Math Ridge.`
  };
  return tones[kind] || tones.Other;
}

async function sendMessage(event) {
  event.preventDefault();

  const form = document.getElementById("contactForm");
  const button = document.getElementById("sendNoteButton");
  const name = document.getElementById("name")?.value.trim() || "";
  const role = document.getElementById("role")?.value || "";
  const kind = document.getElementById("kind")?.value || "Other";
  const message = document.getElementById("messageText")?.value.trim() || "";
  const subject = document.getElementById("messageSubject");

  if (!form || !message) {
    showModal("Message Needs a Little More", "Please write a message before sending.", [
      { text: "OK", className: "gold-btn", action: closeModal }
    ]);
    return;
  }

  if (subject) subject.value = `Math Ridge ${kind} from ${role || "Visitor"}`;

  const originalText = button ? button.textContent : "";
  if (button) {
    button.disabled = true;
    button.textContent = "Sending...";
  }

  try {
    const formData = new FormData(form);
    formData.set("role", role);
    formData.set("kind", kind);
    formData.set("message_type", kind);

    const response = await fetch(form.action, {
      method: "POST",
      body: formData
    });

    let data = null;
    try { data = await response.json(); } catch (error) {}

    if (!response.ok || (data && data.success === false)) {
      throw new Error((data && data.message) || "The message service did not confirm delivery.");
    }

    form.reset();
    showModal("Message Sent Successfully", `Thanks${name ? `, ${name}` : ""}. Your note has been sent to Math Ridge.`, [
      { text: "Back to Math Ridge", className: "gold-btn", action: closeModal }
    ]);
  } catch (error) {
    showModal("Message Could Not Send Yet", "The form did not confirm delivery. Please copy your note and try again in a moment.", [
      { text: "OK", className: "gold-btn", action: closeModal }
    ]);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText || "Send Note";
    }
  }
}




/* Premium Mobile Selection Flow
   Mobile only:
   - first tap gives the premium hover/pressed state
   - second tap confirms navigation/action
   - stage cards first select the card, then Manual/Trail buttons arm separately. */
const PREMIUM_TOUCH_QUERY = "(max-width: 760px)";
const STAGE_SHELF_AUTO_CLOSE_MS = 4600;
const CONFIRMABLE_INDEX_SELECTOR = [
  ".hero-actions .pill-btn",
  ".hero-actions .gold-btn",
  ".panel-header .pill-btn",
  ".room-spot",
  ".hotspot",
  ".cabin-tab",
  "#sendNoteButton",
  ".reset-progress-btn",
  ".jump-link:not(.locked)",
  ".root-gate-link:not(.locked)",
  "#modalActions [data-mobile-confirm='modal-reset']"
].join(", ");

let currentSelectedStageCard = null;
let stageSelectClearTimer = null;
let suppressNextConfirmedClickUntil = 0;

function isPremiumTouchDevice() {
  return Boolean(window.matchMedia && window.matchMedia(PREMIUM_TOUCH_QUERY).matches);
}

function mobileConfirm() {
  return window.MathRidgeMobileConfirm || null;
}

function clearStageSelection() {
  if (currentSelectedStageCard) {
    currentSelectedStageCard.classList.remove("is-stage-selected", "is-touch-preview", "is-pressed");
    currentSelectedStageCard.removeAttribute("data-stage-selected");
  }
  currentSelectedStageCard = null;
  mobileConfirm()?.clear?.();
  if (stageSelectClearTimer) {
    window.clearTimeout(stageSelectClearTimer);
    stageSelectClearTimer = null;
  }
}

function scheduleStageShelfClose(card = currentSelectedStageCard, delay = STAGE_SHELF_AUTO_CLOSE_MS) {
  if (stageSelectClearTimer) window.clearTimeout(stageSelectClearTimer);
  stageSelectClearTimer = window.setTimeout(() => {
    const keepSelected = document.activeElement && card && card.contains(document.activeElement);
    if (!keepSelected) clearStageSelection();
  }, delay);
}

function selectStageCard(card) {
  if (!card) return;

  mobileConfirm()?.clear?.();
  if (!hasSeenStageRevealHint()) markStageRevealHintSeen();

  if (currentSelectedStageCard && currentSelectedStageCard !== card) {
    currentSelectedStageCard.classList.remove("is-stage-selected", "is-touch-preview", "is-pressed");
    currentSelectedStageCard.removeAttribute("data-stage-selected");
  }

  currentSelectedStageCard = card;
  card.classList.add("is-stage-selected", "is-touch-preview", "is-pressed");
  card.setAttribute("data-stage-selected", "true");

  scheduleStageShelfClose(card);
}

function isConfirmableIndexTarget(target) {
  if (!target) return false;
  if (target.disabled || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return false;
  if (target.closest("#noteTopActions")) return false; // the shared shell owns the drawer.
  if (target.closest("#ridgeModal") && target.dataset.mobileConfirm !== "modal-reset") return false;
  if (target.classList.contains("locked")) return false; // locked Manual/Trail still opens its popup with one tap.
  return true;
}

function requireIndexMobileConfirm(event, target, options = {}) {
  if (!isPremiumTouchDevice() || !target || !isConfirmableIndexTarget(target)) return false;
  const helper = mobileConfirm();
  if (helper && typeof helper.require === "function") {
    return helper.require(event, target, options);
  }

  if (target.dataset.mobileConfirmReady === "true") {
    target.classList.remove("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
    target.removeAttribute("data-mobile-confirm-ready");
    target.removeAttribute("data-touch-preview-active");
    return false;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  target.classList.add("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
  target.setAttribute("data-mobile-confirm-ready", "true");
  target.setAttribute("data-touch-preview-active", "true");
  return true;
}

function disarmIndexConfirmTarget(target) {
  mobileConfirm()?.clear?.(target);
  target?.classList?.remove("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
  target?.removeAttribute?.("data-mobile-confirm-ready");
  target?.removeAttribute?.("data-touch-preview-active");
}

function activateConfirmedIndexTarget(target) {
  if (!target || !isConfirmableIndexTarget(target)) return false;

  const inlineAction = target.getAttribute("onclick") || "";
  const showSectionMatch = inlineAction.match(/showSection\('([^']+)'\)/);
  const showCabinPanelMatch = inlineAction.match(/showCabinPanel\('([^']+)'\)/);

  disarmIndexConfirmTarget(target);

  if (modalActionMap.has(target)) {
    modalActionMap.get(target)();
    return true;
  }

  if (showSectionMatch) {
    showSection(showSectionMatch[1]);
    return true;
  }

  if (showCabinPanelMatch) {
    showCabinPanel(showCabinPanelMatch[1], { scroll: true });
    return true;
  }

  if (/toggleCertificateWall\(\)/.test(inlineAction)) {
    toggleCertificateWall();
    return true;
  }

  if (/confirmResetProgress\(\)/.test(inlineAction)) {
    confirmResetProgress();
    return true;
  }

  if (/chapterLinks/.test(inlineAction)) {
    document.getElementById("chapterLinks")?.scrollIntoView({ behavior: "smooth" });
    return true;
  }

  if (target.matches("#sendNoteButton")) {
    target.form?.requestSubmit?.(target);
    return true;
  }

  if (target.tagName === "A") {
    const href = target.getAttribute("href");
    if (href && href !== "#") {
      window.location.href = target.href;
      return true;
    }
  }

  return false;
}

function handleStageMobileClick(event) {
  if (!isPremiumTouchDevice()) return false;

  const stageCard = event.target?.closest?.(".node-card.stage-tappable:not(.locked)");
  if (!stageCard) return false;

  const stageAction = event.target?.closest?.(".small-link");
  const stageIsSelected = stageCard.dataset.stageSelected === "true";

  if (!stageIsSelected) {
    event.preventDefault();
    event.stopImmediatePropagation();
    mobileConfirm()?.clear?.();
    selectStageCard(stageCard);
    return true;
  }

  if (!stageAction) {
    event.preventDefault();
    event.stopImmediatePropagation();
    selectStageCard(stageCard);
    return true;
  }

  if (stageAction.classList.contains("locked")) {
    return false;
  }

  const blocked = requireIndexMobileConfirm(event, stageAction, { duration: 6500, keepOthers: true });
  if (blocked) scheduleStageShelfClose(stageCard, 6900);
  if (!blocked) window.setTimeout(clearStageSelection, 220);
  return blocked;
}

function handlePremiumMobileConfirmClick(event) {
  if (!isPremiumTouchDevice()) return;

  if (Date.now() < suppressNextConfirmedClickUntil) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (handleStageMobileClick(event)) return;

  const target = event.target?.closest?.(CONFIRMABLE_INDEX_SELECTOR);
  if (!target || !document.body.contains(target)) return;

  if (target.dataset.mobileConfirmReady === "true" && activateConfirmedIndexTarget(target)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  requireIndexMobileConfirm(event, target, { duration: 5600 });
}

function handlePremiumPointerDown(event) {
  if (!isPremiumTouchDevice()) return;

  const readyTarget = event.target?.closest?.(CONFIRMABLE_INDEX_SELECTOR);
  if (readyTarget?.dataset?.mobileConfirmReady === "true" && activateConfirmedIndexTarget(readyTarget)) {
    suppressNextConfirmedClickUntil = Date.now() + 450;
    return;
  }

  if (event.pointerType === "mouse") return;

  const stageCard = event.target?.closest?.(".node-card.stage-tappable:not(.locked)");
  if (stageCard) {
    stageCard.classList.add("is-pressed");
    window.setTimeout(() => stageCard.classList.remove("is-pressed"), 280);
    return;
  }

  const target = event.target?.closest?.(CONFIRMABLE_INDEX_SELECTOR);
  if (target && isConfirmableIndexTarget(target)) {
    target.classList.add("is-pressed");
    window.setTimeout(() => target.classList.remove("is-pressed"), 280);
  }
}

function bindPremiumMobileSelection() {
  document.addEventListener("pointerdown", handlePremiumPointerDown, { passive: true });
  document.addEventListener("click", handlePremiumMobileConfirmClick, true);

  document.addEventListener("pointerdown", event => {
    if (!isPremiumTouchDevice()) return;
    if (event.target.closest(".node-card.stage-tappable")) return;
    if (!event.target.closest(".small-link, .jump-link, .hotspot, .room-spot, .cabin-tab, .reset-progress-btn, #sendNoteButton, #modalActions button")) {
      clearStageSelection();
      mobileConfirm()?.clear?.();
    }
  }, { passive: true });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      clearStageSelection();
      mobileConfirm()?.clear?.();
    }
  });

  window.addEventListener("resize", clearStageSelection);
  window.addEventListener("orientationchange", clearStageSelection);
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

document.addEventListener("DOMContentLoaded", () => {
  // Lazy-render the heavier sections only when a student opens that view.
  // This keeps the first mobile paint fast and prevents hidden Trail art from loading too early.
  openInitialSectionFromURL();
  renderPlayerIdentityState();
  syncStageRevealHintState();
  writeTrailStateSnapshot();
  bindPremiumMobileSelection();
  window.addEventListener("resize", () => syncCabinPanelVisibility({ scroll: false }));
});

// Expose local methods for inline handlers and note/play pages that return to Index sections.
window.handleStageImageFallback = handleStageImageFallback;
window.showSection = showSection;
window.showCabinPanel = showCabinPanel;
window.toggleCertificateWall = toggleCertificateWall;
window.closeModal = closeModal;
window.showModal = showModal;
window.sendMessage = sendMessage;
window.handleNoteClick = handleNoteClick;
window.handlePlayClick = handlePlayClick;
window.handleRootGateClick = handleRootGateClick;
window.openCertificateFrame = openCertificateFrame;
window.confirmResetProgress = confirmResetProgress;
window.resetAllProgress = resetAllProgress;
window.handlePrologueChoice = handlePrologueChoice;
window.savePlayerIdentity = savePlayerIdentity;
window.readPlayerProfile = readPlayerProfile;
window.renderPlayerIdentityState = renderPlayerIdentityState;
window.readTrailStateSnapshot = readTrailStateSnapshot;
window.writeTrailStateSnapshot = writeTrailStateSnapshot;

window.goToIndexSection = function(section) {
  showSection(normalizeSectionName(section), { scroll: true });
  return false;
};
