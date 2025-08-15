// Challenge System Module - Handles challenge game mode

class ChallengeSystem {
    constructor() {
        this.isChallengeMode = false;
        this.challengeId = null;
        this.challengeData = null;
        this.challengeQuestions = [];
        this.challengeQuestionScores = [];
        this.pendingChallengeCreation = false;
        this.pollingInterval = null;
    }
    
    // Reset challenge state
    reset() {
        this.isChallengeMode = false;
        this.challengeId = null;
        this.challengeData = null;
        this.challengeQuestions = [];
        this.challengeQuestionScores = [];
        this.pendingChallengeCreation = false;
        this.stopPolling();
    }
    
    // Save score for current question
    saveScore(score, questionIndex) {
        if (!this.isChallengeMode) return;
        
        // Only save if we haven't already saved for this question
        if (this.challengeQuestionScores.length === questionIndex) {
            this.challengeQuestionScores.push(score);
        }
    }
    
    // Show challenger hint
    showHint(questionIndex) {
        const hintElement = document.getElementById('challenger-hint');
        if (!hintElement) return;
        
        // ALWAYS hide if not in proper challenge mode
        if (!this.isChallengeMode || !this.challengeId || !this.challengeData) {
            hintElement.classList.add('hidden');
            hintElement.innerHTML = '';
            return;
        }
        
        // Safety checks for challenge data
        if (!this.challengeData.challenger || !this.challengeData.challenger.questionScores) {
            hintElement.classList.add('hidden');
            hintElement.innerHTML = '';
            return;
        }
        
        const score = this.challengeData.challenger.questionScores[questionIndex];
        
        if (score !== undefined) {
            hintElement.innerHTML = `
                <div class="challenger-hint-box">
                    💡 ${this.challengeData.challenger.name}: ${score} poäng på denna fråga
                </div>
            `;
            hintElement.classList.remove('hidden');
        } else {
            hintElement.classList.add('hidden');
            hintElement.innerHTML = '';
        }
    }
    
    // Create a new challenge
    async createChallenge(playerName, questions, scores, totalScore) {
        try {
            const challengeId = await FirebaseAPI.createChallenge({
                challengerName: playerName,
                questions: questions,
                scores: scores,
                totalScore: totalScore
            });
            
            this.challengeId = challengeId;
            
            // Save to localStorage for tracking
            const myChallenges = JSON.parse(localStorage.getItem('myChallenges') || '[]');
            myChallenges.push({
                challengeId: challengeId,
                createdAt: new Date().toISOString(),
                status: 'waiting',
                opponentName: null
            });
            localStorage.setItem('myChallenges', JSON.stringify(myChallenges));
            
            return challengeId;
        } catch (error) {
            console.error('Failed to create challenge:', error);
            throw error;
        }
    }
    
    // Accept a challenge
    async acceptChallenge(challengeId, playerName, scores, totalScore) {
        try {
            await FirebaseAPI.acceptChallenge(challengeId, {
                opponentName: playerName,
                scores: scores,
                totalScore: totalScore
            });
            
            return true;
        } catch (error) {
            console.error('Failed to accept challenge:', error);
            throw error;
        }
    }
    
    // Load challenge data
    async loadChallenge(challengeId) {
        try {
            const data = await FirebaseAPI.getChallenge(challengeId);
            this.challengeData = data;
            this.challengeQuestions = data.questions;
            this.challengeId = challengeId;
            return data;
        } catch (error) {
            console.error('Failed to load challenge:', error);
            throw error;
        }
    }
    
