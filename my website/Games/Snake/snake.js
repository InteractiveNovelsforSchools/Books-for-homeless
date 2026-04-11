const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let box = 20;
let snake = [{ x: 10 * box, y: 10 * box }];
let direction = "RIGHT";

let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
document.getElementById("highscore").textContent = "High Score: " + highScore;

let grow = 0;
let paused = false;

// ----------------------
// SAFE FOOD SPAWN
// ----------------------
function spawnFood() {
  let newFood;
  let onSnake;

  do {
    newFood = {
      x: Math.floor(Math.random() * 19) * box,
      y: Math.floor(Math.random() * 19) * box
    };

    onSnake = snake.some(part => part.x === newFood.x && part.y === newFood.y);

  } while (onSnake);

  return newFood;
}

let food = spawnFood();

// ----------------------
// ROUNDED RECTANGLE
// ----------------------
function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// ----------------------
// CONTROLS
// ----------------------
document.addEventListener("keydown", event => {
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";

  if (event.code === "Space") {
    paused = !paused;
    document.getElementById("paused").style.display = paused ? "block" : "none";
  }
});

// ----------------------
// MAIN DRAW LOOP
// ----------------------
function draw() {
  if (paused) return;

  ctx.clearRect(0, 0, 400, 400);

  // Grid
  ctx.strokeStyle = "#333";
  for (let i = 0; i < 400; i += box) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 400);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(400, i);
    ctx.stroke();
  }

  // Food
  ctx.shadowColor = "red";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);
  ctx.shadowBlur = 0;

  // Snake
  snake.forEach(part => {
    ctx.shadowColor = "lime";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "lime";
    drawRoundedRect(part.x, part.y, box, box, 5);
    ctx.shadowBlur = 0;
  });

  // Movement
  let head = { ...snake[0] };

  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;

  // Wall collision
  if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
    alert("Game Over!");
    document.location.reload();
  }

  // Self-collision check (FIXED)
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      alert("Game Over!");
      document.location.reload();
    }
  }

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").textContent = "Score: " + score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
      document.getElementById("highscore").textContent = "High Score: " + highScore;
    }

    grow++;
    food = spawnFood();

  } else {
    if (grow > 0) {
      grow--;
    } else {
      snake.pop();
    }
  }

  snake.unshift(head);
}

setInterval(draw, 100);
