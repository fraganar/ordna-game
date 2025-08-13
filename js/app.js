// Main Application Entry Point - Initializes and coordinates all modules

class App {
    constructor() {
        this.initialized = false;
    }
    
    // Initialize the application
    async initialize() {
        console.log('Initializing Ordna Game...');
        
        try {
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize player identity
            this.initializePlayer();
            
            // Load game data
            await this.loadGameData();
            
            // Setup UI
            this.setupUI();
            
            // Check for challenge in URL
            await this.checkForChallenge();
            
            // Check for notifications
            await this.checkNotifications();
            
            // Load my challenges
            this.loadMyChallenges();
            
            this.initialized = true;
            console.log('Ordna Game initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }
    
    // Wait for DOM to be ready
    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    // Initialize player identity
    initializePlayer() {
        let playerId = localStorage.getItem('playerId');
        let playerName = localStorage.getItem('playerName');
        
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('playerId', playerId);
        }
        
        // Set player name in PlayerManager (check if function exists)
        if (playerName && window.PlayerManager && typeof PlayerManager.setPlayerName === 'function') {
            PlayerManager.setPlayerName(playerName);
        }
        
        console.log('Player initialized:', { playerId, playerName });
    }
    
    // Load all game data
    async loadGameData() {
        if (window.GameData && typeof GameData.initialize === 'function') {
            await GameData.initialize();
            
            // Pass questions to GameController
            if (window.GameController) {
                GameController.allQuestions = GameData.allQuestions;
                GameController.packMetadata = GameData.packMetadata;
            }
            
            // Populate pack selectors
            GameData.populatePackSelectors();
        }
    }
    
    // Setup UI connections
    setupUI() {
        // Connect modules to UI
        if (window.AnimationEngine && typeof AnimationEngine.resetDecisionButtons === 'function') {
            AnimationEngine.resetDecisionButtons();
        }
    }
    
    // Check if URL contains a challenge
    async checkForChallenge() {
        const urlParams = new URLSearchParams(window.location.search);
        const challengeParam = urlParams.get('challenge');
        
        if (challengeParam && window.ChallengeSystem) {
            try {
                // Load challenge data
                await ChallengeSystem.loadChallenge(challengeParam);
                
                // Show challenge accept screen
                this.showChallengeAcceptScreen();
                
            } catch (error) {
                console.error('Failed to load challenge:', error);
                this.showError('Utmaningen kunde inte laddas. Kontrollera länken.');
            }
        }
    }
    
    // Check for challenge notifications
    async checkNotifications() {
        if (!window.ChallengeSystem || !window.PlayerManager) return;
        
        const playerName = window.PlayerManager ? window.PlayerManager.getPlayerName() : null;
        if (!playerName) return;
        
        try {
            const results = await window.ChallengeSystem.checkForNotifications(playerName);
            if (results && results.length > 0) {
                this.showNotifications(results);
            }
        } catch (error) {
            console.error('Failed to check notifications:', error);
        }
    }
    
    // Load user's challenges
    loadMyChallenges() {
        if (!window.ChallengeSystem) return;
        
        const challenges = window.ChallengeSystem ? window.ChallengeSystem.getMyChallenges() : [];
        if (challenges.length === 0) return;
        
        // Show my challenges section
        const section = document.getElementById('my-challenges-section');
        const list = document.getElementById('my-challenges-list');
        
        if (section && list) {
            section.classList.remove('hidden');
            list.innerHTML = '';
            
            challenges.forEach(challenge => {
                const item = document.createElement('div');
                item.className = 'challenge-item p-2 bg-slate-50 rounded flex justify-between items-center';
                
                const statusText = challenge.status === 'waiting' ? '⏳ Väntar på svar' :
                                  challenge.status === 'completed' ? '✅ Avslutad' : '❓ Okänd';
                
                item.innerHTML = `
                    <span class="text-sm">vs ${challenge.opponentName || 'Väntar...'}</span>
                    <span class="text-xs text-slate-500">${statusText}</span>
                `;
                
                list.appendChild(item);
            });
        }
    }
    
    // Show challenge accept screen
    showChallengeAcceptScreen() {
        const challengeData = ChallengeSystem?.challengeData;
        if (!challengeData) return;
        
        const challengerDisplayName = UI?.get('challengerDisplayName');
        if (challengerDisplayName) {
            challengerDisplayName.textContent = challengeData.challenger.name;
        }
        
        // Hide other screens and show challenge accept
        const startMain = UI?.get('startMain');
        const playerSetup = UI?.get('playerSetup');
        const challengeForm = UI?.get('challengeForm');
        const challengeAccept = UI?.get('challengeAccept');
        
        if (startMain) startMain.classList.add('hidden');
        if (playerSetup) playerSetup.classList.add('hidden');
        if (challengeForm) challengeForm.classList.add('hidden');
        if (challengeAccept) challengeAccept.classList.remove('hidden');
    }
    
    // Show notifications
    showNotifications(results) {
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
                    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">Se resultat →</button>
                </div>
            `;
            
            notification.addEventListener('click', () => {
                this.showChallengeResult(challenge.id);
            });
            
            notificationsArea.appendChild(notification);
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            notificationsArea.classList.add('hidden');
        }, 10000);
    }
    
    // Show challenge result
    async showChallengeResult(challengeId) {
        // This would show the challenge result screen
        // Implementation depends on how you want to display results
        console.log('Show challenge result:', challengeId);
    }
    
    // Show error message
    showError(message) {
        const challengeError = UI?.get('challengeError');
        if (challengeError) {
            challengeError.textContent = message;
            challengeError.classList.remove('hidden');
            setTimeout(() => {
                challengeError.classList.add('hidden');
            }, 5000);
        }
    }
}

// Create and initialize app when DOM is ready
const app = new App();

// Initialize when all modules are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.initialize();
    });
} else {
    app.initialize();
}