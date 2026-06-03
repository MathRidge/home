(function () {
  "use strict";

  const PROFILE_KEY = "mathRidge_playerProfile_v1";
  const INTRO_COMPLETE_KEY = "mathRidge_storyComplete_root_gate_intro";
  const PASS_STORY_KEY = "mathRidge_storyComplete_root_gate_pass";
  const FAIL_STORY_KEY = "mathRidge_storyComplete_root_gate_fail";
  const CHAPTER_TWO_OPENING_KEY = "mathRidge_storyComplete_chapter_2_opening";

  const bgBase = "assets/images/bg-scene/Stage-1-1/";
  const chapterTwoBgBase = "assets/images/bg-scene/Chapter-2/";
  const miraBase = "assets/images/Mira-sprite/Mira-sprite-alpha-webp/";
  const miraPngBase = "assets/images/Mira-sprite/Mira-sprite-alpha-png/";
  const shellwickBase = "assets/images/Shellwick-sprite/elder-webp/";
  const shellwickPngBase = "assets/images/Shellwick-sprite/";
  const miraVoiceBase = "voice/Mira/";
  const elderVoiceBase = "voice/elder/";
  const soundBase = "voice/sound/";

  const backgrounds = {
    cabin: `${bgBase}story-bg-Shellwick_cabin.png`,
    cabinInside: `${bgBase}story-bg-Shellwick_cabin_inside.png`,
    table: `${bgBase}story-bg-Shellwick-table.png`,
    board: `${bgBase}story-bg-Shellwick-black-board.png`,
    gate: `${bgBase}story-bg-s09b-stage-1-1-gate.png`,
    rootGateOpen: `${chapterTwoBgBase}open-root-gate-after-victory.png`,
    pathBeyondRootGate: `${chapterTwoBgBase}path-beyond-root-gate.png`,
    cipherRidgeEvening: `${chapterTwoBgBase}cipher-ridge-evening-walk.png`,
    cabinEvening: `${chapterTwoBgBase}shellwick-cabin-evening.png`,
    emptyRelicTable: `${chapterTwoBgBase}shellwick-table-empty-relics.png`,
    seriousShelfCase: `${chapterTwoBgBase}serious-shelf-relic-case.png`,
    visionRelicCase: `${chapterTwoBgBase}vision-relic-case-open.png`,
    primeValley: `${chapterTwoBgBase}prime-valley-first-view.png`,
    chapterTwoBoard: `${chapterTwoBgBase}chapter-2-blackboard-number-reveal.png`,
    bluePhoneSignal: `${chapterTwoBgBase}blue-phone-signal-far-above.png`,
    rootGateMemory: `${chapterTwoBgBase}root-gate-memory.png`
  };

  const sprites = {
    miraNeutral: { character: "mira", src: `${miraBase}mira-neutral-fb.webp` },
    miraHappy: { character: "mira", src: `${miraBase}mira-happy-fb.webp` },
    miraWorried: { character: "mira", src: `${miraBase}mira-worried-fb.webp` },
    miraDetermined: { character: "mira", src: `${miraBase}mira-determined-fb.webp` },
    miraConfused: { character: "mira", src: `${miraBase}mira-confused-fb.webp` },
    miraPouting: { character: "mira", src: `${miraBase}mira-pouting-crossed-arms.webp` },
    miraCelebrating: { character: "mira", src: `${miraBase}mira-celebrating-fb.webp` },
    miraPointing: { character: "mira", src: `${miraBase}mira-pointing-fb.webp` },
    miraTrailReturn: { character: "mira", src: `${miraPngBase}Mira_Apprentice_Mage_TRUE_ALPHA_Cropped.png` },
    miraCertificate: { character: "mira", src: `${miraPngBase}mira-certificate-reading-true-alpha.png` },
    miraMagicSatchel: { character: "mira", src: `${miraPngBase}mira-magic-satchel-true-alpha.png` },
    elder: { character: "elder", src: `${shellwickPngBase}Elder standing-no desk.png` },
    elderWriting: { character: "elder", src: `${shellwickPngBase}Elder teaching.png` },
    elderTeaching: { character: "elder", src: `${shellwickPngBase}Elder teaching.png` },
    elderGentleNo: { character: "elder", src: `${shellwickPngBase}Elder amused  gentle no.png` }
  };

  const elderVoiceFilesByText = new Map([
    ["Relics are not keys, Mira. They are witnesses.", ["elder-Relics-are-not-keys,-Mira.-They-are-witnesses.mp3"]],
    ["They prove you have reached the lessons. But reaching a lesson is not the same as mastering it.", ["elder-They-prove-you-have-reached-the-lessons.-But-rea.mp3"]],
    ["The Root Gate will ask for proof.", ["elder-The-Root-Gate-will-ask-for-proof.mp3"]],
    ["Exactly.", ["elder-exactly.mp3"]],
    ["Yes. Forty questions. Pass with thirty-seven or more correct.", ["elder-Forty-questions.-Pass-with-thirty-seven-or-more.mp3"]],
    ["The Root Gate Mastery Trial begins when you are ready.", ["elder-The-Root-Gate-Mastery-Trial.mp3"]],
    ["Mira.", ["elder-[anxcious]Mira.mp3"]],
    ["The first relics taught you how to control numbers.", ["elder-The-first-relics-taught-you-how-to-control-numbe.mp3"]],
    ["Correct. It is seeing.", ["elder-Correct.-It-is-seeing.mp3"]],
    ["The next four relics are called the Vision Relics.", ["elder-The-next-four-relics-are-called-the-Vision-Relic.mp3"]]
  ]);

  const miraVoiceFilesByText = new Map([
    ["What kind of proof?", ["mira-What-kind-of-proof.mp3"]],
    ["Forty questions. Only three mistakes. I might panic a little.", ["mira-Only-three-mistakes….mp3"]],
    ["Do they give us magical glasses?", ["mira-Do-they-give-us-magical-glasses.mp3"]],
    ["Tiny glasses for numbers?", ["mira-Tiny-glasses-for-numbers.mp3"]]
  ]);

  miraVoiceFilesByText.set("Forty questions. Only three mistakes. I might panic a little.", ["mira-Only-three-mistakes….mp3"]);

  miraVoiceFilesByText.set("Forty questions. Only three mistakes. I might panic a little.", ["mira-Only-three-mistakes….mp3"]);

  const relicRevealCue = { file: "universfield-button.mp3", start: 0, end: 1.35, volume: 0.36, fadeOut: 220, lockMs: 650 };
  const softRevealCue = { file: "universfield-button.mp3", start: 0, end: 1.15, volume: 0.22, fadeOut: 200, lockMs: 520 };
  const gateRumbleCue = { file: "gate-open-lock.mp3", start: 0.3, end: 3.8, volume: 0.34, fadeOut: 900, lockMs: 2000 };
  const gateLockCue = { file: "gate-open-lock.mp3", start: 4.25, end: 5.45, volume: 0.34, fadeOut: 240, lockMs: 900 };
  const gateOpenCue = { file: "gate-open-lock.mp3", start: 8.7, end: 13.8, volume: 0.4, fadeOut: 1200, lockMs: 2000 };
  const chalkCueA = { file: "chuck-writing.mp3", start: 0.45, end: 2.25, volume: 0.28, fadeOut: 260, lockMs: 1100 };
  const chalkCueB = { file: "chuck-writing.mp3", start: 3.1, end: 5.25, volume: 0.28, fadeOut: 320, lockMs: 1200 };
  const satchelCue = { file: "satchel search.mp3", start: 1.1, end: 4.2, volume: 0.3, fadeOut: 850, lockMs: 900 };
  const certificateUnlockCues = [
    { file: "certificate-paper-rustle.mp3", start: 0, end: 2.2, volume: 0.4, fadeOut: 520, lockMs: 1000 },
    { file: "certificate-stamp.mp3", start: 0, end: 2.1, volume: 0.46, delay: 620, fadeOut: 460, lockMs: 1600 },
    { file: "certificate-fanfare.mp3", start: 0, end: 2.25, volume: 0.48, delay: 1120, fadeOut: 700, lockMs: 2200 }
  ];
  const chapterUnlockCues = [
    { file: "universfield-button.mp3", start: 0, end: 1.35, volume: 0.32, fadeOut: 220, lockMs: 750 },
    { file: "certificate-fanfare.mp3", start: 0.12, end: 2.1, volume: 0.3, delay: 640, fadeOut: 700, lockMs: 2000 }
  ];
  const sceneSoundCuesByText = new Map([
    ["The door of Elder Shellwick's cabin opened by itself. Warm lantern light spilled onto the path.", [{ file: "elder-creaking-door-open.mp3", volume: 0.4, end: 2.25, fadeOut: 520, lockMs: 900 }]],
    ["The Term Stone. The Sign Compass. The Parity Prism. And the Factor Forge.", [softRevealCue]],
    ["You placed the four relics on Elder Shellwick's table.", [softRevealCue]],
    ["The Term Stone landed first. A small ring of light spread across the wood.", [relicRevealCue]],
    ["Then came the Sign Compass, its needle spinning before pointing toward the mountain.", [relicRevealCue]],
    ["The Parity Prism glowed green, splitting the room's light into thin lines.", [relicRevealCue]],
    ["Finally, the Factor Forge touched the table with a soft metallic hum.", [relicRevealCue]],
    ["The four relics flashed. Far outside, something deep in the mountain answered.", [gateRumbleCue]],
    ["Elder Shellwick walked to the chalkboard and drew a large circle.", [chalkCueA]],
    ["The chalk lines connected into one root-shaped gate mark. The room became very quiet.", [chalkCueB, softRevealCue]],
    ["At the base of the Root Gate were four empty slots.", [softRevealCue]],
    ["The Term Stone lit the gate with red and gold symbols. Same signs. Different signs. Sign and size.", [relicRevealCue]],
    ["The Sign Compass sent a blue line across the gate. A term may move. Its sign moves with it.", [relicRevealCue]],
    ["The Parity Prism split green light across the stone. Pair the negatives. Watch what remains.", [relicRevealCue]],
    ["The Factor Forge glowed with purple fire. Group first. Then solve.", [relicRevealCue]],
    ["Instead, a long stone tablet rose from the ground. Words burned across it: Root Gate Mastery Trial.", [gateRumbleCue]],
    ["Then the Root Gate began to glow. Not from the top. Not from the center. From below.", [gateRumbleCue]],
    ["The glowing roots climbed higher and wrapped around the ancient carvings of the gate.", [softRevealCue]],
    ["The chamber rumbled. Dust drifted down from the ceiling.", [gateRumbleCue]],
    ["The golden roots reached the center of the gate. Ancient locks began to turn, one by one.", [gateRumbleCue]],
    ["A lock opened.", [gateLockCue]],
    ["Another lock opened.", [{ file: "gate-open-lock.mp3", start: 5.65, end: 6.85, volume: 0.34, fadeOut: 240, lockMs: 900 }]],
    ["The final lock clicked. The entire chamber filled with golden light.", [{ file: "gate-open-lock.mp3", start: 7.0, end: 8.35, volume: 0.38, fadeOut: 320, lockMs: 1100 }, softRevealCue]],
    ["The gate began to open. Stone scraped against stone. Warm light poured through the widening crack.", [gateOpenCue]],
    ["The gate opened fully.", [{ file: "universfield-button.mp3", start: 0, end: 1.35, volume: 0.34, fadeOut: 220, lockMs: 750 }]],
    ["The number cracked open with a soft golden flash. Inside it, smaller pieces appeared: 2 x 2 x 3.", [relicRevealCue]],
    ["The four relics floated behind you. The Factor Forge glowed brighter than the others.", [softRevealCue]],
    ["Something small inside it stirred. A hidden light. A sleeping lens. A new power waiting to awaken.", [softRevealCue]],
    ["Root Gate Trial complete. Prime Element Vision awakens.", chapterUnlockCues],
    ["The fortieth star faded. The Root Gate remained closed.", [{ file: "wrong.mp3", volume: 0.3, lockMs: 500 }]],
    ["Somehow, Shellwick was already there. He opened the cabin door before either of you knocked. Warm light spilled out.", [{ file: "elder-creaking-door-open.mp3", volume: 0.38, end: 2.25, fadeOut: 520, lockMs: 900 }]],
    ["Mira walked very carefully, still holding her certificate high enough to read.", [{ file: "certificate-paper-rustle.mp3", start: 0, end: 2.0, volume: 0.24, fadeOut: 520, lockMs: 760 }]],
    ["Mira considered this. Then very carefully placed her certificate on the table.", [{ file: "certificate-paper-rustle.mp3", start: 0.1, end: 2.0, volume: 0.22, fadeOut: 520, lockMs: 760 }]],
    ["Mira looked relieved and immediately tucked the certificate back into her satchel.", [satchelCue]],
    ["The old case came down from the serious shelf and settled on the table.", [{ file: "gate-open-lock.mp3", start: 1.25, end: 2.5, volume: 0.18, fadeOut: 460, lockMs: 720 }]],
    ["Shellwick placed the case on the table. The lid opened by itself.", [softRevealCue]],
    ["Inside were four faint outlines. Not relics yet. Only shadows of relics.", [softRevealCue]],
    ["The case opened again. This time, the four shadows rose into the air.", [softRevealCue]],
    ["The Shelf Scale.", [relicRevealCue]],
    ["The Primewood Seed.", [relicRevealCue]],
    ["The seed cracked open, showing smaller glowing factors inside.", [relicRevealCue]],
    ["The Fraction Loom.", [relicRevealCue]],
    ["Threads of silver light crossed through a small frame. They divided one glowing circle into equal parts.", [relicRevealCue]],
    ["The Power Tally.", [relicRevealCue]],
    ["Small glowing tally marks rose upward. Then doubled. Then doubled again.", [relicRevealCue]],
    ["The chalkboard shimmered. The number 12 split into different forms.", [chalkCueB, softRevealCue]],
    ["She reached inside her satchel and pulled out a pencil. Then a spoon. Then the same emergency cup noodles.", [satchelCue]],
    ["The booklet glowed in your hands. Outside, the mountain path above the Root Gate lit one stone at a time.", [softRevealCue]]
  ]);

  const relicOrder = ["term", "sign", "parity", "factor"];

  const blackboardStates = {
    rootGate: {
      badge: "Lower Trail",
      title: "Root Gate",
      rows: [
        { label: "Relics", text: "Term Stone + Sign Compass + Parity Prism + Factor Forge", kind: "magic" },
        { label: "Purpose", text: "Proof of mastery", kind: "rule" }
      ]
    },
    term: {
      badge: "Term Stone",
      title: "Signs and Sizes",
      rows: [
        { label: "Same", text: "-8 + (-3) -> add sizes, keep sign", kind: "problem" },
        { label: "Different", text: "5 + (-8) -> subtract sizes, keep bigger sign", kind: "rule" }
      ]
    },
    sign: {
      badge: "Sign Compass",
      title: "Terms Carry Signs",
      rows: [
        { label: "Start", text: "+5 - 2 + 3", kind: "problem" },
        { label: "Move", text: "+5 + 3 - 2", kind: "magic" },
        { label: "Rule", text: "The sign moves with the term", kind: "rule" }
      ]
    },
    parity: {
      badge: "Parity Prism",
      title: "Stacked Signs",
      rows: [
        { label: "One", text: "-3 stays negative", kind: "problem" },
        { label: "Two", text: "-(-3) becomes positive", kind: "magic" },
        { label: "Three", text: "-(-(-3)) leaves one negative", kind: "rule" }
      ]
    },
    factor: {
      badge: "Factor Forge",
      title: "Repeated Groups",
      rows: [
        { label: "Start", text: "2 + 2 + 2 + 2 + 2 + 2 + 2", kind: "problem" },
        { label: "Group", text: "5(2) + 2(2)", kind: "magic" },
        { label: "Total", text: "10 + 4 = 14", kind: "answer" }
      ]
    },
    trial: {
      badge: "Mastery Trial",
      title: "Root Gate Mastery Trial",
      rows: [
        { label: "Questions", text: "40", kind: "problem" },
        { label: "Pass", text: "37 or more correct", kind: "answer" },
        { label: "Time", text: "10:00", kind: "rule" }
      ]
    },
    chapterOneTools: {
      badge: "Lower Trail",
      title: "What The First Relics Taught",
      rows: [
        { label: "Signs", text: "-3", kind: "problem" },
        { label: "Terms", text: "+5 - 2 + 3", kind: "magic" },
        { label: "Stacks", text: "2 - (-3)", kind: "rule" },
        { label: "Groups", text: "5(2) + 2(2)", kind: "answer" }
      ]
    },
    vision12: {
      badge: "Beyond Gate",
      title: "Seeing Beneath The Surface",
      rows: [
        { label: "Number", text: "12", kind: "problem" },
        { label: "Split", text: "12 = 6 + 6", kind: "magic" },
        { label: "Factor", text: "12 = 3 x 4", kind: "magic" },
        { label: "Prime", text: "12 = 2 x 2 x 3", kind: "answer" }
      ]
    },
    roots12: {
      badge: "Vision",
      title: "Hidden Structure",
      rows: [
        { label: "Surface", text: "12", kind: "problem" },
        { label: "Inside", text: "2 x 2 x 3", kind: "answer" },
        { label: "Rule", text: "A number can hold more than it seems", kind: "rule" }
      ]
    },
    chapterTwoManual: {
      badge: "Manual 2-1",
      title: "Beyond The Root Gate",
      rows: [
        { label: "Path", text: "Prime Element Vision", kind: "magic" },
        { label: "Relics", text: "Vision Relics", kind: "answer" },
        { label: "Objective", text: "Open Manual 2-1", kind: "rule" }
      ]
    }
  };

  const mode = document.body?.dataset?.storyMode || "intro";
  const params = new URLSearchParams(window.location.search);
  const outcome = params.get("outcome") === "pass" ? "pass" : "fail";

  const storyVn = document.querySelector(".story-vn");
  const sceneBg = document.getElementById("sceneBg");
  const progressBar = document.getElementById("storyProgressBar");
  const blackboardStage = document.getElementById("blackboardStage");
  const relicRevealStage = document.getElementById("relicRevealStage");
  const speakerName = document.getElementById("speakerName");
  const sceneCounter = document.getElementById("sceneCounter");
  const dialogueBox = document.querySelector(".dialogue-box");
  const dialogueText = document.getElementById("dialogueText");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const rewardPanel = document.getElementById("rewardPanel");
  const rewardCard = document.getElementById("rewardCard");
  const interactionPanel = document.getElementById("interactionPanel");
  const nameForm = document.getElementById("nameForm");
  const choiceRow = document.getElementById("choiceRow");
  const feedbackText = document.getElementById("feedbackText");

  const actors = {
    mira: {
      stage: document.getElementById("miraStage"),
      img: document.getElementById("miraSprite"),
      lastKey: "",
      loadToken: 0
    },
    elder: {
      stage: document.getElementById("elderStage"),
      img: document.getElementById("elderSprite"),
      lastKey: "",
      loadToken: 0
    }
  };

  let frames = mode === "result" ? resultFrames(outcome) : mode === "chapter2" ? chapterTwoFrames() : introFrames();
  let currentIndex = 0;
  let currentBgKey = "";
  let typeTimer = 0;
  let typeTargetText = "";
  let isTyping = false;
  let activeVoice = null;
  let activeSoundCues = [];
  const preparedVoiceAudio = new Map();
  const preparedSoundAudio = new Map();
  let voiceToken = 0;
  let voiceAdvanceLocked = false;
  let soundAdvanceLocked = false;
  let soundAdvanceTimer = null;
  const PRELOAD_AHEAD_FRAMES = 4;

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
    catch (error) { return {}; }
  }

  function playerName() {
    const profile = readProfile();
    return profile.nickname || profile.playerName || profile.certificateName || "Ridge Wanderer";
  }

  function fillPlayerName(text) {
    return String(text || "").replace(/\{\{playerName\}\}/g, playerName());
  }

  function isNarration(frame) {
    return !frame.speaker || frame.speaker === "Narrator";
  }

  function frameText(frame) {
    const text = fillPlayerName(frame.text || "");
    return isNarration(frame) ? `[ ${text} ]` : text;
  }

  function introFrames() {
    return [
      { bg: "cabinEvening", sprite: "miraDetermined", speaker: "Narrator", text: "Root Gate Finale: Return to Elder Shellwick" },
      { bg: "cabinEvening", sprite: "miraDetermined", speaker: "Narrator", text: "The door of Elder Shellwick's cabin opened by itself. Warm lantern light spilled onto the path." },
      { bg: "cabinInside", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "Inside, the familiar smell of tea, parchment, and old rain filled the room." },
      { bg: "cabinInside", sprite: "miraTrailReturn", elder: "elder", speaker: "Narrator", text: "Mira stepped in first, covered in dust, leaves, and at least one tiny twig stuck in her hat." },
      { bg: "cabinInside", sprite: "miraTrailReturn", elder: "elder", speaker: "Mira", text: "Elder Shellwick... we have returned!" },
      { bg: "cabinInside", sprite: "miraTrailReturn", elder: "elder", speaker: "Narrator", text: "The twig slipped from her hat and landed on the floor." },
      { bg: "cabinInside", sprite: "miraTrailReturn", elder: "elder", speaker: "Mira", text: "...mostly intact." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "You stepped in behind her. In your pack, four relics pulsed softly." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The Term Stone. The Sign Compass. The Parity Prism. And the Factor Forge.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Ah. So the lower trail has accepted you.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "Yes! It was very educational.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "And a little loud.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "I had assumed.", relicReveal: "all" },

      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "You placed the four relics on Elder Shellwick's table.", relicReveal: "lights" },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "The Term Stone landed first. A small ring of light spread across the wood.", relicReveal: "term" },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "Then came the Sign Compass, its needle spinning before pointing toward the mountain.", relicReveal: "sign" },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "The Parity Prism glowed green, splitting the room's light into thin lines.", relicReveal: "parity" },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "Finally, the Factor Forge touched the table with a soft metallic hum.", relicReveal: "factor" },
      { bg: "emptyRelicTable", sprite: "miraCelebrating", elder: "elder", speaker: "Mira", text: "That means the Root Gate opens now, right?", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "Elder Shellwick took a slow sip of tea. Mira waited. You waited. The relics waited.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elderGentleNo", speaker: "Elder Shellwick", text: "No.", relicReveal: "all", voice: ["elder-[long-pause]No.mp3"] },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "No?", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "But we collected all four relics. And the Root Gate needs all four relics. Then... open?", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "Relics are not keys, Mira. They are witnesses.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraConfused", elder: "elder", speaker: "You", text: "Witnesses?", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraConfused", elder: "elder", speaker: "Elder Shellwick", text: "They prove you have reached the lessons. But reaching a lesson is not the same as mastering it.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "The Root Gate will ask for proof.", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "What kind of proof?", relicReveal: "all" },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "The four relics flashed. Far outside, something deep in the mountain answered.", relicReveal: "all" },

      { bg: "board", sprite: "miraNeutral", elder: "elderWriting", speaker: "Narrator", text: "Elder Shellwick walked to the chalkboard and drew a large circle.", board: "rootGate", relicReveal: "clear" },
      { bg: "board", sprite: "miraNeutral", elder: "elderWriting", speaker: "Elder Shellwick", text: "The Root Gate gathers everything you learned on the lower trail.", board: "rootGate" },
      { bg: "board", sprite: "miraDetermined", elder: "elderWriting", speaker: "Elder Shellwick", text: "The Term Stone taught signs and sizes.", board: "term" },
      { bg: "board", sprite: "miraDetermined", elder: "elderWriting", speaker: "Mira", text: "Same signs add the sizes and keep the sign. Different signs subtract the sizes and keep the sign of the bigger size.", board: "term" },
      { bg: "board", sprite: "miraHappy", elder: "elderWriting", speaker: "Elder Shellwick", text: "Good.", board: "term" },
      { bg: "board", sprite: "miraPointing", elder: "elderWriting", speaker: "Elder Shellwick", text: "The Sign Compass taught that terms may move.", board: "sign" },
      { bg: "board", sprite: "miraPointing", elder: "elderWriting", speaker: "Mira", text: "But the sign must move with the number. Like a backpack.", board: "sign" },
      { bg: "board", sprite: "miraNeutral", elder: "elderWriting", speaker: "Elder Shellwick", text: "Yes. Like a backpack.", board: "sign" },
      { bg: "board", sprite: "miraDetermined", elder: "elderWriting", speaker: "Elder Shellwick", text: "The Parity Prism taught stacked signs.", board: "parity" },
      { bg: "board", sprite: "miraDetermined", elder: "elderWriting", speaker: "Mira", text: "One minus stays negative. Two minuses become positive. Three minuses means one lonely minus is left.", board: "parity" },
      { bg: "board", sprite: "miraHappy", elder: "elderWriting", speaker: "Elder Shellwick", text: "Very good.", board: "parity" },
      { bg: "board", sprite: "miraWorried", elder: "elderWriting", speaker: "Elder Shellwick", text: "And the Factor Forge taught grouping.", board: "factor" },
      { bg: "board", sprite: "miraWorried", elder: "elderWriting", speaker: "Narrator", text: "For one second, panic flickered across Mira's face. Then she took a breath.", board: "factor" },
      { bg: "board", sprite: "miraDetermined", elder: "elderWriting", speaker: "Mira", text: "Group five first. Calm mind. Clear math.", board: "factor" },
      { bg: "board", sprite: "miraHappy", elder: "elderWriting", speaker: "Elder Shellwick", text: "Exactly.", board: "factor" },
      { bg: "board", sprite: "miraNeutral", elder: "elderWriting", speaker: "Narrator", text: "The chalk lines connected into one root-shaped gate mark. The room became very quiet.", board: "rootGate" },
      { bg: "board", sprite: "miraNeutral", elder: "elderWriting", speaker: "Elder Shellwick", text: "The Root Gate will not test one relic at a time. It will mix them.", board: "trial" },
      { bg: "board", sprite: "miraConfused", elder: "elderWriting", speaker: "Mira", text: "Mix them?", board: "trial" },
      { bg: "board", sprite: "miraConfused", elder: "elderWriting", speaker: "Elder Shellwick", text: "Yes. Forty questions. Pass with thirty-seven or more correct.", board: "trial" },
      { bg: "board", sprite: "miraWorried", elder: "elderWriting", speaker: "Mira", text: "Forty. As in... many.", board: "trial" },
      { bg: "board", sprite: "miraWorried", elder: "elderWriting", speaker: "You", text: "So we can only miss three?", board: "trial" },
      { bg: "board", sprite: "miraNeutral", elder: "elderWriting", speaker: "Elder Shellwick", text: "Correct. This is not meant to frighten you. The Trails taught your hands what to do. The Trial asks whether your mind can stay steady.", board: "trial" },
      { bg: "board", sprite: "miraDetermined", elder: "elderWriting", speaker: "Mira", text: "So we use everything.", board: "trial" },
      { bg: "board", sprite: "miraDetermined", elder: "elderWriting", speaker: "You", text: "Signs and sizes. Terms carry their signs. Watch the minus signs. Group repeated numbers.", board: "trial" },
      { bg: "board", sprite: "miraHappy", elder: "elderWriting", speaker: "Mira", text: "We can do this.", board: "trial" },
      { bg: "board", sprite: "miraHappy", elder: "elderWriting", speaker: "Elder Shellwick", text: "That is the first correct answer.", board: "trial" },

      { bg: "cipherRidgeEvening", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The three of you left the cabin. Cipher Ridge Town had grown quiet, and Math Ridge rose into the evening sky.", board: "" },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The Root Gate stood at the end of the lower trail. It was much larger up close." },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Symbols moved across the stone. Positive signs. Negative signs. Parentheses. Groups. Terms." },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The gate was no longer just strange. It was readable. Not easy. But readable." },
      { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "Before, it looked like a wall." },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "And now?" },
      { bg: "gate", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "Now it looks like homework. But magical homework." },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "That is called progress." },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "At the base of the Root Gate were four empty slots.", relicReveal: "lights" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "The Term Stone lit the gate with red and gold symbols. Same signs. Different signs. Sign and size.", relicReveal: "term" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "The Sign Compass sent a blue line across the gate. A term may move. Its sign moves with it.", relicReveal: "sign" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "The Parity Prism split green light across the stone. Pair the negatives. Watch what remains.", relicReveal: "parity" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "The Factor Forge glowed with purple fire. Group first. Then solve.", relicReveal: "factor" },
      { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "For one hopeful second, Mira smiled. Then the gate did not open.", relicReveal: "all" },
      { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "Instead, a long stone tablet rose from the ground. Words burned across it: Root Gate Mastery Trial.", relicReveal: "all" },
      { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "Now it is listening.", relicReveal: "all" },
      { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "Forty questions. Only three mistakes. I might panic a little.", relicReveal: "all" },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "That is okay.", relicReveal: "all" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "I will panic quietly.", relicReveal: "all" },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Panic is permitted. Guessing wildly is not recommended.", relicReveal: "all" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "Quiet panic. No wild guessing.", relicReveal: "all" },
      { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Elder Shellwick", text: "You have learned much, Mira. And so have you, {{playerName}}.", relicReveal: "all" },
      { bg: "bluePhoneSignal", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "The mountain wind moved through the gate. Far above, a faint blue light flickered. Your phone. Still out there. Still waiting.", relicReveal: "all" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Elder Shellwick", text: "The Root Gate Mastery Trial begins when you are ready.", relicReveal: "all" },
      { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "Let's do our best. Definitely.", relicReveal: "all", reward: "intro" }
    ];
  }

  function resultFrames(result) {
    if (result === "pass") {
      return [
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "Root Gate Final Dialogue: The Root Gate Judges Roots" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The final symbol faded. The chamber became still." },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "No more questions appeared. No more stone panels moved. No more glowing numbers waited to be solved." },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The Root Gate stood silent." },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "Mira held her breath." },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "The four relics floated quietly around you.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The Term Stone.", relicReveal: "term" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The Sign Compass.", relicReveal: "sign" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The Parity Prism.", relicReveal: "parity" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "And the Factor Forge.", relicReveal: "factor" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "For a moment... nothing happened.", relicReveal: "all" },
        { bg: "gate", sprite: "miraConfused", elder: "elder", speaker: "Narrator", text: "Then the Root Gate began to glow. Not from the top. Not from the center. From below.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "Thin lines of golden light spread across the floor like roots beneath the earth.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "They moved slowly. Carefully. As if the gate itself was waking up from a very long sleep.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "Mira stepped closer.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "Did we pass?", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "Elder Shellwick did not answer right away.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "He watched the golden roots crawl across the ancient stone. Then he smiled.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "The gate has seen enough.", relicReveal: "all" },
        { bg: "gate", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "Seen enough mistakes?", relicReveal: "all" },
        { bg: "gate", sprite: "miraConfused", elder: "elder", speaker: "Narrator", text: "Shellwick chuckled softly.", relicReveal: "all" },
        { bg: "gate", sprite: "miraConfused", elder: "elder", speaker: "Elder Shellwick", text: "Seen enough growth.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The glowing roots climbed higher and wrapped around the ancient carvings of the gate.", relicReveal: "all" },
        { bg: "rootGateMemory", sprite: "none", elder: "none", speaker: "Narrator", text: "Then images appeared inside the golden light.", relicReveal: "clear" },
        { bg: "rootGateMemory", sprite: "none", elder: "none", speaker: "Narrator", text: "Not scores. Not ranks. Not trophies. Memories." },
        { bg: "rootGateMemory", sprite: "miraWorried", elder: "none", speaker: "Narrator", text: "The first wrong answer. The first retry. The first time Mira almost gave up." },
        { bg: "rootGateMemory", sprite: "miraDetermined", elder: "none", speaker: "Narrator", text: "The first time you looked at a problem again instead of walking away." },
        { bg: "rootGateMemory", sprite: "miraDetermined", elder: "none", speaker: "Narrator", text: "The first time a confusing number finally made sense." },
        { bg: "rootGateMemory", sprite: "miraHappy", elder: "none", speaker: "Narrator", text: "The first time the relics worked together." },
        { bg: "rootGateMemory", sprite: "miraHappy", elder: "none", speaker: "Narrator", text: "The first time a hard problem became smaller because you broke it into pieces." },
        { bg: "rootGateMemory", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "Mira stared at the images. Her voice became quiet." },
        { bg: "rootGateMemory", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "It remembered all of that?" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "Shellwick nodded and stepped beside you and Mira.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "The Root Gate remembers effort.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The golden light reflected in his glasses.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Knowledge alone is a seed.", relicReveal: "term" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The Term Stone glowed softly.", relicReveal: "term" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "A seed may hold great promise, but promise must be cared for.", relicReveal: "term" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The Sign Compass began to shine.", relicReveal: "sign" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Understanding is the root.", relicReveal: "sign" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The golden lines spread deeper across the floor.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "It grows quietly, even when no one else can see it.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The Factor Forge pulsed with warm light.", relicReveal: "factor" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The Parity Prism flashed once, then pointed its light toward the gate.", relicReveal: "parity" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "And persistence is what allows it to grow.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "The chamber rumbled. Dust drifted down from the ceiling.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "So... the gate was not waiting for us to be perfect?", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elderGentleNo", speaker: "Elder Shellwick", text: "No.", relicReveal: "all", voice: ["elder-[long-pause]No.mp3"] },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "He placed one hand on the ancient stone.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "The gate was never searching for perfect students.", relicReveal: "all" },
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Elder Shellwick", text: "It was searching for students willing to continue.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "So even when we were stuck...", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "You were growing.", relicReveal: "all" },
        { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "Even when we were wrong?", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Especially then.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Mira blinked. For a moment, she did not say anything.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The golden roots reached the center of the gate. Ancient locks began to turn, one by one.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "Some roots grow fast.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "A lock opened.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "Some roots grow slowly.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "Another lock opened.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "But no root should be ashamed of its own pace.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The final lock clicked. The entire chamber filled with golden light.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Do not let anyone decide your worth by how quickly you understand.", relicReveal: "all" },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "And do not decide it for yourself too soon, either.", relicReveal: "all" },
        { bg: "gate", sprite: "none", elder: "none", speaker: "Narrator", text: "The gate began to open. Stone scraped against stone. Warm light poured through the widening crack.", relicReveal: "all" },
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Elder Shellwick", text: "The Root Gate judges roots.", relicReveal: "all" },
        { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "Mira looked toward the path ahead. Then she smiled. Not the loud, excited smile from before. A stronger one.", relicReveal: "all" },
        { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "Then we keep growing.", relicReveal: "all" },
        { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "The gate opened fully.", relicReveal: "all" },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "Beyond it was not the end of Math Ridge. Not a final castle. Not a last mountain. Not the answer to everything.", relicReveal: "clear" },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "It was a valley. Quiet. Green. Mysterious." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "Stone shelves lined the hillsides. Crystal trees shimmered in the distance. Small numbers floated in the air like fireflies." },
        { bg: "primeValley", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "Wait..." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "One floating number drifted near the gate. 12." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "It hovered there peacefully. Then, for a single heartbeat, it flickered." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "The number cracked open with a soft golden flash. Inside it, smaller pieces appeared: 2 x 2 x 3." },
        { bg: "primeValley", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "Did... did that number just break into pieces?" },
        { bg: "primeValley", sprite: "miraConfused", elder: "elder", speaker: "Elder Shellwick", text: "Not break. Reveal." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "The four relics floated behind you. The Factor Forge glowed brighter than the others." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "Something small inside it stirred. A hidden light. A sleeping lens. A new power waiting to awaken." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "Farther down the valley, four faint shapes answered that light." },
        { bg: "primeValley", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "The Shelf Scale. The Primewood Seed. The Fraction Loom. The Power Tally." },
        { bg: "primeValley", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "Those are the next relics?" },
        { bg: "primeValley", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Vision Relics. They do not only prove what you solved. They help you see what numbers are made of." },
        { bg: "primeValley", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "So numbers have pieces inside them?" },
        { bg: "primeValley", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Every number has a story." },
        { bg: "primeValley", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "And some stories are easier to understand when you learn how to see what they are made of." },
        { bg: "primeValley", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "Okay. That sounds important." },
        { bg: "pathBeyondRootGate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "Mira took one step past the Root Gate. Then another." },
        { bg: "pathBeyondRootGate", sprite: "none", elder: "none", speaker: "Narrator", text: "The golden roots behind you slowly dimmed, but they did not disappear." },
        { bg: "pathBeyondRootGate", sprite: "none", elder: "none", speaker: "Narrator", text: "They remained glowing faintly in the stone. A reminder. Not of perfection. Of persistence." },
        { bg: "pathBeyondRootGate", sprite: "miraDetermined", elder: "elder", speaker: "Elder Shellwick", text: "You have learned how to solve." },
        { bg: "primeValley", sprite: "none", elder: "none", speaker: "Narrator", text: "The wind moved gently through the valley. The floating numbers shimmered." },
        { bg: "primeValley", sprite: "miraDetermined", elder: "elder", speaker: "Elder Shellwick", text: "Now... you must learn how to see." },
        { bg: "primeValley", sprite: "miraCelebrating", elder: "elder", speaker: "Mira", text: "Then let's go see." },
        { bg: "pathBeyondRootGate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "You stepped forward. The Root Gate stood open behind you. The path beyond it waited ahead." },
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "Root Gate Trial complete. Prime Element Vision awakens.", reward: "pass" }
      ];
    }

    return [
      { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "The fortieth star faded. The Root Gate remained closed." },
      { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "We were close..." },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Close is not failure." },
      { bg: "gate", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "The dim stars around the gate returned to the relics." },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "The gate is not rejecting you. It is showing you where your footing slipped." },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "So we review... and try again." },
      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "That is mastery.", reward: "fail" }
    ];
  }

  function chapterTwoFrames() {
    return [
      { bg: "rootGateOpen", sprite: "none", elder: "none", speaker: "Narrator", text: "Beyond the Root Gate: Back to Shellwick's Cabin", relicReveal: "clear" },
      { bg: "rootGateOpen", sprite: "none", elder: "none", speaker: "Narrator", text: "Scene 1: After the Root Gate" },
      { bg: "rootGateOpen", sprite: "none", elder: "none", speaker: "Narrator", text: "The Root Gate stood open behind you. Its stone roots glowed faintly, like embers after a fire." },
      { bg: "pathBeyondRootGate", sprite: "none", elder: "none", speaker: "Narrator", text: "Beyond it, a new path climbed into mist." },
      { bg: "bluePhoneSignal", sprite: "none", elder: "none", speaker: "Narrator", text: "Higher up the mountain, something flashed blue. Once. Then again." },
      { bg: "bluePhoneSignal", sprite: "none", elder: "none", speaker: "Narrator", text: "Your phone. Still far away. Still waiting." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "Narrator", text: "Mira stood beside you, holding her certificate with both hands. She had been staring at it for several minutes." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "Mira", text: "I keep checking." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "You", text: "Checking what?" },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "Mira", text: "That it still says I passed. It does." },
      { bg: "rootGateOpen", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "A pause." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "Mira", text: "I checked seven times." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "You", text: "That seems enough." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "Mira", text: "Eight is safer." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "Narrator", text: "She looked down at the certificate again." },
      { bg: "rootGateOpen", sprite: "miraCertificate", elder: "elder", speaker: "Mira", text: "I just wanted to make sure it did not change its mind." },
      { bg: "rootGateOpen", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "Before she could check again, Elder Shellwick cleared his throat." },
      { bg: "rootGateOpen", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "Mira." },
      { bg: "rootGateOpen", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "Yes, Elder?" },
      { bg: "rootGateOpen", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Both of you should return to my cabin." },
      { bg: "rootGateOpen", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "Wait. My phone is up there." },
      { bg: "bluePhoneSignal", sprite: "none", elder: "none", speaker: "Narrator", text: "The blue flash appeared again, faint but steady." },
      { bg: "bluePhoneSignal", sprite: "none", elder: "none", speaker: "You", text: "I can see it now." },
      { bg: "bluePhoneSignal", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Yes." },
      { bg: "rootGateOpen", sprite: "none", elder: "elder", speaker: "Narrator", text: "Shellwick looked toward the open gate." },
      { bg: "rootGateOpen", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "But seeing the path is not the same as being ready for it." },
      { bg: "pathBeyondRootGate", sprite: "none", elder: "none", speaker: "Narrator", text: "The wind moved through the Root Gate. Symbols shimmered along the new path, but they were different now." },
      { bg: "pathBeyondRootGate", sprite: "none", elder: "none", speaker: "Narrator", text: "Less like loose numbers. More like shapes hidden inside numbers." },
      { bg: "rootGateOpen", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "There are important things to discuss from here on." },
      { bg: "rootGateOpen", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "Important-good?" },
      { bg: "rootGateOpen", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "Important-necessary." },
      { bg: "rootGateOpen", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "That usually means difficult." },
      { bg: "rootGateOpen", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "I noticed." },

      { bg: "cipherRidgeEvening", sprite: "none", elder: "none", speaker: "Narrator", text: "Scene 2: Return to the Cabin" },
      { bg: "cipherRidgeEvening", sprite: "none", elder: "none", speaker: "Narrator", text: "By the time you returned to Shellwick's cabin, evening had settled over Cipher Ridge." },
      { bg: "cipherRidgeEvening", sprite: "none", elder: "none", speaker: "Narrator", text: "The town lanterns were glowing. The little number charms on the rooftops spun lazily in the wind." },
      { bg: "cipherRidgeEvening", sprite: "miraCertificate", elder: "none", speaker: "Narrator", text: "Mira walked very carefully, still holding her certificate high enough to read." },
      { bg: "cipherRidgeEvening", sprite: "miraCertificate", elder: "none", speaker: "Narrator", text: "Because she was reading it, she did not see the completely normal stone in front of her." },
      { bg: "cipherRidgeEvening", sprite: "miraConfused", elder: "none", speaker: "Narrator", text: "You caught the back of her cloak before she fell." },
      { bg: "cipherRidgeEvening", sprite: "miraWorried", elder: "none", speaker: "Mira", text: "Thank you. I believe the ground moved." },
      { bg: "cipherRidgeEvening", sprite: "miraNeutral", elder: "none", speaker: "You", text: "The ground?" },
      { bg: "cipherRidgeEvening", sprite: "miraConfused", elder: "none", speaker: "Mira", text: "Possibly." },
      { bg: "cabinEvening", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Somehow, Shellwick was already there. He opened the cabin door before either of you knocked. Warm light spilled out." },
      { bg: "cabinInside", sprite: "none", elder: "none", speaker: "Narrator", text: "Inside, the familiar room waited. Books. Scrolls. Tea. A chalkboard full of old symbols." },
      { bg: "emptyRelicTable", sprite: "none", elder: "none", speaker: "Narrator", text: "On the table rested the four lower-trail relics." },
      { bg: "emptyRelicTable", sprite: "none", elder: "none", speaker: "Narrator", text: "The Term Stone. The Sign Compass. The Parity Prism. The Factor Forge." },
      { bg: "emptyRelicTable", sprite: "none", elder: "none", speaker: "Narrator", text: "Their glow was quiet now. Not dead. Finished. Like tools placed back after a job well done." },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "They are quiet." },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "Their task is complete." },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "So we do not use them anymore?" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "You will always use what they taught you." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "The best relics do not stay in your pack. They stay in your thinking." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Mira considered this. Then very carefully placed her certificate on the table." },
      { bg: "emptyRelicTable", sprite: "miraCertificate", elder: "elder", speaker: "Mira", text: "I would still like to keep mine in my pack." },
      { bg: "emptyRelicTable", sprite: "miraCertificate", elder: "elder", speaker: "You", text: "The certificate?" },
      { bg: "emptyRelicTable", sprite: "miraCertificate", elder: "elder", speaker: "Mira", text: "Yes. For thinking support." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Acceptable." },
      { bg: "emptyRelicTable", sprite: "miraMagicSatchel", elder: "elder", speaker: "Narrator", text: "Mira looked relieved and immediately tucked the certificate back into her satchel." },
      { bg: "emptyRelicTable", sprite: "miraMagicSatchel", elder: "elder", speaker: "Mira", text: "Good. I think better when official paper is nearby." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "So the relics are finished... but what they taught us stays?" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Precisely." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Narrator", text: "Shellwick tapped the empty space where the Term Stone had rested." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "The Term Stone taught you to notice signs and sizes." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Narrator", text: "He tapped the second space." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "The Sign Compass taught you that a term carries its sign." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Mira", text: "Like a backpack." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "Yes. Like a backpack." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Narrator", text: "He tapped the third space." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "The Parity Prism taught you to watch stacked signs." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Narrator", text: "Then the fourth." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "And the Factor Forge taught you to group what repeats." },
      { bg: "emptyRelicTable", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "Five first." },
      { bg: "emptyRelicTable", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "Exactly." },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "So... we really learned all that?" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "You did." },
      { bg: "emptyRelicTable", sprite: "miraMagicSatchel", elder: "elder", speaker: "Narrator", text: "Mira looked down at her satchel, where the certificate was now safely tucked away." },
      { bg: "emptyRelicTable", sprite: "miraMagicSatchel", elder: "elder", speaker: "Mira", text: "Then bravery counted?" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Shellwick smiled gently." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Bravery helped you begin." },
      { bg: "board", sprite: "none", elder: "none", speaker: "Narrator", text: "He turned toward the chalkboard.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "But understanding opened the gate.", board: "chapterOneTools" },
      { bg: "cabinInside", sprite: "none", elder: "none", speaker: "Narrator", text: "The room grew quiet." },
      { bg: "bluePhoneSignal", sprite: "none", elder: "none", speaker: "Narrator", text: "Outside the window, far above the Root Gate, the blue flash appeared again." },
      { bg: "bluePhoneSignal", sprite: "none", elder: "none", speaker: "Narrator", text: "Your phone. Still higher. Still waiting." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "Then what comes next?" },
      { bg: "seriousShelfCase", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Shellwick's smile faded into something more thoughtful." },
      { bg: "seriousShelfCase", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "The lower trail taught you how to handle numbers." },
      { bg: "seriousShelfCase", sprite: "none", elder: "elder", speaker: "Narrator", text: "He reached toward the high shelf behind his desk." },
      { bg: "seriousShelfCase", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "From here on..." },
      { bg: "seriousShelfCase", sprite: "none", elder: "elder", speaker: "Narrator", text: "His claw rested on an old dust-covered case." },
      { bg: "seriousShelfCase", sprite: "none", elder: "elder", speaker: "Elder Shellwick", text: "You must learn to see what numbers are made of." },
      { bg: "seriousShelfCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Inside the old case, something answered with a quiet, unfamiliar glow." },

      { bg: "seriousShelfCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Scene 3: A Different Kind of Relic", relicReveal: "clear" },
      { bg: "seriousShelfCase", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The old case came down from the serious shelf and settled on the table." },
      { bg: "seriousShelfCase", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "That is the serious shelf." },
      { bg: "seriousShelfCase", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "How do you know?" },
      { bg: "seriousShelfCase", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "I am not allowed to dust it." },
      { bg: "seriousShelfCase", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "Shellwick gave her a look. Mira immediately stood straighter." },
      { bg: "seriousShelfCase", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "For safety reasons." },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Shellwick placed the case on the table. The lid opened by itself.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Inside were four faint outlines. Not relics yet. Only shadows of relics.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "A small balanced scale. A seed with tiny carved rings. A silver loom threaded with glowing lines. A set of marks stacked like rising sparks.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Were those...", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "You", text: "More relics?", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Yes.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Are they like the first four?", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "No.", relicReveal: "lights" },
      { bg: "seriousShelfCase", sprite: "none", elder: "none", speaker: "Narrator", text: "He closed the case softly.", relicReveal: "clear" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The first relics taught you how to control numbers.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Signs. Terms. Stacked signs. And repeated groups.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Mira", text: "Those used to look scary.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "You", text: "They still look a little scary.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Mira", text: "But now they are familiar scary.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Familiar scary is progress.", board: "chapterOneTools" },

      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Narrator", text: "Scene 4: The Vision Relics", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "What do you see?", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "You", text: "Twelve.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Mira", text: "I see a one and a two. And possibly a very thin snake.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "No snake.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Mira", text: "Probably wise.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Beyond the Root Gate, the mountain will ask a deeper question.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Narrator", text: "The chalkboard shimmered. The number 12 split into different forms.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Mira", text: "It changed.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "No. It revealed itself.", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "You", text: "So the next path is not just solving?", board: "vision12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Correct. It is seeing.", board: "vision12" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The next four relics are called the Vision Relics.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Vision Relics...", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Do they give us magical glasses?", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "No.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Small glasses?", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "No.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Tiny glasses for numbers?", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Mira.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Right. Not glasses.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The Vision Relics help you see what numbers are made of.", relicReveal: "lights" },

      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Scene 5: The Four Shadows", relicReveal: "clear" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "The case opened again. This time, the four shadows rose into the air.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Only briefly. Only enough to be seen.", relicReveal: "lights" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The Shelf Scale.", relicReveal: "term" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "That one looks friendly.", relicReveal: "term" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "You", text: "What does it do?", relicReveal: "term" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "It helps compare pieces and place them where they belong.", relicReveal: "term" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "So it is a very organized shelf.", relicReveal: "term" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "In a sense.", relicReveal: "term" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The Primewood Seed.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "The seed cracked open, showing smaller glowing factors inside.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "You", text: "Primewood?", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Some numbers grow from smaller roots.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Does it need water?", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "No.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Sunlight?", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "No.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Compliments?", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Those are harmless.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "You are doing very well.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "The seed flickered once. Mira's ears shot up.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "It heard me.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "It reflected light.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "It heard me reflectively.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Shellwick decided not to argue.", relicReveal: "sign" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The Fraction Loom.", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Threads of silver light crossed through a small frame. They divided one glowing circle into equal parts.", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Fractions. I have heard stories.", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "You", text: "Bad stories?", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "Half of them were bad. Which feels appropriate, but upsetting.", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The loom does not harm the whole. It shows how the whole is woven.", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "That sounds less terrifying.", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "You", text: "A little.", relicReveal: "parity" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The Power Tally.", relicReveal: "factor" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Small glowing tally marks rose upward. Then doubled. Then doubled again.", relicReveal: "factor" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "You", text: "That one looks... intense.", relicReveal: "factor" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "It records repeated growth.", relicReveal: "factor" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "So it counts numbers that are climbing on top of themselves?", relicReveal: "factor" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Not official language. But not entirely wrong.", relicReveal: "factor" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Mira", text: "I am improving.", relicReveal: "all" },

      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "Scene 6: What the Next Path Means", relicReveal: "clear" },
      { bg: "visionRelicCase", sprite: "none", elder: "none", speaker: "Narrator", text: "The four shadows faded back into the case. For a moment, the cabin was quiet." },
      { bg: "bluePhoneSignal", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Shellwick looked toward the window. The opened Root Gate could not be seen from here, but the mountain above it glowed faintly blue." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Beyond the Root Gate, the path changes." },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "The lower trail taught stability.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Do not lose signs.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Mira", text: "Backpacks.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Watch stacked negatives.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Mira", text: "Minus signs need supervision.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Group repeated numbers.", board: "chapterOneTools" },
      { bg: "board", sprite: "none", elder: "none", speaker: "Mira", text: "Five first.", board: "chapterOneTools" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "Good. But from now on, you must look beneath the surface.", board: "roots12" },
      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Elder Shellwick", text: "A number is not always just what it appears to be.", board: "roots12" },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "You thought about your phone. About the teleport stone hidden inside it. About your ordinary math book becoming a final manual in another world." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "Like my phone. It looked like just a phone. But here, it is carrying a return spell." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Exactly." },
      { bg: "cabinInside", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "So things can hold more than they seem." },
      { bg: "cabinInside", sprite: "miraMagicSatchel", elder: "elder", speaker: "Narrator", text: "She reached inside her satchel and pulled out a pencil. Then a spoon. Then the same emergency cup noodles." },
      { bg: "cabinInside", sprite: "miraMagicSatchel", elder: "elder", speaker: "Mira", text: "This also holds more than it seems." },
      { bg: "cabinInside", sprite: "miraMagicSatchel", elder: "elder", speaker: "You", text: "That is lunch." },
      { bg: "cabinInside", sprite: "miraMagicSatchel", elder: "elder", speaker: "Mira", text: "Emergency lunch." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "The path beyond the Root Gate will require patience. And careful seeing." },
      { bg: "cabinInside", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "I can be careful." },
      { bg: "cabinInside", sprite: "miraConfused", elder: "elder", speaker: "Narrator", text: "A glowing moth drifted past the window. Mira's eyes followed it." },
      { bg: "cabinInside", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "You and Shellwick both looked at her. She slowly forced her eyes back to the table." },
      { bg: "cabinInside", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "I can be careful starting now." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "Progress." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Indeed." },

      { bg: "chapterTwoBoard", sprite: "none", elder: "none", speaker: "Narrator", text: "Scene 7: The Next Manual", board: "chapterTwoManual" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Shellwick reached beneath the table and pulled out a new booklet." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "Its cover was darker than the first Manual. Faint golden lines formed the shape of a shelf." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "He did not say the relic name again. Not yet. He simply handed the booklet to you." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "This is the first Manual beyond the Root Gate." },
      { bg: "emptyRelicTable", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "Does it have many pages?" },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Enough." },
      { bg: "emptyRelicTable", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "Enough is a mysterious number." },
      { bg: "emptyRelicTable", sprite: "miraNeutral", elder: "elder", speaker: "You", text: "We made it through the lower trail." },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "We did. And this time, we have certificates." },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "That means we are at least slightly official." },
      { bg: "emptyRelicTable", sprite: "miraHappy", elder: "elder", speaker: "Elder Shellwick", text: "Then, slightly official apprentices... prepare yourselves." },
      { bg: "pathBeyondRootGate", sprite: "none", elder: "none", speaker: "Narrator", text: "The booklet glowed in your hands. Outside, the mountain path above the Root Gate lit one stone at a time." },
      { bg: "pathBeyondRootGate", sprite: "none", elder: "none", speaker: "Narrator", text: "A new path was waiting.", reward: "chapter2" }
    ];
  }

  function hideActor(character) {
    const actor = actors[character];
    if (!actor?.stage || !actor?.img) return;
    actor.loadToken += 1;
    actor.stage.classList.add("is-hidden");
    actor.stage.classList.remove("is-loading", "is-listening");
    actor.stage.removeAttribute("data-motion");
    actor.stage.setAttribute("aria-hidden", "true");
  }

  function revealActor(character, key, motion = "") {
    const actor = actors[character];
    const sprite = sprites[key];
    if (!actor?.stage || !actor?.img || !sprite?.src) return;

    const changed = actor.img.getAttribute("src") !== sprite.src;
    const token = actor.loadToken + 1;
    actor.loadToken = token;
    actor.lastKey = key;
    actor.stage.dataset.character = character;
    actor.stage.removeAttribute("data-motion");

    const show = () => {
      if (actor.loadToken !== token) return;
      actor.stage.classList.remove("is-hidden", "is-loading");
      actor.stage.setAttribute("aria-hidden", "false");
      const finalMotion = motion || (changed ? "soft-switch" : "");
      if (finalMotion) {
        void actor.stage.offsetWidth;
        actor.stage.dataset.motion = finalMotion;
      }
    };

    if (changed) {
      actor.stage.classList.add("is-loading");
      actor.img.onload = show;
      actor.img.onerror = () => hideActor(character);
      actor.img.src = sprite.src;
      if (actor.img.complete && actor.img.naturalWidth) window.requestAnimationFrame(show);
      return;
    }

    window.requestAnimationFrame(show);
  }

  function setActorFocus(activeCharacter) {
    Object.keys(actors).forEach(character => {
      const actor = actors[character];
      if (!actor?.stage || actor.stage.classList.contains("is-hidden")) return;
      actor.stage.classList.toggle("is-listening", character !== activeCharacter);
    });
  }

  function setActors(frame) {
    const miraKey = frame.sprite;
    const elderKey = frame.elder || (frame.speaker === "Elder Shellwick" ? "elder" : "");
    const active = frame.speaker === "Elder Shellwick" ? "elder" : "mira";

    if (miraKey && miraKey !== "none") revealActor("mira", miraKey, frame.motion || "");
    else hideActor("mira");

    if (elderKey && elderKey !== "none") revealActor("elder", elderKey, "");
    else hideActor("elder");

    if (miraKey && elderKey) setActorFocus(active);
  }

  function setBackground(key) {
    let nextKey = key || "gate";
    if (mode === "result" && outcome === "pass" && nextKey === "gate") nextKey = "rootGateOpen";
    if (!sceneBg || nextKey === currentBgKey) return;
    currentBgKey = nextKey;
    storyVn?.classList.add("is-scene-changing");
    window.setTimeout(() => {
      sceneBg.style.backgroundImage = `url("${backgrounds[nextKey] || backgrounds.gate}")`;
      window.setTimeout(() => storyVn?.classList.remove("is-scene-changing"), 220);
    }, 170);
  }

  function setRelicReveal(state = "") {
    if (!relicRevealStage || !relicRevealStage.children.length) return;

    const relicItems = [...relicRevealStage.querySelectorAll(".story-relic")];
    const activeRelic = relicOrder.includes(state) ? state : "";
    const visible = Boolean(state && state !== "clear");
    const visibleCount = state === "all"
      ? relicOrder.length
      : activeRelic
        ? relicOrder.indexOf(activeRelic) + 1
        : 0;

    relicRevealStage.classList.remove("reveal-lights", "reveal-term", "reveal-sign", "reveal-parity", "reveal-factor", "reveal-all", "has-lights", "has-term", "has-sign", "has-parity", "has-factor");
    relicRevealStage.removeAttribute("data-active");

    if (!visible) {
      relicRevealStage.classList.remove("is-active");
      relicItems.forEach(item => item.classList.remove("is-lit", "is-revealed", "is-featured"));
      relicRevealStage.setAttribute("aria-hidden", "true");
      return;
    }

    relicRevealStage.classList.add("is-active", `reveal-${state}`);
    relicRevealStage.setAttribute("aria-hidden", "false");
    if (activeRelic) relicRevealStage.dataset.active = activeRelic;

    relicItems.forEach(item => {
      const index = relicOrder.indexOf(item.dataset.relic);
      const shouldReveal = index >= 0 && index < visibleCount;
      item.classList.toggle("is-lit", state === "lights" || shouldReveal);
      item.classList.toggle("is-revealed", shouldReveal);
      item.classList.toggle("is-featured", item.dataset.relic === activeRelic);
    });

    relicOrder.slice(0, visibleCount).forEach(relic => relicRevealStage.classList.add(`has-${relic}`));
    if (state === "lights") relicRevealStage.classList.add("has-lights");
  }

  function setBlackboard(stateKey = "") {
    if (!blackboardStage) return;
    const state = blackboardStates[stateKey];
    if (!state) {
      blackboardStage.classList.add("is-hidden");
      blackboardStage.setAttribute("aria-hidden", "true");
      blackboardStage.replaceChildren();
      return;
    }

    blackboardStage.replaceChildren();
    blackboardStage.dataset.board = stateKey;

    const glow = document.createElement("span");
    glow.className = "blackboard-glow";
    glow.setAttribute("aria-hidden", "true");
    blackboardStage.appendChild(glow);

    const badge = document.createElement("span");
    badge.className = "blackboard-badge";
    badge.textContent = state.badge;
    blackboardStage.appendChild(badge);

    const title = document.createElement("strong");
    title.className = "blackboard-title";
    title.textContent = state.title;
    blackboardStage.appendChild(title);

    const list = document.createElement("div");
    list.className = "blackboard-lines";
    state.rows.forEach((row, index) => {
      const item = document.createElement("div");
      item.className = "blackboard-line";
      item.dataset.kind = row.kind || "note";
      item.style.setProperty("--line-index", index);

      const label = document.createElement("span");
      label.className = "blackboard-label";
      label.textContent = row.label;
      item.appendChild(label);

      const text = document.createElement("span");
      text.className = "blackboard-text";
      text.textContent = row.text;
      item.appendChild(text);
      list.appendChild(item);
    });
    blackboardStage.appendChild(list);
    blackboardStage.classList.remove("is-hidden");
    blackboardStage.setAttribute("aria-hidden", "false");
  }

  function speakerClass(frame) {
    if (isNarration(frame)) return "speaker-narrator";
    const speaker = String(frame.speaker || "").toLowerCase();
    if (speaker.includes("elder")) return "speaker-elder";
    if (speaker.includes("mira")) return "speaker-mira";
    if (speaker.includes("you")) return "speaker-you";
    return "speaker-system";
  }

  function setSpeaker(frame) {
    if (!dialogueBox) return;
    Array.from(dialogueBox.classList || []).forEach(className => {
      if (className.startsWith("speaker-")) dialogueBox.classList.remove(className);
    });
    dialogueBox.classList.toggle("is-narration", isNarration(frame));
    dialogueBox.classList.add(speakerClass(frame));
    speakerName.textContent = isNarration(frame) ? "Narrator" : frame.speaker || "";
  }

  function stopTyping(showFull = false) {
    if (typeTimer) {
      window.clearTimeout(typeTimer);
      typeTimer = 0;
    }
    if (showFull) dialogueText.textContent = typeTargetText;
    isTyping = false;
    dialogueBox?.classList.remove("is-typing");
  }

  function typeText(text) {
    stopTyping(false);
    typeTargetText = text;
    dialogueText.textContent = "";
    isTyping = true;
    dialogueBox?.classList.add("is-typing");

    let index = 0;
    const step = () => {
      index += 1;
      dialogueText.textContent = typeTargetText.slice(0, index);
      if (index < typeTargetText.length) {
        typeTimer = window.setTimeout(step, 18);
        return;
      }
      stopTyping(false);
    };

    typeTimer = window.setTimeout(step, 18);
  }

  function normalizeVoiceSource(source, base) {
    if (typeof source === "number") return { pause: source };
    if (source && typeof source === "object") return source;
    return { base, file: source };
  }

  function normalizeSoundCue(source) {
    if (!source) return null;
    if (typeof source === "string") return { base: soundBase, file: source };
    if (source && typeof source === "object") return Object.assign({ base: soundBase }, source);
    return null;
  }

  function frameVoiceFiles(frame) {
    if (Array.isArray(frame?.voice)) {
      return frame.voice.map(file => normalizeVoiceSource(file, elderVoiceBase));
    }

    if (frame?.speaker === "Mira") {
      return (miraVoiceFilesByText.get(frame.text) || [])
        .map(file => normalizeVoiceSource(file, miraVoiceBase));
    }

    if (frame?.speaker !== "Elder Shellwick") return [];
    return (elderVoiceFilesByText.get(frame.text) || [])
      .map(file => normalizeVoiceSource(file, elderVoiceBase));
  }

  function voiceUrl(source) {
    return `${source.base}${encodeURIComponent(source.file)}`;
  }

  function prepareAudioUrl(url, cache, volume = 0.9) {
    if (!url || !cache || cache.has(url) || typeof Audio !== "function") return cache?.get(url) || null;

    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = volume;
    try { audio.load(); } catch (error) {}
    cache.set(url, audio);
    return audio;
  }

  function createPreparedAudio(url, cache, volume = 0.9) {
    const prepared = prepareAudioUrl(url, cache, volume);
    const audio = prepared && typeof prepared.cloneNode === "function"
      ? prepared.cloneNode(true)
      : new Audio(url);

    audio.preload = "auto";
    audio.volume = volume;
    try { audio.currentTime = 0; } catch (error) {}
    return audio;
  }

  function prepareVoiceSource(source) {
    if (!source || source.pause) return;
    prepareAudioUrl(voiceUrl(source), preparedVoiceAudio, 0.95);
  }

  function createVoiceAudio(source) {
    return createPreparedAudio(voiceUrl(source), preparedVoiceAudio, 0.95);
  }

  function soundCueUrl(source) {
    const cue = normalizeSoundCue(source);
    return cue ? `${cue.base}${encodeURIComponent(cue.file)}` : "";
  }

  function prepareSoundSource(source) {
    const cue = normalizeSoundCue(source);
    if (!cue?.file) return;
    const volume = Number.isFinite(cue.volume) ? Math.max(0, Math.min(1, Number(cue.volume))) : 0.42;
    prepareAudioUrl(soundCueUrl(cue), preparedSoundAudio, volume);
  }

  function createSoundAudio(cue) {
    const volume = Number.isFinite(cue.volume) ? Math.max(0, Math.min(1, Number(cue.volume))) : 0.42;
    return createPreparedAudio(soundCueUrl(cue), preparedSoundAudio, volume);
  }

  function clearSoundEntry(entry) {
    if (!entry) return;
    (entry.timers || []).forEach(timer => window.clearTimeout(timer));
    if (entry.fadeTimer) window.clearInterval(entry.fadeTimer);
    if (entry.audio) {
      entry.audio.pause();
      entry.audio.removeAttribute("src");
      entry.audio.load();
    }
    activeSoundCues = activeSoundCues.filter(item => item !== entry);
  }

  function fadeOutSoundEntry(entry, fadeMs = 240) {
    if (!entry?.audio || fadeMs <= 0) {
      clearSoundEntry(entry);
      return;
    }

    (entry.timers || []).forEach(timer => window.clearTimeout(timer));
    entry.timers = [];
    if (entry.fadeTimer) window.clearInterval(entry.fadeTimer);

    const audio = entry.audio;
    const startVolume = Math.max(0, Number(audio.volume || 0));
    const started = performance.now();

    entry.fadeTimer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / fadeMs);
      audio.volume = Math.max(0, startVolume * (1 - progress));
      if (progress >= 1) clearSoundEntry(entry);
    }, 40);
  }

  function releaseSoundAdvanceLock() {
    soundAdvanceLocked = false;
    if (soundAdvanceTimer) {
      window.clearTimeout(soundAdvanceTimer);
      soundAdvanceTimer = null;
    }
    document.documentElement.classList.remove("sound-advance-locked");
  }

  function setSoundAdvanceLock(durationMs = 0) {
    releaseSoundAdvanceLock();
    const lockMs = Math.max(0, Number(durationMs || 0));
    if (!lockMs) return;
    soundAdvanceLocked = true;
    document.documentElement.classList.add("sound-advance-locked");
    soundAdvanceTimer = window.setTimeout(releaseSoundAdvanceLock, lockMs);
  }

  function stopSoundCues(options = {}) {
    releaseSoundAdvanceLock();
    const fadeMs = Math.max(0, Number(options.fadeMs || 0));
    activeSoundCues.slice().forEach(entry => {
      if (fadeMs > 0) fadeOutSoundEntry(entry, fadeMs);
      else clearSoundEntry(entry);
    });
  }

  function scheduleSoundCueStop(entry, cue, startAt) {
    const audio = entry.audio;
    const endAt = Number(cue.end);
    const maxMs = Number(cue.maxMs);
    const hasEnd = Number.isFinite(endAt) && endAt > startAt;
    const durationMs = hasEnd
      ? (endAt - startAt) * 1000
      : Number.isFinite(maxMs) && maxMs > 0
        ? maxMs
        : 0;
    if (!durationMs) return;

    const fadeMs = Math.max(0, Number(cue.fadeOut || 0));
    const originalVolume = Number.isFinite(cue.volume) ? Number(cue.volume) : audio.volume;

    if (fadeMs && durationMs > fadeMs + 80) {
      const fadeTimer = window.setTimeout(() => {
        const started = performance.now();
        entry.fadeTimer = window.setInterval(() => {
          const progress = Math.min(1, (performance.now() - started) / fadeMs);
          audio.volume = Math.max(0, originalVolume * (1 - progress));
          if (progress >= 1) {
            window.clearInterval(entry.fadeTimer);
            entry.fadeTimer = null;
          }
        }, 40);
      }, Math.max(0, durationMs - fadeMs));
      entry.timers.push(fadeTimer);
    }

    const stopTimer = window.setTimeout(() => clearSoundEntry(entry), durationMs);
    entry.timers.push(stopTimer);
  }

  function playSoundCue(source) {
    const cue = normalizeSoundCue(source);
    if (!cue?.file) return null;

    const entry = { audio: null, timers: [], fadeTimer: null };
    activeSoundCues.push(entry);
    const start = () => {
      const url = soundCueUrl(cue);
      if (!url) return;
      const audio = createSoundAudio(cue);
      const startAt = Math.max(0, Number(cue.start || 0));
      entry.audio = audio;
      audio.preload = "auto";
      audio.volume = Number.isFinite(cue.volume) ? Math.max(0, Math.min(1, Number(cue.volume))) : 0.42;
      audio.loop = Boolean(cue.loop);
      audio.addEventListener("ended", () => clearSoundEntry(entry), { once: true });
      audio.addEventListener("error", () => clearSoundEntry(entry), { once: true });

      const begin = () => {
        if (entry.audio !== audio) return;
        if (startAt && audio.duration && startAt < audio.duration) {
          try { audio.currentTime = startAt; } catch (error) {}
        }
        scheduleSoundCueStop(entry, cue, startAt);
        const attempt = audio.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => clearSoundEntry(entry));
        }
      };

      if (audio.readyState >= 1) begin();
      else {
        audio.addEventListener("loadedmetadata", begin, { once: true });
        audio.load();
      }
    };

    const delay = Math.max(0, Number(cue.delay || 0));
    if (delay) entry.timers.push(window.setTimeout(start, delay));
    else start();
    return entry;
  }

  function playSoundCues(cues = []) {
    const list = Array.isArray(cues) ? cues : [cues];
    list.forEach(playSoundCue);
  }

  function frameSoundCues(frame) {
    const cues = [];
    const textCues = sceneSoundCuesByText.get(frame?.text) || [];
    cues.push(...textCues);
    if (Array.isArray(frame?.sfx)) cues.push(...frame.sfx);
    else if (frame?.sfx) cues.push(frame.sfx);
    return cues;
  }

  function prepareStoryAudio(startIndex = currentIndex, ahead = PRELOAD_AHEAD_FRAMES) {
    const from = Math.max(0, Number(startIndex) || 0);
    const to = Math.min(frames.length - 1, from + Math.max(0, Number(ahead) || 0));
    for (let index = from; index <= to; index += 1) {
      const frame = frames[index];
      frameVoiceFiles(frame).forEach(prepareVoiceSource);
      frameSoundCues(frame).forEach(prepareSoundSource);
    }
  }

  function soundCueLockDuration(cues, hasVoice = false) {
    if (!cues.length || hasVoice) return 0;
    return cues.reduce((max, cueLike) => {
      const cue = normalizeSoundCue(cueLike);
      if (!cue?.file) return max;
      if (Number.isFinite(Number(cue.lockMs))) return Math.max(max, Number(cue.lockMs));
      const start = Math.max(0, Number(cue.start || 0));
      const end = Number(cue.end);
      const windowMs = Number.isFinite(end) && end > start ? (end - start) * 1000 : 700;
      return Math.max(max, Math.min(1600, Math.max(650, windowMs * 0.55)));
    }, 0);
  }

  function stopVoice() {
    voiceToken += 1;
    voiceAdvanceLocked = false;
    document.documentElement.classList.remove("voice-advance-locked");
    if (!activeVoice) return;
    activeVoice.pause();
    activeVoice.removeAttribute("src");
    activeVoice.load();
    activeVoice = null;
  }

  function playVoiceQueue(files, lockAdvance = false) {
    stopVoice();
    if (!files.length) return;

    const token = voiceToken;
    const queue = files.slice();
    voiceAdvanceLocked = Boolean(lockAdvance);
    document.documentElement.classList.toggle("voice-advance-locked", voiceAdvanceLocked);

    const releaseAdvanceLock = () => {
      if (token !== voiceToken) return;
      voiceAdvanceLocked = false;
      document.documentElement.classList.remove("voice-advance-locked");
    };

    const playNext = () => {
      if (token !== voiceToken || !queue.length) {
        activeVoice = null;
        releaseAdvanceLock();
        return;
      }

      const source = queue.shift();
      if (source?.pause) {
        window.setTimeout(playNext, Number(source.pause) || 500);
        return;
      }

      const audio = createVoiceAudio(source);
      activeVoice = audio;
      audio.preload = "auto";
      audio.volume = 0.95;
      audio.addEventListener("ended", playNext, { once: true });
      audio.addEventListener("error", playNext, { once: true });

      const attempt = audio.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          if (token === voiceToken) {
            activeVoice = null;
            releaseAdvanceLock();
          }
        });
      }
    };

    playNext();
  }

  function playFrameVoice(frame) {
    const files = frameVoiceFiles(frame);
    playVoiceQueue(files, files.length > 0);
  }

  function clearInteraction() {
    interactionPanel?.classList.add("hidden");
    nameForm?.classList.add("hidden");
    choiceRow?.classList.add("hidden");
    feedbackText?.classList.add("hidden");
  }

  function rewardContent(kind) {
    if (kind === "chapter2") {
      return {
        key: CHAPTER_TWO_OPENING_KEY,
        title: "Beyond the Root Gate Unlocked",
        summary: "Beyond the Root Gate, the mountain asks you to see what numbers are made of.",
        lines: [
          "New Relic Type: Vision Relics",
          "Shelf Scale: Compare and arrange number pieces",
          "Primewood Seed: See the roots numbers are built from",
          "Fraction Loom: Understand parts of a whole",
          "Power Tally: Track repeated growth",
          "Next Objective: Open the first Vision Manual"
        ],
        actions: [
          { href: "note5.html", text: "Open Manual 2-1" },
          { href: "index.html?view=quest#quest", text: "Return to Mountain Trail", secondary: true }
        ]
      };
    }

    if (kind === "pass") {
      return {
        key: PASS_STORY_KEY,
        title: "Root Gate Opened",
        summary: "The Root Gate is open. The lower path has been proven.",
        lines: [
          "Certificate Earned: Root Gate Mastery Certificate",
          "New Path Unlocked: Beyond the Root Gate",
          "Next Objective: follow the signal from your missing device."
        ],
        actions: [
          { href: "story-chapter-2.html", text: "Enter the Next Path" },
          { href: "index.html?view=quest#quest", text: "Return to Mountain Trail", secondary: true }
        ]
      };
    }

    if (kind === "fail") {
      return {
        key: FAIL_STORY_KEY,
        title: "Root Gate Did Not Open Yet",
        summary: "Review your missed skills, then return to the Trial when your footing feels steady.",
        lines: [
          "Close is not failure.",
          "The gate is showing where the next practice should go.",
          "Your original score stays locked. Corrections are for practice."
        ],
        actions: [
          { href: "root-gate-test.html", text: "Retry Trial" },
          { href: "index.html?view=quest#quest", text: "Return to Manuals", secondary: true }
        ]
      };
    }

    return {
      key: INTRO_COMPLETE_KEY,
      title: "Root Gate Mastery Trial Unlocked",
      summary: "The four relics are awake. The Root Gate is listening.",
      lines: [
        "Trial Type: Mastery Test",
        "Questions: 40",
        "Passing Score: 37 / 40 or higher",
        "Allowed Mistakes: 3"
      ],
      actions: [
        { href: "root-gate-test.html", text: "Begin Root Gate Mastery Trial" },
        { href: "index.html?view=quest#quest", text: "Review Manuals", secondary: true },
        { href: "index.html?view=quest#quest", text: "Practice Trails Again", secondary: true }
      ]
    };
  }

  function renderReward(kind) {
    stopVoice();
    stopSoundCues({ fadeMs: 280 });
    if (kind === "pass") playSoundCues(certificateUnlockCues);
    if (kind === "chapter2") playSoundCues(chapterUnlockCues);
    const content = rewardContent(kind);
    try {
      localStorage.setItem(content.key, "true");
      if (kind === "chapter2") {
        localStorage.setItem("mathRidge_noteUnlocked_2_1", "true");
        localStorage.setItem("mathRidge_stageUnlocked_2_1", "true");
      }
    } catch (error) {}

    if (!rewardCard) return;
    rewardCard.innerHTML = `
      <h2 id="rewardTitle">${content.title}</h2>
      <p>${content.summary}</p>
      <div class="trial-facts">
        ${content.lines.slice(0, 3).map(line => {
          const parts = line.split(":");
          if (parts.length > 1) return `<span><strong>${parts.shift()}</strong>${parts.join(":").trim()}</span>`;
          return `<span>${line}</span>`;
        }).join("")}
      </div>
      <div class="reward-lines">
        ${content.lines.slice(3).map(line => `<span>${line}</span>`).join("")}
      </div>
      <div class="reward-actions">
        ${content.actions.map(action => `<a class="${action.secondary ? "secondary" : ""}" href="${action.href}">${action.text}</a>`).join("")}
      </div>
    `;

    rewardPanel?.classList.remove("hidden");
    nextBtn.disabled = true;
  }

  function hasWatchedIntro() {
    try { return localStorage.getItem(INTRO_COMPLETE_KEY) === "true"; }
    catch (error) { return false; }
  }

  function shouldReplayIntro() {
    const watch = String(params.get("watch") || "").toLowerCase();
    return watch === "1" || watch === "true" || watch === "again";
  }

  function shouldShowIntroShortcut() {
    return mode === "intro" && hasWatchedIntro() && !shouldReplayIntro();
  }

  function renderIntroShortcut() {
    storyVn?.classList.add("story-shortcut-mode");
    storyVn?.classList.add("is-board-review");
    stopTyping(false);
    stopVoice();
    clearInteraction();
    rewardPanel?.classList.add("hidden");
    setBackground("gate");
    setRelicReveal("all");
    setBlackboard("trial");
    hideActor("mira");
    hideActor("elder");
    if (progressBar) progressBar.style.transform = "scaleX(1)";
    if (sceneCounter) sceneCounter.textContent = "Trial Ready";
    if (backBtn) backBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    if (!rewardCard) return;
    rewardCard.innerHTML = `
      <h2 id="rewardTitle">Root Gate Trial Ready</h2>
      <p>You have already watched the Root Gate finale. You can begin the mastery trial now, or replay the scene when you want the story again.</p>
      <div class="trial-facts">
        <span><strong>40</strong>questions</span>
        <span><strong>37+</strong>to pass</span>
        <span><strong>10:00</strong>time limit</span>
      </div>
      <div class="reward-actions">
        <a href="root-gate-test.html">Begin Root Gate Mastery Trial</a>
        <a class="secondary" href="story-root-gate.html?watch=1">Watch Scene Again</a>
        <a class="secondary" href="index.html?view=quest#quest">Mountain Trail</a>
      </div>
    `;
    rewardPanel?.classList.remove("hidden");
  }

  function updateProgress() {
    if (!progressBar) return;
    const progress = frames.length <= 1 ? 1 : currentIndex / (frames.length - 1);
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  function renderFrame() {
    const frame = frames[currentIndex];
    const boardReview = Boolean(frame.board && ["board", "chapterTwoBoard"].includes(frame.bg));
    const relicFocus = Boolean(frame.relicReveal && !["clear", "fade"].includes(frame.relicReveal));
    const voiceFiles = frameVoiceFiles(frame);
    const soundCues = frameSoundCues(frame);
    prepareStoryAudio(currentIndex);
    stopSoundCues({ fadeMs: 280 });
    clearInteraction();
    rewardPanel?.classList.add("hidden");
    storyVn?.classList.toggle("is-board-review", boardReview);

    setBackground(frame.bg);
    setRelicReveal(frame.relicReveal || "");
    setBlackboard(frame.board || "");
    if (boardReview || relicFocus) {
      hideActor("mira");
      hideActor("elder");
    } else {
      setActors(frame);
    }
    setSpeaker(frame);

    sceneCounter.textContent = `${currentIndex + 1} / ${frames.length}`;
    backBtn.disabled = currentIndex === 0;
    nextBtn.disabled = false;
    nextBtn.textContent = frame.reward ? "Complete" : "Next";
    typeText(frameText(frame));
    playVoiceQueue(voiceFiles, voiceFiles.length > 0);
    playSoundCues(soundCues);
    setSoundAdvanceLock(soundCueLockDuration(soundCues, voiceFiles.length > 0));
    updateProgress();
  }

  function goNext() {
    const frame = frames[currentIndex];
    if (voiceAdvanceLocked || soundAdvanceLocked) return;
    if (isTyping) {
      stopTyping(true);
      return;
    }
    if (frame?.reward) {
      renderReward(frame.reward);
      return;
    }
    currentIndex = Math.min(frames.length - 1, currentIndex + 1);
    renderFrame();
  }

  function goBack() {
    if (voiceAdvanceLocked || soundAdvanceLocked) return;
    stopTyping(false);
    currentIndex = Math.max(0, currentIndex - 1);
    renderFrame();
  }

  function preventDefault(event) {
    event.preventDefault();
  }

  function preventAppZoom(event) {
    if (event.touches && event.touches.length > 1) event.preventDefault();
  }

  function preventSafariGesture(event) {
    event.preventDefault();
  }

  nextBtn?.addEventListener("click", goNext);
  backBtn?.addEventListener("click", goBack);

  document.addEventListener("click", event => {
    if (event.target.closest("button, a, input, label")) return;
    if (!rewardPanel?.classList.contains("hidden")) return;
    goNext();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
      if (document.activeElement && ["INPUT", "BUTTON", "A"].includes(document.activeElement.tagName)) return;
      event.preventDefault();
      goNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goBack();
    }
  });

  document.addEventListener("contextmenu", preventDefault);
  document.addEventListener("selectstart", event => {
    if (event.target.closest("input, textarea")) return;
    event.preventDefault();
  });
  document.addEventListener("touchstart", preventAppZoom, { passive: false });
  document.addEventListener("touchmove", preventAppZoom, { passive: false });
  document.addEventListener("gesturestart", preventSafariGesture, { passive: false });
  document.addEventListener("gesturechange", preventSafariGesture, { passive: false });
  document.addEventListener("gestureend", preventSafariGesture, { passive: false });

  prepareStoryAudio(currentIndex, 6);
  if (shouldShowIntroShortcut()) renderIntroShortcut();
  else renderFrame();
})();
