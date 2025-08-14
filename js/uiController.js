// UI Controller Module - Handles all UI interactions and screen management

class UIController {
    constructor() {
        this.currentScreen = 'start';
    }
    
    // Show player setup screen
    showPlayerSetup() {
        const startMain = UI?.get('startMain');
        const playerSetup = UI?.get('playerSetup');
        
        if (startMain) startMain.classList.add('hidden');
        if (playerSetup) playerSetup.classList.remove('hidden');
        
        this.currentScreen = 'playerSetup';
    }
    
    // Create player input fields based on selected count
    createPlayerInputs() {
        const playerCount = parseInt(UI?.get('playerCountSelect')?.value || '1');
        const container = UI?.get('playerNamesContainer');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < playerCount; i++) {
            const div = document.createElement('div');
            div.innerHTML = `
                <label for="player-${i}" class="block text-base sm:text-lg font-medium text-slate-700 mb-2">
                    ${playerCount === 1 ? 'Ditt namn' : `Spelare ${i + 1}`}
                </label>
                <input type="text" id="player-${i}" placeholder="${playerCount === 1 ? 'Ditt namn' : `Spelare ${i + 1}`}" 
                       class="w-full p-3 border border-slate-300 rounded-lg text-base sm:text-lg" maxlength="20">
            `;
            container.appendChild(div);
        }
        
