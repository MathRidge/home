(function () {
  "use strict";

  const PROFILE_KEY = "mathRidge_playerProfile_v1";
  const STORY_COMPLETE_KEY = "mathRidge_storyComplete_1_1";
  const NOTE_UNLOCK_KEY = "mathRidge_noteUnlocked_1_1";

  const bgBase = "assets/images/bg-scene/Stage-1-1/";
  const miraBase = "assets/images/Mira-sprite/Mira-sprite-alpha-webp/";
  const miraPngBase = "assets/images/Mira-sprite/Mira-sprite-alpha-png/";
  const shellwickBase = "assets/images/Shellwick-sprite/elder-webp/";
  const miraVoiceBase = "voice/Mira/";
  const elderVoiceBase = "voice/elder/";
  const soundBase = "voice/sound/";
  const relicOrder = ["term", "sign", "parity", "factor"];
  const relicImageSources = {
    term: "assets/images/relic/term_stone.png",
    sign: "assets/images/relic/sign_compass_relic_alpha.png",
    parity: "assets/images/relic/parity_prism_true_alpha.png",
    factor: "assets/images/relic/factor_forge_alpha.png"
  };

  const backgrounds = {
    arrival: `${bgBase}story-bg-s01-arrival.png`,
    welcome: `${bgBase}story-bg-cipher_ridge.png`,
    name: `${bgBase}story-bg-s03-name-question.png`,
    soft: `${bgBase}story-bg-s04-soft-response.png`,
    explain: `${bgBase}story-bg-s05-world-explain.png`,
    path: `${bgBase}story-bg-s06-guiding-path.png`,
    clearing: `${bgBase}story-bg-s07-teaching-clearing.png`,
    evening: `${bgBase}story-bg-Shellwick_cabin.png`,
    cabinInside: `${bgBase}story-bg-Shellwick_cabin_inside.png`,
    shellwickTable: `${bgBase}story-bg-Shellwick-table.png`,
    shellwickBoard: `${bgBase}story-bg-Shellwick-black-board.png`,
    pumpkinCart: `${bgBase}story-bg-Pumpkin Cart Scene.png`,
    gateA: `${bgBase}story-bg-s09a-stage-1-1-gate.png`,
    gateB: `${bgBase}story-bg-s09b-stage-1-1-gate.png`
  };

  const blackboardStates = {
    manualIntro: {
      badge: "Term Manual",
      title: "The Bigger Sign Rule",
      rows: [
        { label: "1", text: "Find the bigger size." },
        { label: "2", text: "Keep the bigger sign." },
        { label: "3", text: "Same signs add. Different signs subtract." }
      ]
    },
    minusStart: {
      badge: "Example A",
      title: "Original Question",
      rows: [
        { label: "Start", text: "-8 - 3", kind: "problem" }
      ]
    },
    minusOpposite: {
      badge: "Example A",
      title: "Change Subtraction",
      rows: [
        { label: "Start", text: "-8 - 3", kind: "problem" },
        { label: "Opposite", text: "-8 + (-3)", kind: "magic" }
      ]
    },
    sameSigns: {
      badge: "Example A",
      title: "Same Signs",
      rows: [
        { label: "Rewrite", text: "-8 + (-3)", kind: "problem" },
        { label: "Rule", text: "Same signs -> add sizes", kind: "rule" },
        { label: "Size", text: "8 + 3 = 11" }
      ]
    },
    minusAnswer: {
      badge: "Example A",
      title: "Keep The Sign",
      rows: [
        { label: "Size", text: "8 + 3 = 11" },
        { label: "Sign", text: "Both are negative" },
        { label: "Answer", text: "-11", kind: "answer" }
      ]
    },
    differentStart: {
      badge: "Example B",
      title: "Different Signs",
      rows: [
        { label: "Start", text: "5 + (-8)", kind: "problem" },
        { label: "Compare", text: "8 is bigger than 5" }
      ]
    },
    differentQuestion: {
      badge: "Check",
      title: "What Should We Do?",
      rows: [
        { label: "Start", text: "5 + (-8)", kind: "problem" },
        { label: "Signs", text: "Different signs" },
        { label: "Choose", text: "Add?  Subtract?  Ignore?", kind: "question" }
      ]
    },
    differentRule: {
      badge: "Example B",
      title: "Different Signs Subtract",
      rows: [
        { label: "Rule", text: "Subtract smaller from bigger", kind: "rule" },
        { label: "Size", text: "8 - 5 = 3" },
        { label: "Sign", text: "Keep the bigger sign: negative" }
      ]
    },
    differentAnswer: {
      badge: "Example B",
      title: "Final Answer",
      rows: [
        { label: "Start", text: "5 + (-8)", kind: "problem" },
        { label: "Work", text: "8 - 5 = 3" },
        { label: "Answer", text: "-3", kind: "answer" }
      ]
    },
    finalQuestion: {
      badge: "Your Turn",
      title: "What Is The Final Answer?",
      rows: [
        { label: "Question", text: "5 + (-8)", kind: "problem" },
        { label: "Hint", text: "Bigger size is 8, and it is negative." },
        { label: "Answer", text: "?", kind: "question" }
      ]
    },
    termStoneTrial: {
      badge: "Relic Trial",
      title: "The Term Stone",
      rows: [
        { label: "Checks", text: "sign + size", kind: "magic" },
        { label: "Goal", text: "balance the answer with the correct sign" }
      ]
    }
  };

  const sprites = {
    neutral: { src: `${miraBase}mira-neutral-fb.webp`, character: "mira" },
    shy: { src: `${miraBase}mira-shy-fb.webp`, character: "mira" },
    happy: { src: `${miraBase}mira-happy-fb.webp`, character: "mira" },
    confused: { src: `${miraBase}mira-confused-fb.webp`, character: "mira" },
    curious: { src: `${miraBase}mira-curious-fb.webp`, character: "mira" },
    thinking: { src: `${miraBase}mira-thinking-fb.webp`, character: "mira" },
    worried: { src: `${miraBase}mira-worried-fb.webp`, character: "mira" },
    determined: { src: `${miraBase}mira-determined-fb.webp`, character: "mira" },
    encouraging: { src: `${miraBase}mira-encouraging-fb.webp`, character: "mira" },
    guiding: { src: `${miraBase}mira-guiding-fb.webp`, character: "mira" },
    pointing: { src: `${miraBase}mira-pointing-fb.webp`, character: "mira" },
    celebrating: { src: `${miraBase}mira-celebrating-fb.webp`, character: "mira" },
    lookAway: { src: `${miraBase}mira-look-away-right-fb.webp`, character: "mira" },
    holdingHat: { src: `${miraBase}mira-holding-hat.webp`, character: "mira" },
    butterfly: { src: `${miraBase}mira-and-butterfly.webp`, character: "mira" },
    turning: { src: `${miraBase}mira_turn_motion_reflected_alpha.webp`, character: "mira" },
    castingBack: { src: `${miraBase}mira-back-casting-alpha.webp`, character: "mira" },
    back: { src: `${miraBase}mira-back-fb.webp`, character: "mira" },
    backRight: { src: `${miraBase}mira-back-right-fb.webp`, character: "mira" },
    backRightPeek: { src: `${miraBase}mira-back-right-peek-fb.webp`, character: "mira" },
    hugSatchel: { src: `${miraPngBase}mira-hug-stachel-true-alpha.png`, character: "mira" },
    lookAwayLeft: { src: `${miraBase}mira-look-away-left-fb.webp`, character: "mira" },
    pointingLeft: { src: `${miraBase}mira-pointing-left-fb.webp`, character: "mira" },
    angryPoint: { src: `${miraBase}mira-pointing-angry.webp`, character: "mira" },
    pouting: { src: `${miraBase}mira-pouting-crossed-arms.webp`, character: "mira" },
    bagShy: { src: `${miraBase}mira-shy-holding-bag.webp`, character: "mira" },
    surprisedStaff: { src: `${miraBase}mira-surprised-horizontal-staff.webp`, character: "mira" },
    elder: { src: `${shellwickBase}elder-natural.webp`, character: "elder" },
    elderWriting: { src: `${shellwickBase}elder-smile.webp`, character: "elder" }
  };

  const miraVoiceFilesByText = new Map([
    ["Come on. Cipher Ridge Town is not far from here.", [
      "mira-come-on.mp3",
      "mira-cipher-ridge-town-is-not-far-from-here.mp3"
    ]],
    ["Probably.", ["mira-probably.mp3"]],
    ["I-I mean, yes. Definitely. I am very good at directions.", ["mira-i-mean-yes-definitely-good-at-directions.mp3"]],
    ["Ooh...", ["mira-ooh.mp3"]],
    ["Right! Town. Elder Turtle. Very important. This way.", ["mira-right-town-elder-turtle-this-way.mp3"]],
    ["And now we should definitely keep walking.", ["mira-and-now-we-should-definitely-keep-walking.mp3"]],
    ["The only way to send you back is to find your device.", ["mira-the-only-way-to-send-you-back-is-to-find-your-device.mp3"]],
    ["Because your device absorbed the teleport stone.", ["mira-because-your-device-absorbed-the-teleport-stone.mp3"]],
    ["Hm?", ["mira-hm.mp3"]],
    ["That is what people say when they do not know they are holding spell books.", ["mira-that-is-what-people-say-when-they-do-not-know-they-are-holding-spell-books.mp3"]],
    ["I borrowed them.", ["mira-i-borrowed-them.mp3"]],
    ["Places.", ["mira-places.mp3"]],
    ["Mostly classrooms.", ["mira-mostly-classrooms.mp3"]],
    ["And one library.", ["mira-and-one-library.mp3"]],
    ["I left thank-you notes!", ["mira-i-left-thank-you-notes.mp3"]],
    ["Aha! The final manual!", [
      "mira-aha.mp3",
      "mira-the-final-manual.mp3"
    ]],
    ["The final manual!", ["mira-the-final-manual.mp3"]],
    ["I was hoping bravery would count.", ["mira-i-was-hoping-bravery-would-count.mp3"]],
    ["But you are from the Pagebound Realm. You have seen these manuals before. You might understand the spells better than I do.", ["mira-you-are-from-pagebound-realm-better-than-i-do.mp3"]],
    ["So maybe... we can unlock the gates together.", ["mira-so-maybe-unlock-the-gates-together.mp3"]],
    ["Elder Shellwick's cabin is this way!", ["mira-elder-shellwicks-cabin-is-this-way.mp3"]],
    ["No, wait. This way.", ["mira-no-wait-this-way.mp3"]],
    ["He is very wise. Please be respectful.", ["mira-he-is-very-wise-please-be-respectful.mp3"]],
    ["I know minus means subtract. But why is it next to another number that also feels... minus-y?", ["mira-i-know-minus-means-subtract-but-why-is-it-next-to-another-number-that-feels-minus-y.mp3"]],
    ["It is a technical feeling.", ["mira-it-is-a-technical-feeling.mp3"]],
    ["The second number became negative?", ["mira-the-second-number-became-negative.mp3"]],
    ["So if the signs are the same, add the sizes and keep the sign?", [
      "mira-so.mp3",
      "mira-if-the-signs-are-the-same-add-the-sizes-and-keep-the-sign.mp3"
    ]],
    ["You understood that so fast.", ["mira-you-understood-that-so-fast.mp3"]],
    ["Pagebound training is terrifying.", ["mira-pagebound-training-is-terrifying.mp3"]],
    ["That was one time.", ["mira-That-was-one-time.mp3"]],
    ["That was also one time.", ["mira-That-was-also-one-time.mp3"]],
    ["I am standing right here.", ["mira-I-am-standing-right-here.mp3"]],
    ["Definitely.", ["mira-definitely.mp3"]]
  ]);

  const elderVoiceFilesByText = new Map([
    ["I see.", ["elder-i-see.mp3"]],
    ["Then the mountain has chosen poorly... or wisely. It is often difficult to tell the difference at the beginning of a quest.", ["elder-[sighing]“Then-the-mountain-has-chosen-poorly…[v.mp3"]],
    ["Yes. But first, you will need this.", ["elder-yes-but-first-you-will-need-this.mp3"]],
    ["Signed terms can be tricky at first. But there is a simple key.", ["elder-signed-terms-can-be-tricky-at-first-but-there-is-a-simple-key.mp3"]],
    ["First, when you see subtraction, change it into adding the opposite.", ["elder-first-when-you-see-subtraction-change-it-into-adding-the-opposite.mp3"]],
    ["Correct. Now compare the signs.", [
      "elder-correct.mp3",
      "elder-now-compare-the-signs.mp3"
    ]],
    ["Then add the sizes. Eight and three make eleven. Since both signs are negative, the answer is negative.", ["elder-then-add-the-sizes-eight-and-three-make-eleven-since-both-signs-are-negative-the-answer-is-negative.mp3"]],
    ["Exactly.", ["elder-exactly.mp3"]],
    ["No.", ["elder-[long-pause]No.mp3"]],
    ["Mira.", ["elder-[anxcious]Mira.mp3"]],
    ["If the signs are different, subtract the smaller size from the bigger size. Then keep the sign of the bigger size.", ["elder-if-the-signs-are-different-subtract-the-smaller-size-from-the-bigger-size-then-keep-the-sign-of-the-bigger-size.mp3"]],
    ["Then go, both of you. The lower trail awaits.", ["elder-then-go-both-of-you-the-lower-trail-awaits.mp3"]]
  ]);

  elderVoiceFilesByText.set(
    "Then the mountain has chosen poorly... or wisely. It is often difficult to tell the difference at the beginning of a quest.",
    ["elder-sighing-then-the-mountain-has-chosen-poorly.mp3"]
  );
  elderVoiceFilesByText.set("Take care of Mira, {{playerName}}. She is brave, kind, and determined.", [
    "elder-Take-care-of-Maira,.mp3",
    { pause: 760 },
    "elder-She-is-brave,-kind,-and-determined.mp3"
  ]);
  elderVoiceFilesByText.set("She also has a habit of forgetting where she is going.", ["elder-She-also-has-a-habit-of-forgetting-where-she-is.mp3"]);
  elderVoiceFilesByText.set("And following glowing insects.", ["elder-And-following-glowing-insects.mp3"]);
  elderVoiceFilesByText.set("And walking into storage closets while looking for doors.", ["elder-And-[audience-laughing]walking-into-storage-clos.mp3"]);

  const sceneAudioFilesByText = new Map([
    ["The door of Mira's cabin creaked open. Outside, the mountain waited.", ["cabin-door-creaking-open.mp3"]],
    ["She marched forward with serious confidence.", ["walk-steps.mp3"]],
    ["Then quietly turned around and walked the other direction.", ["walk-steps.mp3"]],
    ["Mira walked beside you, still hugging her little satchel close.", ["walk-steps.mp3"]],
    ["Then her stomach made a tiny sound. Grrrumble.", ["tummy-growling.mp3"]],
    ["You kept walking. But one question would not leave your mind.", ["walk-steps.mp3"]],
    ["Before you could ask what that meant, Mira hurried down a narrow side path.", ["walk-steps.mp3"]],
    ["She walked confidently toward a pumpkin cart.", ["walk-steps.mp3"]],
    ["The door opened by itself. Inside, the cabin smelled like tea, parchment, and old rain.", ["elder-creaking-door-open.mp3"]]
  ]);

  const forestAmbience = {
    file: "nematoki-pine-forest-birds-insects.mp3",
    start: 120,
    volume: 0.12,
    maxMs: 70000
  };
  const townAmbience = {
    file: "summer-outdoor-sounds.mp3",
    start: 0,
    volume: 0.1,
    maxMs: 50000
  };
  const cabinAmbience = null;
  const ambientAudioByBg = new Map([
    ["arrival", forestAmbience],
    ["name", forestAmbience],
    ["soft", forestAmbience],
    ["explain", forestAmbience],
    ["path", forestAmbience],
    ["clearing", forestAmbience],
    ["evening", forestAmbience],
    ["gateA", forestAmbience],
    ["gateB", forestAmbience],
    ["welcome", townAmbience],
    ["cabinInside", cabinAmbience],
    ["shellwickTable", cabinAmbience],
    ["shellwickBoard", cabinAmbience],
    ["pumpkinCart", townAmbience]
  ]);

  const frames = [
    { bg: "arrival", sprite: "none", speaker: "Narrator", text: "Scene 1: The Journey Begins" },
    { bg: "arrival", sprite: "none", speaker: "Narrator", text: "The door of Mira's cabin creaked open. Outside, the mountain waited." },
    { bg: "arrival", sprite: "none", speaker: "Narrator", text: "Math Ridge rose above the forest, its glowing paths twisting across the cliffs like blue rivers of light." },
    { bg: "arrival", sprite: "none", speaker: "Narrator", text: "Symbols pulsed along the stone. Some looked familiar. Others changed shape whenever you tried to stare at them." },
    { bg: "arrival", sprite: "holdingHat", motion: "fade-in", speaker: "Narrator", text: "Mira stepped onto the dirt trail, holding her oversized mage hat down with both hands." },
    { bg: "arrival", sprite: "holdingHat", speaker: "Mira", text: "Come on. Cipher Ridge Town is not far from here." },
    { bg: "arrival", sprite: "holdingHat", speaker: "Narrator", text: "She paused." },
    { bg: "arrival", sprite: "confused", speaker: "Mira", text: "Probably." },
    { bg: "arrival", sprite: "confused", speaker: "Narrator", text: "You looked at her." },
    { bg: "arrival", sprite: "confused", speaker: "You", text: "Probably?" },
    { bg: "arrival", sprite: "pointing", speaker: "Mira", text: "I-I mean, yes. Definitely. I am very good at directions." },
    { bg: "arrival", sprite: "butterfly", speaker: "Narrator", text: "A small butterfly-shaped symbol floated past her." },
    { bg: "arrival", sprite: "butterfly", speaker: "Narrator", text: "Mira's ears perked up." },
    { bg: "arrival", sprite: "butterfly", speaker: "Mira", text: "Ooh..." },
    { bg: "arrival", sprite: "butterfly", motion: "walk-right", speaker: "Narrator", text: "She started following it." },
    { bg: "arrival", sprite: "butterfly", speaker: "Narrator", text: "You cleared your throat." },
    { bg: "arrival", sprite: "butterfly", speaker: "You", text: "Mira?" },
    { bg: "arrival", sprite: "turning", speaker: "Narrator", text: "She froze." },
    { bg: "arrival", sprite: "shy", speaker: "Mira", text: "Right! Town. Elder Turtle. Very important. This way." },
    { bg: "arrival", sprite: "determined", speaker: "Narrator", text: "She marched forward with serious confidence." },
    { bg: "arrival", sprite: "turning", motion: "walk-left", speaker: "Narrator", text: "Then quietly turned around and walked the other direction." },

    { bg: "name", sprite: "none", speaker: "Narrator", text: "Scene 2: The Name Question" },
    { bg: "name", sprite: "none", speaker: "Narrator", text: "The forest path curved gently downhill. Pine trees swayed overhead, and small glowing numbers drifted between the branches like fireflies." },
    { bg: "name", sprite: "none", speaker: "Narrator", text: "Every now and then, a stone on the path flashed beneath your feet, as if checking whether you belonged there." },
    { bg: "name", sprite: "hugSatchel", motion: "fade-in", speaker: "Narrator", text: "Mira walked beside you, still hugging her little satchel close." },
    { bg: "name", sprite: "hugSatchel", speaker: "Mira", text: "By the way..." },
    { bg: "name", sprite: "hugSatchel", speaker: "Narrator", text: "She looked embarrassed." },
    { bg: "name", sprite: "hugSatchel", speaker: "Mira", text: "I never caught your name. How should I call you?", action: "name" },
    { bg: "soft", sprite: "neutral", speaker: "Narrator", text: "You blinked." },
    { bg: "soft", sprite: "neutral", speaker: "You", text: "Oh. Um..." },
    { bg: "soft", sprite: "neutral", speaker: "You", text: "{{playerName}}." },
    { bg: "soft", sprite: "happy", speaker: "Mira", text: "{{playerName}}..." },
    { bg: "soft", sprite: "happy", speaker: "Mira", text: "That is a wonderful name. It suits you well." },
    { bg: "soft", sprite: "happy", speaker: "Narrator", text: "For some reason, the glowing stones on the path pulsed warmly." },
    { bg: "soft", sprite: "happy", speaker: "Mira", text: "Yes. Definitely a good name." },
    { bg: "soft", sprite: "lookAway", speaker: "Narrator", text: "Then her stomach made a tiny sound. Grrrumble." },
    { bg: "soft", sprite: "lookAway", speaker: "Mira", text: "And now we should definitely keep walking." },

    { bg: "explain", sprite: "none", speaker: "Narrator", text: "Scene 3: How Do I Get Home?" },
    { bg: "explain", sprite: "none", speaker: "Narrator", text: "The trail opened into a hillside overlooking a valley." },
    { bg: "explain", sprite: "none", speaker: "Narrator", text: "Far below, rooftops shimmered in the sunlight. Windmills spun slowly beside small farms, and a river curved through the town like a silver ribbon." },
    { bg: "explain", sprite: "neutral", speaker: "Narrator", text: "You stopped walking." },
    { bg: "explain", sprite: "neutral", speaker: "You", text: "Mira." },
    { bg: "explain", sprite: "neutral", speaker: "Mira", text: "Yes?" },
    { bg: "explain", sprite: "neutral", speaker: "You", text: "How do I get back?" },
    { bg: "explain", sprite: "worried", speaker: "Narrator", text: "Her ears lowered." },
    { bg: "explain", sprite: "worried", speaker: "You", text: "Back to where I came from. Earth." },
    { bg: "explain", sprite: "thinking", speaker: "Mira", text: "Earth... Is that what you call it?" },
    { bg: "explain", sprite: "thinking", speaker: "Narrator", text: "She repeated the word like it was strange." },
    { bg: "explain", sprite: "thinking", speaker: "You", text: "What do you call it?" },
    { bg: "explain", sprite: "thinking", speaker: "Mira", text: "The Pagebound Realm." },
    { bg: "explain", sprite: "confused", speaker: "You", text: "The what?" },
    { bg: "explain", sprite: "thinking", speaker: "Mira", text: "The Pagebound Realm. A world where math does not float, glow, or sing. It is sealed inside flat paper books. Very unusual." },
    { bg: "explain", sprite: "confused", speaker: "You", text: "That is just school." },
    { bg: "explain", sprite: "curious", speaker: "Mira", text: "You have schools full of spell books?" },
    { bg: "explain", sprite: "confused", speaker: "You", text: "They are not spell books." },
    { bg: "explain", sprite: "determined", speaker: "Mira", text: "That is what people say when they do not know they are holding spell books." },
    { bg: "explain", sprite: "neutral", speaker: "Narrator", text: "You were not sure how to answer that. Then you reached for your pocket again. Still empty." },
    { bg: "explain", sprite: "worried", speaker: "You", text: "My phone..." },
    { bg: "explain", sprite: "worried", speaker: "Narrator", text: "Mira's expression softened." },
    { bg: "explain", sprite: "worried", speaker: "Mira", text: "The only way to send you back is to find your device." },
    { bg: "explain", sprite: "confused", speaker: "You", text: "Why?" },
    { bg: "explain", sprite: "castingBack", speaker: "Narrator", text: "She pointed toward Math Ridge." },
    { bg: "explain", sprite: "pointing", speaker: "Mira", text: "Because your device absorbed the teleport stone." },
    { bg: "explain", sprite: "confused", speaker: "You", text: "My phone... absorbed a rock?" },
    { bg: "explain", sprite: "pointing", speaker: "Mira", text: "A magic rock. A very important magic rock." },
    { bg: "explain", sprite: "worried", speaker: "Narrator", text: "She looked guilty." },
    { bg: "explain", sprite: "worried", speaker: "Mira", text: "When your device fell near the hedge, it landed on the teleport stone I used to return home. The stone broke, and its return spell went inside your device." },
    { bg: "explain", sprite: "worried", speaker: "Mira", text: "That is why the mountain pulled it upward." },
    { bg: "explain", sprite: "backRightPeek", speaker: "Narrator", text: "You looked at the glowing peak." },
    { bg: "explain", sprite: "neutral", speaker: "You", text: "So my way home is inside my phone." },
    { bg: "explain", sprite: "worried", speaker: "Mira", text: "And your phone is somewhere on Math Ridge." },
    { bg: "explain", sprite: "none", speaker: "Narrator", text: "The wind grew quiet. For a moment, the mountain seemed to listen." },

    { bg: "path", sprite: "none", speaker: "Narrator", text: "Scene 4: Why Were You in My World?" },
    { bg: "path", sprite: "back", motion: "fade-in", speaker: "Narrator", text: "You kept walking. But one question would not leave your mind." },
    { bg: "path", sprite: "neutral", speaker: "You", text: "Mira." },
    { bg: "path", sprite: "neutral", speaker: "Mira", text: "Hm?" },
    { bg: "path", sprite: "neutral", speaker: "You", text: "Why were you in the Pagebound Realm in the first place?" },
    { bg: "path", sprite: "hugSatchel", speaker: "Narrator", text: "Mira stiffened. Then she clutched her satchel." },
    { bg: "path", sprite: "determined", speaker: "Mira", text: "I had a mission." },
    { bg: "path", sprite: "confused", speaker: "You", text: "A mission?" },
    { bg: "path", sprite: "determined", speaker: "Mira", text: "To save Arithmere." },
    { bg: "path", sprite: "neutral", speaker: "You", text: "This world?" },
    { bg: "path", sprite: "worried", speaker: "Mira", text: "The gates are locking. The paths are breaking. Even Math Ridge is becoming unstable." },
    { bg: "path", sprite: "thinking", speaker: "Mira", text: "Elder Shellwick says the old spell knowledge is fading. We needed outside resources. Manuals from the Pagebound Realm." },
    { bg: "path", sprite: "confused", speaker: "You", text: "Manuals?" },
    { bg: "path", sprite: "hugSatchel", speaker: "Narrator", text: "Mira opened her satchel. It looked far too small to hold anything important." },
    { bg: "path", sprite: "hugSatchel", speaker: "Narrator", text: "Mira opened her emergency satchel. Her arm went in farther than it should have." },
    { bg: "path", sprite: "confused", speaker: "You", text: "What is that bag?" },
    { bg: "path", sprite: "bagShy", speaker: "Mira", text: "My emergency satchel." },
    { bg: "path", sprite: "confused", speaker: "Narrator", text: "She pulled out a wooden spoon." },
    { bg: "path", sprite: "confused", speaker: "Mira", text: "No." },
    { bg: "path", sprite: "confused", speaker: "Narrator", text: "She pulled out a sock." },
    { bg: "path", sprite: "confused", speaker: "Mira", text: "Not that." },
    { bg: "path", sprite: "bagShy", speaker: "Narrator", text: "She pulled out a tiny bag labeled Emergency Cup Noodles. She froze. Her ears twitched." },
    { bg: "path", sprite: "bagShy", speaker: "Mira", text: "Also not that." },
    { bg: "path", sprite: "bagShy", speaker: "Narrator", text: "You raised an eyebrow. Mira quickly shoved it back in." },
    { bg: "path", sprite: "bagShy", speaker: "Mira", text: "This is not the time." },
    { bg: "path", sprite: "curious", speaker: "Narrator", text: "She dug deeper. A glowing pebble rolled out. Then a folded map. Then three pencils. Then a half-eaten cracker." },
    { bg: "path", sprite: "celebrating", speaker: "Mira", text: "Aha! The final manual!" },
    { bg: "path", sprite: "hugSatchel", speaker: "Narrator", text: "She pulled out a book. The cover was scratched, bent, and painfully familiar." },
    { bg: "path", sprite: "confused", speaker: "Narrator", text: "Your eyes widened." },
    { bg: "path", sprite: "neutral", speaker: "You", text: "Wait." },
    { bg: "path", sprite: "celebrating", speaker: "Mira", text: "The final manual!" },
    { bg: "path", sprite: "neutral", speaker: "You", text: "Wait. That is my school math book!" },
    { bg: "path", sprite: "curious", speaker: "Mira", text: "Your manual?" },
    { bg: "path", sprite: "neutral", speaker: "You", text: "That was in my backpack yesterday!" },
    { bg: "path", sprite: "hugSatchel", speaker: "Narrator", text: "Mira hugged the book tighter." },
    { bg: "path", sprite: "hugSatchel", speaker: "Mira", text: "Then it must be very powerful." },
    { bg: "path", sprite: "neutral", speaker: "You", text: "It is homework." },
    { bg: "path", sprite: "determined", speaker: "Mira", text: "In Arithmere, that means unfinished spell training." },
    { bg: "path", sprite: "determined", speaker: "Narrator", text: "You stared at her. Mira looked completely serious." },

    { bg: "clearing", sprite: "none", speaker: "Narrator", text: "Scene 5: The Last Book" },
    { bg: "clearing", sprite: "hugSatchel", motion: "fade-in", speaker: "Narrator", text: "Mira carefully dusted off the math book." },
    { bg: "clearing", sprite: "neutral", speaker: "Mira", text: "Elder Shellwick has been studying these books for months. I brought him several from the Pagebound Realm." },
    { bg: "clearing", sprite: "confused", speaker: "You", text: "You stole math books?" },
    { bg: "clearing", sprite: "surprisedStaff", speaker: "Narrator", text: "Mira flinched." },
    { bg: "clearing", sprite: "bagShy", speaker: "Mira", text: "I borrowed them." },
    { bg: "clearing", sprite: "neutral", speaker: "You", text: "From who?" },
    { bg: "clearing", sprite: "lookAway", speaker: "Narrator", text: "She looked away." },
    { bg: "clearing", sprite: "lookAwayLeft", speaker: "Mira", text: "Places." },
    { bg: "clearing", sprite: "neutral", speaker: "You", text: "Mira." },
    { bg: "clearing", sprite: "lookAwayLeft", speaker: "Mira", text: "Mostly classrooms." },
    { bg: "clearing", sprite: "neutral", speaker: "You", text: "Mira." },
    { bg: "clearing", sprite: "lookAwayLeft", speaker: "Mira", text: "And one library." },
    { bg: "clearing", sprite: "neutral", speaker: "You", text: "Mira." },
    { bg: "clearing", sprite: "surprisedStaff", speaker: "Mira", text: "I left thank-you notes!" },
    { bg: "clearing", sprite: "neutral", speaker: "Narrator", text: "You rubbed your forehead. She quickly continued." },
    { bg: "clearing", sprite: "worried", speaker: "Mira", text: "Elder Shellwick is not using them to cheat. He is using them to rebuild the old gate methods." },
    { bg: "clearing", sprite: "worried", speaker: "Mira", text: "The ancient spells were too complicated. Too many symbols. Too many steps. Too many apprentices getting lost." },
    { bg: "clearing", sprite: "encouraging", speaker: "Mira", text: "But the manuals explain math in smaller pieces. If he combines old wisdom with these books, apprentices like me may finally unlock the gates again." },
    { bg: "clearing", sprite: "encouraging", speaker: "Mira", text: "And this is the last book he needed." },
    { bg: "clearing", sprite: "neutral", speaker: "Narrator", text: "Something you had barely wanted to carry at school was suddenly important enough to save a world." },
    { bg: "clearing", sprite: "happy", speaker: "Mira", text: "And now... we have you too." },
    { bg: "clearing", sprite: "confused", speaker: "You", text: "Me?" },
    { bg: "clearing", sprite: "shy", speaker: "Mira", text: "I do not really understand the manuals yet. I know plus means add. Minus means subtract. But after that..." },
    { bg: "clearing", sprite: "shy", speaker: "Mira", text: "Everything becomes very slippery." },
    { bg: "clearing", sprite: "neutral", speaker: "You", text: "You are climbing a magic math mountain without understanding the math?" },
    { bg: "clearing", sprite: "shy", speaker: "Narrator", text: "Mira's ears drooped." },
    { bg: "clearing", sprite: "shy", speaker: "Mira", text: "I was hoping bravery would count." },
    { bg: "clearing", sprite: "neutral", speaker: "Narrator", text: "You sighed. Mira looked up at you." },
    { bg: "clearing", sprite: "encouraging", speaker: "Mira", text: "But you are from the Pagebound Realm. You have seen these manuals before. You might understand the spells better than I do." },
    { bg: "clearing", sprite: "happy", speaker: "Mira", text: "So maybe... we can unlock the gates together." },
    { bg: "clearing", sprite: "none", speaker: "Narrator", text: "The path ahead brightened. Far below, the town bells began to ring." },

    { bg: "welcome", sprite: "none", speaker: "Narrator", text: "Welcome to Cipher Ridge" },
    { bg: "welcome", sprite: "none", speaker: "Narrator", text: "A wooden sign stood at the edge of town. Its letters shifted from symbols, to numbers, to words." },
    { bg: "welcome", sprite: "none", speaker: "Narrator", text: "WELCOME TO CIPHER RIDGE" },
    { bg: "welcome", sprite: "none", speaker: "Narrator", text: "Cipher Ridge Town sat at the foot of Math Ridge." },
    { bg: "welcome", sprite: "none", speaker: "Narrator", text: "The houses had round doors and crooked chimneys. Shop signs floated slightly above their posts." },
    { bg: "welcome", sprite: "none", speaker: "Narrator", text: "Tiny number charms spun from the rooftops. A bakery window displayed bread shaped like triangles, circles, and one suspiciously delicious-looking fraction." },
    { bg: "welcome", sprite: "happy", motion: "fade-in", speaker: "Narrator", text: "Mira slowed down." },
    { bg: "welcome", sprite: "happy", speaker: "Mira", text: "We are here." },
    { bg: "welcome", sprite: "confused", speaker: "Narrator", text: "You looked around." },
    { bg: "welcome", sprite: "confused", speaker: "You", text: "This place is real?" },
    { bg: "welcome", sprite: "thinking", speaker: "Mira", text: "Mostly." },
    { bg: "welcome", sprite: "confused", speaker: "You", text: "Mostly?" },
    { bg: "welcome", sprite: "shy", speaker: "Mira", text: "Sometimes parts of it become theoretical." },
    { bg: "welcome", sprite: "backRight", motion: "walk-right", speaker: "Narrator", text: "Before you could ask what that meant, Mira hurried down a narrow side path." },
    { bg: "welcome", sprite: "pointingLeft", speaker: "Mira", text: "Elder Shellwick's cabin is this way!" },
    { bg: "pumpkinCart", sprite: "determined", motion: "fade-in", speaker: "Narrator", text: "She walked confidently toward a pumpkin cart." },
    { bg: "pumpkinCart", sprite: "turning", speaker: "Mira", text: "No, wait. This way." },

    { bg: "evening", sprite: "none", speaker: "Narrator", text: "Scene 6: Elder Shellwick's Cabin" },
    { bg: "evening", sprite: "none", speaker: "Narrator", text: "At the far edge of town stood a small cabin surrounded by old stones." },
    { bg: "evening", sprite: "none", speaker: "Narrator", text: "The roof was covered in moss. The windows were round. A wooden sign hung beside the door." },
    { bg: "evening", sprite: "none", speaker: "Narrator", text: "Elder Orin Shellwick. Keeper of Gate Wisdom." },
    { bg: "evening", sprite: "shy", motion: "fade-in", speaker: "Narrator", text: "Mira knocked twice. Then once more." },
    { bg: "evening", sprite: "shy", speaker: "Mira", text: "He is very wise. Please be respectful." },
    { bg: "evening", sprite: "none", speaker: "Elder Shellwick", text: "Come in, Mira." },
    { bg: "cabinInside", sprite: "none", speaker: "Narrator", text: "The door opened by itself. Inside, the cabin smelled like tea, parchment, and old rain." },
    { bg: "cabinInside", sprite: "none", speaker: "Narrator", text: "Books were stacked everywhere. Scrolls hung from the ceiling. A chalkboard covered the back wall." },
    { bg: "cabinInside", sprite: "elder", motion: "fade-in", speaker: "Narrator", text: "At the center of the room sat an ancient turtle wearing small round glasses. His shell was carved with glowing patterns." },
    { bg: "cabinInside", sprite: "celebrating", motion: "walk-left", speaker: "Narrator", text: "Mira rushed forward." },
    { bg: "cabinInside", sprite: "celebrating", speaker: "Mira", text: "Elder Shellwick!" },
    { bg: "cabinInside", sprite: "elder", speaker: "Elder Shellwick", text: "Ah, my wandering apprentice has returned." },
    { bg: "cabinInside", sprite: "celebrating", speaker: "Mira", text: "Elder Shellwick! I brought the final manual!" },
    { bg: "cabinInside", sprite: "elder", speaker: "Elder Shellwick", text: "Excellent. Then the first gate may finally be opened." },
    { bg: "cabinInside", sprite: "elder", speaker: "Narrator", text: "He reached for the book, then paused. His gaze moved to you." },
    { bg: "cabinInside", sprite: "elder", speaker: "Elder Shellwick", text: "And who is this young traveler?" },
    { bg: "cabinInside", sprite: "shy", speaker: "Narrator", text: "Mira stiffened." },
    { bg: "cabinInside", sprite: "surprisedStaff", speaker: "Mira", text: "Oh! Right!" },
    { bg: "cabinInside", sprite: "bagShy", speaker: "Mira", text: "This is {{playerName}}. They came from the Pagebound Realm." },
    { bg: "cabinInside", sprite: "elder", speaker: "Elder Shellwick", text: "The Pagebound Realm?" },
    { bg: "cabinInside", sprite: "neutral", speaker: "You", text: "Hi." },
    { bg: "cabinInside", sprite: "shy", speaker: "Narrator", text: "Mira quickly explained everything. The playground. The phone. The teleport stone. The blue tunnel. The mountain taking your device." },
    { bg: "cabinInside", sprite: "elder", speaker: "Narrator", text: "Elder Shellwick listened quietly. When Mira finished, he closed his eyes." },
    { bg: "cabinInside", sprite: "elder", speaker: "Elder Shellwick", text: "I see." },
    { bg: "cabinInside", sprite: "elder", speaker: "Narrator", text: "He looked toward the window, where Math Ridge stood in the distance." },
    { bg: "cabinInside", sprite: "elder", speaker: "Elder Shellwick", text: "Then the mountain has chosen poorly... or wisely. It is often difficult to tell the difference at the beginning of a quest." },
    { bg: "cabinInside", sprite: "confused", speaker: "Narrator", text: "You were not comforted." },

    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "Scene 7: The Four Relics", relicReveal: "clear" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "Elder Shellwick placed the math book on the table.", relicReveal: "clear" },
    { bg: "shellwickTable", sprite: "none", speaker: "Elder Shellwick", text: "The first main gate of Math Ridge is called the Root Gate. It cannot be opened by force.", relicReveal: "clear" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "He tapped the table with one claw. Four small lights appeared in the air.", relicReveal: "lights" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "Each became the shape of a relic.", relicReveal: "lights" },
    { bg: "shellwickTable", sprite: "none", speaker: "Elder Shellwick", text: "The Root Gate requires four relics.", relicReveal: "lights" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "The first light became a rough stone marked with positive and negative signs.", relicReveal: "term" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "Relic 1-1: The Term Stone", relicReveal: "term" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "The second became a compass with two glowing needles, one positive and one negative. Relic 1-2: The Sign Compass", relicReveal: "sign" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "The third became a crystal prism that split stacked signs into one true direction. Relic 1-3: The Parity Prism", relicReveal: "parity" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "The fourth became a small forge that gathered equal pieces into faster groups. Relic 1-4: The Factor Forge", relicReveal: "factor" },
    { bg: "shellwickTable", sprite: "none", speaker: "Mira", text: "So if we collect all four...", relicReveal: "all" },
    { bg: "shellwickTable", sprite: "none", speaker: "Elder Shellwick", text: "The Root Gate will open.", relicReveal: "all" },
    { bg: "shellwickTable", sprite: "none", speaker: "You", text: "And my phone?", relicReveal: "all" },
    { bg: "shellwickTable", sprite: "none", speaker: "Elder Shellwick", text: "Your device was carried beyond the lower trail. To reach it, you must pass the Root Gate and continue upward.", relicReveal: "all" },
    { bg: "shellwickTable", sprite: "none", speaker: "Narrator", text: "The lights faded. Mira clenched her fists.", relicReveal: "fade" },
    { bg: "shellwickBoard", sprite: "angryPoint", speaker: "Mira", text: "Then we start with the Term Stone!" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Yes. But first, you will need this.", board: "manualIntro" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "He handed Mira a thin booklet. The cover read: Term Manual: The Bigger Sign Rule.", board: "manualIntro" },

    { bg: "shellwickBoard", sprite: "thinking", speaker: "Narrator", text: "Scene 8: Mira and the First Rule", board: "manualIntro" },
    { bg: "shellwickBoard", sprite: "thinking", speaker: "Narrator", text: "Mira opened the manual. She flipped one page. Then another. Then another. Her face slowly went blank.", board: "manualIntro" },
    { bg: "shellwickBoard", sprite: "thinking", speaker: "Mira", text: "Elder... what does this mean?", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "confused", speaker: "Narrator", text: "She turned the book around.", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "confused", speaker: "Mira", text: "-8 - 3", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "confused", speaker: "Mira", text: "I know minus means subtract. But why is it next to another number that also feels... minus-y?", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "confused", speaker: "You", text: "Minus-y?", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "confused", speaker: "Mira", text: "It is a technical feeling.", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "Elder Shellwick chuckled.", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Signed terms can be tricky at first. But there is a simple key.", board: "manualIntro" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "He took a piece of chalk and wrote: -8 - 3", board: "minusStart" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "First, when you see subtraction, change it into adding the opposite.", board: "minusOpposite" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "He wrote beneath it: -8 + (-3)", board: "minusOpposite" },
    { bg: "shellwickBoard", sprite: "curious", speaker: "Mira", text: "The second number became negative?", board: "minusOpposite" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Correct. Now compare the signs.", board: "sameSigns" },
    { bg: "shellwickBoard", sprite: "thinking", speaker: "You", text: "They are both negative.", board: "sameSigns" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Then add the sizes. Eight and three make eleven. Since both signs are negative, the answer is negative.", board: "sameSigns" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "He wrote: -11", board: "minusAnswer" },
    { bg: "shellwickBoard", sprite: "happy", speaker: "Narrator", text: "Mira stared.", board: "minusAnswer" },
    { bg: "shellwickBoard", sprite: "happy", speaker: "Mira", text: "So if the signs are the same, add the sizes and keep the sign?", board: "sameSigns" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Exactly.", board: "minusAnswer" },
    { bg: "shellwickBoard", sprite: "happy", speaker: "Narrator", text: "She looked proud. Then Elder Shellwick wrote: 5 + (-8)", board: "differentStart" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "And if the signs are different?", board: "differentStart" },
    { bg: "shellwickBoard", sprite: "surprisedStaff", speaker: "Mira", text: "You... panic?", board: "differentQuestion" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "No.", board: "differentQuestion" },
    { bg: "shellwickBoard", sprite: "confused", speaker: "Mira", text: "You ask {{playerName}}?", board: "differentQuestion" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Also no.", board: "differentQuestion" },
    { bg: "shellwickBoard", sprite: "bagShy", speaker: "Mira", text: "You eat noodles and try again?", board: "differentQuestion" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Mira.", board: "differentQuestion" },
    { bg: "shellwickBoard", sprite: "shy", speaker: "Mira", text: "Sorry.", board: "differentQuestion" },
    {
      bg: "shellwickBoard",
      sprite: "none",
      speaker: "Elder Shellwick",
      text: "If the signs are different, what should you do?",
      board: "differentQuestion",
      choices: [
        { label: "Add every size", correct: false, response: "Not this time. Different signs push against each other." },
        { label: "Subtract smaller from bigger", correct: true, response: "Correct. Then keep the sign of the bigger size." },
        { label: "Ignore the signs", correct: false, response: "The signs are the magic. We cannot ignore them." }
      ]
    },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "If the signs are different, subtract the smaller size from the bigger size. Then keep the sign of the bigger size.", board: "differentRule" },
    { bg: "shellwickBoard", sprite: "thinking", speaker: "Narrator", text: "You looked at the problem.", board: "differentRule" },
    { bg: "shellwickBoard", sprite: "thinking", speaker: "You", text: "Eight is bigger than five. Eight is negative. So the answer is negative three.", board: "differentAnswer" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "Elder Shellwick nodded. 5 + (-8) = -3", board: "differentAnswer" },
    {
      bg: "shellwickBoard",
      sprite: "none",
      speaker: "Elder Shellwick",
      text: "Try this one: 5 + (-8). What is the final answer for 5 + (-8)?",
      board: "finalQuestion",
      choices: [
        { label: "+3", correct: false, response: "Close size, wrong sign. The bigger size is 8, and it is negative." },
        { label: "-3", correct: true, response: "Correct. Eight is bigger than five, so the negative side leads." },
        { label: "-13", correct: false, response: "That would happen if both signs were negative. These signs are different." }
      ]
    },
    { bg: "shellwickBoard", sprite: "happy", speaker: "Mira", text: "You understood that so fast.", board: "differentAnswer" },
    { bg: "shellwickBoard", sprite: "neutral", speaker: "You", text: "It is from school.", board: "differentAnswer" },
    { bg: "shellwickBoard", sprite: "worried", speaker: "Mira", text: "Pagebound training is terrifying.", board: "differentAnswer" },

    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "Scene 9: The Quest Begins", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Narrator", text: "Elder Shellwick closed the manual and handed it to you.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "The Term Stone will test whether you understand signs and sizes. The mountain will not open the next path unless the answer is balanced with the correct sign.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "determined", speaker: "Narrator", text: "Mira stood straighter.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "determined", speaker: "Mira", text: "We can do it.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "shy", speaker: "Mira", text: "Probably.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "confused", speaker: "Narrator", text: "You gave her a look.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "shy", speaker: "Mira", text: "Definitely.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Take care of Mira, {{playerName}}. She is brave, kind, and determined.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "shy", speaker: "Mira", text: "Elder...", board: "termStoneTrial", voice: ["mira-Elder... (being praised).mp3"] },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "She also has a habit of forgetting where she is going.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "pouting", speaker: "Narrator", text: "Mira froze.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "And wandering off.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "shy", speaker: "Mira", text: "Elder...", board: "termStoneTrial", voice: ["mira-Elder... (being teased).mp3"] },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "And following glowing insects.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "pouting", speaker: "Mira", text: "That was one time.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "And walking into storage closets while looking for doors.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "pouting", speaker: "Mira", text: "That was also one time.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "She will need a steady companion.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "pouting", speaker: "Mira", text: "I am standing right here.", board: "termStoneTrial" },
    { bg: "shellwickBoard", sprite: "none", speaker: "Elder Shellwick", text: "Then go, both of you. The lower trail awaits.", board: "termStoneTrial" },
    { bg: "gateB", sprite: "determined", speaker: "Narrator", text: "Outside, Math Ridge glowed. Somewhere above, your phone flashed faintly blue. The first relic was waiting." },
    { bg: "gateB", sprite: "celebrating", speaker: "Quest Reward", text: "You have received: \"Term Manual\"", reward: true }
  ];

  function initialFrameIndex() {
    try {
      const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
      const frame = Number(new URLSearchParams(window.location.search).get("previewFrame"));
      if (isLocalPreview && Number.isFinite(frame) && frame > 0) {
        return Math.min(frames.length - 1, Math.max(0, Math.floor(frame) - 1));
      }
    } catch (error) {}

    return 0;
  }

  let currentIndex = initialFrameIndex();
  let nameLockedOnFrame = false;
  let choiceSolvedOnFrame = false;
  let currentSegments = [];
  let currentSegmentIndex = 0;
  let typeTimer = null;
  let typeTargetText = "";
  let isTyping = false;
  let currentBgKey = "";
  let activeVoice = null;
  let voiceToken = 0;
  let voiceAdvanceLocked = false;
  let activeAmbient = null;
  let activeAmbientKey = "";
  let ambientStopTimer = null;
  let pendingAmbient = null;
  const TYPE_SPEED_MS = 28;
  const elderFirstVisibleIndex = frames.findIndex(frame => frame.sprite === "elder" || frame.sprite === "elderWriting");
  const shellwickSceneBackgrounds = new Set(["cabinInside", "shellwickTable"]);

  const storyVn = document.querySelector(".story-vn");
  const sceneBg = document.getElementById("sceneBg");
  const sceneFader = document.getElementById("sceneFader");
  const miraStage = document.getElementById("miraStage");
  const miraSprite = document.getElementById("miraSprite");
  const elderStage = document.getElementById("elderStage");
  const elderSprite = document.getElementById("elderSprite");
  const relicRevealStage = document.getElementById("relicRevealStage");
  const blackboardStage = document.getElementById("blackboardStage");
  const dialogueBox = document.querySelector(".dialogue-box");
  const speakerName = document.getElementById("speakerName");
  const sceneCounter = document.getElementById("sceneCounter");
  const dialogueText = document.getElementById("dialogueText");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progressBar = document.getElementById("storyProgressBar");
  const interactionPanel = document.getElementById("interactionPanel");
  const nameForm = document.getElementById("nameForm");
  const playerNameInput = document.getElementById("playerNameInput");
  const choiceRow = document.getElementById("choiceRow");
  const feedbackText = document.getElementById("feedbackText");
  const rewardPanel = document.getElementById("rewardPanel");
  let relicRevealState = "";
  let relicNewTimer = null;
  let relicImagesReady = false;
  let blackboardStateKey = "";
  let orientationLockAttempted = false;
  const actors = {
    mira: { stage: miraStage, img: miraSprite, lastKey: "", loadToken: 0 },
    elder: { stage: elderStage, img: elderSprite, lastKey: "", loadToken: 0 }
  };

  function readProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return profile && typeof profile === "object" ? profile : null;
    } catch (error) {
      return null;
    }
  }

  function writeProfileName(name) {
    const cleanName = String(name || "").trim().replace(/\s+/g, " ").slice(0, 24) || "Ridge Wanderer";
    const existing = readProfile() || {};
    const profile = Object.assign({
      version: 1,
      pronoun: "they",
      pronounLabel: "they / them",
      createdAt: new Date().toISOString()
    }, existing, {
      nickname: existing.nickname || cleanName,
      certificateName: existing.certificateName || cleanName,
      updatedAt: new Date().toISOString()
    });

    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (error) {}
    return profile;
  }

  function playerName() {
    const profile = readProfile();
    return profile?.nickname || profile?.certificateName || "traveler";
  }

  function formatText(value) {
    return String(value || "").replace(/\{\{playerName\}\}/g, playerName());
  }

  function isTightStoryViewport() {
    return window.matchMedia("(max-width: 940px) and (orientation: landscape), (max-height: 520px) and (orientation: landscape)").matches;
  }

  function splitIntoReadableSegments(text) {
    const value = formatText(text).trim();
    if (!value) return [""];

    const sentenceLimit = isTightStoryViewport() ? 74 : 132;
    const phraseLimit = isTightStoryViewport() ? 60 : 112;
    const sentences = value.match(/[^.!?。！？]+[.!?。！？]+(?:["”])?|[^.!?。！？]+$/g) || [value];
    const segments = [];

    sentences.forEach(sentence => {
      const clean = sentence.trim();
      if (!clean) return;

      if (clean.length <= sentenceLimit) {
        segments.push(clean);
        return;
      }

      let line = "";
      clean.split(/,\s+/).forEach((part, index, parts) => {
        const piece = index < parts.length - 1 ? `${part},` : part;
        const next = line ? `${line} ${piece}` : piece;
        if (next.length > phraseLimit && line) {
          segments.push(line);
          line = piece;
          return;
        }
        line = next;
      });

      if (line.trim()) segments.push(line.trim());
    });

    return segments.length ? segments : [value];
  }

  function syncStandaloneMode() {
    const standalone = window.navigator.standalone ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches;
    document.documentElement.classList.toggle("is-standalone-webapp", Boolean(standalone));
  }

  function preloadRelicImages() {
    const imagePromises = Object.values(relicImageSources).map(src => new Promise(resolve => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(resolve);
          return;
        }
        resolve();
      };
      img.onerror = resolve;
      img.src = src;
    }));

    Promise.all(imagePromises).then(() => {
      relicImagesReady = true;
      relicRevealStage?.classList.add("relic-assets-ready");
      relicRevealStage?.classList.remove("is-decoding-relics");
    });
  }

  function tryLockLandscape() {
    if (orientationLockAttempted) return;
    orientationLockAttempted = true;

    const lock = screen.orientation?.lock;
    if (typeof lock !== "function") return;

    lock.call(screen.orientation, "landscape-primary").catch(() => {
      orientationLockAttempted = false;
    });
  }

  function preventAppZoom(event) {
    if (event.touches && event.touches.length > 1) event.preventDefault();
  }

  function preventSafariGesture(event) {
    event.preventDefault();
  }

  function isNarrationFrame(frame) {
    return frame?.speaker === "Narrator";
  }

  function normalizeVoiceSource(source, base) {
    if (typeof source === "number") return { pause: source };
    if (source && typeof source === "object") return source;
    return { base, file: source };
  }

  function frameVoiceFiles(frame) {
    if (Array.isArray(frame?.voice)) {
      const base = frame.speaker === "Elder Shellwick"
        ? elderVoiceBase
        : frame.speaker === "Mira"
          ? miraVoiceBase
          : soundBase;
      return frame.voice.map(file => normalizeVoiceSource(file, base));
    }

    if (frame?.speaker === "Mira") {
      return (miraVoiceFilesByText.get(frame.text) || [])
        .map(file => normalizeVoiceSource(file, miraVoiceBase));
    }

    if (frame?.speaker === "Elder Shellwick") {
      return (elderVoiceFilesByText.get(frame.text) || [])
        .map(file => normalizeVoiceSource(file, elderVoiceBase));
    }

    return [];
  }

  function frameAudioFiles(frame) {
    return [
      ...frameVoiceFiles(frame),
      ...(sceneAudioFilesByText.get(frame?.text) || [])
        .map(file => ({ base: soundBase, file }))
    ];
  }

  function voiceUrl(source) {
    const item = typeof source === "string" ? { base: miraVoiceBase, file: source } : source;
    return `${item.base}${encodeURIComponent(item.file)}`;
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

      const audio = new Audio(voiceUrl(source));
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
    playVoiceQueue(frameAudioFiles(frame), frameVoiceFiles(frame).length > 0);
  }

  function stopAmbient() {
    pendingAmbient = null;
    if (ambientStopTimer) {
      window.clearTimeout(ambientStopTimer);
      ambientStopTimer = null;
    }
    if (!activeAmbient) {
      activeAmbientKey = "";
      return;
    }

    activeAmbient.pause();
    activeAmbient.removeAttribute("src");
    activeAmbient.load();
    activeAmbient = null;
    activeAmbientKey = "";
  }

  function ambientKey(config) {
    if (!config) return "";
    return `${config.file}|${Number(config.start || 0)}`;
  }

  function playAmbient(config) {
    const nextAmbientKey = ambientKey(config);
    if (!config) {
      stopAmbient();
      return;
    }
    if (activeAmbient && activeAmbientKey === nextAmbientKey && !activeAmbient.paused) return;

    stopAmbient();

    const audio = new Audio(`${soundBase}${encodeURIComponent(config.file)}`);
    const startAt = Math.max(0, Number(config.start || 0));
    activeAmbient = audio;
    activeAmbientKey = nextAmbientKey;
    pendingAmbient = { config };

    audio.preload = "auto";
    audio.volume = Number.isFinite(config.volume) ? config.volume : 0.1;
    audio.loop = false;

    const begin = () => {
      if (activeAmbient !== audio) return;
      if (startAt && audio.duration && startAt < audio.duration) {
        try {
          audio.currentTime = startAt;
        } catch (error) {}
      }

      const attempt = audio.play();
      if (attempt && typeof attempt.then === "function") {
        attempt.then(() => {
          if (activeAmbient === audio) pendingAmbient = null;
        }).catch(() => {
          if (activeAmbient === audio) pendingAmbient = { config };
        });
      }

      if (config.maxMs) {
        ambientStopTimer = window.setTimeout(() => {
          if (activeAmbient === audio) stopAmbient();
        }, config.maxMs);
      }
    };

    if (audio.readyState >= 1) {
      begin();
    } else {
      audio.addEventListener("loadedmetadata", begin, { once: true });
      audio.addEventListener("error", () => {
        if (activeAmbient === audio) stopAmbient();
      }, { once: true });
      audio.load();
    }
  }

  function playFrameAmbient(frame) {
    playAmbient(ambientAudioByBg.get(frame?.bg) || null);
  }

  function retryPendingAmbient() {
    if (!pendingAmbient) return;
    playAmbient(pendingAmbient.config);
  }

  function frameSegments(frame) {
    const segments = frameAudioFiles(frame).length
      ? [formatText(frame?.text || "").trim()]
      : splitIntoReadableSegments(frame?.text || "");
    if (!isNarrationFrame(frame)) return segments;
    return segments.map(segment => `[ ${segment} ]`);
  }

  function speakerToneClass(frame) {
    if (isNarrationFrame(frame)) return "speaker-narrator";

    const speaker = String(frame?.speaker || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (speaker === "elder-shellwick") return "speaker-elder";
    return speaker ? `speaker-${speaker}` : "speaker-unknown";
  }

  function setDialogueSpeaker(frame) {
    if (!dialogueBox) return;
    [...dialogueBox.classList].forEach(className => {
      if (className.startsWith("speaker-")) dialogueBox.classList.remove(className);
    });
    dialogueBox.classList.toggle("is-narration", isNarrationFrame(frame));
    dialogueBox.classList.add(speakerToneClass(frame));
  }

  function stopTyping(showFull = false) {
    if (typeTimer) {
      window.clearTimeout(typeTimer);
      typeTimer = null;
    }

    if (showFull) dialogueText.textContent = typeTargetText;
    isTyping = false;
    dialogueBox?.classList.remove("is-typing");
  }

  function showFrameInteraction() {
    const frame = frames[currentIndex];
    if (frame.action === "name") renderNameForm();
    if (frame.choices) renderChoices(frame);
    if (frame.reward) renderReward();
  }

  function showInteractionPanel(mode) {
    interactionPanel.className = "interaction-panel";
    interactionPanel.dataset.mode = mode || "choice";
  }

  function typeSegment(text) {
    stopTyping(false);
    typeTargetText = text;
    dialogueText.textContent = "";
    isTyping = true;
    nextBtn.disabled = false;
    dialogueBox?.classList.add("is-typing");

    let index = 0;
    const step = () => {
      index += 1;
      dialogueText.textContent = typeTargetText.slice(0, index);

      if (index < typeTargetText.length) {
        typeTimer = window.setTimeout(step, TYPE_SPEED_MS);
        return;
      }

      stopTyping(false);
      if (currentSegmentIndex >= currentSegments.length - 1) showFrameInteraction();
    };

    typeTimer = window.setTimeout(step, TYPE_SPEED_MS);
  }

  function showSegment(index) {
    currentSegmentIndex = Math.min(Math.max(index, 0), currentSegments.length - 1);
    typeSegment(currentSegments[currentSegmentIndex] || "");
  }

  function updateProgress() {
    if (!progressBar) return;
    const progress = frames.length <= 1 ? 1 : currentIndex / (frames.length - 1);
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  function setBackground(key) {
    if (!sceneBg) return;
    const nextKey = key || "arrival";
    if (nextKey === currentBgKey) return;

    currentBgKey = nextKey;
    storyVn?.classList.add("is-scene-changing");
    window.setTimeout(() => {
      sceneBg.style.backgroundImage = `url("${backgrounds[nextKey] || backgrounds.arrival}")`;
      window.setTimeout(() => storyVn?.classList.remove("is-scene-changing"), 240);
    }, 190);
  }

  function setRelicReveal(state = "") {
    if (!relicRevealStage) return;

    const normalized = state === "fade" ? "all" : state;
    const previousState = relicRevealState;
    const relicItems = [...relicRevealStage.querySelectorAll(".story-relic")];
    const activeRelic = relicOrder.includes(normalized) ? normalized : "";
    const visible = Boolean(state && state !== "clear");
    const visibleCount = normalized === "all"
      ? relicOrder.length
      : activeRelic
        ? relicOrder.indexOf(activeRelic) + 1
        : 0;

    if (relicNewTimer) {
      window.clearTimeout(relicNewTimer);
      relicNewTimer = null;
    }

    relicRevealStage.classList.remove(
      "reveal-lights", "reveal-term", "reveal-sign", "reveal-parity", "reveal-factor", "reveal-all", "is-fading",
      "has-lights", "has-term", "has-sign", "has-parity", "has-factor"
    );
    relicRevealStage.removeAttribute("data-active");
    relicItems.forEach(item => item.classList.remove("is-featured", "is-new"));

    if (!visible) {
      relicRevealState = "";
      relicRevealStage.classList.remove("is-active", "has-lights", "has-term", "has-sign", "has-parity", "has-factor");
      relicItems.forEach(item => item.classList.remove("is-lit", "is-revealed"));
      relicRevealStage.setAttribute("aria-hidden", "true");
      return;
    }

    relicRevealState = normalized;
    relicRevealStage.classList.add("is-active", `reveal-${normalized}`);
    relicRevealStage.classList.toggle("is-decoding-relics", !relicImagesReady && visibleCount > 0);
    if (state === "lights") relicRevealStage.classList.add("has-lights");
    if (state === "fade") relicRevealStage.classList.add("is-fading");
    if (activeRelic) relicRevealStage.dataset.active = activeRelic;
    relicRevealStage.setAttribute("aria-hidden", "false");

    relicItems.forEach(item => {
      const index = relicOrder.indexOf(item.dataset.relic);
      const shouldReveal = index >= 0 && index < visibleCount;
      const shouldLight = state === "lights" || shouldReveal;
      item.classList.toggle("is-lit", shouldLight);
      item.classList.toggle("is-revealed", shouldReveal);
      item.classList.toggle("is-featured", item.dataset.relic === activeRelic);
    });

    relicOrder.slice(0, visibleCount).forEach(relic => {
      relicRevealStage.classList.add(`has-${relic}`);
    });

    if (activeRelic && previousState !== normalized && relicImagesReady) {
      const activeItem = relicRevealStage.querySelector(`[data-relic="${activeRelic}"]`);
      if (activeItem) {
        activeItem.classList.add("is-new");
        relicNewTimer = window.setTimeout(() => {
          activeItem.classList.remove("is-new");
          relicNewTimer = null;
        }, 760);
      }
    }
  }

  function setBlackboard(stateKey = "") {
    if (!blackboardStage) return;

    const state = blackboardStates[stateKey];
    if (!state) {
      blackboardStateKey = "";
      blackboardStage.classList.add("is-hidden");
      blackboardStage.setAttribute("aria-hidden", "true");
      blackboardStage.replaceChildren();
      delete blackboardStage.dataset.board;
      return;
    }

    if (blackboardStateKey === stateKey) return;
    blackboardStateKey = stateKey;
    blackboardStage.replaceChildren();
    blackboardStage.dataset.board = stateKey;

    const glow = document.createElement("span");
    glow.className = "blackboard-glow";
    glow.setAttribute("aria-hidden", "true");
    blackboardStage.appendChild(glow);

    const badge = document.createElement("span");
    badge.className = "blackboard-badge";
    badge.textContent = state.badge || "Lesson";
    blackboardStage.appendChild(badge);

    const title = document.createElement("strong");
    title.className = "blackboard-title";
    title.textContent = state.title || "";
    blackboardStage.appendChild(title);

    const list = document.createElement("div");
    list.className = "blackboard-lines";
    (state.rows || []).forEach((row, index) => {
      const item = document.createElement("div");
      item.className = "blackboard-line";
      item.dataset.kind = row.kind || "note";
      item.style.setProperty("--line-index", index);

      if (row.label) {
        const label = document.createElement("span");
        label.className = "blackboard-label";
        label.textContent = row.label;
        item.appendChild(label);
      }

      const text = document.createElement("span");
      text.className = "blackboard-text";
      text.textContent = row.text || "";
      item.appendChild(text);
      list.appendChild(item);
    });
    blackboardStage.appendChild(list);
    blackboardStage.classList.remove("is-hidden");
    blackboardStage.setAttribute("aria-hidden", "false");
  }

  function resolveFrameSprite(frame) {
    const text = String(frame?.text || "");
    const speaker = frame?.speaker || "";

    if (frame?.sprite === "none") return "none";

    if (frame?.bg === "shellwickBoard" && speaker === "Elder Shellwick") return "none";

    if (speaker === "Elder Shellwick") {
      return /chalk|wrote|write|manual|gate|relic|sign|sizes|subtract|answer|term|root/i.test(text)
        ? "elderWriting"
        : "elder";
    }

    if (speaker === "Narrator" && /Elder Shellwick|ancient turtle|His shell|one claw|He wrote|He handed|He took|Elder Orin/i.test(text)) {
      return /wrote|chalk|handed|table|claw|relic|manual/i.test(text) ? "elderWriting" : "elder";
    }

    return frame?.sprite;
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

  function revealActor(character, key, motion = "", isListening = false) {
    const actor = actors[character];
    const sprite = sprites[key];
    const src = typeof sprite === "string" ? sprite : sprite?.src;
    if (!actor?.stage || !actor?.img || !src) return;

    const stage = actor.stage;
    const img = actor.img;
    const changed = img.getAttribute("src") !== src;
    const finalMotion = motion || (changed ? "soft-switch" : "");
    const token = actor.loadToken + 1;
    actor.loadToken = token;
    actor.lastKey = key;

    stage.dataset.character = character;
    stage.removeAttribute("data-motion");
    stage.classList.toggle("is-listening", Boolean(isListening));

    const show = () => {
      if (actor.loadToken !== token) return;
      stage.classList.remove("is-hidden", "is-loading");
      stage.setAttribute("aria-hidden", "false");
      if (finalMotion) {
        void stage.offsetWidth;
        stage.dataset.motion = finalMotion;
      }
    };

    if (changed) {
      stage.classList.add("is-loading");
      img.onload = show;
      img.onerror = () => {
        if (actor.loadToken !== token) return;
        hideActor(character);
      };
      img.src = src;
      if (img.complete && img.naturalWidth) {
        window.requestAnimationFrame(show);
      }
      return;
    }

    window.requestAnimationFrame(show);
  }

  function isShellwickScene(frame) {
    return currentIndex >= elderFirstVisibleIndex && shellwickSceneBackgrounds.has(frame?.bg);
  }

  function setActorFocus(activeCharacter) {
    Object.keys(actors).forEach(character => {
      const actor = actors[character];
      if (!actor?.stage || actor.stage.classList.contains("is-hidden")) return;
      actor.stage.classList.toggle("is-listening", character !== activeCharacter);
    });
  }

  function setSprite(key, motion = "", frame = null) {
    const sprite = sprites[key];
    const src = typeof sprite === "string" ? sprite : sprite?.src;
    const character = typeof sprite === "object" && sprite?.character ? sprite.character : "mira";

    if (!src) {
      hideActor("mira");
      hideActor("elder");
      return;
    }

    if (character === "elder") {
      revealActor("elder", key, motion);
      if (!isShellwickScene(frame) || !actors.mira.lastKey) {
        hideActor("mira");
      }
      setActorFocus("elder");
      return;
    }

    revealActor("mira", key, motion);
    if (isShellwickScene(frame)) {
      revealActor("elder", actors.elder.lastKey || "elder", "", true);
    } else {
      hideActor("elder");
    }
    setActorFocus("mira");
  }

  function clearInteraction() {
    stopTyping(false);
    stopVoice();
    interactionPanel.className = "interaction-panel hidden";
    delete interactionPanel.dataset.mode;
    nameForm.classList.add("hidden");
    choiceRow.classList.add("hidden");
    feedbackText.classList.add("hidden");
    rewardPanel.classList.add("hidden");
    choiceRow.innerHTML = "";
    feedbackText.textContent = "";
    feedbackText.classList.remove("is-continue");
    nameLockedOnFrame = false;
    choiceSolvedOnFrame = false;
  }

  function renderNameForm() {
    const profile = readProfile();

    if (profile?.nickname || profile?.certificateName) {
      nameLockedOnFrame = true;
      nextBtn.disabled = false;
      return;
    }

    showInteractionPanel("name");
    nameForm.classList.remove("hidden");
    nextBtn.disabled = true;
    playerNameInput.value = "";
    window.setTimeout(() => playerNameInput.focus(), 80);
  }

  function renderChoices(frame) {
    showInteractionPanel(frame.problem ? "problem" : "choice");
    choiceRow.classList.remove("hidden");
    nextBtn.disabled = true;

    frame.choices.forEach(choice => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        choiceRow.querySelectorAll("button").forEach(item => {
          item.disabled = true;
          const matching = frame.choices.find(option => option.label === item.textContent);
          if (matching?.correct) item.classList.add("correct-choice");
        });

        button.classList.add(choice.correct ? "correct-choice" : "wrong-choice");
        feedbackText.textContent = choice.response || "";
        feedbackText.classList.remove("is-continue");
        feedbackText.classList.remove("hidden");
        choiceSolvedOnFrame = Boolean(choice.correct);
        nextBtn.disabled = !choice.correct;

        if (choice.correct) {
          interactionPanel.classList.add("is-solved");
          feedbackText.classList.add("is-continue");
          window.setTimeout(() => {
            if (frames[currentIndex] === frame && choiceSolvedOnFrame) {
              choiceRow.classList.add("hidden");
            }
          }, 650);
        } else {
          window.setTimeout(() => {
            choiceRow.querySelectorAll("button").forEach(item => {
              item.disabled = false;
              item.classList.remove("wrong-choice", "correct-choice");
            });
            feedbackText.classList.add("hidden");
            feedbackText.textContent = "";
            feedbackText.classList.remove("is-continue");
          }, 1100);
        }
      });
      choiceRow.appendChild(button);
    });
  }

  function renderReward() {
    rewardPanel.classList.remove("hidden");
    nextBtn.disabled = true;
    nextBtn.textContent = "Complete";

    try {
      localStorage.setItem(STORY_COMPLETE_KEY, "true");
      localStorage.setItem(NOTE_UNLOCK_KEY, "true");
    } catch (error) {}
  }

  function renderFrame() {
    const frame = frames[currentIndex];
    const boardReview = Boolean(frame.board && frame.bg === "shellwickBoard");
    const relicFocus = Boolean(frame.relicReveal && !["clear", "fade"].includes(frame.relicReveal));
    clearInteraction();
    storyVn?.classList.toggle("is-board-review", boardReview);

    setBackground(frame.bg);
    setRelicReveal(frame.relicReveal || "");
    setBlackboard(frame.board || "");
    if (boardReview || relicFocus) {
      hideActor("mira");
      hideActor("elder");
    } else {
      setSprite(resolveFrameSprite(frame), frame.motion || "", frame);
    }
    setDialogueSpeaker(frame);
    speakerName.textContent = isNarrationFrame(frame) ? "Narrator" : frame.speaker || "";
    sceneCounter.textContent = `${currentIndex + 1} / ${frames.length}`;
    backBtn.disabled = currentIndex === 0;
    nextBtn.disabled = false;
    nextBtn.textContent = currentIndex === frames.length - 1 ? "Complete" : "Next";
    currentSegments = frameSegments(frame);
    showSegment(0);
    playFrameAmbient(frame);
    playFrameVoice(frame);

    updateProgress();
  }

  function goNext() {
    const frame = frames[currentIndex];

    if (voiceAdvanceLocked) return;

    if (isTyping) {
      stopTyping(true);
      if (currentSegmentIndex >= currentSegments.length - 1) showFrameInteraction();
      return;
    }

    if (currentSegmentIndex < currentSegments.length - 1) {
      showSegment(currentSegmentIndex + 1);
      return;
    }

    if (frame?.action === "name" && !nameLockedOnFrame && !(readProfile()?.nickname || readProfile()?.certificateName)) {
      nameForm.requestSubmit();
      return;
    }

    if (frame?.choices && !choiceSolvedOnFrame) return;
    if (frame?.reward) return;

    currentIndex = Math.min(frames.length - 1, currentIndex + 1);
    renderFrame();
  }

  function goBack() {
    stopTyping(false);
    currentIndex = Math.max(0, currentIndex - 1);
    renderFrame();
  }

  nameForm.addEventListener("submit", event => {
    event.preventDefault();
    writeProfileName(playerNameInput.value);
    nameLockedOnFrame = true;
    interactionPanel.classList.add("is-solved");
    nameForm.classList.add("hidden");
    dialogueText.textContent = `${playerName()}...`;
    feedbackText.textContent = "Mira repeats your name softly, as if the trail itself should remember it.";
    feedbackText.classList.add("is-continue");
    feedbackText.classList.remove("hidden");
    nextBtn.disabled = false;
  });

  nextBtn.addEventListener("click", goNext);
  backBtn.addEventListener("click", goBack);

  document.addEventListener("click", event => {
    tryLockLandscape();
    if (event.target.closest("button, a, input, label")) return;
    if (!nameForm.classList.contains("hidden")) return;
    if (!choiceRow.classList.contains("hidden")) return;
    if (!rewardPanel.classList.contains("hidden")) return;
    goNext();
  });

  document.addEventListener("contextmenu", event => {
    event.preventDefault();
  });

  document.addEventListener("selectstart", event => {
    if (event.target.closest("input, textarea")) return;
    event.preventDefault();
  });

  document.addEventListener("keydown", event => {
    retryPendingAmbient();
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

  document.addEventListener("pointerdown", () => {
    retryPendingAmbient();
    tryLockLandscape();
  }, { passive: true });
  document.addEventListener("touchstart", preventAppZoom, { passive: false });
  document.addEventListener("touchmove", preventAppZoom, { passive: false });
  document.addEventListener("gesturestart", preventSafariGesture, { passive: false });
  document.addEventListener("gesturechange", preventSafariGesture, { passive: false });
  document.addEventListener("gestureend", preventSafariGesture, { passive: false });

  window.addEventListener("pagehide", () => {
    stopVoice();
    stopAmbient();
  });

  window.addEventListener("resize", () => {
    syncStandaloneMode();
    const frame = frames[currentIndex];
    const nextSegments = frameSegments(frame);
    if (nextSegments.join("\n") === currentSegments.join("\n")) return;
    currentSegments = nextSegments;
    showSegment(Math.min(currentSegmentIndex, currentSegments.length - 1));
  });

  syncStandaloneMode();
  preloadRelicImages();
  renderFrame();
})();
