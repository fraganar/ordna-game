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
        
        // BL-015 FIX: Call global challenge state reset
        if (typeof window.resetChallengeState === 'function') {
            window.resetChallengeState();
        }
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
        
        // Load all challenges from localStorage regardless of current player
        // This allows users to see all their challenges even when no active game
        
        // Get all challenges from localStorage
        const allChallenges = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('challenge_')) {
                try {
                    const challenge = JSON.parse(localStorage.getItem(key));
                    allChallenges.push(challenge);
                } catch (e) {
                    // Invalid challenge data, skip
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
        
        // Show the section when there are challenges
        if (myChallengesSection) {
            myChallengesSection.classList.remove('hidden');
        }
        
        // Display challenges
        if (myChallengesList) {
            myChallengesList.innerHTML = '';
            
            // Process each challenge
            for (const challenge of allChallenges.slice(0, 5)) {
                const item = document.createElement('div');
                item.className = 'challenge-list-item bg-slate-50 border border-slate-200 rounded-lg overflow-hidden transition-all duration-300';
                
                // Check if challenge is complete and fetch full data if needed
                let isComplete = false;
                let fullChallengeData = null;
                
                try {
                    isComplete = await this.checkChallengeCompletionStatus(challenge.id);
                    if (isComplete) {
                        fullChallengeData = await FirebaseAPI.getChallenge(challenge.id);
                    }
                } catch (error) {
                    console.log('Could not fetch challenge status:', error);
                }
                
                // Prepare display data
                let statusBadge = '';
                let statusText = '';
                let resultEmoji = '';
                
                if (isComplete && fullChallengeData) {
                    // Determine who is who
                    const isChallenger = challenge.role === 'challenger';
                    const myData = isChallenger ? fullChallengeData.challenger : fullChallengeData.opponent;
                    const opponentData = isChallenger ? fullChallengeData.opponent : fullChallengeData.challenger;
                    
                    if (myData && opponentData) {
                        // Compare scores and set emoji
                        if (myData.totalScore > opponentData.totalScore) {
                            resultEmoji = '🏆';
                        } else if (myData.totalScore < opponentData.totalScore) {
                            resultEmoji = '';
                        } else {
                            resultEmoji = '🤝';
                        }
                        
                        statusText = `Du: ${myData.totalScore}p vs ${opponentData.name}: ${opponentData.totalScore}p ${resultEmoji}`;
                        statusBadge = '<span class="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded">Klar</span>';
                        
                        // Create expandable details
                        const timeAgo = this.getTimeAgo(challenge.createdAt || challenge.completedAt);
                        
                        item.innerHTML = `
                            <div class="challenge-summary p-3 cursor-pointer" data-challenge-id="${challenge.id}">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <p class="font-semibold text-slate-800">
                                            ${challenge.role === 'challenger' ? 'Utmanade' : 'Utmanad av'} ${opponentData.name}
                                        </p>
                                        <p class="text-sm text-slate-600 font-medium mt-1">${statusText}</p>
                                        <p class="text-xs text-slate-500 mt-1">${timeAgo}</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="status-badge">${statusBadge}</div>
                                        <span class="expand-icon text-slate-400 transition-transform duration-300">▼</span>
                                    </div>
                                </div>
                            </div>
                            <div class="challenge-details hidden bg-white border-t border-slate-200">
                                <div class="p-4">
                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p class="text-xs text-slate-500 mb-1">Din poängfördelning:</p>
                                            <p class="text-xs text-slate-700 font-mono">
                                                ${myData.questionScores.map((s, i) => `F${i+1}:${s}p`).join(' ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500 mb-1">${opponentData.name}s poängfördelning:</p>
                                            <p class="text-xs text-slate-700 font-mono">
                                                ${opponentData.questionScores.map((s, i) => `F${i+1}:${s}p`).join(' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="rematch-btn flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded hover:bg-blue-700 transition-colors" data-challenge-id="${challenge.id}">
                                            Revansch!
                                        </button>
                                        <button class="share-result-btn flex-1 bg-slate-200 text-slate-700 text-sm font-medium py-2 px-3 rounded hover:bg-slate-300 transition-colors" data-challenge-id="${challenge.id}">
                                            Dela resultat
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        // Add click handler for expand/collapse
                        const summary = item.querySelector('.challenge-summary');
                        const details = item.querySelector('.challenge-details');
                        const expandIcon = item.querySelector('.expand-icon');
                        
                        summary.addEventListener('click', () => {
                            details.classList.toggle('hidden');
                            expandIcon.style.transform = details.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                            
                            // Save expand state
                            const expandedChallenges = JSON.parse(localStorage.getItem('expandedChallenges') || '[]');
                            if (details.classList.contains('hidden')) {
                                const index = expandedChallenges.indexOf(challenge.id);
                                if (index > -1) expandedChallenges.splice(index, 1);
                            } else {
                                if (!expandedChallenges.includes(challenge.id)) {
                                    expandedChallenges.push(challenge.id);
                                }
                            }
                            localStorage.setItem('expandedChallenges', JSON.stringify(expandedChallenges));
                        });
                        
                        // Check if should be expanded by default
                        const expandedChallenges = JSON.parse(localStorage.getItem('expandedChallenges') || '[]');
                        if (expandedChallenges.includes(challenge.id)) {
                            details.classList.remove('hidden');
                            expandIcon.style.transform = 'rotate(180deg)';
                        }
                        
                        // Add rematch button handler
                        const rematchBtn = item.querySelector('.rematch-btn');
                        if (rematchBtn) {
                            rematchBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (typeof window.restartGame === 'function') {
                                    window.restartGame();
                                }
                                const showChallengeFormBtn = window.UI?.get('showChallengeFormBtn');
                                if (showChallengeFormBtn) {
                                    showChallengeFormBtn.click();
                                }
                            });
                        }
                        
                        // Add share button handler
                        const shareBtn = item.querySelector('.share-result-btn');
                        if (shareBtn) {
                            shareBtn.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                const winner = myData.totalScore > opponentData.totalScore ? 'Jag vann!' : 
                                             myData.totalScore < opponentData.totalScore ? `${opponentData.name} vann!` : 'Oavgjort!';
                                const shareText = `${winner} ${myData.name}: ${myData.totalScore}p vs ${opponentData.name}: ${opponentData.totalScore}p i Ordna!`;
                                
                                if (navigator.share) {
                                    try {
                                        await navigator.share({
                                            title: 'Ordna - Resultat',
                                            text: shareText
                                        });
                                    } catch (err) {
                                        // User cancelled
                                    }
                                } else {
                                    // Fallback - copy to clipboard
                                    try {
                                        await navigator.clipboard.writeText(shareText);
                                        shareBtn.textContent = 'Kopierat!';
                                        setTimeout(() => {
                                            shareBtn.textContent = 'Dela resultat';
                                        }, 2000);
                                    } catch (err) {
                                        console.log('Could not copy to clipboard:', err);
                                    }
                                }
                            });
                        }
                        
                        // Mark as seen
                        if (!challenge.hasSeenResult) {
                            challenge.hasSeenResult = true;
                            localStorage.setItem(`challenge_${challenge.id}`, JSON.stringify(challenge));
                        }
                    }
                } else {
                    // Challenge is not complete or couldn't fetch data
                    if (challenge.role === 'challenger') {
                        statusBadge = challenge.hasSeenResult ? 
                            '<span class="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">Sedd</span>' :
                            '<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Väntar</span>';
                        statusText = `Du: ${challenge.totalScore}p`;
                    } else {
                        statusBadge = '<span class="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded">Spelad</span>';
                        statusText = `Du: ${challenge.totalScore}p`;
                    }
                    
                    const timeAgo = this.getTimeAgo(challenge.createdAt || challenge.completedAt);
                    
                    // Add share functionality for waiting challenges
                    const shareButton = challenge.role === 'challenger' && !isComplete ? 
                        `<button class="share-challenge-btn ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" data-challenge-id="${challenge.id}">Dela</button>` : 
                        '';
                    
                    item.innerHTML = `
                        <div class="p-3 hover:bg-slate-100 transition-colors">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <p class="font-semibold text-slate-800">${challenge.role === 'challenger' ? 'Utmanade' : 'Utmanad av'} någon</p>
                                    <p class="text-sm text-slate-500">${timeAgo} • ${statusText}</p>
                                </div>
                                <div class="flex items-center">
                                    <div class="status-badge">${statusBadge}</div>
                                    ${shareButton}
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Add share button handler
                    const shareBtn = item.querySelector('.share-challenge-btn');
                    if (shareBtn) {
                        shareBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const challengeUrl = window.location.origin + window.location.pathname + '?challenge=' + challenge.id;
                            const shareText = `Jag utmanar dig i spelet Ordna! ${challengeUrl}`;
                            
                            if (navigator.share) {
                                try {
                                    await navigator.share({
                                        title: 'Ordna - Utmaning',
                                        text: shareText
                                    });
                                } catch (err) {
                                    // User cancelled
                                }
                            } else {
                                // Fallback - copy to clipboard
                                try {
                                    await navigator.clipboard.writeText(challengeUrl);
                                    shareBtn.textContent = 'Kopierat!';
                                    setTimeout(() => {
                                        shareBtn.textContent = 'Dela';
                                    }, 2000);
                                } catch (err) {
                                    console.log('Could not copy to clipboard:', err);
                                }
                            }
                        });
                    }
                    
                    // Add click handler for non-complete challenges
                    item.addEventListener('click', async () => {
                        if (challenge.role === 'challenger') {
                            // Check again if complete
                            const isNowComplete = await this.checkChallengeCompletionStatus(challenge.id);
                            if (isNowComplete) {
                                // Reload the list to show updated status
                                this.loadMyChallenges();
                            } else {
                                // Don't show fullscreen waiting view from challenge list
                                // User is already on start screen, just keep them there
                                console.log('Väntande challenge - status visas redan inline i listan');
                            }
                        } else {
                            // For opponent challenges, we don't need to call showChallengeResultView
                            // since all info is already shown inline in the expanded details
                            console.log('Opponent challenge - results shown inline');
                        }
                    });
                }
                
                myChallengesList.appendChild(item);
            }
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
    
    // Show challenge result comparison view (fullscreen mode only)
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
            
            // This function is only used for fullscreen challenge results
            // (not for inline expansion in challenge list)
            const endScreen = window.UI?.get('endScreen');
            if (endScreen) {
                endScreen.innerHTML = resultHTML;
                endScreen.classList.remove('hidden');
            }
            
            // Update localStorage to mark as seen (reuse existing challengeInfo)
            if (challengeInfo) {
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

    // Show waiting for opponent view (moved from uiController.js)
    showWaitingForOpponentView(challengeId) {
        const challengeUrl = window.location.origin + window.location.pathname + 
            '?challenge=' + challengeId;
        
        // Get player score - use PlayerManager if available
        const playerScore = window.PlayerManager ? 
            window.PlayerManager.getPlayers()[0]?.score : 0;
        const playerName = window.PlayerManager ? 
            window.PlayerManager.getPlayerName() : 'Spelare';
        
        // ✅ PROPER FIX: Use standard endScreen structure, just modify content
        UI?.showEndScreen();
        
        const endScreen = UI?.get('endScreen');
        if (endScreen) {
            // Use standard endScreen but adapt title and show single-player result
            const title = endScreen.querySelector('h2');
            const subtitle = endScreen.querySelector('#end-screen-subtitle');
            const singlePlayerFinal = endScreen.querySelector('#single-player-final');
            const finalScore = endScreen.querySelector('#single-final-score');
            const finalScoreboard = endScreen.querySelector('#final-scoreboard');
            
            if (title) title.textContent = 'Utmaning skapad!';
            if (subtitle) subtitle.textContent = 'Din utmaning är redo att delas!';
            
            // Show single player result instead of multiplayer scoreboard
            if (singlePlayerFinal && finalScore) {
                singlePlayerFinal.classList.remove('hidden');
                finalScore.textContent = playerScore;
            }
            if (finalScoreboard) finalScoreboard.classList.add('hidden');
            
            // Add challenge-specific sharing buttons after standard restart button
            const restartBtn = endScreen.querySelector('#restart-btn');
            if (restartBtn) {
                restartBtn.textContent = 'Tillbaka till start';
                restartBtn.id = 'back-to-start-created'; // Keep same ID for existing listeners
                
                // Add sharing elements before restart button
                const shareContainer = document.createElement('div');
                shareContainer.className = 'mb-6';
                shareContainer.innerHTML = `
                    <p class="text-sm text-slate-600 mb-3">Dela denna länk med din vän:</p>
                    <div class="bg-white border border-slate-300 rounded p-2 mb-3">
                        <input type="text" id="challenge-link-created" value="${challengeUrl}" readonly 
                               class="w-full text-xs text-gray-600 bg-transparent border-none outline-none">
                    </div>
                    <div class="flex space-x-2 mb-4">
                        <button id="copy-link-created" class="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">Kopiera länk</button>
                        <button id="share-created" class="flex-1 bg-slate-600 text-white py-2 px-3 rounded text-sm hover:bg-slate-700">Dela</button>
                    </div>
                `;
                
                restartBtn.parentNode?.insertBefore(shareContainer, restartBtn);
            }
        }
        
        // Add simplified event listeners - NO POLLING FUNCTIONALITY
        this.setupChallengeCreatedListeners(challengeId, challengeUrl, playerName);
    }
    
    // Setup simplified event listeners for challenge created view - NO POLLING
    setupChallengeCreatedListeners(challengeId, challengeUrl, playerName) {
        const copyBtn = document.getElementById('copy-link-created');
        const shareBtn = document.getElementById('share-created');
        const newChallengeBtn = document.getElementById('new-challenge-btn');
        const backBtn = document.getElementById('back-to-start-created');
        
        // Copy link functionality
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const input = document.getElementById('challenge-link-created');
                try {
                    await navigator.clipboard.writeText(input.value);
                    copyBtn.textContent = 'Kopierad!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Kopiera länk';
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    input.select();
                    document.execCommand('copy');
                    copyBtn.textContent = 'Kopierad!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Kopiera länk';
                    }, 2000);
                }
            });
        }
        
        // Share functionality
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const shareText = `${playerName} utmanar dig i spelet Ordna!`;
                
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'Ordna - Utmaning',
                            text: `${shareText} ${challengeUrl}`
                        });
                    } catch (err) {
                        // User cancelled or error - fallback to copy
                        try {
                            await navigator.clipboard.writeText(challengeUrl);
                            shareBtn.textContent = 'Länk kopierad!';
                            setTimeout(() => {
                                shareBtn.textContent = 'Dela';
                            }, 2000);
                        } catch (copyErr) {
                            console.log('Could not share or copy:', copyErr);
                        }
                    }
                } else {
                    // Desktop fallback - copy link to clipboard
                    try {
                        await navigator.clipboard.writeText(challengeUrl);
                        shareBtn.textContent = 'Länk kopierad!';
                        setTimeout(() => {
                            shareBtn.textContent = 'Dela';
                        }, 2000);
                    } catch (err) {
                        console.log('Could not copy to clipboard:', err);
                    }
                }
            });
        }
        
        // New challenge functionality
        if (newChallengeBtn) {
            newChallengeBtn.addEventListener('click', () => {
                // Start a new challenge - go back to start and show challenge form
                if (typeof window.restartGame === 'function') {
                    window.restartGame();
                }
                const showChallengeFormBtn = window.UI?.get('showChallengeFormBtn');
                if (showChallengeFormBtn) {
                    showChallengeFormBtn.click();
                }
            });
        }
        
        // Back to start functionality  
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // NO POLLING TO STOP - simplified approach
                
                // Go back to start - use UI or fallback
                if (window.UI && typeof window.UI.showStartScreen === 'function') {
                    window.UI.showStartScreen();
                } else if (typeof window.showStartScreen === 'function') {
                    window.showStartScreen();
                }
                
                // Reset challenge state
                this.reset();
                
                // Reload challenges if function exists
                this.loadMyChallenges();
            });
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