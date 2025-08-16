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
        
        // Update displays
        if (window.AnimationEngine) {
            window.AnimationEngine?.updateStopButtonPoints();
        }
        UI?.updatePlayerDisplay();
        
        // Update game controls (important for button states)
        if (typeof window.updateGameControls === 'function') {
            window.updateGameControls();
        }
        
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
        
        // CRITICAL BUGFIX: Don't secure points if player answered wrong
        if (currentPlayer.completionReason === 'wrong') return;
        
        // Save score for challenge mode when securing points
        if (window.ChallengeSystem) {
            window.ChallengeSystem.saveScore(pointsToSecure, window.currentQuestionIndex);
        }
        
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
        UI?.updatePlayerDisplay();
        
        // Handle next action
        setTimeout(() => {
            if (this.isMultiplayerMode()) {
                if (this.hasActivePlayersInRound()) {
                    this.nextTurn();
                } else {
                    this.concludeQuestionRound();
                }
            } else {
                // Single player: update controls to enable next button
                if (typeof window.updateGameControls === 'function') {
                    window.updateGameControls();
                }
            }
        }, 2000);
    }
    
    // Auto-secure all active players' points (for when question is fully completed)
    // UNIFIED auto-secure for 1-N players (no special casing for single player)
    secureAllActivePoints() {
        // Collect info BEFORE modifying state (for proper animations)
        const currentPlayer = this.getCurrentPlayer();
        const playersToSecure = [];
        
        // Find all players eligible for auto-securing
        // Rules: Not completed, has points, not eliminated
        this.players.forEach(player => {
            if (!player.completedRound && player.roundPot > 0 && player.completionReason !== 'wrong') {
                playersToSecure.push({
                    player: player,
                    points: player.roundPot
                });
            }
        });
        
        // Secure points for all eligible players
        playersToSecure.forEach(({player, points}) => {
            player.score += points;
            player.roundPot = 0;
            player.completedRound = true;
            player.completionReason = 'finished';
            
            // Save for challenge mode if current player
            if (player === currentPlayer && window.ChallengeSystem) {
                window.ChallengeSystem.saveScore(points, window.currentQuestionIndex);
            }
        });
        
        // Update display immediately
        UI?.updatePlayerDisplay();
        
        // Show animations sequentially with proper delay between each
        if (playersToSecure.length > 0 && window.AnimationEngine) {
            this.showSequentialAnimations(playersToSecure, 0);
        } else {
            // No animations to show, conclude immediately
            setTimeout(() => {
                this.concludeQuestionRound();
            }, 2000);
        }
    }
    
    // Show animations one by one with delay
    showSequentialAnimations(playersToSecure, index) {
        if (index >= playersToSecure.length) {
            // All animations done, conclude question
            setTimeout(() => {
                this.concludeQuestionRound();
            }, 1500); // Extra delay after last animation
            return;
        }
        
        const {player, points} = playersToSecure[index];
        
        // Show animation for this player
        if (window.AnimationEngine) {
            // Add visual indicator for which player is being secured (optional)
            console.log(`Securing ${player.name}: ${points} points`);
            window.AnimationEngine.showSecureAnimation(points);
        }
        
        // Show next animation after a longer delay (2 seconds)
        setTimeout(() => {
            this.showSequentialAnimations(playersToSecure, index + 1);
        }, 2000); // 2 second delay between animations
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
        UI?.updatePlayerDisplay();
        
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
        UI?.updatePlayerDisplay();
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