// --- DATA ---
let allQuestions = [];

// --- Player Identity System ---
let currentPlayer = null;

// Initialize or get player identity
function initializePlayer() {
    let playerId = localStorage.getItem('playerId');
    let playerName = localStorage.getItem('playerName');
    
    if (!playerId) {
        playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('playerId', playerId);
    }
    
    currentPlayer = {
        id: playerId,
        name: playerName || null
    };
    
    return currentPlayer;
}

// Set player name (first time setup)
function setPlayerName(name) {
    localStorage.setItem('playerName', name);
    currentPlayer.name = name;
    console.log('Player identity set:', currentPlayer);
}

// Challenge System State
let ischallengeMode = false;
let challengeId = null;
let challengeData = null;
let challengeQuestions = [];
let challengeQuestionScores = [];
let pendingChallengeCreation = false;

// Show challenger hint in challenge mode
function showChallengerHint() {
    if (!ischallengeMode || !challengeId || !challengeData) return;
    
    const hintElement = document.getElementById('challenger-hint');
    
    // Debug logging to understand the issue
    console.log('=== Challenge Hint Debug ===');
    console.log('Current Question Index:', currentQuestionIndex);
    console.log('Current Question:', questionsToPlay[currentQuestionIndex]?.fråga);
    console.log('Challenger Question Scores:', challengeData.challenger.questionScores);
    console.log('Scores array length:', challengeData.challenger.questionScores.length);
    console.log('Expected scores for all questions:', challengeData.challenger.questionScores);
    
    const score = challengeData.challenger.questionScores[currentQuestionIndex];
    
    if (score !== undefined) {
        hintElement.innerHTML = `
            <div class="challenger-hint-box">
                💡 ${challengeData.challenger.name}: ${score} poäng på denna fråga
            </div>
        `;
        hintElement.classList.remove('hidden');
    } else {
        console.warn('No score found for question index:', currentQuestionIndex);
        hintElement.classList.add('hidden');
    }
}

// Load questions from a specific pack
async function loadPackQuestions(packName) {
    const pack = questionPacks.find(p => p.name === packName);
    
    if (!pack || pack.status !== 'available' || !pack.file) {
        console.warn(`Pack "${packName}" not available or has no file`);
        return [];
    }
    
    try {
        const response = await fetch(`data/${pack.file}`);
        const data = await response.json();
        
        // Map questions with pack name
        const questions = data.questions.map(q => ({
            ...q,
            pack: packName
        }));
        
        console.log(`Loaded ${questions.length} questions from pack: ${packName}`);
        return questions;
    } catch (error) {
        console.error(`Failed to load pack "${packName}":`, error);
        return [];
    }
}

// Load questions from JSON file (fallback or default)
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

// Load questions based on selected pack
async function loadQuestionsForGame() {
    if (selectedPack) {
        // Load specific pack
        const packQuestions = await loadPackQuestions(selectedPack);
        if (packQuestions.length > 0) {
            allQuestions = packQuestions;
            return allQuestions;
        }
        // Fallback if pack loading fails
        console.warn(`Failed to load pack "${selectedPack}", falling back to default questions`);
    }
    
    // Load default questions
    return await loadQuestions();
}

