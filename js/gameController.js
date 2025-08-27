// Game Controller Module - Manages core game flow and state

class GameController {
    constructor() {
        // Game state
        this.currentQuestionIndex = 0;
        this.questionsToPlay = [];
        this.userOrder = [];
        this.mistakeMade = false;
        this.selectedPack = null;
        
        // Challenge mode state
        this.isChallengeMode = false;
        this.challengeId = null;
        this.challengeQuestions = [];
        this.challengeQuestionScores = [];
        this.challengeData = null;
        
        // Pack data
        this.packMetadata = {};
        this.allQuestions = [];
    }
    
    // Initialize game based on mode
    async initializeGame(playerCount, playerNames) {
        console.log(`Starting game with ${playerCount} player(s)`);
        
        // Initialize players through PlayerManager
        if (window.PlayerManager) {
            PlayerManager.initializePlayers(playerCount, playerNames);
        }
        
        // Load questions based on selected pack
        await this.loadQuestions();
        
        // Reset game state
        this.currentQuestionIndex = 0;
        this.userOrder = [];
        this.mistakeMade = false;
        
        // Show game screen
        if (window.UI) {
            UI.showScreen('gameScreen');
            UI.updateQuestionCounter(1, this.questionsToPlay.length);
        }
        
        // Update display
        if (window.PlayerManager) {
            UI?.updatePlayerDisplay();
        }
        
        // Load first question
        this.loadQuestion();
    }
    
    // Load questions based on selected pack
    async loadQuestions() {
        try {
            // If challenge mode, use challenge questions
            if (this.isChallengeMode && this.challengeQuestions.length > 0) {
                this.questionsToPlay = [...this.challengeQuestions];
                console.log('Using challenge questions:', this.questionsToPlay.length);
                return;
            }
            
            // Otherwise load from packs
            const packToLoad = this.selectedPack || 'Grund';
            console.log('Loading questions from pack:', packToLoad);
            
            // Filter questions by pack
            if (this.allQuestions.length > 0) {
                if (packToLoad === 'Alla') {
                    this.questionsToPlay = window.GameData.shuffleArray([...this.allQuestions]);
                } else {
                    const filtered = this.allQuestions.filter(q => q.pack === packToLoad);
                    this.questionsToPlay = window.GameData.shuffleArray(filtered);
                }
                console.log(`Loaded ${this.questionsToPlay.length} questions from pack: ${packToLoad}`);
            }
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.questionsToPlay = [];
        }
    }
    
    // Load and display current question
    loadQuestion() {
        
        // Check if game should end
        if (this.currentQuestionIndex >= this.questionsToPlay.length) {
            this.endGame();
            return;
        }
        
        const question = this.questionsToPlay[this.currentQuestionIndex];
        if (!question) {
            console.error('No question found at index:', this.currentQuestionIndex);
            return;
        }
        
        // Reset state for new question
        this.userOrder = [];
        this.mistakeMade = false;
        
        // Reset player states for new question round
        if (window.PlayerManager) {
            PlayerManager.resetForNewQuestion();
        }
        
        // Update UI
        if (window.UI) {
            UI.updateQuestionCounter(this.currentQuestionIndex + 1, this.questionsToPlay.length);
            UI.updateDifficultyBadge(question.svårighetsgrad);
            UI.setQuestionText(question.fråga);
            
            // Set instruction based on question type
            const instruction = question.typ === 'ordna' 
                ? 'Klicka på alternativen i rätt ordning'
                : `Vilka ${question.kategori || 'hör till'}?`;
            UI.setQuestionInstruction(instruction);
            
            // Clear and populate options
            UI.clearOptionsGrid();
            this.renderQuestionOptions(question);
        }
        
        // Update game controls
        window.updateGameControls();
    }
    
    // Render question options based on type
    // Render question options based on type - MOVED FROM game.js (working implementation)
    renderQuestionOptions(question) {
        const optionsGrid = UI?.get('optionsGrid');
        if (!optionsGrid) return;
        
        if (question.typ === 'ordna') {
            this.renderOrderOptions(question, optionsGrid);
        } else if (question.typ === 'hör_till') {
            this.renderBelongsOptions(question, optionsGrid);
        }
    }
    