        // Set default name for single player
        if (playerCount === 1 && window.PlayerManager) {
            const savedName = window.PlayerManager.getPlayerName();
            if (savedName) {
                const input = container.querySelector('#player-0');
                if (input) input.value = savedName;
            }
        }
    }
    
    // Initialize game with selected players
    initializeGame() {
        const playerCount = parseInt(UI?.get('playerCountSelect')?.value || '1');
        const playerNames = [];
        
        // Collect player names
        for (let i = 0; i < playerCount; i++) {
            const input = document.getElementById(`player-${i}`);
            const name = input?.value?.trim();
            playerNames.push(name || `Spelare ${i + 1}`);
        }
        
        // Save first player name if single player
        if (playerCount === 1 && window.PlayerManager) {
            window.PlayerManager.setPlayerName(playerNames[0]);
        }
        
        // Initialize players using PlayerManager
        if (window.PlayerManager) {
            window.PlayerManager.initializePlayers(playerCount, playerNames);
        }
        
        // Hide setup screens and show game
        this.showGameScreen();
        
        // Load questions and start game
        this.startGame();
    }
    
    // Show game screen
    showGameScreen() {
        const startScreen = UI?.get('startScreen');
        const gameScreen = UI?.get('gameScreen');
        
        if (startScreen) startScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');
        
        this.currentScreen = 'game';
    }
    
    // Start the actual game
    async startGame() {
        // Get selected pack
        const packSelect = UI?.get('packSelect');
        const selectedPack = packSelect?.value || 'Blandat med B';
        
        console.log('Starting game with pack:', selectedPack);
        
        // Load questions using GameData
        if (window.GameData) {
            await window.GameData.loadQuestionsFromPack(selectedPack);
        }
        
        // Initialize game state
        if (window.GameController) {
            window.GameController.initializeQuestions(selectedPack);
            window.GameController.loadQuestion();
        }
        
        // Update UI
        if (window.PlayerManager) {
            window.PlayerManager.updatePlayerDisplay();
        }
    }
    
    // Player decides to stop
    playerStops() {
        if (window.PlayerManager) {
            window.PlayerManager.secureCurrentPoints();
        }
    }
    
    // Restart game
    restartGame() {
        // Reset all modules
        if (window.PlayerManager) {
            window.PlayerManager.resetForNewQuestion();
        }
        if (window.GameController) {
            window.GameController.currentQuestionIndex = 0;
        }
        if (window.ChallengeSystem) {
            window.ChallengeSystem.reset();
        }
        
        // Show start screen
        this.showStartScreen();
    }
    
    // Show start screen
    showStartScreen() {
        const startScreen = UI?.get('startScreen');
        const gameScreen = UI?.get('gameScreen');
        const endScreen = UI?.get('endScreen');
        const startMain = UI?.get('startMain');
        const playerSetup = UI?.get('playerSetup');
        
        if (startScreen) startScreen.classList.remove('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
        if (endScreen) endScreen.classList.add('hidden');
        if (startMain) startMain.classList.remove('hidden');
        if (playerSetup) playerSetup.classList.add('hidden');
        
        this.currentScreen = 'start';
    }
    
    // Show challenge form
    handleShowChallengeForm() {
        const startMain = UI?.get('startMain');
        const challengeForm = UI?.get('challengeForm');
        
        if (startMain) startMain.classList.add('hidden');
        if (challengeForm) challengeForm.classList.remove('hidden');
        
        // Set challenger name
        const challengerNameDisplay = UI?.get('challengerNameDisplay');
        if (challengerNameDisplay && window.PlayerManager) {
            const playerName = window.PlayerManager.getPlayerName();
            challengerNameDisplay.textContent = playerName || 'Ditt namn';
        }
    }
    
    // Handle back to start
    handleBackToStart() {
        this.showStartScreen();
    }
    
    // Create challenge
    createChallenge() {
        // This would integrate with ChallengeSystem
        console.log('Create challenge functionality - integrate with ChallengeSystem');
    }
    
    // Start challenge game
    startChallengeGame() {
        // This would integrate with ChallengeSystem
        console.log('Start challenge game functionality - integrate with ChallengeSystem');
    }
    
    // Handle decline challenge
    handleDeclineChallenge() {
        if (window.ChallengeSystem) {
            window.ChallengeSystem.reset();
        }
        this.showStartScreen();
    }
    
    // Save player name (first time setup)
    handleSavePlayerName() {
        const input = UI?.get('playerNameInput');
        const name = input?.value?.trim();
        
        if (name && window.PlayerManager) {
            window.PlayerManager.setPlayerName(name);
        }
        
        this.showStartScreen();
    }
    
    // Open pack shop
    openPackShop() {
        const modal = UI?.get('packShopModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    // Close pack shop
    closePackShop() {
        const modal = UI?.get('packShopModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // Handle copy link
    handleCopyLink() {
        const linkInput = UI?.get('challengeLink');
        if (linkInput) {
            linkInput.select();
            document.execCommand('copy');
        }
    }
    
    // Handle share
    handleShare() {
        // This would integrate with ChallengeSystem sharing
        console.log('Share functionality - integrate with ChallengeSystem');
    }
    
    // Show waiting for opponent view (moved from game.js)
    showWaitingForOpponentView(challengeId) {
        const challengeUrl = window.location.origin + window.location.pathname + 
            '?challenge=' + challengeId;
        
        // Get player score - use PlayerManager if available
        const playerScore = window.PlayerManager ? 
            window.PlayerManager.getPlayers()[0]?.score : 0;
        const playerName = window.PlayerManager ? 
            window.PlayerManager.getPlayerName() : 'Spelare';
        
        // Create waiting view HTML
        const waitingHTML = `
            <div class="p-6 sm:p-8 lg:p-12 text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Utmaning skapad!</h2>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p class="text-lg font-semibold text-blue-800 mb-2">Ditt resultat: ${playerScore} poäng</p>
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
        
        const endScreen = UI?.get('endScreen');
        if (endScreen) {
            endScreen.innerHTML = waitingHTML;
            endScreen.classList.remove('hidden');
        }
        
        // Add event listeners
        this.setupWaitingViewListeners(challengeId, challengeUrl, playerName);
        
        // Start polling if ChallengeSystem available
        if (window.ChallengeSystem && window.ChallengeSystem.startPolling) {
            window.ChallengeSystem.startPolling(challengeId, (challenge) => {
                // Handle challenge completion
                if (typeof window.showChallengeResultView === 'function') {
                    window.showChallengeResultView(challengeId);
                }
            });
        }
    }
    
    // Setup event listeners for waiting view
    setupWaitingViewListeners(challengeId, challengeUrl, playerName) {
        const copyBtn = document.getElementById('copy-link-waiting');
        const shareBtn = document.getElementById('share-waiting');
        const checkBtn = document.getElementById('check-status-btn');
        const backBtn = document.getElementById('back-to-start-waiting');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const input = document.getElementById('challenge-link-waiting');
                try {
                    await navigator.clipboard.writeText(input.value);
                    copyBtn.textContent = 'Kopierad!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Kopiera länk';
                    }, 2000);
                } catch (err) {
                    input.select();
                    document.execCommand('copy');
                }
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const shareText = `${playerName} utmanar dig i spelet Ordna!`;
                
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: `${playerName} utmanar dig i spelet Ordna!`,
                            text: `${shareText} ${challengeUrl}`
                        });
                    } catch (err) {
                        // User cancelled
                    }
                } else {
                    // Desktop fallback
                    const fullMessage = `${shareText} ${challengeUrl}`;
                    try {
                        await navigator.clipboard.writeText(fullMessage);
                        shareBtn.innerHTML = '✓ Länk kopierad!';
                        setTimeout(() => {
                            shareBtn.textContent = 'Dela';
                        }, 2000);
                    } catch (err) {
                        const input = document.getElementById('challenge-link-waiting');
                        input.select();
                        document.execCommand('copy');
                        shareBtn.innerHTML = '✓ Länk kopierad!';
                        setTimeout(() => {
                            shareBtn.textContent = 'Dela';
                        }, 2000);
                    }
                }
            });
        }
        
        if (checkBtn) {
            checkBtn.addEventListener('click', async () => {
                if (typeof window.checkChallengeStatus === 'function') {
                    await window.checkChallengeStatus(challengeId);
                }
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // Stop polling
                if (window.ChallengeSystem && window.ChallengeSystem.stopPolling) {
                    window.ChallengeSystem.stopPolling();
                }
                
                // Go back to start
                this.showStartScreen();
                
                // Reset challenge state
                if (window.ChallengeSystem) {
                    window.ChallengeSystem.reset();
                }
                
                // Reload challenges if function exists
                if (window.ChallengeSystem) {
                    window.ChallengeSystem.loadMyChallenges();
                }
            });
        }
    }
}

// Create global instance and make methods accessible
const uiControllerInstance = new UIController();

// Copy methods to the instance to make them accessible
Object.getOwnPropertyNames(UIController.prototype).forEach(name => {
    if (name !== 'constructor' && typeof UIController.prototype[name] === 'function') {
        // Make methods available globally for eventHandlers
        window[name] = UIController.prototype[name].bind(uiControllerInstance);
    }
});

window.UIController = uiControllerInstance;