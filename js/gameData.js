// Game Data Module - Handles question packs and data loading

class GameData {
    constructor() {
        this.allQuestions = [];
        this.packMetadata = {};
        this.availablePacks = [];
        this.cachedPacks = null; // Cache for packs.json
        this.dataPath = '/data/';
    }
    
    // REMOVED: initialize() - replaced by on-demand loading (loadQuestionsForGame)
    
    // REMOVED: loadPack() - replaced by on-demand loading (loadPackQuestions)
    
    // REMOVED: getQuestionsForPack() - replaced by loadQuestionsForGame() which loads on-demand
    
    // Get random questions for challenge mode - updated to use on-demand loading
    async getRandomQuestions(count = 5, packName = null) {
        const availableQuestions = await this.loadQuestionsForGame(packName);
        
        // Shuffle and take first N questions
        const shuffled = this.shuffleArray(availableQuestions);
        return shuffled.slice(0, count);
    }
    
    // Load questions for game - throws error instead of silent fallback
    async loadQuestionsForGame(selectedPack) {
        if (selectedPack) {
            // Load specific pack - will throw error if it fails
            const packQuestions = await this.loadPackQuestions(selectedPack);
            // Update global variables for compatibility
            window.allQuestions = packQuestions;
            return packQuestions;
        }

        // Load default questions (only if no pack selected)
        const allQuestions = await this.loadDefaultQuestions();
        window.allQuestions = allQuestions;
        return allQuestions;
    }
    
    // Load questions from a specific pack - throws detailed errors instead of returning empty array
    async loadPackQuestions(packName) {
        const pack = await this.getPackConfig(packName);

        if (!pack) {
            throw new Error(`Frågepaket "${packName}" hittades inte i listan. Kontakta admin.`);
        }

        try {
            // Use pack.id as the filename (already includes .json)
            const response = await fetch(`${this.dataPath}${pack.id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Filen för "${packName}" hittades inte (${pack.id}). Kontakta admin.`);
                }
                throw new Error(`Kunde inte ladda "${packName}" (HTTP ${response.status})`);
            }

            const data = await response.json();
            let questions = Array.isArray(data) ? data : (data.questions || []);

            if (!questions || questions.length === 0) {
                throw new Error(`"${packName}" innehåller inga frågor.`);
            }

            // Add pack identifier to each question
            questions = questions.map(q => ({
                ...q,
                pack: pack.name || packName
            }));