const questionPacks = [
    { 
        name: "Grund", 
        description: "Grundläggande frågor för Ordna-spelet", 
        status: "available", 
        file: "questions-grund.json",
        price: "INKLUDERAT"
    },
    { 
        name: "Boomer", 
        description: "Frågor om en tid då allt var bättre. Eller var det?", 
        status: "available", 
        file: "questions-boomer.json",
        price: "GRATIS"
    },
    { 
        name: "Blandat 1", 
        description: "Varierade frågor om geografi, historia, teknik och allmänbildning", 
        status: "available", 
        file: "questions-blandat1.json",
        price: "GRATIS"
    },
    { 
        name: "Blandat med B", 
        description: "Kuriosa, populärkultur och litteratur genom tiderna", 
        status: "available", 
        file: "questions-blandat-b.json",
        price: "GRATIS"
    },
    { 
        name: "Nörden", 
        description: "För dig som kan din superhjälte och din C++.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Boksmart och kultiverad", 
        description: "Testa dina kunskaper om finkultur och klassisk bildning.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Gatesmart och depraverad", 
        description: "Frågor som inte lärs ut i skolan. Tur är väl det.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Filmfantasten", 
        description: "Känner du igen repliken? Vet du vem som regisserade?", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Familjen Normal", 
        description: "Lagom svåra frågor för en helt vanlig fredagskväll.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Familjen Hurtig", 
        description: "Allt om sport, hälsa och att ständigt vara på språng.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Familjen Ullared", 
        description: "Fynd, familjebråk och folkfest i Gekås-anda.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Plugghästen", 
        description: "Geografins, kemins och grammatikens värld väntar.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Galaxhjärnan", 
        description: "Stora frågor om universum, vetenskap och existens.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "True Crime", 
        description: "Gåtan, ledtrådarna och de ökända fallen.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Historia", 
        description: "Från antiken till kalla kriget – testa ditt historieminne.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    }
];

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const startMain = document.getElementById('start-main');
const playerSetup = document.getElementById('player-setup');
const showPlayerSetupBtn = document.getElementById('show-player-setup-btn');
const playerCountSelect = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names-container');
const startGameBtn = document.getElementById('start-game-btn');


// Player Name Setup Elements
const playerNameSetup = document.getElementById('player-name-setup');
const playerNameInput = document.getElementById('player-name-input');
const savePlayerNameBtn = document.getElementById('save-player-name-btn');

// Challenge Form Elements
const challengeForm = document.getElementById('challenge-form');
const showChallengeFormBtn = document.getElementById('show-challenge-form-btn');
const challengerNameDisplay = document.getElementById('challenger-name-display');
const createChallengeBtn = document.getElementById('create-challenge-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const challengeSuccess = document.getElementById('challenge-success');
const challengeError = document.getElementById('challenge-error');
const challengeLink = document.getElementById('challenge-link');
const copyLinkBtn = document.getElementById('copy-link-btn');
const shareBtn = document.getElementById('share-btn');

// Challenge Accept Elements
const challengeAccept = document.getElementById('challenge-accept');
const challengerDisplayName = document.getElementById('challenger-display-name');
const acceptChallengeBtn = document.getElementById('accept-challenge-btn');
const declineChallengeBtn = document.getElementById('decline-challenge-btn');

// Notifications
const notificationsArea = document.getElementById('notifications-area');

const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const restartBtn = document.getElementById('restart-btn');
const packSelect = document.getElementById('pack-select');
const challengePackSelect = document.getElementById('challenge-pack-select');
const questionCounter = document.getElementById('question-counter');
const scoreboard = document.getElementById('scoreboard');
const difficultyBadge = document.getElementById('difficulty-badge');
const questionText = document.getElementById('question-text');
const questionInstruction = document.getElementById('question-instruction');
const optionsGrid = document.getElementById('options-grid');
const stopBtn = document.getElementById('stop-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const finalScoreboard = document.getElementById('final-scoreboard');

// New decision button elements
const decisionButton = document.getElementById('decision-button');
const stopSide = document.getElementById('stop-side');
const nextSide = document.getElementById('next-side');
const largeNextQuestionBtn = document.getElementById('large-next-question-btn');

// Function to trigger the attention animation on decision button
function triggerDecisionButtonAnimation() {
    // Remove animation class if it exists (to restart animation)
    decisionButton.classList.remove('attention');
    
    // Force reflow to restart animation
    void decisionButton.offsetWidth;
    
    // Add animation class
    decisionButton.classList.add('attention');
    
    // Remove animation class after it completes
    setTimeout(() => {
        decisionButton.classList.remove('attention');
    }, 2400); // 0.8s * 3 iterations
}

// Pack Shop Elements
const packShopModal = document.getElementById('pack-shop-modal');
const openPackShopBtn = document.getElementById('open-pack-shop-btn');
const closePackShopBtn = document.getElementById('close-pack-shop-btn');
const confirmPacksBtn = document.getElementById('confirm-packs-btn');
const packGrid = document.getElementById('pack-grid');

// Single Player Elements (Legacy - will be phased out)
const singlePlayerScore = document.getElementById('single-player-score');
const singlePlayerProgress = document.getElementById('single-player-progress');
const progressBar = document.getElementById('progress-bar');
const singlePlayerStars = document.getElementById('single-player-stars');
const currentScoreContainer = document.getElementById('current-score-container');
const singlePlayerFinal = document.getElementById('single-player-final');
const singleFinalScore = document.getElementById('single-final-score');
const endScreenSubtitle = document.getElementById('end-screen-subtitle');

// New unified elements
const playerStatusBar = document.getElementById('player-status-bar');
const activePlayerDisplay = document.getElementById('active-player-display');
const miniScores = document.getElementById('mini-scores');

// --- Game State ---
let currentQuestionIndex = 0;
let questionsToPlay = [];
let userOrder = []; 
let selectedPacks = questionPacks.map(p => p.name);
let selectedPack = null; // Currently selected pack for playing

// Game State - Unified for both single and multiplayer
let players = [];
let currentPlayerIndex = 0;
let questionStarterIndex = 0;
// mistakeMade removed - now using player-specific states

// Helper to check if single player mode
function isSinglePlayerMode() {
    return players.length === 1;
}

// Get current player
function getCurrentPlayer() {
    return players[currentPlayerIndex];
}

// Get total score for single player display
function getTotalScore() {
    if (isSinglePlayerMode()) {
        return players[0].score;
    }
    return 0;
}

// Get current question score (pot)
function getCurrentQuestionScore() {
    return getCurrentPlayer().roundPot;
}

// NEW: Player-specific state management helpers
function isPlayerActive(player) {
    return !player.completedRound && player.completionReason === null;
}

function getCurrentActivePlayer() {
    return players.find(p => isPlayerActive(p)) || null;
}

function hasActivePlayersInRound() {
    return players.some(p => isPlayerActive(p));
}

function isQuestionCompleted() {
    // Question is completed when:
    // 1. No active players remain (all stopped/eliminated), OR
    // 2. Current player has completed their turn (stopped or eliminated)
    
    if (isSinglePlayerMode()) {
        // Single player: question is complete when player is done (stopped/wrong/finished)
        const currentPlayer = getCurrentPlayer();
        return currentPlayer.completedRound;
    } else {
        return !hasActivePlayersInRound();
    }
}

function isCurrentQuestionFullyAnswered() {
    const question = questionsToPlay[currentQuestionIndex];
    if (!question) return false;
    
    if (question.typ === 'ordna') {
        // Check if all alternatives have been ordered
        return userOrder.length === question.alternativ.length;
    } else if (question.typ === 'hör_till') {
        // Check if all alternatives have been decided (yes/no)
        const optionContainers = document.querySelectorAll('.belongs-option-container');
        return Array.from(optionContainers).every(cont => cont.dataset.decided === 'true');
    }
    
    return false;
}

// Central function to handle question completion
function checkAndHandleQuestionCompletion() {
    if (isQuestionCompleted()) {
        // Show correct answers for all players
        showCorrectAnswers();
        
        // Update button states
        updateGameControls();
        
        // In single player we're done
        // In multiplayer we wait for all players to press next
    }
}

function eliminateCurrentPlayer() {
    const currentPlayer = getCurrentPlayer();
    const pointsToLose = currentPlayer.roundPot;
    
    // Reset player state
    currentPlayer.roundPot = 0;
    currentPlayer.completedRound = true;
    currentPlayer.completionReason = 'wrong';
    
    // Save 0 points for challenge mode when eliminated
    if (ischallengeMode && isSinglePlayerMode()) {
        // Make sure we don't save duplicate scores
        if (challengeQuestionScores.length === currentQuestionIndex) {
            challengeQuestionScores.push(0);
            console.log('Saved score for question', currentQuestionIndex, ': 0 (eliminated)');
            console.log('All scores so far:', challengeQuestionScores);
        }
    }
    
    enableNextButtonAfterMistake(pointsToLose);
    
    // Update displays
    updatePlayerDisplay();
    updateGameControls();
    
    // Check if question is complete after elimination
    checkAndHandleQuestionCompletion();
}

// REPLACED progressToNextPlayerOrConclude with more robust design
// New central function that handles both question completion and turn progression
function determineNextAction() {
    // 1. First priority: Check if question is physically completed (all options answered)
    if (isCurrentQuestionFullyAnswered()) {
        concludeQuestionImmediately();
        return;
    }
    
    // 2. Second: Check if there are any active players remaining
    if (!hasActivePlayersInRound()) {
        checkAndHandleQuestionCompletion();
        return;
    }
    
    // 3. Otherwise: Continue to next player (multiplayer only)
    if (!isSinglePlayerMode()) {
        setTimeout(() => {
            // Double-check state hasn't changed during timeout
            if (hasActivePlayersInRound() && !isCurrentQuestionFullyAnswered()) {
                nextTurn();
            } else {
                determineNextAction(); // Re-evaluate
            }
        }, 500);
    } else {
        // Single player with active player but not all options answered - just update controls
        updateGameControls();
    }
}

// New function to immediately conclude a question when all options are answered
function concludeQuestionImmediately() {
    // Auto-secure points for all active players
    players.forEach(player => {
        if (isPlayerActive(player) && player.roundPot > 0) {
            player.score += player.roundPot;
            player.roundPot = 0;
            player.completedRound = true;
            player.completionReason = 'all_options_answered';
        }
    });
    
    // Update displays and show results
    updateScoreboard();
    updatePlayerDisplay();
    showCorrectAnswers();
    updateGameControls();
}

// NEW: Clean UI reset for turn changes
function resetPlayerUIForTurn() {
    if (isSinglePlayerMode()) return;
    
    // Reset decision button state
    stopSide.classList.remove('disabled', 'completed');
    stopSide.disabled = false;
    stopSide.dataset.processing = 'false';
    
    // Reset button content
    const stopIcon = document.querySelector('#stop-side .decision-icon');
    const stopAction = document.querySelector('#stop-side .decision-action');
    if (stopIcon) stopIcon.textContent = '🛡️';
    if (stopAction) stopAction.textContent = 'Stanna';
    
    // Reset points display styling
    const pointsElement = document.querySelector('#stop-side .decision-points');
    if (pointsElement) {
        pointsElement.classList.remove('points-failed', 'points-draining');
    }
}

// Add point to current player (unified function)
function addPointToCurrentPlayer(sourceElement) {
    const currentPlayer = getCurrentPlayer();
    currentPlayer.roundPot++;
    
    // Use unified flying animation for all modes
    showFlyingPointToButton(sourceElement);
    
    // Update displays
    updateStopButtonPoints();
    updatePlayerDisplay();
    updateGameControls(); // Always update button states when points change
    
    // Wake up stop button if first point
    if (currentPlayer.roundPot === 1) {
        wakeUpStopButton();
    }
}

// Handle when player secures points (unified function)
function secureCurrentPoints() {
    const currentPlayer = getCurrentPlayer();
    const pointsToSecure = currentPlayer.roundPot;
    
    
    if (pointsToSecure <= 0) return;
    
    // Prevent multiple triggers
    if (stopSide.dataset.processing === 'true') return;
    stopSide.dataset.processing = 'true';
    
    // Save score for challenge mode IMMEDIATELY when securing points
    if (ischallengeMode && isSinglePlayerMode()) {
        // Only save if we haven't already saved for this question
        if (challengeQuestionScores.length === currentQuestionIndex) {
            challengeQuestionScores.push(pointsToSecure);
            console.log('Saved score for question', currentQuestionIndex, ':', pointsToSecure, 'when securing');
            console.log('All scores so far:', challengeQuestionScores);
        }
    }
    
    // Show flying animation from Stop button to display
    showFlyingPointsToTotal(pointsToSecure);
    
    // Transform stop button to "Secured" state
    transformStopButtonToSecured();
    
    // Add points to player's total score after delay
    setTimeout(() => {
        currentPlayer.score += pointsToSecure;
        currentPlayer.roundPot = 0;
        currentPlayer.completedRound = true;
        currentPlayer.completionReason = 'stopped';
        
        // Update display immediately after score change
        updatePlayerDisplay();
        
        // Handle turn progression
        if (isSinglePlayerMode()) {
            enableNextButton();
        } else {
            // Delay turn progression to let animations complete
            setTimeout(nextTurn, 800);
        }
    }, 600); // Increased delay to ensure animation completes
}

// Unified player display update
function updatePlayerDisplay() {
    playerStatusBar.classList.remove('hidden');
    
    if (isSinglePlayerMode()) {
        // Single player: show total score
        activePlayerDisplay.textContent = `Totalpoäng: ${players[0].score}`;
        miniScores.textContent = '';
        
        // Update progress bar
        const progressPercentage = (currentQuestionIndex / questionsToPlay.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        singlePlayerProgress.classList.remove('hidden');
        
        // Hide old single player score display
        singlePlayerScore.classList.add('hidden');
        scoreboard.classList.add('hidden');
    } else {
        // Multiplayer: show active player and mini scores with clear indication
        const activePlayer = getCurrentPlayer();
        activePlayerDisplay.innerHTML = `
            <span class="inline-flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                <span class="text-blue-700 font-bold text-lg">${activePlayer.name} spelar</span>
            </span>
        `;
        
        // Build mini scores with clearer active indication
        const scores = players.map(p => {
            const isActive = p === activePlayer;
            const scoreClass = isActive ? 'font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded' : 'text-gray-600';
            return `<span class="${scoreClass}">${p.name}: ${p.score}</span>`;
        }).join(' • ');
        
        miniScores.innerHTML = scores;
        
        // Hide old displays
        singlePlayerScore.classList.add('hidden');
        singlePlayerProgress.classList.add('hidden');
        scoreboard.classList.add('hidden');
    }
}

// --- Challenge Functions ---

// Check if there's a challenge in URL
function checkForChallenge() {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeParam = urlParams.get('challenge');
    
    if (challengeParam) {
        challengeId = challengeParam;
        return true;
    }
    return false;
}

// Show challenge acceptance screen
async function showChallengeAcceptScreen() {
    try {
        // Get challenge details from Firebase
        challengeData = await FirebaseAPI.getChallenge(challengeId);
        
        challengerDisplayName.textContent = challengeData.challengerName;
        
        startMain.classList.add('hidden');
        playerSetup.classList.add('hidden');
        challengeForm.classList.add('hidden');
        challengeAccept.classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load challenge:', error);
        showError('Utmaningen kunde inte laddas. Kontrollera länken.');
        challengeAccept.classList.add('hidden');
        startMain.classList.remove('hidden');
    }
}

// Create a new challenge - starts the game immediately
async function createChallenge() {
    if (!currentPlayer || !currentPlayer.name) {
        console.error('Player not set up');
        return;
    }
    
    try {
        // Set selected pack from challenge dropdown before loading questions
        selectedPack = challengePackSelect.value || null;
        console.log('Creating challenge with pack:', selectedPack || 'All questions');
        
        // Load questions based on selected pack
        await loadQuestionsForGame();
        
        if (allQuestions.length === 0) {
            throw new Error('No questions available for selected pack');
        }
        
        // Select 5 random questions from loaded pack
        const processedQuestions = processQuestions(allQuestions);
        const shuffled = [...processedQuestions];
        shuffleArray(shuffled);
        challengeQuestions = shuffled.slice(0, 5);
        
        console.log('Creating challenge with questions:', challengeQuestions.map((q, i) => `${i}: ${q.fråga}`));
        
        // Set up challenge mode
        ischallengeMode = true;
        challengeId = null; // Will be set after game completion
        challengeQuestionScores = [];
        
        // Start the game directly as single player
        players = [{
            name: currentPlayer.name,
            score: 0,
            roundPot: 0,
            completedRound: false,
            completionReason: null
        }];
        questionsToPlay = challengeQuestions;
        
        // Hide challenge form and show game
        challengeForm.classList.add('hidden');
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Setup UI for single player
        singlePlayerScore.classList.remove('hidden');
        singlePlayerProgress.classList.remove('hidden');
        // singlePlayerStars removed - points now shown in decision button
        scoreboard.classList.add('hidden');
        
        currentQuestionIndex = 0;
        loadQuestion();
        
    } catch (error) {
        console.error('Failed to create challenge:', error);
        showError('Kunde inte skapa utmaning. Försök igen.');
    }
}

// Check for new challenge results
async function checkForNotifications() {
    if (!currentPlayer || !currentPlayer.name) return;
    
    try {
        const lastCheck = localStorage.getItem('lastNotificationCheck');
        const lastCheckTime = lastCheck ? new Date(lastCheck) : null;
        
        const newResults = await FirebaseAPI.getNewCompletedChallenges(
            currentPlayer.name,
            lastCheckTime
        );
        
        if (newResults.length > 0) {
            showNotifications(newResults);
        }
        
        // Update last check time
        localStorage.setItem('lastNotificationCheck', new Date().toISOString());
    } catch (error) {
        console.error('Failed to check notifications:', error);
    }
}

// Load and display my challenges
async function loadMyChallenges() {
    const myChallengesSection = document.getElementById('my-challenges-section');
    const myChallengesList = document.getElementById('my-challenges-list');
    
    if (!currentPlayer || !currentPlayer.name) {
        myChallengesSection.classList.add('hidden');
        return;
    }
    
    // Get all challenges from localStorage
    const allChallenges = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('challenge_')) {
            try {
                const challenge = JSON.parse(localStorage.getItem(key));
                allChallenges.push(challenge);
            } catch (e) {
                // Invalid data, skip
            }
        }
    }
    
    if (allChallenges.length === 0) {
        myChallengesSection.classList.add('hidden');
        return;
    }
    
    // Sort by most recent
    allChallenges.sort((a, b) => {
        const aTime = a.createdAt || a.completedAt;
        const bTime = b.createdAt || b.completedAt;
        return new Date(bTime) - new Date(aTime);
    });
    
    // Display challenges
    myChallengesList.innerHTML = '';
    allChallenges.slice(0, 5).forEach(challenge => {
        const item = document.createElement('div');
        item.className = 'bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors';
        
        let statusBadge = '';
        let statusText = '';
        
        if (challenge.role === 'challenger') {
            if (!challenge.hasSeenResult) {
                // Check if completed
                checkChallengeCompletionStatus(challenge.id).then(isComplete => {
                    if (isComplete) {
                        item.querySelector('.status-badge').innerHTML = 
                            '<span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Klar!</span>';
                    }
                });
            }
            statusBadge = challenge.hasSeenResult ? 
                '<span class="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">Sedd</span>' :
                '<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Väntar</span>';
            statusText = `Du: ${challenge.totalScore}p`;
        } else {
            statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Spelad</span>';
            statusText = `Du: ${challenge.totalScore}p`;
        }
        
        const timeAgo = getTimeAgo(challenge.createdAt || challenge.completedAt);
        
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="font-semibold text-slate-800">${challenge.role === 'challenger' ? 'Utmanade' : 'Utmanad av'} någon</p>
                    <p class="text-sm text-slate-500">${timeAgo} • ${statusText}</p>
                </div>
                <div class="status-badge">${statusBadge}</div>
            </div>
        `;
        
        item.addEventListener('click', async () => {
            if (challenge.role === 'challenger') {
                const isComplete = await checkChallengeCompletionStatus(challenge.id);
                if (isComplete) {
                    showChallengeResultView(challenge.id);
                } else {
                    challengeId = challenge.id;
                    showWaitingForOpponentView(challenge.id);
                }
            } else {
                showChallengeResultView(challenge.id);
            }
        });
        
        myChallengesList.appendChild(item);
    });
    
    myChallengesSection.classList.remove('hidden');
}

// Helper function to check if challenge is complete
async function checkChallengeCompletionStatus(challengeId) {
    try {
        const challenge = await FirebaseAPI.getChallenge(challengeId);
        return challenge && challenge.status === 'complete';
    } catch (error) {
        return false;
    }
}

// Helper function to get time ago text
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Nyss';
    if (diffMins < 60) return `${diffMins} min sedan`;
    if (diffHours < 24) return `${diffHours} tim sedan`;
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    return date.toLocaleDateString('sv-SE');
}

// Show notifications for completed challenges
function showNotifications(results) {
    notificationsArea.innerHTML = '';
    notificationsArea.classList.remove('hidden');
    
    results.forEach(challenge => {
        const notification = document.createElement('div');
        notification.className = 'bg-green-50 border border-green-200 rounded-lg p-3 mb-2 cursor-pointer';
        const winner = challenge.opponent.totalScore > challenge.challenger.totalScore ? challenge.opponent.name : 
                       challenge.opponent.totalScore < challenge.challenger.totalScore ? 'Du' : 'Oavgjort';
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold text-green-800">🔔 ${challenge.opponent.name} har spelat klart!</p>
                    <p class="text-sm text-green-600">Vinnare: ${winner} (${challenge.opponent.totalScore} vs ${challenge.challenger.totalScore} poäng)</p>
                </div>
                <button onclick="event.stopPropagation(); this.parentElement.parentElement.remove()" class="text-green-400 hover:text-green-600 text-xl">×</button>
            </div>
        `;
        notification.addEventListener('click', () => {
            showChallengeResultView(challenge.id);
        });
        notificationsArea.appendChild(notification);
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        notificationsArea.classList.add('hidden');
    }, 10000);
}

// Utility functions
function showLoading(message) {
    createChallengeBtn.disabled = true;
    createChallengeBtn.textContent = message;
}

function hideLoading() {
    createChallengeBtn.disabled = false;
    createChallengeBtn.textContent = 'Skapa utmaning';
}

function showError(message) {
    challengeError.textContent = message;
    challengeError.classList.remove('hidden');
    setTimeout(() => {
        challengeError.classList.add('hidden');
    }, 5000);
}

// Show waiting for opponent view
function showWaitingForOpponentView(challengeId) {
    const challengeUrl = window.location.origin + window.location.pathname + 
        '?challenge=' + challengeId;
    
    // Create waiting view HTML
    const waitingHTML = `
        <div class="p-6 sm:p-8 lg:p-12 text-center">
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Utmaning skapad!</h2>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p class="text-lg font-semibold text-blue-800 mb-2">Ditt resultat: ${players[0].score} poäng</p>
                <p class="text-sm text-blue-600">Väntar på att din vän ska spela...</p>
            </div>
            
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-slate-600 mb-3">Dela denna länk:</p>
                <div class="bg-white border border-slate-300 rounded p-2 mb-3">
                    <input type="text" id="challenge-link-waiting" value="${challengeUrl}" readonly class="w-full text-xs text-gray-600 bg-transparent border-none outline-none">
                </div>
                <div class="flex space-x-2">
                    <button id="copy-link-waiting" class="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
                        Kopiera länk
                    </button>
                    <button id="share-waiting" class="flex-1 bg-slate-600 text-white py-2 px-3 rounded text-sm hover:bg-slate-700">
                        Dela
                    </button>
                </div>
            </div>
            
            <button id="check-status-btn" class="w-full bg-slate-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-700 transition-colors mb-4">
                Kolla status
            </button>
            
            <button id="back-to-start-waiting" class="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-300 transition-colors">
                Tillbaka till start
            </button>
        </div>
    `;
    
    endScreen.innerHTML = waitingHTML;
    endScreen.classList.remove('hidden');
    
    // Add event listeners
    document.getElementById('copy-link-waiting').addEventListener('click', async () => {
        const input = document.getElementById('challenge-link-waiting');
        try {
            await navigator.clipboard.writeText(input.value);
            document.getElementById('copy-link-waiting').textContent = 'Kopierad!';
            setTimeout(() => {
                document.getElementById('copy-link-waiting').textContent = 'Kopiera länk';
            }, 2000);
        } catch (err) {
            input.select();
            document.execCommand('copy');
        }
    });
    
    document.getElementById('share-waiting').addEventListener('click', async () => {
        const shareText = `${currentPlayer.name} utmanar dig i spelet Ordna!`;
        
        // Kolla om Web Share API finns (mobil och vissa desktop-browsers)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${currentPlayer.name} utmanar dig i spelet Ordna!`,
                    text: `${shareText} ${challengeUrl}`  // Slå ihop text och URL
                });
            } catch (err) {
                // Användaren avbröt delningen - gör inget
                console.log('Delning avbruten');
            }
        } else {
            // Desktop fallback - kopiera länken med meddelande
            const fullMessage = `${shareText} ${challengeUrl}`;
            try {
                await navigator.clipboard.writeText(fullMessage);
                const btn = document.getElementById('share-waiting');
                btn.innerHTML = '✓ Länk kopierad!';
                setTimeout(() => {
                    btn.textContent = 'Dela';
                }, 2000);
            } catch (err) {
                // Fallback för äldre browsers
                const input = document.getElementById('challenge-link-waiting');
                input.select();
                document.execCommand('copy');
                const btn = document.getElementById('share-waiting');
                btn.innerHTML = '✓ Länk kopierad!';
                setTimeout(() => {
                    btn.textContent = 'Dela';
                }, 2000);
            }
        }
    });
    
    document.getElementById('check-status-btn').addEventListener('click', async () => {
        await checkChallengeStatus(challengeId);
    });
    
    document.getElementById('back-to-start-waiting').addEventListener('click', () => {
        // Go directly to start screen without showing end screen
        stopChallengePolling();
        
        // Hide all screens first
        gameScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        playerSetup.classList.add('hidden');
        challengeForm.classList.add('hidden');
        
        // Show start screen
        startScreen.classList.remove('hidden');
        startMain.classList.remove('hidden');
        
        // Reset game state
        ischallengeMode = false;
        challengeId = null;
        challengeData = null;
        challengeQuestions = [];
        challengeQuestionScores = [];
        
        // Reload my challenges
        loadMyChallenges();
    });
    
    // Start polling
    startChallengePolling(challengeId);
}

