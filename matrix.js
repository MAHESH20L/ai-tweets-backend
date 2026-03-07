const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
const particles = [];

const totalParticles = 140;

for(let i=0;i<totalParticles;i++){

particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
speed:0.5+Math.random()*2,
size:14+Math.random()*30,
char:letters[Math.floor(Math.random()*letters.length)],
opacity:0.15+Math.random()*0.6
});

}

function draw(){

ctx.fillStyle="rgba(60,60,60,0.25)";
ctx.fillRect(0,0,canvas.width,canvas.height);

particles.forEach(p=>{

ctx.fillStyle=`rgba(0,255,120,${p.opacity})`;
ctx.font=p.size+"px monospace";

ctx.fillText(p.char,p.x,p.y);

p.y+=p.speed;

if(p.y>canvas.height){

p.y=-20;
p.x=Math.random()*canvas.width;

p.char=letters[Math.floor(Math.random()*letters.length)];

}

});

}

setInterval(draw,30);

window.addEventListener("resize",()=>{

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

});