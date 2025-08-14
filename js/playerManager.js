// Player Manager Module - Handles all player-related logic

class PlayerManager {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.questionStarterIndex = 0;
        this.currentPlayer = {
            name: localStorage.getItem('playerName') || '',
            totalScore: 0
        };
    }
    
    // Initialize players for a game
    initializePlayers(playerCount, playerNames) {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.questionStarterIndex = 0;
        
        for (let i = 0; i < playerCount; i++) {
            this.players.push({
                name: playerNames[i] || `Spelare ${i + 1}`,
                score: 0,
                roundPot: 0,
                completedRound: false,
                completionReason: null // 'stopped', 'wrong', 'finished'
            });
        }
        
        console.log('Initialized players:', this.players);
    }
    
    // Get current active player
    getCurrentPlayer() {
        if (this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex];
    }
    
    // Get all players
    getPlayers() {
        return this.players;
    }
    
    // Check if single player mode
    isSinglePlayerMode() {
        return this.players.length === 1;
    }
    
    // Check if multiplayer mode
    isMultiplayerMode() {
        return this.players.length > 1;
    }
    
    // Check if player is active in current round
    isPlayerActive(player) {
        return !player.completedRound && player.completionReason === null;
    }
    
    // Check if there are active players in round
    hasActivePlayersInRound() {
        return this.players.some(player => this.isPlayerActive(player));
    }
    
    // Reset all players for new question
    resetForNewQuestion() {
        this.players.forEach(player => {
            player.roundPot = 0;
            player.completedRound = false;
            player.completionReason = null;
        });
        
        // Set starting player for multiplayer
        if (this.isMultiplayerMode()) {
            this.currentPlayerIndex = this.questionStarterIndex;
        }
        
        // Reset UI for turn
        this.resetPlayerUIForTurn();
    }
    
    // Reset UI for player turn
    resetPlayerUIForTurn() {
        if (this.isSinglePlayerMode()) return;
        
        const stopSide = UI?.get('stopSide');
        if (!stopSide) return;
        
        // Reset decision button state
        stopSide.classList.remove('disabled', 'completed');
        stopSide.disabled = false;
        
        // Restore original stop button content (important for multiplayer when switching players)
        const stopIcon = stopSide.querySelector('.decision-icon');
        const stopAction = stopSide.querySelector('.decision-action');
        if (stopIcon) stopIcon.textContent = '🛡️';
        if (stopAction) stopAction.textContent = 'Stanna';
        
        // Update points display
        if (window.AnimationEngine) {
            window.AnimationEngine?.updateStopButtonPoints();
        }
    }
    
    // Add point to current player
    addPointToCurrentPlayer(sourceElement) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;
        
        currentPlayer.roundPot++;
        
        // Show animation
        if (window.AnimationEngine) {
            window.AnimationEngine?.showPointAnimation(sourceElement);
        }
        
        // Update display
        this.updatePlayerDisplay();
        
        // Wake up stop button on first point
        if (currentPlayer.roundPot === 1 && window.AnimationEngine) {
            window.AnimationEngine?.wakeUpStopButton();
        }
    }
    
    // Player decides to stop and secure points
    secureCurrentPoints() {
        const currentPlayer = this.getCurrentPlayer();
        const pointsToSecure = currentPlayer.roundPot;
        
        if (pointsToSecure <= 0) return;
        
        // Secure the points
        currentPlayer.score += pointsToSecure;
        currentPlayer.roundPot = 0;
        currentPlayer.completedRound = true;
        currentPlayer.completionReason = 'stopped';
        
        // Show animations
        if (window.AnimationEngine) {
            window.AnimationEngine?.showSecureAnimation(pointsToSecure);
        }
        
        // Update display
        this.updatePlayerDisplay();
        
        // Handle next action
        setTimeout(() => {
            if (this.isMultiplayerMode()) {
                if (this.hasActivePlayersInRound()) {
                    this.nextTurn();
                } else {
                    this.concludeQuestionRound();
                }
            }
        }, 2000);
    }
    
    // Move to next player's turn
    nextTurn() {
        if (!this.isMultiplayerMode()) return;
        
        // Find next active player
        let attempts = 0;
        const maxAttempts = this.players.length;
        
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            attempts++;
        } while (this.players[this.currentPlayerIndex].completedRound && attempts < maxAttempts);
        
        // Reset UI for new turn
        this.resetPlayerUIForTurn();
        
        // Update display
        this.updatePlayerDisplay();
        
        // Update game controls to handle stop button enable/disable based on player points
        if (typeof window.updateGameControls === 'function') {
            window.updateGameControls();
        }
        
        // Show turn transition effect
        const playerStatusBar = UI?.get('playerStatusBar');
        if (playerStatusBar) {
            playerStatusBar.classList.add('turn-transition');
            setTimeout(() => {
                playerStatusBar.classList.remove('turn-transition');
            }, 300);
        }
    }
    
    // Conclude current question round
    concludeQuestionRound() {
        // Auto-secure points for any remaining active players
        this.players.forEach(player => {
            if (!player.completedRound && player.roundPot > 0) {
                player.score += player.roundPot;
                player.roundPot = 0;
                player.completedRound = true;
                player.completionReason = 'finished';
            }
        });
        
        // Rotate starting player for next question
        if (this.isMultiplayerMode()) {
            this.questionStarterIndex = (this.questionStarterIndex + 1) % this.players.length;
        }
        
        // Update display
        this.updatePlayerDisplay();
    }
    
    // Update player display (scoreboard, status bar, etc.)
    updatePlayerDisplay() {
        const playerStatusBar = UI?.get('playerStatusBar');
        const activePlayerDisplay = UI?.get('activePlayerDisplay');
        const miniScores = UI?.get('miniScores');
        const progressBar = UI?.get('progressBar');
        const singlePlayerProgress = UI?.get('singlePlayerProgress');
        const singlePlayerScore = UI?.get('singlePlayerScore');
        const scoreboard = UI?.get('scoreboard');
        
        if (playerStatusBar) playerStatusBar.classList.remove('hidden');
        
        if (this.isSinglePlayerMode()) {
            // Single player display
            if (activePlayerDisplay) {
                activePlayerDisplay.textContent = `Totalpoäng: ${this.players[0].score}`;
            }
            if (miniScores) miniScores.textContent = '';
            
            // Update progress bar
            if (window.GameController) {
                const progressPercentage = (window.GameController.currentQuestionIndex / window.GameController.questionsToPlay.length) * 100;
                if (progressBar) progressBar.style.width = `${progressPercentage}%`;
            }
            if (singlePlayerProgress) singlePlayerProgress.classList.remove('hidden');
            
            // Hide old displays
            if (singlePlayerScore) singlePlayerScore.classList.add('hidden');
            if (scoreboard) scoreboard.classList.add('hidden');
        } else {
            // Multiplayer display
            const activePlayer = this.getCurrentPlayer();
            if (activePlayerDisplay && activePlayer) {
                activePlayerDisplay.innerHTML = `
                    <span class="inline-flex items-center gap-2">
                        <span class="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                        <span class="text-blue-700 font-bold text-lg">${activePlayer.name} spelar</span>
                    </span>
                `;
            }
            
            // Build mini scores
            if (miniScores) {
                const scores = this.players.map(p => {
                    const isActive = p === activePlayer && !p.completedRound;
                    const scoreClass = isActive ? 'text-blue-700 font-bold' : 'text-slate-600';
                    return `<span class="${scoreClass}">${p.name}: ${p.score}</span>`;
                }).join(' • ');
                
                miniScores.innerHTML = scores;
            }
            
            // Hide single player displays
            if (singlePlayerScore) singlePlayerScore.classList.add('hidden');
            if (singlePlayerProgress) singlePlayerProgress.classList.add('hidden');
            if (scoreboard) scoreboard.classList.add('hidden');
        }
    }
    
    // Save player name to localStorage
    setPlayerName(name) {
        this.currentPlayer.name = name;
        localStorage.setItem('playerName', name);
    }
    
    // Get saved player name
    getPlayerName() {
        return this.currentPlayer.name;
    }
}

// Create global instance and make methods accessible
const playerManagerInstance = new PlayerManager();

// Copy methods to the instance to make them accessible
Object.getOwnPropertyNames(PlayerManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof PlayerManager.prototype[name] === 'function') {
        playerManagerInstance[name] = PlayerManager.prototype[name].bind(playerManagerInstance);
    }
});

window.PlayerManager = playerManagerInstance;