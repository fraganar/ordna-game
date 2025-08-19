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
        this.challengePollingInterval = null;
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
        this.stopChallengePolling();
    }
    
    // Save score for current question
    saveScore(score, questionIndex) {
        if (!this.isChallengeMode) return;
        
        // Ensure array is large enough
        while (this.challengeQuestionScores.length <= questionIndex) {
            this.challengeQuestionScores.push(0);
        }
        
        // Add to existing score for this question (for multi-point questions)
        this.challengeQuestionScores[questionIndex] += score;
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
            // Challenger didn't play this question - don't show hint
            hintElement.classList.add('hidden');
            hintElement.innerHTML = '';
        }
    }
    
    // Helper: Create challenge record in Firebase  
    async createChallengeRecord(playerName, questions, scores, totalScore) {
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
    
    // Complete challenge (when game ends) - MOVED from game.js endGame()
    async completeChallenge() {
        
        if (!window.ischallengeMode) {
            return; // Not in challenge mode at all
        }
        
        // Handle CHALLENGER mode (creating new challenge)
        if (!window.challengeId) {
        
        try {
            // Get final score from PlayerManager
            const finalPlayer = window.PlayerManager.getCurrentPlayer();
            const finalScore = finalPlayer ? finalPlayer.score : 0;
            
            // Create the challenge in Firebase with the results  
            const playerName = finalPlayer ? finalPlayer.name : 'Unknown';
            const playerId = finalPlayer ? finalPlayer.id : 'unknown_id';
            
            // Use the actual question scores as they were earned (don't pad with zeros)
            const completeScores = [...window.challengeQuestionScores];
            
            const newChallengeId = await FirebaseAPI.createChallenge(
                playerName,
                playerId,
                window.challengeQuestions,
                finalScore,
                completeScores,
                window.selectedPack
            );
            
            window.challengeId = newChallengeId;
            
            // Save to localStorage
            const challengeInfo = {
                id: newChallengeId,
                role: 'challenger',
                playerName: playerName,
                createdAt: new Date().toISOString(),
                hasSeenResult: false,
                totalScore: finalScore,
                questionScores: window.challengeQuestionScores
            };
            localStorage.setItem(`challenge_${newChallengeId}`, JSON.stringify(challengeInfo));
            
            // Show waiting for opponent view
            this.showWaitingForOpponentView(newChallengeId);
            
            return newChallengeId;
        } catch (error) {
            console.error('🔥 CHALLENGER MODE ERROR:', error);
            throw error;
        }
        } else {
            // Handle OPPONENT mode (accepting existing challenge)
            return false; // Let game.js handle opponent completion
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
    
    // Challenge-specific polling functions (copied from game.js.backup)
    startChallengePolling(challengeId) {
        // Stop any existing polling
        this.stopChallengePolling();
        
        // Start with 10 second interval
        let currentInterval = 10000;
        let pollingCount = 0;
        
        const poll = async () => {
            pollingCount++;
            
            // Increase interval after 5 minutes (30 polls at 10s)
            if (pollingCount > 30) {
                currentInterval = 60000; // 60 seconds
                this.stopChallengePolling();
                this.challengePollingInterval = setInterval(poll, currentInterval);
            }
            
            await this.checkChallengeStatus(challengeId);
        };
        
        // Start polling
        this.challengePollingInterval = setInterval(poll, currentInterval);
        
        // Also check immediately
        this.checkChallengeStatus(challengeId);
    }
    
    stopChallengePolling() {
        if (this.challengePollingInterval) {
            clearInterval(this.challengePollingInterval);
            this.challengePollingInterval = null;
        }
    }
    
    // Check challenge status (copied from game.js.backup)
    async checkChallengeStatus(challengeId) {
        try {
            const challenge = await FirebaseAPI.getChallenge(challengeId);
            
            if (challenge && challenge.status === 'complete') {
                // Stop polling
                this.stopChallengePolling();
                // Show result view
                this.showChallengeResultView(challengeId);
            } else {
                // Show status message
                const statusBtn = document.getElementById('check-status-btn');
                if (statusBtn) {
                    statusBtn.textContent = 'Väntar fortfarande...';
                    setTimeout(() => {
                        statusBtn.textContent = 'Kolla status';
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Failed to check challenge status:', error);
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
                            if (window.ChallengeSystem && typeof window.ChallengeSystem.showChallengeResultView === 'function') {
                                window.ChallengeSystem.showChallengeResultView(challenge.id);
                            }
                        } else {
                            window.challengeId = challenge.id;
                            this.showWaitingForOpponentView(challenge.id);
                        }
                    } else {
                        if (window.ChallengeSystem && typeof window.ChallengeSystem.showChallengeResultView === 'function') {
                            window.ChallengeSystem.showChallengeResultView(challenge.id);
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
            const challenge = await FirebaseAPI.getChallenge(challengeId);
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
    
    // Show waiting for opponent view (moved from game.js.backup)
    showWaitingForOpponentView(challengeId) {
        const challengeUrl = window.location.origin + window.location.pathname + 
            '?challenge=' + challengeId;
        
        // Get player score from PlayerManager
        const players = window.PlayerManager?.getPlayers() || [];
        const playerScore = players[0]?.score || 0;
        const playerName = window.PlayerManager?.getPlayerName() || 'Spelare';
        
        // Create waiting view HTML
        const waitingHTML = `
            <div class="p-6 sm:p-8 lg:p-12 text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Utmaning skapad!</h2>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p class="text-lg font-semibold text-blue-800 mb-2">Ditt resultat: ${playerScore} poäng</p>
                    <p class="text-sm text-blue-600">Väntar på att din vän ska spela...</p>
                </div>
                
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                    <p class="text-sm text-slate-600 mb-3">Dela denna länk:</p>
                    <div class="bg-white border border-slate-300 rounded p-2 mb-3">
                        <input type="text" id="challenge-link-waiting" value="${challengeUrl}" readonly class="w-full text-xs text-gray-600 bg-transparent border-none outline-none">
                    </div>
                    <div class="flex space-x-2">
                        <button id="copy-link-waiting" class="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
                            Kopiera länk
                        </button>
                        <button id="share-waiting" class="flex-1 bg-slate-600 text-white py-2 px-3 rounded text-sm hover:bg-slate-700">
                            Dela
                        </button>
                    </div>
                </div>
                
                <button id="check-status-btn" class="w-full bg-slate-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-700 transition-colors mb-4">
                    Kolla status
                </button>
                
                <button id="back-to-start-waiting" class="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-300 transition-colors">
                    Tillbaka till start
                </button>
            </div>
        `;
        
        const endScreen = window.UI?.get('endScreen');
        if (endScreen) {
            endScreen.innerHTML = waitingHTML;
            endScreen.classList.remove('hidden');
        }
        
        // Add event listeners (copied from game.js.backup)
        document.getElementById('copy-link-waiting').addEventListener('click', async () => {
            const input = document.getElementById('challenge-link-waiting');
            try {
                await navigator.clipboard.writeText(input.value);
                document.getElementById('copy-link-waiting').textContent = 'Kopierad!';
                setTimeout(() => {
                    document.getElementById('copy-link-waiting').textContent = 'Kopiera länk';
                }, 2000);
            } catch (err) {
                input.select();
                document.execCommand('copy');
            }
        });
        
        document.getElementById('share-waiting').addEventListener('click', async () => {
            const shareText = `${playerName} utmanar dig i spelet Ordna!`;
            
            // Check if Web Share API is available (mobile and some desktop browsers)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${playerName} utmanar dig i spelet Ordna!`,
                        text: `${shareText} ${challengeUrl}`
                    });
                } catch (err) {
                    // User cancelled sharing - do nothing
                    console.log('Delning avbruten');
                }
            } else {
                // Desktop fallback - copy link with message
                const fullMessage = `${shareText} ${challengeUrl}`;
                try {
                    await navigator.clipboard.writeText(fullMessage);
                    const btn = document.getElementById('share-waiting');
                    btn.innerHTML = '✓ Länk kopierad!';
                    setTimeout(() => {
                        btn.textContent = 'Dela';
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    const input = document.getElementById('challenge-link-waiting');
                    input.select();
                    document.execCommand('copy');
                    const btn = document.getElementById('share-waiting');
                    btn.innerHTML = '✓ Länk kopierad!';
                    setTimeout(() => {
                        btn.textContent = 'Dela';
                    }, 2000);
                }
            }
        });
        
        document.getElementById('check-status-btn').addEventListener('click', async () => {
            await this.checkChallengeStatus(challengeId);
        });
        
        document.getElementById('back-to-start-waiting').addEventListener('click', () => {
            // Go directly to start screen without showing end screen
            this.stopChallengePolling();
            
            // Hide all screens first
            const gameScreen = window.UI?.get('gameScreen');
            const endScreen = window.UI?.get('endScreen');
            const playerSetup = window.UI?.get('playerSetup');
            const challengeForm = window.UI?.get('challengeForm');
            const startScreen = window.UI?.get('startScreen');
            const startMain = window.UI?.get('startMain');
            
            if (gameScreen) gameScreen.classList.add('hidden');
            if (endScreen) endScreen.classList.add('hidden');
            if (playerSetup) playerSetup.classList.add('hidden');
            if (challengeForm) challengeForm.classList.add('hidden');
            
            // Show start screen
            if (startScreen) startScreen.classList.remove('hidden');
            if (startMain) startMain.classList.remove('hidden');
            
            // Reset game state
            this.reset();
            
            // Reload my challenges
            this.loadMyChallenges();
        });
        
        // Start polling
        this.startChallengePolling(challengeId);
    }
    
    // Show challenge result comparison view
    async showChallengeResultView(challengeId) {
        try {
            // Get challenge data from Firebase
            const challenge = await FirebaseAPI.getChallenge(challengeId);
            
            if (!challenge) {
                throw new Error('Challenge not found');
            }
            
            // Use role-based identification instead of name matching
            const storedChallenge = localStorage.getItem(`challenge_${challengeId}`);
            const challengeInfo = storedChallenge ? JSON.parse(storedChallenge) : null;
            
            // Determine role from localStorage (more reliable than name matching)
            const isChallenger = challengeInfo?.role === 'challenger';
            
            console.log('DEBUG: Using role-based identification');
            console.log('DEBUG: storedChallenge role:', challengeInfo?.role);
            console.log('DEBUG: isChallenger:', isChallenger);
            console.log('DEBUG: challenge.challenger.name:', challenge.challenger.name);
            console.log('DEBUG: challenge.opponent?.name:', challenge.opponent?.name);
            
            const myData = isChallenger ? challenge.challenger : challenge.opponent;
            const opponentData = isChallenger ? challenge.opponent : challenge.challenger;
            
            console.log('DEBUG: showChallengeResultView - myData:', myData);
            console.log('DEBUG: showChallengeResultView - opponentData:', opponentData);
            
            // Create result view HTML
            const resultHTML = `
                <div class="p-6 sm:p-8 lg:p-12">
                    <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">Utmaning avslutad!</h2>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="text-center">
                            <h3 class="font-bold text-lg mb-2">${myData.name}</h3>
                            <p class="text-3xl font-bold ${myData.totalScore > opponentData.totalScore ? 'text-green-600' : 'text-slate-600'}">${myData.totalScore} p</p>
                            <div class="mt-2 text-sm text-slate-500">
                                ${myData.questionScores.map((score, i) => `F${i+1}: ${score}p`).join(' | ')}
                            </div>
                        </div>
                        <div class="text-center">
                            <h3 class="font-bold text-lg mb-2">${opponentData.name}</h3>
                            <p class="text-3xl font-bold ${opponentData.totalScore > myData.totalScore ? 'text-green-600' : 'text-slate-600'}">${opponentData.totalScore} p</p>
                            <div class="mt-2 text-sm text-slate-500">
                                ${opponentData.questionScores.map((score, i) => `F${i+1}: ${score}p`).join(' | ')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-100 rounded-lg p-4 mb-6 text-center">
                        ${myData.totalScore > opponentData.totalScore ? 
                            '<p class="text-xl font-bold text-green-600">🎉 Du vann!</p>' :
                            myData.totalScore < opponentData.totalScore ?
                            '<p class="text-xl font-bold text-red-600">Du förlorade!</p>' :
                            '<p class="text-xl font-bold text-blue-600">Oavgjort!</p>'
                        }
                    </div>
                    
                    <button id="new-challenge-btn" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors mb-3">
                        Revansch!
                    </button>
                    
                    <button id="back-to-start-result" class="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-300 transition-colors">
                        Tillbaka till start
                    </button>
                </div>
            `;
            
            const endScreen = window.UI?.get('endScreen');
            if (endScreen) {
                endScreen.innerHTML = resultHTML;
                endScreen.classList.remove('hidden');
            }
            
            // Update localStorage to mark as seen
            const storedChallenge = localStorage.getItem(`challenge_${challengeId}`);
            if (storedChallenge) {
                const challengeInfo = JSON.parse(storedChallenge);
                challengeInfo.hasSeenResult = true;
                localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(challengeInfo));
            }
            
            // Add event listeners
            const newChallengeBtn = document.getElementById('new-challenge-btn');
            const backToStartBtn = document.getElementById('back-to-start-result');
            
            if (newChallengeBtn) {
                newChallengeBtn.addEventListener('click', () => {
                    if (typeof window.restartGame === 'function') {
                        window.restartGame();
                    }
                    const showChallengeFormBtn = window.UI?.get('showChallengeFormBtn');
                    if (showChallengeFormBtn) {
                        showChallengeFormBtn.click();
                    }
                });
            }
            
            if (backToStartBtn) {
                backToStartBtn.addEventListener('click', () => {
                    // Go directly to start screen without showing end screen
                    this.stopPolling();
                    
                    // Hide all screens first
                    const gameScreen = window.UI?.get('gameScreen');
                    const playerSetup = window.UI?.get('playerSetup');
                    const challengeForm = window.UI?.get('challengeForm');
                    const startScreen = window.UI?.get('startScreen');
                    const startMain = window.UI?.get('startMain');
                    
                    if (gameScreen) gameScreen.classList.add('hidden');
                    if (endScreen) endScreen.classList.add('hidden');
                    if (playerSetup) playerSetup.classList.add('hidden');
                    if (challengeForm) challengeForm.classList.add('hidden');
                    
                    // Show start screen
                    if (startScreen) startScreen.classList.remove('hidden');
                    if (startMain) startMain.classList.remove('hidden');
                    
                    // Reset game state
                    this.reset();
                    
                    // Reload my challenges
                    this.loadMyChallenges();
                });
            }
            
        } catch (error) {
            console.error('Failed to show challenge result:', error);
            window.UI?.showError('Kunde inte ladda resultat');
            if (typeof window.restartGame === 'function') {
                window.restartGame();
            }
        }
    }
    
    // Create a new challenge - starts the game immediately (moved from game.js)
    async createChallenge() {
        const playerName = window.PlayerManager ? window.PlayerManager.getPlayerName() : null;
        if (!playerName) {
            console.error('Player not set up');
            return;
        }
        
        try {
            // Set selected pack from challenge dropdown before loading questions
            const challengePackSelect = window.UI?.get('challengePackSelect');
            const selectedPack = challengePackSelect?.value || null;
            window.selectedPack = selectedPack; // Also set global for compatibility
            
            // Load questions using GameData (working implementation moved there)
            if (window.GameData && window.GameData.loadQuestionsForGame) {
                await window.GameData.loadQuestionsForGame(selectedPack);
            } else {
                console.error('GameData.loadQuestionsForGame not available');
            }
            
            if (!window.allQuestions || window.allQuestions.length === 0) {
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
            
            // Set questions in global scope where initializeGame expects them
            window.allQuestions = this.challengeQuestions;
            
            // Hide challenge form
            const challengeForm = window.UI?.get('challengeForm');
            if (challengeForm) challengeForm.classList.add('hidden');
            
            // Initialize PlayerManager directly with challenger's name instead of relying on DOM
            if (window.PlayerManager) {
                window.PlayerManager.initializePlayers(1, [playerName]);
                
                // Synka globala variabler för kompatibilitet med game.js
                if (typeof window.players !== 'undefined') {
                    window.players = window.PlayerManager.getPlayers();
                    window.currentPlayer = window.players[0] || null;
                }
            }
            
            // Set questions for game
            window.questionsToPlay = this.challengeQuestions;
            window.currentQuestionIndex = 0;
            
            // Show game screen
            if (window.UI?.showScreen) {
                window.UI.showScreen('gameScreen');
            }
            
            // Setup UI for single player
            const singlePlayerScore = window.UI?.get('singlePlayerScore');
            const singlePlayerProgress = window.UI?.get('singlePlayerProgress');
            const scoreboard = window.UI?.get('scoreboard');
            
            if (singlePlayerScore) singlePlayerScore.classList.remove('hidden');
            if (singlePlayerProgress) singlePlayerProgress.classList.remove('hidden');
            if (scoreboard) scoreboard.classList.add('hidden');
            
            // Load first question
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