            return questions;
        } catch (error) {
            // If it's a SyntaxError (JSON parsing failed), provide helpful message
            if (error instanceof SyntaxError) {
                throw new Error(`"${packName}" har ett formatfel i JSON-filen. Kontakta admin.\n\nTeknisk info: ${error.message}`);
            }
            // Re-throw our custom errors or network errors
            throw error;
        }
    }
    
    // Load default questions - MOVED FROM game.js
    async loadDefaultQuestions() {
        try {
            const response = await fetch(`${this.dataPath}fragepaket-1.json`);
            const data = await response.json();
            
            let questions = Array.isArray(data) ? data : (data.questions || []);
            
            // Add pack identifiers
            questions = questions.map((q, index) => ({
                ...q,
                pack: data.packs ? data.packs[index] : "Frågepaket 1"
            }));
            
            return questions;
        } catch (error) {
            console.error('GameData: Failed to load default questions:', error);
            return [];
        }
    }
    
    // Load available packs from packs.json
    async loadAvailablePacks() {
        if (this.cachedPacks) {
            return this.cachedPacks;
        }

        try {
            const response = await fetch(`${this.dataPath}packs.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const packs = await response.json();
            this.cachedPacks = packs;
            return packs;
        } catch (error) {
            console.error('GameData: Failed to load packs.json:', error);
            throw new Error('Kunde inte ladda frågepaket. Kontrollera att /data/packs.json finns.');
        }
    }

    // Helper to get pack configuration by ID
    async getPackConfig(packId) {
        const packs = await this.loadAvailablePacks();
        return packs.find(p => p.id === packId);
    }
    
    // Populate pack selector grids - loads from packs.json and Firebase
    async populatePackSelectors() {
        // Use direct DOM access since UI might not be ready yet
        const packSelect = document.getElementById('pack-select');
        const challengePackSelect = document.getElementById('challenge-pack-select');

        try {
            // Load packs from packs.json
            let packs = await this.loadAvailablePacks();

            // Load played packs from Firebase
            let playedPackIds = [];
            try {
                const playerId = window.getCurrentPlayerId?.();
                if (playerId && window.FirebaseAPI) {
                    const playedPacksData = await window.FirebaseAPI.getPlayedPacks(playerId);
                    playedPackIds = Object.keys(playedPacksData); // ['antiken.json', 'blandat-1.json', ...]
                    console.log('GameData: Loaded played packs from Firebase:', playedPackIds.length);
                }
            } catch (firebaseError) {
                console.error('GameData: Failed to load played packs from Firebase:', firebaseError);
                // Show user-friendly notification
                if (window.showToast) {
                    window.showToast('⚠️ Kunde inte ladda spelhistorik från servern', 'info', 3000);
                }
                // Continue with empty playedPackIds (all packs shown as unplayed in demo mode)
            }

            // Sort packs by played status (using Firebase data)
            packs = this.sortPacksByPlayedStatus(packs, playedPackIds);

            // Clear existing content
            if (packSelect) packSelect.innerHTML = '';
            if (challengePackSelect) challengePackSelect.innerHTML = '';

            // Set first pack as selected by default
            let selectedPackId = packs.length > 0 ? packs[0].id : null;

            // Track if we need a separator
            const unplayedCount = packs.filter(p => !playedPackIds.includes(p.id)).length;
            const playedCount = packs.length - unplayedCount;
            let separatorAdded = false;

            // Setup event delegation (once per container) to prevent memory leaks
            // Use element property (not dataset) so flag is lost if element replaced
            if (packSelect && !packSelect._packSelectorListener) {
                packSelect.addEventListener('click', (e) => {
                    const card = e.target.closest('.pack-card');
                    if (card && card.dataset.packId) {
                        this.selectPack('pack-select', card.dataset.packId);
                    }
                });
                packSelect._packSelectorListener = true;
            }
            if (challengePackSelect && !challengePackSelect._packSelectorListener) {
                challengePackSelect.addEventListener('click', (e) => {
                    const card = e.target.closest('.pack-card');
                    if (card && card.dataset.packId) {
                        this.selectPack('challenge-pack-select', card.dataset.packId);
                    }
                });
                challengePackSelect._packSelectorListener = true;
            }

            // Add packs as cards (without individual event listeners - delegation handles clicks)
            packs.forEach((pack, index) => {
                const isPlayed = playedPackIds.includes(pack.id);
                const isSelected = pack.id === selectedPackId;

                // Add separator before first played pack
                if (isPlayed && !separatorAdded && playedCount > 0 && unplayedCount > 0) {
                    const separator = this.createPackSeparator();
                    if (packSelect) packSelect.appendChild(separator);
                    if (challengePackSelect) challengePackSelect.appendChild(separator.cloneNode(true));
                    separatorAdded = true;
                }

                const card = this.createPackCard(pack, isPlayed, isSelected);

                // Add to both selectors (no event listeners attached - delegation handles it)
                if (packSelect) {
                    packSelect.appendChild(card);
                }
                if (challengePackSelect) {
                    challengePackSelect.appendChild(card.cloneNode(true));
                }
            });

            // Store selected pack for both containers
            if (packSelect && selectedPackId) {
                packSelect.dataset.selectedPack = selectedPackId;
            }
            if (challengePackSelect && selectedPackId) {
                challengePackSelect.dataset.selectedPack = selectedPackId;
            }

        } catch (error) {
            console.error('GameData: Kunde inte populera paketväljare:', error);

            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-danger-dark text-center p-4 bg-red-50 rounded-lg border border-red-200';
            errorMsg.textContent = '❌ Kunde inte ladda frågepaket';

            if (packSelect) {
                packSelect.innerHTML = '';
                packSelect.appendChild(errorMsg.cloneNode(true));
            }
            if (challengePackSelect) {
                challengePackSelect.innerHTML = '';
                challengePackSelect.appendChild(errorMsg.cloneNode(true));
            }
        }
    }

    // Create a visual pack card
    createPackCard(pack, isPlayed, isSelected) {
        const card = document.createElement('div');
        card.className = 'pack-card';
        card.dataset.packId = pack.id;

        if (isPlayed) card.classList.add('played');
        if (isSelected) card.classList.add('selected');

        card.innerHTML = `
            <div class="pack-card-header">
                <span class="pack-card-name">${pack.name}</span>
                ${isPlayed ? '<span class="pack-card-badge">✓</span>' : ''}
            </div>
            <p class="pack-card-description">${pack.description}</p>
        `;

        return card;
    }

    // Create separator between unplayed and played packs
    createPackSeparator() {
        const separator = document.createElement('div');
        separator.className = 'pack-separator';
        separator.innerHTML = '<span>Tidigare spelade</span>';
        return separator;
    }

    // Select a pack (click handler)
    selectPack(containerId, packId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Update visual selection
        container.querySelectorAll('.pack-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.packId === packId) {
                card.classList.add('selected');
            }
        });

        // Store selected pack
        container.dataset.selectedPack = packId;
    }

    // Get selected pack from container
    getSelectedPack(containerId) {
        const container = document.getElementById(containerId);
        return container?.dataset.selectedPack || null;
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

    // Sort packs: unplayed first, then played (both by order)
    // Uses playedPackIds array from Firebase (e.g., ['antiken.json', 'blandat-1.json'])
    sortPacksByPlayedStatus(packs, playedPackIds = []) {
        const unplayed = packs.filter(p => !playedPackIds.includes(p.id));
        const played = packs.filter(p => playedPackIds.includes(p.id));

        // Sort each group by order field
        unplayed.sort((a, b) => (a.order || 0) - (b.order || 0));
        played.sort((a, b) => (a.order || 0) - (b.order || 0));

        return [...unplayed, ...played];
    }
}

// Create global instance and make methods accessible
const gameDataInstance = new GameData();

// Copy methods to the instance to make them accessible
Object.getOwnPropertyNames(GameData.prototype).forEach(name => {
    if (name !== 'constructor' && typeof GameData.prototype[name] === 'function') {
        gameDataInstance[name] = GameData.prototype[name].bind(gameDataInstance);
    }
});

window.GameData = gameDataInstance;