    // Start polling for challenge completion
    startPolling(challengeId, callback) {
        this.stopPolling(); // Stop any existing polling
        
        this.pollingInterval = setInterval(async () => {
            try {
                const challenge = await FirebaseAPI.getChallenge(challengeId);
                
                if (challenge.status === 'completed' && challenge.opponent) {
                    this.stopPolling();
                    if (callback) callback(challenge);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 5000); // Poll every 5 seconds
    }
    
    // Stop polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    
    // Get my challenges
    getMyChallenges() {
        return JSON.parse(localStorage.getItem('myChallenges') || '[]');
    }
    
    // Update challenge status
    updateChallengeStatus(challengeId, status, opponentName = null) {
        const myChallenges = this.getMyChallenges();
        const challenge = myChallenges.find(c => c.challengeId === challengeId);
        
        if (challenge) {
            challenge.status = status;
            if (opponentName) {
                challenge.opponentName = opponentName;
            }
            localStorage.setItem('myChallenges', JSON.stringify(myChallenges));
        }
    }
    
    // Check for new completed challenges
    async checkForNotifications(playerName) {
        if (!playerName) return [];
        
        try {
            const results = await FirebaseAPI.getNewCompletedChallenges(playerName);
            return results || [];
        } catch (error) {
            console.error('Failed to check notifications:', error);
            return [];
        }
    }
    
    // Generate shareable link
    generateShareLink(challengeId) {
        return `${window.location.origin}${window.location.pathname}?challenge=${challengeId}`;
    }
    
    // Share via WhatsApp
    shareViaWhatsApp(challengeId, playerName) {
        const link = this.generateShareLink(challengeId);
        const message = encodeURIComponent(
            `${playerName} utmanar dig i spelet Ordna!\n\n` +
            `Klicka här för att acceptera utmaningen:\n` +
            `${link}`
        );
        const whatsappUrl = `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }
    
    // Share via Web Share API
    async shareViaWebShare(challengeId, playerName) {
        const link = this.generateShareLink(challengeId);
        const shareText = `${playerName} utmanar dig i spelet Ordna!`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareText,
                    text: `${shareText} ${link}`
                });
                return true;
            } catch (err) {
                console.log('User cancelled share or error:', err);
                return false;
            }
        } else {
            // Fallback to WhatsApp
            this.shareViaWhatsApp(challengeId, playerName);
            return true;
        }
    }
    
    // Load and display my challenges (moved from game.js)
    async loadMyChallenges() {
        const myChallengesSection = document.getElementById('my-challenges-section');
        const myChallengesList = document.getElementById('my-challenges-list');
        
        const playerName = window.PlayerManager ? window.PlayerManager.getPlayerName() : null;
        if (!playerName) {
            if (myChallengesSection) myChallengesSection.classList.add('hidden');
            return;
        }
        
        // Get all challenges from localStorage
        const allChallenges = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('challenge_')) {
                try {
                    const challenge = JSON.parse(localStorage.getItem(key));
                    allChallenges.push(challenge);
                } catch (e) {
                    // Invalid data, skip
                }
            }
        }
        
        if (allChallenges.length === 0) {
            if (myChallengesSection) myChallengesSection.classList.add('hidden');
            return;
        }
        
        // Sort by most recent
        allChallenges.sort((a, b) => {
            const aTime = a.createdAt || a.completedAt;
            const bTime = b.createdAt || b.completedAt;
            return new Date(bTime) - new Date(aTime);
        });
        
        // Display challenges
        if (myChallengesList) {
            myChallengesList.innerHTML = '';
            allChallenges.slice(0, 5).forEach(challenge => {
                const item = document.createElement('div');
                item.className = 'bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors';
                
                let statusBadge = '';
                let statusText = '';
                
                if (challenge.role === 'challenger') {
                    if (!challenge.hasSeenResult) {
                        // Check if completed
                        this.checkChallengeCompletionStatus(challenge.id).then(isComplete => {
                            if (isComplete) {
                                const statusBadgeEl = item.querySelector('.status-badge');
                                if (statusBadgeEl) {
                                    statusBadgeEl.innerHTML = 
                                        '<span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Klar!</span>';
                                }
                            }
                        });
                    }
                    statusBadge = challenge.hasSeenResult ? 
                        '<span class="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">Sedd</span>' :
                        '<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Väntar</span>';
                    statusText = `Du: ${challenge.totalScore}p`;
                } else {
                    statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Spelad</span>';
                    statusText = `Du: ${challenge.totalScore}p`;
                }
                
                const timeAgo = this.getTimeAgo(challenge.createdAt || challenge.completedAt);
                
                item.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <p class="font-semibold text-slate-800">${challenge.role === 'challenger' ? 'Utmanade' : 'Utmanad av'} någon</p>
                            <p class="text-sm text-slate-500">${timeAgo} • ${statusText}</p>
                        </div>
                        <div class="status-badge">${statusBadge}</div>
                    </div>
                `;
                
                item.addEventListener('click', async () => {
                    if (challenge.role === 'challenger') {
                        const isComplete = await this.checkChallengeCompletionStatus(challenge.id);
                        if (isComplete) {
                            if (typeof window.showChallengeResultView === 'function') {
                                window.showChallengeResultView(challenge.id);
                            }
                        } else {
                            window.challengeId = challenge.id;
                            if (window.UIController && window.UIController.showWaitingForOpponentView) {
                                window.UIController.showWaitingForOpponentView(challenge.id);
                            }
                        }
                    } else {
                        if (typeof window.showChallengeResultView === 'function') {
                            window.showChallengeResultView(challenge.id);
                        }
                    }
                });
                
                myChallengesList.appendChild(item);
            });
        }
        
        if (myChallengesSection) myChallengesSection.classList.remove('hidden');
    }
    
