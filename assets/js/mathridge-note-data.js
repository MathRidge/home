/*
  mathridge-note-data.js
  Stores the setup data for Math Ridge note pages.
*/

window.MathRidgeNotes = window.MathRidgeNotes || {};

window.MathRidgeNotes["1_1"] = {
  noteId: "1_1",
  playLink: "play1.html",
  startLabel: "Start Climb 1-1",
  readyTitle: "Ready for the next climb: 1-1 Play",
  lockedText: "Locked until all four sign-size checks are correct.",
  unlockedText: "Unlocked! You may begin 1-1 Play.",
  modalTitle: "1-1 Play Unlocked!",
  modalText: "You have unlocked 1-1 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) Same team: <span class="prompt-term plus">+5</span> and <span class="prompt-term plus">+2</span>',
      answer: "+7",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Build the final answer",
      sizePlaceholder: "size",
      hint: "Same signs stay on one team. Put + outside. Add 5 + 2 inside the box."
    },
    {
      prompt: '2) Same team: <span class="prompt-term minus">−4</span> and <span class="prompt-term minus">−3</span>',
      answer: "-7",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Build the final answer",
      sizePlaceholder: "size",
      hint: "Both terms are negative. Put − outside. Add the sizes 4 + 3 inside the box."
    },
    {
      prompt: '3) Different teams: <span class="prompt-term plus">+6</span> and <span class="prompt-term minus">−9</span>',
      answer: "-3",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Build the final answer",
      sizePlaceholder: "size",
      hint: "The larger size is 9, and it is negative. Put − outside. Subtract 9 − 6 inside."
    },
    {
      prompt: '4) Different teams: <span class="prompt-term minus">−5</span> and <span class="prompt-term plus">+8</span>',
      answer: "+3",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Build the final answer",
      sizePlaceholder: "size",
      hint: "The larger size is 8, and it is positive. Put + outside. Subtract 8 − 5 inside."
    }
  ]
};

window.MathRidgeNotes["1_2"] = {
  noteId: "1_2",
  playLink: "play2.html",
  startLabel: "Start Climb 1-2",
  readyTitle: "Ready for the next climb: 1-2 Play",
  lockedText: "Locked until all four team-showdown checks are correct.",
  unlockedText: "Unlocked! You may begin 1-2 Play.",
  modalTitle: "1-2 Play Unlocked!",
  modalText: "You have unlocked 1-2 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) Collect teams: <span class="prompt-term plus">+4</span> <span class="prompt-term minus">−3</span> <span class="prompt-term plus">+6</span> <span class="prompt-term minus">−2</span>',
      answer: "+5",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final team result",
      sizePlaceholder: "size",
      hint: "Positive team: 4 + 6 = 10. Negative team: 3 + 2 = 5. Positive is larger, so write +5."
    },
    {
      prompt: '2) Collect teams: <span class="prompt-term minus">−5</span> <span class="prompt-term plus">+8</span> <span class="prompt-term minus">−4</span> <span class="prompt-term plus">+2</span>',
      answer: "+1",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final team result",
      sizePlaceholder: "size",
      hint: "Positive team: 8 + 2 = 10. Negative team: 5 + 4 = 9. Positive is larger by 1."
    },
    {
      prompt: '3) Collect teams: <span class="prompt-term plus">+7</span> <span class="prompt-term minus">−9</span> <span class="prompt-term plus">+3</span> <span class="prompt-term minus">−6</span>',
      answer: "-5",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final team result",
      sizePlaceholder: "size",
      hint: "Positive team: 7 + 3 = 10. Negative team: 9 + 6 = 15. Negative is larger by 5."
    },
    {
      prompt: '4) Collect teams: <span class="prompt-term plus">+2</span> <span class="prompt-term plus">+5</span> <span class="prompt-term minus">−10</span> <span class="prompt-term minus">−1</span>',
      answer: "-4",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final team result",
      sizePlaceholder: "size",
      hint: "Positive team: 2 + 5 = 7. Negative team: 10 + 1 = 11. Negative is larger by 4."
    }
  ]
};

