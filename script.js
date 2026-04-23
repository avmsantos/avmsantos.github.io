const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const STATE_START = 0;
const STATE_PLAYING = 1;
const STATE_GAMEOVER = 2;
let gameState = STATE_START;

function resize() {
    const ratio = 9 / 16;
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w / h > ratio) w = h * ratio;
    else h = w / ratio;
    canvas.width = 400;
    canvas.height = 700;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
}
window.addEventListener('resize', resize);
resize();

let birdX = 50, birdY = 350, gravity = 0.4, velocity = 0, jump = -7;
let score = 0, frames = 0, pipes = [];
let pipeGap = 180;

function createPipe() {
    let minH = 100;
    let maxH = canvas.height - pipeGap - minH;
    let topHeight = Math.random() * (maxH - minH) + minH;
    pipes.push({ x: canvas.width, top: topHeight, passed: false });
}

function drawBird() {
    ctx.save();
    ctx.translate(birdX + 20, birdY + 20);
    let rotation = (gameState === STATE_PLAYING) ? Math.min(Math.PI/4, Math.max(-Math.PI/4, velocity * 0.05)) : 0;
    ctx.rotate(rotation);
    ctx.fillStyle = "#f1c40f"; ctx.fillRect(-20, -20, 40, 40);
    ctx.fillStyle = "#f39c12"; ctx.fillRect(-25, -5, 20, 15);
    ctx.fillStyle = "#e67e22"; ctx.fillRect(15, 0, 15, 12);
    ctx.fillStyle = "white"; ctx.fillRect(5, -12, 10, 10);
    ctx.fillStyle = "black"; ctx.fillRect(10, -9, 5, 5);
    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = "#795548";
        ctx.fillRect(pipe.x, 0, 60, pipe.top);
        ctx.fillRect(pipe.x, pipe.top + pipeGap, 60, canvas.height);
    });
}

function drawBackground() {
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#4facfe"); grad.addColorStop(1, "#00f2fe");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    [ {x: 80, y: 100, r: 30}, {x: 320, y: 200, r: 25} ].forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill();
    });
}

function update() {
    if (gameState !== STATE_PLAYING) {
        if (gameState === STATE_START) {
            birdY = 350 + Math.sin(frames * 0.1) * 10;
            frames++;
        }
        return;
    }
    frames++;
    if (frames % 90 === 0) createPipe();
    velocity += gravity;
    birdY += velocity;
    pipes.forEach(pipe => {
        pipe.x -= 3.5;
        if (birdX + 35 > pipe.x && birdX + 5 < pipe.x + 60) {
            if (birdY + 5 < pipe.top || birdY + 35 > pipe.top + pipeGap) gameState = STATE_GAMEOVER;
        }
        if (!pipe.passed && pipe.x < birdX) { score++; pipe.passed = true; }
    });
    if (birdY + 40 > canvas.height || birdY < 0) gameState = STATE_GAMEOVER;
    pipes = pipes.filter(p => p.x > -100);
}

function draw() {
    drawBackground();
    drawPipes();
    drawBird();
    ctx.fillStyle = "white"; ctx.strokeStyle = "black"; ctx.lineWidth = 4;
    ctx.font = "bold 60px sans-serif"; ctx.textAlign = "center";
    if (gameState !== STATE_START) {
        ctx.strokeText(score, canvas.width/2, 100);
        ctx.fillText(score, canvas.width/2, 100);
    }
    if (gameState === STATE_START) {
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; ctx.font = "bold 40px sans-serif";
        ctx.fillText("Pula Passarinho", canvas.width/2, canvas.height/2 - 50);
        ctx.fillText("Amanda ", canvas.width/2, canvas.height/2 - 90);
        ctx.font = "24px sans-serif"; ctx.fillText("Toque para Iniciar", canvas.width/2, canvas.height/2 + 20);
    }
    if (gameState === STATE_GAMEOVER) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; ctx.font = "bold 40px sans-serif";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 20);
        ctx.font = "24px sans-serif"; ctx.fillText("Toque para Tentar de Novo", canvas.width/2, canvas.height/2 + 40);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function handleInput(e) {
    if(e) e.preventDefault();
    if (gameState === STATE_START) {
        gameState = STATE_PLAYING;
        velocity = jump;
    } else if (gameState === STATE_PLAYING) {
        velocity = jump;
    } else if (gameState === STATE_GAMEOVER) {
        birdY = 350; velocity = 0; score = 0; pipes = []; frames = 0;
        gameState = STATE_START;
    }
}

window.addEventListener("keydown", (e) => { if(e.code === "Space") handleInput(e); });
canvas.addEventListener("touchstart", handleInput, {passive: false});
canvas.addEventListener("mousedown", (e) => { if(e.button === 0) handleInput(e); });

loop();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
