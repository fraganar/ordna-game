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
        this.isCreatingChallenge = false; // Prevent duplicate challenge creation
        this.isShowingWaitingView = false; // Flag to prevent showing old results when waiting

        // Cache for Firebase challenges
        this.challengeCache = null;
        this.challengeCacheTime = null;
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
    }
    
    // Reset challenge state
    reset() {
        this.isChallengeMode = false;
        this.challengeId = null;
        this.challengeData = null;
        this.challengeQuestions = [];
        this.challengeQuestionScores = [];
        this.isShowingWaitingView = false;
        this.pendingChallengeCreation = false;
        this.isCreatingChallenge = false; // Reset flag
        this.stopPolling();
        this.stopChallengePolling();

        // Reset global challenge state variables
        window.challengeId = null;
        window.ischallengeMode = false;
        window.isChallenger = false;
        window.challengeQuestions = [];
        window.challengeQuestionScores = [];

        // BL-015 FIX: Call global challenge state reset if available
        if (typeof window.resetChallengeState === 'function') {
            window.resetChallengeState();
        }
    }

    // Helper: Get pack display name from pack ID
    async getPackName(packId) {
        if (!packId || !window.GameData) return null;

        try {
            const packs = await window.GameData.loadAvailablePacks();
            const pack = packs.find(p => p.id === packId);
            return pack ? pack.name : null;
        } catch (error) {
            console.error('Failed to get pack name:', error);
            return null;
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

            // No longer saving to localStorage - Firebase is our single source of truth
            // Challenge is already saved in Firebase via FirebaseAPI.createChallenge

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

        // Prevent duplicate challenge creation
        if (this.isCreatingChallenge) {
            return;
        }
        this.isCreatingChallenge = true;

        try {
            // Get final score from PlayerManager
            const finalPlayer = window.PlayerManager.getCurrentPlayer();
            const finalScore = finalPlayer ? finalPlayer.score : 0;

            // Create the challenge in Firebase with the results
            // CRITICAL FIX: Use localStorage for player name, not PlayerManager (which can have wrong state)
            const playerName = localStorage.getItem('playerName') || 'Spelare';
            // Use the real playerId from localStorage, not the temporary one from the game
            const playerId = window.getCurrentPlayerId();

            if (!playerId) {
                console.error('No playerId found - cannot create challenge');
                throw new Error('Player ID krävs för att skapa utmaning. Ladda om sidan och försök igen.');
            }

            // Use the actual question scores as they were earned (don't pad with zeros)
            const completeScores = [...window.challengeQuestionScores];

            // Get pack name for display (if specific pack selected)
            const packName = window.GameController.selectedPack ? await this.getPackName(window.GameController.selectedPack) : null;

            const newChallengeId = await FirebaseAPI.createChallenge(
                playerName,
                playerId,
                window.challengeQuestions,
                finalScore,
                completeScores,
                packName,                              // Display name (e.g. "Frågepaket 1")
                window.GameController.selectedPack    // Pack ID (e.g. "fragepaket-1.json")
            );

            window.challengeId = newChallengeId;

            // Track played pack for challenger
            const packId = window.GameController.selectedPack;
            if (playerId && packId && window.FirebaseAPI) {
                try {
                    await window.FirebaseAPI.updatePlayedPack(playerId, packId, finalScore);
                } catch (error) {
                    console.error('Failed to track played pack:', error);
                    // Non-blocking error - game continues normally
                }
            } else if (!packId) {
                console.log('Blandat läge - trackar inte played pack');
            }
            
            // No longer save to localStorage - Firebase is our source of truth

            // Invalidate cache since we created a new challenge
            this.invalidateCache();

            // Show waiting for opponent view
            this.isShowingWaitingView = true; // Set flag to prevent showing old results
            this.showWaitingForOpponentView(newChallengeId);

            // Skip loading challenges while showing waiting view to avoid conflicts
            // The challenges will be loaded when user returns to start screen

            return newChallengeId;
        } catch (error) {
            console.error('🔥 CHALLENGER MODE ERROR:', error);
            window.UI?.showError('Kunde inte skapa utmaning. Kontrollera din internetanslutning.');
            this.isCreatingChallenge = false; // Reset flag on error
            throw error;
        } finally {
            this.isCreatingChallenge = false; // Always reset flag
        }
        } else {
            // Handle OPPONENT mode (accepting existing challenge)
            return false; // Let game.js handle opponent completion
        }
    }
    
    // Accept a challenge - full opponent completion flow
    async acceptChallenge(challengeId, playerId, playerName, scores, totalScore, isAnonymous = false) {
        try {
            // Check if challenge has already been completed (duplicate protection)
            const challenge = await FirebaseAPI.getChallenge(challengeId);
            if (challenge.status === 'completed') {
                console.warn('Challenge already completed - cannot accept again');
                throw new Error('Denna utmaning har redan slutförts av någon annan.');
            }

            // Complete the challenge in Firebase (ALWAYS - even for anonymous)
            await FirebaseAPI.completeChallenge(
                challengeId,
                playerId,
                playerName,
                totalScore,
                scores
            );

            // Track played pack for opponent (only for authenticated users)
            if (!isAnonymous) {
                try {
                    const challengeData = await FirebaseAPI.getChallenge(challengeId);
                    const packId = challengeData.packId;

                    if (!packId) {
                        console.error('Challenge missing packId - cannot track played pack');
                    } else if (playerId && window.FirebaseAPI) {
                        await window.FirebaseAPI.updatePlayedPack(playerId, packId, totalScore);
                    }
                } catch (error) {
                    console.error('Failed to track played pack for opponent:', error);
                    // Non-blocking error - game continues normally
                }
            }

            // Show result comparison view (with login prompt if anonymous)
            await this.showChallengeResultView(challengeId, isAnonymous);

            return true;
        } catch (error) {
            console.error('Failed to accept challenge:', error);

            // Provide specific error message based on error type
            if (error.message && error.message.includes('redan slutförts')) {
                window.UI?.showError('Denna utmaning har redan slutförts av någon annan.');
            } else if (error.code === 'permission-denied') {
                window.UI?.showError('Du har inte behörighet att acceptera denna utmaning.');
            } else {
                window.UI?.showError('Kunde inte acceptera utmaning. Kontrollera din internetanslutning.');
            }
            throw error;
        }
    }

    // Handle login from anonymous opponent result view
    async handleOpponentResultLogin(challengeId) {
        console.log('🔐 Anonymous opponent wants to login and save result');

        if (!window.showAuthForSharing) {
            alert('Auth system not available');
            return;
        }

        window.showAuthForSharing(async (playerId, playerName) => {
            console.log('✅ Opponent authenticated, now linking result to account');

            try {
                // Update opponent playerId in Firebase (result already saved)
                await FirebaseAPI.updateChallenge(challengeId, {
                    'opponent.playerId': playerId,
                    'opponent.name': playerName
                });

                // Track played pack for this user
                try {
                    const challengeData = await FirebaseAPI.getChallenge(challengeId);
                    const packId = challengeData.packId;
                    const playerScore = challengeData.opponent?.totalScore || 0;

                    if (packId && window.FirebaseAPI) {
                        await window.FirebaseAPI.updatePlayedPack(playerId, packId, playerScore);
                    }
                } catch (error) {
                    console.error('Failed to track played pack after login:', error);
                    // Non-blocking error
                }

                // Show success message and refresh view
                if (window.showToast) {
                    window.showToast('✅ Resultat kopplat till ditt konto!', 'success', 5000);
                }

                // Refresh result view (now shows as authenticated user)
                await this.showChallengeResultView(challengeId, false);

            } catch (error) {
                console.error('Failed to link opponent result to account:', error);

                // Provide specific error message
                let errorMsg = '❌ Kunde inte koppla resultat till konto.';
                if (error.code === 'permission-denied') {
                    errorMsg += '\n\nDu saknar behörighet att uppdatera denna utmaning.';
                } else if (error.message && error.message.includes('not found')) {
                    errorMsg += '\n\nUtmaningen kunde inte hittas.';
                } else {
                    errorMsg += '\n\nFörsök igen eller kontrollera din internetanslutning.';
                }
                alert(errorMsg);
            }
        });
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
            
            if (challenge && challenge.status === 'completed') {
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
    
    // Get my challenges from Firebase with caching
    async getMyChallenges() {
        const playerId = window.getCurrentPlayerId();
        if (!playerId) {
            return [];
        }

        try {
            // Check if cache is still valid
            if (this.challengeCache &&
                this.challengeCacheTime &&
                Date.now() - this.challengeCacheTime < this.CACHE_TTL) {
                return this.challengeCache;
            }

            // Fetch from Firebase
            const challenges = await FirebaseAPI.getUserChallenges(playerId);

            // Update cache
            this.challengeCache = challenges;
            this.challengeCacheTime = Date.now();

            return challenges || [];
        } catch (error) {
            console.error('Failed to get challenges from Firebase:', error);
            // Return cached data if available, otherwise empty array
            return this.challengeCache || [];
        }
    }

    // Invalidate cache when challenges change
    invalidateCache() {
        this.challengeCache = null;
        this.challengeCacheTime = null;
    }

    // updateChallengeStatus removed - no longer needed with Firebase as single source
    
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
            `${playerName} utmanar dig i spelet Tres Mangos!\n\n` +
            `Klicka här för att acceptera utmaningen:\n` +
            `${link}`
        );
        const whatsappUrl = `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }
    
    // Share via Web Share API
    async shareViaWebShare(challengeId, playerName) {
        const link = this.generateShareLink(challengeId);
        const shareText = `${playerName} utmanar dig i spelet Tres Mangos!`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareText,
                    text: `${shareText} ${link}`
                });
                return true;
            } catch (err) {
                return false;
            }
        } else {
            // Fallback to WhatsApp
            this.shareViaWhatsApp(challengeId, playerName);
            return true;
        }
    }

    // Load and display my challenges from Firebase
    async loadMyChallenges() {
        const myChallengesSection = document.getElementById('my-challenges-section');
        const myChallengesList = document.getElementById('my-challenges-list');

        // Get playerId from localStorage
        const myPlayerId = window.getCurrentPlayerId();

        if (!myPlayerId) {
            // No playerId = no challenges to show
            if (myChallengesSection) myChallengesSection.classList.add('hidden');
            return;
        }

        try {
            // Fetch challenges from Firebase
            const allChallenges = await FirebaseAPI.getUserChallenges(myPlayerId);

            if (allChallenges.length === 0) {
                if (myChallengesSection) myChallengesSection.classList.add('hidden');
                return;
            }

            // Show the section
            if (myChallengesSection) {
                myChallengesSection.classList.remove('hidden');
            }

            // Display challenges
            if (myChallengesList) {
                myChallengesList.innerHTML = '';

                // Show max 5 most recent
                for (const challenge of allChallenges.slice(0, 5)) {
                    const item = document.createElement('div');
                    item.className = 'challenge-list-item bg-slate-50 border border-slate-200 rounded-lg overflow-hidden transition-all duration-300';

                    const isComplete = challenge.status === 'completed';
                    // Use playerId to determine role instead of relying on Firebase role field
                    const isChallenger = challenge.challenger?.playerId === myPlayerId;

                    if (isComplete) {
                        // Challenge is complete - show result
                        const myData = isChallenger ? challenge.challenger : challenge.opponent;
                        const opponentData = isChallenger ? challenge.opponent : challenge.challenger;

                        const myScore = myData.totalScore;
                        const oppScore = opponentData.totalScore;

                        // Determine result
                        const iWon = myScore > oppScore;
                        const isDraw = myScore === oppScore;
                        const iLost = myScore < oppScore;

                        // Result styling and text
                        let resultText, resultIcon, bgColor, borderColor;
                        if (iWon) {
                            resultText = 'Du vann!';
                            resultIcon = '🏆';
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                        } else if (isDraw) {
                            resultText = 'Oavgjort!';
                            resultIcon = '🤝';
                            bgColor = 'bg-blue-50';
                            borderColor = 'border-blue-200';
                        } else {
                            resultText = `${opponentData.name} vann`;
                            resultIcon = '😔';
                            bgColor = 'bg-slate-50';
                            borderColor = 'border-slate-200';
                        }

                        // Get creation date
                        const createdDate = challenge.created?.toDate ? challenge.created.toDate() : challenge.created;

                        item.innerHTML = `
                            <div class="p-3 cursor-pointer ${bgColor}" data-challenge-id="${challenge.id}">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <div class="text-base font-bold mb-1">
                                            ${resultIcon} ${resultText}
                                        </div>
                                        <p class="text-sm text-slate-600">
                                            ${myScore}-${oppScore} poäng mot ${opponentData.name}
                                        </p>
                                        <p class="text-xs text-slate-500 mt-1">${this.getTimeAgo(createdDate)}</p>
                                    </div>
                                    <div class="flex flex-col items-end gap-1">
                                        <span class="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded">Klar</span>
                                        <span class="text-xs text-blue-600">↓ Visa detaljer</span>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Update item border color
                        item.className = `challenge-list-item ${bgColor} border ${borderColor} rounded-lg overflow-hidden transition-all duration-300`;

                        // Click handler for expanding details inline
                        if (!this.isShowingWaitingView) {
                            item.style.cursor = 'pointer';
                            item.addEventListener('click', () => {
                                // Toggle expanded view inline instead of showing full result dialog
                                const existingDetails = item.querySelector('.challenge-details');

                                if (existingDetails) {
                                    // Collapse if already expanded
                                    existingDetails.remove();
                                    item.style.maxHeight = '';
                                } else {
                                    // Expand to show compact details
                                    const detailsDiv = document.createElement('div');
                                    detailsDiv.className = 'challenge-details border-t border-slate-200 mt-3 pt-3';

                                    // Create compact score visualization
                                    const myScores = myData.questionScores || [];
                                    const oppScores = opponentData.questionScores || [];

                                    // Build compact horizontal visualization
                                    let scoreDetails = '<div class="text-xs mb-2 font-semibold text-slate-700">Poäng per fråga:</div>';
                                    scoreDetails += '<div class="grid grid-cols-12 gap-1 mb-2">';

                                    for (let i = 0; i < Math.max(myScores.length, oppScores.length); i++) {
                                        const myRoundScore = myScores[i] || 0;
                                        const oppRoundScore = oppScores[i] || 0;

                                        // Color code: green if I won, red if I lost, gray if tied
                                        let cellColor = 'bg-slate-100';
                                        if (myRoundScore > oppRoundScore) {
                                            cellColor = 'bg-green-200';
                                        } else if (myRoundScore < oppRoundScore) {
                                            cellColor = 'bg-red-200';
                                        }

                                        scoreDetails += `
                                            <div class="${cellColor} rounded p-1 text-center text-xs" title="Fråga ${i+1}: Du ${myRoundScore}p vs ${opponentData.name} ${oppRoundScore}p">
                                                <div class="font-bold text-slate-800">${myRoundScore}</div>
                                                <div class="text-slate-600">${oppRoundScore}</div>
                                            </div>
                                        `;
                                    }
                                    scoreDetails += '</div>';

                                    // Add summary stats
                                    const myBestScore = Math.max(...myScores);
                                    const oppBestScore = Math.max(...oppScores);
                                    const myBestQuestions = myScores.map((s, i) => s === myBestScore ? i+1 : null).filter(x => x !== null);
                                    const oppBestQuestions = oppScores.map((s, i) => s === oppBestScore ? i+1 : null).filter(x => x !== null);

                                    scoreDetails += `
                                        <div class="text-xs text-slate-600 mt-2 space-y-1">
                                            <div>Din bästa: Fråga ${myBestQuestions.join(', ')} (${myBestScore}p)</div>
                                            <div>${opponentData.name}s bästa: Fråga ${oppBestQuestions.join(', ')} (${oppBestScore}p)</div>
                                        </div>
                                    `;

                                    detailsDiv.innerHTML = scoreDetails;
                                    item.querySelector('.p-3').appendChild(detailsDiv);

                                    // Smooth expand animation
                                    item.style.transition = 'max-height 0.3s ease';
                                    item.style.maxHeight = item.scrollHeight + 'px';
                                }
                            });
                        }

                    } else {
                        // Waiting for opponent
                        const createdDate = challenge.created?.toDate ? challenge.created.toDate() : challenge.created;

                        item.innerHTML = `
                            <div class="p-3">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <p class="font-semibold text-slate-800">Väntar på motståndare</p>
                                        <p class="text-sm text-slate-500">${this.getTimeAgo(createdDate)}</p>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Väntar</span>
                                        <button class="share-challenge-btn ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                data-challenge-id="${challenge.id}">
                                            Dela
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Share button handler
                        const shareBtn = item.querySelector('.share-challenge-btn');
                        if (shareBtn) {
                            shareBtn.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                const url = `${window.location.origin}${window.location.pathname}?challenge=${challenge.id}`;

                                if (navigator.share) {
                                    try {
                                        await navigator.share({
                                            title: 'Tres Mangos Challenge',
                                            text: 'Jag utmanar dig!',
                                            url: url
                                        });
                                    } catch (err) {
                                        // User cancelled
                                    }
                                } else {
                                    // Fallback: copy to clipboard
                                    try {
                                        await navigator.clipboard.writeText(url);
                                        shareBtn.textContent = 'Kopierad!';
                                        setTimeout(() => {
                                            shareBtn.textContent = 'Dela';
                                        }, 2000);
                                    } catch (err) {
                                        // Silent fail
                                    }
                                }
                            });
                        }
                    }

                    myChallengesList.appendChild(item);
                }
            }

        } catch (error) {
            console.error('Failed to load challenges from Firebase:', error);
            // Hide section on error
            if (myChallengesSection) myChallengesSection.classList.add('hidden');
            window.UI?.showMessage('Kunde inte hämta utmaningar. Kontrollera din internetanslutning.');
        }
    }
    
    // Helper function to check if challenge is complete
    async checkChallengeCompletionStatus(challengeId) {
        try {
            const challenge = await FirebaseAPI.getChallenge(challengeId);
            return challenge && challenge.status === 'completed';
        } catch (error) {
            return false;
        }
    }
    
    // Helper function to get time ago text
    getTimeAgo(dateInput) {
        const now = new Date();
        // Handle both Date objects and date strings
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
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
    async showChallengeResultView(challengeId, isAnonymousOpponent = false) {
        try {
            // Get challenge data from Firebase
            const challenge = await FirebaseAPI.getChallenge(challengeId);

            if (!challenge) {
                throw new Error('Challenge not found');
            }

            // Use playerId-based identification (most reliable method)
            const myPlayerId = window.getCurrentPlayerId();
            const isChallenger = challenge.challenger?.playerId === myPlayerId;

            const myData = isChallenger ? challenge.challenger : challenge.opponent;
            const opponentData = isChallenger ? challenge.opponent : challenge.challenger;

            // Determine winner message
            let winnerText;
            if (myData.totalScore > opponentData.totalScore) {
                winnerText = '<p class="text-xl font-bold text-green-600">🎉 Du vann!</p>';
            } else if (myData.totalScore < opponentData.totalScore) {
                winnerText = '<p class="text-xl font-bold text-red-600">Du förlorade!</p>';
            } else {
                winnerText = '<p class="text-xl font-bold text-blue-600">Oavgjort!</p>';
            }

            // Show login buttons if opponent is anonymous
            const buttonsHTML = isAnonymousOpponent ? `
                <div class="space-y-3">
                    <button id="opponent-result-login-btn" class="w-full bg-gradient-to-r from-magic to-primary text-white font-bold py-4 px-6 rounded-lg text-lg hover:from-primary hover:to-magic-dark transition-colors shadow-md">
                        🔐 Logga in och spara resultat
                    </button>

                    <button id="opponent-result-back-btn" class="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-300 transition-colors">
                        Tillbaka till start
                    </button>
                </div>

                <p class="text-xs text-slate-500 mt-4">
                    ⚠️ Logga in nu för att spara ditt resultat - annars går det förlorat
                </p>
            ` : `
                <button id="back-to-start-result" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors">
                    Tillbaka till start
                </button>
            `;

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
                        ${winnerText}
                    </div>

                    ${buttonsHTML}
                </div>
            `;

            // This function is only used for fullscreen challenge results
            // (not for inline expansion in challenge list)
            const endScreen = window.UI?.get('endScreen');
            if (endScreen) {
                endScreen.innerHTML = resultHTML;
                endScreen.classList.remove('hidden');
            }

            // Add event listeners
            if (isAnonymousOpponent) {
                // Anonymous opponent - show login option
                const loginBtn = document.getElementById('opponent-result-login-btn');
                const backBtn = document.getElementById('opponent-result-back-btn');

                if (loginBtn) {
                    loginBtn.addEventListener('click', () => this.handleOpponentResultLogin(challengeId));
                }

                if (backBtn) {
                    backBtn.addEventListener('click', async () => {
                        // Show custom dialog instead of confirm()
                        const dialog = document.getElementById('challenge-result-back-dialog');
                        const confirmBtn = document.getElementById('challenge-result-back-confirm-btn');
                        const cancelBtn = document.getElementById('challenge-result-back-cancel-btn');

                        if (!dialog) {
                            console.error('Challenge result back dialog not found');
                            return;
                        }

                        // Show dialog
                        dialog.classList.remove('hidden');

                        // One-time listeners for this dialog instance
                        const handleConfirm = async () => {
                            dialog.classList.add('hidden');
                            await window.NavigationManager.resetToStartScreen();
                            this.reset();
                            cleanup();
                        };

                        const handleCancel = () => {
                            dialog.classList.add('hidden');
                            cleanup();
                        };

                        const cleanup = () => {
                            confirmBtn.removeEventListener('click', handleConfirm);
                            cancelBtn.removeEventListener('click', handleCancel);
                        };

                        confirmBtn.addEventListener('click', handleConfirm);
                        cancelBtn.addEventListener('click', handleCancel);
                    });
                }
            } else {
                // Authenticated user - just show back button
                const backToStartBtn = document.getElementById('back-to-start-result');
                if (backToStartBtn) {
                    backToStartBtn.addEventListener('click', async () => {
                        await window.NavigationManager.resetToStartScreen();
                    });
                }
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
        // REMOVED: Authentication check - users can now play anonymously
        // Authentication will be required when SHARING the challenge after completing it

        // Use dummy name for now - real name will be set during sharing flow if user logs in
        const playerName = localStorage.getItem('playerName') || 'Spelare';

        // Debug logging for hybrid-system analysis
        console.log('🎮 createChallenge starting with name sources:', {
            localStorageName: playerName,
            playerManagerName: window.PlayerManager?.getPlayerName?.(),
            playerId: window.getCurrentPlayerId(),
            isAnonymous: window.isAnonymousUser ? window.isAnonymousUser() : 'unknown',
            timestamp: new Date().toISOString()
        });

        // CRITICAL: Clear ALL previous challenge state completely
        this.reset(); // Use the centralized reset to ensure everything is cleared

        // Extra insurance - explicitly clear these critical values
        window.challengeId = null;  // This MUST be null for new challenges
        window.isChallenger = false;  // Will be set to true later when game starts
        window.challengeQuestions = [];
        window.challengeQuestionScores = [];
        this.challengeData = null;
        this.challengeQuestions = [];
        this.challengeId = null;
        this.isChallengeMode = false;  // Reset first

        // Clear any existing challenge from URL
        const url = new URL(window.location);
        url.searchParams.delete('challenge');
        window.history.replaceState({}, '', url);

        if (!playerName) {
            console.error('Player not set up');
            return;
        }
        
        try {
            // Set selected pack from challenge selector before loading questions
            window.GameController.selectedPack = window.GameData?.getSelectedPack('challenge-pack-select') || null;

            // Load questions using GameData (working implementation moved there)
            if (window.GameData && window.GameData.loadQuestionsForGame) {
                try {
                    await window.GameData.loadQuestionsForGame(window.GameController.selectedPack);

                    // Note: Pack tracking is handled later via FirebaseAPI.updatePlayedPack()
                    // See createChallengeAfterGame() for challenger and acceptChallenge() for opponent
                } catch (loadError) {
                    // Show user-friendly error message
                    alert(`❌ Kunde inte ladda frågepaket\n\n${loadError.message}\n\nVänligen välj ett annat frågepaket.`);
                    console.error('Failed to load question pack:', loadError);
                    return; // Stop challenge creation
                }
            } else {
                console.error('GameData.loadQuestionsForGame not available');
                alert('❌ Systemfel: GameData är inte tillgängligt. Ladda om sidan.');
                return;
            }

            if (!window.allQuestions || window.allQuestions.length === 0) {
                alert('❌ Inga frågor kunde laddas. Vänligen välj ett annat frågepaket.');
                return;
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
            window.isChallenger = true; // Creating a new challenge
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

            // Reset question index properly before starting
            window.currentQuestionIndex = 0;
            if (typeof currentQuestionIndex !== 'undefined') {
                currentQuestionIndex = 0;
            }

            // Start the game after a brief delay to ensure everything is initialized
            setTimeout(() => {
                if (typeof window.loadQuestion === 'function') {
                    window.loadQuestion();
                }
            }, 100);
            
        } catch (error) {
            console.error('Failed to create challenge:', error);
            if (typeof window.showError === 'function') {
                window.showError('Kunde inte skapa utmaning. Försök igen.');
            }
        }
    }

    // Save a completed challenge after user authentication (NEW)
    // Called after user finishes game anonymously and decides to share
    async saveCompletedChallenge(playerId, playerName) {
        try {
            if (!this.isChallengeMode || !window.challengeQuestions || !window.challengeQuestionScores) {
                throw new Error('No challenge data to save');
            }

            // Get final score
            const finalScore = window.PlayerManager?.getCurrentPlayer()?.score || 0;
            const completeScores = [...window.challengeQuestionScores];

            // Get pack info
            const packId = window.GameController?.selectedPack || null;
            let packName = null;
            if (packId && window.GameData) {
                packName = await this.getPackName(packId);
            }

            console.log('💾 Saving completed challenge:', {
                playerId,
                playerName,
                finalScore,
                questions: window.challengeQuestions.length,
                packId,
                packName
            });

            // Create challenge in Firebase
            const challengeId = await FirebaseAPI.createChallenge(
                playerName,
                playerId,
                window.challengeQuestions,
                finalScore,
                completeScores,
                packName,
                packId
            );

            // Track played pack for challenger (NEW - same as acceptChallenge does for opponent)
            if (packId && playerId && window.FirebaseAPI) {
                try {
                    await window.FirebaseAPI.updatePlayedPack(playerId, packId, finalScore);
                    console.log('✅ Played pack tracked for challenger:', packId);
                } catch (error) {
                    console.error('Failed to track played pack for challenger:', error);
                    // Non-blocking error - challenge creation continues
                }
            } else if (!packId) {
                console.log('Blandat läge - trackar inte played pack');
            }

            this.challengeId = challengeId;
            console.log('✅ Challenge saved:', challengeId);

            return challengeId;

        } catch (error) {
            console.error('Failed to save completed challenge:', error);
            throw error;
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
            // Clear any existing share container first
            const existingShare = endScreen.querySelector('.challenge-share-container');
            if (existingShare) {
                existingShare.remove();
            }
            // Use standard endScreen but adapt title and show single-player result
            const title = endScreen.querySelector('h2');
            const subtitle = endScreen.querySelector('#end-screen-subtitle');
            const singlePlayerFinal = endScreen.querySelector('#single-player-final');
            const finalScore = endScreen.querySelector('#single-final-score');
            const finalScoreboard = endScreen.querySelector('#final-scoreboard');

            if (title) {
                title.textContent = 'Bra kämpat!';
                title.dataset.challengeModified = 'true';  // Mark for cleanup
            }
            if (subtitle) {
                subtitle.textContent = '';
                subtitle.dataset.challengeModified = 'true';
            }

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
                restartBtn.dataset.challengeModified = 'true';

                // Add sharing elements before restart button
                const shareContainer = document.createElement('div');
                shareContainer.className = 'mb-6 challenge-share-container';
                shareContainer.innerHTML = `
                    <div class="border-t border-slate-200 pt-6 mb-4">
                        <h3 class="text-xl font-bold text-slate-800 mb-2">🏆 Utmana någon!</h3>
                        <p class="text-slate-600 mb-3">Vågar någon slå ditt resultat? Dela länken:</p>
                    </div>
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

    // Clean up challenge-specific UI modifications from endScreen
    cleanupWaitingView() {
        const endScreen = UI?.get('endScreen');
        if (!endScreen) return;

        // Remove challenge-specific share container
        const shareContainer = endScreen.querySelector('.challenge-share-container');
        if (shareContainer) {
            shareContainer.remove();
        }

        // Reset modified text content to defaults
        const title = endScreen.querySelector('h2');
        if (title && title.dataset.challengeModified) {
            title.textContent = 'Spelet är slut!';
            delete title.dataset.challengeModified;
        }

        const subtitle = endScreen.querySelector('#end-screen-subtitle');
        if (subtitle && subtitle.dataset.challengeModified) {
            subtitle.textContent = 'Bra kämpat allihopa!';
            delete subtitle.dataset.challengeModified;
        }

        const restartBtn = endScreen.querySelector('#restart-btn');
        if (restartBtn && restartBtn.dataset.challengeModified) {
            restartBtn.textContent = 'Spela igen';
            delete restartBtn.dataset.challengeModified;
        }
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
                const shareText = `${playerName} utmanar dig i spelet Tres Mangos!`;
                
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
                            // Silent fail
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
                        // Silent fail
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