// Show challenge result comparison view
async function showChallengeResultView(challengeId) {
    try {
        // Get challenge data from Firebase
        const challenge = await FirebaseAPI.getChallenge(challengeId);
        
        if (!challenge) {
            throw new Error('Challenge not found');
        }
        
        const isChallenger = challenge.challenger.name === currentPlayer.name;
        const myData = isChallenger ? challenge.challenger : challenge.opponent;
        const opponentData = isChallenger ? challenge.opponent : challenge.challenger;
        
        // Create result view HTML
        const resultHTML = `
            <div class="p-6 sm:p-8 lg:p-12">
                <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">Utmaning avslutad!</h2>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center">
                        <h3 class="font-bold text-lg mb-2">${myData.name}</h3>
                        <p class="text-3xl font-bold ${myData.totalScore > opponentData.totalScore ? 'text-green-600' : 'text-slate-600'}">${myData.totalScore} p</p>
                        <div class="mt-2 text-sm text-slate-500">
                            ${myData.questionScores.map((score, i) => `F${i+1}: ${score}p`).join(' | ')}
                        </div>
                    </div>
                    <div class="text-center">
                        <h3 class="font-bold text-lg mb-2">${opponentData.name}</h3>
                        <p class="text-3xl font-bold ${opponentData.totalScore > myData.totalScore ? 'text-green-600' : 'text-slate-600'}">${opponentData.totalScore} p</p>
                        <div class="mt-2 text-sm text-slate-500">
                            ${opponentData.questionScores.map((score, i) => `F${i+1}: ${score}p`).join(' | ')}
                        </div>
                    </div>
                </div>
                
                <div class="bg-slate-100 rounded-lg p-4 mb-6 text-center">
                    ${myData.totalScore > opponentData.totalScore ? 
                        '<p class="text-xl font-bold text-green-600">🎉 Du vann!</p>' :
                        myData.totalScore < opponentData.totalScore ?
                        '<p class="text-xl font-bold text-red-600">Du förlorade!</p>' :
                        '<p class="text-xl font-bold text-blue-600">Oavgjort!</p>'
                    }
                </div>
                
                <button id="new-challenge-btn" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors mb-3">
                    Revansch!
                </button>
                
                <button id="back-to-start-result" class="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-300 transition-colors">
                    Tillbaka till start
                </button>
            </div>
        `;
        
        endScreen.innerHTML = resultHTML;
        endScreen.classList.remove('hidden');
        
        // Update localStorage to mark as seen
        const storedChallenge = localStorage.getItem(`challenge_${challengeId}`);
        if (storedChallenge) {
            const challengeInfo = JSON.parse(storedChallenge);
            challengeInfo.hasSeenResult = true;
            localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(challengeInfo));
        }
        
        // Add event listeners
        document.getElementById('new-challenge-btn').addEventListener('click', () => {
            restartGame();
            showChallengeFormBtn.click();
        });
        
        document.getElementById('back-to-start-result').addEventListener('click', () => {
            // Go directly to start screen without showing end screen
            stopChallengePolling();
            
            // Hide all screens first
            gameScreen.classList.add('hidden');
            endScreen.classList.add('hidden');
            playerSetup.classList.add('hidden');
            challengeForm.classList.add('hidden');
            
            // Show start screen
            startScreen.classList.remove('hidden');
            startMain.classList.remove('hidden');
            
            // Reset game state
                        // Player states will be reset in resetGameState()
            ischallengeMode = false;
            challengeId = null;
            challengeData = null;
            challengeQuestions = [];
            challengeQuestionScores = [];
            
            // Reload my challenges
            loadMyChallenges();
        });
        
    } catch (error) {
        console.error('Failed to show challenge result:', error);
        showError('Kunde inte ladda resultat');
        restartGame();
    }
}