window.MathRidgeNotes["1_3"] = {
  noteId: "1_3",
  playLink: "play3.html",
  startLabel: "Start Climb 1-3",
  readyTitle: "Ready for the next climb: 1-3 Play",
  lockedText: "Locked until all four sign-pair checks are correct.",
  unlockedText: "Unlocked! You may begin 1-3 Play.",
  modalTitle: "1-3 Play Unlocked!",
  modalText: "You have unlocked 1-3 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) Simplify the sign stack: <span class="sign-stack-practice">−(−3)</span>',
      answer: "+3",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final value",
      sizePlaceholder: "size",
      hint: "Count the negative signs in this one term. Two negatives is even, so the value becomes positive 3."
    },
    {
      prompt: '2) Simplify the sign stack: <span class="sign-stack-practice">−(−(−2))</span>',
      answer: "-2",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final value",
      sizePlaceholder: "size",
      hint: "There are three negative signs in the same stack. Three is odd, so one negative sign is left."
    },
    {
      prompt: '3) Fix the sign, then solve: <span class="sign-stack-practice">3 − (−2)</span>',
      answer: "+5",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final value",
      sizePlaceholder: "size",
      hint: "First fix −(−2) into +2. Then the problem becomes 3 + 2."
    },
    {
      prompt: '4) Fix the sign, then solve: <span class="sign-stack-practice">−4 − (−2)</span>',
      answer: "-2",
      answerType: "signedNumber",
      inputLayout: "signedNumber",
      inputLabel: "Final value",
      sizePlaceholder: "size",
      hint: "First fix −(−2) into +2. Then the problem becomes −4 + 2. The negative side is larger by 2."
    }
  ]
};

window.MathRidgeNotes["1_4"] = {
  noteId: "1_4",
  playLink: "play4.html",
  startLabel: "Start Climb 1-4",
  readyTitle: "Ready for the next climb: 1-4 Play",
  lockedText: "Locked until all four chunk-total checks are correct.",
  unlockedText: "Unlocked! You may begin 1-4 Play.",
  modalTitle: "1-4 Play Unlocked!",
  modalText: "You have unlocked 1-4 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) <span class="chunk-practice-expression"><span class="chunk-practice-piece">7(4)</span><span>→</span><span class="chunk-practice-piece">5(4)</span><span>+</span><span class="chunk-practice-piece">2(4)</span></span>',
      answer: 28,
      inputMode: "numeric",
      inputLabel: "Final total",
      placeholder: "total",
      hint: "Split 7 copies into 5 + 2. Five 4s make 20. Two 4s make 8. Then add 20 + 8."
    },
    {
      prompt: '2) <span class="chunk-practice-expression"><span class="chunk-practice-piece">8(2)</span><span>→</span><span class="chunk-practice-piece">5(2)</span><span>+</span><span class="chunk-practice-piece">3(2)</span></span>',
      answer: 16,
      inputMode: "numeric",
      inputLabel: "Final total",
      placeholder: "total",
      hint: "Split 8 copies into 5 + 3. Five 2s make 10. Three 2s make 6. Then add 10 + 6."
    },
    {
      prompt: '3) <span class="chunk-practice-expression"><span class="chunk-practice-piece">9(3)</span><span>→</span><span class="chunk-practice-piece">5(3)</span><span>+</span><span class="chunk-practice-piece">4(3)</span></span>',
      answer: 27,
      inputMode: "numeric",
      inputLabel: "Final total",
      placeholder: "total",
      hint: "Split 9 copies into 5 + 4. Five 3s make 15. Four 3s make 12. Then add 15 + 12."
    },
    {
      prompt: '4) <span class="chunk-practice-expression"><span class="chunk-practice-piece">8(4)</span><span>→</span><span class="chunk-practice-piece">5(4)</span><span>+</span><span class="chunk-practice-piece">3(4)</span></span>',
      answer: 32,
      inputMode: "numeric",
      inputLabel: "Final total",
      placeholder: "total",
      hint: "Split 8 copies into 5 + 3. Five 4s make 20. Three 4s make 12. Then add 20 + 12."
    }
  ]
};

