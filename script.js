"use strict";
// /** @type {CanvasRenderingContext2D} */
// the line below help the VSC to know what is the context is ! , the canvas element belongs to HTML
// without this line, everything will work well, but without intellisense in VSC
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//const theGradient = ctx.createLinearGradient(0, 0,0, 0);

const scorePanel = document.getElementById("score");
const hitsPanel = document.getElementById("hits");
const btn = document.getElementById("btn");
/* ----constants ---- */
const PI = 2 * Math.PI;
const BALL_RADIUS = 20;
const BALL_SPEED = 10;

const BALL_COLOR = "#C86400";
const PADEL_COLOR = "#005C01";
const BRICKS_COLOR = "#870000";

const PADEL_WIDTH = 100;
const PADEL_HEIGHT = 20;
const PADEL_SPEED = 15;

const BRICKS_PADDING = 40;
const BRICKS_WIDTH = 80;
const BRICKS_HEIGHT = 20;
const BRICKS_OFFSET = 30;

const GAME_TIMER = 25;
const STEP = 5;
/* ---- initialization */
const BricksArray = [];
let BrickX = 0,
  BrickY = 0;

let interval;
let score = 0,
  hits = 0;
let canvasH = canvas.height;
let canvasW = canvas.width;
let ballX, ballY;
let dx = 5,
  dy = 5;

let leftKeyPressed = false,
  rightKeyPressed = false;
let padelX = canvasW / 2 - PADEL_WIDTH / 2;
let padelY = canvasH - PADEL_HEIGHT - 2;
ballX = canvasW / 2;
ballY = canvasH - (BALL_RADIUS + PADEL_WIDTH);

// create explosion sound
let pingSound = document.createElement("audio");
pingSound.src = "./ping.wav";
pingSound.setAttribute("controls", "none");
pingSound.setAttribute("preload", "auto");
pingSound.style.display = "none";
pingSound.volume = 0.5;
scorePanel.append(pingSound);

/* ---- controlling init */
document.addEventListener("keydown", ctrlKeyDown);
document.addEventListener("keyup", ctrlKeyUp);

function ctrlKeyDown(e) {
  if (e.key == "ArrowRight") rightKeyPressed = true;
  if (e.key == "ArrowLeft") leftKeyPressed = true;
  /* 
  if (padelX + PADEL_WIDTH + 10 < canvasW) {
    if (e.key == "ArrowRight") padelX = padelX + PADEL_SPEED;
  }
  if (padelX > 10) {
    if (e.key == "ArrowLeft") padelX = padelX - PADEL_SPEED;
  }
   */
}
function ctrlKeyUp(e) {
  if (e.key == "ArrowRight") rightKeyPressed = false;
  if (e.key == "ArrowLeft") leftKeyPressed = false;
}

function drawBall() {
  ballX = ballX + dx;
  ballY = ballY + dy;
  ctx.beginPath();
  ctx.fillStyle = BALL_COLOR;
  ctx.arc(ballX, ballY, BALL_RADIUS, 0, PI, false);
  ctx.fill();
  ctx.closePath();
}

function drawPadel() {
  ctx.beginPath();
  ctx.fillStyle = PADEL_COLOR;
  ctx.rect(padelX, padelY, PADEL_WIDTH, PADEL_HEIGHT);
  ctx.fill();
  ctx.closePath();
}