// Check challenge status
async function checkChallengeStatus(challengeId) {
    try {
        const challenge = await FirebaseAPI.getChallenge(challengeId);
        
        if (challenge && challenge.status === 'complete') {
            // Stop polling
            stopChallengePolling();
            // Show result view
            showChallengeResultView(challengeId);
        } else {
            // Show status message
            const statusBtn = document.getElementById('check-status-btn');
            if (statusBtn) {
                statusBtn.textContent = 'Väntar fortfarande...';
                setTimeout(() => {
                    statusBtn.textContent = 'Kolla status';
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Failed to check challenge status:', error);
    }
}

// Start challenge game for opponent
async function startChallengeGame() {
    try {
        // Get challenge data
        challengeData = await FirebaseAPI.getChallenge(challengeId);
        
        if (!challengeData) {
            throw new Error('Challenge not found');
        }
        
        // Check if challenge is expired
        const expiresDate = challengeData.expires.toDate ? challengeData.expires.toDate() : new Date(challengeData.expires);
        if (expiresDate < new Date()) {
            throw new Error('Challenge has expired');
        }
        
        // Check if already completed by this player
        const storedChallenge = localStorage.getItem(`challenge_${challengeId}`);
        if (storedChallenge) {
            const info = JSON.parse(storedChallenge);
            if (info.role === 'opponent') {
                showError('Du har redan spelat denna utmaning');
                showChallengeResultView(challengeId);
                return;
            }
        }
        
        // Set selected pack from challenge (for display purposes)
        selectedPack = challengeData.packName || null;
        console.log('Playing challenge with pack:', selectedPack || 'All questions');
        
        // Set up game with the same questions
        challengeQuestions = challengeData.questions;
        challengeQuestionScores = [];
        
        console.log('Starting challenge with questions:', challengeQuestions.map((q, i) => `${i}: ${q.fråga}`));
        console.log('Challenger scores per question:', challengeData.challenger.questionScores);
        console.log('Verifying: scores length =', challengeData.challenger.questionScores.length, ', questions length =', challengeQuestions.length);
        
        // Start the game as single player
        players = [{
            name: currentPlayer.name,
            score: 0,
            roundPot: 0,
            completedRound: false,
            completionReason: null
        }];
        questionsToPlay = challengeQuestions;
        
        // Hide all screens and show game
        startScreen.classList.add('hidden');
        playerSetup.classList.add('hidden');
        endScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Setup UI for single player
        singlePlayerScore.classList.remove('hidden');
        singlePlayerProgress.classList.remove('hidden');
        // singlePlayerStars removed - points now shown in decision button
        scoreboard.classList.add('hidden');
        
        currentQuestionIndex = 0;
        loadQuestion();
        
    } catch (error) {
        console.error('Failed to start challenge:', error);
        showError(error.message || 'Kunde inte starta utmaning');
        challengeAccept.classList.add('hidden');
        startMain.classList.remove('hidden');
    }
}

// Polling mechanism
let pollingInterval = null;
let pollingCount = 0;

function startChallengePolling(challengeId) {
    // Stop any existing polling
    stopChallengePolling();
    
    // Start with 10 second interval
    let currentInterval = 10000;
    
    const poll = async () => {
        pollingCount++;
        
        // Increase interval after 5 minutes (30 polls at 10s)
        if (pollingCount > 30) {
            currentInterval = 60000; // 60 seconds
            stopChallengePolling();
            pollingInterval = setInterval(poll, currentInterval);
        }
        
        await checkChallengeStatus(challengeId);
    };
    
    // Start polling
    pollingInterval = setInterval(poll, currentInterval);
    
    // Also check immediately
    checkChallengeStatus(challengeId);
}

function stopChallengePolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    pollingCount = 0;
}

// Show result screen for regular games (pack and standard)
function showGameResultScreen(score, gameType, totalQuestions) {
    console.log('Showing game result screen for:', gameType);
    
    const gameTypeName = gameType || 'Allmänna frågor';
    
    // Create result screen HTML
    const resultHTML = `
        <div class="text-center p-6 sm:p-8 lg:p-12">
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
            <p class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat!</p>
            
            <!-- Game Result -->
            <div class="bg-blue-100 text-blue-800 rounded-lg p-6 mb-8">
                <h3 class="text-xl font-semibold mb-2">${gameTypeName}</h3>
                <p class="text-sm text-blue-600 mb-3">${totalQuestions} frågor</p>
                <p class="text-6xl font-bold">${score}</p>
                <p class="text-lg">poäng</p>
            </div>
            
            <button id="back-to-start-final" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:bg-blue-700 transition-colors shadow-md">
                Tillbaka till start
            </button>
        </div>
    `;
    
    endScreen.innerHTML = resultHTML;
    endScreen.classList.remove('hidden');
    
    // Add event listener for back button
    document.getElementById('back-to-start-final').addEventListener('click', () => {
        console.log('Back to start clicked from game result');
        
        // Go back to start screen
        endScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        startMain.classList.remove('hidden');
        playerSetup.classList.add('hidden');
        challengeForm.classList.add('hidden');
        
        // Reset game state
        selectedPack = null;
        
        // Reload my challenges
        loadMyChallenges();
    });
}

// --- Functions ---


// Wake up the stop button when first point is earned
function wakeUpStopButton() {
    const decisionButton = document.getElementById('decision-button');
    decisionButton.classList.remove('inactive');
    decisionButton.classList.add('awakening');
    
    // Remove awakening class after animation
    setTimeout(() => {
        decisionButton.classList.remove('awakening');
    }, 1000);
}

// New flying point animation that goes to the stop button (unified for both modes)
function showFlyingPointToButton(sourceElement) {
    
    // Get positions
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = stopSide.getBoundingClientRect();
    
    // Create flying point element
    const flyingPoint = document.createElement('div');
    flyingPoint.className = 'flying-point';
    flyingPoint.textContent = '+1';
    
    // Start position (center of source element)
    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    
    // Target position (center of stop button)
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    
    // Set initial position
    flyingPoint.style.left = startX + 'px';
    flyingPoint.style.top = startY + 'px';
    
    document.body.appendChild(flyingPoint);
    
    // Animate to target with bezier curve
    const duration = 800;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        // Calculate current position with curve
        const currentX = startX + (targetX - startX) * easeOutCubic;
        const currentY = startY + (targetY - startY) * easeOutCubic - Math.sin(progress * Math.PI) * 50;
        
        flyingPoint.style.left = currentX + 'px';
        flyingPoint.style.top = currentY + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete - remove element and update button
            flyingPoint.remove();
            
            // Add landing effect
            decisionButton.classList.add('point-landing');
            setTimeout(() => {
                decisionButton.classList.remove('point-landing');
            }, 600);
            
            // Update button text and add glow
            updateStopButtonPoints();
            
            // Wake up button if first point
            if (currentPlayer.roundPot === 1) {
                wakeUpStopButton();
            }
        }
    }
    
    requestAnimationFrame(animate);
}

// Animate points flying from Stop button to total score
function showFlyingPointsToTotal(points) {
    const stopButton = document.getElementById('stop-side');
    
    // Get target element - use new player status bar for both single and multiplayer
    const totalScoreElement = isSinglePlayerMode() ? 
        document.getElementById('active-player-display') : // Single player target
        document.getElementById('mini-scores'); // Multiplayer target
    
    // Fallback if target not found
    if (!totalScoreElement) {
        console.error('Target element for flying points not found');
        return;
    }
    
    // Get positions
    const stopRect = stopButton.getBoundingClientRect();
    const totalRect = totalScoreElement.getBoundingClientRect();
    
    // Create flying point element
    const flyingPoint = document.createElement('div');
    flyingPoint.className = 'flying-point-to-total';
    flyingPoint.textContent = `+${points}`;
    flyingPoint.style.position = 'fixed';
    flyingPoint.style.left = (stopRect.left + stopRect.width / 2) + 'px';
    flyingPoint.style.top = (stopRect.top + stopRect.height / 2) + 'px';
    flyingPoint.style.transform = 'translate(-50%, -50%)';
    flyingPoint.style.zIndex = '1000';
    flyingPoint.style.fontSize = '24px';
    flyingPoint.style.fontWeight = 'bold';
    flyingPoint.style.color = '#15803d';
    flyingPoint.style.pointerEvents = 'none';
    flyingPoint.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    
    document.body.appendChild(flyingPoint);
    
    // Calculate control points for bezier curve
    const startX = stopRect.left + stopRect.width / 2;
    const startY = stopRect.top + stopRect.height / 2;
    const endX = totalRect.left + totalRect.width / 2;
    const endY = totalRect.top + totalRect.height / 2;
    
    const controlX1 = startX + (endX - startX) * 0.2;
    const controlY1 = startY - 100; // Arc upward
    const controlX2 = startX + (endX - startX) * 0.8;
    const controlY2 = startY - 120;
    
    let startTime = null;
    const duration = 800; // Animation duration in ms
    
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cubic bezier curve calculation
        const t = progress;
        const x = Math.pow(1-t, 3) * startX + 
                  3 * Math.pow(1-t, 2) * t * controlX1 + 
                  3 * (1-t) * Math.pow(t, 2) * controlX2 + 
                  Math.pow(t, 3) * endX;
        const y = Math.pow(1-t, 3) * startY + 
                  3 * Math.pow(1-t, 2) * t * controlY1 + 
                  3 * (1-t) * Math.pow(t, 2) * controlY2 + 
                  Math.pow(t, 3) * endY;
        
        flyingPoint.style.left = x + 'px';
        flyingPoint.style.top = y + 'px';
        
        // Fade and scale during last 20% of animation
        if (progress > 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;
            flyingPoint.style.opacity = 1 - fadeProgress;
            flyingPoint.style.transform = `translate(-50%, -50%) scale(${1 + fadeProgress * 0.5})`;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete - add glow effect to total score
            totalScoreElement.style.transition = 'all 0.3s ease';
            totalScoreElement.style.boxShadow = '0 0 20px rgba(21, 128, 61, 0.5)';
            setTimeout(() => {
                totalScoreElement.style.boxShadow = '';
            }, 600);
            
            // Remove flying point
            document.body.removeChild(flyingPoint);
        }
    }
    
    requestAnimationFrame(animate);
}

