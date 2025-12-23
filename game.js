const $ = id => document.getElementById(id);

/* ===== 기본 ===== */
let day = 1;
let food = 50;
let foodMax = 50;
let hunger = 100;
let stamina = 100;
let staminaMax = 100;

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
let bossHP = 10000;
let currentSkill = 0;

/* ===== 스킬 ===== */
const skills = [
  {name:"연속찌르기", cost:20, food:10},
  {name:"선시 슬래쉬", cost:30, food:20},
  {name:"낙화참", cost:40, food:30},
  {name:"일전팔기", cost:50, food:50}
];

/* ===== 초기 ===== */
log("🏝 생존 시작");
update();

/* ===== 스태미나 회복 ===== */
setInterval(()=>{
  stamina = Math.min(stamina + 5, staminaMax);
  update();
},1000);

/* ===== 하루 경과 ===== */
setInterval(()=>{
  if(inCombat) return;

  day++;
  hunger -= 5;
  goal += 2;

  if(hunger <= 0){
    log("💀 굶어 죽었다...");
    location.reload();
  }

  if(day % 5 === 0 && day < 90){
    startRaid();
  }

  if(day === 90){
    startBoss();
  }

  update();
},5000);

/* ===== 행동 ===== */
function gatherFood(){
  if(stamina < 10) return;
  stamina -= 10;
  food += 5;
  foodMax = Math.max(foodMax, food);
  log("🌿 음식 +5");
  update();
}

function eatFood(){
  if(food < 10) return;
  food -= 10;
  hunger = Math.min(hunger + 20,100);
  log("🍖 허기 회복");
  update();
}

/* ===== 무기 ===== */
function craftWeapon(){
  if(weaponOwned || food < 30) return;
  food -= 30;
  weaponOwned = true;
  log("🗡 무기 제작");
  update();
}

function upgradeWeapon(){
  if(!weaponOwned || weaponLevel >= 100) return;

  let next = weaponLevel + 1;
  let rate = next === 100 ? 0.001 : (101-next)/100;
  let bonus = next === 100 ? 200 : next;
  let cost = next * 2;
  if(food < cost) return;

  food -= cost;
  if(Math.random() < rate){
    weaponLevel = next;
    weaponBonus += bonus;
    log(`⚒ +${weaponLevel} 성공 (${bonus}%)`);
  }else{
    log("💥 강화 실패");
  }
  update();
}

/* ===== 스킬 ===== */
function useSkill(i){
  currentSkill = i;
  let s = skills[i];

  if(!inCombat){
    if(stamina < s.cost) return;
    stamina -= s.cost;
    food += s.food;
    foodMax = Math.max(foodMax, food);
    log(`✨ ${s.name} → 음식 +${s.food}`);
  }else{
    enemyCount = 0;
    bossHP -= getAttack();
    log(`🔥 ${s.name} 발동`);
    endCombat();
  }
  update();
}

/* ===== 전투 ===== */
function startRaid(){
  inCombat = true;
  enemyCount = (day/5)*3;
  log(`⚠ 습격! 적 ${enemyCount}`);
  switchUI();
}

function startBoss(){
  inCombat = true;
  isBoss = true;
  bossHP = 10000;
  log("👑 보스 등장!");
  switchUI();
}

function attack(){
  let dmg = getAttack();
  if(isBoss){
    bossHP -= dmg;
    log(`⚔ ${dmg} 피해`);
    if(bossHP <= 0){
      log("🎉 엔딩: 생존 성공!");
      return;
    }
  }else{
    enemyCount--;
    log(`⚔ 적 처치 (${enemyCount})`);
    if(enemyCount <= 0) endCombat();
  }
  update();
}

function dodge(){
  if(Math.random() < 0.5){
    log("🌀 회피 성공");
  }else{
    stamina -= 25;
    log("❌ 타이밍 실패 (-25)");
  }
  update();
}

function endCombat(){
  inCombat = false;
  isBoss = false;
  switchUI();
}

/* ===== 계산 ===== */
function getAttack(){
  let base = foodMax;
  let bonus = weaponOwned ? base*(weaponBonus/100) : 0;
  return Math.floor(base + bonus);
}

/* ===== UI ===== */
function switchUI(){
  $("normalButtons").style.display = inCombat ? "none":"block";
  $("combatButtons").style.display = inCombat ? "block":"none";
}

function update(){
  $("day").innerText = day;
  $("food").innerText = food;
  $("hunger").innerText = hunger;
  $("stamina").innerText = stamina;
  $("weapon").innerText = weaponOwned ? `+${weaponLevel} (${weaponBonus}%)` : "없음";
  $("goal").innerText = `${food}/${goal}`;
}

function log(t){
  $("log").innerHTML += t+"<br>";
  $("log").scrollTop = 9999;
}
