var fps = 1000;
var now;
var then = Date.now();
var interval = 10000 / fps;
var delta;
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth - 100
canvas.height = window.innerHeight - 100
var red = '#f1404b'

let board = []

const ratio = canvas.height / canvas.width

const base = Math.floor(canvas.width / 30)
const rows = Array.from(Array(Math.floor(base * ratio)).keys())
const columns = Array.from(Array(base).keys())
const getDirection = index => {
  if (index === 0) return 'u'
  if (index === columns.length - 1) return 'd'
  return 0
}

rows.forEach(row => {
  if (row === 0) {
    board.push(columns.map(col => col === columns.length - 1 ? 'd' : 'r'))
    return
  }
  if (row === rows.length - 1) {
    board.push(columns.map(col => col === 0 ? 'u' : 'l'))
    return
  }
  board.push(columns.map(col => getDirection(col)))
})

var startCoords = [rows.length - 1, 0];
var cell = {
  x: startCoords[0],
  y: startCoords[1]
};

var currCoords = [];
var targetPos = startCoords;
var targetCoords = [];
var half, blockSize;

function drawGrid() {
  var width = canvas.width;
  blockSize = width / board[0].length;
  var ctx = canvas.getContext('2d');

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, width);

  ctx.beginPath();
  ctx.fillStyle = '#a3daff';

  var grd=ctx.createRadialGradient(width/2,canvas.height/2,canvas.width/2,width/2, canvas.height/3, 0);
  grd.addColorStop(0,'#a3daff');
  grd.addColorStop(1,'white');
  ctx.fillStyle = grd;

  //Loop through the board array drawing the walls and the goal
  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      //Draw a wall
      if (board[y][x] != 0) {
        ctx.rect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
  }
  ctx.fill();

  half = blockSize / 2;
  targetCoords = [
    parseInt(targetPos[0] * blockSize + half),
    parseInt(targetPos[1] * blockSize + half)
  ];

  ctx.beginPath();
  ctx.fillStyle = red;
  ctx.strokeSize = '1';
  ctx.strokeStyle = red;

  // if no current coords, start at beginning
  if (currCoords.length === 0) {
    currCoords = [cell.x * blockSize + half, cell.y * blockSize + half];
    updateTargetPos();

    ctx.arc(currCoords[0] - half/4, currCoords[1], half/2, 0, 2 * Math.PI);

    ctx.fill();
  } else if (
    samePos(currCoords[0] - half/4, currCoords[1], targetCoords[0], targetCoords[1])
  ) {
    cell.x = targetPos[0];
    cell.y = targetPos[1];

    updateTargetPos();
    moveCurrCoords();

    ctx.arc(currCoords[0], currCoords[1], half/2, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    moveCurrCoords();

    ctx.arc(currCoords[0], currCoords[1], half/2, 0, 2 * Math.PI);
  }

  ctx.fill();
  ctx.stroke();
  window.requestAnimationFrame(drawGrid);
}

function samePos(pos1X, pos1Y, pos2X, pos2Y) {
  return absDifference(pos1X, pos2X) < 5 && absDifference(pos1Y, pos2Y) < 5;
}

function moveCurrCoords() {
  var direction = board[cell.y][cell.x];
  // if its r... u.. d..
  if (direction === 'r') {
    currCoords[0] = currCoords[0] + getAmountToMove('x');
  } else if (direction === 'd') {
    currCoords[1] = currCoords[1] + getAmountToMove('y');
  } else if (direction === 'l') {
    currCoords[0] = currCoords[0] - getAmountToMove('x');
  } else if (direction === 'u') {
    currCoords[1] = currCoords[1] - getAmountToMove('y');
  }
}

function absDifference(curr, target) {
  return Math.abs(Math.abs(target) - Math.abs(curr));
}

function getAmountToMove(axis) {
  var diff;

  if (axis == 'x') {
    var curr = cell.x * blockSize + half;
    diff = absDifference(curr, targetCoords[0]);
  } else {
    var curr = cell.y * blockSize + half;
    diff = absDifference(curr, targetCoords[1]);
  }
  return diff / 16;
}

function updateTargetPos() {
  var direction = board[cell.y][cell.x];

  // if its r... u.. d..
  if (direction === 'r') {
    targetPos[0] = targetPos[0] + 1;
  } else if (direction === 'd') {
    targetPos[1] = targetPos[1] + 1;
  } else if (direction === 'l') {
    targetPos[0] = targetPos[0] - 1;
  } else if (direction === 'u') {
    targetPos[1] = targetPos[1] - 1;
  }
}

// setTimeout(drawGrid, 2000);
drawGrid();
