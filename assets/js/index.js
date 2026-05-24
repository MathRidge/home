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
  "1_1": "stage-1-1",
  "1_2": "stage-1-2",
  "1_3": "stage-1-3",
  "1_4": "stage-1-4",
  "2_1": "stage-2-1",
  "2_2": "stage-2-2",
  "2_3": "stage-2-3",
  "2_4": "stage-2-4"
};

const STAGE_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".avif", ".PNG", ".JPG", ".JPEG", ".WEBP", ".AVIF", ""];
const STAGE_IMAGE_FOLDERS = ["assets/images/stages/", ""];

function stageImageSlug(id) {
  return stageCardThemes[id] || "";
}

function stageImageCandidates(slug) {
  if (!slug) return [];
  const candidates = [];
  STAGE_IMAGE_FOLDERS.forEach(folder => {
    STAGE_IMAGE_EXTENSIONS.forEach(ext => candidates.push(`${folder}${slug}${ext}`));
  });
  return candidates;
}

function stageImagePrimary(id) {
  const slug = stageImageSlug(id);
  return stageImageCandidates(slug)[0] || "";
}

function stageImageBackgroundValue(id) {
  const slug = stageImageSlug(id);
  if (!slug) return "";

  // This stays as CSS fallback. The real visible art is also rendered as an
  // <img> layer so local file paths work more reliably on Windows/file://.
  return stageImageCandidates(slug).map(url => `url('${url}')`).join(", ");
}

function handleStageImageFallback(img) {
  const slug = img?.dataset?.stageSlug || "";
  const candidates = stageImageCandidates(slug);
  let nextIndex = Number(img?.dataset?.stageIndex || 0) + 1;

  if (!img || !candidates.length || nextIndex >= candidates.length) {
    const card = img?.closest?.(".node-card");
    if (card) card.classList.add("stage-image-missing");
    if (img) img.remove();
    return;
  }

  img.dataset.stageIndex = String(nextIndex);
  img.src = candidates[nextIndex];
}

const chapterTests = [
  {
    id: "chapter_1",
    chapter: "Chapter 1 Test",
    range: "Covers 1-1 to 1-4",
    title: "Term Vision Checkpoint",
    image: "assets/images/test-results/chapter-1-test-result.svg",
    storageKeys: ["mathRidge_testResult_chapter_1", "mathRidge_testResult_chapter1"],
    note: "Use this result card after the Chapter 1 test is built."
  },
  {
    id: "chapter_2",
    chapter: "Chapter 2 Test",
    range: "Covers 2-1 to 2-4",
    title: "Prime Element Vision Checkpoint",
    image: "assets/images/test-results/chapter-2-test-result.svg",
    storageKeys: ["mathRidge_testResult_chapter_2", "mathRidge_testResult_chapter2"],
    note: "Use this result card after the Chapter 2 test is built."
  }
];

function storageKeyNote(id) { return `mathRidge_noteComplete_${id}`; }
function storageKeyNoteUnlocked(id) { return `mathRidge_noteUnlocked_${id}`; }
function storageKeyPlayComplete(id) { return `mathRidge_playComplete_${id}`; }
function storageKeyCert(id) { return `mathRidge_cert_${id}`; }

const TRAIL_STATE_KEY = "mathRidge_trail_state_v1";

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

function isNoteUnlocked(index) {
  if (index === 0) return true;
  const lesson = lessons[index];
  const previousLesson = lessons[index - 1];

  return (
    hasUnlockedNote(lesson.id) ||
    hasCertificate(previousLesson.id) ||
    hasCompletedPlay(previousLesson.id)
  );
}

