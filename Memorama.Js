const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const clickSound = document.getElementById("clickSound");
const matchSound = document.getElementById("matchSound");//sirve
const backgroundMusic = document.getElementById("backgroundMusic");//no sirve aun;(
const loseSound = document.getElementById("loseSound");//sirve
const nextLevelButton = document.getElementById("nextLevelButton");
const restartButton = document.getElementById("restartButton");
const exitButton = document.getElementById("exitButton");
const levelDisplay = document.getElementById("levelDisplay");

// Inicializar variables
let startTime = Date.now();
let timeElapsed = 0;
let cards = [];
let flippedCards = [];
let matchedCards = [];
let matchedPairs = 0;
const totalPairs = 15;
let level = 1;
let maxTime = 180000; // 3 minutos
let moves = 0; // Movimientos en nivel 3
let maxMoves = 70;//limite de movimientos de momento
let gameLost = false;
let flipDelay = 1000; // Tiempo de volteo de cartas

// Cartas(de momento)
const cardColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8F33', '#A633FF',
    '#33FFD7', '#DFFF33', '#8F33FF', '#FF3333', '#33FFA3', '#A3FF33',
    '#33A6FF', '#FFA633', '#FF338F'
];

// Barajar las cartas
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
let cardPairs = shuffle([...cardColors, ...cardColors]);

function drawCards() {
    const cols = 6;
    const rows = 5;
    const cardWidth = canvas.width / cols;
    const cardHeight = canvas.height / rows;

    for (let i = 0; i < cards.length; i++) {
        const x = (i % cols) * cardWidth;
        const y = Math.floor(i / cols) * cardHeight;

        if (flippedCards.includes(i) || matchedCards.includes(i)) {
             // Si la carta está volteada o emparejada, muestra el color
            ctx.fillStyle = cards[i];
        } else {
             // Muestra la parte trasera de la carta
            ctx.fillStyle = "#ccc";
        }
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeRect(x, y, cardWidth, cardHeight);
    }
}
// Verificar si coinciden
function checkMatch() {
    if (flippedCards.length === 2) {
        if (cards[flippedCards[0]] === cards[flippedCards[1]]) {
            matchSound.play();
            matchedCards.push(...flippedCards);// Si coinciden las cartas se emparejan
            matchedPairs++;
            flippedCards = [];

            // Verificar si se encontraron todos los pares
            if (matchedPairs === totalPairs) {
                setTimeout(() => {
                    if (level === 2) {
                        alert("¡Ganaste el Nivel 2! Avanzas al Nivel 3.");
                        level = 3;
                        moves = 0;
                        matchedPairs = 0;
                        matchedCards = [];
                        cardPairs = shuffle([...cardColors, ...cardColors]);
                        nextLevelButton.style.display = "none";
                        movesDisplay.textContent = "Movimientos: 0";
                        movesDisplay.style.display = "block";
                        startTime = Date.now();// Reiniciar tiempo
                        drawCards();
                    } else if (level === 3) {
                        alert("¡Ganaste el Nivel 3! Has completado el juego.");
                        nextLevelButton.style.display = "none";
                        restartButton.style.display = "block";
                        exitButton.style.display = "block";
                    } else {
                        alert("¡Ganaste!");
                        nextLevelButton.style.display = "block";
                    }
                    updateLevelDisplay();
                }, 500);
            }
        } else {
            setTimeout(() => {
                flippedCards = [];
                drawCards();
            }, flipDelay);
        }
    }
}

canvas.addEventListener("click", (e) => {
    if (gameLost) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cols = 6;
    const rows = 5;
    const cardWidth = canvas.width / cols;
    const cardHeight = canvas.height / rows;
    const cardX = Math.floor(x / cardWidth);
    const cardY = Math.floor(y / cardHeight);
    const cardIndex = cardY * cols + cardX;

   // Voltea la carta si no está ya emparejada o volteada
    if (!flippedCards.includes(cardIndex) && !matchedCards.includes(cardIndex) && flippedCards.length < 2) {
        flippedCards.push(cardIndex);
        clickSound.play();
        drawCards();
        checkMatch();

        if (level === 3) {
            moves++;
            movesDisplay.textContent = `Movimientos: ${moves}`;
            if (moves >= maxMoves) {
                loseSound.play();
                setTimeout(() => alert("¡Perdiste! Has excedido el número máximo de movimientos."), 500);
                gameLost = true;
                restartButton.style.display = "block";
                exitButton.style.display = "block";
            }
        }
    }
});

// Contador de tiempo
function updateTimer() {
    timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Tiempo: ${timeElapsed}s`;

    // Si es nivel 2 y se acaba tiempo
    if (level === 2 && Date.now() - startTime > maxTime) {
        loseSound.play();
        setTimeout(() => alert("¡Tiempo agotado! Has perdido."), 500);
        gameLost = true;
        restartButton.style.display = "block";
        exitButton.style.display = "block";
    }

    if (!gameLost) {
        requestAnimationFrame(updateTimer);
    }
}

// Avanzar al siguiente nivel
function advanceToNextLevel() {
    matchedPairs = 0;
    flippedCards = [];
    matchedCards = [];
    cardPairs = shuffle([...cardColors, ...cardColors]);
    drawCards();
    nextLevelButton.style.display = "none";
    level++;

    if (level === 2) {
        startTime = Date.now(); // Reiniciar el temporizador para nivel 2
        maxTime = 180000; // 3 minutos (nivel 2)
    } else if (level === 3) {
        moves = 0;
        movesDisplay.style.display = "block";
        movesDisplay.textContent = "Movimientos: 0";
    }

    updateLevelDisplay();
}

function updateLevelDisplay() {
    levelDisplay.textContent = `Nivel: ${level}`;
}

function restartLevel() {
    gameLost = false;
    flippedCards = [];
    matchedCards = [];
    matchedPairs = 0;
    moves = 0;
    backgroundMusic.play();
    startTime = Date.now();
    cardPairs = shuffle([...cardColors, ...cardColors]);
    restartButton.style.display = "none";
    exitButton.style.display = "none";
    movesDisplay.textContent = "Movimientos: 0";
    drawCards();
    requestAnimationFrame(updateTimer);
}

function startGame() {
    cardPairs = shuffle([...cardColors, ...cardColors]);
    cards = cardPairs;
    drawCards();
    requestAnimationFrame(updateTimer);
}

startGame();
nextLevelButton.addEventListener("click", advanceToNextLevel);
restartButton.addEventListener("click", restartLevel);
exitButton.addEventListener("click", () => window.location.reload());









