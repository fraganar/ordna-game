// Event Handlers Module - Handles all event listener initialization

function initializeAllEventListeners() {
    // Wait for UI to be ready
    if (!window.UI) {
        setTimeout(initializeAllEventListeners, 100);
        return;
    }

    // Main navigation buttons - NEW navigation (BL-027)
    const playNowBtn = UI.get('playNowBtn');
    if (playNowBtn) {
        playNowBtn.addEventListener('click', handleShowChallengeForm);
    }

    const toggleMoreModesBtn = UI.get('toggleMoreModesBtn');
    const moreModesSection = UI.get('moreModesSection');
    if (toggleMoreModesBtn && moreModesSection) {
        toggleMoreModesBtn.addEventListener('click', () => {
            const isHidden = moreModesSection.classList.contains('hidden');

            // Handle animation: remove hidden, let animation play
            if (isHidden) {
                moreModesSection.classList.remove('hidden');
                // Force reflow to trigger animation
                void moreModesSection.offsetWidth;
            } else {
                moreModesSection.classList.add('hidden');
            }

            toggleMoreModesBtn.textContent = isHidden ? '⚡ Färre spellägen ↑' : '⚡ Fler spellägen ↓';
        });
    }

    const startLocalMultiplayerBtn = UI.get('startLocalMultiplayerBtn');
    if (startLocalMultiplayerBtn) {
        startLocalMultiplayerBtn.addEventListener('click', showPlayerSetup);
    }
    
    // Player setup
    const playerCountSelect = UI.get('playerCountSelect');
    if (playerCountSelect) {
        playerCountSelect.addEventListener('change', createPlayerInputs);
    }
    
    const startGameBtn = UI.get('startGameBtn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', initializeGame);
    }
    
    // Game controls
    const restartBtn = UI.get('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    const stopBtn = UI.get('stopBtn');
    if (stopBtn) {
        stopBtn.addEventListener('click', playerStops);
    }
    
    // Decision button handlers
    const stopSide = UI.get('stopSide');
    if (stopSide) {
        stopSide.addEventListener('click', playerStops);
    }
    
    const nextSide = UI.get('nextSide');
    if (nextSide) {
        nextSide.addEventListener('click', () => {
            currentQuestionIndex++;
            window.currentQuestionIndex = currentQuestionIndex; // Sync global variable
            loadQuestion();
        });
    }
    
    const nextQuestionBtn = UI.get('nextQuestionBtn');
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            window.currentQuestionIndex = currentQuestionIndex; // Sync global variable
            loadQuestion();
        });
    }
    
    const largeNextQuestionBtn = UI.get('largeNextQuestionBtn');
    if (largeNextQuestionBtn) {
        largeNextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            window.currentQuestionIndex = currentQuestionIndex; // Sync global variable
            loadQuestion();
        });
    }

    // Pack shop
    const closePackShopBtn = UI.get('closePackShopBtn');
    if (closePackShopBtn) {
        closePackShopBtn.addEventListener('click', closePackShop);
    }
    
    const confirmPacksBtn = UI.get('confirmPacksBtn');
    if (confirmPacksBtn) {
        confirmPacksBtn.addEventListener('click', closePackShop);
    }
    
    // Player name setup
    const savePlayerNameBtn = UI.get('savePlayerNameBtn');
    if (savePlayerNameBtn) {
        savePlayerNameBtn.addEventListener('click', async () => {
            await handleSavePlayerName();
        });
    }

    // Challenge system
    const createChallengeBtn = UI.get('createChallengeBtn');
    if (createChallengeBtn) {
        createChallengeBtn.addEventListener('click', () => {
            if (window.ChallengeSystem) {
                window.ChallengeSystem.createChallenge();
            }
        });
    }
    
    const backToStartBtn = UI.get('backToStartBtn');
    if (backToStartBtn) {
        backToStartBtn.addEventListener('click', handleBackToStart);
    }
    
    const copyLinkBtn = UI.get('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', handleCopyLink);
    }
    
    const shareBtn = UI.get('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShare);
    }
    
    const acceptChallengeBtn = UI.get('acceptChallengeBtn');
    if (acceptChallengeBtn) {
        acceptChallengeBtn.addEventListener('click', handleAcceptChallenge);
    }
    
    const declineChallengeBtn = UI.get('declineChallengeBtn');
    if (declineChallengeBtn) {
        declineChallengeBtn.addEventListener('click', handleDeclineChallenge);
    }

    // Challenge blocked dialog buttons
    const backFromBlockedOwnBtn = document.getElementById('back-from-blocked-own-btn');
    if (backFromBlockedOwnBtn) {
        backFromBlockedOwnBtn.addEventListener('click', handleBackFromBlocked);
    }

    const backFromCompletedBtn = document.getElementById('back-from-completed-btn');
    if (backFromCompletedBtn) {
        backFromCompletedBtn.addEventListener('click', handleBackFromBlocked);
    }
}

