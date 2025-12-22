// ===== 상태 =====
let y = 0;
let sta = 100;
let sp = 150;
let hp = 150;
let skill = [];
let food = 0;
let day = 1;

let goalFood = 20;
let goalCleared = false;

let isFishing = false;
let gameStarted = false;

// ===== 요소 =====
const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

// ===== 출력 =====
function log(msg = "") {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

function updateStatus() {
  const goalText = goalCleared
    ? `Day ${day} 목표 완료`
    : `Day ${day} 목표: FOOD ${goalFood} (${food}/${goalFood})`;

  statusEl.textContent =
    `Day ${day} | HP ${hp}/150 | SP ${sp}/150 | STA ${sta}/300 | FOOD ${food} | SKILL ${skill[0]} | ${goalText}`;
}

// ===== 스토리 =====
const story = [
  "비행기를 탔다",
  "비행기는 언제 타도 설렌다",
  '"오랜만에 여행이라니"',
  '"아 좀 오래 걸리네 뭐 그냥 자야겠다"',
  "그것이 비행기 안에서의 마지막 말이 될 줄은 몰랐다",
  "무인도에 갇혔다",
  "하.. 나 말곤 아무것도 할 줄 모른다",
  "그렇기에 내가 모든걸 책임져야 한다",
  "90일은 생존해야 구조대가 올 것 같다",
  "이제 시작이다"
];

let storyIndex = 0;

function playStory() {
  if (storyIndex < story.length) {
    log(story[storyIndex]);
    storyIndex++;
    setTimeout(playStory, 2000);
  } else {
    log("");
    startGame();
  }
}
playStory();

// ===== 게임 시작 =====
function startGame() {
  gameStarted = true;

  skill = ["연속찌르기"];
  log("당신은 연속찌르기를 얻었다");

  setDailyGoal();
  updateStatus();

  // 허기 감소
  setInterval(() => {
    sp = Math.max(0, sp - 2);
    checkDeath();
    updateStatus();
  }, 5000);

  // 체력 회복
  setInterval(() => {
    hp = Math.min(150, hp + 4);
    updateStatus();
  }, 5000);

  // 스태미나 회복
  setInterval(() => {
    sta = Math.min(300, sta + 3);
    updateStatus();
  }, 1000);

  // 밤 시스템
  setInterval(nextDay, 60000);
}

// ===== 하루 변경 =====
function nextDay() {
  log(`🌙 밤이 되었다 (Day ${day})`);

  if (food < 20) {
    alert("밤을 넘길 음식이 부족해 굶어 죽었다");
    location.reload();
    return;
  }

  food -= 20;
  log("밤을 넘기며 음식 20개를 소비했다");

  day++;
  goalCleared = false;
  setDailyGoal();

  log(`☀️ Day ${day} 시작`);
  log(`🎯 새로운 목표: 음식 ${goalFood}개 확보`);

  updateStatus();
}

function ending() {
  log("");
  log("90일째 아침이 밝았다");
  setTimeout(() => log("멀리서 헬기의 소리가 들린다"), 2000);
  setTimeout(() => log("처음엔 착각인 줄 알았다"), 4000);
  setTimeout(() => log("하지만 점점 가까워진다"), 6000);
  setTimeout(() => log("구조대다"), 8000);
  setTimeout(() => {
    log("당신은 살아남았다");
    alert("🎉 생존 엔딩 달성!");
  }, 10000);

  gameStarted = false;
}


// ===== 목표 =====
function setDailyGoal() {
  goalFood = 20 + (day - 1) * 10;
}

function checkGoal() {
  if (!goalCleared && food >= goalFood) {
    goalCleared = true;
    log(`🎯 Day ${day} 목표 달성!`);
  }
}

// ===== 스킬 각성 =====
function updateSkill() {
  if (y === 65) {
    skill[0] = "선시 슬래쉬";
    log("연속찌르기가 각성해, 선시 슬래쉬로 바뀌었다");
  }
  if (y === 120) {
    skill[0] = "낙화참";
    log("선시 슬래쉬가 각성해, 낙화참으로 바뀌었다");
  }
  if (y === 240) {
    skill[0] = "일전팔기";
    log("낙화참이 각성해, 일전팔기로 바뀌었다");
  }
}

// ===== 사망 =====
function checkDeath() {
  if (hp <= 0) {
    alert("체력이 없어 사망했다");
    location.reload();
  }
  if (sp <= 0) {
    alert("허기를 이기지 못해 사망했다");
    location.reload();
  }
}

// ===== 행동 =====
function getFood() {
  if (!gameStarted) return;

  if (sta < 8) {
    log("스태미나가 부족하다");
    return;
  }

  sta -= 8;

  if (Math.random() < 0.5) {
    const b = Math.floor(Math.random() * 3) + 1;
    food += b;
    log(`스태미나 8을 소모하고 음식 ${b}개를 구했다`);
  } else {
    log("스태미나 8을 소모했지만 음식을 구하지 못했다");
  }

  log("");
  checkGoal();
  updateStatus();
}

function useSkill() {
  if (!gameStarted) return;

  let gain = 0, cost = 0;
  const s = skill[0];

  if (s === "연속찌르기") { gain = 7; cost = 30; }
  if (s === "선시 슬래쉬") { gain = 16; cost = 40; }
  if (s === "낙화참") { gain = 38; cost = 50; }
  if (s === "일전팔기") { gain = 80; cost = 65; }

  if (sta < cost) {
    log("스태미나가 부족하다");
    return;
  }

  sta -= cost;
  food += gain;
  y++;

  log(`스태미나 ${cost}을 소모하고 음식 ${gain}개를 얻었다`);

  updateSkill();
  checkGoal();
  updateStatus();
}

function fishing() {
  if (!gameStarted) return;

  if (isFishing) {
    log("이미 낚시를 하고 있다");
    return;
  }

  isFishing = true;
  log("낚시 하는중...");

  setTimeout(() => {
    const g = Math.floor(Math.random() * 3) + 3;
    food += g;
    log(`음식 ${g}개를 얻었다`);
    isFishing = false;

    checkGoal();
    updateStatus();
  }, 1500);
}

function eatFood() {
  if (!gameStarted) return;

  if (food <= 0) {
    log("먹을 음식이 없다");
    return;
  }

  food--;
  sp = Math.min(150, sp + 15);
  log("음식을 먹어 허기가 회복되었다");

  updateStatus();
}
