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

let balls = [
  {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: ballRadius,
    dx: 2,
    dy: -2,
  },
];

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
      brickArray[row][column] = { x: 0, y: 0, status: 1, special: false };
    }
  }

  // Add 3 random red bricks
  for (let i = 0; i < 3; i++) {
    const randomRow = Math.floor(Math.random() * bricks.rows);
    const randomColumn = Math.floor(Math.random() * bricks.columns);
    brickArray[randomRow][randomColumn].special = true;
  }
}

initializeBricks();

let score = 0;
let lives = 3;
let rightPressed = false;
let leftPressed = false;

// 3. Create a function to draw the game elements
function drawBall(ball) {
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
        ctx.fillStyle = brickArray[r][c].special ? "red" : "green";
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

function createAdditionalBall(x, y) {
  const newBall = {
    x: x,
    y: y,
    radius: ballRadius,
    dx: Math.random() * 4 - 2, // Random horizontal speed between -2 and 2
    dy: -(Math.random() * 2 + 2), // Random upward vertical speed between -2 and -4
  };
  return newBall;
}

// 4. Event listeners for user input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// 5. Collision detection
function collisionDetection() {
  for (let r = 0; r < bricks.rows; r++) {
    for (let c = 0; c < bricks.columns; c++) {
      let b = brickArray[r][c];
      if (b.status == 1) {
        balls.forEach((ball, ballIndex) => {
          if (
            ball.x > b.x &&
            ball.x < b.x + bricks.width &&
            ball.y > b.y &&
            ball.y < b.y + bricks.height
          ) {
            ball.dy = -ball.dy;
            b.status = 0;

            if (b.special) {
              const newBall1 = createAdditionalBall(b.x, b.y);
              const newBall2 = createAdditionalBall(b.x, b.y);
              balls.push(newBall1);
              balls.push(newBall2);
            }

            score++;
            if (score == bricks.rows * bricks.columns) {
              alert("YOU WIN, CONGRATULATIONS!");
              document.location.reload();
            }
          }
        });
      }
    }
  }
}

// 6. Main game loop
function checkBallOutOfBounds(ball) {
  if (ball.y + ball.dy > canvas.height - ball.radius) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      ball.dy = -ball.dy;
    } else {
      return true;
    }
  }
  return false;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  balls.forEach((ball) => {
    drawBall(ball);
  });
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  balls = balls.filter((ball) => {
    if (
      ball.x + ball.dx > canvas.width - ball.radius ||
      ball.x + ball.dx < ball.radius
    ) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    }

    if (checkBallOutOfBounds(ball)) {
      return false;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;
    return true;
  });

  if (balls.length === 0) {
    lives--;
    if (!lives) {
      alert("Game Over");
      document.location.reload();
    } else {
      const newBall = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        radius: ballRadius,
        dx: 2,
        dy: -2,
      };
      balls.push(newBall);
      paddle.x = (canvas.width - paddle.width) / 2;
    }
  }

  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += paddle.dx;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }

  requestAnimationFrame(draw);
}

draw();