// Handler functions that use UI.get() for DOM access
async function handleSavePlayerName() {
    const playerNameInput = UI.get('playerNameInput');
    const playerNameSetup = UI.get('playerNameSetup');
    const challengeForm = UI.get('challengeForm');
    const challengerNameDisplay = UI.get('challengerNameDisplay');
    const startMain = UI.get('startMain');

    const name = playerNameInput?.value.trim();
    if (!name) return;

    if (window.PlayerManager) {
        window.PlayerManager.setPlayerName(name);
    }

    // Sync to Firebase when name changes
    const playerId = window.getCurrentPlayerId();
    if (playerId && window.FirebaseAPI) {
        try {
            await FirebaseAPI.upsertPlayer(playerId, name);
        } catch (error) {
            console.error('Failed to update name in Firebase:', error);
        }
    }

    if (playerNameSetup) playerNameSetup.classList.add('hidden');
    
    // Check if user was trying to create a challenge
    if (pendingChallengeCreation) {
        pendingChallengeCreation = false;
        if (challengeForm) challengeForm.classList.remove('hidden');
        if (challengerNameDisplay) challengerNameDisplay.textContent = name;
        
        const challengeSuccess = UI.get('challengeSuccess');
        const createChallengeBtn = UI.get('createChallengeBtn');
        if (challengeSuccess) challengeSuccess.classList.add('hidden');
        if (createChallengeBtn) createChallengeBtn.classList.remove('hidden');
    }
    // Check if user was trying to accept a challenge
    else if (window.pendingChallengeAccept) {
        window.pendingChallengeAccept = false;
        // Start the challenge with opponent's name now set
        startChallengeGame();
    }
    // Check if there's a pending challenge to accept
    else if (localStorage.getItem('pendingChallenge')) {
        const pendingChallenge = localStorage.getItem('pendingChallenge');
        localStorage.removeItem('pendingChallenge');
        challengeId = pendingChallenge;
        ischallengeMode = true;
        await startChallengeGame();
    }
    // Normal return to start screen
    else {
        if (startMain) startMain.classList.remove('hidden');
        if (challengerNameDisplay) challengerNameDisplay.textContent = name;
    }
}

function handleAcceptChallenge() {
    // Check if opponent has a name set
    const opponentName = window.PlayerManager ? window.PlayerManager.getPlayerName() : null;
    if (!opponentName) {
        // Show name setup for opponent
        const challengeAccept = UI.get('challengeAccept');
        const playerNameSetup = UI.get('playerNameSetup');
        
        if (challengeAccept) challengeAccept.classList.add('hidden');
        if (playerNameSetup) {
            playerNameSetup.classList.remove('hidden');
            // Set flag so we know to start challenge after name input
            window.pendingChallengeAccept = true;
        }
        return;
    }
    
    // Opponent has name, start challenge directly
    startChallengeGame();
}

