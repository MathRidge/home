/* Math Ridge Play 2-4 local game: Exponent Shelf Packing.
   The global shell owns timer, shelf, ladder, background, and Next Climb visibility. */
(function(){
"use strict";

const TOTAL_STEPS = 7;
let score = 0;
let stage = 1;
let round = null;
let runCorrectCount = 0;
let mistakesThisStage = 0;
let stageEligible = true;
let stageComplete = false;
let stageStarted = false;
let achievementShown = false;
let latestRaceRank = null;
let latestSavedRaceSeconds = null;
let completedSteps = new Set();

const PLAY_ID = "2_4";
const PLAY_SECTION = "2-4";
const PLAY_TITLE = "Exponential Pattern Recognition";
const PLAY_COMPLETE_KEY = "mathRidge_playComplete_2_4";
const PLAY_CERT_KEY = "mathRidge_cert_2_4";
const CERT_SIGNATURE = "Presented by Math Ridge Creator: Kuan-Yuan Huang";

function byId(id){ return document.getElementById(id); }
function shell(){ return window.MathRidgePlay || null; }
function safeText(value){ return String(value || "").replace(/[<>]/g, "").trim(); }
function getRaceMs(){ return shell()?.getTotalRaceMs?.() || 0; }
function completePlayProgress(){
  try{
    localStorage.setItem(PLAY_COMPLETE_KEY, "true");
  }catch(error){}
}

const usedProblemDecks = {};
const selectedCompare = {};
const selectedLocation = {};
const PRIMES_BY_STAGE = {
  easy: [2,3,5,7],
  medium: [2,3,5,7,11],
  hard: [2,3,5,7,11,13]
};
const VALID_PRIME_COPY_STRINGS = PRIMES_BY_STAGE.hard.map(String);
const VALID_SINGLE_DIGIT_COPY_STRINGS = ["2","3","5","7"];
const VALID_TWO_DIGIT_COPY_STRINGS = ["11","13"];
const VALID_PRIME_COPY_SET = new Set(VALID_PRIME_COPY_STRINGS);

document.addEventListener("click", event => {
  if(event.target.closest("button") && !event.target.closest("#ladderPopup") && !event.target.closest("#namePopup") && !event.target.closest("#certificatePopup")){
    startStageTimer();
  }
});

document.addEventListener("input", event => {
  if(event.target.matches("input") && !event.target.closest("#namePopup")){
    startStageTimer();
  }
});

function randInt(min,max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomItem(arr){ return arr[randInt(0, arr.length - 1)]; }

function shuffle(arr){
  const copy = [...arr];
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function product(arr){ return arr.reduce((a,b)=>a*b,1); }

function gcd(a,b){
  while(b){ [a,b] = [b, a % b]; }
  return Math.abs(a);
}

function countMap(arr){
  const m = {};
  arr.forEach(n => m[n] = (m[n] || 0) + 1);
  return m;
}

function sameMultiset(a,b){
  if(a.length !== b.length) return false;
  const A = countMap(a);
  const B = countMap(b);
  const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
  return keys.every(k => A[k] === B[k]);
}

function powHTML(base, exp){
  return `<span class="pow"><span class="base">${base}</span><span class="exp">${exp}</span></span>`;
}

function fractionHTML(top,bottom){
  return `<span class="fraction"><span class="top">${top}</span><span class="bottom">${bottom}</span></span>`;
}

function problemHTML(f1, op, f2){
  return `${fractionHTML(f1.top, f1.bottom)} <span class="operator">${op}</span> ${fractionHTML(f2.top, f2.bottom)}`;
}

function productFromCounts(counts){
  let out = 1;
  Object.keys(counts).forEach(k => {
    for(let i=0; i<counts[k]; i++) out *= Number(k);
  });
  return out;
}

function recipeBand(){
  if(score < 3) return "easy";
  if(score < 6) return "medium";
  return "hard";
}

function getRecipe(){
  if(score < 3) return { band:"easy", label:"Score 1–3: small values under 49, many copies of 2 and 3" };
  if(score < 6) return { band:"medium", label:"Score 4–6: fewer hints, 7 and 11 may appear" };
  return { band:"hard", label:"Score 7–10: stronger exponent packing with 11 and 13 possible" };
}

function valueRuleForBand(band){
  // Similar spirit to Play6: early values stay small so students are not punished by arithmetic size.
  if(band === "easy") return { min: 4, max: 49, primes: [2,3,5,7], maxCopies: 3 };
  if(band === "medium") return { min: 12, max: 98, primes: [2,3,5,7,11], maxCopies: 4 };
  return { min: 18, max: 245, primes: [2,3,5,7,11,13], maxCopies: 5 };
}

function factorValue(list){
  return list.reduce((total, n) => total * n, 1);
}

function makeFactorList(band, side){
  const rule = valueRuleForBand(band);

  for(let attempt = 0; attempt < 300; attempt++){
    const list = [];

    // Easy score 1-3: mostly 2s and 3s, sometimes one 5 or 7.
    // This creates exponent copies without creating giant 4-5 digit products.
    if(band === "easy"){
      const mainBase = randomItem([2,3]);
      const mainCopies = randInt(2,3);
      for(let i = 0; i < mainCopies; i++) list.push(mainBase);

      if(Math.random() < 0.75) list.push(randomItem([2,3]));
      if(Math.random() < 0.35) list.push(5);
      if(Math.random() < 0.18) list.push(7);
    }

    if(band === "medium"){
      const mainBase = randomItem([2,3]);
      const mainCopies = randInt(2,4);
      for(let i = 0; i < mainCopies; i++) list.push(mainBase);

      list.push(randomItem([2,3,5]));
      if(Math.random() < 0.55) list.push(randomItem([5,7]));
      if(Math.random() < 0.22) list.push(11);
    }

    if(band === "hard"){
      const mainBase = randomItem([2,3]);
      const mainCopies = randInt(3,5);
      for(let i = 0; i < mainCopies; i++) list.push(mainBase);

      list.push(randomItem([2,3,5,7]));
      if(Math.random() < 0.55) list.push(randomItem([5,7]));
      if(Math.random() < 0.35) list.push(randomItem([11,13]));
    }

    const val = factorValue(list);
    if(val >= rule.min && val < rule.max && list.length <= rule.maxCopies + 2){
      return shuffle(list);
    }
  }

  if(band === "easy") return shuffle([2,2,3]);
  if(band === "medium") return shuffle([2,2,3,5]);
  return shuffle([2,2,2,3,5]);
}

function makeFraction(band){
  const rule = valueRuleForBand(band);

  for(let attempt = 0; attempt < 500; attempt++){
    let topFactors = makeFactorList(band, "top");
    let bottomFactors = makeFactorList(band, "bottom");

    // Force one shared copy without letting the early numbers explode.
    const commonBase = randomItem(band === "easy" ? [2,3] : [2,3,5,7]);
    if(product(topFactors) * commonBase < rule.max && product(bottomFactors) * commonBase < rule.max){
      topFactors.push(commonBase);
      bottomFactors.push(commonBase);
    }

    let top = product(topFactors);
    let bottom = product(bottomFactors);

    if(top === bottom){
      const extra = band === "easy" ? 2 : randomItem([2,3]);
      if(top * extra < rule.max){
        topFactors.push(extra);
        top = product(topFactors);
      }
    }

    if(top >= rule.min && top < rule.max && bottom >= rule.min && bottom < rule.max && top !== bottom){
      return { topFactors: shuffle(topFactors), bottomFactors: shuffle(bottomFactors), top, bottom };
    }
  }

  if(band === "easy"){
    return { topFactors: [2,2,3], bottomFactors: [2,3,3], top: 12, bottom: 18 };
  }
  if(band === "medium"){
    return { topFactors: [2,2,3,5], bottomFactors: [2,3,3,5], top: 60, bottom: 90 };
  }
  return { topFactors: [2,2,2,3,5], bottomFactors: [2,3,3,5,7], top: 120, bottom: 630 };
}



function maxCountInCounts(topCounts, bottomCounts){
  let max = 0;
  Object.keys(topCounts || {}).forEach(k => max = Math.max(max, topCounts[k] || 0));
  Object.keys(bottomCounts || {}).forEach(k => max = Math.max(max, bottomCounts[k] || 0));
  return max;
}

function roundHasCountOverNine(candidate){
  return maxCountInCounts(candidate.topCounts, candidate.bottomCounts) > 9;
}

function repeatedCountMaxFromDiffs(diffs){
  let max = 0;
  Object.keys(diffs).forEach(k => max = Math.max(max, Math.abs(diffs[k])));
  return max;
}

function sameCountFromDiffs(diffs){
  return Object.keys(diffs).filter(k => diffs[k] === 0).length;
}

function nonZeroCountFromDiffs(diffs){
  return Object.keys(diffs).filter(k => diffs[k] !== 0).length;
}

function makeEasyRoundCandidate(){
  const recipe = getRecipe();

  // Early rounds should feel successful:
  // - small values
  // - lots of cancellation
  // - no leftover exponent duplicate bigger than 2
  // - sometimes one full base cancels to hidden 1
  const baseChoices = [
    {
      topCounts: {2:3, 3:1},
      bottomCounts: {2:1, 3:1}
    },
    {
      topCounts: {2:2, 3:1},
      bottomCounts: {2:2, 3:2}
    },
    {
      topCounts: {2:2, 5:1},
      bottomCounts: {2:1, 5:1}
    },
    {
      topCounts: {3:2, 5:1},
      bottomCounts: {3:1, 5:1}
    },
    {
      topCounts: {2:2, 3:1},
      bottomCounts: {2:1, 3:1, 5:1}
    },
    {
      topCounts: {2:1, 3:2},
      bottomCounts: {2:1, 3:1, 7:1}
    },
    {
      topCounts: {2:2, 7:1},
      bottomCounts: {2:1, 7:1, 3:1}
    },
    {
      topCounts: {2:1, 3:1, 5:1},
      bottomCounts: {2:1, 3:2}
    }
  ];

  const chosen = JSON.parse(JSON.stringify(randomItem(baseChoices)));

  // Split the final product into two small fractions.
  // This keeps the setup familiar like Play7, but avoids giant numbers.
  function splitCountsIntoTwoFractions(finalTopCounts, finalBottomCounts){
    const bases = [...new Set([...Object.keys(finalTopCounts), ...Object.keys(finalBottomCounts)].map(Number))];

    const f1Top = {};
    const f1Bottom = {};
    const f2Top = {};
    const f2Bottom = {};

    bases.forEach(base => {
      const t = finalTopCounts[base] || 0;
      const b = finalBottomCounts[base] || 0;

      const t1 = Math.floor(t / 2);
      const b1 = Math.floor(b / 2);

      if(t1) f1Top[base] = t1;
      if(b1) f1Bottom[base] = b1;
      if(t - t1) f2Top[base] = t - t1;
      if(b - b1) f2Bottom[base] = b - b1;
    });

    // Make sure each small fraction has both shelves nonempty.
    if(Object.keys(f1Top).length === 0) f1Top[2] = 1;
    if(Object.keys(f1Bottom).length === 0) f1Bottom[3] = 1;
    if(Object.keys(f2Top).length === 0) f2Top[2] = 1;
    if(Object.keys(f2Bottom).length === 0) f2Bottom[3] = 1;

    return {
      f1: makeFractionObjectFromCounts(f1Top, f1Bottom),
      f2: makeFractionObjectFromCounts(f2Top, f2Bottom)
    };
  }

  let split = splitCountsIntoTwoFractions(chosen.topCounts, chosen.bottomCounts);
  const op = "×";
  const isDivision = false;
  let f1 = split.f1;
  let f2Original = split.f2;
  let f2Product = split.f2;

  // If the split accidentally creates an obvious 1 pattern, try a few other early patterns.
  for(let safeTry = 0; safeTry < 30 && isObviousOneSetup(f1, op, f2Original); safeTry++){
    const retryChoice = JSON.parse(JSON.stringify(randomItem(baseChoices)));
    split = splitCountsIntoTwoFractions(retryChoice.topCounts, retryChoice.bottomCounts);
    f1 = split.f1;
    f2Original = split.f2;
    f2Product = split.f2;
  }

  const topA = shuffle([...f1.topFactors]);
  const topB = shuffle([...f2Product.topFactors]);
  const bottomA = shuffle([...f1.bottomFactors]);
  const bottomB = shuffle([...f2Product.bottomFactors]);

  const productTopFactors = [...topA, ...topB];
  const productBottomFactors = [...bottomA, ...bottomB];
  const topCounts = countMap(productTopFactors);
  const bottomCounts = countMap(productBottomFactors);
  const bases = [...new Set([...Object.keys(topCounts), ...Object.keys(bottomCounts)].map(Number))].sort((a,b)=>a-b);

  const diffs = {};
  bases.forEach(b => diffs[b] = (topCounts[b] || 0) - (bottomCounts[b] || 0));

  const productTop = product(productTopFactors);
  const productBottom = product(productBottomFactors);
  const g = gcd(productTop, productBottom);

  const key = `${f1.top}/${f1.bottom}${op}${f2Original.top}/${f2Original.bottom}|easy-special`;

  const candidate = {
    recipe, f1, f2Original, f2Product, op, isDivision,
    topA, topB, bottomA, bottomB,
    productTopFactors, productBottomFactors,
    topCounts, bottomCounts, bases, diffs,
    productTop, productBottom,
    reducedTop: productTop / g,
    reducedBottom: productBottom / g,
    key
  };

  if(roundHasCountOverNine(candidate)){
    return makeEasyRoundCandidate();
  }

  return candidate;
}

function makeFractionObjectFromCounts(topCounts, bottomCounts){
  const topFactors = [];
  const bottomFactors = [];
  Object.keys(topCounts).forEach(k => {
    for(let i=0; i<topCounts[k]; i++) topFactors.push(Number(k));
  });
  Object.keys(bottomCounts).forEach(k => {
    for(let i=0; i<bottomCounts[k]; i++) bottomFactors.push(Number(k));
  });

  return {
    topFactors: shuffle(topFactors),
    bottomFactors: shuffle(bottomFactors),
    top: product(topFactors),
    bottom: product(bottomFactors)
  };
}

function buildRoundCandidate(){
  const recipe = getRecipe();

  if(recipe.band === "easy"){
    return makeEasyRoundCandidate();
  }

  let f1 = makeFraction(recipe.band);
  let f2Original = makeFraction(recipe.band);
  let op = "×";

  for(let safeTry = 0; safeTry < 80 && isObviousOneSetup(f1, op, f2Original); safeTry++){
    f1 = makeFraction(recipe.band);
    f2Original = makeFraction(recipe.band);
    op = "×";
  }

  const isDivision = false;

  const f2Product = f2Original;

  const topA = shuffle([...f1.topFactors]);
  const topB = shuffle([...f2Product.topFactors]);
  const bottomA = shuffle([...f1.bottomFactors]);
  const bottomB = shuffle([...f2Product.bottomFactors]);

  const productTopFactors = [...topA, ...topB];
  const productBottomFactors = [...bottomA, ...bottomB];
  const topCounts = countMap(productTopFactors);
  const bottomCounts = countMap(productBottomFactors);
  const bases = [...new Set([...Object.keys(topCounts), ...Object.keys(bottomCounts)].map(Number))].sort((a,b)=>a-b);

  const diffs = {};
  bases.forEach(b => diffs[b] = (topCounts[b] || 0) - (bottomCounts[b] || 0));

  if(nonZeroCountFromDiffs(diffs) < 2){
    return buildRoundCandidate();
  }

  const productTop = product(productTopFactors);
  const productBottom = product(productBottomFactors);

  const totalCap = recipe.band === "easy" ? 900 : recipe.band === "medium" ? 5000 : 40000;
  if(productTop > totalCap || productBottom > totalCap || maxCountInCounts(topCounts, bottomCounts) > 9){
    return buildRoundCandidate();
  }

  const g = gcd(productTop, productBottom);

  const key = `${f1.top}/${f1.bottom}${op}${f2Original.top}/${f2Original.bottom}|${recipe.band}`;

  return {
    recipe, f1, f2Original, f2Product, op, isDivision,
    topA, topB, bottomA, bottomB,
    productTopFactors, productBottomFactors,
    topCounts, bottomCounts, bases, diffs,
    productTop, productBottom,
    reducedTop: productTop / g,
    reducedBottom: productBottom / g,
    key
  };
}

function problemWasUsed(recipe, key){
  const bucket = recipe.band;
  return usedProblemDecks[bucket] && usedProblemDecks[bucket].has(key);
}

function rememberProblem(recipe, key){
  const bucket = recipe.band;
  if(!usedProblemDecks[bucket]) usedProblemDecks[bucket] = new Set();
  usedProblemDecks[bucket].add(key);
}

function clearDeck(recipe){ usedProblemDecks[recipe.band] = new Set(); }

function chooseUnusedRound(){
  let candidate = buildRoundCandidate();
  for(let attempt=0; attempt<500; attempt++){
    const safe = !isObviousOneSetup(candidate.f1, candidate.op, candidate.f2Original);
    const smallEnough = !roundHasCountOverNine(candidate);
    if(safe && smallEnough && !problemWasUsed(candidate.recipe, candidate.key)){
      rememberProblem(candidate.recipe, candidate.key);
      return candidate;
    }
    candidate = buildRoundCandidate();
  }
  clearDeck(candidate.recipe);
  rememberProblem(candidate.recipe, candidate.key);
  return candidate;
}

function updateCoachingText(){
  const less = score >= 3;
  const none = score >= 6;

  document.getElementById("topHint").classList.toggle("hidden", none);
  document.getElementById("bottomHint").classList.toggle("hidden", none);
  document.getElementById("topPackHint").classList.toggle("hidden", none);
  document.getElementById("bottomPackHint").classList.toggle("hidden", none);
  document.getElementById("compareHint").classList.toggle("hidden", none);
  document.getElementById("leftoverHint").classList.toggle("hidden", none);
  document.getElementById("placeHint").classList.toggle("hidden", none);

  document.getElementById("instruction").textContent = less
    ? "List copies. Pack top, pack bottom, compare, reduce."
    : "Follow the path: list top copies, list bottom copies, pack exponents, compare, then reduce.";
}

function newRound(){
  round = chooseUnusedRound();
  runCorrectCount = 0;
  mistakesThisStage = 0;
  stageEligible = true;
  stageComplete = false;
  stageStarted = false;
  completedSteps = new Set();

  for(const k in selectedCompare) delete selectedCompare[k];
  for(const k in selectedLocation) delete selectedLocation[k];

  stopStageTimer(false);
  document.getElementById("difficultyLine").textContent = round.recipe.label;
  document.getElementById("originalProblem").innerHTML = problemHTML(round.f1, round.op, round.f2Original);
  document.getElementById("problemCard").classList.add("climb-locked");

  document.getElementById("topReference").innerHTML = `${fractionHTML(round.f1.top,"&nbsp;")} <span class="operator">×</span> ${fractionHTML(round.f2Product.top,"&nbsp;")}`;
  document.getElementById("bottomReference").innerHTML = `${fractionHTML("&nbsp;",round.f1.bottom)} <span class="operator">×</span> ${fractionHTML("&nbsp;",round.f2Product.bottom)}`;

  buildGroupedInputs("topInputs", round.topA.length, round.topB.length, "top");
  buildGroupedInputs("bottomInputs", round.bottomA.length, round.bottomB.length, "bottom");
  buildPackForm();
  buildCompareRows();
  buildLeftoverForm();
  buildLocationGrid();

  ["topStep","bottomStep","topPackStep","bottomPackStep","compareStep","leftoverStep","placeStep","completeStep"].forEach(hideStep);
  setNextClimbAvailable(false);
  document.getElementById("ansTop").value = "";
  document.getElementById("ansBottom").value = "";
  prepareFinalAnswerInputs();

  updateCoachingText();
  setFeedback("Press START the Climb when you are ready. The timer starts after you press it.", "neutral");
  updateBoard();
}

function makeFactorInput(id, index){
  const input = document.createElement("input");
  input.className = "factor-input";
  input.maxLength = 80;
  input.inputMode = "numeric";
  input.setAttribute("aria-label", `${id} factor ${index+1}`);

  input.addEventListener("input", () => {
    const rawValue = input.value;
    const tokens = parsePrimeCopyTokens(rawValue);
    const hasListSyntax = /[^0-9]/.test(rawValue) || tokens.length > 1;

    if(tokens.length && hasListSyntax){
      distributePrimeCopyTokens(id, input, tokens);
      return;
    }

    input.value = rawValue.replace(/[^0-9]/g,"").slice(0,2);
    const allInputs = [...document.querySelectorAll(`#${id} input`)];
    const currentIndex = allInputs.indexOf(input);
    if(isCompletePrimeCopy(input.value) && allInputs[currentIndex + 1]) allInputs[currentIndex + 1].focus();
  });

  return input;
}

function parsePrimeCopyDigits(digits){
  const clean = String(digits || "").replace(/\D/g, "");
  const tokens = [];
  let index = 0;

  while(index < clean.length){
    const nextTwo = clean.slice(index, index + 2);
    if(VALID_TWO_DIGIT_COPY_STRINGS.includes(nextTwo)){
      tokens.push(nextTwo);
      index += 2;
      continue;
    }

    const nextOne = clean[index];
    if(VALID_SINGLE_DIGIT_COPY_STRINGS.includes(nextOne)){
      tokens.push(nextOne);
      index += 1;
      continue;
    }

    return [];
  }

  return tokens;
}

function parsePrimeCopyTokens(raw){
  const text = String(raw || "").trim();
  if(!text) return [];

  const chunks = text.split(/[^0-9]+/).filter(Boolean);
  if(!chunks.length) return [];

  const tokens = [];
  for(const chunk of chunks){
    const parsed = parsePrimeCopyDigits(chunk);
    if(!parsed.length) return [];
    tokens.push(...parsed);
  }
  return tokens;
}

function isCompletePrimeCopy(value){
  return VALID_PRIME_COPY_SET.has(String(value || "").trim());
}

function distributePrimeCopyTokens(id, startInput, tokens){
  const allInputs = [...document.querySelectorAll(`#${id} input`)];
  const startIndex = allInputs.indexOf(startInput);
  if(startIndex < 0) return;

  for(let i = startIndex; i < allInputs.length; i++){
    allInputs[i].value = "";
  }

  tokens.forEach((token, offset) => {
    const target = allInputs[startIndex + offset];
    if(target) target.value = token;
  });

  const nextInput = allInputs[startIndex + tokens.length];
  const lastFilledInput = allInputs[Math.min(startIndex + tokens.length - 1, allInputs.length - 1)];
  (nextInput || lastFilledInput)?.focus();
}

function buildGroupedInputs(id, firstCount, secondCount, type){
  const wrap = document.getElementById(id);
  wrap.innerHTML = "";

  const label = document.createElement("div");
  label.className = "group-label";
  label.textContent = type === "top"
    ? "Top shelf of first fraction × top shelf of second fraction"
    : "Bottom shelf of first fraction × bottom shelf of second fraction";
  wrap.appendChild(label);

  const firstBox = document.createElement("div");
  firstBox.className = `group-box ${type === "top" ? "top-group-box" : "bottom-group-box"}`;
  for(let i=0; i<firstCount; i++) firstBox.appendChild(makeFactorInput(id, i));

  const op = document.createElement("span");
  op.className = "operator";
  op.textContent = "×";

  const secondBox = document.createElement("div");
  secondBox.className = `group-box ${type === "top" ? "top-group-box" : "bottom-group-box"}`;
  for(let i=0; i<secondCount; i++) secondBox.appendChild(makeFactorInput(id, firstCount+i));

  wrap.appendChild(firstBox);
  wrap.appendChild(op);
  wrap.appendChild(secondBox);
}

function getInputFactors(id){
  const factors = [];
  [...document.querySelectorAll(`#${id} input`)].forEach(input => {
    const rawValue = input.value.trim();
    if(!rawValue) return;

    const tokens = parsePrimeCopyTokens(rawValue);
    if(tokens.length){
      factors.push(...tokens.map(Number));
      return;
    }

    const fallbackValue = Number(rawValue.replace(/\D/g, ""));
    if(fallbackValue) factors.push(fallbackValue);
  });
  return factors;
}

function checkTop(){
  if(stageComplete) return;
  const entered = getInputFactors("topInputs");
  if(sameMultiset(entered, round.productTopFactors)){
    markCorrectStep("top");
    document.getElementById("bottomStep").classList.remove("hidden");
    setFeedback("✅ Top shelf copies are correct.", "good");
    focusPanel("bottomStep");
  } else {
    markMistake();
    setFeedback("Not yet. The top copies must multiply back to the top shelf product.", "bad");
  }
}

function checkBottom(){
  if(stageComplete) return;
  const entered = getInputFactors("bottomInputs");
  if(sameMultiset(entered, round.productBottomFactors)){
    markCorrectStep("bottom");
    document.getElementById("topPackStep").classList.remove("hidden");
    setFeedback("✅ Bottom shelf copies are correct. Now pack the top shelf.", "good");
    focusPanel("topPackStep");
  } else {
    markMistake();
    setFeedback("Not yet. The bottom copies must multiply back to the bottom shelf product.", "bad");
  }
}


function attachExpAutoJump(scope = document){
  scope.querySelectorAll(".exp-input").forEach(input => {
    input.maxLength = 1;
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g,"").slice(0,1);
      if(!input.value) return;

      const step = input.closest(".step-card") || document;
      const all = [...step.querySelectorAll(".exp-input")].filter(el => !el.disabled && el.offsetParent !== null);
      const index = all.indexOf(input);
      if(all[index + 1]) all[index + 1].focus();
    });

    input.addEventListener("keydown", e => {
      if(e.key === "Backspace" && !input.value){
        const step = input.closest(".step-card") || document;
        const all = [...step.querySelectorAll(".exp-input")].filter(el => !el.disabled && el.offsetParent !== null);
        const index = all.indexOf(input);
        if(all[index - 1]) all[index - 1].focus();
      }
    });
  });
}

function isObviousOneSetup(f1, op, f2Original){
  // Avoid same-value fractions like 3/3, 5/5, 15/15.
  if(f1.top === f1.bottom) return true;
  if(f2Original.top === f2Original.bottom) return true;

  // Avoid reciprocal multiplication like 15/24 × 24/15.
  if(op === "×" && f1.top === f2Original.bottom && f1.bottom === f2Original.top) return true;

  // Avoid product becoming exactly 1 before the student works.
  if(op === "×" && f1.top * f2Original.top === f1.bottom * f2Original.bottom) return true;
return false;
}

function buildPackForm(){
  const topMini = document.getElementById("topMiniCopies");
  const bottomMini = document.getElementById("bottomMiniCopies");
  const topWrap = document.getElementById("topPackForm");
  const bottomWrap = document.getElementById("bottomPackForm");

  topMini.innerHTML = round.productTopFactors.map(n => `<span class="mini-copy top-chip">${n}</span>`).join("");
  bottomMini.innerHTML = round.productBottomFactors.map(n => `<span class="mini-copy bottom-chip">${n}</span>`).join("");

  topWrap.innerHTML = "";
  bottomWrap.innerHTML = "";

  round.bases.forEach(base => {
    const topCard = document.createElement("div");
    topCard.className = "power-card";
    topCard.innerHTML = `${powHTML(base, `<input class="exp-input" data-side="top" data-base="${base}" inputmode="numeric">`)}`;
    topWrap.appendChild(topCard);

    const bottomCard = document.createElement("div");
    bottomCard.className = "power-card";
    bottomCard.innerHTML = `${powHTML(base, `<input class="exp-input" data-side="bottom" data-base="${base}" inputmode="numeric">`)}`;
    bottomWrap.appendChild(bottomCard);
  });

  attachExpAutoJump(document.getElementById("topPackStep"));
  attachExpAutoJump(document.getElementById("bottomPackStep"));
}

function getExpInput(side, base){
  const el = document.querySelector(`.exp-input[data-side="${side}"][data-base="${base}"]`);
  return el ? Number(el.value) : NaN;
}

function checkTopPack(){
  if(stageComplete) return;
  let ok = true;
  round.bases.forEach(base => {
    if(getExpInput("top", base) !== (round.topCounts[base] || 0)) ok = false;
  });

  if(ok){
    markCorrectStep("topPack");
    document.getElementById("bottomPackStep").classList.remove("hidden");
    setFeedback("✅ Top shelf exponent counts are packed.", "good");
    focusPanel("bottomPackStep");
  } else {
    markMistake();
    setFeedback("Not yet. Count only the top shelf copies shown in the mini reference.", "bad");
  }
}

function isStillArmingTrialButton(event){
  const target = event?.currentTarget || event?.target;
  return Boolean(target
    && (target.dataset?.trialArmed === "true"
      || target.dataset?.trialPointerFirstArm === "true"
      || target.classList?.contains("is-play-armed")));
}

function checkBottomPack(event){
  if(isStillArmingTrialButton(event)) return;
  if(stageComplete) return;
  let ok = true;
  round.bases.forEach(base => {
    if(getExpInput("bottom", base) !== (round.bottomCounts[base] || 0)) ok = false;
  });

  if(ok){
    markCorrectStep("bottomPack");
    document.getElementById("compareStep").classList.remove("hidden");
    setFeedback("✅ Bottom shelf exponent counts are packed. Now choose the bigger shelf.", "good");
    focusPanel("compareStep");
  } else {
    markMistake();
    setFeedback("Not yet. Count only the bottom shelf copies shown in the mini reference.", "bad");
  }
}

function buildCompareRows(){
  const wrap = document.getElementById("compareRows");
  wrap.innerHTML = "";

  round.bases.forEach(base => {
    const row = document.createElement("div");
    row.className = "base-row";
    row.innerHTML = `
      <div class="base-pill">${base}</div>
      <button class="compare-btn" data-compare="${base}" data-choice="top" onclick="chooseCompare(${base}, 'top')">Top bigger</button>
      <button class="compare-btn" data-compare="${base}" data-choice="same" onclick="chooseCompare(${base}, 'same')">Same</button>
      <button class="compare-btn" data-compare="${base}" data-choice="bottom" onclick="chooseCompare(${base}, 'bottom')">Bottom bigger</button>
      <div class="compare-text">Top ${round.topCounts[base] || 0} vs Bottom ${round.bottomCounts[base] || 0}</div>
    `;
    wrap.appendChild(row);
  });

  updateAutoExpression();
}

function chooseCompare(base, choice){
  selectedCompare[base] = choice;
  document.querySelectorAll(`[data-compare="${base}"]`).forEach(btn => {
    btn.classList.remove("selectedTop","selectedBottom","selectedSame");
    if(btn.dataset.choice === choice){
      if(choice === "top") btn.classList.add("selectedTop");
      if(choice === "bottom") btn.classList.add("selectedBottom");
      if(choice === "same") btn.classList.add("selectedSame");
    }
  });
  updateAutoExpression();
}

function expectedCompare(base){
  const diff = round.diffs[base];
  if(diff > 0) return "top";
  if(diff < 0) return "bottom";
  return "same";
}

function actionExpression(base){
  const top = round.topCounts[base] || 0;
  const bottom = round.bottomCounts[base] || 0;
  const choice = selectedCompare[base];

  if(!choice) return "?";

  if(choice === "same"){
    return `(${top}−${bottom})`;
  }

  if(choice === "top"){
    return `(${top}−${bottom})`;
  }

  return `−(${bottom}−${top})`;
}

function updateAutoExpression(){
  const wrap = document.getElementById("autoExpression");
  const chosen = round.bases.filter(base => selectedCompare[base]);

  if(chosen.length === 0){
    wrap.innerHTML = "Choose Top, Same, or Bottom. Your exponent setup will appear here.";
    return;
  }

  wrap.innerHTML = round.bases.map(base => {
    if(!selectedCompare[base]){
      return `<span class="power-card">${powHTML(base, "?")}</span>`;
    }
    return `<span class="power-card">${powHTML(base, actionExpression(base))}</span>`;
  }).join(" × ");
}

function checkCompare(){
  if(stageComplete) return;
  let ok = true;

  round.bases.forEach(base => {
    if(selectedCompare[base] !== expectedCompare(base)) ok = false;
  });

  if(ok){
    markCorrectStep("compare");
    buildLeftoverForm();
    document.getElementById("leftoverStep").classList.remove("hidden");
    setFeedback("✅ Correct. The expression matches your shelf comparisons.", "good");
    focusPanel("leftoverStep");
  } else {
    markMistake();
    setFeedback("Not yet. Choose Top if top has more, Bottom if bottom has more, or Same if the counts match.", "bad");
  }
}

function buildLeftoverForm(){
  const wrap = document.getElementById("leftoverForm");
  wrap.innerHTML = "";

  round.bases.forEach(base => {
    const diff = round.diffs[base];
    const sign = diff < 0 ? "−" : "";
    const card = document.createElement("span");
    card.className = "power-card";
    card.innerHTML = `${powHTML(base, actionExpression(base))} <span class="operator">→</span> ${powHTML(base, `${sign}<input class="exp-input leftover-input" data-base="${base}" inputmode="numeric">`)}`;
    wrap.appendChild(card);
  });

  attachExpAutoJump(document.getElementById("leftoverStep"));
}

function checkLeftovers(){
  if(stageComplete) return;
  let ok = true;
  round.bases.forEach(base => {
    const el = document.querySelector(`.leftover-input[data-base="${base}"]`);
    const entered = el ? Number(el.value) : NaN;
    if(entered !== Math.abs(round.diffs[base])) ok = false;
  });

  if(ok){
    markCorrectStep("leftovers");
    buildLocationGrid();
    document.getElementById("placeStep").classList.remove("hidden");
    setFeedback("✅ Leftover counts are correct. Now rebuild the fraction.", "good");
    focusPanel("placeStep");
  } else {
    markMistake();
    setFeedback("Not yet. Simplify the number inside the parentheses. Same counts become 0.", "bad");
  }
}

function buildLocationGrid(){
  const grid = document.getElementById("locationGrid");
  grid.innerHTML = "";
  for(const k in selectedLocation) delete selectedLocation[k];

  round.bases.forEach(base => {
    const diff = round.diffs[base];
    if(diff === 0) return;

    const card = document.createElement("div");
    card.className = "location-card";
    card.innerHTML = `
      <div class="baseLine">${powHTML(base, diff)}</div>
      <button class="compare-btn" data-place="${base}" data-choice="top" onclick="chooseLocation(${base}, 'top')">Place Top</button>
      <button class="compare-btn" data-place="${base}" data-choice="bottom" onclick="chooseLocation(${base}, 'bottom')">Place Bottom</button>
    `;
    grid.appendChild(card);
  });
  updateFractionPreview();
}

function chooseLocation(base, choice){
  selectedLocation[base] = choice;
  document.querySelectorAll(`[data-place="${base}"]`).forEach(btn => {
    btn.classList.remove("selectedTop","selectedBottom");
    if(btn.dataset.choice === choice) btn.classList.add(choice === "top" ? "selectedTop" : "selectedBottom");
  });
  updateFractionPreview();
}

function expectedLocation(base){
  return round.diffs[base] > 0 ? "top" : "bottom";
}

function updateFractionPreview(){
  const topParts = [];
  const bottomParts = [];
  round.bases.forEach(base => {
    const diff = round.diffs[base];
    if(diff === 0) return;
    const part = powHTML(base, Math.abs(diff));
    if(selectedLocation[base] === "top") topParts.push(part);
    if(selectedLocation[base] === "bottom") bottomParts.push(part);
  });

  document.getElementById("fractionPreview").innerHTML = fractionHTML(topParts.length ? topParts.join(" × ") : "1", bottomParts.length ? bottomParts.join(" × ") : "1");
}

function checkFinal(){
  if(stageComplete) return;

  let placementOk = true;
  round.bases.forEach(base => {
    if(round.diffs[base] !== 0 && selectedLocation[base] !== expectedLocation(base)) placementOk = false;
  });

  const a = Number(document.getElementById("ansTop").value);
  const b = Number(document.getElementById("ansBottom").value);
  const answerOk = a === round.reducedTop && b === round.reducedBottom;

  if(placementOk && answerOk){
    markCorrectStep("final");
    stageComplete = true;
    showComplete();
  } else {
    markMistake();
    if(!placementOk){
      setFeedback("Not yet. Positive exponent goes top. Negative exponent goes bottom.", "bad");
    } else {
      setFeedback("Placement is correct. Now multiply the remaining powers for the simplest fraction.", "bad");
    }
  }
}


function exponentProductStringFromCounts(counts){
  return Object.keys(counts)
    .map(Number)
    .sort((a,b)=>a-b)
    .filter(base => (counts[base] || 0) > 0)
    .map(base => powHTML(base, counts[base]))
    .join(" ");
}

function productSetupHTML(){
  const top = exponentProductStringFromCounts(round.topCounts) || "1";
  const bottom = exponentProductStringFromCounts(round.bottomCounts) || "1";
  return fractionHTML(top, bottom);
}

function combineFormHTML(){
  return round.bases.map(base => {
    const top = round.topCounts[base] || 0;
    const bottom = round.bottomCounts[base] || 0;

    if(top >= bottom){
      return powHTML(base, `(${top}−${bottom})`);
    }
    return powHTML(base, `−(${bottom}−${top})`);
  }).join(" ");
}

function reduceFormHTML(){
  return round.bases.map(base => {
    const diff = round.diffs[base];

    if(diff > 0) return powHTML(base, diff);
    if(diff < 0) return powHTML(base, `(${diff})`);
    return powHTML(base, 0);
  }).join(" ");
}

function simplestFormHTML(){
  return fractionHTML(round.reducedTop, round.reducedBottom);
}

function procedureLineHTML(label, content){
  return `
    <div style="width:100%; text-align:left; margin:8px 0 4px; color:#7a4b00; font-size:0.95rem;">
      ${label}
    </div>
    <div style="width:100%; display:flex; justify-content:center; align-items:center; font-size:clamp(1.25rem,4vw,2rem);">
      ${content}
    </div>
  `;
}

function hideStep(id){
  const el = document.getElementById(id);
  if(el) el.classList.add("hidden");
}

function showStep(id){
  const el = document.getElementById(id);
  if(el) el.classList.remove("hidden");
}

function showComplete(){
  stopStageTimer(true);
  ["topStep","bottomStep","topPackStep","bottomPackStep","compareStep","leftoverStep","placeStep"].forEach(hideStep);
  showStep("completeStep");

  document.getElementById("completeFlow").innerHTML = `
    ${procedureLineHTML("Original:", problemHTML(round.f1, round.op, round.f2Original))}
    ${procedureLineHTML("Product setup:", productSetupHTML())}
    ${procedureLineHTML("Combine form:", combineFormHTML())}
    ${procedureLineHTML("Reduce form:", reduceFormHTML())}
    ${procedureLineHTML("Simplest form:", simplestFormHTML())}
  `;

  let scoreText = "";
  let earnedScore = false;
  if(stageEligible && mistakesThisStage === 0){
    score = Math.min(10, score + 1);
    earnedScore = true;
    scoreText = "🏁 Turtle reached the score! +1 score earned.";
  } else {
    scoreText = "Practice stage completed. No score earned from this retry or error run.";
  }

  const message = score >= 10
    ? "🎁 Score 10 reached! Certificate unlocked."
    : "🏁 Exponent shelf packing complete! Next Climb is ready.";

  const masteryComplete = score >= 10;
  document.getElementById("completeMessage").textContent = `${scoreText} You used exponent copy counts to simplify the fraction multiplication.`;
  setFeedback(
    masteryComplete
      ? "✅ Score 10 reached. Certificate unlocked."
      : "✅ Stage complete. Next Climb is unlocked below.",
    "good"
  );

  if(masteryComplete) completePlayProgress();
  updateBoard(message);

  if(earnedScore){
    setTimeout(() => {
      fadeCompletionTurtle();
      popScoreChange("+1", "plus");
    }, 80);
  }

  if(masteryComplete){
    stopStageTimer(true);
    setNextClimbAvailable(false);
    if(!achievementShown) setTimeout(showAchievementPopup, 700);
    setTimeout(focusCompleteView, 100);
    return;
  }

  if(shell()?.finishCorrectClimb){
    shell().finishCorrectClimb({ message, scroll:false });
  } else {
    setNextClimbAvailable(true, { scroll:false });
  }

  setTimeout(focusCompleteView, 100);
}

function markCorrectStep(stepKey = ""){
  if(stageComplete) return false;
  if(stepKey && completedSteps.has(stepKey)) return false;
  if(stepKey) completedSteps.add(stepKey);
  runCorrectCount = Math.min(TOTAL_STEPS, runCorrectCount + 1);
  updateBoard();
  return true;
}

function markMistake(){
  shell()?.playSfx?.("wrong");
  stopStageTimer(true);
  mistakesThisStage++;
  runCorrectCount = 0;
  stageStarted = false;

  if(!stageEligible){
    setFeedback("Retry stage: mistake ignored. This stage is practice only.", "neutral");
    updateBoard();
    return;
  }

  if(mistakesThisStage === 1){
    stageEligible = false;
    document.getElementById("challengeMessage").textContent = "Mistake made. Turtle progress cleared. Finish this stage for practice.";
  } else {
    if(score > 0) score--;
    document.getElementById("challengeMessage").textContent = "Second mistake in this stage. Score reduced by 1, but never below 0.";
  }
  updateBoard();
}

function retryStage(){
  stageEligible = false;
  runCorrectCount = 0;
  mistakesThisStage = 0;
  stageComplete = false;
  completedSteps = new Set();

  for(const k in selectedCompare) delete selectedCompare[k];
  for(const k in selectedLocation) delete selectedLocation[k];

  buildGroupedInputs("topInputs", round.topA.length, round.topB.length, "top");
  buildGroupedInputs("bottomInputs", round.bottomA.length, round.bottomB.length, "bottom");
  buildPackForm();
  buildCompareRows();
  buildLeftoverForm();
  buildLocationGrid();

  ["bottomStep","topPackStep","bottomPackStep","compareStep","leftoverStep","placeStep","completeStep"].forEach(hideStep);
  showStep("topStep");
  setNextClimbAvailable(false);
  document.getElementById("ansTop").value = "";
  document.getElementById("ansBottom").value = "";
  prepareFinalAnswerInputs();

  setFeedback("Retry this stage. This retry is practice only and will not change score.", "neutral");
  updateBoard();
  focusPanel("topStep");
}


function showClimbGate(){
  stopStageTimer(false);
  const gate = document.getElementById("climbStartGate");
  const playArea = document.getElementById("playArea");
  if(gate) gate.classList.remove("hidden");
  if(playArea) playArea.classList.add("hidden");
  stageStarted = false;
  document.getElementById("problemCard")?.classList.add("climb-locked");
  updateBoard("Press START the Climb when you are ready.");
}

function startClimbFromGate(){
  const gate = document.getElementById("climbStartGate");
  const playArea = document.getElementById("playArea");
  if(gate) gate.classList.add("hidden");
  if(playArea) playArea.classList.remove("hidden");
  startClimb(false);
}

function startClimb(useNextTimer = false){
  if(stageComplete || stageStarted) return;
  stageStarted = true;
  document.getElementById("problemCard")?.classList.remove("climb-locked");
  showStep("topStep");

  if(useNextTimer && shell()?.startNextClimbTimer){
    shell().startNextClimbTimer();
  } else {
    startStageTimer();
  }

  setFeedback("Climb started. List the top shelf prime copies first.", "neutral");
  updateBoard(`Climb ${TOTAL_STEPS} clean progress steps to score.`);
  focusPanel("topStep");
}

function nextClimb(){
  if(score >= 10){
    completePlayProgress();
    showAchievementPopup();
    return;
  }

  stopStageTimer(false);
  setNextClimbAvailable(false);
  stage++;
  newRound();

  const gate = document.getElementById("climbStartGate");
  const playArea = document.getElementById("playArea");
  if(gate) gate.classList.add("hidden");
  if(playArea) playArea.classList.remove("hidden");

  startClimb(true);
  setFeedback(`Stage ${stage}: list, pack, compare, and reduce.`, "neutral");
  setTimeout(centerQuestionTopShelf, 80);
}

function resetChallenge(){
  Object.keys(usedProblemDecks).forEach(key => usedProblemDecks[key].clear());
  score = 0;
  stage = 1;
  runCorrectCount = 0;
  mistakesThisStage = 0;
  achievementShown = false;
  resetRaceTimer();
  newRound();
  showClimbGate();
  document.getElementById("namePopup").style.display = "none";
  document.getElementById("certificatePopup").style.display = "none";
  document.body.classList.remove("modal-open");
  setFeedback("Turtle score reset. Start again from the guided path.", "neutral");
}


function getProgressThemeForScore(currentScore){
  if(currentScore >= 7) return "purple";
  if(currentScore >= 4) return "blue";
  return "neutral";
}

function setNextClimbAvailable(isAvailable, options = {}){
  if(isAvailable){
    if(shell()?.showNextClimbButton) return shell().showNextClimbButton(options.scroll !== false);
  } else {
    if(shell()?.hideNextClimbButton) return shell().hideNextClimbButton({ force:true });
  }

  const btn = document.getElementById("nextClimbButton");
  if(!btn) return false;
  btn.disabled = !isAvailable;
  btn.hidden = !isAvailable;
  btn.classList.toggle("hidden", !isAvailable);
  btn.classList.toggle("locked-button", !isAvailable);
  return true;
}

function formatRaceTime(ms){
  if(shell()?.formatRaceTime) return shell().formatRaceTime(ms);
  const totalSeconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2,"0")}`;
}

function getCurrentStageMs(){
  return shell()?.getCurrentClimbMs?.() || 0;
}

function updateTimerPanel(){
  shell()?.updateTimerPanel?.();
}

function startStageTimer(){
  if(!stageStarted || !stageEligible || score >= 10 || stageComplete) return;
  shell()?.startClimbTimer?.({ hideNext:false });
}

function stopStageTimer(addToTotal = true){
  shell()?.stopClimbTimer?.(addToTotal);
}

function resetRaceTimer(){
  latestRaceRank = null;
  latestSavedRaceSeconds = null;
  shell()?.resetRaceTimer?.();
}

function popScoreChange(text, type){
  const scoreText = document.getElementById("scoreText");
  if(!scoreText) return;
  const pop = document.createElement("span");
  pop.className = `score-pop ${type === "plus" ? "plus-pop" : "minus-pop"}`;
  pop.textContent = text;
  scoreText.appendChild(pop);
  setTimeout(() => pop.remove(), 2100);
}

function fadeCompletionTurtle(){
  const turtle = document.querySelector(".progress-turtle");
  if(!turtle) return;
  turtle.classList.remove("turtle-fade-away");
  void turtle.offsetWidth;
  turtle.classList.add("turtle-fade-away");
}

function shakeScoreBoard(){
  const board = document.querySelector(".challenge-board");
  if(!board) return;
  board.classList.remove("shake-board");
  void board.offsetWidth;
  board.classList.add("shake-board");
  setTimeout(() => board.classList.remove("shake-board"), 500);
}

function prepareFinalAnswerInputs(){
  const top = document.getElementById("ansTop");
  const bottom = document.getElementById("ansBottom");
  if(!top || !bottom || !round) return;
  const topLen = String(round.reducedTop || "").length;
  const bottomLen = String(round.reducedBottom || "").length;
  top.maxLength = topLen;
  bottom.maxLength = bottomLen;
  top.inputMode = "numeric";
  bottom.inputMode = "numeric";
  top.setAttribute("pattern", "[0-9]*");
  bottom.setAttribute("pattern", "[0-9]*");
  top.oninput = () => {
    startStageTimer();
    top.value = top.value.replace(/\D/g, "").slice(0, topLen);
    if(top.value.length >= topLen) bottom.focus();
  };
  bottom.oninput = () => {
    startStageTimer();
    bottom.value = bottom.value.replace(/\D/g, "").slice(0, bottomLen);
    if(bottom.value.length >= bottomLen){
      setTimeout(() => document.querySelector("#placeStep button[onclick='checkFinal()']")?.focus(), 40);
    }
  };
}

function rankText(rank){
  if(rank === 1) return "🥇 1st Place World Time Champion";
  if(rank === 2) return "🥈 2nd Place World Time";
  if(rank === 3) return "🥉 3rd Place World Time";
  return "";
}

function renderWorldRecords(records){
  if(shell()?.renderLadderRecords) return shell().renderLadderRecords(records || [], true);
}

async function loadWorldRecords(showAll = false){
  if(shell()?.loadLadderRecords) return shell().loadLadderRecords(showAll);
  return [];
}

function openLadder(){
  return shell()?.showLadderPopup?.();
}

function closeLadder(){
  return shell()?.closeLadderPopup?.();
}

function updateBoard(message = ""){
  const progressPercent = Math.min(100, Math.round((runCorrectCount / TOTAL_STEPS) * 100));

  const defaultMessage = stageComplete
    ? "✅ Stage complete. Next Climb is ready below."
    : !stageStarted && stageEligible
      ? "Press START the Climb when you are ready."
      : !stageEligible
        ? "Practice stage. Finish the path, then try a fresh climb."
        : score >= 7
          ? "Purple level: pack and compare with focus."
          : score >= 4
            ? "Blue level: fewer hints, same pattern."
            : mistakesThisStage === 0
              ? "Perfect path ready. Start with the top shelf copies."
              : "Keep practicing. Finish the path, then use Next Climb for a fresh score chance.";

  if(shell()?.updateShelf){
    shell().updateShelf({ score, stage, progressPercent, message: message || defaultMessage });
  } else {
    document.getElementById("scoreText").textContent = `Score: ${score}`;
    document.getElementById("stageText").textContent = `Stage: ${stage}`;
    const track = document.getElementById("turtleTrack");
    track.style.setProperty("--progress", `${progressPercent}%`);
    document.getElementById("challengeMessage").textContent = message || defaultMessage;
  }

  updateTimerPanel();
}

function setFeedback(text,type){
  const fb = document.getElementById("feedback");
  fb.textContent = text;
  fb.className = "feedback";
  if(type === "good") fb.classList.add("good-text");
  if(type === "bad") fb.classList.add("bad-text");
  if(type === "neutral") fb.classList.add("neutral-text");
}

function focusPanel(id){
  if(!document.body.classList.contains("loaded")) return;
  if(shell()?.scrollToPremiumElement) return shell().scrollToPremiumElement(id, 14);
  const panel = document.getElementById(id);
  if(!panel) return;
  setTimeout(() => panel.scrollIntoView({ behavior:"smooth", block:"center", inline:"nearest" }), 80);
}

function focusCompleteView(){
  const element = document.getElementById("completeStep") || document.getElementById("completeMessage");
  if(!element || !document.body.classList.contains("loaded")) return;
  setTimeout(() => {
    const shelf = document.querySelector(".challenge-board");
    const fixedTop = shelf ? shelf.getBoundingClientRect().height + 12 : 130;
    const rect = element.getBoundingClientRect();
    const available = window.innerHeight - fixedTop;
    const targetTop = window.scrollY + rect.top - fixedTop + (rect.height / 2) - (available / 2);
    window.scrollTo({ top: Math.max(0, targetTop), behavior:"smooth" });
  }, 140);
}

function centerFeedbackForNext(){
  focusCompleteView();
}

function centerQuestionTopShelf(){
  const target = document.getElementById("problemCard") || document.getElementById("topStep");
  if(!target || !document.body.classList.contains("loaded")) return;
  if(shell()?.scrollToPremiumElement) return shell().scrollToPremiumElement(target.id, 14);
  setTimeout(() => target.scrollIntoView({ behavior:"smooth", block:"center", inline:"nearest" }), 80);
}

function showAchievementPopup() {
		achievementShown = true;
		return shell()?.showAchievementPopup?.();
	}
async function createCertificateFromName() {
		return shell()?.createCertificateFromName?.();
	}
function closeCertificatePopup() {
		return shell()?.closeCertificatePopup?.();
	}
function openSavedCertificateFromCabin() {
		return shell()?.openSavedCertificateFromCabin?.();
	}
function startConfetti() {
		return shell()?.startConfetti?.();
	}
function saveCertificateImage() {
		return shell()?.saveCertificateImage?.();
	}
window.MathRidgeLocal = {
  getScore: () => score,
  getStage: () => stage,
  getRequiredProgressSteps: () => TOTAL_STEPS
};

window.showClimbGate = showClimbGate;
window.startClimbFromGate = startClimbFromGate;
window.startClimb = startClimb;
window.checkTop = checkTop;
window.checkBottom = checkBottom;
window.checkTopPack = checkTopPack;
window.checkBottomPack = checkBottomPack;
window.chooseCompare = chooseCompare;
window.checkCompare = checkCompare;
window.checkLeftovers = checkLeftovers;
window.chooseLocation = chooseLocation;
window.checkFinal = checkFinal;
window.nextClimb = nextClimb;
window.resetChallenge = resetChallenge;
window.openLadder = openLadder;
window.closeLadder = closeLadder;
window.loadWorldRecords = loadWorldRecords;
window.addEventListener("load", () => {
  resetRaceTimer();
  newRound();
  showClimbGate();
  setTimeout(openSavedCertificateFromCabin, 350);
  requestAnimationFrame(() => document.body.classList.add("loaded"));
});
})();
