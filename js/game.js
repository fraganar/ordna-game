// --- DATA ---
let allQuestions = [];

// Load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('data/questions-grund.json');
        const data = await response.json();
        
        // Map questions with their pack assignments
        allQuestions = data.questions.map((q, index) => {
            return { ...q, pack: data.packs[index] || "Familjen Normal" };
        });
        
        console.log(`Loaded ${allQuestions.length} questions from ${data.name}`);
        return allQuestions;
    } catch (error) {
        console.error('Failed to load questions:', error);
        // Fallback to empty array if loading fails
        allQuestions = [];
        return allQuestions;
    }
}

const questionPacks = [
    { name: "Boomer", description: "Frågor om en tid då allt var bättre. Eller var det?" },
    { name: "Nörden", description: "För dig som kan din superhjälte och din C++." },
    { name: "Boksmart och kultiverad", description: "Testa dina kunskaper om finkultur och klassisk bildning." },
    { name: "Gatesmart och depraverad", description: "Frågor som inte lärs ut i skolan. Tur är väl det." },
    { name: "Filmfantasten", description: "Känner du igen repliken? Vet du vem som regisserade?" },
    { name: "Familjen Normal", description: "Lagom svåra frågor för en helt vanlig fredagskväll." },
    { name: "Familjen Hurtig", description: "Allt om sport, hälsa och att ständigt vara på språng." },
    { name: "Familjen Ullared", description: "Fynd, familjebråk och folkfest i Gekås-anda." },
    { name: "Plugghästen", description: "Geografins, kemins och grammatikens värld väntar." },
    { name: "Galaxhjärnan", description: "Stora frågor om universum, vetenskap och existens." },
    { name: "True Crime", description: "Gåtan, ledtrådarna och de ökända fallen." },
    { name: "Historia", description: "Från antiken till kalla kriget – testa ditt historieminne." },
];

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const startMain = document.getElementById('start-main');
const playerSetup = document.getElementById('player-setup');
const showPlayerSetupBtn = document.getElementById('show-player-setup-btn');
const playerCountSelect = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names-container');
const startGameBtn = document.getElementById('start-game-btn');
const challengeForm = document.getElementById('challenge-form');
const showChallengeFormBtn = document.getElementById('show-challenge-form-btn');
const sendChallengeBtn = document.getElementById('send-challenge-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const challengeConfirmation = document.getElementById('challenge-confirmation');

const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const restartBtn = document.getElementById('restart-btn');
const questionCounter = document.getElementById('question-counter');
const scoreboard = document.getElementById('scoreboard');
const difficultyBadge = document.getElementById('difficulty-badge');
const questionText = document.getElementById('question-text');
const questionInstruction = document.getElementById('question-instruction');
const optionsGrid = document.getElementById('options-grid');
const stopBtn = document.getElementById('stop-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const finalScoreboard = document.getElementById('final-scoreboard');

// Pack Shop Elements
const packShopModal = document.getElementById('pack-shop-modal');
const openPackShopBtn = document.getElementById('open-pack-shop-btn');
const closePackShopBtn = document.getElementById('close-pack-shop-btn');
const confirmPacksBtn = document.getElementById('confirm-packs-btn');
const packGrid = document.getElementById('pack-grid');

// Single Player Elements
const singlePlayerScore = document.getElementById('single-player-score');
const singlePlayerProgress = document.getElementById('single-player-progress');
const progressBar = document.getElementById('progress-bar');
const singlePlayerStars = document.getElementById('single-player-stars');
const currentScoreContainer = document.getElementById('current-score-container');
const singlePlayerFinal = document.getElementById('single-player-final');
const singleFinalScore = document.getElementById('single-final-score');
const endScreenSubtitle = document.getElementById('end-screen-subtitle');

// --- Game State ---
let players = [];
let currentPlayerIndex = 0;
let questionStarterIndex = 0;
let currentQuestionIndex = 0;
let questionsToPlay = [];
let userOrder = []; 
let selectedPacks = questionPacks.map(p => p.name);

// Single Player State
let isSinglePlayer = false;
let totalScore = 0;
let currentQuestionScore = 0;
let mistakeMade = false;

// --- Functions ---

// Point animation for both single and multiplayer
function showPointAnimation(playerIndex, text, isBanked = false) {
    if (isSinglePlayer) {
        // Show animation on star container for single player
        const starContainer = document.getElementById('current-score-container');
        if (starContainer) {
            const animationEl = document.createElement('span');
            animationEl.className = 'point-float';
            if (isBanked) {
                animationEl.classList.add('banked');
            }
            animationEl.textContent = text;
            starContainer.appendChild(animationEl);
            
            setTimeout(() => {
                animationEl.remove();
            }, 1000);
        }
    } else {
        // Show animation on player card for multiplayer
        const cards = scoreboard.querySelectorAll('.player-score-card');
        if (cards.length > playerIndex) {
            const card = cards[playerIndex];
            const animationEl = document.createElement('span');
            animationEl.className = 'point-float';
            if (isBanked) {
                animationEl.classList.add('banked');
            }
            animationEl.textContent = text;
            card.appendChild(animationEl);
            
            setTimeout(() => {
                animationEl.remove();
            }, 1000);
        }
    }
}

function processQuestions(questions) {
    return questions.map(q => {
        if (q.typ === 'ordna' && q.rätt_ordning.every(item => typeof item === 'string' && item.length === 1)) {
            const currentAlternatives = {
                'A': q.alternativ[0], 'B': q.alternativ[1],
                'C': q.alternativ[2], 'D': q.alternativ[3]
            };
            const newCorrectOrder = q.rätt_ordning.map(letter => currentAlternatives[letter.toUpperCase()]);
            return { ...q, rätt_ordning: newCorrectOrder };
        }
        return q;
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showPlayerSetup() {
    startMain.classList.add('hidden');
    playerSetup.classList.remove('hidden');
    createPlayerInputs();
}

// Single Player Functions
function renderStars(count, filled = 0) {
    currentScoreContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        star.setAttribute('class', `star-icon ${i < filled ? 'filled' : 'empty'}`);
        star.setAttribute('viewBox', '0 0 24 24');
        star.innerHTML = `<path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/>`;
        currentScoreContainer.appendChild(star);
    }
}

function updateStars(filledCount) {
    const stars = currentScoreContainer.querySelectorAll('.star-icon');
    stars.forEach((star, index) => {
        star.classList.toggle('filled', index < filledCount);
        star.classList.toggle('empty', index >= filledCount);
    });
}

function updateSinglePlayerDisplay() {
    singlePlayerScore.textContent = `Totalpoäng: ${totalScore}`;
    const progressPercentage = (currentQuestionIndex / questionsToPlay.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function endSinglePlayerQuestion(pointsToAdd) {
    totalScore += pointsToAdd;
    mistakeMade = true; // Lock all interactions
    
    updateSinglePlayerDisplay();
    stopBtn.classList.add('hidden');
    nextQuestionBtn.classList.remove('hidden');
    
    const question = questionsToPlay[currentQuestionIndex];

    if (question.typ === 'ordna') {
        feedbackOrder();
    } else {
        feedbackBelongsTo();
    }
}

function endSinglePlayerGame() {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    // Show single player final score
    endScreenSubtitle.textContent = 'Bra kämpat!';
    singlePlayerFinal.classList.remove('hidden');
    finalScoreboard.classList.add('hidden');
    singleFinalScore.textContent = `${totalScore}`;
    progressBar.style.width = '100%';
}

function createPlayerInputs() {
    const count = playerCountSelect.value;
    playerNamesContainer.innerHTML = '';
    
    // Skip name inputs for single player
    if (count == 1) {
        return;
    }
    
    // Create name inputs for multiplayer
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Spelare ${i + 1} namn`;
        input.className = 'player-name-input w-full p-3 border border-slate-300 rounded-lg text-base sm:text-lg';
        playerNamesContainer.appendChild(input);
    }
}

async function initializeGame() {
    // Load questions first
    await loadQuestions();
    
    if (allQuestions.length === 0) {
        console.error("No questions loaded!");
        alert("Kunde inte ladda frågor. Kontrollera att data/questions-grund.json finns.");
        return;
    }
    
    const nameInputs = document.querySelectorAll('.player-name-input');
    const playerCount = parseInt(playerCountSelect.value);
    players = [];
    
    // Handle single player (no name inputs)
    if (playerCount === 1) {
        players.push({
            name: 'Spelare 1',
            score: 0,
            roundPot: 0,
            eliminatedInRound: false,
            eliminationReason: null
        });
        isSinglePlayer = true;
        totalScore = 0;
    } else {
        // Handle multiplayer (with name inputs)
        nameInputs.forEach((input, index) => {
            players.push({
                name: input.value || `Spelare ${index + 1}`,
                score: 0,
                roundPot: 0,
                eliminatedInRound: false,
                eliminationReason: null
            });
        });
        isSinglePlayer = false;
        if (players.length < 2) {
            console.error("Minst två spelare behövs!");
            return;
        }
    }

    if (selectedPacks.length === 0) {
        selectedPacks = questionPacks.map(p => p.name);
        populatePackShop();
    }
    
    // Process questions and filter by selected packs
    const processedQuestions = processQuestions(allQuestions);
    questionsToPlay = processedQuestions.filter(q => selectedPacks.includes(q.pack));
    
    if (questionsToPlay.length === 0) {
        questionsToPlay = [...processedQuestions];
    }
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Setup UI based on game mode
    if (isSinglePlayer) {
        // Show single player UI
        singlePlayerScore.classList.remove('hidden');
        singlePlayerProgress.classList.remove('hidden');
        singlePlayerStars.classList.remove('hidden');
        scoreboard.classList.add('hidden');
    } else {
        // Show multiplayer UI
        singlePlayerScore.classList.add('hidden');
        singlePlayerProgress.classList.add('hidden');
        singlePlayerStars.classList.add('hidden');
        scoreboard.classList.remove('hidden');
    }
    
    currentQuestionIndex = 0;
    questionStarterIndex = 0;
    shuffleArray(questionsToPlay);
    loadQuestion();
}

function updateScoreboard() {
    scoreboard.innerHTML = '';
    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = 'player-score-card p-3 border-2 rounded-lg flex flex-col justify-between min-h-[60px]';
        
        let turnIndicatorHTML = '';
        if (player.eliminatedInRound) {
            card.classList.add('eliminated');
        } else if (index === currentPlayerIndex) {
            card.classList.add('active-player');
            turnIndicatorHTML = `<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">Din tur!</div>`;
        }

        let statusText = '';
        if (player.eliminationReason === 'stopped') {
            statusText = ' (Stannat)';
        } else if (player.eliminationReason === 'wrong') {
            statusText = ' (Fel)';
        }

        let roundPotHTML = '';
        if (player.roundPot > 0 && !player.eliminatedInRound) {
            roundPotHTML = `<span class="font-semibold text-green-600 ml-2">+${player.roundPot}</span>`;
        } 
        else if (player.eliminationReason === 'wrong') {
            roundPotHTML = `<span class="font-semibold text-red-600 ml-2">+0</span>`;
        }

        card.innerHTML = `
            ${turnIndicatorHTML}
            <div class="flex justify-between items-start gap-2 pt-2">
                <div class="font-bold text-slate-800 truncate text-sm sm:text-base" title="${player.name}${statusText}">${player.name}<span class="text-slate-500 font-normal">${statusText}</span></div>
                <div class="text-base sm:text-lg font-bold text-slate-700 whitespace-nowrap flex items-center">${player.score} p ${roundPotHTML}</div>
            </div>
        `;
        scoreboard.appendChild(card);
    });
}

function updateGameControls() {
    if (isSinglePlayer) {
        stopBtn.textContent = 'Stanna & Säkra Poäng';
        stopBtn.classList.remove('hidden');
        stopBtn.disabled = false;
    } else {
        const player = players[currentPlayerIndex];
        const activePlayers = players.filter(p => !p.eliminatedInRound);

        if (activePlayers.length === 0) {
            stopBtn.classList.add('hidden');
            nextQuestionBtn.classList.remove('hidden');
        } else {
            nextQuestionBtn.classList.add('hidden');
            if (player && player.roundPot > 0 && !player.eliminatedInRound) {
                stopBtn.textContent = `(${player.name}) Stanna på +${player.roundPot}`;
                stopBtn.disabled = false;
                stopBtn.classList.remove('hidden');
            } else {
                stopBtn.classList.add('hidden');
                stopBtn.disabled = true;
            }
        }
    }
}

function setDifficultyBadge(difficulty) {
    const badge = difficultyBadge;
    badge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    let baseClasses = 'text-xs font-bold px-2 py-1 rounded-full ';
    
    if (difficulty === 'lätt') badge.className = baseClasses + 'bg-green-100 text-green-800';
    else if (difficulty === 'medel') badge.className = baseClasses + 'bg-yellow-100 text-yellow-800';
    else badge.className = baseClasses + 'bg-red-100 text-red-800';
}

function loadQuestion() {
    userOrder = [];
    mistakeMade = false;
    currentQuestionScore = 0;
    
    if (!isSinglePlayer) {
        players.forEach(p => {
            p.roundPot = 0;
            p.eliminatedInRound = false;
            p.eliminationReason = null;
        });
    }
    
    optionsGrid.innerHTML = '';
    nextQuestionBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    stopBtn.disabled = false;
    
    if (currentQuestionIndex >= questionsToPlay.length) {
        if (isSinglePlayer) {
            endSinglePlayerGame();
        } else {
            endGame();
        }
        return;
    }

    if (!isSinglePlayer) {
        currentPlayerIndex = questionStarterIndex;
        updateScoreboard();
    } else {
        renderStars(4); // Render 4 empty stars for single player
        updateSinglePlayerDisplay();
    }
    updateGameControls();

    const question = questionsToPlay[currentQuestionIndex];
    
    questionCounter.textContent = `Fråga ${currentQuestionIndex + 1} / ${questionsToPlay.length}`;
    setDifficultyBadge(question.svårighetsgrad);
    questionText.textContent = question.fråga;
    
    const shuffledOptions = [...question.alternativ];
    shuffleArray(shuffledOptions);

    optionsGrid.className = 'grid grid-cols-1 gap-3 sm:gap-4 my-4 sm:my-6';

    if (question.typ === 'ordna') {
        questionInstruction.textContent = isSinglePlayer ? 
            'Klicka på alternativen i rätt ordning. Ett fel och du förlorar frågans poäng.' :
            'Klicka på alternativen i rätt ordning.';
        shuffledOptions.forEach(optionText => createOrderButton(optionText));
    } else { // 'hör_till'
        questionInstruction.textContent = isSinglePlayer ?
            'Bedöm varje alternativ. Ett fel och du förlorar frågans poäng.' :
            'Bedöm varje alternativ.';
        shuffledOptions.forEach(optionText => createBelongsToOption(optionText));
    }
}

function setAllOptionsDisabled(disabled) {
    optionsGrid.querySelectorAll('button').forEach(btn => btn.disabled = disabled);
}

function nextTurn() {
    const activePlayers = players.filter(p => !p.eliminatedInRound);
    if (activePlayers.length === 0) {
        concludeQuestionRound();
        return;
    }

    let nextIndex = (currentPlayerIndex + 1) % players.length;
    while(players[nextIndex].eliminatedInRound) {
        nextIndex = (nextIndex + 1) % players.length;
    }
    currentPlayerIndex = nextIndex;
    
    updateScoreboard();
    updateGameControls();
    setAllOptionsDisabled(false);
}

function concludeQuestionRound() {
    players.forEach(player => {
        if (!player.eliminatedInRound) {
            player.score += player.roundPot;
            player.roundPot = 0;
            player.eliminatedInRound = true; 
            player.eliminationReason = 'finished';
        }
    });

    setAllOptionsDisabled(true);
    questionStarterIndex = (questionStarterIndex + 1) % players.length;
    
    updateScoreboard();
    updateGameControls();

    const question = questionsToPlay[currentQuestionIndex];
    if (question.typ === 'ordna') {
        feedbackOrder();
    } else {
        feedbackBelongsTo();
    }
}

function createOrderButton(optionText) {
    const button = document.createElement('button');
    button.className = 'option-btn w-full text-left p-3 sm:p-4 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-400 text-sm sm:text-base';
    button.textContent = optionText;
    button.addEventListener('click', () => handleOrderClick(button, optionText));
    optionsGrid.appendChild(button);
}

function createBelongsToOption(optionText) {
    const container = document.createElement('div');
    container.className = 'belongs-option-container w-full text-left p-2 rounded-lg border-2 border-slate-300 bg-white';
    
    const text = document.createElement('span');
    text.textContent = optionText;
    text.className = 'flex-grow pr-2 sm:pr-4 text-sm sm:text-base';

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'decision-buttons';

    const yesBtn = document.createElement('button');
    yesBtn.innerHTML = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
    yesBtn.className = 'yes-btn';
    
    const noBtn = document.createElement('button');
    noBtn.innerHTML = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    noBtn.className = 'no-btn';

    yesBtn.addEventListener('click', () => handleBelongsDecision(true, container, yesBtn, noBtn));
    noBtn.addEventListener('click', () => handleBelongsDecision(false, container, yesBtn, noBtn));

    buttonWrapper.appendChild(yesBtn);
    buttonWrapper.appendChild(noBtn);
    container.appendChild(text);
    container.appendChild(buttonWrapper);
    optionsGrid.appendChild(container);
}

function handleOrderClick(button, optionText) {
    if (isSinglePlayer && mistakeMade) return;
    
    const question = questionsToPlay[currentQuestionIndex];
    const isCorrectStep = question.rätt_ordning[userOrder.length] === optionText;

    if (isSinglePlayer) {
        if (isCorrectStep) {
            userOrder.push(optionText);
            currentQuestionScore++;
            updateStars(currentQuestionScore);
            showPointAnimation(0, "+1");
            
            button.className = 'option-btn w-full text-left p-4 rounded-lg border-2 order-selected';
            button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-blue-600 rounded-full font-bold">${userOrder.length}</span> ${optionText}`;
            button.disabled = true;

            if (userOrder.length === 4) {
                endSinglePlayerQuestion(currentQuestionScore);
            }
        } else {
            mistakeMade = true;
            currentQuestionScore = 0;
            updateStars(0);
            button.classList.add('incorrect-step');
            endSinglePlayerQuestion(0);
        }
    } else {
        // Multiplayer logic
        setAllOptionsDisabled(true);
        
        if (isCorrectStep) {
            userOrder.push(optionText);
            players[currentPlayerIndex].roundPot++;
            showPointAnimation(currentPlayerIndex, "+1");
            updateScoreboard();
            
            button.className = 'option-btn w-full text-left p-3 sm:p-4 rounded-lg border-2 order-selected text-sm sm:text-base';
            button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-blue-600 rounded-full font-bold">${userOrder.length}</span> ${optionText}`;
            button.disabled = true;

            if (userOrder.length === question.alternativ.length) {
                concludeQuestionRound();
            } else {
                setTimeout(nextTurn, 500);
            }
        } else {
            players[currentPlayerIndex].roundPot = 0;
            players[currentPlayerIndex].eliminatedInRound = true;
            players[currentPlayerIndex].eliminationReason = 'wrong';
            button.classList.add('incorrect-step');
            updateScoreboard();
            
            setTimeout(nextTurn, 1000);
        }
    }
}

function handleBelongsDecision(userDecision, container, yesBtn, noBtn) {
    if (isSinglePlayer && mistakeMade) return;
    
    const question = questionsToPlay[currentQuestionIndex];
    const optionText = container.querySelector('span').textContent;
    const correctOptions = question.tillhör_index.map(i => question.alternativ[i]);
    const actuallyBelongs = correctOptions.includes(optionText);
    const isCorrect = (userDecision === actuallyBelongs);

    yesBtn.disabled = true;
    noBtn.disabled = true;
    container.dataset.decided = 'true';

    const clickedBtn = userDecision ? yesBtn : noBtn;
    const otherBtn = userDecision ? noBtn : yesBtn;
    otherBtn.classList.add('deselected');

    if (isSinglePlayer) {
        if (isCorrect) {
            currentQuestionScore++;
            updateStars(currentQuestionScore);
            showPointAnimation(0, "+1");
            container.classList.add('choice-made');
            clickedBtn.classList.add('correct-selection');
        } else {
            clickedBtn.classList.add('selected'); 
            mistakeMade = true;
            currentQuestionScore = 0;
            updateStars(0);
            container.classList.add('incorrect-choice');
            endSinglePlayerQuestion(0);
        }
    } else {
        // Multiplayer logic
        setAllOptionsDisabled(true);
        let timeout = 1000;

        if (isCorrect) {
            players[currentPlayerIndex].roundPot++;
            showPointAnimation(currentPlayerIndex, "+1");
            container.classList.add('choice-made');
            clickedBtn.classList.add('correct-selection');
        } else {
            players[currentPlayerIndex].roundPot = 0;
            players[currentPlayerIndex].eliminatedInRound = true;
            players[currentPlayerIndex].eliminationReason = 'wrong';
            container.classList.add('incorrect-choice');
        }
        updateScoreboard();
        
        const allDecided = Array.from(optionsGrid.querySelectorAll('.belongs-option-container'))
                                         .every(c => c.dataset.decided === 'true');

        if (allDecided) {
            setTimeout(concludeQuestionRound, timeout);
        } else {
            setTimeout(nextTurn, timeout);
        }
    }
}

function playerStops() {
    if (isSinglePlayer) {
        if (currentQuestionScore > 0) {
            showPointAnimation(0, `+${currentQuestionScore}p`, true);
        }
        endSinglePlayerQuestion(currentQuestionScore);
    } else {
        const player = players[currentPlayerIndex];
        if (player.roundPot > 0) {
             showPointAnimation(currentPlayerIndex, `+${player.roundPot}p`, true);
        }
        player.score += player.roundPot;
        player.roundPot = 0;
        player.eliminatedInRound = true;
        player.eliminationReason = 'stopped';
        updateScoreboard();
        nextTurn();
    }
}

function feedbackOrder() {
    const buttons = optionsGrid.querySelectorAll('button');
    buttons.forEach(btn => {
        let btnText = btn.textContent;
        const span = btn.querySelector('span');
        if (span) btnText = btn.textContent.substring(span.textContent.length).trim();

        if (userOrder.includes(btnText)) {
            btn.classList.remove('order-selected');
            btn.classList.add('correct-step'); 
        }
    });
}

function feedbackBelongsTo() {
    const question = questionsToPlay[currentQuestionIndex];
    const correctOptions = question.tillhör_index.map(i => question.alternativ[i]);
    const containers = optionsGrid.querySelectorAll('.belongs-option-container');

    containers.forEach(container => {
        const text = container.querySelector('span').textContent;
        const yesBtn = container.querySelector('.yes-btn');
        const noBtn = container.querySelector('.no-btn');
        const actuallyBelongs = correctOptions.includes(text);

        if (actuallyBelongs) {
            if (!yesBtn.classList.contains('correct-selection')) {
                 yesBtn.classList.add('correct-answer-highlight');
            }
        } else {
             if (!noBtn.classList.contains('correct-selection')) {
                 noBtn.classList.add('correct-answer-highlight');
            }
        }
    });
}

function endGame() {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    players.sort((a, b) => b.score - a.score);
    finalScoreboard.innerHTML = '';

    players.forEach((player, index) => {
        const rankDiv = document.createElement('div');
        rankDiv.className = 'flex items-center gap-4 p-3 sm:p-4 bg-slate-100 rounded-lg';
        
        let rankContent;
        if (index === 0) {
            rankDiv.classList.add('border-2', 'border-amber-400');
            rankContent = `<div class="text-2xl sm:text-3xl">🥇</div> 
                           <h3 class="text-lg sm:text-xl font-bold text-amber-600">${player.name}</h3> 
                           <p class="ml-auto text-lg sm:text-xl font-bold text-amber-600">${player.score} poäng</p>`;
        } else if (index === 1) {
            rankDiv.classList.add('border-2', 'border-slate-300');
            rankContent = `<div class="text-2xl sm:text-3xl">🥈</div> 
                           <h3 class="text-base sm:text-lg font-semibold text-slate-500">${player.name}</h3> 
                           <p class="ml-auto text-base sm:text-lg font-semibold text-slate-500">${player.score} poäng</p>`;
        } else if (index === 2) {
             rankDiv.classList.add('border-2', 'border-amber-700');
             rankContent = `<div class="text-2xl sm:text-3xl">🥉</div> 
                            <h3 class="text-base sm:text-lg font-medium text-amber-800">${player.name}</h3> 
                            <p class="ml-auto text-base sm:text-lg font-medium text-amber-800">${player.score} poäng</p>`;
        } else {
            rankContent = `<span class="font-bold w-6 text-center">${index + 1}.</span> 
                           <span class="text-slate-700">${player.name}</span> 
                           <span class="ml-auto text-slate-700">${player.score} poäng</span>`;
        }
        rankDiv.innerHTML = rankContent;
        finalScoreboard.appendChild(rankDiv);
    });

}

function restartGame() {
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startMain.classList.remove('hidden');
    playerSetup.classList.add('hidden');
    
    // Reset single player display
    singlePlayerFinal.classList.add('hidden');
    finalScoreboard.classList.remove('hidden');
    
    // Reset game state
    isSinglePlayer = false;
    totalScore = 0;
    currentQuestionScore = 0;
    mistakeMade = false;
}

// --- Pack Shop Functions ---
function populatePackShop() {
    packGrid.innerHTML = '';
    questionPacks.forEach(pack => {
        const card = document.createElement('div');
        card.className = 'pack-card cursor-pointer bg-slate-50 border-2 border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:bg-white flex flex-col justify-between';
        card.dataset.packName = pack.name;
        
        if (selectedPacks.includes(pack.name)) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <div>
                <div class="selected-check">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="font-bold text-lg text-slate-800 mb-1 pr-8">${pack.name}</h3>
                <p class="text-slate-600 text-sm leading-relaxed">${pack.description}</p>
            </div>
            <div class="mt-auto pt-3 border-t border-slate-200 text-right">
                <span class="font-bold text-blue-600 text-lg">GRATIS</span>
            </div>
        `;
        
        card.addEventListener('click', () => togglePackSelection(card, pack.name));
        packGrid.appendChild(card);
    });
}

function togglePackSelection(card, packName) {
    card.classList.toggle('selected');
    if (selectedPacks.includes(packName)) {
        selectedPacks = selectedPacks.filter(p => p !== packName);
    } else {
        selectedPacks.push(packName);
    }
}

function openPackShop() { packShopModal.classList.remove('hidden'); }
function closePackShop() { packShopModal.classList.add('hidden'); }

// --- Event Listeners ---
showPlayerSetupBtn.addEventListener('click', showPlayerSetup);
playerCountSelect.addEventListener('change', createPlayerInputs);
startGameBtn.addEventListener('click', initializeGame);
restartBtn.addEventListener('click', restartGame);

stopBtn.addEventListener('click', playerStops);

nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

// Pack Shop Listeners
openPackShopBtn.addEventListener('click', openPackShop);
closePackShopBtn.addEventListener('click', closePackShop);
confirmPacksBtn.addEventListener('click', closePackShop);

// Challenge form listeners
showChallengeFormBtn.addEventListener('click', () => {
    startMain.classList.add('hidden');
    challengeForm.classList.remove('hidden');
});

backToStartBtn.addEventListener('click', () => {
    challengeForm.classList.add('hidden');
    startMain.classList.remove('hidden');
    challengeConfirmation.classList.add('hidden');
});

sendChallengeBtn.addEventListener('click', () => {
     const emailInput = document.getElementById('friend-email');
     if (emailInput.value && emailInput.checkValidity()) {
         console.log(`Mockup: Skickar utmaning till ${emailInput.value}`);
         challengeConfirmation.classList.remove('hidden');
         emailInput.value = '';
         setTimeout(() => {
             challengeConfirmation.classList.add('hidden');
         }, 3000);
     } else {
         console.log("Invalid email for challenge.");
     }
});


// --- Initial Setup ---
populatePackShop();
createPlayerInputs();
updateScoreboard();