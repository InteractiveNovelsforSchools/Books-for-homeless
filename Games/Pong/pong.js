const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

//Pause
let paused = false;

// Ball
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 8,
  dx: 4,
  dy: 4,
  speed: 4
};

// Paddles
let paddleLeft = { x: 10, y: 100, width: 10, height: 80, dy: 6 };
let paddleRight = { x: canvas.width - 20, y: 100, width: 10, height: 80, dy: 6 };

// Player input
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "p" && !gameOver) {
    // toggle pause
    paused = !paused;

    if (paused) {
      // just stop the ball and stop countdown
      ball.dx = 0;
      ball.dy = 0;
      if (countdownTimer) clearInterval(countdownTimer);
    } else {
      // on unpause, always reset ball to center and restart countdown
      resetBall();
    }
  }
});

// Scores
let scoreLeft = 0;
let scoreRight = 0;

//Countdown
let countdown = 0;
let countdownText = "";
let countdownTimer = null;

function startCountdown() {
  countdown = 3;
  countdownText = "3";

  countdownTimer = setInterval(() => {
    countdown--;

    if (countdown > 0) {
      countdownText = countdown.toString();
    } else if (countdown === 0) {
      countdownText = "GO!";
    } else {
      clearInterval(countdownTimer);
      countdownText = "";
    }
  }, 1000);
}


// Win condition
const WIN_SCORE = 7;
let gameOver = false;

function movePaddles() {
if (paused || gameOver) return;

  if (keys["w"]) paddleLeft.y -= paddleLeft.dy;
  if (keys["s"]) paddleLeft.y += paddleLeft.dy;

  if (keys["ArrowUp"]) paddleRight.y -= paddleRight.dy;
  if (keys["ArrowDown"]) paddleRight.y += paddleRight.dy;

  // Keep paddles on screen
  paddleLeft.y = Math.max(0, Math.min(canvas.height - paddleLeft.height, paddleLeft.y));
  paddleRight.y = Math.max(0, Math.min(canvas.height - paddleRight.height, paddleRight.y));
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  ball.dx = 0;
  ball.dy = 0;

  // clear any old countdown
  if (countdownTimer) clearInterval(countdownTimer);
  countdownText = "";
  countdown = 3;

  startCountdown();

  setTimeout(() => {
    if (paused || gameOver) return; // don't launch if paused or game over

    ball.speed = 4;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  }, 4000);
}



function checkWin() {
  if (scoreLeft >= WIN_SCORE) {
    gameOver = true;
    return "Left Player Wins!";
  }
  if (scoreRight >= WIN_SCORE) {
    gameOver = true;
    return "Right Player Wins!";
  }
  return null;
}

function moveBall() {
 if (paused || gameOver) return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Bounce top/bottom
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.dy *= -1;
  }

  // Left paddle collision
  if (
    ball.x - ball.radius < paddleLeft.x + paddleLeft.width &&
    ball.y > paddleLeft.y &&
    ball.y < paddleLeft.y + paddleLeft.height
  ) {
    ball.dx
    ball.dx *= -1;

    // Increase speed
    ball.speed += 0.5;
    ball.dx = Math.sign(ball.dx) * ball.speed;
    ball.dy = Math.sign(ball.dy) * ball.speed;
  }

  // Right paddle collision
  if (
    ball.x + ball.radius > paddleRight.x &&
    ball.y > paddleRight.y &&
    ball.y < paddleRight.y + paddleRight.height
  ) {
    ball.dx *= -1;

    // Increase speed
    ball.speed += 0.5;
    ball.dx = Math.sign(ball.dx) * ball.speed;
    ball.dy = Math.sign(ball.dy) * ball.speed;
  }

  // Score left or right
  if (ball.x < 0) {
    scoreRight++;
    resetBall();
  }

  if (ball.x > canvas.width) {
    scoreLeft++;
    resetBall();
  }
}

function drawScores() {
  ctx.fillStyle = "white";
 ctx.font = "20px 'Press Start 2P'";
  ctx.fillText(scoreLeft, canvas.width / 4, 30);
  ctx.fillText(scoreRight, canvas.width * 3 / 4, 30);
}

function drawWinScreen(message) {
  ctx.fillStyle = "white";
  ctx.font = "24px 'Press Start 2P'";

  // Measure text width to center it
  let textWidth = ctx.measureText(message).width;
  ctx.fillText(message, (canvas.width - textWidth) / 2, canvas.height / 2);

  ctx.font = "16px 'Press Start 2P'";
  let restartText = "Press SPACE to restart";
  let restartWidth = ctx.measureText(restartText).width;
  ctx.fillText(restartText, (canvas.width - restartWidth) / 2, canvas.height / 2 + 40);
}


document.addEventListener("keydown", e => {
  if (gameOver && e.code === "Space") {
    scoreLeft = 0;
    scoreRight = 0;
    gameOver = false;
    resetBall();
  }
});

function drawScanlines() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

function drawVignette() {
  let gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 50,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.2
  );

  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.4)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply CRT curvature
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(1.05, 1.02);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Center dashed line
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ball (pixel square)
  ctx.fillStyle = "white";
  ctx.fillRect(
    Math.floor(ball.x - ball.radius),
    Math.floor(ball.y - ball.radius),
    ball.radius * 2,
    ball.radius * 2
  );

  // Paddles
  ctx.fillRect(paddleLeft.x, paddleLeft.y, paddleLeft.width, paddleLeft.height);
  ctx.fillRect(paddleRight.x, paddleRight.y, paddleRight.width, paddleRight.height);

  // Scores
  ctx.fillStyle = "white";
  ctx.font = "20px 'Press Start 2P'";
  let leftW = ctx.measureText(scoreLeft).width;
  let rightW = ctx.measureText(scoreRight).width;
  ctx.fillText(scoreLeft, canvas.width / 4 - leftW / 2, 40);
  ctx.fillText(scoreRight, canvas.width * 3 / 4 - rightW / 2, 40);

  // Countdown
  if (countdownText !== "") {
    ctx.font = "32px 'Press Start 2P'";
    let w = ctx.measureText(countdownText).width;
    ctx.fillText(countdownText, (canvas.width - w) / 2, canvas.height / 2);
  }

  // PAUSE SCREEN — must come BEFORE scanlines/vignette
  if (paused) {
    ctx.fillStyle = "white";
    ctx.font = "24px 'Press Start 2P'";
    let msg = "PAUSED";
    let w = ctx.measureText(msg).width;
    ctx.fillText(msg, (canvas.width - w) / 2, canvas.height / 2);

    ctx.restore(); // undo curvature
    return;        // STOP — do NOT draw scanlines or vignette
  }

  // WIN SCREEN
  const winMessage = checkWin();
  if (winMessage) {
    ctx.fillStyle = "white";
    ctx.font = "24px 'Press Start 2P'";
    let w = ctx.measureText(winMessage).width;
    ctx.fillText(winMessage, (canvas.width - w) / 2, canvas.height / 2);

    ctx.font = "16px 'Press Start 2P'";
    let restart = "Press SPACE to restart";
    let rw = ctx.measureText(restart).width;
    ctx.fillText(restart, (canvas.width - rw) / 2, canvas.height / 2 + 40);

    ctx.restore();
    return;
  }

  // CRT scanlines
  drawScanlines();

  // CRT vignette
  drawVignette();

  ctx.restore(); // undo curvature
}

function loop() {
  movePaddles();
  moveBall();
  draw();
  requestAnimationFrame(loop);
}

loop();