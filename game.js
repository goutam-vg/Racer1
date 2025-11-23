const playerImg = new Image();
playerImg.src = "personA.png";

const obstacleImg = new Image();
obstacleImg.src = "personB.png";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgAudio = document.getElementById("bgAudio");
const crashAudio = document.getElementById("crashAudio");

const restartBtn = document.getElementById('restartBtn');
const menu = document.getElementById('menu');
const newGameBtn = document.getElementById('newGameBtn');
const resumeBtn = document.getElementById('resumeBtn');
const exitBtn = document.getElementById('exitBtn');

let scoreDisplay = document.getElementById("score");
let levelDisplay = document.getElementById("level");

let keys = {};
let carSize = 70;
let carX = canvas.width / 2 - carSize / 2;
let carY = canvas.height - carSize - 20;

let obstacles = [];
let score = 0;
let level = 1;
let speed = 4;
let paused = true;
let gameOver = false;
let spawnInterval;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function drawCar() {
  ctx.drawImage(playerImg, carX, carY, carSize, carSize);
}

function drawObstacles() {
  obstacles.forEach(o => {
    ctx.drawImage(obstacleImg, o.x, o.y, o.size, o.size);
  });
}

function spawnObstacle() {
  const size = 60;
  const x = Math.random() * (canvas.width - size);
  obstacles.push({ x, y: -size, size });
}

function update() {
  if (paused || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move Player
  if (keys["ArrowLeft"] && carX > 0) carX -= 6;
  if (keys["ArrowRight"] && carX < canvas.width - carSize) carX += 6;

  // Move obstacles
  obstacles.forEach(o => o.y += speed);

  // Remove old obstacles + score
  obstacles = obstacles.filter(o => {
    if (o.y > canvas.height) {
      score++;
      scoreDisplay.textContent = "Score: " + score;

      // Smooth Level & Speed Increase
      if (score % 10 === 0) {
        level++;
        levelDisplay.textContent = "Level: " + level;
        speed += 0.3;
      }
      return false;
    }
    return true;
  });

  drawCar();
  drawObstacles();

  // Collision detection
  for (let o of obstacles) {
    if (o.y + o.size > carY &&
        o.x < carX + carSize &&
        o.x + o.size > carX) {
      
      gameOver = true;

      // Crash sound
      crashAudio.currentTime = 0;
      crashAudio.play().catch(()=>{});

      // Stop bg music
      bgAudio.pause();

      ctx.fillStyle = "red";
      ctx.font = "40px Arial";
      ctx.fillText("GAME OVER", canvas.width/2 - 120, canvas.height/2);
      clearInterval(spawnInterval);
      resumeBtn.disabled = true;
    }
  }
  requestAnimationFrame(update);
}

function startGame() {
  menu.style.display = "none";
  paused = false;
  gameOver = false;
  score = 0;
  level = 1;
  speed = 4;

  scoreDisplay.textContent = "Score: " + score;
  levelDisplay.textContent = "Level: " + level;

  carX = canvas.width / 2 - carSize / 2;
  obstacles = [];

  // Play background music only after user clicked
  bgAudio.currentTime = 0;
  bgAudio.play().catch(()=>{});

  spawnInterval = setInterval(spawnObstacle, 1200);

  update();
}

newGameBtn.onclick = startGame;
restartBtn.onclick = startGame;
exitBtn.onclick = () => location.reload();
resumeBtn.onclick = () => { paused = false; menu.style.display = "none"; update(); };

document.addEventListener("keydown", e => {
  if (e.key === " " && !gameOver) {
    paused = !paused;
    menu.style.display = paused ? "block" : "none";
    if (!paused) update();
  }
});
