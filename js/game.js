// --- DATA ---
let allQuestions = [];

// --- Player Identity System ---
let currentPlayer = null;

// Initialize or get player identity
function initializePlayer() {
    let playerId = localStorage.getItem('playerId');
    let playerName = localStorage.getItem('playerName');
    
    if (!playerId) {
        playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('playerId', playerId);
    }
    
    currentPlayer = {
        id: playerId,
        name: playerName || null
    };
    
    return currentPlayer;
}

// Set player name (first time setup)
function setPlayerName(name) {
    localStorage.setItem('playerName', name);
    currentPlayer.name = name;
    console.log('Player identity set:', currentPlayer);
}

// Challenge System State
let ischallengeMode = false;
let challengeId = null;
let challengeData = null;
let challengeQuestions = [];
let challengeQuestionScores = [];

// Load questions from a specific pack
async function loadPackQuestions(packName) {
    const pack = questionPacks.find(p => p.name === packName);
    
    if (!pack || pack.status !== 'available' || !pack.file) {
        console.warn(`Pack "${packName}" not available or has no file`);
        return [];
    }
    
    try {
        const response = await fetch(`data/${pack.file}`);
        const data = await response.json();
        
        // Map questions with pack name
        const questions = data.questions.map(q => ({
            ...q,
            pack: packName
        }));
        
        console.log(`Loaded ${questions.length} questions from pack: ${packName}`);
        return questions;
    } catch (error) {
        console.error(`Failed to load pack "${packName}":`, error);
        return [];
    }
}

// Load questions from JSON file (fallback or default)
async function loadQuestions() {
    try {
        const response = await fetch('data/questions-grund.json');
        const data = await response.json();
        
        // Map questions with their pack assignments
        allQuestions = data.questions.map((q, index) => {
            return { ...q, pack: data.packs[index] || "Familjen Normal" };
        });
        
        console.log(`Loaded ${allQuestions.length} questions from ${data.name}`);
        return allQuestions;
    } catch (error) {
        console.error('Failed to load questions:', error);
        // Fallback to empty array if loading fails
        allQuestions = [];
        return allQuestions;
    }
}

// Load questions based on selected pack
async function loadQuestionsForGame() {
    if (selectedPack) {
        // Load specific pack
        const packQuestions = await loadPackQuestions(selectedPack);
        if (packQuestions.length > 0) {
            allQuestions = packQuestions;
            return allQuestions;
        }
        // Fallback if pack loading fails
        console.warn(`Failed to load pack "${selectedPack}", falling back to default questions`);
    }
    
    // Load default questions
    return await loadQuestions();
}