function createBricks() {
  for (let j = 0; j < 3; j++) {
    BricksArray[j] = [];
    for (let i = 0; i < 5; i++) {
      BrickX = BRICKS_PADDING + (BRICKS_WIDTH + BRICKS_OFFSET) * i;
      BrickY = BRICKS_PADDING + (BRICKS_HEIGHT + BRICKS_OFFSET) * j;
      BricksArray[j][i] = { x: BrickX, y: BrickY, visible: true };
    }
  }
  //   console.log(BricksArray)
}
function drawBricks() {
  for (let j = 0; j < BricksArray.length; j++) {
    for (let i = 0; i < BricksArray[j].length; i++) {
      if (BricksArray[j][i].visible) {
        ctx.beginPath();
        ctx.fillStyle = BRICKS_COLOR;
        BrickX = BricksArray[j][i].x;
        BrickY = BricksArray[j][i].y;
        ctx.fillRect(BrickX, BrickY, BRICKS_WIDTH, BRICKS_HEIGHT);
        ctx.closePath();
      }
    }
  }
}
function collisionDetection() {
  /* calc collision for canvas borders */
  if (ballX <= BALL_RADIUS) {
    // that's mean left border 0px including ball size
    dx = +STEP;
  }
  if (ballY <= BALL_RADIUS) {
    // that's mean top border 0px including ball size
    dy = +STEP;
  }
  if (ballX + BALL_RADIUS > canvasW) {
    dx = -STEP;
  }
  if (ballY + BALL_RADIUS > canvasH) {
    //dy = -STEP;
    gameResult("lose");
  }
  /* calc collision for Padel */
  //   if (ballX + BALL_RADIUS > padelX + PADEL_WIDTH) {
  //     dx = -STEP;
  //   }
  if (
    ballY + BALL_RADIUS >= padelY &&
    ballX + BALL_RADIUS >= padelX &&
    ballX + BALL_RADIUS <= padelX + PADEL_WIDTH + STEP
  ) {
    dy = -STEP;
    // to make randomization effect with ball movement
      dx = dx + (ballX + dx - padelX) / 100;
    hits += 1;
  }
  /* collision of Bricks */
  for (let j = 0; j < BricksArray.length; j++) {
    for (let i = 0; i < BricksArray[j].length; i++) {
      if (BricksArray[j][i].visible == true) {
        BrickX = BricksArray[j][i].x;
        BrickY = BricksArray[j][i].y;
        //console.log(`BrickX: ${BrickX} - BrickY: ${BrickY} - Visible: ${BricksArray[j][i].visible}`);
        if (BrickY + BRICKS_HEIGHT >= ballY - BALL_RADIUS) {
          //  console.log(`BrickX: ${BrickX} - BrickY: ${BrickY}`);
          if (
            BrickX <= ballX + BALL_RADIUS &&
            BrickX + BRICKS_WIDTH >= ballX + BALL_RADIUS
          ) {
            // console.log(`BrickX: ${BrickX} - BrickY: ${BrickY}`);
            dy = +STEP;
            BricksArray[j][i].visible = false;
            score += 1;
            pingSound.play();
            /* 
            console.log(
              `BrickX: ${BrickX} - BrickY: ${BrickY} - Visible: ${BricksArray[j][i].visible}`
            );
 */
          }
        }

        //BricksArray[j][i].visible = false;
      }
    }
  }
}
function gameController() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  if (rightKeyPressed) {
    padelX = padelX + PADEL_SPEED;
  }
  if (leftKeyPressed) {
    padelX = padelX - PADEL_SPEED;
  }
  collisionDetection();
  drawBall();
  drawPadel();
  drawBricks();
  recordsUpdate();
}
function gameResult(result) {
  //theGradient.addColorStop(1, "#870000");
  //theGradient.addColorStop(0, "#F39C12");
  ctx.font = "70px Tahoma";
  ctx.lineWidth = 10;
  //   ctx.strokeStyle = theGradient;
  //ctx.fillStyle = theGradient;

  switch (result) {
    case "win":
      clearInterval(interval);

      ctx.fillText("You WON !", canvasW * 0.25, canvasH / 2);
      break;
    case "lose":
      clearInterval(interval);

      ctx.fillText("Game Over", canvasW * 0.25, canvasH / 2);
      break;
  }
}
function recordsUpdate() {
  scorePanel.innerText = `Socre: ${score}`;
  hitsPanel.innerText = `Hits: ${hits}`;
  if (score >= 15) {
    // player won
    gameResult("win");
  }
}
function startGame() {
  padelX = canvasW / 2 - PADEL_WIDTH / 2;
  padelY = canvasH - PADEL_HEIGHT - 2;
  ballX = canvasW / 2;
  ballY = canvasH - (BALL_RADIUS + PADEL_WIDTH);
  dy = -STEP;
  clearInterval(interval);
  score = 0;
  hits = 0;
  if (btn.value == "Start") {
    btn.value = "Stop";
    createBricks();

    interval = setInterval(gameController, GAME_TIMER);
  } else {
    btn.value = "Start";
    clearInterval(interval);
  }
}
