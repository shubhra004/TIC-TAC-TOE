const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const aiPlayerBtn = document.getElementById("aiPlayerBtn");
const levelSelection = document.getElementById("levelSelection");
const levelBtns = document.querySelectorAll(".level-btn");
const boardElement = document.querySelector(".board");

let board;
let currentPlayer;
let gameActive;
let vsAI = false;
let aiLevel = "easy";

const winConditions = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

/* ============================= */
/* INITIAL STATE */
/* ============================= */

levelSelection.classList.add("hidden");
restartBtn.classList.add("hidden");

/* ============================= */
/* MODE BUTTONS */
/* ============================= */

twoPlayerBtn.addEventListener("click", () => {
    vsAI = false;
    levelSelection.classList.add("hidden");
    startGame();
});

aiPlayerBtn.addEventListener("click", () => {
    vsAI = true;
    levelSelection.classList.remove("hidden");
});

/* ============================= */
/* LEVEL BUTTONS */
/* ============================= */

levelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        aiLevel = btn.dataset.level;
        levelSelection.classList.add("hidden");
        startGame();
    });
});

/* ============================= */
/* START GAME */
/* ============================= */

function startGame() {

    board = ["","","","","","","","",""];
    currentPlayer = "X";
    gameActive = true;

    statusText.textContent = "Player X Turn";
    restartBtn.classList.remove("hidden");

    boardElement.classList.remove("win-effect","lose-effect","draw-effect");

    const oldLine = document.querySelector(".win-line");
    if (oldLine) oldLine.remove();

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x","o");
    });
}

/* ============================= */
/* CELL CLICK */
/* ============================= */

cells.forEach(cell => cell.addEventListener("click", handleClick));

function handleClick(e) {

    const index = e.target.dataset.index;

    if (!gameActive || board[index] !== "") return;

    makeMove(index, currentPlayer);

    if (checkResult()) return;

    if (vsAI && currentPlayer === "O") {
        setTimeout(aiMove, 400);
    }
}

/* ============================= */
/* MAKE MOVE */
/* ============================= */

function makeMove(index, player) {

    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());

    currentPlayer = player === "X" ? "O" : "X";

    if (gameActive)
        statusText.textContent = `Player ${currentPlayer} Turn`;
}

/* ============================= */
/* CHECK RESULT */
/* ============================= */

function checkResult() {

    for (let condition of winConditions) {

        const [a,b,c] = condition;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {

            gameActive = false;
            const winner = board[a];

            drawWinningLine(condition);

            if (!vsAI) {
                boardElement.classList.add("win-effect");
            } else {
                if (winner === "X") {
                    boardElement.classList.add("win-effect");
                } else {
                    boardElement.classList.add("lose-effect");
                }
            }

            statusText.textContent = `${winner} Wins!`;
            return true;
        }
    }

    if (!board.includes("")) {
        gameActive = false;
        boardElement.classList.add("draw-effect");
        statusText.textContent = "Draw!";
        return true;
    }

    return false;
}

/* ============================= */
/* DRAW SINGLE WIN LINE */
/* ============================= */

function drawWinningLine(condition) {

    const oldLine = document.querySelector(".win-line");
    if (oldLine) oldLine.remove();

    const line = document.createElement("div");
    line.classList.add("win-line");

    const firstCell = cells[condition[0]];
    const lastCell = cells[condition[2]];

    const boardRect = boardElement.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    // Get center points
    const x1 = firstRect.left + firstRect.width / 2 - boardRect.left;
    const y1 = firstRect.top + firstRect.height / 2 - boardRect.top;

    const x2 = lastRect.left + lastRect.width / 2 - boardRect.left;
    const y2 = lastRect.top + lastRect.height / 2 - boardRect.top;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    line.style.width = length + "px";
    line.style.left = x1 + "px";
    line.style.top = y1 + "px";
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = "0 50%";

    boardElement.appendChild(line);
}

/* ============================= */
/* AI SECTION */
/* ============================= */

function aiMove() {

    if (!gameActive) return;

    let move;

    if (aiLevel === "easy") move = easyAI();
    else if (aiLevel === "medium") move = mediumAI();
    else move = hardAI();

    makeMove(move, "O");
    checkResult();
}

function easyAI() {

    let win = findWinningMove("O");
    if (win !== null) return win;

    let block = findWinningMove("X");
    if (block !== null) return block;

    return randomMove();
}

function mediumAI() {

    let win = findWinningMove("O");
    if (win !== null) return win;

    let block = findWinningMove("X");
    if (block !== null) return block;

    if (board[4] === "") return 4;

    return randomMove();
}

function hardAI() {
    return minimax(board, "O").index;
}

/* ============================= */
/* AI HELPERS */
/* ============================= */

function randomMove() {
    let empty = board
        .map((v,i)=> v===""?i:null)
        .filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

function findWinningMove(player) {

    for (let condition of winConditions) {

        let [a,b,c] = condition;
        let line = [board[a], board[b], board[c]];

        if (line.filter(x=>x===player).length===2 && line.includes("")) {
            return condition[line.indexOf("")];
        }
    }

    return null;
}

function minimax(newBoard, player) {

    let availSpots = newBoard
        .map((v,i)=> v===""?i:null)
        .filter(v=>v!==null);

    if (checkWin(newBoard,"X")) return {score:-10};
    if (checkWin(newBoard,"O")) return {score:10};
    if (availSpots.length===0) return {score:0};

    let moves = [];

    for (let i=0;i<availSpots.length;i++) {

        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        let result = minimax(newBoard, player==="O"?"X":"O");
        move.score = result.score;

        newBoard[availSpots[i]] = "";
        moves.push(move);
    }

    let bestMove;

    if (player === "O") {
        let bestScore = -Infinity;
        for (let i=0;i<moves.length;i++){
            if (moves[i].score > bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i=0;i<moves.length;i++){
            if (moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWin(board, player) {
    return winConditions.some(condition =>
        condition.every(index => board[index] === player)
    );
}

/* ============================= */
/* RESTART */
/* ============================= */

restartBtn.addEventListener("click", startGame);