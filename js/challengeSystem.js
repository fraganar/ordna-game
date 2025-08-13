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
        if (!this.isChallengeMode || !this.challengeId || !this.challengeData) return;
        
        const hintElement = document.getElementById('challenger-hint');
        if (!hintElement) return;
        
        // Safety checks
        if (!this.challengeData.challenger || !this.challengeData.challenger.questionScores) {
            hintElement.classList.add('hidden');
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