// Transform Stop button to "Secured" state after points fly away
function transformStopButtonToSecured() {
    const stopIcon = document.querySelector('#stop-side .decision-icon');
    const stopAction = document.querySelector('#stop-side .decision-action');
    const stopPoints = document.querySelector('#stop-side .decision-points');
    
    // Animate points disappearing first
    stopPoints.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    stopPoints.style.opacity = '0';
    stopPoints.style.transform = 'scale(0.8)';
    
    // After points fade, transform the button
    setTimeout(() => {
        stopIcon.textContent = '✅';
        stopAction.textContent = 'Säkrat';
        stopPoints.textContent = '';
        stopPoints.style.opacity = '';
        stopPoints.style.transform = '';
        stopPoints.style.transition = '';
        
        // Add a subtle completed state class
        stopSide.classList.add('completed');
    }, 300);
}

// Update the stop button to show current points
function updateStopButtonPoints() {
    const pointsText = document.querySelector('#stop-side .decision-points');
    const currentPlayer = getCurrentPlayer();
    const currentPot = currentPlayer.roundPot;
    
    if (isSinglePlayerMode()) {
        pointsText.textContent = `+${currentPot} poäng`;
    } else {
        pointsText.textContent = `${currentPlayer.name} +${currentPot}p`;
    }
    
    if (currentPot > 0) {
        stopSide.classList.add('has-points');
    } else {
        stopSide.classList.remove('has-points');
    }
}

// Animate points draining away when wrong answer (unified for both modes)
function animatePointsDrain(currentPoints) {
    if (currentPoints <= 0) return;
    
    const pointsElement = document.querySelector('#stop-side .decision-points');
    const stopButton = document.getElementById('stop-side');
    const currentPlayer = getCurrentPlayer();
    
    // Add shake and dark pulse effects to button
    stopButton.classList.add('button-shake', 'button-dark-pulse');
    
    let remainingPoints = currentPoints;
    const drainInterval = setInterval(() => {
        remainingPoints--;
        
        // Add color change animation to the points text
        pointsElement.classList.add('points-draining');
        
        // Show remaining points with appropriate format
        if (remainingPoints > 0) {
            if (isSinglePlayerMode()) {
                pointsElement.textContent = `+${remainingPoints} poäng`;
            } else {
                pointsElement.textContent = `${currentPlayer.name} +${remainingPoints}p`;
            }
        } else {
            pointsElement.textContent = '0p';
            // Add permanent red color class for final 0p
            pointsElement.classList.add('points-failed');
        }
        
        // Remove animation class after it completes
        setTimeout(() => {
            pointsElement.classList.remove('points-draining');
        }, 300);
        
        if (remainingPoints <= 0) {
            clearInterval(drainInterval);
            // Remove shake and pulse effects after animations complete
            setTimeout(() => {
                stopButton.classList.remove('button-shake', 'button-dark-pulse');
            }, 1500); // Wait for longest animation to complete
        }
    }, 400); // 400ms between each point decrease - slower for better visibility
}

// Handle question completion after wrong answer (disable stop, enable progression)
function enableNextButtonAfterMistake(pointsToLose = 0) {
    // Correct answers will be shown by checkAndHandleQuestionCompletion()
    
    // Animate points draining if there were any points
    if (pointsToLose > 0) {
        animatePointsDrain(pointsToLose);
        // Disable stop button AFTER animation starts
        // This way button stays normal during countdown
        setTimeout(() => {
            stopSide.classList.add('disabled');
            stopSide.disabled = true;
        }, pointsToLose * 400 + 300); // Wait for countdown to finish
    } else {
        // If no points to lose, disable immediately
        stopSide.classList.add('disabled');
        stopSide.disabled = true;
    }
    
    // Don't directly enable next button - let updateGameControls handle it
    // This prevents the bug where next button appears when other players are still active
    updateGameControls();
}

// Handle question completion (enable progression to next question)
function enableNextButton() {
    // Don't directly enable - let updateGameControls handle unified logic
    updateGameControls();
}

// Reset buttons for new question
function resetDecisionButtons() {
    // Reset stop button
    stopSide.classList.remove('disabled', 'has-points', 'completed');
    stopSide.disabled = false;
    stopSide.dataset.processing = 'false'; // Reset processing flag
    
    // Restore original stop button content
    const stopIcon = document.querySelector('#stop-side .decision-icon');
    const stopAction = document.querySelector('#stop-side .decision-action');
    stopIcon.textContent = '🛡️';
    stopAction.textContent = 'Stanna';
    
    // Disable next button for new question
    nextSide.disabled = true;
    
    // Reset points display
    updateStopButtonPoints();
    
    // Remove failed class from points to restore green color
    const pointsElement = document.querySelector('#stop-side .decision-points');
    if (pointsElement) {
        pointsElement.classList.remove('points-failed');
    }
    
    // Make decision button inactive at start of new question
    decisionButton.classList.add('inactive');
}

