(function () {
  "use strict";

  const PROFILE_KEY = "mathRidge_playerProfile_v1";
  const INTRO_COMPLETE_KEY = "mathRidge_storyComplete_root_gate_intro";
  const PASS_STORY_KEY = "mathRidge_storyComplete_root_gate_pass";
  const FAIL_STORY_KEY = "mathRidge_storyComplete_root_gate_fail";

  const bgBase = "assets/images/bg-scene/Stage-1-1/";
  const miraBase = "assets/images/Mira-sprite/Mira-sprite-alpha-webp/";
  const shellwickBase = "assets/images/Shellwick-sprite/elder-webp/";

  const backgrounds = {
    cabin: `${bgBase}story-bg-Shellwick_cabin.png`,
    cabinInside: `${bgBase}story-bg-Shellwick_cabin_inside.png`,
    table: `${bgBase}story-bg-Shellwick-table.png`,
    board: `${bgBase}story-bg-Shellwick-black-board.png`,
    gate: `${bgBase}story-bg-s09b-stage-1-1-gate.png`
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
    elder: { character: "elder", src: `${shellwickBase}elder-natural.webp` },
    elderWriting: { character: "elder", src: `${shellwickBase}elder-smile.webp` }
  };

  const relicOrder = ["term", "sign", "parity", "factor"];

  const blackboardStates = {
    rootGate: {
      badge: "Chapter 1",
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

  let frames = mode === "result" ? resultFrames(outcome) : introFrames();
  let currentIndex = 0;
  let currentBgKey = "";
  let typeTimer = 0;
  let typeTargetText = "";
  let isTyping = false;

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
      { bg: "cabin", sprite: "miraDetermined", speaker: "Narrator", text: "Chapter 1 Finale: Return to Elder Shellwick" },
      { bg: "cabin", sprite: "miraDetermined", speaker: "Narrator", text: "The door of Elder Shellwick's cabin opened by itself. Warm lantern light spilled onto the path." },
      { bg: "cabinInside", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "Inside, the familiar smell of tea, parchment, and old rain filled the room." },
      { bg: "cabinInside", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "Mira stepped in first, covered in dust, leaves, and at least one tiny twig stuck in her hat." },
      { bg: "cabinInside", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "Elder Shellwick... we have returned!" },
      { bg: "cabinInside", sprite: "miraConfused", elder: "elder", speaker: "Narrator", text: "The twig slipped from her hat and landed on the floor." },
      { bg: "cabinInside", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "...mostly intact." },
      { bg: "cabinInside", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "You stepped in behind her. In your pack, four relics pulsed softly." },
      { bg: "table", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The Term Stone. The Sign Compass. The Parity Prism. And the Factor Forge.", relicReveal: "all" },
      { bg: "table", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Ah. So the lower trail has accepted you.", relicReveal: "all" },
      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "Yes! It was very educational.", relicReveal: "all" },
      { bg: "table", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "And a little loud.", relicReveal: "all" },
      { bg: "table", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "I had assumed.", relicReveal: "all" },

      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "You placed the four relics on Elder Shellwick's table.", relicReveal: "lights" },
      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "The Term Stone landed first. A small ring of light spread across the wood.", relicReveal: "term" },
      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "Then came the Sign Compass, its needle spinning before pointing toward the mountain.", relicReveal: "sign" },
      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "The Parity Prism glowed green, splitting the room's light into thin lines.", relicReveal: "parity" },
      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "Finally, the Factor Forge touched the table with a soft metallic hum.", relicReveal: "factor" },
      { bg: "table", sprite: "miraCelebrating", elder: "elder", speaker: "Mira", text: "That means the Root Gate opens now, right?", relicReveal: "all" },
      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "Elder Shellwick took a slow sip of tea. Mira waited. You waited. The relics waited.", relicReveal: "all" },
      { bg: "table", sprite: "miraHappy", elder: "elder", speaker: "Elder Shellwick", text: "No.", relicReveal: "all" },
      { bg: "table", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "No?", relicReveal: "all" },
      { bg: "table", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "But we collected all four relics. And the Root Gate needs all four relics. Then... open?", relicReveal: "all" },
      { bg: "table", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "Relics are not keys, Mira. They are witnesses.", relicReveal: "all" },
      { bg: "table", sprite: "miraConfused", elder: "elder", speaker: "You", text: "Witnesses?", relicReveal: "all" },
      { bg: "table", sprite: "miraConfused", elder: "elder", speaker: "Elder Shellwick", text: "They prove you have reached the lessons. But reaching a lesson is not the same as mastering it.", relicReveal: "all" },
      { bg: "table", sprite: "miraWorried", elder: "elder", speaker: "Elder Shellwick", text: "The Root Gate will ask for proof.", relicReveal: "all" },
      { bg: "table", sprite: "miraWorried", elder: "elder", speaker: "Mira", text: "What kind of proof?", relicReveal: "all" },
      { bg: "table", sprite: "miraWorried", elder: "elder", speaker: "Narrator", text: "The four relics flashed. Far outside, something deep in the mountain answered.", relicReveal: "all" },

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

      { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Narrator", text: "The three of you left the cabin. Cipher Ridge Town had grown quiet, and Math Ridge rose into the evening sky.", board: "" },
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
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "The mountain wind moved through the gate. Far above, a faint blue light flickered. Your phone. Still out there. Still waiting.", relicReveal: "all" },
      { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Elder Shellwick", text: "The Root Gate Mastery Trial begins when you are ready.", relicReveal: "all" },
      { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "Let's do our best. Definitely.", relicReveal: "all", reward: "intro" }
    ];
  }

  function resultFrames(result) {
    if (result === "pass") {
      return [
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "The final answer locked into place." },
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "One by one, the forty stars around the Root Gate ignited." },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Narrator", text: "The Term Stone glowed. The Sign Compass spun. The Parity Prism flashed green. The Factor Forge rang like a hammer striking crystal." },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Narrator", text: "The four lights rose from the relics and met at the center of the gate." },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Narrator", text: "For a moment, the entire mountain became silent. Then the Root Gate opened." },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Mira", text: "We... we actually did it." },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Elder Shellwick", text: "You proved the lower path." },
        { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Narrator", text: "A rolled certificate appeared in a burst of golden light and floated gently down into your hands." },
        { bg: "gate", sprite: "miraHappy", elder: "elder", speaker: "Mira", text: "A real certificate... Do I get one too?" },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Narrator", text: "Another certificate appeared. It bumped softly into Mira's hat." },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Mira", text: "Ah! I passed..." },
        { bg: "gate", sprite: "miraCelebrating", elder: "elder", speaker: "Elder Shellwick", text: "You did." },
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Narrator", text: "Beyond the open gate, a new path curved upward into blue mist. Far above, your phone flashed once. Brighter this time." },
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "Mira", text: "Chapter Two?" },
        { bg: "gate", sprite: "miraDetermined", elder: "elder", speaker: "You", text: "Chapter Two." },
        { bg: "gate", sprite: "miraNeutral", elder: "elder", speaker: "Elder Shellwick", text: "Then climb carefully. And Mira? Do not follow any glowing insects." },
        { bg: "gate", sprite: "miraConfused", elder: "elder", speaker: "Mira", text: "...I was only looking.", reward: "pass" }
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
    const nextKey = key || "gate";
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

  function clearInteraction() {
    interactionPanel?.classList.add("hidden");
    nameForm?.classList.add("hidden");
    choiceRow?.classList.add("hidden");
    feedbackText?.classList.add("hidden");
  }

  function rewardContent(kind) {
    if (kind === "pass") {
      return {
        key: PASS_STORY_KEY,
        title: "Root Gate Opened",
        summary: "Chapter 1 is complete. The lower path has been proven.",
        lines: [
          "Certificate Earned: Root Gate Mastery Certificate",
          "New Path Unlocked: Chapter 2 - Beyond the Root Gate",
          "Next Objective: follow the signal from your missing device."
        ],
        actions: [
          { href: "note5.html", text: "Begin Chapter 2-1" },
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
    const content = rewardContent(kind);
    try {
      localStorage.setItem(content.key, "true");
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

  function updateProgress() {
    if (!progressBar) return;
    const progress = frames.length <= 1 ? 1 : currentIndex / (frames.length - 1);
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  function renderFrame() {
    const frame = frames[currentIndex];
    clearInteraction();
    rewardPanel?.classList.add("hidden");

    setBackground(frame.bg);
    setRelicReveal(frame.relicReveal || "");
    setBlackboard(frame.board || "");
    setActors(frame);
    setSpeaker(frame);

    sceneCounter.textContent = `${currentIndex + 1} / ${frames.length}`;
    backBtn.disabled = currentIndex === 0;
    nextBtn.disabled = false;
    nextBtn.textContent = frame.reward ? "Complete" : "Next";
    typeText(frameText(frame));
    updateProgress();
  }

  function goNext() {
    const frame = frames[currentIndex];
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

  renderFrame();
})();