window.MathRidgeNotes["2_1"] = {
  noteId: "2_1",
  playLink: "play5.html",
  startLabel: "Start Climb 2-1",
  readyTitle: "Ready for the next climb: 2-1 Play",
  lockedText: "Locked until all four fraction checks are correct.",
  unlockedText: "Unlocked! You may begin 2-1 Play.",
  modalTitle: "2-1 Play Unlocked!",
  modalText: "You have unlocked 2-1 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) Reduce <span class="fraction"><span class="top">14</span><span class="bottom">22</span></span> to its simplest name.',
      answer: "7/11",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Write it here",
      hint: "Both shelves are even. Group both shelves by 2: 14/22 → 7/11."
    },
    {
      prompt: '2) Reduce <span class="fraction"><span class="top">16</span><span class="bottom">24</span></span> until no shared group remains.',
      answer: "2/3",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Write it here",
      hint: "Use the same group on both shelves. 16/24 → 8/12 → 4/6 → 2/3."
    },
    {
      prompt: '3) Reduce <span class="fraction"><span class="top">21</span><span class="bottom">27</span></span> using a shared group.',
      answer: "7/9",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Write it here",
      hint: "Both digit sums are divisible by 3. Group both shelves by 3: 21/27 → 7/9."
    },
    {
      prompt: '4) Reduce <span class="fraction"><span class="top">15</span><span class="bottom">35</span></span> to the cleanest name.',
      answer: "3/7",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Write it here",
      hint: "Both shelves end in 5. Group both shelves by 5: 15/35 → 3/7."
    }
  ]
};

window.MathRidgeNotes["2_2"] = {
  noteId: "2_2",
  playLink: "play6.html",
  startLabel: "Start Climb 2-2",
  readyTitle: "Ready for the next climb: 2-2 Play",
  lockedText: "Locked until all four prime-piece checks are correct.",
  unlockedText: "Unlocked! You may begin 2-2 Play.",
  modalTitle: "2-2 Play Unlocked!",
  modalText: "You have unlocked 2-2 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) Break <span class="factor-chip">24</span> into prime pieces.',
      answer: [2, 2, 2, 3],
      answerType: "primePieces",
      inputLayout: "primePieces",
      inputLabel: "Prime pieces",
      hint: "24 is even. Pull out 2, then 2, then 2. The leftover is 3."
    },
    {
      prompt: '2) Break <span class="factor-chip">45</span> into prime pieces.',
      answer: [3, 3, 5],
      answerType: "primePieces",
      inputLayout: "primePieces",
      inputLabel: "Prime pieces",
      hint: "45 ends in 5, and 4 + 5 = 9. You can find 5 and two 3s."
    },
    {
      prompt: '3) Break <span class="factor-chip">56</span> into prime pieces.',
      answer: [2, 2, 2, 7],
      answerType: "primePieces",
      inputLayout: "primePieces",
      inputLabel: "Prime pieces",
      hint: "56 is even. Keep pulling out 2s until the leftover is 7."
    },
    {
      prompt: '4) Break <span class="factor-chip">70</span> into prime pieces.',
      answer: [2, 5, 7],
      answerType: "primePieces",
      inputLayout: "primePieces",
      inputLabel: "Prime pieces",
      hint: "70 is even and ends in 0. That helps you find 2 and 5. The leftover is 7."
    }
  ]
};