// Point animation for both single and multiplayer
function showPointAnimation(playerIndex, text, isBanked = false) {
    if (isSinglePlayerMode()) {
        // Star animation removed - now using flying point animation to decision button
        // No animation needed here as it's handled by showFlyingPointToButton
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

// Single Player Functions (Star system removed - now using decision button for points)

function updateSinglePlayerDisplay() {
    singlePlayerScore.textContent = `Totalpoäng: ${players[0].score}`;
    const progressPercentage = (currentQuestionIndex / questionsToPlay.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function endSinglePlayerQuestion(pointsToAdd) {
    players[0].score += pointsToAdd;
    players[0].completedRound = true; // Lock interactions for single player
    
    // NOTE: Score saving for challenge mode is now handled in secureCurrentPoints
    // to ensure it happens at the right time
    
    updateSinglePlayerDisplay();
    stopBtn.classList.add('hidden');
    decisionButton.classList.add('hidden');
    nextQuestionBtn.classList.remove('hidden');
    
    const question = questionsToPlay[currentQuestionIndex];

    if (question.typ === 'ordna') {
        feedbackOrder();
    } else {
        feedbackBelongsTo();
    }
}

async function endSinglePlayerGame() {
    gameScreen.classList.add('hidden');
    
    // If this is challenge creation mode
    if (ischallengeMode && !challengeId) {
        try {
            // Create the challenge in Firebase with the results
            const newChallengeId = await FirebaseAPI.createChallenge(
                currentPlayer.name,
                currentPlayer.id,
                challengeQuestions,
                players[0].score,
                challengeQuestionScores,
                selectedPack
            );
            
            challengeId = newChallengeId;
            
            // Save to localStorage
            const challengeInfo = {
                id: newChallengeId,
                role: 'challenger',
                playerName: currentPlayer.name,
                createdAt: new Date().toISOString(),
                hasSeenResult: false,
                totalScore: players[0].score,
                questionScores: challengeQuestionScores
            };
            localStorage.setItem(`challenge_${newChallengeId}`, JSON.stringify(challengeInfo));
            
            // Show waiting for opponent view
            showWaitingForOpponentView(newChallengeId);
            
        } catch (error) {
            console.error('Failed to create challenge:', error);
            showError('Kunde inte skapa utmaning. Försök igen.');
            endScreen.classList.remove('hidden');
            singlePlayerFinal.classList.remove('hidden');
            finalScoreboard.classList.add('hidden');
            singleFinalScore.textContent = `${players[0].score}`;
        }
    }
    // If this is accepting a challenge
    else if (ischallengeMode && challengeId) {
        try {
            await FirebaseAPI.completeChallenge(
                challengeId,
                currentPlayer.name,
                players[0].score,
                challengeQuestionScores
            );
            
            // Save to localStorage
            const challengeInfo = {
                id: challengeId,
                role: 'opponent',
                playerName: currentPlayer.name,
                completedAt: new Date().toISOString(),
                hasSeenResult: true,
                totalScore: players[0].score,
                questionScores: challengeQuestionScores
            };
            localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(challengeInfo));
            
            // Show result comparison view
            showChallengeResultView(challengeId);
            
        } catch (error) {
            console.error('Failed to complete challenge:', error);
            showError('Kunde inte spara resultat. Försök igen.');
            endScreen.classList.remove('hidden');
            singlePlayerFinal.classList.remove('hidden');
            finalScoreboard.classList.add('hidden');
            singleFinalScore.textContent = `${players[0].score}`;
        }
    }
    // Normal single player mode
    else {
        
        // Hide game screen first
        gameScreen.classList.add('hidden');
        
        // Show unified result screen for all regular games
        if (selectedPack) {
            // Pack-based game
            showGameResultScreen(players[0].score, selectedPack, questionsToPlay.length);
        } else {
            // Standard game with all questions
            showGameResultScreen(players[0].score, 'Grund', questionsToPlay.length);
        }
    }
}

// Populate pack selection dropdown
function populatePackSelect() {
    const selects = [packSelect, challengePackSelect];
    
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '';
            
            questionPacks.forEach(pack => {
                if (pack.status === 'available') {
                    const option = document.createElement('option');
                    option.value = pack.name;
                    option.textContent = pack.name;
                    // Set "Blandat med B" as default selection
                    if (pack.name === 'Blandat med B') {
                        option.selected = true;
                    }
                    select.appendChild(option);
                }
            });
        }
    });
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
    // Set selected pack from dropdown
    selectedPack = packSelect.value || null;
    console.log('Starting game with pack:', selectedPack || 'All questions');
    
    // Load questions based on selected pack
    await loadQuestionsForGame();
    
    if (allQuestions.length === 0) {
        console.error("No questions loaded!");
        alert("Kunde inte ladda frågor. Kontrollera att frågefiler finns.");
        return;
    }
    
    const nameInputs = document.querySelectorAll('.player-name-input');
    const playerCount = parseInt(playerCountSelect.value);
    players = [];
    
    // Initialize players (unified structure for both single and multiplayer)
    if (playerCount === 1) {
        players = [{
            name: 'Du',
            score: 0,
            roundPot: 0,
            completedRound: false,
            completionReason: null
        }];
    } else {
        // Handle multiplayer (with name inputs)
        players = [];
        nameInputs.forEach((input, index) => {
            players.push({
                name: input.value || `Spelare ${index + 1}`,
                score: 0,
                roundPot: 0,
                completedRound: false,
                completionReason: null
            });
        });
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
    
    // Initialize game state
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    questionStarterIndex = 0;
    shuffleArray(questionsToPlay);
    
    // Setup unified UI
    updatePlayerDisplay();
    loadQuestion();
}

function updateScoreboard() {
    scoreboard.innerHTML = '';
    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = 'player-score-card p-3 border-2 rounded-lg flex flex-col justify-between min-h-[60px]';
        
        let turnIndicatorHTML = '';
        if (player.completedRound) {
            card.classList.add('completed');
        } else if (index === currentPlayerIndex) {
            card.classList.add('active-player');
            turnIndicatorHTML = `<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">Din tur!</div>`;
        }

        let statusText = '';
        if (player.completionReason === 'stopped') {
            statusText = ' (Stannat)';
        } else if (player.completionReason === 'wrong') {
            statusText = ' (Fel)';
        }

        let roundPotHTML = '';
        if (player.roundPot > 0 && !player.completedRound) {
            roundPotHTML = `<span class="font-semibold text-green-600 ml-2">+${player.roundPot}</span>`;
        } 
        else if (player.completionReason === 'wrong') {
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
    // Always hide old buttons
    stopBtn.classList.add('hidden');
    nextQuestionBtn.classList.add('hidden');
    largeNextQuestionBtn.classList.add('hidden');
    
    const currentPlayer = getCurrentPlayer();
    
    if (!hasActivePlayersInRound() && !isSinglePlayerMode()) {
        // All players completed in multiplayer - show decision button with only next-side
        decisionButton.classList.remove('hidden');
        stopSide.classList.add('hidden'); // Hide stop side - no one can stop anymore
        nextSide.classList.remove('hidden');
        nextSide.disabled = false;
    } else if (isSinglePlayerMode()) {
        // Single player: alltid visa decision button
        decisionButton.classList.remove('hidden');
        stopSide.classList.remove('hidden');
        nextSide.classList.remove('hidden');
        
        // Stop button: aktiv endast när spelaren har poäng
        if (currentPlayer.roundPot > 0) {
            stopSide.classList.remove('disabled');
            stopSide.disabled = false;
            stopSide.classList.add('has-points');
            updateStopButtonPoints();
        } else {
            stopSide.classList.add('disabled');
            stopSide.disabled = true;
            stopSide.classList.remove('has-points');
        }
        
        // Next button: ALLTID disabled tills frågan är helt klar
        const questionCompleted = isQuestionCompleted();
        nextSide.disabled = !questionCompleted;
        
        stopSide.dataset.processing = 'false';
    } else {
        // Multiplayer active player - show decision button
        decisionButton.classList.remove('hidden');
        nextSide.classList.remove('hidden');
        nextSide.disabled = !isQuestionCompleted(); // Enable when question complete
        
        if (currentPlayer.roundPot > 0) {
            // Player has points - enable stop button
            stopSide.classList.remove('hidden');
            stopSide.classList.remove('disabled');
            stopSide.disabled = false;
        } else {
            // Player has no points - disable stop button but keep it visible
            stopSide.classList.remove('hidden');
            stopSide.classList.add('disabled');
            stopSide.disabled = true;
        }
        
        // Update button state
        stopSide.dataset.processing = 'false';
        updateStopButtonPoints();
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
    // Reset all players' active state for new question
    
    // Hide any existing explanation
    hideExplanation();
    
    // Hide challenger hint from previous question
    const hintElement = document.getElementById('challenger-hint');
    if (hintElement) {
        hintElement.classList.add('hidden');
        hintElement.innerHTML = '';
    }
    
    // Reset decision buttons for new question
    resetDecisionButtons();
    
    // Reset all players' round state for new question
    players.forEach(p => {
        p.roundPot = 0;
        p.completedRound = false;
        p.completionReason = null;
    });
    
    // Clear options and hide buttons
    optionsGrid.innerHTML = '';
    nextQuestionBtn.classList.add('hidden');
    largeNextQuestionBtn.classList.add('hidden');
    
    // Always show decision button - it will be configured per player/mode
    decisionButton.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    
    // Check if game should end
    if (currentQuestionIndex >= questionsToPlay.length) {
        endGame();
        return;
    }

    // Set starting player for this question (rotation in multiplayer)
    if (!isSinglePlayerMode()) {
        currentPlayerIndex = questionStarterIndex;
    } else {
        currentPlayerIndex = 0;
    }
    
    // Update displays
    updatePlayerDisplay();
    updateGameControls();

    const question = questionsToPlay[currentQuestionIndex];
    
    questionCounter.textContent = `Fråga ${currentQuestionIndex + 1} / ${questionsToPlay.length}`;
    setDifficultyBadge(question.svårighetsgrad);
    questionText.textContent = question.fråga;
    
    // Show challenger hint if in challenge mode
    showChallengerHint();
    
    const shuffledOptions = [...question.alternativ];
    shuffleArray(shuffledOptions);

    optionsGrid.className = 'grid grid-cols-1 gap-3 sm:gap-4 my-4 sm:my-6';

    if (question.typ === 'ordna') {
        questionInstruction.textContent = isSinglePlayerMode() ? 
            'Klicka på alternativen i rätt ordning. Ett fel och du förlorar frågans poäng.' :
            'Klicka på alternativen i rätt ordning.';
        shuffledOptions.forEach(optionText => createOrderButton(optionText));
    } else { // 'hör_till'
        questionInstruction.textContent = isSinglePlayerMode() ?
            'Bedöm varje alternativ. Ett fel och du förlorar frågans poäng.' :
            'Bedöm varje alternativ.';
        shuffledOptions.forEach(optionText => createBelongsToOption(optionText));
    }
    
    // Add cascading shimmer effect to new options
    setTimeout(() => {
        const options = optionsGrid.querySelectorAll('.option-btn, .belongs-option-container');
        options.forEach((option, index) => {
            setTimeout(() => {
                option.classList.add('option-shimmer');
                // Remove class after animation completes
                setTimeout(() => {
                    option.classList.remove('option-shimmer');
                }, 800);
            }, index * 150); // 150ms delay between each option
        });
    }, 100); // Small delay to ensure DOM is ready
}

function setAllOptionsDisabled(disabled) {
    optionsGrid.querySelectorAll('button').forEach(btn => {
        // Only enable/disable buttons that haven't been answered yet
        // Don't re-enable buttons that have been clicked in ordna questions
        if (disabled) {
            // Always disable when requested
            btn.disabled = true;
        } else {
            // Only re-enable if button hasn't been permanently disabled
            // Check if button has correct-step class (already answered in ordna)
            const isAlreadyAnswered = btn.classList.contains('correct-step') || 
                                    btn.classList.contains('incorrect-step');
            if (!isAlreadyAnswered) {
                btn.disabled = false;
            }
            // For belongs-to questions, check if buttons inside containers are disabled
            const container = btn.closest('.belongs-option-container');
            if (container && container.dataset.decided === 'true') {
                // This belongs-to option is already decided, keep disabled
                btn.disabled = true;
            }
        }
    });
}

function nextTurn() {
    // NEW: Check if round should conclude first
    if (!hasActivePlayersInRound()) {
        checkAndHandleQuestionCompletion();
        return;
    }
    
    // NEW: Find next active player with safety checks
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let searchCount = 0;
    
    while (!isPlayerActive(players[nextIndex]) && searchCount < players.length) {
        nextIndex = (nextIndex + 1) % players.length;
        searchCount++;
    }
    
    // NEW: Safety check for infinite loop
    if (searchCount >= players.length) {
        console.error('No active players found in nextTurn()');
        checkAndHandleQuestionCompletion();
        return;
    }
    
    currentPlayerIndex = nextIndex;
    
    // NEW: Reset UI for new player
    resetPlayerUIForTurn();
    updatePlayerDisplay();
    updateGameControls();
    
    // NEW: Re-enable options for new player
    setAllOptionsDisabled(false);
    
    // Optional: Brief turn transition effect
    if (!isSinglePlayerMode()) {
        playerStatusBar.classList.add('turn-transition');
        setTimeout(() => {
            playerStatusBar.classList.remove('turn-transition');
        }, 300);
    }
}

function concludeQuestionRound() {
    players.forEach(player => {
        if (!player.completedRound) {
            player.score += player.roundPot;
            player.roundPot = 0;
            player.completedRound = true; 
            player.completionReason = 'finished';
        }
    });

    setAllOptionsDisabled(true);
    questionStarterIndex = (questionStarterIndex + 1) % players.length;
    
    updateScoreboard();
    updateGameControls();

    // Correct answers already shown by checkAndHandleQuestionCompletion()

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
    const currentPlayer = getCurrentPlayer();
    
    // NEW: Check player-specific state instead of global mistakeMade
    if (!isPlayerActive(currentPlayer)) return;
    
    // Prevent double-clicks and clicks on already answered buttons
    if (button.disabled || button.classList.contains('correct-step') || button.classList.contains('incorrect-step')) {
        return;
    }
    
    const question = questionsToPlay[currentQuestionIndex];
    const isCorrectStep = question.rätt_ordning[userOrder.length] === optionText;
    
    // Mark button as answered immediately to prevent double-clicks
    button.dataset.answered = 'true';

    // Disable all options during processing (for multiplayer turn-based)
    if (!isSinglePlayerMode()) {
        setAllOptionsDisabled(true);
    }

    if (isCorrectStep) {
        userOrder.push(optionText);
        
        // Add point using unified system
        addPointToCurrentPlayer(button);
        
        // Update button appearance
        button.className = 'option-btn w-full text-left p-4 rounded-lg border-2 correct-step';
        button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-green-600 rounded-full font-bold">${userOrder.length}</span> ${optionText}`;
        button.disabled = true;

        // Check if question is complete (all alternatives answered)
        if (userOrder.length === question.alternativ.length) {
            // Auto-secure points when question complete
            secureCurrentPoints();
            
            // Score saving now handled in secureCurrentPoints to avoid duplicates
            
            // For multiplayer: when all alternatives are answered, no one else can play
            // So we should mark all remaining active players as completed
            if (!isSinglePlayerMode()) {
                players.forEach(player => {
                    if (isPlayerActive(player) && player !== getCurrentPlayer()) {
                        player.completedRound = true;
                        player.completionReason = 'no_options_left';
                    }
                });
            }
        } else {
            // Question continues - handle turn progression for multiplayer only
            if (!isSinglePlayerMode()) {
                determineNextAction();
            } else {
                // For single player, update controls to reflect current state
                updateGameControls();
            }
        }
    } else {
        // Wrong answer - eliminate current player
        button.classList.add('incorrect-step');
        eliminateCurrentPlayer();
        determineNextAction();
    }
}

function handleBelongsDecision(userDecision, container, yesBtn, noBtn) {
    const currentPlayer = getCurrentPlayer();
    
    // NEW: Check player-specific state instead of global mistakeMade
    if (!isPlayerActive(currentPlayer)) return;
    
    // Prevent double-clicks - check if this option is already decided
    if (container.dataset.decided === 'true') {
        return;
    }
    
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

    // Disable all options during processing (for multiplayer turn-based)
    if (!isSinglePlayerMode()) {
        setAllOptionsDisabled(true);
    }

    if (isCorrect) {
        // Add point using unified system
        addPointToCurrentPlayer(container);
        
        container.classList.add('choice-made');
        clickedBtn.classList.add('correct-selection');
        
        // Check if all options have been decided
        const allDecided = Array.from(document.querySelectorAll('.belongs-option-container'))
            .every(cont => cont.dataset.decided === 'true');
        
        if (allDecided) {
            // Auto-secure points when all decided
            secureCurrentPoints();
            
            // Score saving now handled in secureCurrentPoints to avoid duplicates
            
            // For multiplayer: when all alternatives are decided, no one else can play
            // So we should mark all remaining active players as completed
            if (!isSinglePlayerMode()) {
                players.forEach(player => {
                    if (isPlayerActive(player) && player !== getCurrentPlayer()) {
                        player.completedRound = true;
                        player.completionReason = 'no_options_left';
                    }
                });
            }
        } else {
            // Question continues - handle turn progression for multiplayer only
            if (!isSinglePlayerMode()) {
                determineNextAction();
            } else {
                // For single player, update controls to reflect current state
                updateGameControls();
            }
        }
    } else {
        // Wrong answer
        clickedBtn.classList.add('selected');
        container.classList.add('incorrect-choice');
        
        // Eliminate current player
        eliminateCurrentPlayer();
        determineNextAction();
    }
}

function playerStops() {
    // Check if button is disabled or there are no points to secure
    if (stopSide.disabled || stopSide.classList.contains('disabled')) return;
    
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer.roundPot === 0) return;
    
    // Use unified secure points function
    secureCurrentPoints();
    
    // Don't check completion here - let secureCurrentPoints handle it after state is updated
}

function feedbackOrder() {
    // No longer needed - buttons already have correct green color when answered correctly
    // This function is kept for compatibility but does nothing
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

function showExplanation(explanationText) {
    // Create or find explanation element
    let explanationDiv = document.getElementById('explanation-div');
    
    if (!explanationDiv) {
        explanationDiv = document.createElement('div');
        explanationDiv.id = 'explanation-div';
        explanationDiv.className = 'p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 max-w-2xl mx-auto';
        
        // Insert after the controls box
        const footerArea = document.getElementById('footer-area');
        footerArea.appendChild(explanationDiv);
    }
    
    explanationDiv.innerHTML = `
        <p class="font-semibold mb-1">Förklaring:</p>
        <p>${explanationText}</p>
    `;
    explanationDiv.classList.remove('hidden');
}

function hideExplanation() {
    const explanationDiv = document.getElementById('explanation-div');
    if (explanationDiv) {
        explanationDiv.classList.add('hidden');
    }
}

function showCorrectAnswers() {
    const question = questionsToPlay[currentQuestionIndex];
    
    if (question.typ === 'ordna') {
        // Show correct order for all buttons
        const buttons = optionsGrid.querySelectorAll('.option-btn');
        
        buttons.forEach((button) => {
            const optionText = button.textContent;
            const correctIndex = question.rätt_ordning.indexOf(optionText);
            
            // If not already shown as correct (green)
            if (!button.classList.contains('correct-step') && correctIndex !== -1) {
                // Show order number using same format as correct answers, but WITHOUT green background
                button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-green-600 rounded-full font-bold">${correctIndex + 1}</span> ${optionText}`;
            }
        });
    } else if (question.typ === 'hör_till') {
        // Run existing feedbackBelongsTo() which already handles this
        feedbackBelongsTo();
        
        // Mark unanswered options
        const containers = optionsGrid.querySelectorAll('.belongs-option-container');
        containers.forEach(container => {
            if (!container.dataset.decided || container.dataset.decided !== 'true') {
                // Could add visual feedback for unanswered options here if needed
            }
        });
    }
    
    // Show explanation if available
    if (question.förklaring) {
        showExplanation(question.förklaring);
    }
}


function endGame() {
    // Save any remaining points for challenge mode before ending
    if (ischallengeMode && isSinglePlayerMode()) {
        const currentPlayer = getCurrentPlayer();
        
        // Debug current state
        console.log('=== END GAME DEBUG ===');
        console.log('Current scores array length:', challengeQuestionScores.length);
        console.log('Total questions:', questionsToPlay.length);
        console.log('Current question index:', currentQuestionIndex);
        console.log('Player state - roundPot:', currentPlayer.roundPot, 'completed:', currentPlayer.completedRound, 'reason:', currentPlayer.completionReason);
        
        // Check if we need to save the last question's score
        if (challengeQuestionScores.length < questionsToPlay.length) {
            // Always save a score for missing questions
            const scoreToSave = currentPlayer.roundPot || 0;
            challengeQuestionScores.push(scoreToSave);
            console.log('Saved FINAL score for question', challengeQuestionScores.length - 1, ':', scoreToSave);
            console.log('Final scores array:', challengeQuestionScores);
        }
        
        // Double check we have scores for all questions
        while (challengeQuestionScores.length < questionsToPlay.length) {
            challengeQuestionScores.push(0);
            console.log('Added missing score 0 for question', challengeQuestionScores.length - 1);
        }
        
        console.log('FINAL challenge scores:', challengeQuestionScores);
    }
    
    gameScreen.classList.add('hidden');
    
    // Handle different game modes
    if (isSinglePlayerMode()) {
        endSinglePlayerGame();
    } else {
        endMultiplayerGame();
    }
}

// Handle end of multiplayer game  
function endMultiplayerGame() {
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
    // Stop any ongoing polling
    stopChallengePolling();
    
    // Reset game state
    players = [];
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    questionStarterIndex = 0;
    // Player states will be reset in resetGameState()
    ischallengeMode = false;
    challengeId = null;
    challengeData = null;
    challengeQuestions = [];
    challengeQuestionScores = [];
    selectedPack = null;
    
    // Hide player status bar
    playerStatusBar.classList.add('hidden');
    
    // Restore endScreen HTML
    endScreen.innerHTML = `
        <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
        <p id="end-screen-subtitle" class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat allihopa!</p>
        
        <!-- Single Player Final Score -->
        <div id="single-player-final" class="hidden bg-blue-100 text-blue-800 rounded-lg p-6 mb-8">
            <p class="text-xl">Din slutpoäng:</p>
            <p id="single-final-score" class="text-6xl font-bold"></p>
        </div>
        
        <!-- Multiplayer Final Scoreboard -->
        <div id="final-scoreboard" class="space-y-3 sm:space-y-4 mb-8">
            <!-- Final player scores will be listed here -->
        </div>
        
        <button id="restart-btn" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:bg-blue-700 transition-colors shadow-md">
            Spela igen
        </button>
    `;
    
    // Re-attach restart button listener
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Update element references
    endScreenSubtitle = document.getElementById('end-screen-subtitle');
    singlePlayerFinal = document.getElementById('single-player-final');
    singleFinalScore = document.getElementById('single-final-score');
    finalScoreboard = document.getElementById('final-scoreboard');
    
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startMain.classList.remove('hidden');
    playerSetup.classList.add('hidden');
    challengeForm.classList.add('hidden');
    
    // Reset single player display
    singlePlayerFinal.classList.add('hidden');
    finalScoreboard.classList.remove('hidden');
    
    // Reset game state
    // Player states will be reset in resetGameState()
    ischallengeMode = false;
    challengeId = null;
    challengeData = null;
    challengeQuestions = [];
    challengeQuestionScores = [];
    
    // Reload my challenges
    loadMyChallenges();
}

// --- Pack Shop Functions ---
function populatePackShop() {
    packGrid.innerHTML = '';
    questionPacks.forEach(pack => {
        const card = document.createElement('div');
        const isAvailable = pack.status === 'available';
        const isSelected = selectedPacks.includes(pack.name);
        
        card.className = `pack-card border-2 rounded-lg p-4 flex flex-col justify-between ${
            isAvailable ? 'cursor-pointer bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white' : 
            'cursor-not-allowed bg-slate-100 border-slate-300 opacity-75'
        }`;
        card.dataset.packName = pack.name;
        
        if (isSelected && isAvailable) {
            card.classList.add('selected');
        }

        const priceColor = pack.status === 'available' ? 'text-green-600' : 'text-slate-400';
        const statusIcon = pack.status === 'available' ? '✅' : '🔒';

        card.innerHTML = `
            <div>
                ${isAvailable && isSelected ? `
                    <div class="selected-check">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                ` : ''}
                <h3 class="font-bold text-lg text-slate-800 mb-1 pr-8">${statusIcon} ${pack.name}</h3>
                <p class="text-slate-600 text-sm leading-relaxed">${pack.description}</p>
            </div>
            <div class="mt-auto pt-3 border-t border-slate-200 text-right">
                <span class="font-bold ${priceColor} text-lg">${pack.price}</span>
            </div>
        `;
        
        if (isAvailable) {
            card.addEventListener('click', () => togglePackSelection(card, pack.name));
        }
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

// New decision button event handlers
stopSide.addEventListener('click', playerStops);
nextSide.addEventListener('click', () => {
    console.log('=== Next Question ===');
    console.log('Moving from question index:', currentQuestionIndex, 'to', currentQuestionIndex + 1);
    console.log('Scores saved so far:', challengeQuestionScores);
    currentQuestionIndex++;
    loadQuestion();
});

nextQuestionBtn.addEventListener('click', () => {
    console.log('=== Next Question ===');
    console.log('Moving from question index:', currentQuestionIndex, 'to', currentQuestionIndex + 1);
    console.log('Scores saved so far:', challengeQuestionScores);
    currentQuestionIndex++;
    loadQuestion();
});

largeNextQuestionBtn.addEventListener('click', () => {
    console.log('=== Next Question ===');
    console.log('Moving from question index:', currentQuestionIndex, 'to', currentQuestionIndex + 1);
    console.log('Scores saved so far:', challengeQuestionScores);
    currentQuestionIndex++;
    loadQuestion();
});

// Pack Shop Listeners
openPackShopBtn.addEventListener('click', openPackShop);
closePackShopBtn.addEventListener('click', closePackShop);
confirmPacksBtn.addEventListener('click', closePackShop);

// Player Name Setup Listeners
savePlayerNameBtn.addEventListener('click', async () => {
    const name = playerNameInput.value.trim();
    if (name) {
        setPlayerName(name);
        playerNameSetup.classList.add('hidden');
        
        // Check if user was trying to create a challenge
        if (pendingChallengeCreation) {
            pendingChallengeCreation = false;
            challengeForm.classList.remove('hidden');
            challengerNameDisplay.textContent = name;
            // Reset form state
            challengeSuccess.classList.add('hidden');
            createChallengeBtn.classList.remove('hidden');
        }
        // Check if there's a pending challenge to accept
        else if (localStorage.getItem('pendingChallenge')) {
            const pendingChallenge = localStorage.getItem('pendingChallenge');
            localStorage.removeItem('pendingChallenge');
            challengeId = pendingChallenge;
            ischallengeMode = true;
            await startChallengeGame();
        } 
        // Normal return to start screen
        else {
            startMain.classList.remove('hidden');
            // Update challenger name display
            challengerNameDisplay.textContent = name;
        }
    }
});

// Challenge form listeners
showChallengeFormBtn.addEventListener('click', () => {
    if (!currentPlayer.name) {
        // Show name setup first
        pendingChallengeCreation = true;  // Markera att vi vill skapa utmaning efter namnupplägg
        startMain.classList.add('hidden');
        playerNameSetup.classList.remove('hidden');
        return;
    }
    
    challengerNameDisplay.textContent = currentPlayer.name;
    startMain.classList.add('hidden');
    challengeForm.classList.remove('hidden');
    
    // Reset form state
    challengeSuccess.classList.add('hidden');
    createChallengeBtn.classList.remove('hidden');
});

backToStartBtn.addEventListener('click', () => {
    challengeForm.classList.add('hidden');
    startMain.classList.remove('hidden');
    challengeError.classList.add('hidden');
    challengeSuccess.classList.add('hidden');
});

createChallengeBtn.addEventListener('click', createChallenge);

// Copy link functionality
copyLinkBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(challengeLink.value);
        copyLinkBtn.textContent = 'Kopierad!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Kopiera länk';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        challengeLink.select();
        document.execCommand('copy');
        copyLinkBtn.textContent = 'Kopierad!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Kopiera länk';
        }, 2000);
    }
});

// Web Share API - Dela knapp
shareBtn.addEventListener('click', async () => {
    const challengeUrl = challengeLink.value;
    const shareText = `${currentPlayer.name} utmanar dig i spelet Ordna!`;
    
    // Kolla om Web Share API finns (mobil och vissa desktop-browsers)
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${currentPlayer.name} utmanar dig i spelet Ordna!`,
                text: `${shareText} ${challengeUrl}`  // Slå ihop text och URL
            });
        } catch (err) {
            // Användaren avbröt delningen - gör inget
            console.log('Delning avbruten');
        }
    } else {
        // Desktop fallback - kopiera länken med meddelande
        const fullMessage = `${shareText} ${challengeUrl}`;
        try {
            await navigator.clipboard.writeText(fullMessage);
            shareBtn.innerHTML = '✓ Länk kopierad!';
            setTimeout(() => {
                shareBtn.textContent = 'Dela';
            }, 2000);
        } catch (err) {
            // Fallback för äldre browsers
            challengeLink.select();
            document.execCommand('copy');
            shareBtn.innerHTML = '✓ Länk kopierad!';
            setTimeout(() => {
                shareBtn.textContent = 'Dela';
            }, 2000);
        }
    }
});

// Challenge acceptance listeners
acceptChallengeBtn.addEventListener('click', async () => {
    ischallengeMode = true;
    challengeAccept.classList.add('hidden');
    
    // Check if user needs to set name
    if (!currentPlayer.name) {
        playerNameSetup.classList.remove('hidden');
        // Store that we need to start challenge after name setup
        localStorage.setItem('pendingChallenge', challengeId);
    } else {
        // Start the challenge directly
        await startChallengeGame();
    }
});

declineChallengeBtn.addEventListener('click', () => {
    // Clear challenge data and show normal start screen
    ischallengeMode = false;
    challengeId = null;
    challengeData = null;
    
    challengeAccept.classList.add('hidden');
    startMain.classList.remove('hidden');
    
    // Clear URL parameters
    if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});


// --- Initial Setup ---
async function initializeApp() {
    // Initialize player identity
    initializePlayer();
    
    // Setup UI
    populatePackShop();
    populatePackSelect();
    createPlayerInputs();
    updateScoreboard();
    
    // Check if there's a challenge in URL
    if (checkForChallenge()) {
        // Show challenge acceptance screen
        await showChallengeAcceptScreen();
    } else {
        // Check for notifications if user is returning
        if (currentPlayer.name) {
            await checkForNotifications();
            await loadMyChallenges();
            challengerNameDisplay.textContent = currentPlayer.name;
        }
    }
}


// Initialize the app
initializeApp();