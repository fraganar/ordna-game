// --- DATA ---
let allQuestions = [];

// Player identity system now handled by PlayerManager module
let currentPlayer = null; // Keep for compatibility, but PlayerManager is authoritative
let players = []; // Synkad med PlayerManager för challenge-systemet

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
        description: "Grundläggande frågor för Tres Mangos", 
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
window.currentQuestionIndex = 0; // Sync global variable
let questionsToPlay = [];
let userOrder = [];
let selectedPacks = questionPacks.map(p => p.name);
// selectedPack removed - use window.GameController.selectedPack instead

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
    }
    
    // CRITICAL FIX for BL-002: ALWAYS clear roundPot when completing round
    player.roundPot = 0;
    
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
        
        // Show challenger hint immediately with correct answers
        if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
            window.ChallengeSystem.showHint(currentQuestionIndex);
        }
        
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
    
    // Update displays
    if (window.PlayerManager) {
        UI?.updatePlayerDisplay();
    }
    
    // Use AnimationEngine for animations with callback for better UX timing
    if (window.AnimationEngine) {
        window.AnimationEngine.enableNextButtonAfterMistake(pointsToLose, () => {
            // Use the ROBUST determineNextAction to handle ALL cases correctly
            // This is called AFTER the elimination animation completes
            determineNextAction();
        });
    } else {
        // Fallback if AnimationEngine not available
        determineNextAction();
    }
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
                UI?.setAllOptionsDisabled(false);
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
    
    // Note: Individual scores are saved when each question is answered
    // No need to save bulk scores when securing points in challenge mode
    
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

