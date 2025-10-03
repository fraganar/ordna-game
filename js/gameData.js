// Game Data Module - Handles question packs and data loading

class GameData {
    constructor() {
        this.allQuestions = [];
        this.packMetadata = {};
        this.availablePacks = [];
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
    
    // Load questions for game - MOVED FROM game.js (this is the working implementation)
    async loadQuestionsForGame(selectedPack) {
        if (selectedPack && selectedPack !== 'Alla') {
            // Load specific pack
            const packQuestions = await this.loadPackQuestions(selectedPack);
            if (packQuestions.length > 0) {
                // Update global variables for compatibility
                window.allQuestions = packQuestions;
                return packQuestions;
            }
            // Fallback if pack loading fails
            console.warn(`GameData: Failed to load pack "${selectedPack}", falling back to default questions`);
        }

        // Load default questions or 'Alla'
        const allQuestions = await this.loadDefaultQuestions();
        window.allQuestions = allQuestions;
        return allQuestions;
    }
    
    // Load questions from a specific pack - MOVED FROM game.js
    async loadPackQuestions(packName) {
        const pack = this.getPackConfig(packName);
        
        if (!pack || !pack.file) {
            console.warn(`GameData: Pack "${packName}" not available or has no file`);
            return [];
        }
        
        try {
            const response = await fetch(`${this.dataPath}${pack.file}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            let questions = Array.isArray(data) ? data : (data.questions || []);
            
            // Add pack identifier to each question
            questions = questions.map(q => ({
                ...q,
                pack: data.name || packName
            }));
            
            return questions;
        } catch (error) {
            console.error(`GameData: Failed to load pack "${packName}":`, error);
            return [];
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
    
    // Helper to get pack configuration
    getPackConfig(packName) {
        const packConfigs = [
            { name: "Frågepaket 1", file: "fragepaket-1.json" },
            { name: "Frågepaket 2", file: "fragepaket-2.json" },
            { name: "Frågepaket 3", file: "fragepaket-3.json" },
            { name: "Frågepaket 4", file: "fragepaket-4.json" },
            { name: "Frågepaket 5", file: "fragepaket-5.json" },
            { name: "Frågepaket 6", file: "fragepaket-6.json" }
        ];
        
        return packConfigs.find(p => p.name === packName);
    }
    
    // Populate pack selector dropdowns - simplified for on-demand loading
    populatePackSelectors() {
        // Use direct DOM access since UI might not be ready yet
        const packSelect = document.getElementById('pack-select');
        const challengePackSelect = document.getElementById('challenge-pack-select');
        
        // Define available packs (same as getPackConfig)
        const packConfigs = [
            { name: "Frågepaket 1", displayName: "Frågepaket 1" },
            { name: "Frågepaket 2", displayName: "Frågepaket 2" },
            { name: "Frågepaket 3", displayName: "Frågepaket 3" },
            { name: "Frågepaket 4", displayName: "Frågepaket 4" },
            { name: "Frågepaket 5", displayName: "Frågepaket 5" },
            { name: "Frågepaket 6", displayName: "Frågepaket 6" },
            { name: "Alla", displayName: "Alla frågor" }
        ];
        
        // Clear existing options
        if (packSelect) packSelect.innerHTML = '';
        if (challengePackSelect) challengePackSelect.innerHTML = '';
        
        // Add packs to selectors
        packConfigs.forEach(pack => {
            const option = document.createElement('option');
            option.value = pack.name;
            option.textContent = pack.displayName;
            
            // Add to both selectors
            if (packSelect) {
                packSelect.appendChild(option.cloneNode(true));
            }
            if (challengePackSelect) {
                challengePackSelect.appendChild(option.cloneNode(true));
            }
        });
        
        // Set default selection to "Frågepaket 1"
        if (packSelect) packSelect.value = 'Frågepaket 1';
        if (challengePackSelect) challengePackSelect.value = 'Frågepaket 1';
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