function isPlayUnlocked(index) {
  const lesson = lessons[index];
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
      </div>
    `;
  }).join("");

  trail.dataset.rendered = "true";
  writeTrailStateSnapshot();
  bindStageCardInteractions();
}

function renderTrailCard(lesson) {
  const index = lessonIndex(lesson.id);
  const noteUnlocked = isNoteUnlocked(index);
  const playUnlocked = isPlayUnlocked(index);
  const earned = hasCertificate(lesson.id);
  const stageBackground = noteUnlocked ? stageImageBackgroundValue(lesson.id) : "";
  const slug = stageImageSlug(lesson.id);
  const primaryStageImage = noteUnlocked ? stageImagePrimary(lesson.id) : "";
  const imageStyle = stageBackground ? `style="--stage-bg: ${stageBackground};"` : "";
  const imageClass = stageBackground ? "stage-image" : "";
  const interactionClass = noteUnlocked ? "stage-tappable" : "";
  const stageArt = primaryStageImage
    ? `<div class="stage-art" aria-hidden="true"><img class="stage-art-img" src="${primaryStageImage}" data-stage-slug="${slug}" data-stage-index="0" alt="" loading="lazy" decoding="async" onerror="handleStageImageFallback(this)"></div>`
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
      <div class="lock-chip">${earned ? "🏅 Certificate earned" : playUnlocked ? "✅ Play unlocked" : noteUnlocked ? "📖 Note open" : "🔒 Trail locked"}</div>
      <div class="node-actions">
        <a class="small-link note-link ${noteUnlocked ? "" : "locked"}" href="${noteUnlocked ? lesson.noteFile : "#"}" onclick="return handleNoteClick(event, '${lesson.id}')" aria-label="Open ${lesson.section} Note"><span class="button-rune" aria-hidden="true">📖</span><span>Note</span></a>
        <a class="small-link play-link ${playUnlocked ? "" : "locked"}" href="${playUnlocked ? lesson.playFile : "#"}" onclick="return handlePlayClick(event, '${lesson.id}')" aria-label="Open ${lesson.section} Play"><span class="button-rune" aria-hidden="true">▶</span><span>Play</span></a>
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

function renderMenuNotePlay(lesson) {
  const index = lessonIndex(lesson.id);
  const noteUnlocked = isNoteUnlocked(index);
  const playUnlocked = isPlayUnlocked(index);

  return `
    <a class="jump-link note-jump ${noteUnlocked ? "" : "locked"}" href="${noteUnlocked ? lesson.noteFile : "#"}" onclick="return handleNoteClick(event, '${lesson.id}')"><span><i aria-hidden="true">📖</i> ${lesson.section} Note</span><strong>${noteUnlocked ? lesson.tag : "Locked"}</strong></a>
    <a class="jump-link play-jump ${playUnlocked ? "" : "locked"}" href="${playUnlocked ? lesson.playFile : "#"}" onclick="return handlePlayClick(event, '${lesson.id}')"><span><i aria-hidden="true">▶</i> ${lesson.section} Play</span><strong>${playUnlocked ? "Climb" : "Locked"}</strong></a>
  `;
}

function handleNoteClick(event, id) {
  const index = lessonIndex(id);
  const lesson = lessons[index];

  if (!isNoteUnlocked(index)) {
    event.preventDefault();
    showLockedProgressModal(`${lesson.section} Note`);
    return false;
  }

  return true;
}

function handlePlayClick(event, id) {
  const index = lessonIndex(id);
  const lesson = lessons[index];

  if (!isPlayUnlocked(index)) {
    event.preventDefault();

    if (isNoteUnlocked(index)) {
      showPlayNeedsNoteModal(lesson);
    } else {
      showLockedProgressModal(`${lesson.section} Play`);
    }

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

function renderTestResults() {
  const grid = document.getElementById("testResultsGrid");
  if (!grid) return;

  grid.innerHTML = chapterTests.map(test => {
    const image = readTestResultImage(test);
    return `
      <article class="test-result-card">
        <h4>${escapeHTML(test.chapter)}</h4>
        <p><strong>${escapeHTML(test.title)}</strong><br>${escapeHTML(test.range)}</p>
        <div class="result-image-frame">
          <img src="${escapeHTML(image)}" alt="${escapeHTML(test.chapter)} result preview" />
        </div>
        <div class="result-note">${escapeHTML(test.note)}</div>
        <div class="result-card-actions">
          <button class="pill-btn" type="button" onclick="showModal('Chapter Test Coming Soon', '${escapeHTML(test.chapter)} will connect here when the chapter test page is ready.', [{ text: 'OK', className: 'gold-btn', action: closeModal }])">Open Test Plan</button>
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
    "Play Locked",
    `To unlock ${lesson.section} Play, please finish the progress training in ${lesson.section} Note first. Would you like to go to the Note now?`,
    [
      { text: "Yes", className: "gold-btn", action: () => { window.location.href = lesson.noteFile; } },
      { text: "No", className: "pill-btn", action: closeModal }
    ]
  );
}

