class UIRenderer {
    constructor() {
        // Initialize all DOM references
        this.elements = {
            // Start screen elements
            startScreen: document.getElementById('start-screen'),
            startMain: document.getElementById('start-main'),
            playerSetup: document.getElementById('player-setup'),
            showPlayerSetupBtn: document.getElementById('show-player-setup-btn'),
            playerCountSelect: document.getElementById('player-count'),
            playerNamesContainer: document.getElementById('player-names-container'),
            startGameBtn: document.getElementById('start-game-btn'),
            
            // Player name setup
            playerNameSetup: document.getElementById('player-name-setup'),
            playerNameInput: document.getElementById('player-name-input'),
            savePlayerNameBtn: document.getElementById('save-player-name-btn'),
            
            // Challenge form elements
            challengeForm: document.getElementById('challenge-form'),
            showChallengeFormBtn: document.getElementById('show-challenge-form-btn'),
            challengerNameDisplay: document.getElementById('challenger-name-display'),
            createChallengeBtn: document.getElementById('create-challenge-btn'),
            backToStartBtn: document.getElementById('back-to-start-btn'),
            challengeSuccess: document.getElementById('challenge-success'),
            challengeError: document.getElementById('challenge-error'),
            challengeLink: document.getElementById('challenge-link'),
            copyLinkBtn: document.getElementById('copy-link-btn'),
            shareBtn: document.getElementById('share-btn'),
            
            // Challenge accept elements
            challengeAccept: document.getElementById('challenge-accept'),
            challengerDisplayName: document.getElementById('challenger-display-name'),
            acceptChallengeBtn: document.getElementById('accept-challenge-btn'),
            declineChallengeBtn: document.getElementById('decline-challenge-btn'),
            
            // Notifications
            notificationsArea: document.getElementById('notifications-area'),
            
            // Game screen elements
            gameScreen: document.getElementById('game-screen'),
            endScreen: document.getElementById('end-screen'),
            restartBtn: document.getElementById('restart-btn'),
            packSelect: document.getElementById('pack-select'),
            challengePackSelect: document.getElementById('challenge-pack-select'),
            questionCounter: document.getElementById('question-counter'),
            scoreboard: document.getElementById('scoreboard'),
            difficultyBadge: document.getElementById('difficulty-badge'),
            questionText: document.getElementById('question-text'),
            questionInstruction: document.getElementById('question-instruction'),
            optionsGrid: document.getElementById('options-grid'),
            stopBtn: document.getElementById('stop-btn'),
            nextQuestionBtn: document.getElementById('next-question-btn'),
            finalScoreboard: document.getElementById('final-scoreboard'),
            
            // Decision button elements
            decisionButton: document.getElementById('decision-button'),
            stopSide: document.getElementById('stop-side'),
            nextSide: document.getElementById('next-side'),
            largeNextQuestionBtn: document.getElementById('large-next-question-btn'),
            
            // Pack shop elements
            packShopModal: document.getElementById('pack-shop-modal'),
            openPackShopBtn: document.getElementById('open-pack-shop-btn'),
            closePackShopBtn: document.getElementById('close-pack-shop-btn'),
            confirmPacksBtn: document.getElementById('confirm-packs-btn'),
            packGrid: document.getElementById('pack-grid'),
            
            // Single player elements
            singlePlayerScore: document.getElementById('single-player-score'),
            singlePlayerProgress: document.getElementById('single-player-progress'),
            progressBar: document.getElementById('progress-bar'),
            singlePlayerStars: document.getElementById('single-player-stars'), // Legacy - may not exist
            currentScoreContainer: document.getElementById('current-score-container'), // Legacy - may not exist
            singlePlayerFinal: document.getElementById('single-player-final'),
            singleFinalScore: document.getElementById('single-final-score'),
            endScreenSubtitle: document.getElementById('end-screen-subtitle'),
            
            // Multiplayer elements
            playerStatusBar: document.getElementById('player-status-bar'),
            activePlayerDisplay: document.getElementById('active-player-display'),
            miniScores: document.getElementById('mini-scores')
        };

        // Validate that all elements exist
        this.validateElements();
    }

    validateElements() {
        const missing = [];
        for (const [name, element] of Object.entries(this.elements)) {
            if (!element) {
                missing.push(name);
            }
        }
        
        if (missing.length > 0) {
            console.warn('Missing DOM elements:', missing);
        }
    }

    // Convenience method to get an element
    get(elementName) {
        const element = this.elements[elementName];
        if (!element) {
            console.warn(`Element '${elementName}' not found`);
        }
        return element;
    }

    // Show/hide helper methods
    show(elementName) {
        const element = this.get(elementName);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hide(elementName) {
        const element = this.get(elementName);
        if (element) {
            element.classList.add('hidden');
        }
    }

    // Screen transition methods
    showScreen(screenName) {
        // Hide all main screens first
        this.hide('startScreen');
        this.hide('gameScreen');
        this.hide('endScreen');
        
        // Show the requested screen
        this.show(screenName);
    }

    // Common UI update methods that were scattered in game.js
    updateQuestionCounter(current, total) {
        const counter = this.get('questionCounter');
        if (counter) {
            counter.textContent = `Fråga ${current} av ${total}`;
        }
    }

    updateDifficultyBadge(difficulty) {
        const badge = this.get('difficultyBadge');
        if (badge) {
            badge.textContent = difficulty;
            badge.className = 'difficulty-badge';
            if (difficulty === 'lätt') badge.classList.add('easy');
            else if (difficulty === 'medel') badge.classList.add('medium');
            else if (difficulty === 'svår') badge.classList.add('hard');
        }
    }

    setQuestionText(text) {
        const questionText = this.get('questionText');
        if (questionText) {
            questionText.textContent = text;
        }
    }

    setQuestionInstruction(instruction) {
        const instructionElement = this.get('questionInstruction');
        if (instructionElement) {
            instructionElement.textContent = instruction;
        }
    }

    clearOptionsGrid() {
        const grid = this.get('optionsGrid');
        if (grid) {
            grid.innerHTML = '';
        }
    }
}

// Create global UI instance when DOM is ready
let UI;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UI = new UIRenderer();
        window.UI = UI; // Make it globally accessible
    });
} else {
    // DOM already loaded
    UI = new UIRenderer();
    window.UI = UI;
}