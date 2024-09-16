const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const clickSound = document.getElementById("clickSound");
const matchSound = document.getElementById("matchSound");//sirve
const backgroundMusic = document.getElementById("backgroundMusic");//Ya sirveee
const loseSound = document.getElementById("loseSound");//sirve
const nextLevelButton = document.getElementById("nextLevelButton");
const restartButton = document.getElementById("restartButton");
const exitButton = document.getElementById("exitButton");
const levelDisplay = document.getElementById("levelDisplay");
const victorySound = document.getElementById("victorySound");//sirve
const helpButton = document.getElementById("helpButton");
const instructionsPopup = document.getElementById("instructionsPopup");
const instructionsText = document.getElementById("instructionsText");
const closePopup = document.getElementById("closePopup");

backgroundMusic.src = 'MusicaFondo.mp3';
backgroundMusic.loop = true;

let startTime = Date.now();
let timeElapsed = 0;
let cards = [];
let flippedCards = [];
let matchedCards = [];
let matchedPairs = 0;
const totalPairs = 15;
let level = 1;
let maxTime = 180000; // 3 minutos
let moves = 0; // Movimientos para niveles 3 y 4
let maxMoves = 70;//Movimientos limite
let gameLost = false;
let flipDelay = 1000;
let singleCardTimeout;

helpButton.addEventListener("click", () => {
    let instructions = "";
    switch (level) {
        case 1:
            instructions = "Nivel 1: Encuentra los pares de cartas. No hay límite de tiempo.";
            break;
        case 2:
            instructions = "Nivel 2: Encuentra los pares de cartas en menos de 3 minutos.";
            break;
        case 3:
            instructions = "Nivel 3: Encuentra los pares de cartas. Tienes 70 movimientos máximo.";
            break;
        case 4:
            instructions = "Nivel 4: Encuentra los pares en menos de 3 minutos y con 70 movimientos.";
            break;
        default:
            instructions = "¡Buena suerte!";
    }
    instructionsText.textContent = instructions;
    instructionsPopup.style.display = "block";
});

closePopup.addEventListener("click", () => {
    instructionsPopup.style.display = "none";
});


canvas.addEventListener("click", () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            console.error("Error al reproducir la música de fondo:", error);
        });
    }
});

// Cargar Cartas
const cardImages = [
    'CharmyBee.png', 'Rouge.png', 'Blaze.png', 'JetHawk.png', 'Sally.png',
    'Sticks.png', 'Eggman.png', 'MetalSonic.png', 'Silver.png', 'AmyRose.png',
    'SuperSonic.png', 'Tails.png', 'SonicBlue.png', 'Knuckles.png', 'Shadow.png'
];

// Parte trasera de las cartas
const anilloImg = new Image();
anilloImg.src = 'Anillo.gif';

// Imágenes de las cartas
let imagesLoaded = {};
cardImages.forEach((src) => {
    const img = new Image();
    img.src = src;
    imagesLoaded[src] = img;
});

// Barajar las cartas
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let cardPairs = shuffle([...cardImages, ...cardImages]);

// Dibujar las cartas en el canvas
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
            const img = imagesLoaded[cards[i]];
            ctx.drawImage(img, x, y, cardWidth, cardHeight);
        } else {
             // Muestra la parte trasera de la carta
            ctx.drawImage(anilloImg, x, y, cardWidth, cardHeight);
        }
        ctx.strokeRect(x, y, cardWidth, cardHeight);
    }
}

function animate() {
    drawCards();
    requestAnimationFrame(animate);
}

function showVictoryMessage(message) {
    const victoryMessage = document.createElement("div");
    victoryMessage.className = "victory-message";
    victoryMessage.textContent = message;
    document.body.appendChild(victoryMessage);

    victoryMessage.style.position = "fixed";
    victoryMessage.style.top = "50%";
    victoryMessage.style.left = "50%";
    victoryMessage.style.transform = "translate(-50%, -50%)";
    victoryMessage.style.backgroundColor = "rgba(0, 128, 0, 0.8)";
    victoryMessage.style.color = "white";
    victoryMessage.style.padding = "40px";
    victoryMessage.style.fontSize = "32px";
    victoryMessage.style.borderRadius = "15px";
    victoryMessage.style.zIndex = "1000";

    setTimeout(() => {
        document.body.removeChild(victoryMessage);
    }, 5000);
}