function handleShowChallengeForm() {
    const playerName = window.PlayerManager ? window.PlayerManager.getPlayerName() : null;
    if (!playerName) {
        // Show name setup first
        pendingChallengeCreation = true;
        const startMain = UI.get('startMain');
        const playerNameSetup = UI.get('playerNameSetup');
        if (startMain) startMain.classList.add('hidden');
        if (playerNameSetup) playerNameSetup.classList.remove('hidden');
        return;
    }
    
    const challengerNameDisplay = UI.get('challengerNameDisplay');
    const startMain = UI.get('startMain');
    const challengeForm = UI.get('challengeForm');
    const challengeSuccess = UI.get('challengeSuccess');
    const createChallengeBtn = UI.get('createChallengeBtn');
    
    if (challengerNameDisplay) challengerNameDisplay.textContent = playerName;
    if (startMain) startMain.classList.add('hidden');
    if (challengeForm) challengeForm.classList.remove('hidden');
    
    // Reset form state
    if (challengeSuccess) challengeSuccess.classList.add('hidden');
    if (createChallengeBtn) createChallengeBtn.classList.remove('hidden');
}

function handleBackToStart() {
    const challengeForm = UI.get('challengeForm');
    const startMain = UI.get('startMain');
    const challengeError = UI.get('challengeError');
    const challengeSuccess = UI.get('challengeSuccess');

    if (challengeForm) challengeForm.classList.add('hidden');
    if (startMain) startMain.classList.remove('hidden');
    if (challengeError) challengeError.classList.add('hidden');
    if (challengeSuccess) challengeSuccess.classList.add('hidden');

    // Invalidate cache to ensure fresh data when showing "Mina utmaningar"
    if (window.ChallengeSystem && typeof window.ChallengeSystem.invalidateCache === 'function') {
        window.ChallengeSystem.invalidateCache();
    }

    // Reload challenges to show updated list
    if (window.ChallengeSystem && typeof window.ChallengeSystem.loadMyChallenges === 'function') {
        window.ChallengeSystem.loadMyChallenges();
    }
}

function handleBackFromBlocked() {
    const challengeBlocked = document.getElementById('challenge-blocked');
    const startMain = document.getElementById('start-main');

    if (challengeBlocked) challengeBlocked.classList.add('hidden');
    if (startMain) startMain.classList.remove('hidden');

    // Clear the challenge parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('challenge');
    window.history.pushState({}, '', url);

    // Invalidate cache to ensure fresh data when showing "Mina utmaningar"
    if (window.ChallengeSystem && typeof window.ChallengeSystem.invalidateCache === 'function') {
        window.ChallengeSystem.invalidateCache();
    }

    // Reload challenges to show updated list
    if (window.ChallengeSystem && typeof window.ChallengeSystem.loadMyChallenges === 'function') {
        window.ChallengeSystem.loadMyChallenges();
    }
}

// Removed handleShareOwnChallenge since we simplified the own challenge dialog

async function handleCopyLink() {
    const challengeLink = UI.get('challengeLink');
    const copyLinkBtn = UI.get('copyLinkBtn');
    
    if (!challengeLink || !copyLinkBtn) return;
    
    try {
        await navigator.clipboard.writeText(challengeLink.value);
        copyLinkBtn.textContent = 'Kopierad!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Kopiera länk';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        challengeLink.select();
        document.execCommand('copy');
        copyLinkBtn.textContent = 'Kopierad!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Kopiera länk';
        }, 2000);
    }
}

async function handleShare() {
    const challengeLink = UI.get('challengeLink');
    if (!challengeLink) return;
    
    const challengeUrl = challengeLink.value;
    const playerName = window.PlayerManager ? window.PlayerManager.getPlayerName() : 'Någon';
    const shareText = `${playerName} utmanar dig i spelet Tres Mangos!`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${playerName} utmanar dig i spelet Tres Mangos!`,
                text: `${shareText} ${challengeUrl}`
            });
        } catch (err) {
            // Silent fail
        }
    } else {
        // Fallback to WhatsApp sharing
        const message = encodeURIComponent(
            `${shareText}\n\n` +
            `Klicka här för att acceptera utmaningen:\n` +
            `${challengeUrl}`
        );
        const whatsappUrl = `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }
}

function handleDeclineChallenge() {
    const challengeAccept = UI.get('challengeAccept');
    const startMain = UI.get('startMain');
    
    if (challengeAccept) challengeAccept.classList.add('hidden');
    if (startMain) startMain.classList.remove('hidden');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllEventListeners);
} else {
    // DOM already loaded
    initializeAllEventListeners();
}