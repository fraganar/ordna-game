// Game Data Module - Handles question packs and data loading

class GameData {
    constructor() {
        this.allQuestions = [];
        this.packMetadata = {};
        this.availablePacks = [];
        this.dataPath = '/data/';
    }
    
    // Initialize and load all question data
    async initialize() {
        console.log('Loading pack metadata from JSON files...');
        
        // Define available packs with their JSON files
        const packFiles = [
            { name: 'Grund', file: 'questions-grund.json' },
            { name: 'Boomer', file: 'questions-boomer.json' },
            { name: 'Blandat 1', file: 'questions-blandat1.json' },
            { name: 'Blandat med B', file: 'questions-blandat-med-b.json' },
            { name: 'Ganska lätt', file: 'questions-ganska-latt.json' }
        ];
        
        // Load all packs
        for (const pack of packFiles) {
            await this.loadPack(pack.name, pack.file);
        }
        
        // Add "Alla" option for all questions
        if (this.allQuestions.length > 0) {
            this.packMetadata['Alla'] = {
                displayName: 'Alla frågor',
                questionCount: this.allQuestions.length,
                difficulty: 'blandad',
                theme: 'allmän'
            };
        }
        
        console.log(`Loaded ${this.allQuestions.length} total questions across ${Object.keys(this.packMetadata).length} packs`);
    }
    
    // Load a single pack
    async loadPack(packName, fileName) {
        try {
            const response = await fetch(this.dataPath + fileName);
            if (!response.ok) {
                console.warn(`Could not load pack ${packName} from ${fileName}`);
                return;
            }
            
            const data = await response.json();
            
            // Handle both old format (direct questions array) and new format (with metadata)
            let questions = [];
            let metadata = {};
            
            if (Array.isArray(data)) {
                // Old format - just questions
                questions = data;
                metadata = {
                    displayName: packName,
                    questionCount: questions.length,
                    difficulty: 'blandad',
                    theme: 'allmän'
                };
            } else {
                // New format with metadata
                questions = data.questions || [];
                metadata = {
                    displayName: data.displayName || packName,
                    questionCount: questions.length,
                    difficulty: data.difficulty || 'blandad',
                    theme: data.theme || 'allmän',
                    description: data.description
                };
            }
            
            // Add pack identifier to each question
            questions.forEach(q => {
                q.pack = packName;
            });
            
            // Add to collections
            this.allQuestions.push(...questions);
            this.packMetadata[packName] = metadata;
            
            console.log(`Updated metadata for pack: ${packName}`);
            
        } catch (error) {
            console.error(`Failed to load pack ${packName}:`, error);
        }
    }
    
    // Get questions for a specific pack
    getQuestionsForPack(packName) {
        if (packName === 'Alla' || !packName) {
            return [...this.allQuestions];
        }
        
        return this.allQuestions.filter(q => q.pack === packName);
    }
    
    // Get random questions for challenge mode
    getRandomQuestions(count = 5, packName = null) {
        const availableQuestions = packName 
            ? this.getQuestionsForPack(packName)
            : this.allQuestions;
        
        // Shuffle and take first N questions
        const shuffled = this.shuffleArray(availableQuestions);
        return shuffled.slice(0, count);
    }
    
    // Populate pack selector dropdowns
    populatePackSelectors() {
        const packSelect = UI?.get('packSelect');
        const challengePackSelect = UI?.get('challengePackSelect');
        
        // Clear existing options
        if (packSelect) packSelect.innerHTML = '';
        if (challengePackSelect) challengePackSelect.innerHTML = '';
        
        // Add packs to selectors
        Object.entries(this.packMetadata).forEach(([packId, metadata]) => {
            const option = document.createElement('option');
            option.value = packId;
            option.textContent = `${metadata.displayName} (${metadata.questionCount} frågor)`;
            
            // Add to both selectors
            if (packSelect) packSelect.appendChild(option.cloneNode(true));
            if (challengePackSelect) challengePackSelect.appendChild(option.cloneNode(true));
        });
        
        // Set default selection
        if (packSelect && packSelect.options.length > 0) {
            // Try to select "Blandat med B" or fall back to first option
            const defaultPack = Array.from(packSelect.options).find(opt => opt.value === 'Blandat med B');
            if (defaultPack) {
                packSelect.value = 'Blandat med B';
            } else {
                packSelect.selectedIndex = 0;
            }
        }
        
        if (challengePackSelect && challengePackSelect.options.length > 0) {
            const defaultPack = Array.from(challengePackSelect.options).find(opt => opt.value === 'Blandat med B');
            if (defaultPack) {
                challengePackSelect.value = 'Blandat med B';
            } else {
                challengePackSelect.selectedIndex = 0;
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