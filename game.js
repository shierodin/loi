/* ===== 기본 ===== */
let day = 1;
let hp = 150, sp = 150, sta = 100;
const MAX_HP = 150, MAX_SP = 150, MAX_STA = 300;

let food = 30;
let foodMax = 30;
let dailyGoal = 20;

/* ===== 전투 ===== */
let raidCount = 0;
let enemyCount = 0;
let bossAlive = false;

/* ===== DOM ===== */
const $ = id => document.getElementById(id);
const logBox = $("log");

function log(msg){
  logBox.innerHTML += msg + "<br>";
  logBox.scrollTop = logBox.scrollHeight;
}
function update(){
  $("day").innerText = day;
  $("hp").innerText = hp;
  $("sp").innerText = sp;
  $("sta").innerText = sta;
  $("food").innerText = food;
  $("foodMax").innerText = foodMax;
}

/* ===== 시작 ===== */
window.addEventListener("DOMContentLoaded", () => {
  log("🏝 무인도 표류 시작");
  update();
});

/* ===== 하루 진행 ===== */
setInterval(()=>{
  day++;
  dailyGoal += 2;

  food -= dailyGoal;
  sp -= 5;

  if(food < 0 || sp <= 0) hp -= 10;
  if(hp <= 0) gameOver("사망");

  if(day % 5 === 0 && day < 90) startRaid();
  if(day === 90) ending();

  update();
}, 60000);

/* ===== 스태미나 자동 회복 ===== */
setInterval(()=>{
  if(sta < MAX_STA){
    sta = Math.min(MAX_STA, sta + 5);
    update();
  }
}, 1000);

/* ===== 생존 ===== */
function gatherFood(){
  if(sta < 10) return;
  sta -= 10;
  food += 5;
  foodMax = Math.max(foodMax, food);
  log("🌿 음식 +5");
  update();
}
function fish(){
  if(sta < 15) return;
  sta -= 15;
  food += 8;
  foodMax = Math.max(foodMax, food);
  log("🎣 음식 +8");
  update();
}

/* ===== 음식 ===== */
function toggleEat(){
  const e = $("eatButtons");
  e.style.display = e.style.display === "flex" ? "none" : "flex";
}
function eatFood(){
  if(food < 5){
    log("❌ 음식 부족");
    return;
  }
  food -= 5;
  sp = Math.min(MAX_SP, sp + 25);
  hp = Math.min(MAX_HP, hp + 10);
  log("🍽 음식 섭취 (허기+25 HP+10)");
  update();
}

/* ===== 습격 ===== */
function startRaid(){
  raidCount++;
  enemyCount = raidCount * 3;
  log(`⚠️ 습격 발생! 적 ${enemyCount}마리`);
  enterCombat(false);
}

/* ===== 전투 UI ===== */
function enterCombat(isBoss){
  $("normalButtons").style.display="none";
  $("eatButtons").style.display="none";
  $("combatButtons").style.display="flex";
  $("skillButtons").style.display="none";
  $("dodgeBtn").style.display = isBoss ? "inline-block":"none";
}
function exitCombat(){
  $("normalButtons").style.display="flex";
  $("combatButtons").style.display="none";
  $("skillButtons").style.display="none";
}

/* ===== 공격 ===== */
function attack(){
  let dmg = foodMax;

  enemyCount--;
  log(`⚔️ 적에게 ${dmg} 피해 (1마리 처치)`);

  if(enemyCount <= 0){
    log("✅ 습격 종료");
    exitCombat();
  }
}

/* ===== 패턴 회피 (보스용 구조 유지) ===== */
function dodgePattern(){
  if(Math.random() < 0.5){
    log("🌀 회피 성공!");
  }else{
    sta -= 25;
    log("❌ 회피 실패! 스태미나 -25");
  }
  update();
}

/* ===== 스킬 ===== */
function toggleSkills(){
  $("skillButtons").style.display =
    $("skillButtons").style.display==="flex"?"none":"flex";
}

function skillBase(staCost, foodGain, killCount){
  if(sta < staCost) return;
  sta -= staCost;

  if(enemyCount > 0){
    enemyCount = Math.max(0, enemyCount - killCount);
    log(`💥 적 ${killCount}마리 처치`);
    if(enemyCount === 0) exitCombat();
  }else{
    food += foodGain;
    foodMax = Math.max(foodMax, food);
    log(`🍖 음식 +${foodGain}`);
  }
  update();
}

function skillStab(){ skillBase(20,10,1); }
function skillSun(){ skillBase(30,20,2); }
function skillFall(){ skillBase(40,30,3); }
function skillLast(){ skillBase(60,50,5); }

/* ===== 엔딩 / 게임오버 ===== */
function ending(){
  alert("🎉 90일 생존 성공!\n무인도 탈출!");
  location.reload();
}
function gameOver(r){
  alert("💀 GAME OVER\n"+r);
  location.reload();
}