    // Create order button - MOVED FROM game.js (working implementation)
    renderOrderOptions(question, optionsGrid) {
        const shuffledOptions = window.GameData.shuffleArray(question.alternativ);
        
        shuffledOptions.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'option-btn w-full text-left p-3 sm:p-4 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-400 text-sm sm:text-base';
            button.textContent = optionText;
            button.addEventListener('click', () => window.handleOrderClick(button, optionText));
            
            // Add ripple effect if available
            if (window.visualEffects && window.visualEffects.addRippleEffect) {
                window.visualEffects.addRippleEffect(button);
            }
            
            optionsGrid.appendChild(button);
        });
    }
    
    // Create belongs option - MOVED FROM game.js (working implementation) 
    renderBelongsOptions(question, optionsGrid) {
        // Reset the answersShown flag for new question
        if (optionsGrid) {
            optionsGrid.dataset.answersShown = 'false';
        }
        
        const shuffledOptions = window.GameData.shuffleArray(question.alternativ);
        
        shuffledOptions.forEach(optionText => {
            const container = document.createElement('div');
            container.className = 'belongs-option-container w-full text-left p-2 rounded-lg border-2 border-slate-300 bg-white';
            
            const text = document.createElement('span');
            text.textContent = optionText;
            text.className = 'option-text flex-grow pr-2 sm:pr-4 text-sm sm:text-base';

            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'decision-buttons';

            const yesBtn = document.createElement('button');
            yesBtn.innerHTML = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
            yesBtn.className = 'yes-btn';
            
            const noBtn = document.createElement('button');
            noBtn.innerHTML = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;
            noBtn.className = 'no-btn';

            yesBtn.addEventListener('click', () => window.handleBelongsDecision(true, container, yesBtn, noBtn));
            noBtn.addEventListener('click', () => window.handleBelongsDecision(false, container, yesBtn, noBtn));

            buttonWrapper.appendChild(yesBtn);
            buttonWrapper.appendChild(noBtn);
            container.appendChild(text);
            container.appendChild(buttonWrapper);
            optionsGrid.appendChild(container);
        });
    }
    
    // Use GameData.shuffleArray for consistency
    
    // Handle correct answer for order questions
    handleCorrectAnswer(button, orderNumber) {
        button.disabled = true;
        button.classList.add('correct', 'bg-green-100', 'border-green-500');
        
        const orderBadge = document.createElement('span');
        orderBadge.className = 'order-number';
        orderBadge.textContent = orderNumber;
        button.appendChild(orderBadge);
        
        this.userOrder.push(button.textContent);
        
        // Add point and show animation
        if (window.PlayerManager) {
            PlayerManager.addPointToCurrentPlayer(button, this.currentQuestionIndex);
        }
        
        // Check if question is complete
        this.checkQuestionComplete();
    }
    
    // Handle wrong answer for order questions
    handleWrongAnswer(button) {
        button.classList.add('wrong', 'bg-red-100', 'border-red-500');
        this.mistakeMade = true;
        
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        if (currentPlayer) {
            const pointsToLose = currentPlayer.roundPot;
            currentPlayer.roundPot = 0;
            currentPlayer.completedRound = true;
            currentPlayer.completionReason = 'wrong';
            
            // Show feedback
            this.showCorrectOrder();
            
            // Handle next action
            if (window.AnimationEngine) {
                window.AnimationEngine?.enableNextButtonAfterMistake(pointsToLose);
            }
            
            // Use the working implementation from game.js
            if (typeof window.determineNextAction === 'function') {
                window.determineNextAction();
            }
        }
    }
    
    // Handle correct belongs answer
    handleCorrectBelongsAnswer(button, container) {
        button.classList.add('bg-green-500', 'text-white');
        button.disabled = true;
        
        const otherButton = button.classList.contains('yes-btn') 
            ? container.querySelector('.no-btn')
            : container.querySelector('.yes-btn');
        otherButton.disabled = true;
        otherButton.classList.add('opacity-50');
        
        container.classList.add('decided', 'bg-green-50');
        
        // Add point
        if (window.PlayerManager) {
            PlayerManager.addPointToCurrentPlayer(button, this.currentQuestionIndex);
        }
        
        // Check if all belongs questions are answered
        this.checkBelongsComplete();
    }
    
    // Handle wrong belongs answer
    handleWrongBelongsAnswer(button, container) {
        button.classList.add('bg-red-500', 'text-white');
        button.disabled = true;
        
        const otherButton = button.classList.contains('yes-btn')
            ? container.querySelector('.no-btn')
            : container.querySelector('.yes-btn');
        otherButton.disabled = true;
        
        container.classList.add('wrong', 'bg-red-50');
        this.mistakeMade = true;
        
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        if (currentPlayer) {
            const pointsToLose = currentPlayer.roundPot;
            currentPlayer.roundPot = 0;
            currentPlayer.completedRound = true;
            currentPlayer.completionReason = 'wrong';
            
            // Show feedback
            this.showCorrectBelongs();
            
            // Handle next action
            if (window.AnimationEngine) {
                window.AnimationEngine?.enableNextButtonAfterMistake(pointsToLose);
            }
            
            // Use the working implementation from game.js
            if (typeof window.determineNextAction === 'function') {
                window.determineNextAction();
            }
        }
    }
    
    // Check if order question is complete
    checkQuestionComplete() {
        const question = this.questionsToPlay[this.currentQuestionIndex];
        const allAnswered = this.userOrder.length === question.alternativ.length;
        
        if (allAnswered) {
            this.handleQuestionFullyCompleted();
        }
    }
    
    // Check if belongs question is complete
    checkBelongsComplete() {
        const allContainers = document.querySelectorAll('.belongs-option-container');
        const decidedContainers = document.querySelectorAll('.belongs-option-container.decided');
        
        if (decidedContainers.length === allContainers.length) {
            this.handleQuestionFullyCompleted();
        }
    }
    
    // Handle when all parts of question are answered (right or wrong)
    handleQuestionFullyCompleted() {
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        const currentPlayerWrong = currentPlayer?.completionReason === 'wrong';
        
        if (currentPlayerWrong) {
            // Current player answered wrong on last option
            // Wait for loss animation to complete before auto-securing others
            setTimeout(() => {
                if (window.PlayerManager) {
                    window.PlayerManager.secureAllActivePoints();
                }
            }, 1500); // 1.5 second delay after wrong answer animation
        } else {
            // Normal case - auto-secure immediately
            if (window.PlayerManager) {
                window.PlayerManager.secureAllActivePoints();
            }
        }
    }
    
    // Show correct order for order questions
    showCorrectOrder() {
        const question = this.questionsToPlay[this.currentQuestionIndex];
        const buttons = document.querySelectorAll('.option-btn');
        
        buttons.forEach(button => {
            const optionText = button.textContent;
            const correctIndex = question.rätt_ordning.findIndex(letter => {
                const index = letter.charCodeAt(0) - 65;
                return question.alternativ[index] === optionText;
            });
            
            if (correctIndex !== -1 && !button.classList.contains('correct')) {
                button.classList.add('missed', 'bg-yellow-50', 'border-yellow-500');
                const orderBadge = document.createElement('span');
                orderBadge.className = 'order-number missed';
                orderBadge.textContent = correctIndex + 1;
                button.appendChild(orderBadge);
            }
            
            button.disabled = true;
        });
    }
    
    // Show correct answers for belongs questions
    showCorrectBelongs() {
        const question = this.questionsToPlay[this.currentQuestionIndex];
        const containers = document.querySelectorAll('.belongs-option-container');
        
        containers.forEach((container, index) => {
            if (!container.classList.contains('decided')) {
                const shouldBelong = question.tillhör_index.includes(index);
                const correctBtn = shouldBelong 
                    ? container.querySelector('.yes-btn')
                    : container.querySelector('.no-btn');
                
                if (correctBtn) {
                    correctBtn.classList.add('bg-yellow-500', 'text-white');
                    container.classList.add('bg-yellow-50');
                }
            }
            
            // Disable all buttons
            container.querySelectorAll('button').forEach(btn => btn.disabled = true);
        });
    }
    
    // Determine next action after answer
    // determineNextAction() - using the working implementation from game.js
    // updateGameControls() - consolidated in game.js
    
    // Move to next question
    nextQuestion() {
        this.currentQuestionIndex++;
        this.loadQuestion();
    }
    
    // End game
    endGame() {
        if (window.PlayerManager?.isMultiplayerMode()) {
            this.endMultiplayerGame();
        } else {
            this.endSinglePlayerGame();
        }
    }
    
    // End single player game
    endSinglePlayerGame() {
        
        const player = window.PlayerManager?.getPlayers()[0];
        if (!player) return;
        
        // Normal single player end screen - challenges handled by game.js
        if (window.UI) {
            UI.showScreen('endScreen');
            const singlePlayerFinal = UI.get('singlePlayerFinal');
            const singleFinalScore = UI.get('singleFinalScore');
            const finalScoreboard = UI.get('finalScoreboard');
            
            if (singlePlayerFinal) singlePlayerFinal.classList.remove('hidden');
            if (singleFinalScore) singleFinalScore.textContent = player.score;
            if (finalScoreboard) finalScoreboard.classList.add('hidden');
        }
    }
    
    // End multiplayer game
    endMultiplayerGame() {
        // Manually handle screen transitions - DON'T use UI.showEndScreen() as it resets content
        const startScreen = UI?.get('startScreen');
        const gameScreen = UI?.get('gameScreen');
        const endScreen = UI?.get('endScreen');
        
        if (startScreen) startScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
        if (endScreen) endScreen.classList.remove('hidden');
        
        const players = window.PlayerManager?.getPlayers() || [];
        players.sort((a, b) => b.score - a.score);
        
        const finalScoreboard = UI?.get('finalScoreboard');
        if (finalScoreboard) {
            finalScoreboard.innerHTML = '';
            
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
                    rankDiv.classList.add('border-2', 'border-slate-400');
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
                finalScoreboard.appendChild(rankDiv);
            });
        }
    }
    
    // REMOVED: shuffleArray - using GameData.shuffleArray for consistency
}

// Create global instance and make methods accessible
const gameControllerInstance = new GameController();

// Copy methods to the instance to make them accessible
Object.getOwnPropertyNames(GameController.prototype).forEach(name => {
    if (name !== 'constructor' && typeof GameController.prototype[name] === 'function') {
        gameControllerInstance[name] = GameController.prototype[name].bind(gameControllerInstance);
    }
});

window.GameController = gameControllerInstance;