let gameState = {
    image: null,
    gridSize: 4,
    pieces: [],
    solved: false,
    moves: 0,
    startTime: 0,
    timerInterval: null
};

// Elements
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const preview = document.getElementById('preview');
const settingsSection = document.getElementById('settingsSection');
const gameSection = document.getElementById('gameSection');
const difficulty = document.getElementById('difficulty');
const startBtn = document.getElementById('startBtn');
const puzzleBoard = document.getElementById('puzzleBoard');
const piecesArea = document.getElementById('piecesArea');
const originalImg = document.getElementById('originalImg');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const resetBtn = document.getElementById('resetBtn');
const winMessage = document.getElementById('winMessage');
const finalTime = document.getElementById('finalTime');
const finalMoves = document.getElementById('finalMoves');
const playAgainBtn = document.getElementById('playAgainBtn');

// Upload Image
uploadBtn.addEventListener('click', () => {
    const file = imageInput.files[0];
    if (!file) {
        alert('Please select an image!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            gameState.image = img;
            
            // Show preview
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            
            // Show settings
            settingsSection.style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Start Game
startBtn.addEventListener('click', () => {
    gameState.gridSize = parseInt(difficulty.value);
    gameState.moves = 0;
    gameState.solved = false;
    gameState.pieces = [];
    
    settingsSection.style.display = 'none';
    gameSection.style.display = 'block';
    
    createPuzzle();
    startTimer();
});

// Create Puzzle
function createPuzzle() {
    // Display original image
    const canvas = document.createElement('canvas');
    canvas.width = gameState.image.width;
    canvas.height = gameState.image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(gameState.image, 0, 0);
    originalImg.src = canvas.toDataURL();

    // Calculate piece size
    const pieceWidth = gameState.image.width / gameState.gridSize;
    const pieceHeight = gameState.image.height / gameState.gridSize;

    // Create puzzle pieces
    puzzleBoard.innerHTML = '';
    piecesArea.innerHTML = '';
    puzzleBoard.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
    
    const pieces = [];
    const order = [];

    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            // Create slot
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.dataset.row = row;
            slot.dataset.col = col;
            slot.dataset.position = row * gameState.gridSize + col;
            
            // Create piece
            const piece = document.createElement('canvas');
            piece.width = pieceWidth;
            piece.height = pieceHeight;
            const pieceCtx = piece.getContext('2d');
            pieceCtx.drawImage(
                gameState.image,
                col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight,
                0, 0, pieceWidth, pieceHeight
            );

            const img = document.createElement('img');
            img.src = piece.toDataURL();
            img.className = 'puzzle-piece';
            img.dataset.correctPosition = row * gameState.gridSize + col;
            img.dataset.row = row;
            img.dataset.col = col;
            img.draggable = true;

            img.addEventListener('dragstart', handleDragStart);

            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);

            pieces.push({
                img: img,
                correctPosition: row * gameState.gridSize + col,
                currentPosition: null
            });

            order.push(row * gameState.gridSize + col);
            puzzleBoard.appendChild(slot);
        }
    }

    gameState.pieces = pieces;

    // Shuffle and add to pieces area
    order.sort(() => Math.random() - 0.5);
    order.forEach(position => {
        piecesArea.appendChild(gameState.pieces[position].img);
    });
}

// Drag and Drop
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('active');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('active');

    if (!draggedElement) return;

    const slot = e.currentTarget;
    gameState.moves++;
    movesDisplay.textContent = gameState.moves;

    // Move piece to slot
    slot.innerHTML = '';
    slot.appendChild(draggedElement);

    // Check if piece is in correct position
    const correctPosition = draggedElement.dataset.correctPosition;
    const currentPosition = slot.dataset.position;

    if (correctPosition == currentPosition) {
        draggedElement.draggable = false;
        draggedElement.style.opacity = '0.7';
    }

    checkIfSolved();
}

// Check if puzzle is solved
function checkIfSolved() {
    const allSlots = document.querySelectorAll('.puzzle-slot');
    let solved = true;

    allSlots.forEach(slot => {
        const piece = slot.querySelector('.puzzle-piece');
        if (!piece || piece.dataset.correctPosition != slot.dataset.position) {
            solved = false;
        }
    });

    if (solved) {
        endGame();
    }
}

// Timer
function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        timerDisplay.textContent = elapsed;
    }, 1000);
}

// End Game
function endGame() {
    clearInterval(gameState.timerInterval);
    gameState.solved = true;
    finalTime.textContent = timerDisplay.textContent;
    finalMoves.textContent = gameState.moves;
    winMessage.style.display = 'block';
}

// Reset Game
resetBtn.addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    gameState.moves = 0;
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '0';
    createPuzzle();
    startTimer();
});

// Play Again
playAgainBtn.addEventListener('click', () => {
    winMessage.style.display = 'none';
    resetBtn.click();
});
