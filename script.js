const scoreDisplay = document.getElementById('score');
const scoreFill = document.getElementById('scoreFill');
const scoreTrack = document.querySelector('.score-track');
const gameMessage = document.getElementById('gameMessage');
const gameBoard = document.getElementById('gameBoard');
const resetButton = document.getElementById('resetButton');
const celebration = document.getElementById('celebration');
const confetti = document.getElementById('confetti');

const goal = 10;
const tileCount = 9;
let score = 0;
let gameOver = false;

function createTiles() {
	const tileTypes = ['water', 'water', 'water', 'water', 'water', 'water', 'pollution', 'pollution', 'pollution'];

	for (let index = tileTypes.length - 1; index > 0; index--) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		const currentTile = tileTypes[index];
		tileTypes[index] = tileTypes[randomIndex];
		tileTypes[randomIndex] = currentTile;
	}

	gameBoard.innerHTML = '';

	for (let index = 0; index < tileCount; index++) {
		const tile = document.createElement('button');
		tile.className = 'game-tile';
		tile.type = 'button';
		tile.textContent = '?';
		tile.setAttribute('aria-label', `Reveal tile ${index + 1}`);
		tile.dataset.type = tileTypes[index];
		tile.addEventListener('click', handleTileClick);
		gameBoard.appendChild(tile);
	}
}

function updateScore() {
	scoreDisplay.textContent = score;
	scoreFill.style.width = `${score / goal * 100}%`;
	scoreTrack.setAttribute('aria-valuenow', score);
}

function celebrateWin() {
	gameOver = true;
	celebration.hidden = false;
	gameMessage.textContent = 'You reached the clean water goal!';
	createConfetti();
	disableBoard();
}

function createConfetti() {
	const colors = ['confetti-yellow', 'confetti-blue', 'confetti-teal'];
	confetti.innerHTML = '';

	for (let index = 0; index < 30; index++) {
		const piece = document.createElement('span');
		piece.className = `confetti-piece ${colors[index % colors.length]}`;
		piece.style.left = `${index / 30 * 100}%`;
		piece.style.animationDelay = `${index % 8 * 0.08}s`;
		confetti.appendChild(piece);
	}
}

function disableBoard() {
	const tiles = gameBoard.querySelectorAll('.game-tile');

	for (let index = 0; index < tiles.length; index++) {
		tiles[index].disabled = true;
	}
}

function handleTileClick(event) {
	if (gameOver) {
		return;
	}

	const tile = event.currentTarget;
	const tileType = tile.dataset.type;
	tile.disabled = true;
	tile.classList.add(`is-${tileType}`);

	if (tileType === 'water') {
		tile.textContent = '💧';
		tile.setAttribute('aria-label', 'Clean water found');
		score++;
		gameMessage.textContent = 'A clean water drop! Your score went up by 1.';
	} else {
		tile.textContent = '🛢️';
		tile.setAttribute('aria-label', 'Pollution found');
		const previousScore = score;
		score = Math.max(0, score - 2);
		const lostDrops = previousScore - score;
		if (lostDrops === 0) {
			gameMessage.textContent = 'Pollution! Your score is already at zero.';
		} else if (lostDrops === 1) {
			gameMessage.textContent = 'Pollution! Your score went down by 1 drop.';
		} else {
			gameMessage.textContent = `Pollution! Your score went down by ${lostDrops} drops.`;
		}
	}

	updateScore();

	if (score >= goal) {
		celebrateWin();
		return;
	}

	if (gameBoard.querySelectorAll(':disabled').length === tileCount) {
		createTiles();
		gameMessage.textContent = 'New tiles are ready. Keep collecting clean water!';
	}
}

function resetGame() {
	score = 0;
	gameOver = false;
	celebration.hidden = true;
	confetti.innerHTML = '';
	gameMessage.textContent = 'Pick a covered tile to reveal what’s inside.';
	updateScore();
	createTiles();
}

resetButton.addEventListener('click', resetGame);
resetGame();
