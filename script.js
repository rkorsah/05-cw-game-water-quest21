const scoreDisplay = document.getElementById('score');
const goalDisplay = document.getElementById('scoreGoal');
const scoreFill = document.getElementById('scoreFill');
const scoreTrack = document.querySelector('.score-track');
const gameMessage = document.getElementById('gameMessage');
const gameBoard = document.getElementById('gameBoard');
const resetButton = document.getElementById('resetButton');
const difficultySelect = document.getElementById('difficulty');
const difficultyDescription = document.getElementById('difficultyDescription');
const pollutionPenaltyDisplay = document.getElementById('pollutionPenalty');
const celebration = document.getElementById('celebration');
const celebrationText = document.getElementById('celebrationText');
const confetti = document.getElementById('confetti');

const difficultySettings = {
	easy: {
		goal: 8,
		pollutionPenalty: 1,
		description: 'Reach 8 drops. Pollution takes away 1 drop.'
	},
	normal: {
		goal: 10,
		pollutionPenalty: 2,
		description: 'Reach 10 drops. Pollution takes away 2 drops.'
	},
	hard: {
		goal: 12,
		pollutionPenalty: 3,
		description: 'Reach 12 drops. Pollution takes away 3 drops.'
	}
};
const tileCount = 9;
let score = 0;
let gameOver = false;
let currentSettings = difficultySettings.normal;
let milestonesReached = [];
let audioContext;

function playSound(frequency, duration) {
	const AudioContextClass = window.AudioContext || window.webkitAudioContext;

	if (!AudioContextClass) {
		return;
	}

	if (!audioContext) {
		audioContext = new AudioContextClass();
	}

	if (audioContext.state === 'suspended') {
		audioContext.resume();
	}

	const oscillator = audioContext.createOscillator();
	const volume = audioContext.createGain();
	oscillator.frequency.value = frequency;
	volume.gain.setValueAtTime(0.12, audioContext.currentTime);
	volume.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
	oscillator.connect(volume);
	volume.connect(audioContext.destination);
	oscillator.start();
	oscillator.stop(audioContext.currentTime + duration);
}

function playWinSound() {
	const notes = [523, 659, 784, 1047, 1319];

	for (let index = 0; index < notes.length; index++) {
		setTimeout(function () {
			playSound(notes[index], 0.22);
		}, index * 170);
	}
}

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
	scoreFill.style.width = `${score / currentSettings.goal * 100}%`;
	scoreTrack.setAttribute('aria-valuenow', score);
}

function celebrateWin() {
	gameOver = true;
	resetButton.textContent = 'Play again';
	celebration.hidden = false;
	celebrationText.textContent = `You collected ${currentSettings.goal} clean water drops. Every drop makes a difference!`;
	gameMessage.textContent = 'You reached the clean water goal!';
	playWinSound();
	createConfetti();
	disableBoard();
}

function announceMilestone(previousScore) {
	const milestones = [
		{
			score: Math.ceil(currentSettings.goal / 3),
			message: 'Milestone reached: you are making a great start!'
		},
		{
			score: Math.ceil(currentSettings.goal * 2 / 3),
			message: 'Milestone reached: you are close to your clean water goal!'
		},
		{
			score: currentSettings.goal,
			message: 'Milestone reached: clean water goal complete!'
		}
	];

	for (let index = 0; index < milestones.length; index++) {
		const milestone = milestones[index];

		if (previousScore < milestone.score && score >= milestone.score && !milestonesReached.includes(milestone.score)) {
			milestonesReached.push(milestone.score);
			gameMessage.textContent = milestone.message;
		}
	}
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
	const previousScore = score;
	tile.disabled = true;
	tile.classList.add(`is-${tileType}`);

	if (tileType === 'water') {
		tile.textContent = '💧';
		tile.setAttribute('aria-label', 'Clean water found');
		score++;
		gameMessage.textContent = 'A clean water drop! Your score went up by 1.';
		playSound(660, 0.14);
	} else {
		tile.textContent = '🛢️';
		tile.setAttribute('aria-label', 'Pollution found');
		score = Math.max(0, score - currentSettings.pollutionPenalty);
		const lostDrops = previousScore - score;
		if (lostDrops === 0) {
			gameMessage.textContent = 'Pollution! Your score is already at zero.';
		} else if (lostDrops === 1) {
			gameMessage.textContent = 'Pollution! Your score went down by 1 drop.';
		} else {
			gameMessage.textContent = `Pollution! Your score went down by ${lostDrops} drops.`;
		}
		playSound(190, 0.2);
	}

	updateScore();
	announceMilestone(previousScore);

	if (score >= currentSettings.goal) {
		celebrateWin();
		return;
	}

	if (gameBoard.querySelectorAll(':disabled').length === tileCount) {
		createTiles();
		gameMessage.textContent = 'New tiles are ready. Keep collecting clean water!';
	}

}

function resetGame() {
	currentSettings = difficultySettings[difficultySelect.value];
	score = 0;
	gameOver = false;
	resetButton.textContent = 'Start over';
	milestonesReached = [];
	celebration.hidden = true;
	confetti.innerHTML = '';
	goalDisplay.textContent = ` / ${currentSettings.goal} drops`;
	scoreTrack.setAttribute('aria-valuemax', currentSettings.goal);
	difficultyDescription.textContent = currentSettings.description;
	const penaltyUnit = currentSettings.pollutionPenalty === 1 ? 'drop' : 'drops';
	pollutionPenaltyDisplay.textContent = `−${currentSettings.pollutionPenalty} ${penaltyUnit}`;
	gameMessage.textContent = 'Pick a covered tile to reveal what’s inside.';
	updateScore();
	createTiles();
}

resetButton.addEventListener('click', resetGame);
difficultySelect.addEventListener('change', resetGame);
resetGame();
