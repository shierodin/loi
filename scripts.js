/* ===== 기본 상태 ===== */
let day = 1, hp = 150, sp = 150, sta = 100, food = 30;
const MAX_HP = 150, MAX_SP = 150, MAX_STA = 300;
let dailyGoal = 20;

/* ===== 무기 ===== */
let weapon = null, weaponLevel = 0;
const weapons = {
  "나무검": {cost: 10, bonus: 0.1},
  "돌검": {cost: 20, bonus: 0.2},
  "철검": {cost: 30, bonus: 0.3},
  "선혈검": {cost: 50, bonus: 0.5}
};

/* ===== 적 / 보스 ===== */
let enemyHP = 0, enemyCount = 0;
let bossHP = 0, bossAlive = false;

/* ===== 스킬 ===== */
let awakened = false;
let skillCooldown = false;

/* ===== DOM ===== */
const $ = id => document.getElementById(id);
const logBox = $("log");

/* ===== 유틸 ===== */
function log(m) { logBox.innerHTML += m + "<br>"; logBox.scrollTop = logBox.scrollHeight; }
function rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function update() {
  $("day").innerText = day;
  $("hp").innerText = `${hp}/${MAX_HP}`;
  $("sp").innerText = `${sp}/${MAX_SP}`;
  $("sta").innerText = `${sta}/${MAX_STA}`;
  $("food").innerText = food;
  $("weapon").innerText = weapon ? `${weapon}+${weaponLevel}` : "없음";
}

/* ===== 하루 / 습격 ===== */
setInterval(() => {
  day++; dailyGoal += 5; food -= dailyGoal; sp -= 10;
  if(food < 0 || sp <= 0) hp -= 20;
  if(hp <= 0) gameOver("굶주림");

  log(`☀️ Day ${day} (목표 ${dailyGoal})`);
  if(day % 3 === 0) spawnEnemy();
  if(day === 15) spawnBoss();
  update();
}, 60000);

/* ===== 스태미나 자동회복 ===== */
setInterval(() => {
  sta = Math.min(MAX_STA, sta + 5); // 1초마다 5 회복
  update();
}, 1000);

/* ===== 행동 ===== */
function gatherFood() {
  if(sta < 8) return log("❌ 스태미나 부족");
  sta -= 8; 
  let g = rand(4,7); 
  food += g;
  log(`🌿 음식 ${g}`);
  update();
}

let fishing = false;
function fish() {
  if(fishing) return;
  fishing = true; 
  log("🎣 낚시...");
  setTimeout(() => {
    let g = rand(3,5); food += g;
    log(`🐟 음식 ${g}`);
    update();
  }, 1500);
  setTimeout(() => fishing = false, 3000);
}

/* ===== 음식 ===== */
function toggleUseFood(){ toggle("subButtons"); }
function eatFood() {
  if(food < 5) return log("❌ 음식 부족");
  food -= 5; sp = Math.min(MAX_SP, sp + 20); hp = Math.min(MAX_HP, hp + 10);
  log("🍽 회복");
  update();
}

/* ===== 무기 ===== */
function craftWeapon() {
  for(let w in weapons) {
    if(food >= weapons[w].cost){
      food -= weapons[w].cost;
      weapon = w; weaponLevel = 0;
      log(`🗡 ${w} 제작`);
      update(); 
      return;
    }
  }
  log("❌ 음식 부족");
}

function upgradeWeapon() {
  if(!weapon) return log("❌ 무기 없음");
  let c = weaponLevel + 1;
  if(food < c) return log("❌ 음식 부족");
  food -= c; weaponLevel++;
  log(`⚒ +${weaponLevel}`);
  update();
}

/* ===== 전투 ===== */
function spawnEnemy() {
  enemyCount = day*2; enemyHP = 50;
  log(`⚠️ 적 ${enemyCount}명 등장`);
}

function attack() {
  if(bossAlive) return bossAttack();
  if(enemyCount <= 0) return log("적 없음");

  let dmg = food + (weapon ? food*weapons[weapon].bonus : 0);
  enemyHP -= dmg; log(`⚔️ ${dmg} 피해`);

  if(enemyHP <= 0) {
    enemyCount--; enemyHP = 50;
    log(`💀 적 처치 (${enemyCount} 남음)`);
  }
}

/* ===== 스킬 ===== */
function toggleSkills(){ toggle("skillButtons"); }

function skillSlash() {
  if(skillCooldown || enemyCount <= 0) return;
  skillCooldown = true;
  let dmg = food * 3;
  enemyCount = Math.max(0, enemyCount - 3);
  log(`💥 연속베기! 적 3명 처치`);
  setTimeout(() => skillCooldown = false, 5000);
}

function skillAwaken() {
  if(awakened || sta < 30) return log("❌ 각성 불가");
  awakened = true; sta -= 30;
  log("🔥 각성 상태 진입");
}

function useSkill(name, dmg) {
  if(!awakened) return log("❌ 각성 상태 아님");
  if(enemyCount <= 0 && !bossAlive) return log("적 없음");

  log(`✨ ${name} 발동!`);

  if(bossAlive) {
    bossHP -= dmg;
    log(`👑 보스에게 ${dmg} 피해`);
    if(bossHP <= 0) ending();
    return;
  }

  let killed = Math.floor(dmg / 50);
  enemyCount = Math.max(0, enemyCount - killed);
  log(`💀 적 ${killed}명 처치`);
}

function skillStab() { useSkill("연속찌르기", 10); }
function skillSunSlash() { useSkill("선시 슬래쉬", 20); }
function skillFall() { useSkill("낙화참", 35); }
function skillLast() { useSkill("일전팔기", 60); }

/* ===== 보스 ===== */
function spawnBoss() { bossAlive = true; bossHP = 1000; log("👑 보스 등장!"); }

function bossAttack() {
  let dmg = weapon ? food*weapons[weapon].bonus*2 : food;
  bossHP -= dmg; hp -= rand(10,25);
  log(`👑 보스 HP ${bossHP}`);
  if(bossHP <= 0) ending();
}

/* ===== 엔딩 ===== */
function ending() {
  bossAlive = false;
  alert("🎉 구조 신호 성공!\n무인도 탈출!");
  location.reload();
}

function gameOver(r) {
  alert("💀 GAME OVER\n"+r);
  location.reload();
}

/* ===== 토글 ===== */
function toggle(id) {
  const e = $(id);
  e.style.display = e.style.display === "none" ? "flex" : "none";
}

/* ===== 시작 ===== */
log("개쩐다");
update();
