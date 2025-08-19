// Event Handlers Module - Handles all event listener initialization

function initializeAllEventListeners() {
    // Wait for UI to be ready
    if (!window.UI) {
        console.log('Waiting for UI to be ready...');
        setTimeout(initializeAllEventListeners, 100);
        return;
    }
    
    console.log('Initializing event listeners...');
    
    // Main navigation buttons
    const showPlayerSetupBtn = UI.get('showPlayerSetupBtn');
    if (showPlayerSetupBtn) {
        showPlayerSetupBtn.addEventListener('click', showPlayerSetup);
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
    const openPackShopBtn = UI.get('openPackShopBtn');
    if (openPackShopBtn) {
        openPackShopBtn.addEventListener('click', openPackShop);
    }
    
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
        savePlayerNameBtn.addEventListener('click', handleSavePlayerName);
    }
    
    // Challenge system
    const showChallengeFormBtn = UI.get('showChallengeFormBtn');
    if (showChallengeFormBtn) {
        showChallengeFormBtn.addEventListener('click', handleShowChallengeForm);
    }
    
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
        acceptChallengeBtn.addEventListener('click', startChallengeGame);
    }
    
    const declineChallengeBtn = UI.get('declineChallengeBtn');
    if (declineChallengeBtn) {
        declineChallengeBtn.addEventListener('click', handleDeclineChallenge);
    }
    
    console.log('Event listeners initialized');
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
}

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
    const shareText = `${playerName} utmanar dig i spelet Ordna!`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${playerName} utmanar dig i spelet Ordna!`,
                text: `${shareText} ${challengeUrl}`
            });
        } catch (err) {
            console.log('User cancelled share or error:', err);
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