const questionPacks = [
    { 
        name: "Boomer", 
        description: "Frågor om en tid då allt var bättre. Eller var det?", 
        status: "available", 
        file: "questions-boomer.json",
        price: "GRATIS"
    },
    { 
        name: "Nörden", 
        description: "För dig som kan din superhjälte och din C++.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Boksmart och kultiverad", 
        description: "Testa dina kunskaper om finkultur och klassisk bildning.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Gatesmart och depraverad", 
        description: "Frågor som inte lärs ut i skolan. Tur är väl det.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Filmfantasten", 
        description: "Känner du igen repliken? Vet du vem som regisserade?", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Familjen Normal", 
        description: "Lagom svåra frågor för en helt vanlig fredagskväll.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Familjen Hurtig", 
        description: "Allt om sport, hälsa och att ständigt vara på språng.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Familjen Ullared", 
        description: "Fynd, familjebråk och folkfest i Gekås-anda.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Plugghästen", 
        description: "Geografins, kemins och grammatikens värld väntar.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Galaxhjärnan", 
        description: "Stora frågor om universum, vetenskap och existens.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "True Crime", 
        description: "Gåtan, ledtrådarna och de ökända fallen.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    },
    { 
        name: "Historia", 
        description: "Från antiken till kalla kriget – testa ditt historieminne.", 
        status: "coming-soon", 
        file: null,
        price: "COMING SOON"
    }
];

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const startMain = document.getElementById('start-main');
const playerSetup = document.getElementById('player-setup');
const showPlayerSetupBtn = document.getElementById('show-player-setup-btn');
const playerCountSelect = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names-container');
const startGameBtn = document.getElementById('start-game-btn');
// Player Name Setup Elements
const playerNameSetup = document.getElementById('player-name-setup');
const playerNameInput = document.getElementById('player-name-input');
const savePlayerNameBtn = document.getElementById('save-player-name-btn');

// Challenge Form Elements
const challengeForm = document.getElementById('challenge-form');
const showChallengeFormBtn = document.getElementById('show-challenge-form-btn');
const challengerNameDisplay = document.getElementById('challenger-name-display');
const createChallengeBtn = document.getElementById('create-challenge-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const challengeSuccess = document.getElementById('challenge-success');
const challengeError = document.getElementById('challenge-error');
const challengeLink = document.getElementById('challenge-link');
const copyLinkBtn = document.getElementById('copy-link-btn');
const shareWhatsappBtn = document.getElementById('share-whatsapp-btn');

// Challenge Accept Elements
const challengeAccept = document.getElementById('challenge-accept');
const challengerDisplayName = document.getElementById('challenger-display-name');
const acceptChallengeBtn = document.getElementById('accept-challenge-btn');
const declineChallengeBtn = document.getElementById('decline-challenge-btn');

// Notifications
const notificationsArea = document.getElementById('notifications-area');

const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const restartBtn = document.getElementById('restart-btn');
const packSelect = document.getElementById('pack-select');
const challengePackSelect = document.getElementById('challenge-pack-select');
const questionCounter = document.getElementById('question-counter');
const scoreboard = document.getElementById('scoreboard');
const difficultyBadge = document.getElementById('difficulty-badge');
const questionText = document.getElementById('question-text');
const questionInstruction = document.getElementById('question-instruction');
const optionsGrid = document.getElementById('options-grid');
const stopBtn = document.getElementById('stop-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const finalScoreboard = document.getElementById('final-scoreboard');

// Pack Shop Elements
const packShopModal = document.getElementById('pack-shop-modal');
const openPackShopBtn = document.getElementById('open-pack-shop-btn');
const closePackShopBtn = document.getElementById('close-pack-shop-btn');
const confirmPacksBtn = document.getElementById('confirm-packs-btn');
const packGrid = document.getElementById('pack-grid');

// Single Player Elements
const singlePlayerScore = document.getElementById('single-player-score');
const singlePlayerProgress = document.getElementById('single-player-progress');
const progressBar = document.getElementById('progress-bar');
const singlePlayerStars = document.getElementById('single-player-stars');
const currentScoreContainer = document.getElementById('current-score-container');
const singlePlayerFinal = document.getElementById('single-player-final');
const singleFinalScore = document.getElementById('single-final-score');
const endScreenSubtitle = document.getElementById('end-screen-subtitle');

// --- Game State ---
let players = [];
let currentPlayerIndex = 0;
let questionStarterIndex = 0;
let currentQuestionIndex = 0;
let questionsToPlay = [];
let userOrder = []; 
let selectedPacks = questionPacks.map(p => p.name);
let selectedPack = null; // Currently selected pack for playing

// Single Player State
let isSinglePlayer = false;
let totalScore = 0;
let currentQuestionScore = 0;
let mistakeMade = false;

// --- Challenge Functions ---

// Check if there's a challenge in URL
function checkForChallenge() {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeParam = urlParams.get('challenge');
    
    if (challengeParam) {
        challengeId = challengeParam;
        return true;
    }
    return false;
}

// Show challenge acceptance screen
async function showChallengeAcceptScreen() {
    try {
        // Get challenge details from Firebase
        challengeData = await FirebaseAPI.getChallenge(challengeId);
        
        challengerDisplayName.textContent = challengeData.challengerName;
        
        startMain.classList.add('hidden');
        playerSetup.classList.add('hidden');
        challengeForm.classList.add('hidden');
        challengeAccept.classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load challenge:', error);
        showError('Utmaningen kunde inte laddas. Kontrollera länken.');
        challengeAccept.classList.add('hidden');
        startMain.classList.remove('hidden');
    }
}

// Create a new challenge - starts the game immediately
async function createChallenge() {
    if (!currentPlayer || !currentPlayer.name) {
        console.error('Player not set up');
        return;
    }
    
    try {
        // Set selected pack from challenge dropdown before loading questions
        selectedPack = challengePackSelect.value || null;
        console.log('Creating challenge with pack:', selectedPack || 'All questions');
        
        // Load questions based on selected pack
        await loadQuestionsForGame();
        
        if (allQuestions.length === 0) {
            throw new Error('No questions available for selected pack');
        }
        
        // Select 5 random questions from loaded pack
        const processedQuestions = processQuestions(allQuestions);
        const shuffled = [...processedQuestions];
        shuffleArray(shuffled);
        challengeQuestions = shuffled.slice(0, 5);
        
        // Set up challenge mode
        ischallengeMode = true;
        challengeId = null; // Will be set after game completion
        challengeQuestionScores = [];
        
        // Start the game directly as single player
        players = [{
            name: currentPlayer.name,
            score: 0,
            roundPot: 0,
            eliminatedInRound: false,
            eliminationReason: null
        }];
        isSinglePlayer = true;
        totalScore = 0;
        questionsToPlay = challengeQuestions;
        
        // Hide challenge form and show game
        challengeForm.classList.add('hidden');
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Setup UI for single player
        singlePlayerScore.classList.remove('hidden');
        singlePlayerProgress.classList.remove('hidden');
        singlePlayerStars.classList.remove('hidden');
        scoreboard.classList.add('hidden');
        
        currentQuestionIndex = 0;
        loadQuestion();
        
    } catch (error) {
        console.error('Failed to create challenge:', error);
        showError('Kunde inte skapa utmaning. Försök igen.');
    }
}

// Check for new challenge results
async function checkForNotifications() {
    if (!currentPlayer || !currentPlayer.name) return;
    
    try {
        const lastCheck = localStorage.getItem('lastNotificationCheck');
        const lastCheckTime = lastCheck ? new Date(lastCheck) : null;
        
        const newResults = await FirebaseAPI.getNewCompletedChallenges(
            currentPlayer.name,
            lastCheckTime
        );
        
        if (newResults.length > 0) {
            showNotifications(newResults);
        }
        
        // Update last check time
        localStorage.setItem('lastNotificationCheck', new Date().toISOString());
    } catch (error) {
        console.error('Failed to check notifications:', error);
    }
}

// Load and display my challenges
async function loadMyChallenges() {
    const myChallengesSection = document.getElementById('my-challenges-section');
    const myChallengesList = document.getElementById('my-challenges-list');
    
    if (!currentPlayer || !currentPlayer.name) {
        myChallengesSection.classList.add('hidden');
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
        myChallengesSection.classList.add('hidden');
        return;
    }
    
    // Sort by most recent
    allChallenges.sort((a, b) => {
        const aTime = a.createdAt || a.completedAt;
        const bTime = b.createdAt || b.completedAt;
        return new Date(bTime) - new Date(aTime);
    });
    
    // Display challenges
    myChallengesList.innerHTML = '';
    allChallenges.slice(0, 5).forEach(challenge => {
        const item = document.createElement('div');
        item.className = 'bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors';
        
        let statusBadge = '';
        let statusText = '';
        
        if (challenge.role === 'challenger') {
            if (!challenge.hasSeenResult) {
                // Check if completed
                checkChallengeCompletionStatus(challenge.id).then(isComplete => {
                    if (isComplete) {
                        item.querySelector('.status-badge').innerHTML = 
                            '<span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Klar!</span>';
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
        
        const timeAgo = getTimeAgo(challenge.createdAt || challenge.completedAt);
        
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
                const isComplete = await checkChallengeCompletionStatus(challenge.id);
                if (isComplete) {
                    showChallengeResultView(challenge.id);
                } else {
                    challengeId = challenge.id;
                    showWaitingForOpponentView(challenge.id);
                }
            } else {
                showChallengeResultView(challenge.id);
            }
        });
        
        myChallengesList.appendChild(item);
    });
    
    myChallengesSection.classList.remove('hidden');
}

// Helper function to check if challenge is complete
async function checkChallengeCompletionStatus(challengeId) {
    try {
        const challenge = await FirebaseAPI.getChallenge(challengeId);
        return challenge && challenge.status === 'complete';
    } catch (error) {
        return false;
    }
}

// Helper function to get time ago text
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Nyss';
    if (diffMins < 60) return `${diffMins} min sedan`;
    if (diffHours < 24) return `${diffHours} tim sedan`;
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    return date.toLocaleDateString('sv-SE');
}

// Show notifications for completed challenges
function showNotifications(results) {
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
                    <p class="font-semibold text-green-800">🔔 ${challenge.opponent.name} har spelat klart!</p>
                    <p class="text-sm text-green-600">Vinnare: ${winner} (${challenge.opponent.totalScore} vs ${challenge.challenger.totalScore} poäng)</p>
                </div>
                <button onclick="event.stopPropagation(); this.parentElement.parentElement.remove()" class="text-green-400 hover:text-green-600 text-xl">×</button>
            </div>
        `;
        notification.addEventListener('click', () => {
            showChallengeResultView(challenge.id);
        });
        notificationsArea.appendChild(notification);
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        notificationsArea.classList.add('hidden');
    }, 10000);
}

// Utility functions
function showLoading(message) {
    createChallengeBtn.disabled = true;
    createChallengeBtn.textContent = message;
}

function hideLoading() {
    createChallengeBtn.disabled = false;
    createChallengeBtn.textContent = 'Skapa utmaning';
}

function showError(message) {
    challengeError.textContent = message;
    challengeError.classList.remove('hidden');
    setTimeout(() => {
        challengeError.classList.add('hidden');
    }, 5000);
}

// Show waiting for opponent view
function showWaitingForOpponentView(challengeId) {
    const challengeUrl = window.location.origin + window.location.pathname + 
        '?challenge=' + challengeId;
    
    // Create waiting view HTML
    const waitingHTML = `
        <div class="p-6 sm:p-8 lg:p-12 text-center">
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Utmaning skapad!</h2>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p class="text-lg font-semibold text-blue-800 mb-2">Ditt resultat: ${totalScore} poäng</p>
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
                    <button id="share-whatsapp-waiting" class="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600">
                        WhatsApp
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
    
    endScreen.innerHTML = waitingHTML;
    endScreen.classList.remove('hidden');
    
    // Add event listeners
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
    
    document.getElementById('share-whatsapp-waiting').addEventListener('click', () => {
        const message = encodeURIComponent(`${currentPlayer.name} utmanar dig till Ordna! ${challengeUrl}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    });
    
    document.getElementById('check-status-btn').addEventListener('click', async () => {
        await checkChallengeStatus(challengeId);
    });
    
    document.getElementById('back-to-start-waiting').addEventListener('click', () => {
        // Go directly to start screen without showing end screen
        stopChallengePolling();
        
        // Hide all screens first
        gameScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        playerSetup.classList.add('hidden');
        challengeForm.classList.add('hidden');
        
        // Show start screen
        startScreen.classList.remove('hidden');
        startMain.classList.remove('hidden');
        
        // Reset game state
        isSinglePlayer = false;
        totalScore = 0;
        currentQuestionScore = 0;
        mistakeMade = false;
        ischallengeMode = false;
        challengeId = null;
        challengeData = null;
        challengeQuestions = [];
        challengeQuestionScores = [];
        
        // Reload my challenges
        loadMyChallenges();
    });
    
    // Start polling
    startChallengePolling(challengeId);
}

// Show challenge result comparison view
async function showChallengeResultView(challengeId) {
    try {
        // Get challenge data from Firebase
        const challenge = await FirebaseAPI.getChallenge(challengeId);
        
        if (!challenge) {
            throw new Error('Challenge not found');
        }
        
        const isChallenger = challenge.challenger.name === currentPlayer.name;
        const myData = isChallenger ? challenge.challenger : challenge.opponent;
        const opponentData = isChallenger ? challenge.opponent : challenge.challenger;
        
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
        
        endScreen.innerHTML = resultHTML;
        endScreen.classList.remove('hidden');
        
        // Update localStorage to mark as seen
        const storedChallenge = localStorage.getItem(`challenge_${challengeId}`);
        if (storedChallenge) {
            const challengeInfo = JSON.parse(storedChallenge);
            challengeInfo.hasSeenResult = true;
            localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(challengeInfo));
        }
        
        // Add event listeners
        document.getElementById('new-challenge-btn').addEventListener('click', () => {
            restartGame();
            showChallengeFormBtn.click();
        });
        
        document.getElementById('back-to-start-result').addEventListener('click', () => {
            // Go directly to start screen without showing end screen
            stopChallengePolling();
            
            // Hide all screens first
            gameScreen.classList.add('hidden');
            endScreen.classList.add('hidden');
            playerSetup.classList.add('hidden');
            challengeForm.classList.add('hidden');
            
            // Show start screen
            startScreen.classList.remove('hidden');
            startMain.classList.remove('hidden');
            
            // Reset game state
            isSinglePlayer = false;
            totalScore = 0;
            currentQuestionScore = 0;
            mistakeMade = false;
            ischallengeMode = false;
            challengeId = null;
            challengeData = null;
            challengeQuestions = [];
            challengeQuestionScores = [];
            
            // Reload my challenges
            loadMyChallenges();
        });
        
    } catch (error) {
        console.error('Failed to show challenge result:', error);
        showError('Kunde inte ladda resultat');
        restartGame();
    }
}

// Check challenge status
async function checkChallengeStatus(challengeId) {
    try {
        const challenge = await FirebaseAPI.getChallenge(challengeId);
        
        if (challenge && challenge.status === 'complete') {
            // Stop polling
            stopChallengePolling();
            // Show result view
            showChallengeResultView(challengeId);
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

// Start challenge game for opponent
async function startChallengeGame() {
    try {
        // Get challenge data
        challengeData = await FirebaseAPI.getChallenge(challengeId);
        
        if (!challengeData) {
            throw new Error('Challenge not found');
        }
        
        // Check if challenge is expired
        const expiresDate = challengeData.expires.toDate ? challengeData.expires.toDate() : new Date(challengeData.expires);
        if (expiresDate < new Date()) {
            throw new Error('Challenge has expired');
        }
        
        // Check if already completed by this player
        const storedChallenge = localStorage.getItem(`challenge_${challengeId}`);
        if (storedChallenge) {
            const info = JSON.parse(storedChallenge);
            if (info.role === 'opponent') {
                showError('Du har redan spelat denna utmaning');
                showChallengeResultView(challengeId);
                return;
            }
        }
        
        // Set selected pack from challenge (for display purposes)
        selectedPack = challengeData.packName || null;
        console.log('Playing challenge with pack:', selectedPack || 'All questions');
        
        // Set up game with the same questions
        challengeQuestions = challengeData.questions;
        challengeQuestionScores = [];
        
        // Start the game as single player
        players = [{
            name: currentPlayer.name,
            score: 0,
            roundPot: 0,
            eliminatedInRound: false,
            eliminationReason: null
        }];
        isSinglePlayer = true;
        totalScore = 0;
        questionsToPlay = challengeQuestions;
        
        // Hide all screens and show game
        startScreen.classList.add('hidden');
        playerSetup.classList.add('hidden');
        endScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Setup UI for single player
        singlePlayerScore.classList.remove('hidden');
        singlePlayerProgress.classList.remove('hidden');
        singlePlayerStars.classList.remove('hidden');
        scoreboard.classList.add('hidden');
        
        currentQuestionIndex = 0;
        loadQuestion();
        
    } catch (error) {
        console.error('Failed to start challenge:', error);
        showError(error.message || 'Kunde inte starta utmaning');
        challengeAccept.classList.add('hidden');
        startMain.classList.remove('hidden');
    }
}

// Polling mechanism
let pollingInterval = null;
let pollingCount = 0;

function startChallengePolling(challengeId) {
    // Stop any existing polling
    stopChallengePolling();
    
    // Start with 10 second interval
    let currentInterval = 10000;
    
    const poll = async () => {
        pollingCount++;
        
        // Increase interval after 5 minutes (30 polls at 10s)
        if (pollingCount > 30) {
            currentInterval = 60000; // 60 seconds
            stopChallengePolling();
            pollingInterval = setInterval(poll, currentInterval);
        }
        
        await checkChallengeStatus(challengeId);
    };
    
    // Start polling
    pollingInterval = setInterval(poll, currentInterval);
    
    // Also check immediately
    checkChallengeStatus(challengeId);
}

function stopChallengePolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    pollingCount = 0;
}

// Show result screen for regular games (pack and standard)
function showGameResultScreen(score, gameType, totalQuestions) {
    console.log('Showing game result screen for:', gameType);
    
    const gameTypeName = gameType || 'Allmänna frågor';
    
    // Create result screen HTML
    const resultHTML = `
        <div class="text-center p-6 sm:p-8 lg:p-12">
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
            <p class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat!</p>
            
            <!-- Game Result -->
            <div class="bg-blue-100 text-blue-800 rounded-lg p-6 mb-8">
                <h3 class="text-xl font-semibold mb-2">${gameTypeName}</h3>
                <p class="text-sm text-blue-600 mb-3">${totalQuestions} frågor</p>
                <p class="text-6xl font-bold">${score}</p>
                <p class="text-lg">poäng</p>
            </div>
            
            <button id="back-to-start-final" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:bg-blue-700 transition-colors shadow-md">
                Tillbaka till start
            </button>
        </div>
    `;
    
    endScreen.innerHTML = resultHTML;
    endScreen.classList.remove('hidden');
    
    // Add event listener for back button
    document.getElementById('back-to-start-final').addEventListener('click', () => {
        console.log('Back to start clicked from game result');
        
        // Go back to start screen
        endScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        startMain.classList.remove('hidden');
        playerSetup.classList.add('hidden');
        challengeForm.classList.add('hidden');
        
        // Reset game state
        isSinglePlayer = false;
        totalScore = 0;
        currentQuestionScore = 0;
        mistakeMade = false;
        selectedPack = null;
        
        // Reload my challenges
        loadMyChallenges();
    });
}

// --- Functions ---

// Point animation for both single and multiplayer
function showPointAnimation(playerIndex, text, isBanked = false) {
    if (isSinglePlayer) {
        // Show animation on star container for single player
        const starContainer = document.getElementById('current-score-container');
        if (starContainer) {
            const animationEl = document.createElement('span');
            animationEl.className = 'point-float';
            if (isBanked) {
                animationEl.classList.add('banked');
            }
            animationEl.textContent = text;
            starContainer.appendChild(animationEl);
            
            setTimeout(() => {
                animationEl.remove();
            }, 1000);
        }
    } else {
        // Show animation on player card for multiplayer
        const cards = scoreboard.querySelectorAll('.player-score-card');
        if (cards.length > playerIndex) {
            const card = cards[playerIndex];
            const animationEl = document.createElement('span');
            animationEl.className = 'point-float';
            if (isBanked) {
                animationEl.classList.add('banked');
            }
            animationEl.textContent = text;
            card.appendChild(animationEl);
            
            setTimeout(() => {
                animationEl.remove();
            }, 1000);
        }
    }
}

function processQuestions(questions) {
    return questions.map(q => {
        if (q.typ === 'ordna' && q.rätt_ordning.every(item => typeof item === 'string' && item.length === 1)) {
            const currentAlternatives = {
                'A': q.alternativ[0], 'B': q.alternativ[1],
                'C': q.alternativ[2], 'D': q.alternativ[3]
            };
            const newCorrectOrder = q.rätt_ordning.map(letter => currentAlternatives[letter.toUpperCase()]);
            return { ...q, rätt_ordning: newCorrectOrder };
        }
        return q;
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showPlayerSetup() {
    startMain.classList.add('hidden');
    playerSetup.classList.remove('hidden');
    createPlayerInputs();
}

// Single Player Functions
function renderStars(count, filled = 0) {
    currentScoreContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        star.setAttribute('class', `star-icon ${i < filled ? 'filled' : 'empty'}`);
        star.setAttribute('viewBox', '0 0 24 24');
        star.innerHTML = `<path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/>`;
        currentScoreContainer.appendChild(star);
    }
}

function updateStars(filledCount) {
    const stars = currentScoreContainer.querySelectorAll('.star-icon');
    stars.forEach((star, index) => {
        star.classList.toggle('filled', index < filledCount);
        star.classList.toggle('empty', index >= filledCount);
    });
}

function updateSinglePlayerDisplay() {
    singlePlayerScore.textContent = `Totalpoäng: ${totalScore}`;
    const progressPercentage = (currentQuestionIndex / questionsToPlay.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function endSinglePlayerQuestion(pointsToAdd) {
    totalScore += pointsToAdd;
    mistakeMade = true; // Lock all interactions
    
    // Save score for this question if in challenge mode
    if (ischallengeMode) {
        challengeQuestionScores.push(pointsToAdd);
    }
    
    updateSinglePlayerDisplay();
    stopBtn.classList.add('hidden');
    nextQuestionBtn.classList.remove('hidden');
    
    const question = questionsToPlay[currentQuestionIndex];

    if (question.typ === 'ordna') {
        feedbackOrder();
    } else {
        feedbackBelongsTo();
    }
}

async function endSinglePlayerGame() {
    gameScreen.classList.add('hidden');
    
    // If this is challenge creation mode
    if (ischallengeMode && !challengeId) {
        try {
            // Create the challenge in Firebase with the results
            const newChallengeId = await FirebaseAPI.createChallenge(
                currentPlayer.name,
                currentPlayer.id,
                challengeQuestions,
                totalScore,
                challengeQuestionScores,
                selectedPack
            );
            
            challengeId = newChallengeId;
            
            // Save to localStorage
            const challengeInfo = {
                id: newChallengeId,
                role: 'challenger',
                playerName: currentPlayer.name,
                createdAt: new Date().toISOString(),
                hasSeenResult: false,
                totalScore: totalScore,
                questionScores: challengeQuestionScores
            };
            localStorage.setItem(`challenge_${newChallengeId}`, JSON.stringify(challengeInfo));
            
            // Show waiting for opponent view
            showWaitingForOpponentView(newChallengeId);
            
        } catch (error) {
            console.error('Failed to create challenge:', error);
            showError('Kunde inte skapa utmaning. Försök igen.');
            endScreen.classList.remove('hidden');
            singlePlayerFinal.classList.remove('hidden');
            finalScoreboard.classList.add('hidden');
            singleFinalScore.textContent = `${totalScore}`;
        }
    }
    // If this is accepting a challenge
    else if (ischallengeMode && challengeId) {
        try {
            await FirebaseAPI.completeChallenge(
                challengeId,
                currentPlayer.name,
                totalScore,
                challengeQuestionScores
            );
            
            // Save to localStorage
            const challengeInfo = {
                id: challengeId,
                role: 'opponent',
                playerName: currentPlayer.name,
                completedAt: new Date().toISOString(),
                hasSeenResult: true,
                totalScore: totalScore,
                questionScores: challengeQuestionScores
            };
            localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(challengeInfo));
            
            // Show result comparison view
            showChallengeResultView(challengeId);
            
        } catch (error) {
            console.error('Failed to complete challenge:', error);
            showError('Kunde inte spara resultat. Försök igen.');
            endScreen.classList.remove('hidden');
            singlePlayerFinal.classList.remove('hidden');
            finalScoreboard.classList.add('hidden');
            singleFinalScore.textContent = `${totalScore}`;
        }
    }
    // Normal single player mode
    else {
        
        // Hide game screen first
        gameScreen.classList.add('hidden');
        
        // Show unified result screen for all regular games
        if (selectedPack) {
            // Pack-based game
            showGameResultScreen(totalScore, selectedPack, questionsToPlay.length);
        } else {
            // Standard game with all questions
            showGameResultScreen(totalScore, 'Allmänna frågor', questionsToPlay.length);
        }
    }
}

// Populate pack selection dropdown
function populatePackSelect() {
    const selects = [packSelect, challengePackSelect];
    
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Alla frågor (standard)</option>';
            
            questionPacks.forEach(pack => {
                if (pack.status === 'available') {
                    const option = document.createElement('option');
                    option.value = pack.name;
                    option.textContent = `${pack.name} (${pack.price})`;
                    select.appendChild(option);
                }
            });
        }
    });
}

function createPlayerInputs() {
    const count = playerCountSelect.value;
    playerNamesContainer.innerHTML = '';
    
    // Skip name inputs for single player
    if (count == 1) {
        return;
    }
    
    // Create name inputs for multiplayer
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Spelare ${i + 1} namn`;
        input.className = 'player-name-input w-full p-3 border border-slate-300 rounded-lg text-base sm:text-lg';
        playerNamesContainer.appendChild(input);
    }
}

async function initializeGame() {
    // Set selected pack from dropdown
    selectedPack = packSelect.value || null;
    console.log('Starting game with pack:', selectedPack || 'All questions');
    
    // Load questions based on selected pack
    await loadQuestionsForGame();
    
    if (allQuestions.length === 0) {
        console.error("No questions loaded!");
        alert("Kunde inte ladda frågor. Kontrollera att frågefiler finns.");
        return;
    }
    
    const nameInputs = document.querySelectorAll('.player-name-input');
    const playerCount = parseInt(playerCountSelect.value);
    players = [];
    
    // Handle single player (no name inputs)
    if (playerCount === 1) {
        players.push({
            name: 'Spelare 1',
            score: 0,
            roundPot: 0,
            eliminatedInRound: false,
            eliminationReason: null
        });
        isSinglePlayer = true;
        totalScore = 0;
    } else {
        // Handle multiplayer (with name inputs)
        nameInputs.forEach((input, index) => {
            players.push({
                name: input.value || `Spelare ${index + 1}`,
                score: 0,
                roundPot: 0,
                eliminatedInRound: false,
                eliminationReason: null
            });
        });
        isSinglePlayer = false;
        if (players.length < 2) {
            console.error("Minst två spelare behövs!");
            return;
        }
    }

    if (selectedPacks.length === 0) {
        selectedPacks = questionPacks.map(p => p.name);
        populatePackShop();
    }
    
    // Process questions and filter by selected packs
    const processedQuestions = processQuestions(allQuestions);
    questionsToPlay = processedQuestions.filter(q => selectedPacks.includes(q.pack));
    
    if (questionsToPlay.length === 0) {
        questionsToPlay = [...processedQuestions];
    }
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Setup UI based on game mode
    if (isSinglePlayer) {
        // Show single player UI
        singlePlayerScore.classList.remove('hidden');
        singlePlayerProgress.classList.remove('hidden');
        singlePlayerStars.classList.remove('hidden');
        scoreboard.classList.add('hidden');
    } else {
        // Show multiplayer UI
        singlePlayerScore.classList.add('hidden');
        singlePlayerProgress.classList.add('hidden');
        singlePlayerStars.classList.add('hidden');
        scoreboard.classList.remove('hidden');
    }
    
    currentQuestionIndex = 0;
    questionStarterIndex = 0;
    shuffleArray(questionsToPlay);
    loadQuestion();
}

function updateScoreboard() {
    scoreboard.innerHTML = '';
    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = 'player-score-card p-3 border-2 rounded-lg flex flex-col justify-between min-h-[60px]';
        
        let turnIndicatorHTML = '';
        if (player.eliminatedInRound) {
            card.classList.add('eliminated');
        } else if (index === currentPlayerIndex) {
            card.classList.add('active-player');
            turnIndicatorHTML = `<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">Din tur!</div>`;
        }

        let statusText = '';
        if (player.eliminationReason === 'stopped') {
            statusText = ' (Stannat)';
        } else if (player.eliminationReason === 'wrong') {
            statusText = ' (Fel)';
        }

        let roundPotHTML = '';
        if (player.roundPot > 0 && !player.eliminatedInRound) {
            roundPotHTML = `<span class="font-semibold text-green-600 ml-2">+${player.roundPot}</span>`;
        } 
        else if (player.eliminationReason === 'wrong') {
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

function updateGameControls() {
    if (isSinglePlayer) {
        stopBtn.textContent = 'Stanna & Säkra Poäng';
        stopBtn.classList.remove('hidden');
        stopBtn.disabled = false;
    } else {
        const player = players[currentPlayerIndex];
        const activePlayers = players.filter(p => !p.eliminatedInRound);

        if (activePlayers.length === 0) {
            stopBtn.classList.add('hidden');
            nextQuestionBtn.classList.remove('hidden');
        } else {
            nextQuestionBtn.classList.add('hidden');
            if (player && player.roundPot > 0 && !player.eliminatedInRound) {
                stopBtn.textContent = `(${player.name}) Stanna på +${player.roundPot}`;
                stopBtn.disabled = false;
                stopBtn.classList.remove('hidden');
            } else {
                stopBtn.classList.add('hidden');
                stopBtn.disabled = true;
            }
        }
    }
}

function setDifficultyBadge(difficulty) {
    const badge = difficultyBadge;
    badge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    let baseClasses = 'text-xs font-bold px-2 py-1 rounded-full ';
    
    if (difficulty === 'lätt') badge.className = baseClasses + 'bg-green-100 text-green-800';
    else if (difficulty === 'medel') badge.className = baseClasses + 'bg-yellow-100 text-yellow-800';
    else badge.className = baseClasses + 'bg-red-100 text-red-800';
}

function loadQuestion() {
    userOrder = [];
    mistakeMade = false;
    currentQuestionScore = 0;
    
    if (!isSinglePlayer) {
        players.forEach(p => {
            p.roundPot = 0;
            p.eliminatedInRound = false;
            p.eliminationReason = null;
        });
    }
    
    optionsGrid.innerHTML = '';
    nextQuestionBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    stopBtn.disabled = false;
    
    if (currentQuestionIndex >= questionsToPlay.length) {
        if (isSinglePlayer) {
            endSinglePlayerGame();
        } else {
            endGame();
        }
        return;
    }

    if (!isSinglePlayer) {
        currentPlayerIndex = questionStarterIndex;
        updateScoreboard();
    } else {
        renderStars(4); // Render 4 empty stars for single player
        updateSinglePlayerDisplay();
    }
    updateGameControls();

    const question = questionsToPlay[currentQuestionIndex];
    
    questionCounter.textContent = `Fråga ${currentQuestionIndex + 1} / ${questionsToPlay.length}`;
    setDifficultyBadge(question.svårighetsgrad);
    questionText.textContent = question.fråga;
    
    const shuffledOptions = [...question.alternativ];
    shuffleArray(shuffledOptions);

    optionsGrid.className = 'grid grid-cols-1 gap-3 sm:gap-4 my-4 sm:my-6';

    if (question.typ === 'ordna') {
        questionInstruction.textContent = isSinglePlayer ? 
            'Klicka på alternativen i rätt ordning. Ett fel och du förlorar frågans poäng.' :
            'Klicka på alternativen i rätt ordning.';
        shuffledOptions.forEach(optionText => createOrderButton(optionText));
    } else { // 'hör_till'
        questionInstruction.textContent = isSinglePlayer ?
            'Bedöm varje alternativ. Ett fel och du förlorar frågans poäng.' :
            'Bedöm varje alternativ.';
        shuffledOptions.forEach(optionText => createBelongsToOption(optionText));
    }
}

function setAllOptionsDisabled(disabled) {
    optionsGrid.querySelectorAll('button').forEach(btn => btn.disabled = disabled);
}

function nextTurn() {
    const activePlayers = players.filter(p => !p.eliminatedInRound);
    if (activePlayers.length === 0) {
        concludeQuestionRound();
        return;
    }

    let nextIndex = (currentPlayerIndex + 1) % players.length;
    while(players[nextIndex].eliminatedInRound) {
        nextIndex = (nextIndex + 1) % players.length;
    }
    currentPlayerIndex = nextIndex;
    
    updateScoreboard();
    updateGameControls();
    setAllOptionsDisabled(false);
}

function concludeQuestionRound() {
    players.forEach(player => {
        if (!player.eliminatedInRound) {
            player.score += player.roundPot;
            player.roundPot = 0;
            player.eliminatedInRound = true; 
            player.eliminationReason = 'finished';
        }
    });

    setAllOptionsDisabled(true);
    questionStarterIndex = (questionStarterIndex + 1) % players.length;
    
    updateScoreboard();
    updateGameControls();

    const question = questionsToPlay[currentQuestionIndex];
    if (question.typ === 'ordna') {
        feedbackOrder();
    } else {
        feedbackBelongsTo();
    }
}

function createOrderButton(optionText) {
    const button = document.createElement('button');
    button.className = 'option-btn w-full text-left p-3 sm:p-4 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-400 text-sm sm:text-base';
    button.textContent = optionText;
    button.addEventListener('click', () => handleOrderClick(button, optionText));
    optionsGrid.appendChild(button);
}

function createBelongsToOption(optionText) {
    const container = document.createElement('div');
    container.className = 'belongs-option-container w-full text-left p-2 rounded-lg border-2 border-slate-300 bg-white';
    
    const text = document.createElement('span');
    text.textContent = optionText;
    text.className = 'flex-grow pr-2 sm:pr-4 text-sm sm:text-base';

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'decision-buttons';

    const yesBtn = document.createElement('button');
    yesBtn.innerHTML = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
    yesBtn.className = 'yes-btn';
    
    const noBtn = document.createElement('button');
    noBtn.innerHTML = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    noBtn.className = 'no-btn';

    yesBtn.addEventListener('click', () => handleBelongsDecision(true, container, yesBtn, noBtn));
    noBtn.addEventListener('click', () => handleBelongsDecision(false, container, yesBtn, noBtn));

    buttonWrapper.appendChild(yesBtn);
    buttonWrapper.appendChild(noBtn);
    container.appendChild(text);
    container.appendChild(buttonWrapper);
    optionsGrid.appendChild(container);
}

function handleOrderClick(button, optionText) {
    if (isSinglePlayer && mistakeMade) return;
    
    const question = questionsToPlay[currentQuestionIndex];
    const isCorrectStep = question.rätt_ordning[userOrder.length] === optionText;

    if (isSinglePlayer) {
        if (isCorrectStep) {
            userOrder.push(optionText);
            currentQuestionScore++;
            updateStars(currentQuestionScore);
            showPointAnimation(0, "+1");
            
            button.className = 'option-btn w-full text-left p-4 rounded-lg border-2 order-selected';
            button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-blue-600 rounded-full font-bold">${userOrder.length}</span> ${optionText}`;
            button.disabled = true;

            if (userOrder.length === 4) {
                endSinglePlayerQuestion(currentQuestionScore);
            }
        } else {
            mistakeMade = true;
            currentQuestionScore = 0;
            updateStars(0);
            button.classList.add('incorrect-step');
            endSinglePlayerQuestion(0);
        }
    } else {
        // Multiplayer logic
        setAllOptionsDisabled(true);
        
        if (isCorrectStep) {
            userOrder.push(optionText);
            players[currentPlayerIndex].roundPot++;
            showPointAnimation(currentPlayerIndex, "+1");
            updateScoreboard();
            
            button.className = 'option-btn w-full text-left p-3 sm:p-4 rounded-lg border-2 order-selected text-sm sm:text-base';
            button.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white text-blue-600 rounded-full font-bold">${userOrder.length}</span> ${optionText}`;
            button.disabled = true;

            if (userOrder.length === question.alternativ.length) {
                concludeQuestionRound();
            } else {
                setTimeout(nextTurn, 500);
            }
        } else {
            players[currentPlayerIndex].roundPot = 0;
            players[currentPlayerIndex].eliminatedInRound = true;
            players[currentPlayerIndex].eliminationReason = 'wrong';
            button.classList.add('incorrect-step');
            updateScoreboard();
            
            setTimeout(nextTurn, 1000);
        }
    }
}

function handleBelongsDecision(userDecision, container, yesBtn, noBtn) {
    if (isSinglePlayer && mistakeMade) return;
    
    const question = questionsToPlay[currentQuestionIndex];
    const optionText = container.querySelector('span').textContent;
    const correctOptions = question.tillhör_index.map(i => question.alternativ[i]);
    const actuallyBelongs = correctOptions.includes(optionText);
    const isCorrect = (userDecision === actuallyBelongs);

    yesBtn.disabled = true;
    noBtn.disabled = true;
    container.dataset.decided = 'true';

    const clickedBtn = userDecision ? yesBtn : noBtn;
    const otherBtn = userDecision ? noBtn : yesBtn;
    otherBtn.classList.add('deselected');

    if (isSinglePlayer) {
        if (isCorrect) {
            currentQuestionScore++;
            updateStars(currentQuestionScore);
            showPointAnimation(0, "+1");
            container.classList.add('choice-made');
            clickedBtn.classList.add('correct-selection');
        } else {
            clickedBtn.classList.add('selected'); 
            mistakeMade = true;
            currentQuestionScore = 0;
            updateStars(0);
            container.classList.add('incorrect-choice');
            endSinglePlayerQuestion(0);
        }
    } else {
        // Multiplayer logic
        setAllOptionsDisabled(true);
        let timeout = 1000;

        if (isCorrect) {
            players[currentPlayerIndex].roundPot++;
            showPointAnimation(currentPlayerIndex, "+1");
            container.classList.add('choice-made');
            clickedBtn.classList.add('correct-selection');
        } else {
            players[currentPlayerIndex].roundPot = 0;
            players[currentPlayerIndex].eliminatedInRound = true;
            players[currentPlayerIndex].eliminationReason = 'wrong';
            container.classList.add('incorrect-choice');
        }
        updateScoreboard();
        
        const allDecided = Array.from(optionsGrid.querySelectorAll('.belongs-option-container'))
                                         .every(c => c.dataset.decided === 'true');

        if (allDecided) {
            setTimeout(concludeQuestionRound, timeout);
        } else {
            setTimeout(nextTurn, timeout);
        }
    }
}

function playerStops() {
    if (isSinglePlayer) {
        if (currentQuestionScore > 0) {
            showPointAnimation(0, `+${currentQuestionScore}p`, true);
        }
        endSinglePlayerQuestion(currentQuestionScore);
    } else {
        const player = players[currentPlayerIndex];
        if (player.roundPot > 0) {
             showPointAnimation(currentPlayerIndex, `+${player.roundPot}p`, true);
        }
        player.score += player.roundPot;
        player.roundPot = 0;
        player.eliminatedInRound = true;
        player.eliminationReason = 'stopped';
        updateScoreboard();
        nextTurn();
    }
}

function feedbackOrder() {
    const buttons = optionsGrid.querySelectorAll('button');
    buttons.forEach(btn => {
        let btnText = btn.textContent;
        const span = btn.querySelector('span');
        if (span) btnText = btn.textContent.substring(span.textContent.length).trim();

        if (userOrder.includes(btnText)) {
            btn.classList.remove('order-selected');
            btn.classList.add('correct-step'); 
        }
    });
}

function feedbackBelongsTo() {
    const question = questionsToPlay[currentQuestionIndex];
    const correctOptions = question.tillhör_index.map(i => question.alternativ[i]);
    const containers = optionsGrid.querySelectorAll('.belongs-option-container');

    containers.forEach(container => {
        const text = container.querySelector('span').textContent;
        const yesBtn = container.querySelector('.yes-btn');
        const noBtn = container.querySelector('.no-btn');
        const actuallyBelongs = correctOptions.includes(text);

        if (actuallyBelongs) {
            if (!yesBtn.classList.contains('correct-selection')) {
                 yesBtn.classList.add('correct-answer-highlight');
            }
        } else {
             if (!noBtn.classList.contains('correct-selection')) {
                 noBtn.classList.add('correct-answer-highlight');
            }
        }
    });
}

function endGame() {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    players.sort((a, b) => b.score - a.score);
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
            rankDiv.classList.add('border-2', 'border-slate-300');
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

function restartGame() {
    // Stop any ongoing polling
    stopChallengePolling();
    
    // Restore endScreen HTML
    endScreen.innerHTML = `
        <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Spelet är slut!</h2>
        <p id="end-screen-subtitle" class="text-slate-600 mb-6 text-base sm:text-lg">Bra kämpat allihopa!</p>
        
        <!-- Single Player Final Score -->
        <div id="single-player-final" class="hidden bg-blue-100 text-blue-800 rounded-lg p-6 mb-8">
            <p class="text-xl">Din slutpoäng:</p>
            <p id="single-final-score" class="text-6xl font-bold"></p>
        </div>
        
        <!-- Multiplayer Final Scoreboard -->
        <div id="final-scoreboard" class="space-y-3 sm:space-y-4 mb-8">
            <!-- Final player scores will be listed here -->
        </div>
        
        <button id="restart-btn" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl hover:bg-blue-700 transition-colors shadow-md">
            Spela igen
        </button>
    `;
    
    // Re-attach restart button listener
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Update element references
    endScreenSubtitle = document.getElementById('end-screen-subtitle');
    singlePlayerFinal = document.getElementById('single-player-final');
    singleFinalScore = document.getElementById('single-final-score');
    finalScoreboard = document.getElementById('final-scoreboard');
    
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startMain.classList.remove('hidden');
    playerSetup.classList.add('hidden');
    challengeForm.classList.add('hidden');
    
    // Reset single player display
    singlePlayerFinal.classList.add('hidden');
    finalScoreboard.classList.remove('hidden');
    
    // Reset game state
    isSinglePlayer = false;
    totalScore = 0;
    currentQuestionScore = 0;
    mistakeMade = false;
    ischallengeMode = false;
    challengeId = null;
    challengeData = null;
    challengeQuestions = [];
    challengeQuestionScores = [];
    
    // Reload my challenges
    loadMyChallenges();
}

// --- Pack Shop Functions ---
function populatePackShop() {
    packGrid.innerHTML = '';
    questionPacks.forEach(pack => {
        const card = document.createElement('div');
        const isAvailable = pack.status === 'available';
        const isSelected = selectedPacks.includes(pack.name);
        
        card.className = `pack-card border-2 rounded-lg p-4 flex flex-col justify-between ${
            isAvailable ? 'cursor-pointer bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white' : 
            'cursor-not-allowed bg-slate-100 border-slate-300 opacity-75'
        }`;
        card.dataset.packName = pack.name;
        
        if (isSelected && isAvailable) {
            card.classList.add('selected');
        }

        const priceColor = pack.status === 'available' ? 'text-green-600' : 'text-slate-400';
        const statusIcon = pack.status === 'available' ? '✅' : '🔒';

        card.innerHTML = `
            <div>
                ${isAvailable && isSelected ? `
                    <div class="selected-check">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                ` : ''}
                <h3 class="font-bold text-lg text-slate-800 mb-1 pr-8">${statusIcon} ${pack.name}</h3>
                <p class="text-slate-600 text-sm leading-relaxed">${pack.description}</p>
            </div>
            <div class="mt-auto pt-3 border-t border-slate-200 text-right">
                <span class="font-bold ${priceColor} text-lg">${pack.price}</span>
            </div>
        `;
        
        if (isAvailable) {
            card.addEventListener('click', () => togglePackSelection(card, pack.name));
        }
        packGrid.appendChild(card);
    });
}

function togglePackSelection(card, packName) {
    card.classList.toggle('selected');
    if (selectedPacks.includes(packName)) {
        selectedPacks = selectedPacks.filter(p => p !== packName);
    } else {
        selectedPacks.push(packName);
    }
}

function openPackShop() { packShopModal.classList.remove('hidden'); }
function closePackShop() { packShopModal.classList.add('hidden'); }

// --- Event Listeners ---
showPlayerSetupBtn.addEventListener('click', showPlayerSetup);
playerCountSelect.addEventListener('change', createPlayerInputs);
startGameBtn.addEventListener('click', initializeGame);
restartBtn.addEventListener('click', restartGame);

stopBtn.addEventListener('click', playerStops);

nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

// Pack Shop Listeners
openPackShopBtn.addEventListener('click', openPackShop);
closePackShopBtn.addEventListener('click', closePackShop);
confirmPacksBtn.addEventListener('click', closePackShop);

// Player Name Setup Listeners
savePlayerNameBtn.addEventListener('click', async () => {
    const name = playerNameInput.value.trim();
    if (name) {
        setPlayerName(name);
        playerNameSetup.classList.add('hidden');
        
        // Check if there's a pending challenge
        const pendingChallenge = localStorage.getItem('pendingChallenge');
        if (pendingChallenge) {
            localStorage.removeItem('pendingChallenge');
            challengeId = pendingChallenge;
            ischallengeMode = true;
            await startChallengeGame();
        } else {
            startMain.classList.remove('hidden');
            // Update challenger name display
            challengerNameDisplay.textContent = name;
        }
    }
});

// Challenge form listeners
showChallengeFormBtn.addEventListener('click', () => {
    if (!currentPlayer.name) {
        // Show name setup first
        startMain.classList.add('hidden');
        playerNameSetup.classList.remove('hidden');
        return;
    }
    
    challengerNameDisplay.textContent = currentPlayer.name;
    startMain.classList.add('hidden');
    challengeForm.classList.remove('hidden');
    
    // Reset form state
    challengeSuccess.classList.add('hidden');
    createChallengeBtn.classList.remove('hidden');
});

backToStartBtn.addEventListener('click', () => {
    challengeForm.classList.add('hidden');
    startMain.classList.remove('hidden');
    challengeError.classList.add('hidden');
    challengeSuccess.classList.add('hidden');
});

createChallengeBtn.addEventListener('click', createChallenge);

// Copy link functionality
copyLinkBtn.addEventListener('click', async () => {
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
});

// WhatsApp sharing
shareWhatsappBtn.addEventListener('click', () => {
    const message = encodeURIComponent(`${currentPlayer.name} utmanar dig till Ordna! ${challengeLink.value}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
});

// Challenge acceptance listeners
acceptChallengeBtn.addEventListener('click', async () => {
    ischallengeMode = true;
    challengeAccept.classList.add('hidden');
    
    // Check if user needs to set name
    if (!currentPlayer.name) {
        playerNameSetup.classList.remove('hidden');
        // Store that we need to start challenge after name setup
        localStorage.setItem('pendingChallenge', challengeId);
    } else {
        // Start the challenge directly
        await startChallengeGame();
    }
});

declineChallengeBtn.addEventListener('click', () => {
    // Clear challenge data and show normal start screen
    ischallengeMode = false;
    challengeId = null;
    challengeData = null;
    
    challengeAccept.classList.add('hidden');
    startMain.classList.remove('hidden');
    
    // Clear URL parameters
    if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});


// --- Initial Setup ---
async function initializeApp() {
    // Initialize player identity
    initializePlayer();
    
    // Setup UI
    populatePackShop();
    populatePackSelect();
    createPlayerInputs();
    updateScoreboard();
    
    // Check if there's a challenge in URL
    if (checkForChallenge()) {
        // Show challenge acceptance screen
        await showChallengeAcceptScreen();
    } else {
        // Check for notifications if user is returning
        if (currentPlayer.name) {
            await checkForNotifications();
            await loadMyChallenges();
            challengerNameDisplay.textContent = currentPlayer.name;
        }
    }
}

// Initialize the app
initializeApp();