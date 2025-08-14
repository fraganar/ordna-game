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
            PlayerManager.updatePlayerDisplay();
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
                    this.questionsToPlay = this.shuffleArray([...this.allQuestions]);
                } else {
                    const filtered = this.allQuestions.filter(q => q.pack === packToLoad);
                    this.questionsToPlay = this.shuffleArray(filtered);
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
    renderQuestionOptions(question) {
        const optionsGrid = UI?.get('optionsGrid');
        if (!optionsGrid) return;
        
        if (question.typ === 'ordna') {
            this.renderOrderOptions(question, optionsGrid);
        } else if (question.typ === 'hör_till') {
            this.renderBelongsOptions(question, optionsGrid);
        }
    }
    
    // Render options for "ordna" type questions
    renderOrderOptions(question, container) {
        question.alternativ.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn p-3 sm:p-4 bg-white border-2 border-slate-300 rounded-lg hover:border-blue-400 transition-all text-sm sm:text-base';
            button.textContent = option;
            button.dataset.index = index;
            
            button.addEventListener('click', () => {
                this.handleOrderClick(button, option, question);
            });
            
            container.appendChild(button);
        });
    }
    
    // Render options for "hör_till" type questions
    renderBelongsOptions(question, container) {
        question.alternativ.forEach((option, index) => {
            const optionContainer = document.createElement('div');
            optionContainer.className = 'belongs-option-container flex items-center gap-2 p-2 bg-slate-50 rounded-lg';
            optionContainer.dataset.option = option;
            optionContainer.dataset.index = index;
            
            const optionText = document.createElement('span');
            optionText.className = 'flex-1 text-sm sm:text-base px-2';
            optionText.textContent = option;
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex gap-1';
            
            const yesBtn = document.createElement('button');
            yesBtn.className = 'decision-btn yes-btn px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-green-700 font-medium transition-colors';
            yesBtn.textContent = 'Ja';
            
            const noBtn = document.createElement('button');
            noBtn.className = 'decision-btn no-btn px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700 font-medium transition-colors';
            noBtn.textContent = 'Nej';
            
            yesBtn.addEventListener('click', () => {
                this.handleBelongsDecision('yes', optionContainer, yesBtn, noBtn, question);
            });
            
            noBtn.addEventListener('click', () => {
                this.handleBelongsDecision('no', optionContainer, yesBtn, noBtn, question);
            });
            
            buttonContainer.appendChild(yesBtn);
            buttonContainer.appendChild(noBtn);
            optionContainer.appendChild(optionText);
            optionContainer.appendChild(buttonContainer);
            container.appendChild(optionContainer);
        });
    }
    
    // Handle click on order option
    handleOrderClick(button, optionText, question) {
        if (button.disabled || this.mistakeMade) return;
        
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.completedRound) return;
        
        const expectedIndex = this.userOrder.length;
        const correctOrder = question.rätt_ordning[expectedIndex];
        const optionIndex = question.alternativ.findIndex(alt => alt === correctOrder);
        const isCorrect = (optionText === question.alternativ[optionIndex]);
        
        if (isCorrect) {
            this.handleCorrectAnswer(button, expectedIndex + 1);
        } else {
            this.handleWrongAnswer(button);
        }
    }
    
    // Handle belongs decision
    handleBelongsDecision(decision, container, yesBtn, noBtn, question) {
        if (yesBtn.disabled || this.mistakeMade) return;
        
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.completedRound) return;
        
        const optionText = container.dataset.option;
        const optionIndex = parseInt(container.dataset.index);
        const shouldBelong = question.tillhör_index.includes(optionIndex);
        const isCorrect = (decision === 'yes') === shouldBelong;
        
        if (isCorrect) {
            this.handleCorrectBelongsAnswer(decision === 'yes' ? yesBtn : noBtn, container);
        } else {
            this.handleWrongBelongsAnswer(decision === 'yes' ? yesBtn : noBtn, container);
        }
    }
    
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
            PlayerManager.addPointToCurrentPlayer(button);
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
            
            this.determineNextAction();
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
            PlayerManager.addPointToCurrentPlayer(button);
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
            
            this.determineNextAction();
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
    
    // Handle when all parts of question are answered correctly
    handleQuestionFullyCompleted() {
        const currentPlayer = window.PlayerManager?.getCurrentPlayer();
        if (currentPlayer && !currentPlayer.completedRound) {
            // Auto-secure points
            if (window.PlayerManager) {
                PlayerManager.secureCurrentPoints();
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
    determineNextAction() {
        setTimeout(() => {
            if (window.PlayerManager?.isMultiplayerMode()) {
                if (window.PlayerManager.hasActivePlayersInRound()) {
                    PlayerManager.nextTurn();
                } else {
                    PlayerManager.concludeQuestionRound();
                    window.updateGameControls();
                }
            } else {
                window.updateGameControls();
            }
        }, 100);
    }
    
    // updateGameControls() moved to game.js for consolidation
    
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
        
        // Show result screen
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
        const endScreen = UI?.get('endScreen');
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
    
    // Utility: Shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
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