function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function resumeMusic() {
    backgroundMusic.play().catch(error => {
        console.error("Error al reanudar la música de fondo:", error);
    });
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
                    victorySound.play();
                    stopMusic();
                    if (level === 4) {
                        showVictoryMessage("¡Ganaste el Nivel 4! Has completado el juego.");
                        restartButton.style.display = "block";
                        exitButton.style.display = "block";
                    } else {
                        showVictoryMessage(`¡Ganaste el Nivel ${level}! Avanza al siguiente nivel.`);
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

        // Contabilizar movimientos después de voltear una sola carta
        if (level >= 3) {
            moves++;
            movesDisplay.textContent = `Movimientos: ${moves}`;
            if (moves >= maxMoves) {
                loseSound.play();
                setTimeout(() => alert("¡Perdiste! Has excedido el número máximo de movimientos."), 500);
                gameLost = true;
                restartButton.style.display = "block";
                exitButton.style.display = "block";
                stopMusic();
                return;
            }
        }

        if (flippedCards.length === 1) {
            singleCardTimeout = setTimeout(() => {
                flippedCards = [];
                drawCards();
            }, flipDelay); 
        }

        if (flippedCards.length === 2) {
            clearTimeout(singleCardTimeout); 
            checkMatch();
        }
    }
});

// Contador de tiempo
function updateTimer() {
    timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Tiempo: ${timeElapsed}s`;

    // Si es nivel 2 y 4 y se acaba tiempo
    if ((level === 2 || level === 4) && Date.now() - startTime > maxTime) {
        loseSound.play();
        stopMusic();
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
    cardPairs = shuffle([...cardImages, ...cardImages]); // Barajar de nuevo las cartas
    cards = cardPairs;
    drawCards();
    nextLevelButton.style.display = "none"; 
    level++;
    resumeMusic(); 

    if (level === 2) {
        startTime = Date.now();
        maxTime = 180000;
        requestAnimationFrame(updateTimer);
    } else if (level === 3) {
        moves = 0;
        movesDisplay.style.display = "block";
        movesDisplay.textContent = "Movimientos: 0";
        startTime = Date.now();
        requestAnimationFrame(updateTimer);
    } else if (level === 4) {
        moves = 0;
        movesDisplay.style.display = "block";
        movesDisplay.textContent = "Movimientos: 0";
        startTime = Date.now();
        maxMoves = 0;  // Ajuste para nivel 4
        requestAnimationFrame(updateTimer);
    }

    updateLevelDisplay();
}


function updateLevelDisplay() {
    levelDisplay.textContent = `Nivel: ${level}`;
}

// Reiniciar el juego o nivel actual
function restartLevel() {
    gameLost = false;
    flippedCards = [];
    matchedCards = [];
    matchedPairs = 0;
    moves = 0;
    resumeMusic();
    startTime = Date.now();
    cardPairs = shuffle([...cardImages, ...cardImages]); // Barajar las cartas de nuevo
    cards = cardPairs;
    restartButton.style.display = "none";
    exitButton.style.display = "none";
    movesDisplay.textContent = "Movimientos: 0";
    drawCards();
    requestAnimationFrame(updateTimer);
}


function startGame() {
    cardPairs = shuffle([...cardImages, ...cardImages]);
    cards = cardPairs;
    drawCards();
    requestAnimationFrame(updateTimer);
}

animate();
startGame();
nextLevelButton.addEventListener("click", advanceToNextLevel);
restartButton.addEventListener("click", restartLevel);
exitButton.addEventListener("click", () => window.location.reload());














