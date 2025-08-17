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
            missing.forEach(name => {
                console.warn(`Missing element '${name}' with selector: #${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            });
        }
    }

    // Convenience method to get an element
    get(elementName) {
        // For pack selectors, always fetch fresh since they might be in hidden containers
        if (elementName === 'packSelect') {
            return document.getElementById('pack-select');
        }
        if (elementName === 'challengePackSelect') {
            return document.getElementById('challenge-pack-select');
        }
        
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
    
    // Set options grid layout
    setOptionsGridLayout() {
        const grid = this.get('optionsGrid');
        if (grid) {
            grid.className = 'grid grid-cols-1 gap-3 sm:gap-4 my-4 sm:my-6';
        }
    }
    
    // Set all option buttons disabled/enabled - MOVED from game.js (ID:11)
    setAllOptionsDisabled(disabled) {
        const grid = this.get('optionsGrid');
        if (!grid) return;
        
        grid.querySelectorAll('button').forEach(btn => {
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
    
    // Show correct answers for belongs questions
    showBelongsCorrectAnswers(question) {
        const correctOptions = question.tillhör_index.map(i => question.alternativ[i]);
        const grid = this.get('optionsGrid');
        if (!grid) return;
        const containers = grid.querySelectorAll('.belongs-option-container');

        containers.forEach(container => {
            if (!container.dataset.decided || container.dataset.decided !== 'true') {
                // This option wasn't answered
                const optionText = container.querySelector('.option-text').textContent;
                const isCorrect = correctOptions.includes(optionText);
                
                const indicator = container.querySelector('.answer-indicator');
                if (indicator) {
                    if (isCorrect) {
                        indicator.textContent = '✓';
                        indicator.className = 'answer-indicator text-lg font-bold text-green-600';
                        container.classList.add('border-green-500', 'bg-green-50');
                    } else {
                        indicator.textContent = '✗';
                        indicator.className = 'answer-indicator text-lg font-bold text-red-600';
                        container.classList.add('border-red-500', 'bg-red-50');
                    }
                }
            }
        });
    }
    
    // Show correct answers for order questions - UPDATED from game.js (ID:11)
    showOrderCorrectAnswers(question) {
        const grid = this.get('optionsGrid');
        if (!grid) return;
        
        // Show correct order for all buttons
        const buttons = grid.querySelectorAll('.option-btn');
        
        buttons.forEach((button) => {
            const optionText = button.textContent;
            const correctIndex = question.rätt_ordning.indexOf(optionText);
            
            // If not already shown as correct (green)
            if (!button.classList.contains('correct-step') && correctIndex !== -1) {
                // Show order number using same format as correct answers, but WITHOUT green background
                button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-green-600 rounded-full font-bold">${correctIndex + 1}</span> ${optionText}`;
            }
        });
    }
    
    // Show correct answers based on question type
    showCorrectAnswers(question) {
        if (question.typ === 'ordna') {
            this.showOrderCorrectAnswers(question);
        } else if (question.typ === 'hör_till') {
            // Run existing feedbackBelongsTo() which already handles this
            if (typeof window.feedbackBelongsTo === 'function') {
                window.feedbackBelongsTo();
            }
            this.showBelongsCorrectAnswers(question);
        }
    }

    // Player display update - MOVED from PlayerManager (ID:7)
    updatePlayerDisplay() {
        const playerStatusBar = this.get('playerStatusBar');
        const activePlayerDisplay = this.get('activePlayerDisplay');
        const miniScores = this.get('miniScores');
        const progressBar = this.get('progressBar');
        const singlePlayerProgress = this.get('singlePlayerProgress');
        const singlePlayerScore = this.get('singlePlayerScore');
        const scoreboard = this.get('scoreboard');
        
        if (playerStatusBar) playerStatusBar.classList.remove('hidden');
        
        // Get player data from PlayerManager
        if (!window.PlayerManager) return;
        
        const players = window.PlayerManager.getPlayers();
        const currentPlayerIndex = window.PlayerManager.currentPlayerIndex;
        
        if (window.PlayerManager.isSinglePlayerMode()) {
            // Single player display
            if (activePlayerDisplay) {
                activePlayerDisplay.textContent = `Totalpoäng: ${players[0].score}`;
            }
            if (miniScores) miniScores.textContent = '';
            
            // Update progress bar
            if (progressBar && window.currentQuestionIndex !== undefined && window.questionsToPlay) {
                const progressPercentage = (window.currentQuestionIndex / window.questionsToPlay.length) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
            
            if (singlePlayerProgress) singlePlayerProgress.classList.remove('hidden');
            if (singlePlayerScore) singlePlayerScore.classList.remove('hidden');
            if (scoreboard) scoreboard.classList.add('hidden');
        } else {
            // Multiplayer display
            const currentPlayer = players[currentPlayerIndex];
            
            if (activePlayerDisplay) {
                activePlayerDisplay.textContent = `${currentPlayer.name}s tur`;
                activePlayerDisplay.classList.add('active-player-highlight');
            }
            
            // Mini scoreboard
            if (miniScores) {
                const scores = players.map(p => `${p.name}: ${p.score}p`).join(' | ');
                miniScores.textContent = scores;
            }
            
            if (singlePlayerProgress) singlePlayerProgress.classList.add('hidden');
            if (singlePlayerScore) singlePlayerScore.classList.add('hidden');
            
            // Update main scoreboard
            this.updateScoreboard();
        }
    }

    // Show explanation box
    showExplanation(explanationText) {
        let explanationDiv = document.getElementById('explanation-div');
        
        if (!explanationDiv) {
            explanationDiv = document.createElement('div');
            explanationDiv.id = 'explanation-div';
            explanationDiv.className = 'p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 max-w-2xl mx-auto';
            
            const footerArea = document.getElementById('footer-area');
            if (footerArea) {
                footerArea.appendChild(explanationDiv);
            }
        }
        
        explanationDiv.innerHTML = `
            <p class="font-semibold mb-1">Förklaring:</p>
            <p>${explanationText}</p>
        `;
        explanationDiv.classList.remove('hidden');
    }
    
    hideExplanation() {
        const explanationDiv = document.getElementById('explanation-div');
        if (explanationDiv) {
            explanationDiv.classList.add('hidden');
        }
    }

    // Screen management - MOVED from game.js (ID:7)
    showGameScreen() {
        // COPIED from working code in game.js:1124-1126
        const startScreen = this.get('startScreen');
        const endScreen = this.get('endScreen');
        const gameScreen = this.get('gameScreen');
        
        if (startScreen) startScreen.classList.add('hidden');
        if (endScreen) endScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');
    }

    showStartScreen() {
        // COPIED from working code in game.js:1878-1884
        const endScreen = this.get('endScreen');
        const startScreen = this.get('startScreen');
        const startMain = this.get('startMain');
        const playerSetup = this.get('playerSetup');
        const challengeForm = this.get('challengeForm');
        
        if (endScreen) endScreen.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
        if (startMain) startMain.classList.remove('hidden');
        if (playerSetup) playerSetup.classList.add('hidden');
        if (challengeForm) challengeForm.classList.add('hidden');
    }

    showEndScreen() {
        // COPIED from working code in game.js:1012-1013 + 964-965
        const gameScreen = this.get('gameScreen');
        const endScreen = this.get('endScreen');
        
        if (gameScreen) gameScreen.classList.add('hidden');
        if (endScreen) endScreen.classList.remove('hidden');
    }

    hideGameScreen() {
        // COPIED from working code in game.js:914-915
        const gameScreen = this.get('gameScreen');
        if (gameScreen) gameScreen.classList.add('hidden');
    }

    // Game controls - MOVED from game.js (ID:7)
    hideAllGameButtons() {
        // COPIED from working code in game.js:1190-1192
        const stopBtn = this.get('stopBtn');
        const nextQuestionBtn = this.get('nextQuestionBtn');
        const largeNextQuestionBtn = this.get('largeNextQuestionBtn');
        
        if (stopBtn) stopBtn.classList.add('hidden');
        if (nextQuestionBtn) nextQuestionBtn.classList.add('hidden');
        if (largeNextQuestionBtn) largeNextQuestionBtn.classList.add('hidden');
    }

    showDecisionButton() {
        // COPIED from working code in game.js:1198, 1219, 1247
        const decisionButton = this.get('decisionButton');
        if (decisionButton) decisionButton.classList.remove('hidden');
    }

    hideDecisionButton() {
        // COPIED from working code in game.js:901
        const decisionButton = this.get('decisionButton');
        if (decisionButton) decisionButton.classList.add('hidden');
    }

    showNextQuestionButton() {
        // COPIED from working code in game.js:902
        const nextQuestionBtn = this.get('nextQuestionBtn');
        if (nextQuestionBtn) nextQuestionBtn.classList.remove('hidden');
    }

    hideStopButton() {
        // COPIED from working code in game.js:900, 1346
        const stopBtn = this.get('stopBtn');
        if (stopBtn) stopBtn.classList.add('hidden');
    }

    // Decision button states - MOVED from game.js (ID:7)
    configureStopButtonForMultiplayerCompleted() {
        // COPIED from working code in game.js:1201-1204
        const stopSide = this.get('stopSide');
        if (stopSide) {
            stopSide.classList.remove('hidden');
            stopSide.classList.add('disabled', 'completed');
            stopSide.disabled = true;
            
            const stopIcon = stopSide.querySelector('.decision-icon');
            const stopAction = stopSide.querySelector('.decision-action');
            const stopPoints = stopSide.querySelector('.decision-points');
            if (stopIcon) stopIcon.textContent = '✅';
            if (stopAction) stopAction.textContent = 'Säkrat';
            if (stopPoints) stopPoints.style.opacity = '0';
        }
    }

    showAndEnableNextSide() {
        // COPIED from working code in game.js:1214-1216
        const nextSide = this.get('nextSide');
        if (nextSide) {
            nextSide.classList.remove('hidden');
            nextSide.disabled = false; // Enable next button
        }
    }

    configureStopButtonForSinglePlayer(hasPoints, isEliminated) {
        // COPIED from working code in game.js:1226-1236
        const stopSide = this.get('stopSide');
        if (stopSide) {
            if (hasPoints && !isEliminated) {
                stopSide.classList.remove('disabled');
                stopSide.disabled = false;
                stopSide.classList.add('has-points');
            } else {
                stopSide.classList.add('disabled');
                stopSide.disabled = true;
                stopSide.classList.remove('has-points');
            }
            stopSide.dataset.processing = 'false';
        }
    }

    configureStopButtonForMultiplayer(isActive, hasPoints, isCompleted) {
        // COPIED from working code in game.js:1253-1270
        const stopSide = this.get('stopSide');
        if (stopSide) {
            if (isActive && hasPoints) {
                // Active player with points - enable stop button
                stopSide.classList.remove('hidden');
                stopSide.classList.remove('disabled');
                stopSide.disabled = false;
            } else {
                // Player completed or no points - disable stop button
                stopSide.classList.remove('hidden');
                stopSide.classList.add('disabled');
                stopSide.disabled = true;
                
                // If player is completed, show they're done
                if (isCompleted) {
                    const stopIcon = stopSide.querySelector('.decision-icon');
                    const stopAction = stopSide.querySelector('.decision-action');
                    if (stopIcon) stopIcon.textContent = '✅';
                    if (stopAction) stopAction.textContent = 'Säkrat!';
                }
            }
        }
    }

    showNextSideWithState(isEnabled) {
        // COPIED from working code in game.js:1275-1277
        const nextSide = this.get('nextSide');
        if (nextSide) {
            nextSide.classList.remove('hidden');
            nextSide.disabled = !isEnabled;
        }
    }

    // Options grid - MOVED from game.js (ID:7)
    clearAndHideOptions() {
        this.clearOptionsGrid();
        this.hideAllGameButtons();
        this.showDecisionButton();
        this.hide('stopBtn');
    }

    // Single player UI - MOVED from game.js (ID:7)
    updateSinglePlayerScore(score) {
        const singlePlayerScore = this.get('singlePlayerScore');
        if (singlePlayerScore) {
            singlePlayerScore.textContent = `Totalpoäng: ${score}`;
        }
    }

    updateProgressBar(current, total) {
        const progressBar = this.get('progressBar');
        if (progressBar) {
            const progressPercentage = (current / total) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
    }

    showSinglePlayerElements() {
        this.show('singlePlayerScore');
        this.show('singlePlayerProgress');
        this.hide('scoreboard');
    }

    // Challenge UI - MOVED from game.js (ID:7)
    showChallengeAcceptScreen(challengerName) {
        const challengerDisplayName = this.get('challengerDisplayName');
        if (challengerDisplayName) {
            challengerDisplayName.textContent = challengerName;
        }
        
        this.hide('startMain');
        this.hide('playerSetup');
        this.hide('challengeForm');
        this.show('challengeAccept');
    }

    hideChallengeAcceptScreen() {
        this.hide('challengeAccept');
        this.show('startMain');
    }

    // Error display - MOVED from game.js (ID:7)
    showError(message) {
        // COPIED from working code in game.js:537-544
        const challengeError = this.get('challengeError');
        if (challengeError) {
            challengeError.textContent = message;
            challengeError.classList.remove('hidden');
            setTimeout(() => {
                challengeError.classList.add('hidden');
            }, 5000);
        }
    }

    // Text content updates - MOVED from game.js (ID:7)
    setChallengerDisplayName(name) {
        // COPIED from working code in game.js:438, 2002, 2019, 2034
        const challengerDisplayName = this.get('challengerDisplayName');
        if (challengerDisplayName) {
            challengerDisplayName.textContent = name;
        }
    }

    updateStatusButton(newText, originalText, delay = 2000) {
        // COPIED from working code in game.js:667-670
        const statusBtn = document.getElementById('check-status-btn');
        if (statusBtn) {
            statusBtn.textContent = newText;
            setTimeout(() => {
                statusBtn.textContent = originalText;
            }, delay);
        }
    }

    updateCopyButton(copiedText = 'Kopierad!', originalText = 'Kopiera länk', delay = 2000) {
        // COPIED from working code in game.js:2060-2063
        const copyLinkBtn = document.getElementById('copy-link-btn') || document.getElementById('copy-link-waiting');
        if (copyLinkBtn) {
            copyLinkBtn.textContent = copiedText;
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
            }, delay);
        }
    }

    updateShareButton(sharedText = '✓ Länk kopierad!', originalText = 'Dela', delay = 2000) {
        // COPIED from working code in game.js:2095-2098
        const shareBtn = document.getElementById('share-btn') || document.getElementById('share-waiting');
        if (shareBtn) {
            shareBtn.innerHTML = sharedText;
            setTimeout(() => {
                shareBtn.textContent = originalText;
            }, delay);
        }
    }

    setFinalScore(score) {
        // COPIED from working code in game.js:968, 1003
        const singleFinalScore = this.get('singleFinalScore');
        if (singleFinalScore) {
            singleFinalScore.textContent = `${score}`;
        }
    }

    setEndScreenContent(htmlContent) {
        // COPIED from working code in game.js:603, 815
        const endScreen = this.get('endScreen');
        if (endScreen) {
            endScreen.innerHTML = htmlContent;
        }
    }

    clearElement(elementName) {
        // COPIED from working code in game.js:1039, 1141, 1737
        const element = this.get(elementName);
        if (element) {
            element.innerHTML = '';
        }
    }

    updateDifficultyBadgeText(difficulty) {
        // COPIED from working code in game.js:1243
        const badge = this.get('difficultyBadge');
        if (badge) {
            badge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        }
    }

    hideHintElement() {
        // COPIED from working code in game.js:1261-1262, 1341-1342
        const hintElement = document.getElementById('challenger-hint');
        if (hintElement) {
            hintElement.classList.add('hidden');
            hintElement.innerHTML = '';
        }
    }

    // Button states - MOVED from game.js (ID:7)
    disableCreateChallengeButton(message) {
        const createChallengeBtn = this.get('createChallengeBtn');
        if (createChallengeBtn) {
            createChallengeBtn.disabled = true;
            createChallengeBtn.textContent = message;
        }
    }

    enableCreateChallengeButton() {
        const createChallengeBtn = this.get('createChallengeBtn');
        if (createChallengeBtn) {
            createChallengeBtn.disabled = false;
            createChallengeBtn.textContent = 'Skapa utmaning';
        }
    }

    // Pack select population - MOVED from game.js (ID:7)
    populatePackSelects(questionPacks) {
        const selects = [this.get('packSelect'), this.get('challengePackSelect')].filter(Boolean);
        
        selects.forEach(select => {
            if (select) {
                select.innerHTML = '';
                
                questionPacks.forEach(pack => {
                    if (pack.status === 'available') {
                        const option = document.createElement('option');
                        option.value = pack.name;
                        option.textContent = pack.name;
                        if (pack.name === 'Blandat med B') {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    }
                });
            }
        });
    }

    // Scoreboard - UPDATED from game.js (ID:11) - complete working implementation
    updateScoreboard() {
        const scoreboard = this.get('scoreboard');
        if (!scoreboard) return;
        
        this.clearElement('scoreboard');
        const players = window.PlayerManager?.getPlayers() || [];
        const currentPlayerIndex = window.currentPlayerIndex || 0;
        
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

    // Notifications - MOVED from game.js (ID:7)
    showNotifications(results) {
        const notificationsArea = this.get('notificationsArea');
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
                        <p class="font-semibold text-green-800">Utmaning avslutad!</p>
                        <p class="text-sm text-green-600">Vs ${challenge.opponent.name} • Vinnare: ${winner}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-green-800">${challenge.challenger.totalScore} - ${challenge.opponent.totalScore}</p>
                    </div>
                </div>
            `;
            
            notification.addEventListener('click', () => {
                if (typeof window.showChallengeResultView === 'function') {
                    window.showChallengeResultView(challenge.id);
                }
            });
            
            notificationsArea.appendChild(notification);
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            notificationsArea.classList.add('hidden');
        }, 10000);
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