// 🔧 BL-015 FIX: Central function to reset challenge state
function resetChallengeState() {
    window.challengeId = null;
    window.ischallengeMode = false;
    window.isChallenger = false;  // Clear challenger flag to prevent role contamination
    ischallengeMode = false;
    challengeQuestionScores = [];

    // BL-015 FIX: Clear localStorage items that can cause challenge state to persist
    localStorage.removeItem('pendingChallenge');

    // Stop any challenge polling if exists
    if (typeof stopChallengePolling === 'function') {
        stopChallengePolling();
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


// Start challenge game for opponent
async function startChallengeGame() {
    try {
        // 🔧 BL-017 FIX: Reset question index BEFORE checking anything
        currentQuestionIndex = 0;
        window.currentQuestionIndex = 0;
        
        // Get challenge data
        challengeData = await FirebaseAPI.getChallenge(window.challengeId);
        
        if (!challengeData) {
            throw new Error('Challenge not found');
        }
        
        // Check if challenge is expired
        const expiresDate = challengeData.expires.toDate ? challengeData.expires.toDate() : new Date(challengeData.expires);
        if (expiresDate < new Date()) {
            throw new Error('Challenge has expired');
        }
        
        // Double-play protection is now handled in app.js showChallengeAcceptScreen()
        // via Firebase playerId instead of localStorage
        
        // Set selected pack from challenge (for display purposes)
        window.GameController.selectedPack = challengeData.packName || null;

        // Set up game with the same questions
        challengeQuestions = challengeData.questions;

        // IMPORTANT: Set challenge mode FIRST before array setup
        ischallengeMode = true;
        window.ischallengeMode = true;
        window.isChallenger = false;  // Opponent is NOT the challenger

        // FIX: Setup arrays properly for opponent
        if (window.ChallengeSystem) {
            // Set challenge mode BEFORE array operations
            window.ChallengeSystem.isChallengeMode = true;
            window.ChallengeSystem.challengeId = window.challengeId;
            window.ChallengeSystem.challengeData = challengeData;

            // Check if array already exists and has data (shouldn't happen for opponent)
            if (window.ChallengeSystem.challengeQuestionScores &&
                window.ChallengeSystem.challengeQuestionScores.length > 0) {
                window.ChallengeSystem.challengeQuestionScores.length = 0;
            } else if (!window.ChallengeSystem.challengeQuestionScores) {
                // Create new array if doesn't exist
                window.ChallengeSystem.challengeQuestionScores = [];
            }

            // Connect all references to the same array
            challengeQuestionScores = window.ChallengeSystem.challengeQuestionScores;
            window.challengeQuestionScores = window.ChallengeSystem.challengeQuestionScores;
        } else {
            challengeQuestionScores = [];
        }
        
        
        // Initialize player for challenge accept (single player mode)
        if (window.PlayerManager) {
            const playerName = window.PlayerManager.getPlayerName() || 'Du';
            window.PlayerManager.initializePlayers(1, [playerName]);
            
            // Synka globala variabler för kompatibilitet
            players = window.PlayerManager.getPlayers();
            currentPlayer = players[0];
            window.currentPlayer = currentPlayer; // För bakåtkompatibilitet
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
    window.currentQuestionIndex = 0; // Sync global variable
        window.currentQuestionIndex = 0; // Sync global variable
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

// Show result screen for single player games (pack and standard)
function showSinglePlayerResultScreen(score, gameType, totalQuestions) {
    
    const gameTypeName = gameType || 'Allmänna frågor';
    
    // Create result screen HTML
    const resultHTML = `
        <div class="text-center p-6 sm:p-8 lg:p-12">
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
            <p class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat!</p>
            
            <!-- Game Result -->
            <div class="bg-purple-100 text-purple-800 rounded-lg p-6 mb-8">
                <h3 class="text-xl font-semibold mb-2">${gameTypeName}</h3>
                <p class="text-sm text-purple-600 mb-3">${totalQuestions} frågor</p>
                <p class="text-6xl font-bold">${score}</p>
                <p class="text-lg">poäng</p>
            </div>
            
            <button id="back-to-start-final" class="w-full bg-gradient-to-r from-magic to-primary text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:from-primary hover:to-magic-dark transition-colors shadow-md">
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
            window.GameController.selectedPack = null;
            
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



async function endSinglePlayerGame() {
    // 🔧 BL-016 FIX: Force hide competing UI elements
    const finalScoreboard = UI?.get('finalScoreboard');
    const challengeResult = UI?.get('challengeResult');
    if (finalScoreboard) finalScoreboard.classList.add('hidden');
    if (challengeResult) challengeResult.classList.add('hidden');

    UI?.hideGameScreen();

    // If this is challenge creation mode (user just finished playing)
    if (window.ChallengeSystem && window.ischallengeMode && !window.challengeId) {
        // NEW: Check if user is anonymous - show post-game share screen instead of auto-saving
        const isAnonymous = window.isAnonymousUser && window.isAnonymousUser();
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        const finalScore = currentPlayer?.score || 0;

        if (isAnonymous) {
            // Show post-game share screen for anonymous users
            console.log('📊 Anonymous user completed challenge - showing post-game share screen');
            showPostGameShareScreen(finalScore);
        } else {
            // User is authenticated - auto-save challenge (original behavior)
            try {
                const result = await window.ChallengeSystem.completeChallenge();
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
    }
    // If this is accepting a challenge (opponent completing a challenge)
    // Check that we're not the challenger creating a new one
    else if (ischallengeMode && window.challengeId && !window.isChallenger) {
        try {
            // Säkerställ att globala variabler är synkade
            const player = window.PlayerManager?.getCurrentPlayer();
            if (player) {
                currentPlayer = player;
                players = window.PlayerManager.getPlayers();
            }

            const playerName = player?.name || currentPlayer?.name || 'Unknown';
            const playerScore = player?.score || 0;
            const playerId = window.getCurrentPlayerId() || 'unknown_player';
            const isAnonymous = window.isAnonymousUser && window.isAnonymousUser();

            if (isAnonymous) {
                // NEW: For anonymous opponents - show result WITHOUT saving first
                // They can choose to login and save after seeing result
                await window.ChallengeSystem.showChallengeResultForAnonymous(
                    window.challengeId,
                    playerScore
                );
            } else {
                // Authenticated opponent - save and show result (existing behavior)
                await window.ChallengeSystem.acceptChallenge(
                    window.challengeId,
                    playerId,
                    playerName,
                    challengeQuestionScores,
                    playerScore
                );
            }

        } catch (error) {
            console.error('Failed to complete challenge:', error);
            UI?.showError('Kunde inte visa resultat. Försök igen.');
            UI?.showEndScreen();

            // Använd PlayerManager för säker score-hämtning
            const player = window.PlayerManager?.getCurrentPlayer();
            const errorFallbackScore = player?.score || 0;

            const singlePlayerFinal = UI?.get('singlePlayerFinal');
            const finalScoreboard = UI?.get('finalScoreboard');
            if (singlePlayerFinal) singlePlayerFinal.classList.remove('hidden');
            if (finalScoreboard) finalScoreboard.classList.add('hidden');
            UI?.setFinalScore(errorFallbackScore);
        }
    }
    // Normal single player mode
    else {
        
        // Hide game screen first
        UI?.hideGameScreen();
        
        // Show unified result screen for all regular games
        const currentPlayer = window.PlayerManager.getCurrentPlayer();
        const finalScore = currentPlayer ? currentPlayer.score : 0;
        
        if (window.GameController.selectedPack) {
            // Pack-based game
            showSinglePlayerResultScreen(finalScore, window.GameController.selectedPack, questionsToPlay.length);
        } else {
            // Standard game with all questions
            showSinglePlayerResultScreen(finalScore, 'Grund', questionsToPlay.length);
        }
    }
}

// NEW: Show post-game share screen for anonymous users
function showPostGameShareScreen(finalScore) {
    console.log('📊 Showing post-game share screen with score:', finalScore);

    // Hide all other screens
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const startScreen = document.getElementById('start-screen');

    if (gameScreen) gameScreen.classList.add('hidden');
    if (endScreen) endScreen.classList.add('hidden');
    if (startScreen) startScreen.classList.add('hidden');

    // Show post-game share screen
    const postGameShare = document.getElementById('post-game-share');
    if (!postGameShare) {
        console.error('post-game-share element not found');
        // Fallback to normal end screen
        UI?.showEndScreen();
        return;
    }

    // Set the final score
    const postGameFinalScore = document.getElementById('post-game-final-score');
    if (postGameFinalScore) {
        postGameFinalScore.textContent = finalScore;
    }

    // Show the screen
    postGameShare.classList.remove('hidden');
}

// Populate pack selection dropdown
function populatePackSelect() {
    // Use GameData if available, otherwise fall back to old method
    if (window.GameData && GameData.packMetadata) {
        GameData.populatePackSelectors();
    } else {
        // Fallback to old method
        const packSelect = UI?.get('packSelect');
        const challengePackSelect = UI?.get('challengePackSelect');
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
}
async function initializeGame() {
    
    // Simple UI transition - no need to reset endScreen structure anymore!
    UI?.showStartScreen();
    
    // Reset challenge state when starting normal game
    resetChallengeState();
    
    // Set selected pack from selector
    window.GameController.selectedPack = window.GameData?.getSelectedPack('pack-select') || null;

    // Load questions using GameData (working implementation moved there)
    try {
        allQuestions = await window.GameData.loadQuestionsForGame(window.GameController.selectedPack);

        // Note: Pack tracking is handled later via FirebaseAPI.updatePlayedPack()
        // when the game ends (see gameController.js endGame() function)
    } catch (loadError) {
        // Show user-friendly error message
        alert(`❌ Kunde inte ladda frågepaket\n\n${loadError.message}\n\nVänligen välj ett annat frågepaket och försök igen.`);
        console.error('Failed to load question pack:', loadError);
        return;
    }

    if (allQuestions.length === 0) {
        console.error("No questions loaded! allQuestions.length:", allQuestions.length);
        alert("❌ Inga frågor kunde laddas. Vänligen välj ett annat frågepaket.");
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

    // Filter out vilken-frågor in multiplayer mode (they don't work with turn-based gameplay)
    if (playerCount > 1) {
        const beforeFilter = questionsToPlay.length;
        questionsToPlay = questionsToPlay.filter(q => q.typ !== 'vilken');
        const removed = beforeFilter - questionsToPlay.length;
        if (removed > 0) {
            console.log(`Filtered out ${removed} vilken-questions for multiplayer mode`);
        }
    }
    
    UI?.showGameScreen();
    
    
    // Initialize game state
    currentQuestionIndex = 0;
    window.currentQuestionIndex = 0; // Sync global variable
    currentPlayerIndex = 0;
    questionStarterIndex = 0;
    questionsToPlay = window.GameData.shuffleArray(questionsToPlay);
    
    // Setup unified UI
    if (window.PlayerManager) {
        UI?.updatePlayerDisplay();
        
        // Synka globala variabler för kompatibilitet
        players = window.PlayerManager.getPlayers();
        currentPlayer = players[0] || null;
        window.currentPlayer = currentPlayer; // För bakåtkompatibilitet
    }
    
    // Load first question using GameController if available
    // For now, use fallback until GameController is properly integrated
    loadQuestion();
}

// REMOVED: updateScoreboard - moved to UIRenderer.updateScoreboard()

function updateGameControls() {
    // CRITICAL FIX for BL-002: Check UI availability (race condition protection)
    if (!window.UI) {
        console.warn('🚨 BL-002 FIX: UI not available, retrying in 100ms');
        setTimeout(updateGameControls, 100);
        return;
    }
    
    // Always hide old buttons
    const stopSide = UI?.get('stopSide');
    const nextSide = UI?.get('nextSide');
    
    UI?.hideAllGameButtons();
    
    const currentPlayer = window.PlayerManager.getCurrentPlayer();
    
    // BL-002 SOLVED: Animation system conflicted with player state management
    
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

function loadQuestion() {
    userOrder = [];
    // Reset all players' active state for new question
    
    // Synka globala variabler för kompatibilitet (när anropad från challenges)
    if (window.PlayerManager && ischallengeMode) {
        players = window.PlayerManager.getPlayers();
        currentPlayer = players[0] || null;
        window.currentPlayer = currentPlayer;
    }
    
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
    
    if (currentQuestionIndex >= questions.length) {
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

    // updateQuestionCounter removed - progress bar shows this info
    UI.updateDifficultyBadge(question.svårighetsgrad);
    UI.setQuestionText(question.fråga);
    
    // Hide challenger hint when loading new question (will be shown after player answers)
    UI?.hideHintElement();
    
    const shuffledOptions = window.GameData.shuffleArray(question.alternativ);

    UI?.setOptionsGridLayout();

    // Set instructions
    if (question.typ === 'ordna') {
        UI.setQuestionInstruction(window.PlayerManager?.isSinglePlayerMode() ?
            'Klicka på alternativen i rätt ordning. Ett fel och du förlorar frågans poäng.' :
            'Klicka på alternativen i rätt ordning.');
    } else if (question.typ === 'hör_till') {
        UI.setQuestionInstruction(window.PlayerManager?.isSinglePlayerMode() ?
            'Bedöm varje alternativ. Ett fel och du förlorar frågans poäng.' :
            'Bedöm varje alternativ.');
    } else if (question.typ === 'vilken') {
        UI.setQuestionInstruction(window.PlayerManager?.isSinglePlayerMode() ?
            'Välj rätt alternativ. Ett fel och du förlorar frågans poäng.' :
            'Välj rätt alternativ.');
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
        window.PlayerManager.addPointToCurrentPlayer(button, currentQuestionIndex);
        
        // Update button appearance
        button.className = 'option-btn w-full text-left p-4 rounded-lg border-2 correct-step';
        button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-teal-600 rounded-full font-bold">${userOrder.length}</span> ${optionText}`;
        button.disabled = true;

        // Check if this was the LAST alternative
        if (isCurrentQuestionFullyAnswered()) {
            // Question physically complete - auto-secure ALL active players
            if (window.GameController) {
                window.GameController.handleQuestionFullyCompleted();
            }
            setTimeout(() => {
                showCorrectAnswers();
                // Show challenger hint immediately with correct answers
                if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
                    window.ChallengeSystem.showHint(currentQuestionIndex);
                }
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
                // Show challenger hint immediately with correct answers
                if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
                    window.ChallengeSystem.showHint(currentQuestionIndex);
                }
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
        window.PlayerManager.addPointToCurrentPlayer(container, currentQuestionIndex);
        
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
                // Show challenger hint immediately with correct answers
                if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
                    window.ChallengeSystem.showHint(currentQuestionIndex);
                }
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
                // Show challenger hint immediately with correct answers
                if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
                    window.ChallengeSystem.showHint(currentQuestionIndex);
                }
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
        explanationDiv.className = 'p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800 max-w-2xl mx-auto';
        
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
    // Get players from PlayerManager and sort by score
    const currentPlayers = window.PlayerManager?.getPlayers() || [];
    currentPlayers.sort((a, b) => b.score - a.score);
    
    // Generate scoreboard HTML
    let scoreboardHTML = '';
    currentPlayers.forEach((player, index) => {
        if (index === 0) {
            scoreboardHTML += `
                <div class="flex items-center gap-4 p-3 sm:p-4 bg-slate-100 rounded-lg border-2 border-amber-400">
                    <div class="text-2xl sm:text-3xl">🥇</div>
                    <h3 class="text-lg sm:text-xl font-bold text-amber-600">${player.name}</h3>
                    <p class="ml-auto text-lg sm:text-xl font-bold text-amber-600">${player.score} poäng</p>
                </div>`;
        } else if (index === 1) {
            scoreboardHTML += `
                <div class="flex items-center gap-4 p-3 sm:p-4 bg-slate-100 rounded-lg border-2 border-slate-300">
                    <div class="text-2xl sm:text-3xl">🥈</div>
                    <h3 class="text-base sm:text-lg font-semibold text-slate-500">${player.name}</h3>
                    <p class="ml-auto text-base sm:text-lg font-semibold text-slate-500">${player.score} poäng</p>
                </div>`;
        } else if (index === 2) {
            scoreboardHTML += `
                <div class="flex items-center gap-4 p-3 sm:p-4 bg-slate-100 rounded-lg border-2 border-amber-700">
                    <div class="text-2xl sm:text-3xl">🥉</div>
                    <h3 class="text-base sm:text-lg font-medium text-amber-800">${player.name}</h3>
                    <p class="ml-auto text-base sm:text-lg font-medium text-amber-800">${player.score} poäng</p>
                </div>`;
        } else {
            scoreboardHTML += `
                <div class="flex items-center gap-4 p-3 sm:p-4 bg-slate-100 rounded-lg">
                    <span class="font-bold w-6 text-center">${index + 1}.</span>
                    <span class="text-slate-700">${player.name}</span>
                    <span class="ml-auto text-slate-700">${player.score} poäng</span>
                </div>`;
        }
    });
    
    // Generate complete end screen HTML
    const resultHTML = `
        <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
        <p class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat allihopa!</p>
        
        <div class="space-y-3 sm:space-y-4 mb-8">
            ${scoreboardHTML}
        </div>
        
        <button id="back-to-start-final" class="w-full bg-gradient-to-r from-magic to-primary text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:from-primary hover:to-magic-dark transition-colors shadow-md">
            Tillbaka till start
        </button>
    `;
    
    // Use same mechanism as singleplayer to replace entire innerHTML
    UI?.setEndScreenContent(resultHTML);
    UI?.showEndScreen();
    
    // Add event listener for back button (same as singleplayer)
    const backButton = document.getElementById('back-to-start-final');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Go back to start screen
            const endScreen = UI?.get('endScreen');
            const startScreen = UI?.get('startScreen');
            
            if (endScreen) endScreen.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');
            
            // Reset challenge state when going back to start
            resetChallengeState();
        });
    }
}

async function restartGame() {
    // Game-specific reset - reset game state variables
    currentQuestionIndex = 0;
    window.currentQuestionIndex = 0; // Sync global variable
    currentPlayerIndex = 0;
    questionStarterIndex = 0;
    window.GameController.selectedPack = null;

    // Hide player status bar
    const playerStatusBar = document.getElementById('player-status-bar');
    if (playerStatusBar) {
        playerStatusBar.classList.add('hidden');
    }

    // Restore endScreen HTML to default (non-challenge) state
    const endScreen = document.getElementById('end-screen');
    if (endScreen) {
        endScreen.innerHTML = `
        <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
        <p id="end-screen-subtitle" class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat allihopa!</p>

        <!-- Single Player Final Score -->
        <div id="single-player-final" class="hidden bg-purple-100 text-purple-800 rounded-lg p-6 mb-8">
            <p class="text-xl">Din slutpoäng:</p>
            <p id="single-final-score" class="text-6xl font-bold"></p>
        </div>

        <!-- Multiplayer Final Scoreboard -->
        <div id="final-scoreboard" class="space-y-3 sm:space-y-4 mb-8">
            <!-- Final player scores will be listed here -->
        </div>

        <button id="restart-btn" class="w-full bg-gradient-to-r from-magic to-primary text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:from-primary hover:to-magic-dark transition-colors shadow-md">
            Spela igen
        </button>
    `;

        // Re-attach restart button listener
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', restartGame);
        }
    }

    // Update element references
    endScreenSubtitle = document.getElementById('end-screen-subtitle');
    singlePlayerFinal = document.getElementById('single-player-final');
    singleFinalScore = document.getElementById('single-final-score');
    finalScoreboard = document.getElementById('final-scoreboard');

    // Reset single player display elements
    if (singlePlayerFinal) singlePlayerFinal.classList.add('hidden');
    if (finalScoreboard) finalScoreboard.classList.remove('hidden');

    // Use NavigationManager for all navigation/screen transitions
    // Note: NavigationManager.resetToStartScreen() now handles populatePackSelectors()
    await window.NavigationManager.resetToStartScreen();
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
            isAvailable ? 'cursor-pointer bg-slate-50 border-slate-200 hover:border-purple-400 hover:bg-white' : 
            'cursor-not-allowed bg-slate-100 border-slate-300 opacity-75'
        }`;
        card.dataset.packName = pack.name;
        
        if (isSelected && isAvailable) {
            card.classList.add('selected');
        }

        const priceColor = pack.status === 'available' ? 'text-teal-600' : 'text-slate-400';
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

// Handle vilken-frågor (single correct answer)
function handleVilkenClick(button, optionText) {
    const currentPlayer = window.PlayerManager.getCurrentPlayer();

    // Check player is active
    if (!window.PlayerManager.isPlayerActive(currentPlayer)) return;

    // Prevent double-clicks
    if (button.disabled) return;

    const question = getCurrentQuestion();
    const isCorrect = (optionText === question.rätt_svar);

    // Mark button as answered and disable all options
    button.dataset.answered = 'true';
    UI?.setAllOptionsDisabled(true);

    if (isCorrect) {
        // Rätt svar
        button.className = 'option-btn w-full text-left p-4 rounded-lg border-2 correct-step';
        button.disabled = true;

        // Lägg till poäng (trigger animationer automatiskt)
        window.PlayerManager.addPointToCurrentPlayer(button, currentQuestionIndex);

        // Auto-secure och visa facit efter kort delay
        setTimeout(() => {
            if (window.GameController) {
                window.GameController.handleQuestionFullyCompleted();
            }
            setTimeout(() => {
                showCorrectAnswers();
                // Show challenger hint immediately with correct answers
                if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
                    window.ChallengeSystem.showHint(currentQuestionIndex);
                }
                updateGameControls();
            }, 2000);
        }, 100);

    } else {
        // Fel svar
        button.classList.add('incorrect-step');
        button.disabled = true;

        // Eliminera spelare
        eliminateCurrentPlayer();

        // Visa facit efter animation (eliminateCurrentPlayer har redan callback)
        // Men vi behöver också visa facit explicit för vilken-frågor
        setTimeout(() => {
            showCorrectAnswers();
            // Show challenger hint immediately with correct answers
            if (window.ChallengeSystem && typeof window.ChallengeSystem.showHint === 'function') {
                window.ChallengeSystem.showHint(currentQuestionIndex);
            }
        }, 2000);
    }
}

// Expose functions globally for gameController.js
window.handleOrderClick = handleOrderClick;
window.handleBelongsDecision = handleBelongsDecision;
window.handleVilkenClick = handleVilkenClick;

// Expose functions globally for eventHandlers.js
window.playerStops = playerStops;  // FIX för BL-002: Multiplayer Hör-till bugg
window.showPlayerSetup = showPlayerSetup;
window.createPlayerInputs = createPlayerInputs;
window.initializeGame = initializeGame;
window.restartGame = restartGame;
window.loadQuestion = loadQuestion;
window.openPackShop = openPackShop;
window.closePackShop = closePackShop;
window.startChallengeGame = startChallengeGame;
window.updateGameControls = updateGameControls;  // VERKLIG FIX för BL-002: UI-tillståndshantering

// App initialization now handled exclusively by App.js module