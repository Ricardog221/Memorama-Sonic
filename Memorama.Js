const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const clickSound = document.getElementById("clickSound");
const matchSound = document.getElementById("matchSound");
const backgroundMusic = document.getElementById("backgroundMusic");
const nextLevelButton = document.getElementById("nextLevelButton");
const restartButton = document.getElementById("restartButton");
const exitButton = document.getElementById("exitButton");

let startTime = Date.now();
let timeElapsed = 0;
let cards = [];
let flippedCards = [];
let matchedCards = [];
let matchedPairs = 0;
const totalPairs = 15; 
let level = 1;
let maxTime = 180000; // 3 minutos para nivel 2
let moves = 0; // Movimientos realizados en el nivel 3
let maxMoves = 50; // Límite de movimientos en el nivel 3
let gameLost = false;

// música de fondo(aun no definida)
backgroundMusic.play();

// Cartas(de momento)
const cardColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8F33', '#A633FF',
    '#33FFD7', '#DFFF33', '#8F33FF', '#FF3333', '#33FFA3', '#A3FF33',
    '#33A6FF', '#FFA633', '#FF338F'
];

const cardPairs = [...cardColors, ...cardColors]; 

// Barajar las cartas
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
cards = shuffle(cardPairs);

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
            matchedCards.push(...flippedCards); // Si coinciden las cartas se emparejan
            matchedPairs++;
            flippedCards = [];

            // Verificar si se encontraron todos los pares
            if (matchedPairs === totalPairs) {
                setTimeout(() => {
                    if (level === 2) {
                        alert("¡Ganaste el Nivel 2! Avanzas al Nivel 3.");
                        level = 3; // Cambiar el nivel
                        moves = 0; // Reiniciar movimientos
                        movesDisplay.style.display = "block"; // Mostrar movimientos
                        nextLevelButton.style.display = "none"; // Ocultar botón de siguiente nivel
                        startTime = Date.now(); // Reiniciar tiempo
                        drawCards();
                    } else if (level === 3) {
                        alert("¡Ganaste el Nivel 3! Has completado el juego.");
                    } else {
                        alert("¡Ganaste!");
                        nextLevelButton.style.display = "block"; // siguiente nivel
                    }
                }, 500);
            }
        } else {
            setTimeout(() => {
                flippedCards = [];
                drawCards();
            }, 1000);
        }
    }
}

// Manejador de clics
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
        clickSound.play();
        flippedCards.push(cardIndex);
        drawCards();
        checkMatch();

        if (level === 3) {
            moves++;
            movesDisplay.textContent = `Movimientos: ${moves}`;
            if (moves >= maxMoves) {
                alert("¡Has alcanzado el límite de movimientos! Has perdido.");
                gameLost = true;
                restartButton.style.display = "block"; // reiniciar
                exitButton.style.display = "block";    // salir
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
        alert("¡Tiempo agotado! Has perdido.");
        gameLost = true;
        restartButton.style.display = "block"; // reiniciar
        exitButton.style.display = "block";    // salir
    }

    if (!gameLost) {
        requestAnimationFrame(updateTimer);
    }
}

function advanceToNextLevel() {
    matchedPairs = 0;
    flippedCards = [];
    matchedCards = [];
    cards = shuffle(cardPairs);
    drawCards();
    nextLevelButton.style.display = "none";
    level++;

    if (level === 2) {
        startTime = Date.now(); // Reiniciar el temporizador para nivel 2
        maxTime = 180000; // Establecer el tiempo máximo para el nivel 2 (3 minutos)
    } else if (level === 3) {
        moves = 0;
        maxMoves = 50;
        movesDisplay.style.display = "block"; // Mostrar movimientos en nivel 3
        alert(`¡Bienvenido al Nivel ${level}! Tienes 50 movimientos.`);
    }
}

// Reiniciar el juego desde el nivel actual
restartButton.addEventListener("click", () => {
    gameLost = false;
    startTime = Date.now(); // Reiniciar el tiempo
    flippedCards = [];
    matchedCards = [];
    matchedPairs = 0;
    moves = 0;
    drawCards();
    restartButton.style.display = "none";
    exitButton.style.display = "none";
    movesDisplay.textContent = "Movimientos: 0";
    updateTimer();
});

// Salir del juego
exitButton.addEventListener("click", () => {
    alert("Has salido del juego.");
    location.reload();
});

// botón de siguiente nivel
nextLevelButton.addEventListener("click", () => {
    if (gameLost) return; // No hacer nada si ya se perdió el juego
    advanceToNextLevel();
});

// Iniciar el juego
drawCards();
updateTimer();





