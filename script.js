const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const scoreFill = document.getElementById('scoreFill');
const scoreTrack = document.querySelector('.score-track');
const gameMessage = document.getElementById('gameMessage');
const roundDisplay = document.getElementById('roundDisplay');
const questionPrompt = document.getElementById('questionPrompt');
const answerList = document.getElementById('answerList');
const nextButton = document.getElementById('nextButton');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const difficultySelect = document.getElementById('difficulty');
const difficultyDescription = document.getElementById('difficultyDescription');
const celebration = document.getElementById('celebration');
const celebrationTitle = document.getElementById('celebrationTitle');
const celebrationText = document.getElementById('celebrationText');
const celebrationIcon = document.getElementById('celebrationIcon');
const confetti = document.getElementById('confetti');

const difficultySettings = {
	easy: {
		startingLives: 4,
		description: 'Start with 4 lives. Correct answers add a life.'
	},
	normal: {
		startingLives: 3,
		description: 'Start with 3 lives. Correct answers add a life.'
	},
	hard: {
		startingLives: 2,
		description: 'Start with 2 lives. Correct answers add a life.'
	}
};

const questions = [
	{
		question: 'What is charity: water’s mission?',
		choices: [
			'Bring clean and safe drinking water to people in need',
			'Build roads in every city',
			'Deliver books to every school',
			'Protect wild animals in the ocean'
		],
		answer: 'Bring clean and safe drinking water to people in need'
	},
	{
		question: 'Why is clean drinking water important?',
		choices: [
			'It helps people stay healthy',
			'It makes the sun shine',
			'It stops all rain',
			'It makes food grow without soil'
		],
		answer: 'It helps people stay healthy'
	},
	{
		question: 'Which action can help save water at home?',
		choices: [
			'Turn off the tap while brushing your teeth',
			'Leave every tap running',
			'Wash one cup at a time under running water',
			'Take extra-long showers'
		],
		answer: 'Turn off the tap while brushing your teeth'
	},
	{
		question: 'What should you do with trash near a stream?',
		choices: [
			'Put it in a bin so it does not pollute the water',
			'Throw it into the stream',
			'Leave it on the ground',
			'Push it toward a drain'
		],
		answer: 'Put it in a bin so it does not pollute the water'
	},
	{
		question: 'What is one way clean water can help a community?',
		choices: [
			'People can spend less time looking for water',
			'People no longer need to eat',
			'It makes every day a holiday',
			'It turns salt water into juice'
		],
		answer: 'People can spend less time looking for water'
	},
	{
		question: 'Which is a safe habit when drinking water?',
		choices: [
			'Use clean water from a safe source',
			'Drink water from any puddle',
			'Share an unwashed cup with everyone',
			'Store drinking water in an open, dirty container'
		],
		answer: 'Use clean water from a safe source'
	},
	{
		question: 'What can happen when water is polluted?',
		choices: [
			'It can become unsafe for people to drink',
			'It always becomes cleaner',
			'It turns into fresh fruit',
			'It can no longer flow'
		],
		answer: 'It can become unsafe for people to drink'
	},
	{
		question: 'Which choice is kind to the environment?',
		choices: [
			'Use only the water you need',
			'Let the garden hose run all day',
			'Pour paint into a storm drain',
			'Leave litter beside a river'
		],
		answer: 'Use only the water you need'
	},
	{
		question: 'What does safe drinking water help protect?',
		choices: [
			'People’s health',
			'Only shoes',
			'The color of clouds',
			'The shape of mountains'
		],
		answer: 'People’s health'
	},
	{
		question: 'What is a helpful way to support clean water?',
		choices: [
			'Learn about the issue and share what you learn',
			'Waste water on purpose',
			'Drop trash in a lake',
			'Ignore water safety'
		],
		answer: 'Learn about the issue and share what you learn'
	}
];

let score = 0;
let lives = difficultySettings.normal.startingLives;
let questionIndex = 0;
let gameOver = false;
let gameStarted = false;
let answeredQuestion = false;
let shuffledQuestions = [];
let currentSettings = difficultySettings.normal;
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

function playLoseSound() {
	const notes = [392, 330, 262];

	for (let index = 0; index < notes.length; index++) {
		setTimeout(function () {
			playSound(notes[index], 0.3);
		}, index * 200);
	}
}

function shuffleItems(items) {
	for (let index = items.length - 1; index > 0; index--) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		const currentItem = items[index];
		items[index] = items[randomIndex];
		items[randomIndex] = currentItem;
	}

	return items;
}

function updateScore() {
	scoreDisplay.textContent = score;
}

function updateLives() {
	livesDisplay.textContent = lives;
}

function updateProgress() {
	const answeredCount = questionIndex + 1;
	scoreFill.style.width = `${answeredCount / shuffledQuestions.length * 100}%`;
	scoreTrack.setAttribute('aria-valuenow', answeredCount);
}