    // Helper function to check if challenge is complete
    async checkChallengeCompletionStatus(challengeId) {
        try {
            const challenge = await window.FirebaseAPI.getChallenge(challengeId);
            return challenge && challenge.status === 'complete';
        } catch (error) {
            return false;
        }
    }
    
    // Helper function to get time ago text
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInMinutes < 1) return 'Just nu';
        if (diffInMinutes < 60) return `${diffInMinutes}min sedan`;
        if (diffInHours < 24) return `${diffInHours}h sedan`;
        if (diffInDays < 7) return `${diffInDays}d sedan`;
        return date.toLocaleDateString('sv-SE');
    }
    
    // Create a new challenge - starts the game immediately (moved from game.js)
    async createChallenge() {
        const playerName = window.PlayerManager ? window.PlayerManager.getPlayerName() : null;
        console.log('Debug Challenge: playerName:', playerName);
        if (!playerName) {
            console.error('Player not set up');
            return;
        }
        
        try {
            // Set selected pack from challenge dropdown before loading questions
            const challengePackSelect = window.UI?.get('challengePackSelect');
            window.selectedPack = challengePackSelect?.value || null;
            console.log('Debug Challenge: selectedPack:', window.selectedPack);
            
            // Load questions using GameData (working implementation moved there)
            if (window.GameData && window.GameData.loadQuestionsForGame) {
                await window.GameData.loadQuestionsForGame(selectedPack);
                console.log('Debug Challenge: allQuestions length:', window.allQuestions?.length);
            } else {
                console.error('GameData.loadQuestionsForGame not available');
            }
            
            if (!window.allQuestions || window.allQuestions.length === 0) {
                console.error('Debug Challenge: No questions available');
                throw new Error('No questions available for selected pack');
            }
            
            // Select 12 random questions from loaded pack
            const processedQuestions = typeof window.processQuestions === 'function' ? 
                window.processQuestions(window.allQuestions) : window.allQuestions;
            const shuffled = [...processedQuestions];
            if (typeof window.shuffleArray === 'function') {
                window.shuffleArray(shuffled);
            }
            this.challengeQuestions = shuffled.slice(0, 12);
            
            // Set up challenge mode
            this.isChallengeMode = true;
            this.challengeId = null; // Will be set after game completion
            this.challengeQuestionScores = [];
            
            // Set global variables for compatibility
            window.ischallengeMode = true;
            window.challengeQuestions = this.challengeQuestions;
            window.challengeQuestionScores = this.challengeQuestionScores;
            
            // Start the game directly as single player using PlayerManager
            if (window.PlayerManager) {
                window.PlayerManager.initializePlayers(1, [playerName]);
            }
            window.questionsToPlay = this.challengeQuestions;
            
            // Hide challenge form and show game
            const challengeForm = window.UI?.get('challengeForm');
            const singlePlayerScore = window.UI?.get('singlePlayerScore');
            const singlePlayerProgress = window.UI?.get('singlePlayerProgress');
            const scoreboard = window.UI?.get('scoreboard');
            
            if (challengeForm) challengeForm.classList.add('hidden');
            if (window.UI?.showScreen) {
                window.UI.showScreen('gameScreen');
            }
            
            // Setup UI for single player
            if (singlePlayerScore) singlePlayerScore.classList.remove('hidden');
            if (singlePlayerProgress) singlePlayerProgress.classList.remove('hidden');
            if (scoreboard) scoreboard.classList.add('hidden');
            
            window.currentQuestionIndex = 0;
            console.log('Debug Challenge: currentQuestionIndex set to 0');
            console.log('Debug Challenge: questionsToPlay length:', window.questionsToPlay?.length);
            if (typeof window.loadQuestion === 'function') {
                window.loadQuestion();
            }
            
        } catch (error) {
            console.error('Failed to create challenge:', error);
            if (typeof window.showError === 'function') {
                window.showError('Kunde inte skapa utmaning. Försök igen.');
            }
        }
    }
}

// Create global instance and make methods accessible
const challengeSystemInstance = new ChallengeSystem();

// Copy methods to the instance to make them accessible
Object.getOwnPropertyNames(ChallengeSystem.prototype).forEach(name => {
    if (name !== 'constructor' && typeof ChallengeSystem.prototype[name] === 'function') {
        challengeSystemInstance[name] = ChallengeSystem.prototype[name].bind(challengeSystemInstance);
    }
});

window.ChallengeSystem = challengeSystemInstance;