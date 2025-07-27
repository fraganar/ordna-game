// --- DATA (Unchanged) ---
const userQuestions = [
    {"typ": "ordna", "svårighetsgrad": "medel", "fråga": "Ordna dessa revolutioner i kronologisk ordning (äldst först).", "alternativ": ["Ryska revolutionen", "Amerikanska revolutionen", "Kulturrevolutionen i Kina", "Franska revolutionen"], "rätt_ordning": ["B", "D", "A", "C"], "förklaring": "Amerikanska revolutionen skedde 1775–1783, sedan kom franska revolutionen 1789. Ryska revolutionen inträffade 1917 och sist inträffade Kinas kulturrevolution 1966–1976."},
    {"typ": "ordna", "svårighetsgrad": "lätt", "fråga": "Ordna dessa livsstadier från tidigast till senast i livet.", "alternativ": ["Tonår", "Vuxenliv", "Ålderdom", "Barndom"], "rätt_ordning": ["D", "A", "B", "C"], "förklaring": "Först kommer barndomen, sedan tonåren, därefter vuxenlivet och till sist ålderdomen. Så ser de typiska stadierna i en människas liv ut i kronologisk ordning."},
    {"typ": "ordna", "svårighetsgrad": "lätt", "fråga": "Ordna dessa 1990-talsfilmer efter premiärdatum (tidigast till senast).", "alternativ": ["Ensam hemma", "Jurassic Park", "Titanic", "The Matrix"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Ensam hemma kom 1990, Jurassic Park 1993, Titanic 1997 och The Matrix 1999. Det gör att de i kronologisk ordning släpptes i just den ordningen från tidigast till senast."},
    {"typ": "ordna", "svårighetsgrad": "medel", "fråga": "Ordna dessa planeter efter storlek (minst till störst diameter).", "alternativ": ["Merkurius", "Mars", "Venus", "Jorden"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Merkurius är minst av dessa, därefter Mars. Venus är något mindre än jorden, som är störst bland dessa fyra planeter."},
    {"typ": "ordna", "svårighetsgrad": "svår", "fråga": "Ordna dessa metaller efter värde (billigast till dyrast).", "alternativ": ["Järn", "Silver", "Guld", "Platina"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Järn är billigast, silver mer värt. Guld är dyrbarare än silver, och platina anses mest värdefull av dessa metaller."},
    {"typ": "ordna", "svårighetsgrad": "svår", "fråga": "Ordna dessa länder efter antal officiella språk (färst till flest).", "alternativ": ["Sydafrika", "Schweiz", "Japan", "Kanada"], "rätt_ordning": ["C", "D", "B", "A"], "förklaring": "Japan har 1 officiellt språk, Kanada har 2 (engelska och franska), Schweiz har 4, och Sydafrika har hela 11 officiella språk."},
    {"typ": "ordna", "svårighetsgrad": "lätt", "fråga": "Ordna dessa svenska städer i alfabetisk ordning (A till Ö).", "alternativ": ["Borås", "Malmö", "Stockholm", "Uppsala"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "I alfabetisk ordning kommer Borås först (B), därefter Malmö (M), sedan Stockholm (S) och sist Uppsala (U)."},
    {"typ": "ordna", "svårighetsgrad": "medel", "fråga": "Ordna dessa städer efter befolkningsmängd (minst till flest invånare).", "alternativ": ["Sydney", "London", "Kairo", "Tokyo"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Sydney har bara omkring 5 miljoner invånare, London runt 9 miljoner (14M med omnejd), Kairo cirka 20 miljoner, och Tokyo är störst med över 35 miljoner invånare."},
    {"typ": "ordna", "svårighetsgrad": "medel", "fråga": "Ordna dessa berg efter höjd över havet (lägst till högst).", "alternativ": ["Mont Blanc", "Kilimanjaro", "K2", "Mount Everest"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Mont Blanc (4 810 m) är lägst, Kilimanjaro (5 895 m) högre, K2 (8 611 m) näst högst och Mount Everest (8 848 m) högst."},
    {"typ": "ordna", "svårighetsgrad": "svår", "fråga": "Ordna dessa planeter efter yttemperatur (kallast till varmast).", "alternativ": ["Mars", "Jorden", "Merkurius", "Venus"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Mars är kallast med en medeltemperatur långt under 0°C. Jorden är varmare. Merkurius solsida är mycket het men Venus är ändå varmare – runt 460°C – vilket gör Venus till den varmaste av dessa."},
    {"typ": "ordna", "svårighetsgrad": "lätt", "fråga": "Ordna dessa djur efter topphastighet (långsammast till snabbast).", "alternativ": ["Sengångare", "Elefant", "Struts", "Gepard"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Sengångaren rör sig i princip långsammast (några meter per minut). En elefant kan springa ca 25–40 km/h. En struts kan nå ca 70 km/h, medan geparden är snabbast med över 100 km/h."},
    {"typ": "ordna", "svårighetsgrad": "medel", "fråga": "Ordna dessa historiska personer efter födelseår (yngst till äldst).", "alternativ": ["Martin Luther King", "Mahatma Gandhi", "Jeanne d'Arc", "Kleopatra"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Martin Luther King (född 1929) är yngst, Mahatma Gandhi (1869) äldre, Jeanne d'Arc levde på 1400-talet och Kleopatra levde för över 2000 år sedan, vilket gör henne äldst i gruppen."},
    {"typ": "ordna", "svårighetsgrad": "lätt", "fråga": "Ordna dessa städer efter avstånd från Stockholm (närmast till längst bort).", "alternativ": ["Oslo", "Paris", "New York", "Tokyo"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Oslo ligger närmast Stockholm (ca 400 km därifrån). Paris är längre bort (~1500 km). New York är mycket längre bort (~6000 km) och Tokyo ligger allra längst från Stockholm (över 8000 km)."},
    {"typ": "ordna", "svårighetsgrad": "medel", "fråga": "Ordna dessa språk efter antal modersmålstalare (färst till flest).", "alternativ": ["Svenska", "Japanska", "Engelska", "Mandarin"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Svenska har omkring 10 miljoner modersmålstalare, japanska ca 125 miljoner, engelska runt 400 miljoner och mandarin-kinesiska nära 1 miljard – alltså flest talare."},
    {"typ": "ordna", "svårighetsgrad": "lätt", "fråga": "Ordna dessa krig efter längd (kortast till längst).", "alternativ": ["Sexdagarskriget", "Andra världskriget", "Trettioåriga kriget", "Hundraårskriget"], "rätt_ordning": ["A", "B", "C", "D"], "förklaring": "Sexdagarskriget 1967 varade bara några dagar. Andra världskriget 1939–45 varade ~6 år. Trettioåriga kriget 1618–48 varade ~30 år, och Hundraårskriget 1337–1453 pågick i över 100 år."},
    {"typ": "hör_till", "svårighetsgrad": "medel", "fråga": "Vilka av dessa romaner är skrivna av Jane Austen?", "kategori": "Jane Austen", "alternativ": ["Svindlande höjder", "Förnuft och känsla", "Jane Eyre", "Stolthet och fördom"], "tillhör_index": [1, 3], "förklaring": "Jane Austen skrev klassiker som \"Stolthet och fördom\" (1813) och \"Förnuft och känsla\" (1811). \"Jane Eyre\" skrevs av Charlotte Brontë och \"Svindlande höjder\" av Emily Brontë."},
    {"typ": "hör_till", "svårighetsgrad": "lätt", "fråga": "Vilka av dessa länder ligger i Sydamerika?", "kategori": "Sydamerika", "alternativ": ["Spanien", "Mexiko", "Brasilien", "Argentina"], "tillhör_index": [2, 3], "förklaring": "Brasilien och Argentina är sydamerikanska länder. Mexiko ligger i Nordamerika, och Spanien ligger i Europa."},
    {"typ": "hör_till", "svårighetsgrad": "medel", "fråga": "Vilka av dessa spel släpptes under 1990-talet?", "kategori": "1990-talet", "alternativ": ["The Sims", "Pac-Man", "Super Mario 64", "The Legend of Zelda: Ocarina of Time"], "tillhör_index": [2, 3], "förklaring": "\"Super Mario 64\" (1996) och \"The Legend of Zelda: Ocarina of Time\" (1998) kom under 90-talet. \"The Sims\" kom år 2000 och arkadklassikern \"Pac-Man\" redan 1980."},
    {"typ": "hör_till", "svårighetsgrad": "lätt", "fråga": "Vilka av dessa är filmgenrer?", "kategori": "Filmgenre", "alternativ": ["Sonett", "Symfoni", "Action", "Skräck"], "tillhör_index": [2, 3], "förklaring": "Skräck och action är filmgenrer. Sonett är en diktform och symfoni är ett musikaliskt verk, inte filmgenrer."},
    {"typ": "hör_till", "svårighetsgrad": "lätt", "fråga": "Vilka av dessa föremål är vanliga köksredskap?", "kategori": "Köksredskap", "alternativ": ["Visp", "Skruvmejsel", "Hammare", "Kavel"], "tillhör_index": [0, 3], "förklaring": "En visp och en kavel hör hemma i köket. En hammare och en skruvmejsel är verktyg för snickeri, inte matlagning."},
    {"typ": "hör_till", "svårighetsgrad": "medel", "fråga": "Vilka av dessa djur är däggdjur?", "kategori": "Däggdjur", "alternativ": ["Haj", "Blåval", "Pingvin", "Fladdermus"], "tillhör_index": [1, 3], "förklaring": "Blåvalen och fladdermusen är däggdjur (de diar sina ungar och andas luft). En pingvin är en fågel och en haj är en fisk – inga däggdjur."},
    {"typ": "hör_till", "svårighetsgrad": "svår", "fråga": "Vilka av dessa element är ädelgaser?", "kategori": "Ädelgaser", "alternativ": ["Neon", "Väte", "Kväve", "Helium"], "tillhör_index": [0, 3], "förklaring": "Helium och neon tillhör ädelgaserna – de är stabila och reagerar ogärna. Väte och kväve är visserligen gaser men räknas inte som ädelgaser."},
    {"typ": "hör_till", "svårighetsgrad": "lätt", "fråga": "Vilka av dessa figurer är grekiska gudar?", "kategori": "Grekiska gudar", "alternativ": ["Hera", "Mars", "Odin", "Zeus"], "tillhör_index": [0, 3], "förklaring": "Zeus och Hera är gudar i grekisk mytologi. Odin hör till nordisk mytologi och Mars är det romerska namnet på krigets gud (grekerna kallade honom Ares)."},
    {"typ": "hör_till", "svårighetsgrad": "lätt", "fråga": "Vilka av dessa superhjältar hör till Marvel-universumet?", "kategori": "Marvel", "alternativ": ["Hulken", "Iron Man", "Batman", "Wonder Woman"], "tillhör_index": [0, 1], "förklaring": "Iron Man och Hulken är Marvel-karaktärer. Wonder Woman och Batman tillhör konkurrenten DC Comics, inte Marvel."},
    {"typ": "hör_till", "svårighetsgrad": "svår", "fråga": "Vilka av dessa språk är officiella arbetsspråk i FN?", "kategori": "FN-språk", "alternativ": ["Arabiska", "Hindi", "Ryska", "Tyska"], "tillhör_index": [0, 2], "förklaring": "FN har sex officiella språk: arabiska, kinesiska, engelska, franska, ryska och spanska. Hindi och tyska är inte officiella FN-språk."},
    {"typ": "hör_till", "svårighetsgrad": "medel", "fråga": "Vilka av dessa IT-företag grundades på 1970-talet?", "kategori": "Grundade på 1970-talet", "alternativ": ["Apple", "Google", "Microsoft", "Amazon"], "tillhör_index": [0, 2], "förklaring": "Apple (1976) och Microsoft (1975) grundades på 1970-talet. Google grundades 1998 och Amazon 1994, alltså senare."},
    {"typ": "hör_till", "svårighetsgrad": "svår", "fråga": "Vilka av dessa internetfenomen blev populära under 2010-talet?", "kategori": "2010-talets internetfenomen", "alternativ": ["Harlem Shake", "Chocolate Rain", "Ice Bucket Challenge", "Rickrolling"], "tillhör_index": [0, 2], "förklaring": "Harlem Shake (2013) och Ice Bucket Challenge (2014) spreds viralt under 2010-talet. Rickrolling och \"Chocolate Rain\" är äldre nätfenomen från runt 2007–2008."},
    {"typ": "hör_till", "svårighetsgrad": "medel", "fråga": "Vilka av dessa är klassiska dödssynder?", "kategori": "Dödssynder", "alternativ": ["Högmod", "Feghet", "Girighet", "Sorg"], "tillhör_index": [0, 2], "förklaring": "Girighet och högmod är två av de sju dödssynderna enligt traditionen. Feghet och sorg räknas inte som dödssynder."},
    {"typ": "hör_till", "svårighetsgrad": "medel", "fråga": "Vilka av dessa länders flaggor innehåller färgen röd?", "kategori": "Röd i flaggan", "alternativ": ["Somalia", "Kanada", "Japan", "Sverige"], "tillhör_index": [1, 2], "förklaring": "Japans flagga har en röd sol och Kanadas flagga ett rött lönnlöv. Sveriges flagga är blå och gul, och Somalias flagga är blå med en vit stjärna – ingen av dem har rött."},
    {"typ": "hör_till", "svårighetsgrad": "lätt", "fråga": "Vilka av dessa sporter är olympiska sommargrenar?", "kategori": "Olympiska sporter", "alternativ": ["Tennis", "Cricket", "Schack", "Basket"], "tillhör_index": [0, 3], "förklaring": "Basket och tennis är sporter som ingår i sommar-OS program. Cricket och schack är däremot inte olympiska sportgrenar."}
];

const allQuestions = userQuestions.map((q, index) => {
    const packs = [
        "Historia", "Familjen Normal", "Filmfantasten", "Galaxhjärnan", "Boksmart och kultiverad",
        "Plugghästen", "Familjen Normal", "Gatesmart och depraverad", "Familjen Hurtig", "Galaxhjärnan",
        "Familjen Hurtig", "Historia", "Gatesmart och depraverad", "Plugghästen", "Historia",
        "Boksmart och kultiverad", "Plugghästen", "Nörden", "Filmfantasten", "Familjen Ullared",
        "Galaxhjärnan", "Plugghästen", "Historia", "Nörden", "Boksmart och kultiverad",
        "Boomer", "Boomer", "Gatesmart och depraverad", "Familjen Ullared", "Familjen Hurtig"
    ];
    return { ...q, pack: packs[index] || "Familjen Normal" };
});

const questionPacks = [
    { name: "Boomer", description: "Frågor om en tid då allt var bättre. Eller var det?" },
    { name: "Nörden", description: "För dig som kan din superhjälte och din C++." },
    { name: "Boksmart och kultiverad", description: "Testa dina kunskaper om finkultur och klassisk bildning." },
    { name: "Gatesmart och depraverad", description: "Frågor som inte lärs ut i skolan. Tur är väl det." },
    { name: "Filmfantasten", description: "Känner du igen repliken? Vet du vem som regisserade?" },
    { name: "Familjen Normal", description: "Lagom svåra frågor för en helt vanlig fredagskväll." },
    { name: "Familjen Hurtig", description: "Allt om sport, hälsa och att ständigt vara på språng." },
    { name: "Familjen Ullared", description: "Fynd, familjebråk och folkfest i Gekås-anda." },
    { name: "Plugghästen", description: "Geografins, kemins och grammatikens värld väntar." },
    { name: "Galaxhjärnan", description: "Stora frågor om universum, vetenskap och existens." },
    { name: "True Crime", description: "Gåtan, ledtrådarna och de ökända fallen." },
    { name: "Historia", description: "Från antiken till kalla kriget – testa ditt historieminne." },
];

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const startMain = document.getElementById('start-main');
const playerSetup = document.getElementById('player-setup');
const showPlayerSetupBtn = document.getElementById('show-player-setup-btn');
const playerCountSelect = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names-container');
const startGameBtn = document.getElementById('start-game-btn');
const challengeForm = document.getElementById('challenge-form');
const showChallengeFormBtn = document.getElementById('show-challenge-form-btn');
const sendChallengeBtn = document.getElementById('send-challenge-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const challengeConfirmation = document.getElementById('challenge-confirmation');

const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const restartBtn = document.getElementById('restart-btn');
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

// --- Game State ---
let players = [];
let currentPlayerIndex = 0;
let questionStarterIndex = 0;
let currentQuestionIndex = 0;
let questionsToPlay = [];
let userOrder = []; 
let selectedPacks = questionPacks.map(p => p.name);

// --- Functions ---

// NEW: Function to show point animation
function showPointAnimation(playerIndex, text, isBanked = false) {
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
        }, 1000); // Remove after animation ends
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

const processedQuestions = processQuestions(allQuestions);

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

function createPlayerInputs() {
    const count = playerCountSelect.value;
    playerNamesContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Spelare ${i + 1} namn`;
        input.className = 'player-name-input w-full p-3 border border-slate-300 rounded-lg text-base sm:text-lg';
        playerNamesContainer.appendChild(input);
    }
}

function initializeGame() {
    const nameInputs = document.querySelectorAll('.player-name-input');
    players = [];
    nameInputs.forEach((input, index) => {
        players.push({
            name: input.value || `Spelare ${index + 1}`,
            score: 0,
            roundPot: 0,
            eliminatedInRound: false,
            eliminationReason: null
        });
    });

    if (players.length < 2) {
        console.error("Minst två spelare behövs!");
        return;
    }

    if (selectedPacks.length === 0) {
        selectedPacks = questionPacks.map(p => p.name);
        populatePackShop();
    }
    questionsToPlay = processedQuestions.filter(q => selectedPacks.includes(q.pack));
    
    if (questionsToPlay.length === 0) {
        questionsToPlay = [...processedQuestions];
    }
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
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
    players.forEach(p => {
        p.roundPot = 0;
        p.eliminatedInRound = false;
        p.eliminationReason = null;
    });
    
    optionsGrid.innerHTML = '';
    
    if (currentQuestionIndex >= questionsToPlay.length) {
        endGame();
        return;
    }

    currentPlayerIndex = questionStarterIndex;
    updateScoreboard();
    updateGameControls();

    const question = questionsToPlay[currentQuestionIndex];
    
    questionCounter.textContent = `Fråga ${currentQuestionIndex + 1} / ${questionsToPlay.length}`;
    setDifficultyBadge(question.svårighetsgrad);
    questionText.textContent = question.fråga;
    
    const shuffledOptions = [...question.alternativ];
    shuffleArray(shuffledOptions);

    optionsGrid.className = 'grid grid-cols-1 gap-3 sm:gap-4 my-4 sm:my-6';

    if (question.typ === 'ordna') {
        questionInstruction.textContent = 'Klicka på alternativen i rätt ordning.';
        shuffledOptions.forEach(optionText => createOrderButton(optionText));
    } else { // 'hör_till'
        questionInstruction.textContent = 'Bedöm varje alternativ.';
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
    const question = questionsToPlay[currentQuestionIndex];
    const isCorrectStep = question.rätt_ordning[userOrder.length] === optionText;

    setAllOptionsDisabled(true);

    if (isCorrectStep) {
        userOrder.push(optionText);
        players[currentPlayerIndex].roundPot++;
        showPointAnimation(currentPlayerIndex, "+1"); // ANIMATION
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

function handleBelongsDecision(userDecision, container, yesBtn, noBtn) {
    const question = questionsToPlay[currentQuestionIndex];
    const optionText = container.querySelector('span').textContent;
    const correctOptions = question.tillhör_index.map(i => question.alternativ[i]);
    const actuallyBelongs = correctOptions.includes(optionText);
    const isCorrect = (userDecision === actuallyBelongs);

    yesBtn.disabled = true;
    noBtn.disabled = true;
    setAllOptionsDisabled(true);
    container.dataset.decided = 'true';

    const clickedBtn = userDecision ? yesBtn : noBtn;
    const otherBtn = userDecision ? noBtn : yesBtn;
    otherBtn.classList.add('deselected');

    let timeout = 1000;

    if (isCorrect) {
        players[currentPlayerIndex].roundPot++;
        showPointAnimation(currentPlayerIndex, "+1"); // ANIMATION
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

function playerStops() {
    const player = players[currentPlayerIndex];
    if (player.roundPot > 0) {
         showPointAnimation(currentPlayerIndex, `+${player.roundPot}p`, true); // ANIMATION for banking points
    }
    player.score += player.roundPot;
    player.roundPot = 0;
    player.eliminatedInRound = true;
    player.eliminationReason = 'stopped';
    updateScoreboard();
    nextTurn();
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
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startMain.classList.remove('hidden');
    playerSetup.classList.add('hidden');
}

// --- Pack Shop Functions ---
function populatePackShop() {
    packGrid.innerHTML = '';
    questionPacks.forEach(pack => {
        const card = document.createElement('div');
        card.className = 'pack-card cursor-pointer bg-slate-50 border-2 border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:bg-white flex flex-col justify-between';
        card.dataset.packName = pack.name;
        
        if (selectedPacks.includes(pack.name)) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <div>
                <div class="selected-check">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="font-bold text-lg text-slate-800 mb-1 pr-8">${pack.name}</h3>
                <p class="text-slate-600 text-sm leading-relaxed">${pack.description}</p>
            </div>
            <div class="mt-auto pt-3 border-t border-slate-200 text-right">
                <span class="font-bold text-blue-600 text-lg">GRATIS</span>
            </div>
        `;
        
        card.addEventListener('click', () => togglePackSelection(card, pack.name));
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

// Challenge form listeners
showChallengeFormBtn.addEventListener('click', () => {
    startMain.classList.add('hidden');
    challengeForm.classList.remove('hidden');
});

backToStartBtn.addEventListener('click', () => {
    challengeForm.classList.add('hidden');
    startMain.classList.remove('hidden');
    challengeConfirmation.classList.add('hidden');
});

sendChallengeBtn.addEventListener('click', () => {
     const emailInput = document.getElementById('friend-email');
     if (emailInput.value && emailInput.checkValidity()) {
         console.log(`Mockup: Skickar utmaning till ${emailInput.value}`);
         challengeConfirmation.classList.remove('hidden');
         emailInput.value = '';
         setTimeout(() => {
             challengeConfirmation.classList.add('hidden');
         }, 3000);
     } else {
         console.log("Invalid email for challenge.");
     }
});


// --- Initial Setup ---
populatePackShop();
createPlayerInputs();
updateScoreboard();