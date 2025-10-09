// Main Application Entry Point - Initializes and coordinates all modules
// Note: isDummyName() is now in utils.js

class App {
    constructor() {
        this.initialized = false;
    }
    
    // Initialize the application
    async initialize() {
        try {
            // Wait for DOM to be ready
            await this.waitForDOM();

            // Initialize player identity (now async for Firebase sync)
            await this.initializePlayer();

            // Load game data
            await this.loadGameData();

            // Setup UI
            this.setupUI();

            // Validate startup dependencies
            this.validateDependencies();

            // Check for challenge in URL
            await this.checkForChallenge();

            // MIGRATED from game.js initializeApp(): Check for notifications
            const playerName = window.PlayerManager ? window.PlayerManager.getPlayerName() : null;
            if (playerName) {
                if (typeof window.checkForNotifications === 'function') {
                    await window.checkForNotifications();
                }
                if (window.ChallengeSystem) {
                    await window.ChallengeSystem.loadMyChallenges();
                }
                // REMOVED: Setting challenger name here was wrong - it overwrote the correct name from Firebase
                // The challenger name is set correctly in showChallengeAcceptScreen() from Firebase data
            }

            // Load my challenges (but don't show notifications automatically)
            if (window.ChallengeSystem) {
                await window.ChallengeSystem.loadMyChallenges();
            }

            this.initialized = true;

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
    
    // Initialize player identity with Firebase sync
    // Update menu display with player info
    updateMenuPlayerInfo() {
        const playerId = localStorage.getItem('playerId');
        const playerName = localStorage.getItem('playerName');

        const menuName = document.getElementById('menu-player-name');
        const menuId = document.getElementById('menu-player-id');

        if (menuName && menuId) {
            menuName.textContent = playerName || 'Inte satt';
            menuId.textContent = playerId || 'Inget ID';
        }
    }

    async initializePlayer() {
        let playerId = localStorage.getItem('playerId');
        let playerName = localStorage.getItem('playerName');

        if (!playerId) {
            // New player - generate ID
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('playerId', playerId);
        }

        // Update menu player info
        this.updateMenuPlayerInfo();

        if (!playerName) {
            // Create unique default name with timestamp
            const timestamp = Date.now().toString().slice(-5); // Last 5 digits of timestamp
            playerName = `Spelare_${timestamp}`;
            localStorage.setItem('playerName', playerName);
        }

        // Update menu player info after setting name
        this.updateMenuPlayerInfo();

        // Set player name in PlayerManager (check if function exists)
        if (playerName && window.PlayerManager && typeof PlayerManager.setPlayerName === 'function') {
            PlayerManager.setPlayerName(playerName);
        }

        // Sync with Firebase (background job - must not block)
        this.syncPlayerToFirebase(playerId, playerName);

        // Clean up old localStorage data (except playerId and playerName)
        this.cleanupLocalStorage();
    }

    // Sync player data to Firebase
    async syncPlayerToFirebase(playerId, playerName) {
        try {
            // Try to fetch from Firebase first
            const firebasePlayer = await FirebaseAPI.getPlayer(playerId);

            if (firebasePlayer) {
                // Player exists in Firebase
                const firebaseName = firebasePlayer.name;

                // ✅ Prefer real Firebase name over local dummy name
                // If Firebase has a real name but localStorage has a dummy name,
                // restore the real name locally (useful for device switching)
                if (firebaseName && !isDummyName(firebaseName) && isDummyName(playerName)) {
                    localStorage.setItem('playerName', firebaseName);
                    if (window.PlayerManager && typeof PlayerManager.setPlayerName === 'function') {
                        PlayerManager.setPlayerName(firebaseName);
                    }
                    // Still update lastSeen but with Firebase name
                    await FirebaseAPI.upsertPlayer(playerId, firebaseName);
                    this.updateMenuPlayerInfo();
                    return;
                }

                // Update lastSeen (but don't overwrite real names with dummy names)
                const nameToSync = isDummyName(playerName) && firebaseName ? firebaseName : playerName;
                await FirebaseAPI.upsertPlayer(playerId, nameToSync);

                // Update local name if it differs and Firebase has real name
                if (firebaseName && firebaseName !== playerName && !isDummyName(firebaseName)) {
                    localStorage.setItem('playerName', firebaseName);
                    // Update PlayerManager if available
                    if (window.PlayerManager && typeof PlayerManager.setPlayerName === 'function') {
                        PlayerManager.setPlayerName(firebaseName);
                    }
                }
            } else {
                // New player or existing without Firebase data
                // Create player with current name (even if dummy - can be updated later)
                await FirebaseAPI.upsertPlayer(playerId, playerName);
            }
        } catch (error) {
            console.error('Failed to sync player to Firebase:', error);
            // Not critical - game works even without Firebase sync
        }
    }

    // Clean up old localStorage entries
    cleanupLocalStorage() {
        const keysToKeep = ['playerId', 'playerName', 'selectedPacks'];
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !keysToKeep.includes(key)) {
                keysToRemove.push(key);
            }
        }

        if (keysToRemove.length > 0) {
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
    }
    
    // Load all game data
    async loadGameData() {
        // Game data loading (without UI population which happens later)

        // MIGRATED from game.js initializeApp(): Populate pack shop
        if (typeof window.populatePackShop === 'function') {
            window.populatePackShop();
        } else {
            console.warn('populatePackShop function not found');
        }
    }
    
    // Setup UI connections
    setupUI() {
        // Connect modules to UI
        if (window.AnimationEngine && typeof AnimationEngine.resetDecisionButtons === 'function') {
            AnimationEngine.resetDecisionButtons();
        }

        // MIGRATED from loadGameData(): Populate pack selectors (now that UI is ready)
        if (window.GameData && typeof window.GameData.populatePackSelectors === 'function') {
            window.GameData.populatePackSelectors();
        } else {
            // Fallback to old method if GameData not available
            if (typeof window.populatePackSelect === 'function') {
                window.populatePackSelect();
            }
        }
        
        // MIGRATED from game.js initializeApp(): UI setup
        if (typeof window.createPlayerInputs === 'function') {
            window.createPlayerInputs();
        }
        if (window.UI && typeof UI.updateScoreboard === 'function') {
            UI.updateScoreboard();
        }
        
        // Set default selected pack
        if (window.GameController) {
            window.GameController.selectedPack = 'Blandat med B';
        }
        
        // Ensure notifications area is hidden at startup
        const notificationsArea = document.getElementById('notifications-area');
        if (notificationsArea) {
            notificationsArea.classList.add('hidden');
            notificationsArea.innerHTML = '';
        }
    }
    
    // Validate that all required global dependencies are available
    validateDependencies() {
        const requiredFunctions = [
            // Functions required by eventHandlers.js
            'playerStops',
            'showPlayerSetup',
            'createPlayerInputs',
            'initializeGame',
            'restartGame',
            'loadQuestion',
            'openPackShop',
            'closePackShop',
            'startChallengeGame',
            // Functions required by gameController.js
            'handleOrderClick',
            'handleBelongsDecision',
            // Functions required by playerManager.js
            'updateGameControls'  // KRITISK för BL-002: UI-tillståndshantering vid spelarbyte
        ];

        const missingFunctions = [];

        for (const funcName of requiredFunctions) {
            if (typeof window[funcName] !== 'function') {
                missingFunctions.push(funcName);
            }
        }

        if (missingFunctions.length > 0) {
            console.error('🚨 CRITICAL: Missing required global functions:', missingFunctions);
            console.error('This can cause runtime errors when event handlers are triggered.');
            console.error('Check that these functions are properly exposed in game.js');
        }

        // Log available modules for debugging
        const modules = ['PlayerManager', 'GameData', 'GameController', 'UI', 'AnimationEngine', 'ChallengeSystem'];
        const missingModules = modules.filter(mod => !window[mod]);

        if (missingModules.length > 0) {
            console.warn('Missing modules:', missingModules);
        }
    }
    
    // Check if URL contains a challenge or admin request
    async checkForChallenge() {

        // Check if admin page is requested
        if (window.location.pathname === '/admin' || window.location.pathname === '/admin.html') {
            // Already on admin page, don't redirect
            return;
        }

        // Check if user navigated to /admin (and redirect if needed)
        if (window.location.pathname.endsWith('/admin')) {
            window.location.href = '/admin.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const challengeParam = urlParams.get('challenge');

        if (challengeParam && window.ChallengeSystem) {
            try {
                
                // Set global challengeId for game.js compatibility
                window.challengeId = challengeParam;
                
                // Load challenge data
                await window.ChallengeSystem.loadChallenge(challengeParam);

                // Show challenge accept screen (await since it's async)
                await this.showChallengeAcceptScreen();
                
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
    
    
    // Show challenge accept screen with double-play protection
    async showChallengeAcceptScreen() {
        try {
            const challenge = window.ChallengeSystem?.challengeData;

            if (!challenge) {
                return;
            }

            // Check if challenge is already completed
            if (challenge.status === 'completed') {
                this.showChallengeBlocked('completed', challenge);
                return;
            }

            // Check if I am the challenger (can't play my own challenge)
            const myPlayerId = localStorage.getItem('playerId');
            if (challenge.challenger?.playerId === myPlayerId) {
                this.showChallengeBlocked('own', challenge);
                return;
            }

            // Show normal accept screen
            const challengerDisplayName = document.getElementById('challenger-display-name');
            if (challengerDisplayName && challenge.challenger) {
                challengerDisplayName.textContent = challenge.challenger.name || 'Okänd spelare';
            }

            // Hide other screens and show challenge accept
            const startMain = UI?.get('startMain');
            const playerSetup = UI?.get('playerSetup');
            const challengeForm = UI?.get('challengeForm');
            const challengeAccept = UI?.get('challengeAccept');

            if (startMain) startMain.classList.add('hidden');
            if (playerSetup) playerSetup.classList.add('hidden');
            if (challengeForm) challengeForm.classList.add('hidden');
            if (challengeAccept) {
                challengeAccept.classList.remove('hidden');
            } else {
                console.error('challengeAccept element not found - cannot show challenge accept screen');
            }

        } catch (error) {
            console.error('Failed to show challenge accept screen:', error);
            this.showError('Kunde inte ladda utmaning');
        }
    }
    
    // Show notifications
    showNotifications(results) {
        const notificationsArea = UI?.get('notificationsArea');
        if (!notificationsArea) return;
        
        notificationsArea.innerHTML = '';
        notificationsArea.classList.remove('hidden');
        
        results.forEach(challenge => {
            const notification = document.createElement('div');
            notification.className = 'bg-teal-50 border border-teal-200 rounded-lg p-3 mb-2 cursor-pointer';
            
            const winner = challenge.opponent.totalScore > challenge.challenger.totalScore ? challenge.opponent.name :
                          challenge.opponent.totalScore < challenge.challenger.totalScore ? 'Du' : 'Oavgjort';
            
            notification.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-semibold text-teal-800">🔔 ${challenge.opponent.name} har spelat klart!</p>
                        <p class="text-sm text-teal-600">Vinnare: ${winner} (${challenge.opponent.totalScore} vs ${challenge.challenger.totalScore} poäng)</p>
                    </div>
                    <button class="text-primary hover:text-primary-dark text-sm font-medium">Se resultat →</button>
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
    }
    
    // Show challenge blocked dialog
    showChallengeBlocked(type, challenge) {
        // Hide all other screens
        const screens = ['startMain', 'playerSetup', 'challengeForm', 'challengeAccept'];
        screens.forEach(screen => {
            const element = document.getElementById(screen) || document.getElementById(screen.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) element.classList.add('hidden');
        });

        // Show challenge blocked dialog
        const blockedDialog = document.getElementById('challenge-blocked');
        const blockedOwn = document.getElementById('challenge-blocked-own');
        const blockedCompleted = document.getElementById('challenge-blocked-completed');

        if (!blockedDialog) {
            // Fallback to alert if dialog doesn't exist
            if (type === 'own') {
                alert('Du kan inte spela din egen utmaning! Dela länken med en vän istället.');
            } else if (type === 'completed') {
                alert('Denna utmaning är redan slutförd!');
            }
            return;
        }

        // Hide both sub-dialogs first
        if (blockedOwn) blockedOwn.classList.add('hidden');
        if (blockedCompleted) blockedCompleted.classList.add('hidden');

        // Show the appropriate sub-dialog
        if (type === 'own' && blockedOwn) {
            blockedOwn.classList.remove('hidden');
        } else if (type === 'completed' && blockedCompleted) {
            blockedCompleted.classList.remove('hidden');

            // Check if I was part of the challenge to show result button
            const myPlayerId = localStorage.getItem('playerId');
            const viewResultBtn = document.getElementById('view-result-btn');
            if (viewResultBtn) {
                if (challenge.challenger?.playerId === myPlayerId ||
                    challenge.opponent?.playerId === myPlayerId) {
                    viewResultBtn.classList.remove('hidden');
                    viewResultBtn.onclick = () => {
                        if (window.ChallengeSystem?.showChallengeResultView) {
                            window.ChallengeSystem.showChallengeResultView(window.challengeId);
                        }
                    };
                } else {
                    viewResultBtn.classList.add('hidden');
                }
            }
        }

        // Show the main dialog
        blockedDialog.classList.remove('hidden');
    }

    // Show error message
    showError(message) {
        // Try to use the blocked dialog for errors
        const blockedDialog = document.getElementById('challenge-blocked');
        if (blockedDialog) {
            // Could extend this to show generic errors in dialog
            alert(message);
        } else {
            alert(message);
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