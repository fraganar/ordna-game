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