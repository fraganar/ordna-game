// --- DATA ---
let allQuestions = [];

// Player identity system now handled by PlayerManager module
let currentPlayer = null; // Keep for compatibility, but PlayerManager is authoritative

// Challenge System State
let ischallengeMode = false;
// challengeId now managed globally as window.challengeId (set by app.js URL parsing)
let challengeData = null;
let challengeQuestions = [];
let challengeQuestionScores = [];
let pendingChallengeCreation = false;

// Challenge system functions now handled by ChallengeSystem module

// Load metadata for all available packs from their JSON files
async function loadPackMetadata() {
    
    for (const pack of questionPacks) {
        if (pack.status === 'available' && pack.file) {
            try {
                const response = await fetch(`data/${pack.file}`);
                const data = await response.json();
                
                // Update pack metadata from JSON file
                if (data.name) {
                    pack.name = data.name;
                }
                if (data.description) {
                    pack.description = data.description;
                }
                
            } catch (error) {
                console.error(`Failed to load metadata for pack file ${pack.file}:`, error);
            }
        }
    }
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
        name: "Ganska lätt", 
        description: "Ett lättare frågepaket med mestadels lätta frågor och några medelsvåra", 
        status: "available", 
        file: "questions-ganska-latt.json",
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

// --- Game State ---
let currentQuestionIndex = 0;
let questionsToPlay = [];
let userOrder = []; 
let selectedPacks = questionPacks.map(p => p.name);
let selectedPack = null; // Currently selected pack for playing

// Game State - Unified for both single and multiplayer
let currentPlayerIndex = 0;
let questionStarterIndex = 0;
// mistakeMade removed - now using player-specific states

// Helper function to get current question from the right source
function getCurrentQuestion() {
    const questions = window.questionsToPlay || questionsToPlay;
    return questions[currentQuestionIndex];
}



function isQuestionCompleted() {
    // Question is completed when:
    // 1. No active players remain (all stopped/eliminated), OR
    // 2. Current player has completed their turn (stopped or eliminated)
    
    if (window.PlayerManager?.isSinglePlayerMode()) {
        // Single player: question is complete when player is done (stopped/wrong/finished)
        const currentPlayer = window.PlayerManager.getCurrentPlayer();
        return currentPlayer.completedRound;
    } else {
        return !window.PlayerManager.hasActivePlayersInRound();
    }
}

// Central function to handle player round completion
function completePlayerRound(player, reason, pointsToSecure = 0, skipCompletionCheck = false) {
    // Secure points if any
    if (pointsToSecure > 0) {
        player.score += pointsToSecure;
        player.roundPot = 0;
    }
    
    // Mark player as completed
    player.completedRound = true;
    player.completionReason = reason;
    
    // Check if the entire question is complete (unless told to skip)
    // This ensures correct answers are shown in single player when stopping
    if (!skipCompletionCheck) {
        checkAndHandleQuestionCompletion();
    }
}

function isCurrentQuestionFullyAnswered() {
    const question = getCurrentQuestion();
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
    const currentPlayer = window.PlayerManager.getCurrentPlayer();
    const pointsToLose = currentPlayer.roundPot;
    
    // Save 0 points for challenge mode when eliminated
    if (window.ChallengeSystem) {
        window.ChallengeSystem.saveScore(0, currentQuestionIndex);
    }
    
    // Use centralized function to complete round (no points to secure when wrong)
    completePlayerRound(currentPlayer, 'wrong', 0);
    
    // Use AnimationEngine for animations
    if (window.AnimationEngine) {
        window.AnimationEngine.enableNextButtonAfterMistake(pointsToLose);
    }
    
    // Update displays
    if (window.PlayerManager) {
        UI?.updatePlayerDisplay();
    }
    
    // Use the ROBUST determineNextAction to handle ALL cases correctly
    determineNextAction();
}

// REPLACED progressToNextPlayerOrConclude with more robust design
// Central function that handles question state transitions (NOT called after last alternative)
function determineNextAction() {
    // NOTE: This is NOT called when question is physically complete (last alternative answered)
    // That case is handled directly in handleOrderClick/handleBelongsDecision
    
    // 1. Check if no active players remain (all stopped/eliminated)
    if (!window.PlayerManager.hasActivePlayersInRound()) {
        // Show facit immediately
        showCorrectAnswers();
        updateGameControls();
        return;
    }
    
    // 2. SINGLE PLAYER: Check if player has stopped (needs facit)
    if (window.PlayerManager?.isSinglePlayerMode()) {
        const currentPlayer = window.PlayerManager.getCurrentPlayer();
        if (currentPlayer && currentPlayer.completedRound) {
            // Player has stopped - show facit and enable next button
            showCorrectAnswers();
            setTimeout(() => {
                updateGameControls();
            }, 2000); // Wait for secure animation
        }
        return;
    }
    
    // 3. MULTIPLAYER: Continue to next player
    setTimeout(() => {
        // Double-check state hasn't changed during timeout
        if (window.PlayerManager.hasActivePlayersInRound() && !isCurrentQuestionFullyAnswered()) {
            if (window.PlayerManager) {
                window.PlayerManager.nextTurn();
                
                // Clear incorrect markings from previous players' wrong attempts (ordna questions only)
                const question = getCurrentQuestion();
                if (question && question.typ === 'ordna') {
                    const incorrectButtons = document.querySelectorAll('.option-btn.incorrect-step:not(.correct-step)');
                    incorrectButtons.forEach(button => {
                        if (!button.classList.contains('correct-step')) {
                            button.classList.remove('incorrect-step');
                            button.disabled = false;
                            button.dataset.answered = 'false';
                        }
                    });
                }
                
                // Re-enable options for new player
                setAllOptionsDisabled(false);
            }
        } else {
            determineNextAction(); // Re-evaluate
        }
    }, 500);
}


// NEW: Clean UI reset for turn changes
function resetPlayerUIForTurn() {
    if (window.PlayerManager?.isSinglePlayerMode()) return;
    
    const stopSide = UI.get('stopSide');
    if (!stopSide) return;
    
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


// Handle when player secures points - delegates to PlayerManager but handles game-specific logic
function secureCurrentPoints() {
    const stopSide = UI.get('stopSide');
    
    // Prevent multiple triggers
    if (stopSide && stopSide.dataset.processing === 'true') return;
    if (stopSide) stopSide.dataset.processing = 'true';
    
    const currentPlayer = window.PlayerManager.getCurrentPlayer();
    const pointsToSecure = currentPlayer.roundPot;
    
    if (pointsToSecure <= 0) return;
    
    // Save score for challenge mode when securing points
    if (window.ChallengeSystem) {
        window.ChallengeSystem.saveScore(pointsToSecure, currentQuestionIndex);
    }
    
    // Show animations immediately
    if (window.AnimationEngine) {
        window.AnimationEngine.showSecureAnimation(pointsToSecure);
    }
    
    // Update player state after animation starts
    setTimeout(() => {
        // Use centralized function to complete round
        completePlayerRound(currentPlayer, 'stopped', pointsToSecure);
        
        // Update display immediately after score change
        if (window.PlayerManager) {
            UI?.updatePlayerDisplay();
        }
        
        // Use the ROBUST determineNextAction to handle ALL cases correctly
        // This will handle: showing facit, enabling next button, or moving to next player
        determineNextAction();
    }, 600);
}

// Unified player display update

// --- Challenge Functions ---

// Check if there's a challenge in URL
function checkForChallenge() {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeParam = urlParams.get('challenge');
    
    if (challengeParam) {
        window.challengeId = challengeParam;
        return true;
    }
    return false;
}

// Show challenge acceptance screen
async function showChallengeAcceptScreen() {
    try {
        // Get challenge details from Firebase
        challengeData = await FirebaseAPI.getChallenge(window.challengeId);
        
        UI?.setChallengerDisplayName(challengeData.challengerName);
        
        const startMain = UI.get('startMain');
        const playerSetup = UI.get('playerSetup');
        const challengeForm = UI.get('challengeForm');
        const challengeAccept = UI.get('challengeAccept');
        
        if (startMain) startMain.classList.add('hidden');
        if (playerSetup) playerSetup.classList.add('hidden');
        if (challengeForm) challengeForm.classList.add('hidden');
        if (challengeAccept) challengeAccept.classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load challenge:', error);
        UI?.showError('Utmaningen kunde inte laddas. Kontrollera länken.');
        const challengeAccept = UI.get('challengeAccept');
        const startMain = UI.get('startMain');
        if (challengeAccept) challengeAccept.classList.add('hidden');
        if (startMain) startMain.classList.remove('hidden');
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


// Show notifications for completed challenges
function showNotifications(results) {
    const notificationsArea = UI?.get('notificationsArea');
    if (!notificationsArea) return;
    
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
// REMOVED: showLoading/hideLoading - use UIRenderer.disableCreateChallengeButton/enableCreateChallengeButton

function showError(message) {
    const challengeError = UI?.get('challengeError');
    if (challengeError) {
        challengeError.textContent = message;
        challengeError.classList.remove('hidden');
    }
    setTimeout(() => {
        challengeError.classList.add('hidden');
    }, 5000);
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
            const gameScreen = UI?.get('gameScreen');
    if (gameScreen) gameScreen.classList.add('hidden');
            endScreen.classList.add('hidden');
            playerSetup.classList.add('hidden');
            challengeForm.classList.add('hidden');
            
            // Show start screen
            startScreen.classList.remove('hidden');
            startMain.classList.remove('hidden');
            
            // Reset game state
            if (window.ChallengeSystem) {
            window.ChallengeSystem.reset();
        }
            
            // Reload my challenges
            if (window.ChallengeSystem) {
                window.ChallengeSystem.loadMyChallenges();
            }
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
            UI?.updateStatusButton('Väntar fortfarande...', 'Kolla status');
        }
    } catch (error) {
        console.error('Failed to check challenge status:', error);
    }
}

// Start challenge game for opponent
async function startChallengeGame() {
    try {
        console.log('=== CHALLENGE ACCEPT START ===');
        console.log('Challenge ID from window:', window.challengeId);
        
        // Get challenge data
        challengeData = await FirebaseAPI.getChallenge(window.challengeId);
        console.log('Challenge data received:', challengeData);
        
        if (!challengeData) {
            throw new Error('Challenge not found');
        }
        
        // Check if challenge is expired
        const expiresDate = challengeData.expires.toDate ? challengeData.expires.toDate() : new Date(challengeData.expires);
        console.log('Challenge expires:', expiresDate);
        if (expiresDate < new Date()) {
            throw new Error('Challenge has expired');
        }
        
        // Check if already completed by this player
        const storedChallenge = localStorage.getItem(`challenge_${window.challengeId}`);
        console.log('Stored challenge check:', storedChallenge);
        if (storedChallenge) {
            const info = JSON.parse(storedChallenge);
            if (info.role === 'opponent') {
                console.log('Player already played this challenge');
                UI?.showError('Du har redan spelat denna utmaning');
                showChallengeResultView(window.challengeId);
                return;
            }
        }
        
        // Set selected pack from challenge (for display purposes)
        selectedPack = challengeData.packName || null;
        
        // Set up game with the same questions
        challengeQuestions = challengeData.questions;
        challengeQuestionScores = [];
        
        // Sync ChallengeSystem state for hints
        if (window.ChallengeSystem) {
            window.ChallengeSystem.isChallengeMode = true;
            window.ChallengeSystem.challengeId = window.challengeId;
            window.ChallengeSystem.challengeData = challengeData;
            console.log('Challenge accept: Synced ChallengeSystem state for hints');
        }
        
        
        // Initialize player for challenge accept (single player mode)
        if (window.PlayerManager) {
            const playerName = window.PlayerManager.getPlayerName() || 'Du';
            window.PlayerManager.initializePlayers(1, [playerName]);
            console.log('Challenge accept: Initialized PlayerManager with player:', playerName);
        }
        
        questionsToPlay = challengeQuestions;
        
        // Hide all screens and show game
        const startScreen = UI?.get('startScreen');
        const playerSetup = UI?.get('playerSetup');
        const endScreen = UI?.get('endScreen');
        const gameScreen = UI?.get('gameScreen');
        const singlePlayerScore = UI?.get('singlePlayerScore');
        const singlePlayerProgress = UI?.get('singlePlayerProgress');
        const scoreboard = UI?.get('scoreboard');
        
        if (startScreen) startScreen.classList.add('hidden');
        if (playerSetup) playerSetup.classList.add('hidden');
        if (endScreen) endScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');
        
        // Setup UI for single player
        if (singlePlayerScore) singlePlayerScore.classList.remove('hidden');
        if (singlePlayerProgress) singlePlayerProgress.classList.remove('hidden');
        // singlePlayerStars removed - points now shown in decision button
        if (scoreboard) scoreboard.classList.add('hidden');
        
        currentQuestionIndex = 0;
        loadQuestion();
        
    } catch (error) {
        console.error('Failed to start challenge:', error);
        UI?.showError(error.message || 'Kunde inte starta utmaning');
        const challengeAccept = UI?.get('challengeAccept');
        const startMain = UI?.get('startMain');
        if (challengeAccept) challengeAccept.classList.add('hidden');
        if (startMain) startMain.classList.remove('hidden');
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
    
    UI?.setEndScreenContent(resultHTML);
    UI?.showEndScreen();
    
    // Add event listener for back button
    const backButton = document.getElementById('back-to-start-final');
    if (backButton) {
        backButton.addEventListener('click', () => {
            
            // Go back to start screen
            const endScreen = UI?.get('endScreen');
            const startScreen = UI?.get('startScreen');
            const startMain = UI?.get('startMain');
            const playerSetup = UI?.get('playerSetup');
            const challengeForm = UI?.get('challengeForm');
            
            if (endScreen) endScreen.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');
            if (startMain) startMain.classList.remove('hidden');
            if (playerSetup) playerSetup.classList.add('hidden');
            if (challengeForm) challengeForm.classList.add('hidden');
        
            // Reset game state
            selectedPack = null;
            
            // Reload my challenges
            if (window.ChallengeSystem) {
                window.ChallengeSystem.loadMyChallenges();
            }
        });
    }
}

// --- Functions ---






// Handle question completion after wrong answer (disable stop, enable progression)

// Handle question completion (enable progression to next question)
function enableNextButton() {
    // Don't directly enable - let updateGameControls handle unified logic
    updateGameControls();
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

// REMOVED: shuffleArray - using GameData.shuffleArray for consistency
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
    UI?.hideStopButton();
    UI?.hideDecisionButton();
    UI?.showNextQuestionButton();
    
    const question = getCurrentQuestion();

    if (question.typ === 'ordna') {
        feedbackOrder();
    } else {
        feedbackBelongsTo();
    }
}

async function endSinglePlayerGame() {
    UI?.hideGameScreen();
    
    // If this is challenge creation mode, complete the challenge
    if (window.ChallengeSystem && window.ischallengeMode && !window.challengeId) {
        try {
            await window.ChallengeSystem.completeChallenge();
        } catch (error) {
            console.error('Failed to complete challenge:', error);
            UI?.showError('Kunde inte skapa utmaning. Försök igen.');
            const singlePlayerFinal = UI?.get('singlePlayerFinal');
            const finalScoreboard = UI?.get('finalScoreboard');
            const singleFinalScore = UI?.get('singleFinalScore');
            
            UI?.showEndScreen();
            if (singlePlayerFinal) singlePlayerFinal.classList.remove('hidden');
            if (finalScoreboard) finalScoreboard.classList.add('hidden');
            if (singleFinalScore) {
                const errorFallbackScore = window.PlayerManager.getCurrentPlayer()?.score || 0;
                UI?.setFinalScore(errorFallbackScore);
            }
        }
    }
    // If this is accepting a challenge
    else if (ischallengeMode && window.challengeId) {
        try {
            await FirebaseAPI.completeChallenge(
                window.challengeId,
                currentPlayer.name,
                players[0].score,
                challengeQuestionScores
            );
            
            // Save to localStorage
            const challengeInfo = {
                id: window.challengeId,
                role: 'opponent',
                playerName: currentPlayer.name,
                completedAt: new Date().toISOString(),
                hasSeenResult: true,
                totalScore: players[0].score,
                questionScores: challengeQuestionScores
            };
            localStorage.setItem(`challenge_${window.challengeId}`, JSON.stringify(challengeInfo));
            
            // Show result comparison view
            showChallengeResultView(window.challengeId);
            
        } catch (error) {
            console.error('Failed to complete challenge:', error);
            UI?.showError('Kunde inte spara resultat. Försök igen.');
            UI?.showEndScreen();
            singlePlayerFinal.classList.remove('hidden');
            finalScoreboard.classList.add('hidden');
            UI?.setFinalScore(players[0].score);
        }
    }
    // Normal single player mode
    else {
        
        // Hide game screen first
        UI?.hideGameScreen();
        
        // Show unified result screen for all regular games
        const currentPlayer = window.PlayerManager.getCurrentPlayer();
        const finalScore = currentPlayer ? currentPlayer.score : 0;
        
        if (selectedPack) {
            // Pack-based game
            showGameResultScreen(finalScore, selectedPack, questionsToPlay.length);
        } else {
            // Standard game with all questions
            showGameResultScreen(finalScore, 'Grund', questionsToPlay.length);
        }
    }
}

// Populate pack selection dropdown
function populatePackSelect() {
    console.log('populatePackSelect called');
    // Use GameData if available, otherwise fall back to old method
    if (window.GameData && GameData.packMetadata) {
        console.log('Using GameData.populatePackSelectors');
        GameData.populatePackSelectors();
    } else {
        console.log('Using fallback method, GameData available:', !!window.GameData, 'packMetadata available:', !!(window.GameData && GameData.packMetadata));
        // Fallback to old method
        const packSelect = UI?.get('packSelect');
        const challengePackSelect = UI?.get('challengePackSelect');
        const selects = [packSelect, challengePackSelect];
        
        console.log('Found selects:', selects.map(s => s ? s.id : 'null'));
        console.log('questionPacks:', questionPacks);
        
        selects.forEach(select => {
            if (select) {
                console.log('Populating select:', select.id);
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
}
async function initializeGame() {
    // Set selected pack from dropdown
    const packSelect = UI?.get('packSelect');
    selectedPack = packSelect?.value || null;
    
    // Load questions using GameData (working implementation moved there)
    allQuestions = await window.GameData.loadQuestionsForGame(selectedPack);
    
    if (allQuestions.length === 0) {
        console.error("No questions loaded! allQuestions.length:", allQuestions.length);
        alert("Kunde inte ladda frågor. Kontrollera att frågefiler finns.");
        return;
    }
    
    
    const nameInputs = document.querySelectorAll('.player-name-input');
    const playerCountSelect = UI?.get('playerCountSelect');
    const playerCount = parseInt(playerCountSelect?.value || 1);
    
    // Initialize players using PlayerManager if available
    
    // Collect player names first
    const playerNames = [];
    if (playerCount === 1) {
        // Check if name input has a value (for challenge mode), otherwise use 'Du'
        const firstNameInput = nameInputs[0];
        const playerName = firstNameInput?.value?.trim() || 'Du';
        playerNames.push(playerName);
        console.log('Single player mode: Using player name:', playerName);
    } else {
        nameInputs.forEach((input, index) => {
            playerNames.push(input.value || `Spelare ${index + 1}`);
        });
        if (playerNames.length < 2) {
            console.error("Minst två spelare behövs!");
            return;
        }
    }
    
    // Initialize players using PlayerManager
    if (window.PlayerManager) {
        try {
            window.PlayerManager.initializePlayers(playerCount, playerNames);
        } catch (error) {
            console.error('Error initializing PlayerManager:', error);
            return; // Cannot continue without PlayerManager
        }
    } else {
        console.error('PlayerManager not available!');
        return;
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
    
    UI?.showGameScreen();
    
    
    // Initialize game state
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    questionStarterIndex = 0;
    questionsToPlay = window.GameData.shuffleArray(questionsToPlay);
    
    // Setup unified UI
    if (window.PlayerManager) {
        UI?.updatePlayerDisplay();
    }
    
    // Load first question using GameController if available
    // For now, use fallback until GameController is properly integrated
    loadQuestion();
}

// REMOVED: updateScoreboard - moved to UIRenderer.updateScoreboard()

function updateGameControls() {
    // Always hide old buttons
    const stopSide = UI?.get('stopSide');
    const nextSide = UI?.get('nextSide');
    
    UI?.hideAllGameButtons();
    
    const currentPlayer = window.PlayerManager.getCurrentPlayer();
    
    if (!window.PlayerManager.hasActivePlayersInRound() && !window.PlayerManager?.isSinglePlayerMode()) {
        // All players completed in multiplayer - show secured state
        UI?.showDecisionButton();
        UI?.configureStopButtonForMultiplayerCompleted();
        UI?.showAndEnableNextSide();
    } else if (window.PlayerManager?.isSinglePlayerMode()) {
        // Single player: alltid visa decision button
        UI?.showDecisionButton();
        if (stopSide) stopSide.classList.remove('hidden');
        if (nextSide) nextSide.classList.remove('hidden');
        
        // Stop button: aktiv endast när spelaren har poäng OCH inte är eliminerad
        const hasPoints = currentPlayer.roundPot > 0;
        const isEliminated = currentPlayer.completionReason === 'wrong';
        UI?.configureStopButtonForSinglePlayer(hasPoints, isEliminated);
        
        if (hasPoints && !isEliminated && window.AnimationEngine) {
            window.AnimationEngine.updateStopButtonPoints();
        }
        
        // Next button: ALLTID disabled tills frågan är helt klar
        if (nextSide) {
            const questionCompleted = isQuestionCompleted();
            nextSide.disabled = !questionCompleted;
        }
    } else {
        // Multiplayer with active players
        UI?.showDecisionButton();
        
        // Check if current player is actually active
        const isCurrentPlayerActive = currentPlayer && !currentPlayer.completedRound;
        const hasPoints = currentPlayer.roundPot > 0;
        const isCompleted = currentPlayer && currentPlayer.completedRound;
        
        UI?.configureStopButtonForMultiplayer(isCurrentPlayerActive, hasPoints, isCompleted);
        UI?.showNextSideWithState(isQuestionCompleted());
        
        // Update button state
        if (stopSide) stopSide.dataset.processing = 'false';
        if (window.AnimationEngine) {
            window.AnimationEngine.updateStopButtonPoints();
        }
    }
}

function setDifficultyBadge(difficulty) {
    const badge = UI.get('difficultyBadge');
    if (!badge) return;
    
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
        UI?.hideHintElement();
    }
    
    // Reset decision buttons for new question
    if (window.AnimationEngine && window.AnimationEngine.resetDecisionButtons) {
        window.AnimationEngine.resetDecisionButtons();
    }
    if (window.AnimationEngine) {
        window.AnimationEngine.updateStopButtonPoints();
    } // Still need to update points display
    
    // Reset all players' round state for new question
    if (window.PlayerManager) {
        window.PlayerManager.resetForNewQuestion();
    } else {
        // Fallback for old system
        players.forEach(p => {
            p.roundPot = 0;
            p.completedRound = false;
            p.completionReason = null;
        });
    }
    
    // Clear options and hide buttons
    const optionsGrid = UI.get('optionsGrid');
    
    UI?.clearOptionsGrid();
    UI?.hideAllGameButtons();
    
    // Always show decision button - it will be configured per player/mode
    UI?.showDecisionButton();
    UI?.hideStopButton();
    
    // Check if game should end - use window.questionsToPlay if available
    const questions = window.questionsToPlay || questionsToPlay;
    console.log('Debug loadQuestion: currentQuestionIndex:', currentQuestionIndex);
    console.log('Debug loadQuestion: questions.length:', questions?.length);
    console.log('Debug loadQuestion: local questionsToPlay.length:', questionsToPlay?.length);
    console.log('Debug loadQuestion: window.questionsToPlay.length:', window.questionsToPlay?.length);
    if (currentQuestionIndex >= questions.length) {
        console.log('Debug loadQuestion: Ending game - no more questions');
        if (window.PlayerManager?.isSinglePlayerMode()) {
            endSinglePlayerGame();
        } else {
            endGame();
        }
        return;
    }

    // Set starting player for this question (rotation in multiplayer)
    if (!window.PlayerManager?.isSinglePlayerMode()) {
        currentPlayerIndex = questionStarterIndex;
    } else {
        currentPlayerIndex = 0;
    }
    
    // Update displays
    if (window.PlayerManager) {
        UI?.updatePlayerDisplay();
    }
    updateGameControls();

    const question = questions[currentQuestionIndex];
    
    UI.updateQuestionCounter(currentQuestionIndex + 1, questions.length);
    UI.updateDifficultyBadge(question.svårighetsgrad);
    UI.setQuestionText(question.fråga);
    
    // Show challenger hint if in challenge mode, hide otherwise
    if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
        window.ChallengeSystem.showHint(currentQuestionIndex);
    } else {
        // Ensure hint is hidden in non-challenge mode
        UI?.hideHintElement();
    }
    
    const shuffledOptions = window.GameData.shuffleArray(question.alternativ);

    UI?.setOptionsGridLayout();

    // Set instructions
    if (question.typ === 'ordna') {
        UI.setQuestionInstruction(window.PlayerManager?.isSinglePlayerMode() ? 
            'Klicka på alternativen i rätt ordning. Ett fel och du förlorar frågans poäng.' :
            'Klicka på alternativen i rätt ordning.');
    } else { // 'hör_till'
        UI.setQuestionInstruction(window.PlayerManager?.isSinglePlayerMode() ?
            'Bedöm varje alternativ. Ett fel och du förlorar frågans poäng.' :
            'Bedöm varje alternativ.');
    }
    
    // Use GameController for rendering (functions moved there from game.js)
    if (window.GameController && window.GameController.renderQuestionOptions) {
        window.GameController.renderQuestionOptions(question);
    } else {
        console.error('GameController.renderQuestionOptions not available!');
    }
    
    // Add cascading shimmer effect to new options
    setTimeout(() => {
        const optionsGrid = UI.get('optionsGrid');
        const options = optionsGrid?.querySelectorAll('.option-btn, .belongs-option-container') || [];
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

// REMOVED: setAllOptionsDisabled - moved to UIRenderer.setAllOptionsDisabled()


function concludeQuestionRound() {
    players.forEach(player => {
        if (!player.completedRound) {
            // Use centralized function to complete round, but skip completion check
            completePlayerRound(player, 'finished', player.roundPot, true);
        }
    });
    
    // Now check completion once after all players are marked complete
    checkAndHandleQuestionCompletion();

    UI?.setAllOptionsDisabled(true);
    questionStarterIndex = (questionStarterIndex + 1) % players.length;
    
    UI?.updateScoreboard();
    updateGameControls();

    // Correct answers already shown by checkAndHandleQuestionCompletion()

    const question = getCurrentQuestion();
    if (question.typ === 'ordna') {
        feedbackOrder();
    } else {
        feedbackBelongsTo();
    }
}


function handleOrderClick(button, optionText) {
    const currentPlayer = window.PlayerManager.getCurrentPlayer();
    
    // NEW: Check player-specific state instead of global mistakeMade
    if (!window.PlayerManager.isPlayerActive(currentPlayer)) return;
    
    // Prevent double-clicks and clicks on already answered buttons
    if (button.disabled || button.classList.contains('correct-step') || button.classList.contains('incorrect-step')) {
        return;
    }
    
    const questions = window.questionsToPlay || questionsToPlay;
    const question = questions[currentQuestionIndex];
    const isCorrectStep = question.rätt_ordning[userOrder.length] === optionText;
    
    // Mark button as answered immediately to prevent double-clicks
    button.dataset.answered = 'true';

    // Disable all options during processing (for multiplayer turn-based)
    if (!window.PlayerManager?.isSinglePlayerMode()) {
        UI?.setAllOptionsDisabled(true);
    }

    if (isCorrectStep) {
        userOrder.push(optionText);
        
        // Add point using unified system
        window.PlayerManager.addPointToCurrentPlayer(button);
        
        // Update button appearance
        button.className = 'option-btn w-full text-left p-4 rounded-lg border-2 correct-step';
        button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-green-600 rounded-full font-bold">${userOrder.length}</span> ${optionText}`;
        button.disabled = true;

        // Check if this was the LAST alternative
        if (isCurrentQuestionFullyAnswered()) {
            // Question physically complete - auto-secure ALL active players
            if (window.GameController) {
                window.GameController.handleQuestionFullyCompleted();
            }
            setTimeout(() => {
                showCorrectAnswers();
                updateGameControls();
            }, 2000);
        } else {
            // More alternatives remain
            determineNextAction();
        }
    } else {
        // Wrong answer - eliminate current player
        button.classList.add('incorrect-step');
        
        // In single player mode, disable the button permanently
        if (window.PlayerManager?.isSinglePlayerMode()) {
            button.disabled = true;
        }
        // In multiplayer, keep button enabled for other players to try later
        
        // Eliminate current player FIRST
        eliminateCurrentPlayer();
        
        // THEN check if question is complete (might be last alternative)
        if (isCurrentQuestionFullyAnswered()) {
            // Last alternative answered wrong - auto-secure remaining active players
            if (window.GameController) {
                window.GameController.handleQuestionFullyCompleted();
            }
            setTimeout(() => {
                showCorrectAnswers();
                updateGameControls();
            }, 2000);
        }
        // Note: eliminateCurrentPlayer already calls determineNextAction()
    }
}

function handleBelongsDecision(userDecision, container, yesBtn, noBtn) {
    const currentPlayer = window.PlayerManager.getCurrentPlayer();
    
    // NEW: Check player-specific state instead of global mistakeMade
    if (!window.PlayerManager.isPlayerActive(currentPlayer)) return;
    
    // Prevent double-clicks - check if this option is already decided
    if (container.dataset.decided === 'true') {
        return;
    }
    
    const question = getCurrentQuestion();
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
    if (!window.PlayerManager?.isSinglePlayerMode()) {
        UI?.setAllOptionsDisabled(true);
    }

    if (isCorrect) {
        // Add point using unified system
        window.PlayerManager.addPointToCurrentPlayer(container);
        
        container.classList.add('choice-made');
        container.classList.add('correct-choice'); // Add green background to entire container
        clickedBtn.classList.add('correct-selection');
        
        // Check if this was the LAST alternative
        if (isCurrentQuestionFullyAnswered()) {
            // Question physically complete - auto-secure ALL active players
            if (window.GameController) {
                window.GameController.handleQuestionFullyCompleted();
            }
            setTimeout(() => {
                showCorrectAnswers();
                updateGameControls();
            }, 2000);
        } else {
            // More alternatives remain
            determineNextAction();
        }
    } else {
        // Wrong answer
        clickedBtn.classList.add('selected');
        container.classList.add('incorrect-choice');
        
        // Eliminate current player FIRST
        eliminateCurrentPlayer();
        
        // THEN check if question is complete (might be last alternative)
        if (isCurrentQuestionFullyAnswered()) {
            // Last alternative answered wrong - auto-secure remaining active players
            if (window.GameController) {
                window.GameController.handleQuestionFullyCompleted();
            }
            setTimeout(() => {
                showCorrectAnswers();
                updateGameControls();
            }, 2000);
        }
        // Note: eliminateCurrentPlayer already calls determineNextAction()
    }
}

function playerStops() {
    // Check if button is disabled or there are no points to secure
    const stopSide = UI?.get('stopSide');
    if (!stopSide || stopSide.disabled || stopSide.classList.contains('disabled')) return;
    
    const currentPlayer = window.PlayerManager.getCurrentPlayer();
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
    const question = getCurrentQuestion();
    const correctOptions = question.tillhör_index.map(i => question.alternativ[i]);
    const optionsGrid = UI?.get('optionsGrid');
    if (!optionsGrid) return;
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
    const question = getCurrentQuestion();
    
    // Use UIRenderer for showing correct answers
    UI?.showCorrectAnswers(question);
    
    // Show explanation if available
    if (question.förklaring) {
        showExplanation(question.förklaring);
    }
}
function endGame() {
    // Save any remaining points for challenge mode before ending
    if (ischallengeMode && window.PlayerManager?.isSinglePlayerMode()) {
        const currentPlayer = window.PlayerManager.getCurrentPlayer();
        
        // Ensure we have scores for all questions
        if (challengeQuestionScores.length < questionsToPlay.length) {
            // Save the current round pot or 0 if player failed
            const finalScore = currentPlayer.roundPot || 0;
            challengeQuestionScores.push(finalScore);
        }
        
        // Safety check: fill any missing scores with 0
        while (challengeQuestionScores.length < questionsToPlay.length) {
            challengeQuestionScores.push(0);
        }
    }
    
    const gameScreen = UI?.get('gameScreen');
    if (gameScreen) gameScreen.classList.add('hidden');
    
    // Handle different game modes
    if (window.PlayerManager?.isSinglePlayerMode()) {
        endSinglePlayerGame();
    } else {
        endMultiplayerGame();
    }
}

// Handle end of multiplayer game  
function endMultiplayerGame() {
    UI?.showEndScreen();
    
    players.sort((a, b) => b.score - a.score);
    const finalScoreboard = UI?.get('finalScoreboard');
    if (finalScoreboard) finalScoreboard.innerHTML = '';

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
        if (finalScoreboard) finalScoreboard.appendChild(rankDiv);
    });

}

function restartGame() {
    // Stop any ongoing polling
    stopChallengePolling();
    
    // Reset game state - PlayerManager handles player reset
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    questionStarterIndex = 0;
    // Reset challenge and game state
    if (window.ChallengeSystem) {
        ChallengeSystem.reset();
    } else {
        resetChallengeState();
    }
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
    
    UI?.showStartScreen();
    
    // Reset single player display
    singlePlayerFinal.classList.add('hidden');
    finalScoreboard.classList.remove('hidden');
    
    // Reset game state
    if (window.ChallengeSystem) {
        ChallengeSystem.reset();
    } else {
        resetChallengeState();
    }
    
    // Reload my challenges
    if (window.ChallengeSystem) {
        window.ChallengeSystem.loadMyChallenges();
    }
}

// --- Pack Shop Functions ---
function populatePackShop() {
    const packGrid = UI?.get('packGrid');
    if (!packGrid) return;
    
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

function openPackShop() { 
    const packShopModal = UI?.get('packShopModal');
    if (packShopModal) packShopModal.classList.remove('hidden'); 
}

function closePackShop() { 
    const packShopModal = UI?.get('packShopModal');
    if (packShopModal) packShopModal.classList.add('hidden'); 
}

function createPlayerInputs() {
    const playerCountSelect = UI?.get('playerCountSelect');
    const playerNamesContainer = UI?.get('playerNamesContainer');
    
    if (!playerCountSelect || !playerNamesContainer) return;
    
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

// Event listeners moved to eventHandlers.js
// Legacy function kept for compatibility
function initializeEventListeners() {
    const showPlayerSetupBtn = UI.get('showPlayerSetupBtn');
    const playerCountSelect = UI.get('playerCountSelect');
    const startGameBtn = UI.get('startGameBtn');
    const restartBtn = UI.get('restartBtn');
    const stopBtn = UI.get('stopBtn');
    const stopSide = UI.get('stopSide');
    const nextSide = UI.get('nextSide');
    const nextQuestionBtn = UI.get('nextQuestionBtn');
    const largeNextQuestionBtn = UI.get('largeNextQuestionBtn');
    const openPackShopBtn = UI.get('openPackShopBtn');
    const closePackShopBtn = UI.get('closePackShopBtn');
    const confirmPacksBtn = UI.get('confirmPacksBtn');
    
    if (showPlayerSetupBtn) showPlayerSetupBtn.addEventListener('click', showPlayerSetup);
    if (playerCountSelect) playerCountSelect.addEventListener('change', createPlayerInputs);
    if (startGameBtn) startGameBtn.addEventListener('click', initializeGame);
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
    if (stopBtn) stopBtn.addEventListener('click', playerStops);
    
    // New decision button event handlers
    if (stopSide) stopSide.addEventListener('click', playerStops);
    if (nextSide) {
        nextSide.addEventListener('click', () => {
            currentQuestionIndex++;
            loadQuestion();
        });
    }
    
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            loadQuestion();
        });
    }
    
    if (largeNextQuestionBtn) {
        largeNextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            loadQuestion();
        });
    }
    
    // Pack Shop Listeners
    if (openPackShopBtn) openPackShopBtn.addEventListener('click', openPackShop);
    if (closePackShopBtn) closePackShopBtn.addEventListener('click', closePackShop);
    if (confirmPacksBtn) confirmPacksBtn.addEventListener('click', closePackShop);
}

// Event listeners removed - now in eventHandlers.js
// UI waiting functionality moved to App.js module

// App initialization functions removed - now handled by App.js module
// App initialization now handled exclusively by App.js module