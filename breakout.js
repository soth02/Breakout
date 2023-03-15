// 1. the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set the canvas size based on the window size
function setCanvasSize() {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;
  const aspectRatio = 480 / 320;

  if (maxWidth / maxHeight > aspectRatio) {
    canvas.width = maxHeight * aspectRatio;
    canvas.height = maxHeight;
  } else {
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
  }
}

// Call setCanvasSize to set the initial canvas size
setCanvasSize();

// Handle window resize events
window.addEventListener("resize", () => {
  setCanvasSize();
});

// Define game elements using relative units
const ballRadius = canvas.width * 0.02;
const paddleHeight = canvas.height * 0.03;
const paddleWidth = canvas.width * 0.2;
const paddleX = (canvas.width - paddleWidth) / 2;

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  dx: 2,
  dy: -2,
  radius: ballRadius,
};

const paddle = {
  x: paddleX,
  y: canvas.height - paddleHeight,
  width: paddleWidth,
  height: paddleHeight,
  dx: 7,
};

const bricks = {
  rows: 3,
  columns: 5,
  width: canvas.width * 0.18,
  height: canvas.height * 0.06,
  padding: canvas.width * 0.02,
  marginTop: canvas.height * 0.1,
  marginLeft: canvas.width * 0.04,
};

// Initialize brick array
const brickArray = [];

function initializeBricks() {
  for (let row = 0; row < bricks.rows; row++) {
    brickArray[row] = [];
    for (let column = 0; column < bricks.columns; column++) {
      brickArray[row][column] = { x: 0, y: 0, status: 1 };
    }
  }
}

initializeBricks();

let score = 0;
let lives = 3;
let rightPressed = false;
let leftPressed = false;

// 3. Create a function to draw the game elements
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(
    paddle.x,
    canvas.height - paddle.height,
    paddle.width,
    paddle.height
  );
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let r = 0; r < bricks.rows; r++) {
    for (let c = 0; c < bricks.columns; c++) {
      if (brickArray[r][c].status === 1) {
        let brickX = c * (bricks.width + bricks.padding) + bricks.marginLeft;
        let brickY = r * (bricks.height + bricks.padding) + bricks.marginTop;
        brickArray[r][c].x = brickX;
        brickArray[r][c].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, bricks.width, bricks.height);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawBricks();
  drawScore();
  drawLives();
}

// 4. Create a function to update the game elements
function updateBallPosition() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

function updatePaddlePosition() {
  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += paddle.dx;
  }
  if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

function detectCollisions() {
  // Ball-wall collisions
  if (
    ball.x + ball.dx < ball.radius ||
    ball.x + ball.dx > canvas.width - ball.radius
  ) {
    ball.dx = -ball.dx;
  }
  if (ball.y + ball.dy < ball.radius) {
    ball.dy = -ball.dy;
  } else if (ball.y + ball.dy > canvas.height - ball.radius) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      ball.dy = -ball.dy;
    } else {
      lives--;
      if (!lives) {
        alert("Game Over");
        document.location.reload();
      } else {
        resetBallAndPaddle();
      }
    }
  }

  // Ball-brick collisions
  for (let r = 0; r < bricks.rows; r++) {
    for (let c = 0; c < bricks.columns; c++) {
      let brick = brickArray[r][c];
      if (brick.status === 1) {
        if (
          ball.x > brick.x &&
          ball.x < brick.x + bricks.width &&
          ball.y > brick.y &&
          ball.y < brick.y + bricks.height
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
          score++;
          if (score === bricks.rows * bricks.columns) {
            alert("Congratulations, you won!");
            document.location.reload();
          }
        }
      }
    }
  }
}

// 7. Create a function to reset the ball and paddle position
function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  ball.dx = 2;
  ball.dy = -2;
  paddle.x = (canvas.width - paddle.width) / 2;
}

// 8. Create a function for the game loop
function gameLoop() {
  updateBallPosition();
  updatePaddlePosition();
  detectCollisions();
  draw();
  requestAnimationFrame(gameLoop);
}

// 9. Add event listeners for keyboard input
function handleKeyDown(event) {
  if (event.key === "ArrowRight") {
    rightPressed = true;
  } else if (event.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowRight") {
    rightPressed = false;
  } else if (event.key === "ArrowLeft") {
    leftPressed = false;
  }
}

let initialTouchX;

function handleTouchStart(event) {
  event.preventDefault();
  initialTouchX = event.touches[0].clientX;
}

function handleTouchMove(event) {
  event.preventDefault();

  const touchX = event.touches[0].clientX;
  const deltaX = touchX - initialTouchX;
  paddle.x += deltaX;
  initialTouchX = touchX;

  // Prevent the paddle from moving outside the canvas
  if (paddle.x < 0) {
    paddle.x = 0;
  } else if (paddle.x > canvas.width - paddle.width) {
    paddle.x = canvas.width - paddle.width;
  }
}

function handleTouchPress(event) {
  event.preventDefault();
  const touchX = event.touches[0].clientX;
  if (touchX < canvas.width / 2) {
    leftPressed = true;
  } else {
    rightPressed = true;
  }
}

function handleTouchEnd(event) {
  leftPressed = false;
  rightPressed = false;
}

canvas.addEventListener("touchstart", handleTouchPress, { passive: false });

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

// 10. Start the game loop
gameLoop();
