(function () {
  "use strict";

  const items = [
    "金剛戰善鎮伏",
    "寶放光",
    "龍尊王",
    "勇猛軍",
    "吉祥喜",
    "寶火",
    "寶月光",
    "不空見",
    "寶月",
    "無垢",
    "吉祥施",
    "梵淨",
    "梵凈師",
    "水天",
    "水天尊",
    "吉祥賢",
    "栴檀功德",
    "無邊威光",
    "光德",
    "無憂德",
    "無貪子",
    "功得華",
    "梵淨光遊戲神通",
    "蓮花光遊戲神通",
    "財功德",
    "德念",
    "德名廣稱揚",
    "王頂幢王",
    "善鎮伏功德",
    "鬥戰至勝",
    "善鎮伏遊步功德",
    "周匝光明莊嚴",
    "寶蓮花善鎮伏"
  ];

  const list = document.getElementById("toggleList");

  function createLine(name, index) {
    const line = document.createElement("p");
    line.className = "chant-line";

    const number = document.createElement("span");
    number.className = "number";
    number.textContent = `${index + 2}.`;

    const phrase = document.createElement("span");
    phrase.className = "chant-text toggle-phrase";

    const prefix = document.createElement("span");
    prefix.textContent = "南無";

    const button = document.createElement("button");
    button.className = "toggle-middle";
    button.type = "button";
    button.textContent = name;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", `顯示第 ${index + 2} 句中間文字`);

    const suffix = document.createElement("span");
    suffix.textContent = "如來";

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", isOpen ? "false" : "true");
      button.setAttribute("aria-label", `${isOpen ? "顯示" : "隱藏"}第 ${index + 2} 句中間文字`);
    });

    phrase.append(prefix, button, suffix);
    line.append(number, phrase);
    return line;
  }

  if (list) {
    items.forEach((name, index) => {
      list.appendChild(createLine(name, index));
    });
  }
})();
