const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const TILE=35;

const MAP=[
"##################",
"#................#",
"#.####.####.####.#",
"#................#",
"#.##.########.##.#",
"#................#",
"####.##....##.####",
"#....##.##.##....#",
"#.##....##....##.#",
"#....##....##....#",
"#.##.########.##.#",
"#................#",
"#.####.####.####.#",
"#................#",
"#.##.########.##.#",
"#................#",
"#................#",
"##################"
];

/* Kandungan fokus Bab 4.1:
   kepercayaan awal (animisme, dinamisme), pengaruh Hindu-Buddha, dan Islam.
   Soalan dibuat sebagai pengukuhan ringkas, bukan menggantikan buku teks. */
const levels=[
 {mission:"LEVEL 1 — KEPERCAYAAN AWAL: Jejaki Animisme dan Dinamisme.",
  q:"Apakah kepercayaan awal masyarakat Kerajaan Alam Melayu?",
  options:["Animisme dan Dinamisme","Hindu dan Islam","Buddha dan Islam","Hindu dan Kristian"],answer:0},
 {mission:"LEVEL 2 — HINDU & BUDDHA: Jejaki pengaruh agama Hindu dan Buddha.",
  q:"Selepas kepercayaan awal, masyarakat Alam Melayu menerima pengaruh agama...",
  options:["Hindu dan Buddha","Islam sahaja","Animisme sahaja","Kristian sahaja"],answer:0},
 {mission:"LEVEL 3 — ISLAM: Teruskan perjalanan menelusuri penerimaan agama Islam.",
  q:"Agama yang kemudiannya turut diterima oleh masyarakat Kerajaan Alam Melayu ialah...",
  options:["Islam","Shinto","Yahudi","Taoisme"],answer:0},
 {mission:"LEVEL 4 — JEJAK WARISAN: Gabungkan pengetahuan sepanjang perjalanan.",
  q:"Urutan umum perkembangan pegangan yang dipelajari dalam Bab 4.1 ialah...",
  options:["Islam → Hindu → Animisme","Kepercayaan awal → Hindu/Buddha → Islam","Buddha → Islam → Animisme","Hindu → Dinamisme → Islam"],answer:1}
];

let level=0,score=0,lives=3,running=false;
let player={x:1,y:1},dots=new Set(),enemies=[];

const scoreEl=document.getElementById("score");
const lifeEl=document.getElementById("life");
const levelEl=document.getElementById("level");

function id(x,y){return `${x},${y}`}
function isWall(x,y){return !MAP[y] || MAP[y][x]==="#"}
function updateHUD(){scoreEl.textContent=score;lifeEl.textContent=lives;levelEl.textContent=level+1}

function setupLevel(){
 player={x:1,y:1};
 dots=new Set();
 for(let y=0;y<MAP.length;y++){
   for(let x=0;x<MAP[y].length;x++){
     if(MAP[y][x]==="." && (x+y)%3===0) dots.add(id(x,y));
   }
 }
 enemies=[{x:16,y:16},{x:16,y:1},{x:1,y:16}];
 document.getElementById("mission").textContent=levels[level].mission;
 updateHUD(); draw();
}

function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 for(let y=0;y<18;y++){
  for(let x=0;x<18;x++){
   if(isWall(x,y)){
    ctx.fillStyle="#573574";
    ctx.fillRect(x*TILE+2,y*TILE+2,TILE-4,TILE-4);
    ctx.strokeStyle="#b58bd6"; ctx.strokeRect(x*TILE+5,y*TILE+5,TILE-10,TILE-10);
   }
  }
 }
 ctx.fillStyle="#ffd86b";
 dots.forEach(k=>{
  const [x,y]=k.split(",").map(Number);
  ctx.beginPath();ctx.arc(x*TILE+17.5,y*TILE+17.5,4,0,Math.PI*2);ctx.fill();
 });
 ctx.font="25px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.fillText("📜",player.x*TILE+17.5,player.y*TILE+18);
 enemies.forEach((e,i)=>ctx.fillText(i===0?"🌫️":"👤",e.x*TILE+17.5,e.y*TILE+18));
}

function move(dx,dy){
 if(!running)return;
 const nx=player.x+dx,ny=player.y+dy;
 if(isWall(nx,ny))return;
 player.x=nx;player.y=ny;
 if(dots.delete(id(nx,ny))){score+=10;updateHUD()}
 moveEnemies(); checkHit(); draw();
 if(dots.size===0)showQuiz();
}

function moveEnemies(){
 enemies.forEach(e=>{
  const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>!isWall(e.x+d[0],e.y+d[1]));
  opts.sort((a,b)=>
   Math.abs(e.x+a[0]-player.x)+Math.abs(e.y+a[1]-player.y)-
   (Math.abs(e.x+b[0]-player.x)+Math.abs(e.y+b[1]-player.y)));
  const d=Math.random()<0.7?opts[0]:opts[Math.floor(Math.random()*opts.length)];
  if(d){e.x+=d[0];e.y+=d[1]}
 });
}

function checkHit(){
 if(enemies.some(e=>e.x===player.x&&e.y===player.y)){
  lives--;player={x:1,y:1};updateHUD();
  if(lives<=0){lives=3;score=Math.max(0,score-50);setupLevel()}
 }
}

function showQuiz(){
 running=false;
 const L=levels[level];
 document.getElementById("question").textContent=L.q;
 const area=document.getElementById("answers");area.innerHTML="";
 L.options.forEach((opt,i)=>{
  const b=document.createElement("button");
  b.textContent=String.fromCharCode(65+i)+". "+opt;
  b.onclick=()=>{
   if(i===L.answer){
    score+=100;document.getElementById("quiz").classList.add("hidden");
    level++;
    if(level>=levels.length){
      document.getElementById("finalScore").textContent=score;
      document.getElementById("finish").classList.remove("hidden");
    }else{setupLevel();running=true}
   }else{
    lives--;updateHUD();b.disabled=true;b.textContent+="  ✗ Cuba lagi";
    if(lives<=0){lives=3;score=Math.max(0,score-50);updateHUD()}
   }
  };
  area.appendChild(b);
 });
 document.getElementById("quiz").classList.remove("hidden");
}

document.getElementById("start").onclick=()=>{
 document.getElementById("intro").classList.add("hidden");
 running=true;setupLevel();
};

addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if(k==="arrowup"||k==="w")move(0,-1);
 if(k==="arrowdown"||k==="s")move(0,1);
 if(k==="arrowleft"||k==="a")move(-1,0);
 if(k==="arrowright"||k==="d")move(1,0);
});

document.querySelectorAll("[data-dir]").forEach(b=>{
 b.onclick=()=>{
  const d=b.dataset.dir;
  if(d==="up")move(0,-1); if(d==="down")move(0,1);
  if(d==="left")move(-1,0); if(d==="right")move(1,0);
 };
});
setupLevel();