function confirmResetProgress() {
  showModal("Erase Device Progress?", "Are you sure you want to delete all Trail progress, Cabin achievements, and chapter test snapshots saved on this device?", [
    { text: "Yes", className: "danger-btn", action: resetAllProgress },
    { text: "No", className: "pill-btn", action: closeModal }
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

  chapterTests.forEach(test => {
    (test.storageKeys || []).forEach(key => localStorage.removeItem(key));
  });

  closeModal();
  renderTrail({ force: true });
  renderMenuLinks({ force: true });
  renderCertificateWall();
  renderTestResults();
  showSection("quick");
}

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
    button.addEventListener("click", action.action || closeModal);
    actionWrap.appendChild(button);
  });

  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("ridgeModal");
  if (modal) modal.classList.remove("show");
}

const sections = document.querySelectorAll(".view-section");
const shell = document.getElementById("appShell");
const bgClasses = ["quest-bg", "menu-bg", "cabin-bg", "message-bg"];

function updateActiveNav(id) {
  const labels = { home: "Home", quest: "Trail", quick: "Menu", cabin: "Cabin", message: "Message" };

  document.querySelectorAll(".top-actions button").forEach(button => {
    button.classList.toggle("active-section", button.textContent.trim() === labels[id]);
  });
}

function showSection(id, options = {}) {
  const { scroll = true, keepURL = false } = options;

  if (typeof toggleNoteMenu === "function") toggleNoteMenu(false);
  closeModal();

  sections.forEach(section => section.classList.remove("active"));

  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  if (shell) {
    shell.classList.remove(...bgClasses);
    if (id === "quest") shell.classList.add("quest-bg");
    if (id === "quick") shell.classList.add("menu-bg");
    if (id === "cabin") shell.classList.add("cabin-bg");
    if (id === "message") shell.classList.add("message-bg");
  }

  if (id === "quest") renderTrail({ force: true });
  if (id === "quick") renderMenuLinks({ force: true });
  if (id === "cabin") {
    renderCertificateWall();
    renderTestResults();
  }

  updateActiveNav(id);

  if (!keepURL && window.history && window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
}

function normalizeSectionName(value) {
  if (!value) return "";
  if (value === "trail" || value === "mountain-trail") return "quest";
  if (value === "menu") return "quick";
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

  if (["quest", "quick", "cabin", "message"].includes(target)) {
    showSection(target, { scroll: false, keepURL: true });
  } else {
    showSection("home", { scroll: false, keepURL: true });
  }
}

function showCabinPanel(panel) {
  const slider = document.getElementById("cabinSlider");
  const certTab = document.getElementById("certTab");
  const testTab = document.getElementById("testTab");
  if (!slider) return;

  const nextPanel = panel === "tests" ? "tests" : "certificates";
  slider.dataset.panel = nextPanel;
  certTab?.classList.toggle("active", nextPanel === "certificates");
  testTab?.classList.toggle("active", nextPanel === "tests");

  if (nextPanel === "tests") renderTestResults();
  if (nextPanel === "certificates") renderCertificateWall();

  // No auto-scroll here: switching Certificate Wall / Test Results should stay calm and instant.
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
    showModal("Message Sent Successfully", messageTone(kind, name), [
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
   - Hamburger, page header buttons, forms, and modals stay one-tap.
   - Mobile drawer buttons use select-first/enter-second so the glossy state can be enjoyed.
   - Mountain Trail stage cards use select-first, then Note/Play becomes active. */
const PREMIUM_TOUCH_QUERY = "(hover: none), (pointer: coarse)";
const MOBILE_DRAWER_QUERY = "(max-width: 680px)";
const DIRECT_TOUCH_GLOW_SELECTOR = [
  ".hero-actions .pill-btn",
  ".hero-actions .gold-btn",
  ".panel-header .pill-btn",
  ".trail-button",
  ".room-spot",
  ".cabin-tab",
  ".certificate-frame",
  ".result-card-actions .pill-btn",
  ".result-card-actions .gold-btn",
  ".reset-progress-btn",
  ".hotspot"
].join(", ");

let currentTouchPreviewTarget = null;
let currentSelectedStageCard = null;
let touchPreviewClearTimer = null;

function isPremiumTouchDevice() {
  return Boolean(window.matchMedia && window.matchMedia(PREMIUM_TOUCH_QUERY).matches);
}

function isMobileDrawerOpen() {
  return Boolean(
    window.matchMedia &&
    window.matchMedia(MOBILE_DRAWER_QUERY).matches &&
    document.body.classList.contains("note-menu-open")
  );
}

function clearPremiumTouchSelection(options = {}) {
  const { keepStage = false } = options;

  if (currentTouchPreviewTarget) {
    currentTouchPreviewTarget.classList.remove("is-touch-preview", "is-pressed");
    currentTouchPreviewTarget.removeAttribute("data-touch-preview-active");
  }

  if (!keepStage && currentSelectedStageCard) {
    currentSelectedStageCard.classList.remove("is-stage-selected", "is-touch-preview", "is-pressed");
    currentSelectedStageCard.removeAttribute("data-stage-selected");
    currentSelectedStageCard = null;
  }

  currentTouchPreviewTarget = null;

  if (touchPreviewClearTimer) {
    window.clearTimeout(touchPreviewClearTimer);
    touchPreviewClearTimer = null;
  }
}

function markPremiumTouchTarget(target, options = {}) {
  const { asStage = false, armed = false, duration = 4200 } = options;
  if (!target) return;

  if (currentTouchPreviewTarget && currentTouchPreviewTarget !== target && currentTouchPreviewTarget !== currentSelectedStageCard) {
    currentTouchPreviewTarget.classList.remove("is-touch-preview", "is-pressed");
    currentTouchPreviewTarget.removeAttribute("data-touch-preview-active");
  }

  currentTouchPreviewTarget = target;
  target.classList.add("is-touch-preview", "is-pressed");

  if (armed) {
    target.setAttribute("data-touch-preview-active", "true");
  }

  if (asStage && armed) {
    if (currentSelectedStageCard && currentSelectedStageCard !== target) {
      currentSelectedStageCard.classList.remove("is-stage-selected", "is-touch-preview", "is-pressed");
      currentSelectedStageCard.removeAttribute("data-stage-selected");
    }

    currentSelectedStageCard = target;
    target.classList.add("is-stage-selected");
    target.setAttribute("data-stage-selected", "true");
  }

  if (touchPreviewClearTimer) window.clearTimeout(touchPreviewClearTimer);
  touchPreviewClearTimer = window.setTimeout(() => clearPremiumTouchSelection({ keepStage: asStage && armed }), duration);
}

function isDirectTouchGlowExcluded(target) {
  return Boolean(target.closest(
    ".hamburger-btn, .drawer-backdrop, .modal-card, #ridgeModal, form, input, textarea, select, option, [disabled], [aria-disabled='true']"
  ));
}

function getDirectTouchGlowTarget(eventTarget) {
  if (!isPremiumTouchDevice()) return null;
  const target = eventTarget?.closest?.(DIRECT_TOUCH_GLOW_SELECTOR);
  if (!target || !document.body.contains(target)) return null;
  if (isDirectTouchGlowExcluded(target)) return null;
  return target;
}

function handlePremiumPointerDown(event) {
  if (event.pointerType === "mouse") return;
  if (!isPremiumTouchDevice()) return;

  const stage = event.target?.closest?.(".node-card.stage-tappable:not(.locked)");
  if (stage) {
    markPremiumTouchTarget(stage, { asStage: true, armed: false, duration: 5200 });
    return;
  }

  const drawerButton = event.target?.closest?.("#noteTopActions.open .pill-btn");
  if (drawerButton && isMobileDrawerOpen()) {
    markPremiumTouchTarget(drawerButton, { armed: false, duration: 5200 });
    return;
  }

  const directTarget = getDirectTouchGlowTarget(event.target);
  if (directTarget) markPremiumTouchTarget(directTarget, { armed: false, duration: 460 });
}

function handlePremiumTouchClick(event) {
  if (!isPremiumTouchDevice()) return;

  const stageAction = event.target?.closest?.(".node-card.stage-tappable:not(.locked) .small-link");
  const stageCard = event.target?.closest?.(".node-card.stage-tappable:not(.locked)");

  if (stageCard) {
    const stageIsReady = stageCard.dataset.stageSelected === "true";

    if (!stageIsReady) {
      event.preventDefault();
      event.stopImmediatePropagation();
      markPremiumTouchTarget(stageCard, { asStage: true, armed: true, duration: 5200 });
      return;
    }

    if (!stageAction) {
      event.preventDefault();
      event.stopImmediatePropagation();
      markPremiumTouchTarget(stageCard, { asStage: true, armed: true, duration: 5200 });
      return;
    }

    // Card is selected and the student tapped Note/Play: allow the normal handler/navigation.
    window.setTimeout(() => clearPremiumTouchSelection(), 220);
    return;
  }

  const drawerButton = event.target?.closest?.("#noteTopActions.open .pill-btn");
  if (drawerButton && isMobileDrawerOpen()) {
    const ready = drawerButton.dataset.touchPreviewActive === "true";
    if (!ready) {
      event.preventDefault();
      event.stopImmediatePropagation();
      markPremiumTouchTarget(drawerButton, { armed: true, duration: 5200 });
      return;
    }

    window.setTimeout(() => clearPremiumTouchSelection(), 180);
  }
}

function bindPremiumMobileSelection() {
  document.addEventListener("pointerdown", handlePremiumPointerDown, { passive: true });
  document.addEventListener("click", handlePremiumTouchClick, true);

  document.addEventListener("pointerdown", event => {
    if (!isPremiumTouchDevice()) return;
    if (event.target.closest(".node-card.stage-tappable, #noteTopActions.open .pill-btn")) return;
    if (!event.target.closest(".small-link, .jump-link, .hotspot, .room-spot, .certificate-frame, .pill-btn, .gold-btn, .danger-btn")) {
      clearPremiumTouchSelection();
    }
  }, { passive: true });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") clearPremiumTouchSelection();
  });

  window.addEventListener("resize", clearPremiumTouchSelection);
  window.addEventListener("orientationchange", clearPremiumTouchSelection);
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

document.addEventListener("DOMContentLoaded", () => {
  // Lazy-render the heavier sections only when a student opens that view.
  // This keeps the first mobile paint fast and prevents hidden Trail art from loading too early.
  openInitialSectionFromURL();
  writeTrailStateSnapshot();
  bindPremiumMobileSelection();
});

// Expose local methods for inline handlers and note/play pages that return to Index sections.
window.handleStageImageFallback = handleStageImageFallback;
window.showSection = showSection;
window.showCabinPanel = showCabinPanel;
window.closeModal = closeModal;
window.showModal = showModal;
window.sendMessage = sendMessage;
window.handleNoteClick = handleNoteClick;
window.handlePlayClick = handlePlayClick;
window.openCertificateFrame = openCertificateFrame;
window.confirmResetProgress = confirmResetProgress;
window.resetAllProgress = resetAllProgress;
window.readTrailStateSnapshot = readTrailStateSnapshot;
window.writeTrailStateSnapshot = writeTrailStateSnapshot;

window.goToIndexSection = function(section) {
  showSection(normalizeSectionName(section), { scroll: true });
  return false;
};