function renderQuestion() {
	const currentQuestion = shuffledQuestions[questionIndex];
	const shuffledChoices = shuffleItems(currentQuestion.choices.slice());
	questionPrompt.textContent = currentQuestion.question;
	roundDisplay.textContent = `Question ${questionIndex + 1} of ${shuffledQuestions.length}`;
	answerList.innerHTML = '';
	answeredQuestion = false;
	nextButton.hidden = true;
	nextButton.disabled = true;
	nextButton.textContent = questionIndex === shuffledQuestions.length - 1 ? 'Finish quiz' : 'Next question';

	for (let index = 0; index < shuffledChoices.length; index++) {
		const answerButton = document.createElement('button');
		answerButton.className = 'quiz-answer';
		answerButton.type = 'button';
		answerButton.dataset.answer = shuffledChoices[index];
		answerButton.disabled = !gameStarted;

		const boxNumber = document.createElement('span');
		boxNumber.className = 'box-number';
		boxNumber.textContent = `BOX ${index + 1}`;
		boxNumber.setAttribute('aria-hidden', 'true');

		const boxIcon = document.createElement('span');
		boxIcon.className = 'box-icon';
		boxIcon.textContent = '💧';
		boxIcon.setAttribute('aria-hidden', 'true');

		const answerText = document.createElement('span');
		answerText.className = 'box-answer';
		answerText.textContent = shuffledChoices[index];

		answerButton.appendChild(boxNumber);
		answerButton.appendChild(boxIcon);
		answerButton.appendChild(answerText);
		answerButton.addEventListener('click', handleAnswerClick);
		answerList.appendChild(answerButton);
	}
}

function disableAnswers() {
	const answerButtons = answerList.querySelectorAll('.quiz-answer');

	for (let index = 0; index < answerButtons.length; index++) {
		answerButtons[index].disabled = true;
	}
}

function enableAnswers() {
	const answerButtons = answerList.querySelectorAll('.quiz-answer');

	for (let index = 0; index < answerButtons.length; index++) {
		answerButtons[index].disabled = false;
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

function endGame(won) {
	gameOver = true;
	startButton.disabled = false;
	startButton.textContent = 'Play again';
	nextButton.hidden = true;
	disableAnswers();

	if (won) {
		celebrationTitle.textContent = 'Quest complete!';
		celebrationText.textContent = `You finished the clean-water quiz with ${score} bonus drops and ${lives} lives left. Every drop makes a difference!`;
		gameMessage.textContent = 'You answered every question. Great work!';
		celebration.classList.remove('is-loss');
		celebration.hidden = false;
		celebrationIcon.textContent = '🎉';
		createConfetti();
		playWinSound();
		return;
	}

	celebrationTitle.textContent = 'Out of lives';
	celebrationText.textContent = `You earned ${score} bonus drops. Start another quiz and try again!`;
	celebration.classList.add('is-loss');
	celebrationIcon.textContent = '💧';
	celebration.hidden = false;
	gameMessage.textContent = 'You ran out of lives. Select Play again to take the quiz once more.';
	playLoseSound();
}

function handleAnswerClick(event) {
	if (!gameStarted || gameOver || answeredQuestion) {
		return;
	}

	answeredQuestion = true;
	const selectedAnswer = event.currentTarget.dataset.answer;
	const currentQuestion = shuffledQuestions[questionIndex];
	const answerButtons = answerList.querySelectorAll('.quiz-answer');
	const isCorrect = selectedAnswer === currentQuestion.answer;

	for (let index = 0; index < answerButtons.length; index++) {
		answerButtons[index].disabled = true;

		if (answerButtons[index].dataset.answer === currentQuestion.answer) {
			answerButtons[index].classList.add('is-correct');
		}
	}

	if (isCorrect) {
		const bonusDrops = Math.floor(Math.random() * 3) + 1;
		lives++;
		score += bonusDrops;
		event.currentTarget.classList.add('is-correct');
		gameMessage.textContent = `Correct! You gained 1 life and a random reward of ${bonusDrops} bonus ${bonusDrops === 1 ? 'drop' : 'drops'}.`;
		playSound(660, 0.14);
	} else {
		lives--;
		event.currentTarget.classList.add('is-incorrect');
		gameMessage.textContent = `Not quite. You lost 1 life. The correct answer is: ${currentQuestion.answer}.`;
		playSound(190, 0.2);
	}

	updateScore();
	updateLives();
	updateProgress();

	if (lives <= 0) {
		endGame(false);
		return;
	}

	nextButton.hidden = false;
	nextButton.disabled = false;
}

function showNextQuestion() {
	if (!answeredQuestion || gameOver) {
		return;
	}

	if (questionIndex === shuffledQuestions.length - 1) {
		endGame(true);
		return;
	}

	questionIndex++;
	renderQuestion();
	enableAnswers();
	gameMessage.textContent = 'Choose the best answer.';
}

function startGame() {
	if (gameOver) {
		resetGame();
	}

	if (gameStarted) {
		return;
	}

	gameStarted = true;
	startButton.disabled = true;
	startButton.textContent = 'Playing';
	gameMessage.textContent = 'Choose the best answer.';
	enableAnswers();
}

function resetGame() {
	currentSettings = difficultySettings[difficultySelect.value];
	score = 0;
	lives = currentSettings.startingLives;
	questionIndex = 0;
	gameOver = false;
	gameStarted = false;
	answeredQuestion = false;
	shuffledQuestions = shuffleItems(questions.slice());
	startButton.disabled = false;
	startButton.textContent = 'Start';
	celebration.hidden = true;
	celebration.classList.remove('is-loss');
	confetti.innerHTML = '';
	difficultyDescription.textContent = currentSettings.description;
	gameMessage.textContent = 'Choose a difficulty, then select Start to play.';
	scoreTrack.setAttribute('aria-valuemax', shuffledQuestions.length);
	scoreTrack.setAttribute('aria-valuenow', 0);
	scoreFill.style.width = '0%';
	updateScore();
	updateLives();
	renderQuestion();
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
nextButton.addEventListener('click', showNextQuestion);
difficultySelect.addEventListener('change', resetGame);
resetGame();
