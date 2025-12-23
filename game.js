/* ===== 기본 ===== */
let day = 1;
let hp = 200, hunger = 100, stamina = 100;
let food = 30, foodMax = 30;

const MAX_HP = 200;
const MAX_HUNGER = 100;
const MAX_STAMINA = 100;

/* ===== 목표 ===== */
let goal = 20;

/* ===== 무기 ===== */
let weaponOwned = false;
let weaponLevel = 0;
let weaponBonus = 0;

/* ===== 전투 ===== */
let inCombat = false;
let isBoss = false;
let enemyCount = 0;
let bossHP = 0;

/* ===== 스킬 ===== */
let unlockedSkill = 0;
let skillUseCount = [0,0,0,0];

const skills = [
  {name:"연속찌르기", sta:20, food:10, need:10},
  {name:"선시 슬래쉬", sta:30, food:20, need:12},
  {name:"낙화참", sta:40, food:30, need:13},
  {name:"일전팔기", sta:50, food:50}
];

/* ===== DOM ===== */
const $ = id => document.getElementById(id);
const logBox = $("log");

/* ===== 유틸 ===== */
function log(m){
  logBox.innerHTML += m + "<br>";
  logBox.scrollTop = logBox.scrollHeight;
}
function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a }

/* ===== UI ===== */
function update(){
  $("day").innerText = day;
  $("hp").innerText = hp;
  $("hunger").innerText = hunger;
  $("stamina").innerText = stamina;
  $("food").innerText = food;
  $("goal").innerText = `${food}/${goal}`;
  $("weapon").innerText = weaponOwned ? `+${weaponLevel} (${weaponBonus}%)` : "없음";
}

/* ===== 자동 회복 ===== */
setInterval(()=>{
  stamina = Math.min(MAX_STAMINA, stamina + 5);
  hunger = Math.max(0, hunger - 1);

  if(hunger === 0){
    hp -= 2;
    if(hp <= 0) gameOver("굶주림");
  }
  update();
}, 1000);

/* ===== 하루 경과 (60초 = 1일) ===== */
setInterval(()=>{
  day++;
  goal += 2;
  log(`☀️ Day ${day}`);

  if(day % 5 === 0) startRaid();
  if(day === 90) startBoss();

  update();
}, 60000);

/* ===== 행동 ===== */
function gather(){
  if(stamina < 10) return log("❌ 스태미나 부족");
  stamina -= 10;
  let g = rand(5,8);
  food += g;
  foodMax = Math.max(foodMax, food);
  log(`🌿 음식 ${g} 획득`);
  update();
}

function eat(){
  if(food < 5) return log("❌ 음식 부족");
  food -= 5;
  hunger = Math.min(MAX_HUNGER, hunger + 20);
  hp = Math.min(MAX_HP, hp + 10);
  log("🍖 회복");
  update();
}

/* ===== 무기 ===== */
function craftWeapon(){
  if(weaponOwned) return log("❌ 이미 무기 있음");
  if(food < 20) return log("❌ 음식 부족");
  food -= 20;

  weaponOwned = true;
  weaponLevel = 1;
  weaponBonus = 1;
  log("🗡 무기 제작 완료");
  update();
}

function upgradeWeapon(){
  if(!weaponOwned) return log("❌ 무기 없음");

  let next = weaponLevel + 1;
  let cost = next * 5;
  if(food < cost) return log("❌ 음식 부족");

  food -= cost;

  let chance = next === 100 ? 0.1 : (101 - next);
  if(Math.random() * 100 <= chance){
    weaponLevel = next;
    weaponBonus += next === 100 ? 200 : next;
    log(`⚒ 강화 성공 +${weaponLevel}`);
  }else{
    log("💥 강화 실패");
  }
  update();
}

/* ===== 전투 ===== */
function startRaid(){
  inCombat = true;
  isBoss = false;
  enemyCount = (day / 5) * 3;
  toggleCombat(true);
  log(`⚠️ 습격! 적 ${enemyCount}마리`);
}

function startBoss(){
  inCombat = true;
  isBoss = true;
  bossHP = 10000;
  toggleCombat(true);
  $("dodgeBtn").classList.remove("hidden");
  log("👑 보스 등장!");
}

function attack(){
  let dmg = foodMax * (1 + weaponBonus / 100);

  if(isBoss){
    bossHP -= dmg;
    log(`⚔️ 보스 공격 (${bossHP})`);
    if(bossHP <= 0) ending();
  }else{
    enemyCount--;
    log("⚔️ 적 처치");
    if(enemyCount <= 0) endCombat();
  }
}

/* ===== 패턴 회피 ===== */
function dodge(){
  if(Math.random() < 0.5){
    log("🌀 회피 성공");
  }else{
    stamina -= 25;
    log("💥 회피 실패");
  }
  update();
}

/* ===== 스킬 ===== */
function useSkill(){
  let s = skills[unlockedSkill];
  if(stamina < s.sta) return log("❌ 스태미나 부족");

  stamina -= s.sta;
  skillUseCount[unlockedSkill]++;

  if(!inCombat){
    food += s.food;
    foodMax = Math.max(foodMax, food);
    log(`✨ ${s.name} 사용`);
  }else{
    if(isBoss){
      bossHP -= foodMax;
      log(`🔥 ${s.name} 보스 공격`);
      if(bossHP <= 0) ending();
    }else{
      enemyCount = 0;
      log(`🔥 ${s.name} 적 전멸`);
      endCombat();
    }
  }

  if(unlockedSkill < 3 && skillUseCount[unlockedSkill] >= s.need){
    unlockedSkill++;
    log(`🌟 각성 → ${skills[unlockedSkill].name}`);
  }
  update();
}

/* ===== 전투 종료 ===== */
function endCombat(){
  inCombat = false;
  toggleCombat(false);
}

function toggleCombat(on){
  $("normalButtons").classList.toggle("hidden", on);
  $("combatButtons").classList.toggle("hidden", !on);
  $("dodgeBtn").classList.toggle("hidden", !isBoss);
}

/* ===== 엔딩 ===== */
function ending(){
  alert("🎉 Day 90 생존 성공!\n무인도 탈출!");
  location.reload();
}

function gameOver(r){
  alert("💀 GAME OVER\n" + r);
  location.reload();
}

/* ===== 시작 ===== */
log("🏝 무인도 표류 시작");
update();
