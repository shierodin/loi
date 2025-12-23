/* ===== 기본 스탯 ===== */
let day = 1;
let hp = 150;
let sp = 150;        // 허기
let sta = 100;       // 스태미나
let food = 30;

const MAX_HP = 150;
const MAX_SP = 150;
const MAX_STA = 300;

let dailyGoal = 20;

/* ===== 무기 ===== */
let weapon = null;
let weaponLevel = 0;

const weapons = {
  "나무검": {cost:10, bonus:0.1},
  "돌검": {cost:20, bonus:0.2},
  "철검": {cost:30, bonus:0.3},
  "선혈검": {cost:50, bonus:0.5}
};

/* ===== 적 ===== */
let enemyHP = 0;
let enemyCount = 0;

/* ===== 유틸 ===== */
function log(msg){
  const l=document.getElementById("log");
  l.innerHTML+=msg+"<br>";
  l.scrollTop=l.scrollHeight;
}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function update(){
  dayEl.innerText=day;
  hpEl.innerText=`${hp}/${MAX_HP}`;
  spEl.innerText=`${sp}/${MAX_SP}`;
  staEl.innerText=`${sta}/${MAX_STA}`;
  foodEl.innerText=food;
  weaponEl.innerText=weapon?`${weapon}+${weaponLevel}`:"없음";
}

/* ===== DOM ===== */
const dayEl=document.getElementById("day");
const hpEl=document.getElementById("hp");
const spEl=document.getElementById("sp");
const staEl=document.getElementById("sta");
const foodEl=document.getElementById("food");
const weaponEl=document.getElementById("weapon");

/* ===== 하루 시스템 ===== */
setInterval(()=>{
  day++;
  dailyGoal+=5;
  food-=dailyGoal;

  if(food<0){gameOver("음식 부족");}

  sp-=10;
  if(sp<=0){hp-=20;}

  log(`☀️ Day ${day} 시작 (목표 ${dailyGoal})`);
  update();

  if(day%5===0) spawnEnemy();

},60000);

/* ===== 행동 ===== */
function gatherFood(){
  if(sta<8){log("❌ 스태미나 부족");return;}
  sta-=8;
  let g=rand(4,7);
  food+=g;
  log(`🌿 음식 ${g}개 획득`);
  update();
}

let fishing=false;
function fish(){
  if(fishing){log("🎣 낚시 쿨타임");return;}
  fishing=true;
  log("🎣 낚시 중...");
  setTimeout(()=>{
    let g=rand(3,5);
    food+=g;
    log(`🐟 음식 ${g}개 획득`);
    update();
  },1500);
  setTimeout(()=>fishing=false,3000);
}

/* ===== 음식 사용 ===== */
function toggleUseFood(){
  const s=document.getElementById("subButtons");
  s.style.display=s.style.display==="none"?"flex":"none";
}
function eatFood(){
  if(food<5){log("❌ 음식 부족");return;}
  food-=5;
  sp=Math.min(MAX_SP,sp+20);
  hp=Math.min(MAX_HP,hp+10);
  log("🍽 음식을 먹었다");
  update();
}

/* ===== 무기 ===== */
function craftWeapon(){
  for(let w in weapons){
    if(food>=weapons[w].cost){
      food-=weapons[w].cost;
      weapon=w;
      weaponLevel=0;
      log(`🗡 ${w} 제작`);
      update();
      return;
    }
  }
  log("❌ 제작 불가");
}

function upgradeWeapon(){
  if(!weapon){log("❌ 무기 없음");return;}
  let cost=weaponLevel+1;
  if(food<cost){log("❌ 강화 실패");return;}
  food-=cost;
  weaponLevel++;
  log(`⚒ 무기 +${weaponLevel}`);
  update();
}

/* ===== 전투 ===== */
function spawnEnemy(){
  enemyCount=day*2;
  enemyHP=50;
  log(`⚠️ 적 ${enemyCount}명 습격!`);
}

function attack(){
  if(enemyCount<=0){log("⚔️ 공격할 적 없음");return;}
  let dmg = food;
  if(weapon) dmg += dmg * weapons[weapon].bonus;
  enemyHP -= dmg;
  log(`⚔️ ${dmg} 데미지`);

  if(enemyHP<=0){
    enemyCount--;
    enemyHP=50;
    log(`💀 적 처치 (${enemyCount} 남음)`);
  }
}

/* ===== 게임 오버 ===== */
function gameOver(msg){
  alert("게임 오버: "+msg);
  location.reload();
}

/* ===== 시작 ===== */
log("대충 생존 겜 니가 알아서 다 하셈");
update();
