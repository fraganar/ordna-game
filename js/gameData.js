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
    
    // Populate pack selector dropdowns - loads from packs.json
    async populatePackSelectors() {
        // Use direct DOM access since UI might not be ready yet
        const packSelect = document.getElementById('pack-select');
        const challengePackSelect = document.getElementById('challenge-pack-select');

        try {
            // Load packs from packs.json
            const packs = await this.loadAvailablePacks();

            // Clear existing options
            if (packSelect) packSelect.innerHTML = '';
            if (challengePackSelect) challengePackSelect.innerHTML = '';

            // Add packs to selectors
            packs.forEach(pack => {
                const option = document.createElement('option');
                option.value = pack.id;  // Use ID for tracking, not name
                option.textContent = pack.name;  // Display name to user

                // Add to both selectors
                if (packSelect) {
                    packSelect.appendChild(option.cloneNode(true));
                }
                if (challengePackSelect) {
                    challengePackSelect.appendChild(option.cloneNode(true));
                }
            });

            // Set default selection to first pack
            if (packSelect && packs.length > 0) {
                packSelect.value = packs[0].id;
            }
            if (challengePackSelect && packs.length > 0) {
                challengePackSelect.value = packs[0].id;
            }

        } catch (error) {
            console.error('GameData: Kunde inte populera paketväljare:', error);

            // Show error in dropdowns
            const errorOption = document.createElement('option');
            errorOption.value = '';
            errorOption.textContent = '❌ Kunde inte ladda frågepaket';
            errorOption.disabled = true;
            errorOption.selected = true;

            if (packSelect) {
                packSelect.innerHTML = '';
                packSelect.appendChild(errorOption.cloneNode(true));
            }
            if (challengePackSelect) {
                challengePackSelect.innerHTML = '';
                challengePackSelect.appendChild(errorOption.cloneNode(true));
            }
        }
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