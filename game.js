// ===== 상태 =====
let y = 0;
let sta = 100;
let sp = 100;
let hp = 100;
let skill = [];
let food = 0;
let day = 1;
let isFishing = false;

const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

// ===== 출력 =====
function log(msg = "") {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

function updateStatus() {
  statusEl.textContent =
    `day ${day} | hp ${hp} | sp ${sp} | sta ${sta} | food ${food} | skill ${skill[0] ?? "없음"}`;
}

// ===== 스토리 =====
log("비행기를 탔다");
log("비행기는 언제 타도 설렌다");
log('"오랜만에 여행이라니"');
log('"아 좀 오래 걸리네 뭐 그냥 자야겠다"');
log("그것이 비행기 안에서의 마지막 말이 될 줄은 몰랐다");
log("무인도에 갇혔다");
log("하.. 나 말곤 아무것도 할 줄 모른다");
log("그렇기에 내가 모든걸 책임져야 한다");
log("90일은 생존해야 구조대가 올 것 같다");
log("이제 시작이다");
log("");

// ===== 시간 시스템 =====
setInterval(() => { sp -= 2; checkDeath(); updateStatus(); }, 5000);
setInterval(() => { hp += 4; updateStatus(); }, 5000);
setInterval(() => { sta = Math.min(300, sta + 3); updateStatus(); }, 1000);
setInterval(() => { day++; log(`day ${day}`); }, 60000);

// ===== 사망 =====
function checkDeath() {
  if (hp <= 0) {
    alert("당신은 체력이 없어 죽었다");
    location.reload();
  }
  if (sp <= 0) {
    alert("당신은 허기를 이기지 못해 죽었다");
    location.reload();
  }
}

// ===== 스킬 각성 =====
function updateSkill() {
  if (y === 0 && skill.length === 0) {
    skill.push("연속찌르기");
    log("당신은 연속찌르기를 얻었다");
  }
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

// ===== 행동 =====
function getFood() {
  const f = Math.random() < 0.5;
  if (f) {
    const b = Math.floor(Math.random() * 3) + 1;
    food += b;
    log(`음식 ${b}개를 구했다`);
  } else {
    log("음식을 구하지 못했다");
  }
  log("");
  updateStatus();
}

function useSkill() {
  if (skill.length === 0) {
    log("보유한 스킬 없음");
    return;
  }

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
  updateStatus();
}

function fishing() {
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
    updateStatus();
  }, 1500);
}

// 초기 표시
updateStatus();
