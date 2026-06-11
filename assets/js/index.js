/* index.js — Math Ridge Journey Hub local logic.
   Shared mobile drawer/navigation shell comes from math-ridge-shell.js. */

const lessons = [
  { id: "1_1", section: "1-1", tag: "Terms", title: "Terms", description: "Positive and negative terms. Addition and subtraction as term behavior.", noteFile: "note1.html", playFile: "play1.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "1_2", section: "1-2", tag: "Teams", title: "Team Terms", description: "Group many terms into two teams before combining.", noteFile: "note2.html", playFile: "play2.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "1_3", section: "1-3", tag: "Signs", title: "Sign Simplify", description: "Many signs simplify into one final sign behavior.", noteFile: "note3.html", playFile: "play3.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "1_4", section: "1-4", tag: "Chunking", title: "Chunking", description: "Multiplication, grouping, and distribution without negative signs yet.", noteFile: "note4.html", playFile: "play4.html", chapter: "Chapter 1: Term Vision", chapterNote: "Recognize terms before calculating." },
  { id: "2_1a", section: "2-1a", tag: "Split", title: "Split Shelf", description: "Break large shelf numbers into friendly chunks before dividing.", noteFile: "note2-1a.html", playFile: "play2-1a.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." },
  { id: "2_1", section: "2-1b", tag: "Shelves", title: "Fraction Shelves", description: "Top shelf and bottom shelf. Equal fractions and reduction.", noteFile: "note5.html", playFile: "play5.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." },
  { id: "2_2", section: "2-2", tag: "Prime", title: "Prime Pieces", description: "Break values into 2, 3, 5, and 7 quickly.", noteFile: "note6.html", playFile: "play6.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." },
  { id: "2_3", section: "2-3", tag: "Fractions", title: "Fraction Products", description: "Use prime pieces across top and bottom shelves.", noteFile: "note7.html", playFile: "play7.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." },
  { id: "2_4", section: "2-4", tag: "Exponents", title: "Exponential Count", description: "Repeated prime pieces become counted pieces.", noteFile: "note8.html", playFile: "play8.html", chapter: "Chapter 2: Prime Element Vision", chapterNote: "See values as prime pieces before making them bigger." }
];

const certificateTitles = {
  "1_1": "Signed Term Structure",
  "1_2": "Positive and Negative Term Balance",
  "1_3": "Sign Simplification Fluency",
  "1_4": "Distribution and Grouping Foundations",
  "2_1a": "Split Shelf Division",
  "2_1": "Fraction Equivalence and Reduction",
  "2_2": "Prime Factorization Fluency",
  "2_3": "Fraction Product Structure",
  "2_4": "Exponential Pattern Recognition"
};

const certificateList = lessons.map(({ id, section, title, playFile }) => ({
  id,
  section,
  title,
  playFile,
  certificateTitle: certificateTitles[id] || title
}));

const stageCardThemes = {
  "1_1": "stage-1-1-trail-start",
  "1_2": "stage-1-2-mountain-peak",
  "1_3": "stage-1-3-mountain-trail",
  "1_4": "stage-1-4-mountain-cabin",
  "2_1a": "stage-2-1-mountain-library",
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

const TEST_RESULT_CERTIFICATE_IMAGE = "assets/images/test-results/math_ridge_certificate_mastery_template_true_alpha.png?v=20260608-mastery-certificate";
const TEST_RESULT_CERTIFICATE_TEMPLATE = {
  src: TEST_RESULT_CERTIFICATE_IMAGE,
  width: 1122,
  height: 1402
};
const TEST_CERT_SERIF = '"Playfair Display", "Palatino Linotype", Georgia, serif';
const TEST_CERT_SCRIPT = '"Snell Roundhand", "Bickham Script Pro", "Edwardian Script ITC", "Brush Script MT", "Segoe Script", cursive';
let testCertificateTemplateImage = null;
let testCertificateTemplatePromise = null;

const chapterTests = [
  {
    id: "chapter_1",
    chapter: "Chapter 1 Test",
    range: "Covers 1-1 to 1-4",
    title: "Term Vision Mastery Assessment",
    masteryTitle: "Signed Term Structure",
    assessmentTitle: "Term Vision Mastery Assessment",
    checkpointTitle: "",
    bodyText: "Awarded for demonstrating mastery in recognizing terms, interpreting sign behavior, and evaluating signed expressions through structural reasoning.",
    image: TEST_RESULT_CERTIFICATE_IMAGE,
    storageKeys: ["mathRidge_testResult_chapter_1", "mathRidge_testResult_chapter1"],
    dataKey: "mathRidge_testResult_chapter_1_data",
    attemptsKey: "mathRidge_testAttempts_chapter_1",
    historyKey: "mathRidge_testAttemptHistory_chapter_1",
    note: "Pass the Root Gate Exam to open Chapter 2."
  },
  {
    id: "chapter_2",
    chapter: "Chapter 2 Test",
    range: "Covers 2-1a to 2-4",
    title: "Prime Element Vision Mastery Assessment",
    masteryTitle: "Prime Element Structure",
    assessmentTitle: "Prime Element Vision Mastery Assessment",
    checkpointTitle: "",
    bodyText: "Awarded for demonstrating mastery in seeing values as prime pieces, simplifying fraction structures, and tracking repeated factors.",
    image: TEST_RESULT_CERTIFICATE_IMAGE,
    storageKeys: ["mathRidge_testResult_chapter_2", "mathRidge_testResult_chapter2"],
    dataKey: "mathRidge_testResult_chapter_2_data",
    attemptsKey: "mathRidge_testAttempts_chapter_2",
    historyKey: "mathRidge_testAttemptHistory_chapter_2",
    note: "Pass the Prime Element Vision Test to save this Chapter 2 mastery result."
  }
];

function storageKeyNote(id) { return `mathRidge_noteComplete_${id}`; }
function storageKeyNoteUnlocked(id) { return `mathRidge_noteUnlocked_${id}`; }
function storageKeyPlayComplete(id) { return `mathRidge_playComplete_${id}`; }
function storageKeyCert(id) { return `mathRidge_cert_${id}`; }

const TRAIL_STATE_KEY = "mathRidge_trail_state_v1";
const STAGE_REVEAL_HINT_KEY = "mathRidge_stageRevealHintSeen_v1";
const PLAYER_PROFILE_KEY = "mathRidge_playerProfile_v1";
const CERTIFICATE_FULL_NAME_KEY = "mathRidge_certificateFullName_v1";
const PROLOGUE_SEEN_KEY = "mathRidge_prologueSeen_v1";
const STORY_COMPLETE_1_1_KEY = "mathRidge_storyComplete_1_1";
const TERM_MANUAL_UNLOCK_KEY = storageKeyNoteUnlocked("1_1");
const ROOT_GATE_UNLOCK_KEY = "mathRidge_rootGateUnlocked_chapter_1";
const ROOT_GATE_PASS_KEY = "mathRidge_rootGatePassed_chapter_1";
const ROOT_GATE_INTRO_KEY = "mathRidge_storyComplete_root_gate_intro";
const CHAPTER_ONE_TEST_PASS_KEY = "mathRidge_testPassed_chapter_1";
const CHAPTER_TWO_TEST_PASS_KEY = "mathRidge_testPassed_chapter_2";
const CHAPTER_TWO_TEST_SETUP_STORY_KEY = "mathRidge_storyComplete_chapter_2_test_setup";
const CHAPTER_TWO_ENDING_STORY_KEY = "mathRidge_storyComplete_chapter_2_ending";

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
function isChapterTwoRelicsComplete() {
  return ["2_1a", "2_1", "2_2", "2_3", "2_4"].every(id => hasCertificate(id) || hasCompletedPlay(id));
}
function isRootGateUnlocked() {
  return isRootGatePassed() ||
    localStorage.getItem(ROOT_GATE_UNLOCK_KEY) === "true" ||
    isChapterOneRelicsComplete();
}
function isChapterTwoTestPassed() {
  return localStorage.getItem(CHAPTER_TWO_TEST_PASS_KEY) === "true";
}
function hasStoryFlag(key) {
  try { return localStorage.getItem(key) === "true"; }
  catch (error) { return false; }
}
function hasWatchedChapterTwoTestSetup() {
  return hasStoryFlag(CHAPTER_TWO_TEST_SETUP_STORY_KEY);
}
function hasWatchedChapterTwoEnding() {
  return hasStoryFlag(CHAPTER_TWO_ENDING_STORY_KEY);
}
function isChapterTwoTestUnlocked() {
  return isChapterTwoTestPassed() || isChapterTwoRelicsComplete() || hasCertificate("2_4") || hasCompletedPlay("2_4");
}
function chapterTwoTestHref() {
  if (!isChapterTwoTestUnlocked()) return "#";
  if (isChapterTwoTestPassed() && !hasWatchedChapterTwoEnding()) return "story-chapter-2-ending.html";
  if (!hasWatchedChapterTwoTestSetup()) return "story-chapter-2-test-setup.html";
  return "chapter-2-test.html";
}
function chapterTwoTestActionText() {
  if (!isChapterTwoTestUnlocked()) return "Locked";
  if (isChapterTwoTestPassed() && !hasWatchedChapterTwoEnding()) return "Watch Ending";
  if (!hasWatchedChapterTwoTestSetup()) return "Gate Setup";
  return isChapterTwoTestPassed() ? "Review / Retake" : "Begin Test";
}

function hasWatchedRootGateIntro() {
  try {
    return isRootGatePassed() || localStorage.getItem(ROOT_GATE_INTRO_KEY) === "true";
  } catch (error) {
    return isRootGatePassed();
  }
}

function rootGateHref() {
  if (!isRootGateUnlocked()) return "#";
  return isRootGatePassed() || hasWatchedRootGateIntro()
    ? "root-gate-test.html"
    : "story-root-gate.html";
}

function rootGateActionText() {
  if (!isRootGateUnlocked()) return "Locked";
  if (isRootGatePassed()) return "Review / Retake";
  return hasWatchedRootGateIntro() ? "Begin Trial" : "Begin Finale";
}

function rootGateReplayLinks(className = "root-gate-watch-link") {
  if (!isRootGateUnlocked() || !hasWatchedRootGateIntro()) return "";

  const links = [
    `<a class="${className}" href="story-root-gate.html?watch=1">${isRootGatePassed() ? "Replay Trial Setup" : "Watch Scene"}</a>`
  ];

  if (isRootGatePassed()) {
    links.push(`<a class="${className}" href="story-root-gate-result.html?outcome=pass&watch=1">Watch Gate Opening</a>`);
    links.push(`<a class="${className}" href="story-chapter-2.html?watch=1">Chapter 2 Opening</a>`);
  }

  return links.join("");
}

function rootGateWatchSceneLink(className = "root-gate-watch-link") {
  return rootGateReplayLinks(className);
}

function isNoteUnlocked(index) {
  const lesson = lessons[index];

  if (lesson.chapter.startsWith("Chapter 2")) {
    if (!isRootGatePassed()) return false;
    if (lesson.id === "2_1a") return true;
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

function cleanCertificateName(value, fallback = "Math Ridge Scholar") {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, 48) : fallback;
}

function readPlayerProfile() {
  return readJSONStorage(PLAYER_PROFILE_KEY) || {};
}

function preferredCertificateName(data = null) {
  const profile = readPlayerProfile();
  const savedFullName = (() => {
    try { return localStorage.getItem(CERTIFICATE_FULL_NAME_KEY); } catch (error) { return ""; }
  })();
  const earnedCert = lessons
    .map(lesson => readCertificate(lesson.id))
    .find(cert => cert?.studentName || cert?.certificateName);

  return cleanCertificateName(
    data?.studentName ||
    data?.certificateName ||
    savedFullName ||
    profile.certificateName ||
    profile.playerName ||
    profile.nickname ||
    earnedCert?.studentName ||
    earnedCert?.certificateName
  );
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
        ${chapter.startsWith("Chapter 2") ? renderChapterTwoTestCard() : ""}
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
  const watchedIntro = hasWatchedRootGateIntro();
  const status = passed ? "Gate opened" : unlocked ? watchedIntro ? "Trial ready" : "Finale ready" : "Four relics required";
  const href = rootGateHref();

  return `
    <article class="root-gate-card ${unlocked ? "" : "locked"} ${passed ? "passed" : ""}" aria-label="Root Gate Chapter 1 checkpoint">
      <div class="root-gate-mark" aria-hidden="true">I</div>
      <div class="root-gate-copy">
        <span>Chapter 1 Checkpoint</span>
        <h3>Root Gate Finale</h3>
        <p>The four relics have led to an ancient gate beneath Math Ridge. Watch the finale, face the gate's challenge, and prove the lower trail is truly yours.</p>
      </div>
      <div class="root-gate-actions">
        <strong>${escapeHTML(status)}</strong>
        <a class="small-link root-gate-link ${unlocked ? "" : "locked"}" href="${href}" onclick="return handleRootGateClick(event)">${rootGateActionText()}</a>
      </div>
    </article>
  `;
}

function renderChapterTwoTestCard() {
  const unlocked = isChapterTwoTestUnlocked();
  const passed = isChapterTwoTestPassed();
  const status = !unlocked
    ? "Five relics required"
    : passed && !hasWatchedChapterTwoEnding()
      ? "Ending ready"
      : !hasWatchedChapterTwoTestSetup()
        ? "Setup ready"
        : passed
          ? "Mastery proven"
          : "Test ready";
  const href = chapterTwoTestHref();

  return `
    <article class="root-gate-card chapter-two-test-card ${unlocked ? "" : "locked"} ${passed ? "passed" : ""}" aria-label="Chapter 2 Prime Element Vision checkpoint">
      <div class="root-gate-mark" aria-hidden="true">II</div>
      <div class="root-gate-copy">
        <span>Chapter 2 Checkpoint</span>
        <h3>Prime Element Vision Test</h3>
        <p>The five Chapter 2 climbs gather into one proof: split shelves, reduce fractions, factor values, handle fraction products, and pack repeated prime copies with exponents.</p>
      </div>
      <div class="root-gate-actions">
        <strong>${escapeHTML(status)}</strong>
        <a class="small-link root-gate-link chapter-two-test-link ${unlocked ? "" : "locked"}" href="${href}" onclick="return handleChapterTwoTestClick(event)">${chapterTwoTestActionText()}</a>
      </div>
    </article>
  `;
}

function stageRelicName(id) {
  const relics = {
    "1_1": "The Term Stone",
    "1_2": "The Sign Compass",
    "1_3": "The Parity Prism",
    "1_4": "The Factor Forge",
    "2_1a": "The Shelf Scale",
    "2_1": "The Shelf Scale",
    "2_2": "The Primewood Seed",
    "2_3": "The Fraction Loom",
    "2_4": "The Power Tally"
  };
  return relics[id] || "";
}

function stageRelicImage(id) {
  const relicImages = {
    "1_1": "assets/images/relic/term_stone.png",
    "1_2": "assets/images/relic/sign_compass_relic_alpha.png",
    "1_3": "assets/images/relic/parity_prism_true_alpha.png",
    "1_4": "assets/images/relic/factor_forge_alpha.png",
    "2_1a": "assets/images/relic/shelf_scale_inactive.png",
    "2_1": "assets/images/relic/Shelf_Scale_Relic_True_Alpha.png",
    "2_2": "assets/images/relic/primewood_seed_relic_preview.png",
    "2_3": "assets/images/relic/fraction_loom_relic_preview.png",
    "2_4": "assets/images/relic/power_tally_relic_preview.png"
  };
  const relicVersions = {
    "2_2": "20260610-primewood-preview",
    "2_3": "20260610-fraction-loom-preview",
    "2_4": "20260610-power-tally-preview"
  };
  const version = relicVersions[id] || "20260609-relic-preview";
  return relicImages[id] ? `${relicImages[id]}?v=${version}` : "";
}

function unversionedAssetPath(src) {
  return String(src || "").split("?")[0];
}

function stageRelicKind(id) {
  return id.startsWith("2_") ? "Vision Relic" : "Relic";
}

function stageRelicConcept(id) {
  const concepts = {
    "1_1": "A term has a sign direction and a size. Compare the sizes first, then let the sign tell the final direction.",
    "1_2": "Sort positive and negative terms into teams before combining. The larger team size decides which sign remains.",
    "1_3": "Add each signed team first, then compare the positive total and negative total as one clean structure.",
    "1_4": "Repeated addition can become a chunk plan. Break a big count into friendly pieces, then combine the results.",
    "2_1a": "Large division can be split into friendly chunks. Divide each chunk, then add the chunk answers back together.",
    "2_1": "Fractions are top and bottom shelves. Matching pieces can be removed together while the value stays equivalent.",
    "2_2": "Numbers are built from prime pieces. Break values into 2, 3, 5, 7, and what remains.",
    "2_3": "Fraction products are easier when top and bottom shelves are written as prime pieces before simplifying.",
    "2_4": "Repeated prime pieces can be counted with exponents instead of being written again and again."
  };
  return concepts[id] || "";
}

function isRelicGathered(lesson) {
  return Boolean(lesson && (hasCertificate(lesson.id) || hasCompletedPlay(lesson.id)));
}

function relicVaultStatus(lesson) {
  const index = lessonIndex(lesson.id);
  if (isRelicGathered(lesson)) {
    return lesson.id === "2_1a" ? "Dormant Found" : "Gathered";
  }
  if (isPlayUnlocked(index)) return "Ready To Earn";
  if (isNoteUnlocked(index)) return "Concept Preview";
  return "Hidden";
}

function renderRelicVaultCard(lesson) {
  const gathered = isRelicGathered(lesson);
  const relicName = stageRelicName(lesson.id) || lesson.title;
  const relicImage = stageRelicImage(lesson.id);
  const status = relicVaultStatus(lesson);
  const certificateTitle = certificateTitles[lesson.id] || lesson.title;
  const dormantClass = lesson.id === "2_1a" ? "dormant" : "";
  const relicId = escapeHTML(lesson.id);

  return `
    <article class="relic-card ${gathered ? "gathered" : "locked"} ${dormantClass}" data-relic-id="${relicId}">
      <div class="relic-card-art" aria-hidden="true">
        <span class="relic-display-light"></span>
        ${relicImage ? `<img class="relic-floating-img" src="${escapeHTML(relicImage)}" data-fallback-src="${escapeHTML(unversionedAssetPath(relicImage))}" alt="" loading="lazy" decoding="async" onerror="handleRelicPreviewError(this)">` : `<span class="relic-missing-mark">?</span>`}
      </div>
      <div class="relic-card-body">
        <span class="relic-stage">${escapeHTML(lesson.section)} ${escapeHTML(lesson.tag)}</span>
        <h3>${escapeHTML(relicName)}</h3>
        <strong class="relic-status">${escapeHTML(status)}</strong>
        <p>${escapeHTML(stageRelicConcept(lesson.id) || lesson.description)}</p>
        <em>${escapeHTML(certificateTitle)}</em>
      </div>
    </article>
  `;
}

function handleRelicPreviewError(img) {
  const fallbackSrc = img?.dataset?.fallbackSrc || "";
  if (fallbackSrc && img.dataset.fallbackTried !== "true") {
    img.dataset.fallbackTried = "true";
    img.src = fallbackSrc;
    return;
  }

  const mark = document.createElement("span");
  mark.className = "relic-missing-mark";
  mark.textContent = "?";
  img.replaceWith(mark);
}

function renderRelicVault() {
  const vault = document.getElementById("relicVault");
  if (!vault) return;

  const gatheredCount = lessons.filter(isRelicGathered).length;
  const progress = document.getElementById("relicVaultProgress");
  if (progress) progress.textContent = `Relics gathered: ${gatheredCount} / ${lessons.length}`;

  vault.innerHTML = lessons.map(renderRelicVaultCard).join("");
}

function stageRelicProofState(id, relicKind) {
  if (id === "2_1a") {
    return {
      className: "dormant-relic",
      label: `${relicKind} Found`,
      status: "Dormant"
    };
  }

  return {
    className: "",
    label: `${relicKind} Obtained`,
    status: "Completed"
  };
}

function earnedStageProof(lesson) {
  const relicName = stageRelicName(lesson.id);
  if (lesson.id === "2_1a" && relicName) return `${relicName} dormant`;
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
  const relicKind = stageRelicKind(lesson.id);
  const relicState = stageRelicProofState(lesson.id, relicKind);
  const relicProof = earned && relicName
    ? `<div class="stage-relic-proof ${relicImage ? "has-image" : ""} ${relicKind === "Vision Relic" ? "vision-relic" : ""} ${relicState.className}" data-relic-id="${escapeHTML(lesson.id)}" aria-label="${escapeHTML(relicName)} ${escapeHTML(relicState.status.toLowerCase())}">${relicImage ? `<img class="stage-relic-img" src="${escapeHTML(relicImage)}" data-fallback-src="${escapeHTML(unversionedAssetPath(relicImage))}" alt="" loading="lazy" decoding="async" onerror="handleRelicPreviewError(this)">` : ""}<span>${escapeHTML(relicState.label)}</span><strong>${escapeHTML(relicName)}</strong><em>${escapeHTML(relicState.status)}</em></div>`
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

  wrap.innerHTML = renderMenuStoryArchive() + chapters.map(chapter => {
    const items = lessons.filter(lesson => lesson.chapter === chapter);
    return `
      <div class="quick-box">
        <h3>${escapeHTML(chapter.replace(":", " —"))}</h3>
        <div class="link-list">
          ${items.map(renderMenuNotePlay).join("")}
        </div>
        ${chapter.startsWith("Chapter 1") ? renderMenuRootGateLink() : ""}
        ${chapter.startsWith("Chapter 2") ? renderMenuChapterTwoTestLink() : ""}
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

function renderMenuStoryArchive() {
  const chapterTwoSetupReplay = hasWatchedChapterTwoTestSetup()
    ? `<a class="jump-link story-jump" href="story-chapter-2-test-setup.html?watch=1"><span><i aria-hidden="true">2</i> Primewood Gate Trial Setup</span><strong>Replay</strong></a>`
    : "";
  const chapterTwoEndingReplay = hasWatchedChapterTwoEnding()
    ? `<a class="jump-link story-jump" href="story-chapter-2-ending.html?watch=1"><span><i aria-hidden="true">2</i> Season 1 Ending</span><strong>Replay</strong></a>`
    : "";

  return `
    <div class="quick-box story-archive-box">
      <h3>Story Archive</h3>
      <p class="quick-box-note">Replay the story scenes and opening pages collected so far.</p>
      <div class="link-list story-link-list">
        <a class="jump-link story-jump" href="prologue.html"><span><i aria-hidden="true">P</i> Begin Prologue Story</span><strong>Opening</strong></a>
        <a class="jump-link story-jump" href="story-stage-1-1.html?watch=1"><span><i aria-hidden="true">1</i> 1-1 Story Scene</span><strong>Replay</strong></a>
        ${chapterTwoSetupReplay}
        ${chapterTwoEndingReplay}
      </div>
    </div>
  `;
}

function renderMenuRootGateLink() {
  const unlocked = isRootGateUnlocked();
  const passed = isRootGatePassed();
  const href = rootGateHref();
  return `
    <a class="jump-link root-gate-jump ${unlocked ? "" : "locked"}" href="${href}" onclick="return handleRootGateClick(event)">
      <span><i aria-hidden="true">I</i> Root Gate Finale</span><strong>${passed ? "Passed" : unlocked ? hasWatchedRootGateIntro() ? "Trial" : "Ready" : "Locked"}</strong>
    </a>
    ${rootGateWatchSceneLink("jump-link root-gate-replay-jump")}
  `;
}

function renderMenuChapterTwoTestLink() {
  const unlocked = isChapterTwoTestUnlocked();
  const passed = isChapterTwoTestPassed();
  const status = !unlocked
    ? "Locked"
    : passed && !hasWatchedChapterTwoEnding()
      ? "Ending"
      : !hasWatchedChapterTwoTestSetup()
        ? "Setup"
        : passed
          ? "Passed"
          : "Ready";
  return `
    <a class="jump-link chapter-two-test-jump ${unlocked ? "" : "locked"}" href="${chapterTwoTestHref()}" onclick="return handleChapterTwoTestClick(event)">
      <span><i aria-hidden="true">II</i> Prime Element Vision Test</span><strong>${status}</strong>
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

function handleChapterTwoTestClick(event) {
  if (!isChapterTwoTestUnlocked()) {
    event.preventDefault();
    showModal("Chapter 2 Test Locked", "Complete the Chapter 2 trail through 2-4 before attempting the Prime Element Vision Test.", [
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
    const certificateTitle = cert?.certificateTitle || item.certificateTitle || item.title;
    const actionText = earned ? "Official printout ready" : "Complete trail to unlock";
    const statusText = earned ? "Earned" : "Locked";
    const ariaLabel = earned
      ? `View and download ${item.section} ${certificateTitle} certificate`
      : `${item.section} ${certificateTitle} certificate locked`;

    return `
      <button class="certificate-frame ${earned ? "earned" : "not-earned"}" type="button" onclick="openCertificateFrame('${item.id}')" aria-label="${escapeHTML(ariaLabel)}">
        <div class="certificate-mini">
          <div class="mini-cert-school">Math Ridge Official Record</div>
          <div class="mini-cert-rule" aria-hidden="true"></div>
          <div class="mini-cert-seal" aria-hidden="true"><span>MR</span></div>
          <strong>${item.section}</strong>
          <span class="mini-cert-title">${escapeHTML(certificateTitle)}</span>
          <div class="cert-status">${statusText}</div>
          ${earned ? `<div class="cert-name">${escapeHTML(name)}</div>` : `<div class="cert-name locked-name">Awaiting Achievement</div>`}
          ${earned ? `<div class="cert-date">${escapeHTML(date)}</div>` : ""}
          <div class="cert-date">${actionText}</div>
        </div>
      </button>
    `;
  }).join("");

  writeTrailStateSnapshot();
}

function certificateVaultChapterTitle(chapter) {
  const concept = String(chapter || "").split(":").slice(1).join(":").trim();
  return concept ? `${concept} Shelf` : "Certificate Shelf";
}

function certificateVaultLengthClass(text) {
  const length = String(text || "").length;
  if (length >= 36) return " is-extra-long";
  if (length >= 28) return " is-long";
  return "";
}

function certificateVaultTitleLengthClass(text) {
  const length = String(text || "").length;
  if (length >= 36) return " is-ultra-long";
  if (length >= 31) return " is-extra-long";
  if (length >= 24) return " is-long";
  return "";
}

function renderCertificateVaultCard(item) {
  const lesson = lessons.find(entry => entry.id === item.id);
  const cert = readCertificate(item.id);
  const earned = Boolean(cert && cert.completed);
  const name = earned ? (cert.studentName || cert.name || "Student") : "";
  const date = earned ? certificateDateText(cert) : "Not earned yet";
  const certificateTitle = cert?.certificateTitle || item.certificateTitle || item.title;
  const lessonTag = lesson?.tag || item.title;
  const titleClass = certificateVaultTitleLengthClass(certificateTitle);
  const nameClass = certificateVaultLengthClass(name);
  const tagClass = certificateVaultLengthClass(lessonTag);
  const ariaLabel = earned
    ? `View ${item.section} ${certificateTitle} certificate`
    : `${item.section} ${certificateTitle} certificate is not earned yet.`;

  return `
    <article class="certificate-vault-card ${earned ? "earned" : "not-earned"}" role="group" aria-label="${escapeHTML(ariaLabel)}">
      <span class="certificate-vault-stage">${escapeHTML(item.section)}</span>
      <span class="certificate-vault-title${titleClass}">${escapeHTML(certificateTitle)}</span>
      ${earned ? `<span class="certificate-vault-name${nameClass}">${escapeHTML(name)}</span>` : ""}
      <span class="certificate-vault-date">${escapeHTML(date)}</span>
      <span class="certificate-vault-lesson${tagClass}">${escapeHTML(lessonTag)}</span>
      <button class="certificate-vault-view-button" type="button" data-certificate-id="${escapeHTML(item.id)}" onclick="openCertificateFrame('${item.id}')" aria-label="${escapeHTML(earned ? `Click to view ${item.section} official certificate` : `Click to view ${item.section} certificate message`)}"></button>
    </article>
  `;
}

function renderCertificateVaultShelf(chapter) {
  const chapterItems = certificateList.filter(item => {
    const lesson = lessons.find(entry => entry.id === item.id);
    return lesson?.chapter === chapter;
  });

  return `
    <section class="certificate-shelf" aria-label="${escapeHTML(certificateVaultChapterTitle(chapter))}">
      <div class="certificate-shelf-heading">
        <div>
          <h3>${escapeHTML(certificateVaultChapterTitle(chapter))}</h3>
        </div>
      </div>
      <div class="certificate-carousel" role="list">
        ${chapterItems.map(item => `<div class="certificate-carousel-item" role="listitem">${renderCertificateVaultCard(item)}</div>`).join("")}
      </div>
    </section>
  `;
}

function renderCertificateVault() {
  const shelves = document.getElementById("certificateVaultShelves");
  if (!shelves) return;

  const chapters = [...new Set(lessons.map(lesson => lesson.chapter))];
  shelves.innerHTML = chapters.map(renderCertificateVaultShelf).join("");
  const display = document.getElementById("certificateVaultDisplay");
  if (display?.dataset?.mode === "tests") renderTestResults("certificateVaultTestResults");
  writeTrailStateSnapshot();
}

function showCertificateVaultMode(mode = "shelves") {
  const nextMode = mode === "tests" ? "tests" : "shelves";
  const panel = document.querySelector(".certificate-vault-panel");
  const display = document.getElementById("certificateVaultDisplay");
  const testsPanel = document.getElementById("certificateVaultTestsPanel");
  const modeButton = document.getElementById("certificateVaultModeButton");

  if (display) display.dataset.mode = nextMode;
  panel?.classList.toggle("showing-tests", nextMode === "tests");
  if (modeButton) {
    modeButton.textContent = nextMode === "tests" ? "Achievement Certificates" : "Mastery Certificates";
    modeButton.setAttribute("aria-label", nextMode === "tests" ? "Show achievement certificates" : "Show mastery certificates");
  }

  if (testsPanel) testsPanel.hidden = nextMode !== "tests";
  if (nextMode === "tests") renderTestResults("certificateVaultTestResults");
}

function toggleCertificateVaultMode() {
  const display = document.getElementById("certificateVaultDisplay");
  const currentMode = display?.dataset?.mode === "tests" ? "tests" : "shelves";
  showCertificateVaultMode(currentMode === "tests" ? "shelves" : "tests");
}

function isLegacyTestResultImage(value) {
  const src = String(value || "").trim();
  return !src ||
    src.startsWith("data:image/svg") ||
    src.includes("math_ridge_certificate_test-result.png") ||
    src.includes("chapter-1-test-result.svg") ||
    src.includes("chapter-2-test-result.svg");
}

function readTestResultImage(test) {
  for (const key of test.storageKeys || []) {
    const saved = localStorage.getItem(key);
    if (saved && !isLegacyTestResultImage(saved)) return saved;
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

function testMasteryStatus(data) {
  if (!data) return "Awaiting Attempt";
  const percent = Number(data.percent);
  if (!data.passed) return "Retry Recommended";
  if (Number.isFinite(percent) && percent >= 95) return "Passed with Distinction";
  return "Passed";
}

function testCertificateDetails(test) {
  const data = readTestResultData(test);
  const total = Number(data?.totalQuestions || 40);
  const correct = Number(data?.correct || 0);
  const percent = data ? formatTestPercent(data.percent) : "--";
  const date = formatTestDate(data?.completedAt);
  return {
    data,
    studentName: preferredCertificateName(data),
    masteryTitle: test.masteryTitle || test.title,
    bodyText: test.bodyText || "Awarded for demonstrating mastery through careful mathematical reasoning.",
    assessmentTitle: test.assessmentTitle || test.chapter.replace(" Test", " Mastery Assessment"),
    checkpointTitle: test.checkpointTitle ?? test.title,
    scoreText: data ? `${correct} / ${total}` : "-- / 40",
    performanceText: percent,
    statusText: testMasteryStatus(data),
    dateText: date ? `Completed on ${date}` : "Official result awaits"
  };
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

function renderTestCertificateOverlay(test) {
  const details = testCertificateDetails(test);
  const assessmentLines = [details.assessmentTitle, details.checkpointTitle].filter(Boolean);
  const assessmentText = assessmentLines.map(escapeHTML).join("<br>");

  if (!details.data) {
    return `
      <div class="result-certificate-overlay mastery pending">
        <span class="result-cert-pending-assessment">${assessmentText}</span>
        <em class="result-cert-pending-date">Official Result Awaits</em>
      </div>
    `;
  }

  return `
    <div class="result-certificate-overlay mastery ${details.data.passed ? "passed" : "retry"}">
      <strong class="result-cert-title">${escapeHTML(details.masteryTitle)}</strong>
      <span class="result-cert-name">${escapeHTML(details.studentName)}</span>
      <span class="result-cert-body">${escapeHTML(details.bodyText)}</span>
      <span class="result-cert-assessment">${assessmentText}</span>
      <span class="result-cert-score">
        Final Score: ${escapeHTML(details.scoreText)}<br>
        Performance: ${escapeHTML(details.performanceText)}<br>
        Status: ${escapeHTML(details.statusText)}
      </span>
      <em class="result-cert-date">${escapeHTML(details.dateText)}</em>
    </div>
  `;
}

function renderTestResults(targetId = "") {
  const grids = targetId
    ? [document.getElementById(targetId)].filter(Boolean)
    : Array.from(document.querySelectorAll("[data-test-results-grid]"));
  if (!grids.length) return;

  const html = chapterTests.map(test => {
    const data = readTestResultData(test);
    const image = data ? readTestResultImage(test) : test.image;
    return `
      <article class="test-result-card">
        <h4>${escapeHTML(test.chapter)}</h4>
        <p><strong>${escapeHTML(test.title)}</strong><br>${escapeHTML(test.range)}</p>
        <div class="result-image-frame test-certificate-frame ${data ? (data.passed ? "passed" : "retry") : "pending"}">
          <img src="${escapeHTML(image)}" alt="${escapeHTML(test.chapter)} result preview" />
          ${renderTestCertificateOverlay(test)}
        </div>
        ${renderTestResultStats(test)}
        <div class="result-note">${escapeHTML(test.note)}</div>
        ${data ? `
          <div class="result-card-actions test-result-save-actions">
            <button class="pill-btn result-save-btn" type="button" onclick="downloadTestCertificate('${test.id}')">Save Mastery Certificate</button>
          </div>
        ` : ""}
      </article>
    `;
  }).join("");

  grids.forEach(grid => {
    grid.innerHTML = html;
  });
  prepareTestCertificateDownloadAssets();
}

function setTestCanvasFont(ctx, { style = "", weight = "", size = 32, family = TEST_CERT_SERIF } = {}) {
  ctx.font = [style, weight, `${Math.round(size)}px`, family].filter(Boolean).join(" ");
}

function fitTestCanvasFont(ctx, text, { style = "", weight = "", maxSize = 64, minSize = 20, family = TEST_CERT_SERIF, maxWidth = 800 } = {}) {
  let size = maxSize;
  do {
    setTestCanvasFont(ctx, { style, weight, size, family });
    if (ctx.measureText(String(text || "")).width <= maxWidth || size <= minSize) break;
    size -= 2;
  } while (size >= minSize);
  return size;
}

function wrapTestCanvasLines(ctx, text, maxWidth) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawTestCenteredText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const lines = wrapTestCanvasLines(ctx, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + Math.max(0, lines.length - 1) * lineHeight;
}

function waitForTestCertificateFonts() {
  try {
    if (document.fonts?.ready) return document.fonts.ready.catch(() => {});
  } catch (error) {}
  return Promise.resolve();
}

function loadTestCertificateTemplate() {
  if (testCertificateTemplateImage?.complete && testCertificateTemplateImage.naturalWidth) {
    return Promise.resolve(testCertificateTemplateImage);
  }
  if (testCertificateTemplatePromise) return testCertificateTemplatePromise;

  testCertificateTemplatePromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      testCertificateTemplateImage = image;
      resolve(image);
    };
    image.onerror = reject;
    image.src = TEST_RESULT_CERTIFICATE_TEMPLATE.src;
  });

  return testCertificateTemplatePromise;
}

function prepareTestCertificateDownloadAssets() {
  loadTestCertificateTemplate().catch(() => {});
  waitForTestCertificateFonts();
}

function findLoadedTestCertificateTemplate() {
  const templatePath = TEST_RESULT_CERTIFICATE_TEMPLATE.src.split("?")[0];
  const previewImage = document.querySelector(`.test-certificate-frame img[src*="${templatePath}"]`);
  if (previewImage?.complete && previewImage.naturalWidth) return previewImage;
  if (testCertificateTemplateImage?.complete && testCertificateTemplateImage.naturalWidth) {
    return testCertificateTemplateImage;
  }
  return null;
}

function createTestCertificateCanvas(test, templateImage = null) {
  const details = testCertificateDetails(test);
  const canvas = document.createElement("canvas");
  canvas.width = Number(templateImage?.naturalWidth || TEST_RESULT_CERTIFICATE_TEMPLATE.width);
  canvas.height = Number(templateImage?.naturalHeight || TEST_RESULT_CERTIFICATE_TEMPLATE.height);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  if (templateImage?.complete && templateImage.naturalWidth) {
    ctx.drawImage(templateImage, 0, 0, width, height);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#4f351c";
  ctx.shadowColor = "rgba(255,255,255,0.72)";
  ctx.shadowBlur = 5;

  const rawTitleSize = fitTestCanvasFont(ctx, details.masteryTitle, {
    weight: "700",
    maxSize: width * 0.039,
    minSize: width * 0.024,
    family: TEST_CERT_SERIF,
    maxWidth: width * 0.64
  });
  const rawTitleLineCount = wrapTestCanvasLines(ctx, details.masteryTitle, width * 0.64).slice(0, 2).length;
  const titleSize = rawTitleLineCount > 1 ? Math.min(rawTitleSize, width * 0.033) : rawTitleSize;
  setTestCanvasFont(ctx, { weight: "700", size: titleSize, family: TEST_CERT_SERIF });
  const titleLineCount = wrapTestCanvasLines(ctx, details.masteryTitle, width * 0.64).slice(0, 2).length;
  drawTestCenteredText(
    ctx,
    details.masteryTitle,
    width / 2,
    height * (titleLineCount > 1 ? 0.270 : 0.282),
    width * 0.64,
    height * (titleLineCount > 1 ? 0.023 : 0.030),
    2
  );

  ctx.fillStyle = "#4d2d12";
  ctx.shadowBlur = 8;
  const nameSize = fitTestCanvasFont(ctx, details.studentName, {
    style: "italic",
    weight: "400",
    maxSize: width * 0.082,
    minSize: width * 0.046,
    family: TEST_CERT_SCRIPT,
    maxWidth: width * 0.70
  });
  setTestCanvasFont(ctx, { style: "italic", weight: "400", size: nameSize, family: TEST_CERT_SCRIPT });
  ctx.fillText(details.studentName, width / 2, height * 0.418);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#51341c";
  setTestCanvasFont(ctx, { weight: "500", size: width * 0.019, family: TEST_CERT_SERIF });
  drawTestCenteredText(ctx, details.bodyText, width / 2, height * 0.500, width * 0.60, height * 0.024, 3);

  ctx.fillStyle = "#4f351c";
  setTestCanvasFont(ctx, { weight: "700", size: width * 0.023, family: TEST_CERT_SERIF });
  if (details.checkpointTitle) {
    ctx.fillText(details.assessmentTitle.toUpperCase(), width / 2, height * 0.603);
    setTestCanvasFont(ctx, { weight: "500", size: width * 0.020, family: TEST_CERT_SERIF });
    ctx.fillText(details.checkpointTitle.toUpperCase(), width / 2, height * 0.628);
  } else {
    const assessmentSize = fitTestCanvasFont(ctx, details.assessmentTitle, {
      weight: "700",
      maxSize: width * 0.023,
      minSize: width * 0.016,
      family: TEST_CERT_SERIF,
      maxWidth: width * 0.62
    });
    setTestCanvasFont(ctx, { weight: "700", size: assessmentSize, family: TEST_CERT_SERIF });
    ctx.fillText(details.assessmentTitle.toUpperCase(), width / 2, height * 0.616);
  }

  ctx.fillStyle = "#51341c";
  setTestCanvasFont(ctx, { weight: "700", size: width * 0.019, family: TEST_CERT_SERIF });
  ctx.fillText(`Final Score: ${details.scoreText}`, width / 2, height * 0.658);
  ctx.fillText(`Performance: ${details.performanceText}`, width / 2, height * 0.681);
  ctx.fillText(`Status: ${details.statusText}`, width / 2, height * 0.704);

  setTestCanvasFont(ctx, { weight: "500", size: width * 0.019, family: TEST_CERT_SERIF });
  ctx.fillText(details.dateText, width / 2, height * 0.750);

  return canvas;
}

function isIOSLikeBrowser() {
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function writeCanvasSaveWindow(win, content) {
  if (!win) return false;
  try {
    win.document.open();
    win.document.write(content);
    win.document.close();
    return true;
  } catch (error) {
    return false;
  }
}

function openPendingCanvasSaveWindow(filename) {
  const win = window.open("", "_blank");
  const safeFilename = escapeHTML(filename);
  if (!win) return null;
  writeCanvasSaveWindow(win, `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${safeFilename}</title>
        <style>
          body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101820; color: #f8e7ba; font: 600 18px system-ui, sans-serif; }
        </style>
      </head>
      <body>Preparing certificate...</body>
    </html>`);
  return win;
}

function openCanvasImageForSaving(dataUrl, filename, existingWindow = null) {
  const win = existingWindow || window.open("", "_blank");
  if (!win) return false;

  const safeFilename = escapeHTML(filename);
  return writeCanvasSaveWindow(win, `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${safeFilename}</title>
        <style>
          body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101820; }
          img { width: min(100vw, 1122px); height: auto; display: block; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="${safeFilename}">
      </body>
    </html>`);
}

function saveCanvasImage(canvas, filename, options = {}) {
  const dataUrl = canvas.toDataURL("image/png");
  const linkSupportsDownload = "download" in document.createElement("a");

  if ((isIOSLikeBrowser() || !linkSupportsDownload) && openCanvasImageForSaving(dataUrl, filename, options.saveWindow)) {
    return;
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadTestCertificate(testId) {
  const test = chapterTests.find(item => item.id === testId);
  if (!test) return;

  const details = testCertificateDetails(test);
  if (!details.data) {
    showModal("No Test Result Yet", "Complete the chapter test first, then the mastery certificate can be saved to this device.", [
      { text: "OK", className: "gold-btn", action: closeModal }
    ]);
    return;
  }

  const slug = test.id.replace(/_/g, "-");
  const loadedTemplate = findLoadedTestCertificateTemplate();
  const filename = `math-ridge-${slug}-mastery-certificate.png`;

  if (loadedTemplate) {
    const canvas = createTestCertificateCanvas(test, loadedTemplate);
    saveCanvasImage(canvas, filename);
    return;
  }

  const pendingSaveWindow = isIOSLikeBrowser() ? openPendingCanvasSaveWindow(filename) : null;

  Promise.all([loadTestCertificateTemplate(), waitForTestCertificateFonts()])
    .then(([templateImage]) => {
      const canvas = createTestCertificateCanvas(test, templateImage);
      saveCanvasImage(canvas, filename, { saveWindow: pendingSaveWindow });
    })
    .catch(() => {
      const canvas = createTestCertificateCanvas(test);
      saveCanvasImage(canvas, filename, { saveWindow: pendingSaveWindow });
    });
}

function openCertificateFrame(id) {
  const item = certificateList.find(cert => cert.id === id);
  if (!item) return;

  const cert = readCertificate(id);

  if (cert && cert.completed) {
    const returnView = document.getElementById("certificates")?.classList.contains("active") ? "certificates" : "cabin";
    try {
      sessionStorage.setItem("mathRidge_certificate_return", returnView);
      sessionStorage.setItem("mathRidge_open_section", returnView);
      sessionStorage.setItem("mathRidgeReturnView", returnView);
    } catch (error) {}

    window.location.href = `${item.playFile}?certificate=${encodeURIComponent(id)}&mode=redownload&from=${encodeURIComponent(returnView)}`;
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
    { text: isRootGateUnlocked() ? (hasWatchedRootGateIntro() ? "Begin Root Gate Exam" : "Begin Root Gate Finale") : "Back to Chapter 1", className: "gold-btn", action: () => {
      if (isRootGateUnlocked()) window.location.href = rootGateHref();
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
  try { localStorage.removeItem(CERTIFICATE_FULL_NAME_KEY); } catch (error) {}
  try { localStorage.removeItem(PROLOGUE_SEEN_KEY); } catch (error) {}
  try { localStorage.removeItem(STORY_COMPLETE_1_1_KEY); } catch (error) {}
  try { localStorage.removeItem(ROOT_GATE_UNLOCK_KEY); } catch (error) {}
  try { localStorage.removeItem(ROOT_GATE_PASS_KEY); } catch (error) {}
  try { localStorage.removeItem(ROOT_GATE_INTRO_KEY); } catch (error) {}
  try { localStorage.removeItem(CHAPTER_ONE_TEST_PASS_KEY); } catch (error) {}
  try { localStorage.removeItem(CHAPTER_TWO_TEST_SETUP_STORY_KEY); } catch (error) {}
  try { localStorage.removeItem(CHAPTER_TWO_ENDING_STORY_KEY); } catch (error) {}
  try { localStorage.removeItem("mathRidge_testResult_chapter_1_data"); } catch (error) {}

  chapterTests.forEach(test => {
    (test.storageKeys || []).forEach(key => localStorage.removeItem(key));
    if (test.dataKey) localStorage.removeItem(test.dataKey);
    if (test.attemptsKey) localStorage.removeItem(test.attemptsKey);
    if (test.historyKey) localStorage.removeItem(test.historyKey);
  });

  closeModal();
  syncStageRevealHintState();
  renderTrail({ force: true });
  renderMenuLinks({ force: true });
  renderCertificateWall();
  renderCertificateVault();
  renderTestResults();
  renderRelicVault();
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
  showModal("Story First", "The full Mountain Trail opens after you finish Story 1-1 and receive the Term Stone Manual.", [
    { text: "Begin Prologue Story", className: "gold-btn", action: () => { window.location.href = "prologue.html"; } },
    { text: "Message", className: "pill-btn", action: () => showSection("message") },
    { text: "OK", className: "pill-btn", action: closeModal }
  ]);
}

const sections = document.querySelectorAll(".view-section");
const shell = document.getElementById("appShell");
const bgClasses = ["quest-bg", "menu-bg", "cabin-bg", "message-bg", "prologue-bg"];

function updateActiveNav(id) {
  const labels = {
    home: "Home",
    quest: "Trail",
    quick: "Menu",
    cabin: "Cabin",
    certificates: "Certificate Wall",
    relics: "Relics",
    message: "Message",
    prologue: ""
  };

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
    if (nextId === "cabin" || nextId === "certificates" || nextId === "relics") shell.classList.add("cabin-bg");
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
  if (nextId === "certificates") renderCertificateVault();
  if (nextId === "relics") renderRelicVault();

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
  if (value === "certificate" || value === "certificate-wall" || value === "certificate-vault") return "certificates";
  if (value === "relic" || value === "relic-vault") return "relics";
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

  if (["quest", "quick", "cabin", "certificates", "relics", "message"].includes(target)) {
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
const PREMIUM_TOUCH_QUERY = "(max-width: 760px), (hover: none) and (pointer: coarse)";
const STAGE_SHELF_AUTO_CLOSE_MS = 4600;
const CONFIRM_NAV_DELAY_MS = 780;
const BANNER_RETURN_SELECTOR = ".certificate-banner-return-cabin, .relic-banner-return-cabin, .message-banner-return-cabin";
const CONFIRMABLE_INDEX_SELECTOR = [
  "#noteTopActions .pill-btn",
  ".pill-btn",
  ".gold-btn",
  ".hero-actions .pill-btn",
  ".hero-actions .gold-btn",
  ".panel-header .pill-btn",
  ".cabin-banner-return-home",
  ".room-spot",
  ".hotspot",
  ".cabin-tab",
  "#sendNoteButton",
  ".reset-progress-btn",
  ".jump-link:not(.locked)",
  ".root-gate-link:not(.locked)",
  ".root-gate-replay-jump",
  ".certificate-vault-view-button",
  "#modalActions [data-mobile-confirm='modal-reset']"
].join(", ");

let currentSelectedStageCard = null;
let stageSelectClearTimer = null;
let suppressNextConfirmedClickUntil = 0;
const POINTER_TAP_GUARD_MS = 1400;

function isPremiumTouchDevice() {
  return Boolean(window.matchMedia && window.matchMedia(PREMIUM_TOUCH_QUERY).matches);
}

function mobileConfirm() {
  return window.MathRidgeMobileConfirm || null;
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

function markPointerFirstTapPlayed(target) {
  if (!target?.setAttribute) return;
  target.setAttribute("data-pointer-first-tap-played", "true");
  target.setAttribute("data-pointer-first-tap-at", String(Date.now()));
  window.setTimeout(() => {
    if (Date.now() - Number(target.dataset.pointerFirstTapAt || 0) >= POINTER_TAP_GUARD_MS) {
      target.removeAttribute("data-pointer-first-tap-played");
      target.removeAttribute("data-pointer-first-tap-at");
    }
  }, POINTER_TAP_GUARD_MS + 80);
}

function consumePointerFirstTapPlayed(target) {
  if (!target?.dataset || target.dataset.pointerFirstTapPlayed !== "true") return false;
  const playedAt = Number(target.dataset.pointerFirstTapAt || 0);
  const isFresh = !playedAt || Date.now() - playedAt <= POINTER_TAP_GUARD_MS;
  target.removeAttribute("data-pointer-first-tap-played");
  target.removeAttribute("data-pointer-first-tap-at");
  return isFresh;
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
  if (!consumePointerFirstTapPlayed(card)) {
    mobileConfirm()?.play?.("firstTap");
  }

  scheduleStageShelfClose(card);
}

function isConfirmableIndexTarget(target) {
  if (!target) return false;
  if (target.disabled || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return false;
  if (target.closest("#noteTopActions") && document.body.classList.contains("note-menu-open")) return false; // the shared shell owns the drawer.
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
  helper?.play?.("firstTap");
  return true;
}

function disarmIndexConfirmTarget(target) {
  mobileConfirm()?.clear?.(target);
  target?.classList?.remove("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
  target?.removeAttribute?.("data-mobile-confirm-ready");
  target?.removeAttribute?.("data-touch-preview-active");
}

function clearBannerReturnTarget(target) {
  mobileConfirm()?.clear?.();
  target?.classList?.remove("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
  target?.removeAttribute?.("data-mobile-confirm-ready");
  target?.removeAttribute?.("data-touch-preview-active");
  target?.removeAttribute?.("data-banner-return-armed-at");
}

function armBannerReturnTarget(target) {
  const helper = mobileConfirm();
  if (helper?.mark) {
    helper.mark(target, { duration: 5600 });
  } else {
    target.classList.add("is-touch-preview", "is-mobile-confirm-ready", "is-pressed");
    target.setAttribute("data-mobile-confirm-ready", "true");
    target.setAttribute("data-touch-preview-active", "true");
  }
  target.setAttribute("data-banner-return-armed-at", String(Date.now()));
  helper?.play?.("firstTap");
}

function activateBannerReturnTarget(target) {
  mobileConfirm()?.play?.("secondTap");
  clearBannerReturnTarget(target);
  showSection("cabin");
}

function activateConfirmedIndexTarget(target) {
  if (!target || !isConfirmableIndexTarget(target)) return false;

  const inlineAction = target.getAttribute("onclick") || "";
  const showSectionMatch = inlineAction.match(/showSection\('([^']+)'\)/);
  const showCabinPanelMatch = inlineAction.match(/showCabinPanel\('([^']+)'\)/);
  const showCertificateVaultModeMatch = inlineAction.match(/showCertificateVaultMode\('([^']+)'\)/);
  const toggleCertificateVaultModeMatch = /toggleCertificateVaultMode\(\)/.test(inlineAction);
  const downloadTestCertificateMatch = inlineAction.match(/downloadTestCertificate\('([^']+)'\)/);
  const certificateId = target.dataset?.certificateId;

  mobileConfirm()?.play?.("secondTap");
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

  if (showCertificateVaultModeMatch) {
    showCertificateVaultMode(showCertificateVaultModeMatch[1]);
    return true;
  }

  if (toggleCertificateVaultModeMatch) {
    toggleCertificateVaultMode();
    return true;
  }

  if (downloadTestCertificateMatch) {
    downloadTestCertificate(downloadTestCertificateMatch[1]);
    return true;
  }

  if (certificateId) {
    openCertificateFrame(certificateId);
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
      navigateAfterConfirm(target.href);
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

function handleBannerReturnPointerDown(event) {
  if (!isPremiumTouchDevice()) return;

  const target = event.target?.closest?.(BANNER_RETURN_SELECTOR);
  if (!target || !document.body.contains(target) || !isConfirmableIndexTarget(target)) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  if (target.dataset.mobileConfirmReady === "true") {
    activateBannerReturnTarget(target);
    suppressNextConfirmedClickUntil = Date.now() + 520;
    return;
  }

  armBannerReturnTarget(target);
}

function handleBannerReturnClick(event) {
  if (!isPremiumTouchDevice()) return;

  const target = event.target?.closest?.(BANNER_RETURN_SELECTOR);
  if (!target || !document.body.contains(target) || !isConfirmableIndexTarget(target)) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  if (Date.now() < suppressNextConfirmedClickUntil) return;

  const armedAt = Number(target.dataset.bannerReturnArmedAt || 0);
  const readyLongEnough = armedAt && Date.now() - armedAt > 650;
  if (target.dataset.mobileConfirmReady === "true" && readyLongEnough) {
    activateBannerReturnTarget(target);
    suppressNextConfirmedClickUntil = Date.now() + 520;
    return;
  }

  if (target.dataset.mobileConfirmReady !== "true") {
    armBannerReturnTarget(target);
  }
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
    if (stageCard.dataset.stageSelected !== "true") {
      mobileConfirm()?.play?.("firstTap");
      markPointerFirstTapPlayed(stageCard);
    }
    stageCard.classList.add("is-pressed");
    window.setTimeout(() => stageCard.classList.remove("is-pressed"), 280);
    return;
  }

  const target = event.target?.closest?.(CONFIRMABLE_INDEX_SELECTOR);
  if (target && isConfirmableIndexTarget(target)) {
    if (target.dataset.mobileConfirmReady !== "true") {
      mobileConfirm()?.play?.("firstTap");
      markPointerFirstTapPlayed(target);
    }
    target.classList.add("is-pressed");
    window.setTimeout(() => target.classList.remove("is-pressed"), 280);
  }
}

function bindPremiumMobileSelection() {
  document.addEventListener("pointerdown", handleBannerReturnPointerDown, { capture: true });
  document.addEventListener("click", handleBannerReturnClick, true);
  document.addEventListener("pointerdown", handlePremiumPointerDown, { passive: true });
  document.addEventListener("click", handlePremiumMobileConfirmClick, true);

  document.addEventListener("pointerdown", event => {
    if (!isPremiumTouchDevice()) return;
    if (event.target.closest(".node-card.stage-tappable")) return;
    if (!event.target.closest(".small-link, .jump-link, .hotspot, .room-spot, .cabin-banner-return-home, .certificate-banner-return-cabin, .relic-banner-return-cabin, .message-banner-return-cabin, .cabin-tab, .reset-progress-btn, #sendNoteButton, #modalActions button")) {
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
  syncStageRevealHintState();
  writeTrailStateSnapshot();
  bindPremiumMobileSelection();
  window.addEventListener("resize", () => syncCabinPanelVisibility({ scroll: false }));
});

// Expose local methods for inline handlers and note/play pages that return to Index sections.
window.handleStageImageFallback = handleStageImageFallback;
window.handleRelicPreviewError = handleRelicPreviewError;
window.showSection = showSection;
window.showCabinPanel = showCabinPanel;
window.showCertificateVaultMode = showCertificateVaultMode;
window.toggleCertificateVaultMode = toggleCertificateVaultMode;
window.toggleCertificateWall = toggleCertificateWall;
window.closeModal = closeModal;
window.showModal = showModal;
window.sendMessage = sendMessage;
window.handleNoteClick = handleNoteClick;
window.handlePlayClick = handlePlayClick;
window.handleRootGateClick = handleRootGateClick;
window.handleChapterTwoTestClick = handleChapterTwoTestClick;
window.openCertificateFrame = openCertificateFrame;
window.downloadTestCertificate = downloadTestCertificate;
window.confirmResetProgress = confirmResetProgress;
window.resetAllProgress = resetAllProgress;
window.readTrailStateSnapshot = readTrailStateSnapshot;
window.writeTrailStateSnapshot = writeTrailStateSnapshot;

window.goToIndexSection = function(section) {
  showSection(normalizeSectionName(section), { scroll: true });
  return false;
};