window.MathRidgeNotes["2_3"] = {
  noteId: "2_3",
  playLink: "play7.html",
  startLabel: "Start Climb 2-3",
  readyTitle: "Ready for the next climb: 2-3 Play",
  lockedText: "Locked until all four fraction checks are correct.",
  unlockedText: "Unlocked! You may begin 2-3 Play.",
  modalTitle: "2-3 Play Unlocked!",
  modalText: "You have unlocked 2-3 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) Convert, reduce, and finish: <span class="fraction"><span class="top">3</span><span class="bottom">7</span></span> ÷ <span class="fraction"><span class="top">9</span><span class="bottom">14</span></span>',
      answer: "2/3",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Final simplest fraction",
      topPlaceholder: "top",
      bottomPlaceholder: "bottom",
      hint: "Flip only the second fraction: 3/7 × 14/9. Then cross a 7 with 14 and a 3 with 9."
    },
    {
      prompt: '2) Convert, reduce, and finish: <span class="fraction"><span class="top">10</span><span class="bottom">21</span></span> ÷ <span class="fraction"><span class="top">25</span><span class="bottom">49</span></span>',
      answer: "14/15",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Final simplest fraction",
      topPlaceholder: "top",
      bottomPlaceholder: "bottom",
      hint: "Flip only the second fraction: 10/21 × 49/25. Use prime pieces to match 5s and 7s before multiplying leftovers."
    },
    {
      prompt: '3) Convert, reduce, and finish: <span class="fraction"><span class="top">15</span><span class="bottom">8</span></span> ÷ <span class="fraction"><span class="top">5</span><span class="bottom">12</span></span>',
      answer: "9/2",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Final simplest fraction",
      topPlaceholder: "top",
      bottomPlaceholder: "bottom",
      hint: "Flip only the second fraction: 15/8 × 12/5. Cross a 5 and reduce 12 with 8 before finishing."
    },
    {
      prompt: '4) Convert, reduce, and finish: <span class="fraction"><span class="top">18</span><span class="bottom">35</span></span> ÷ <span class="fraction"><span class="top">6</span><span class="bottom">49</span></span>',
      answer: "21/5",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Final simplest fraction",
      topPlaceholder: "top",
      bottomPlaceholder: "bottom",
      hint: "Flip only the second fraction: 18/35 × 49/6. Match a 6 with part of 18, and match 7s between 35 and 49."
    }
  ]
};

window.MathRidgeNotes["2_4"] = {
  noteId: "2_4",
  playLink: "play8.html",
  startLabel: "Start Climb 2-4",
  readyTitle: "Ready for the next climb: 2-4 Play",
  lockedText: "Locked until all four packing checks are correct.",
  unlockedText: "Unlocked! You may begin 2-4 Play.",
  modalTitle: "2-4 Play Unlocked!",
  modalText: "You have unlocked 2-4 Play. Would you like to begin the next climb now?",
  problems: [
    {
      prompt: '1) Pack and simplify: <span class="fraction"><span class="top">2 × 2 × 3 × 3 × 3</span><span class="bottom">2 × 3</span></span>',
      answer: "18",
      inputMode: "numeric",
      inputLabel: "Simple value",
      placeholder: "?",
      hint: "Pack counts: top has 2² and 3³. Bottom has 2¹ and 3¹. After matching, one 2 and two 3s remain upstairs."
    },
    {
      prompt: '2) Pack and simplify: <span class="fraction"><span class="top">2 × 5 × 5</span><span class="bottom">2 × 2 × 5</span></span>',
      answer: "5/2",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Final fraction",
      topPlaceholder: "top",
      bottomPlaceholder: "bottom",
      hint: "Pack counts: 2 has top 1 and bottom 2, so one 2 stays downstairs. 5 has top 2 and bottom 1, so one 5 stays upstairs."
    },
    {
      prompt: '3) Pack and simplify: <span class="fraction"><span class="top">3 × 3 × 7</span><span class="bottom">3 × 7 × 7</span></span>',
      answer: "3/7",
      answerType: "simplestFraction",
      inputLayout: "fraction",
      inputLabel: "Final fraction",
      topPlaceholder: "top",
      bottomPlaceholder: "bottom",
      hint: "Pack counts: 3 has one extra copy upstairs. 7 has one extra copy downstairs."
    },
    {
      prompt: '4) Pack and simplify: <span class="fraction"><span class="top">2 × 2 × 2 × 3</span><span class="bottom">2 × 2 × 2 × 3</span></span>',
      answer: "1",
      inputMode: "numeric",
      inputLabel: "Simple value",
      placeholder: "?",
      hint: "The top and bottom counts match exactly: 2³/2³ and 3¹/3¹. Zero leftover copies means the value becomes 1."
    }
  ]
};
