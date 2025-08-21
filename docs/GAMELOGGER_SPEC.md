# GameLogger System - Teknisk Specifikation

**Backlog ID:** BL-001  
**Kategori:** FEATURE  
**Prioritet:** KRITISK  

## Översikt

GameLogger är ett debug-system för att spåra och analysera modulkommunikation i Ordna Game. Systemet är designat för att hjälpa utvecklare förstå komplexa multiplayer-buggar genom att logga exakt vad som händer mellan moduler, när det händer, och varför.

## Problem som löses

### Huvudproblem:
- **Komplexa tillståndsövergångar** - Multiplayer med turordning skapar tusentals möjliga kombinationer
- **Timing-beroende buggar** - Asynkrona animationer och module-kommunikation
- **Svårigheter att reproducera** - Buggar som bara händer i specifika scenarion
- **Modul-kommunikation** - Svårt att förstå vilken modul som orsakar problem

### Specifika buggar:
- Multiplayer hör-till: Spelare 2 kan inte stanna efter spelare 1 elimineras
- Knappar som inte aktiveras vid rätt tidpunkt
- Poäng som inte delas ut korrekt
- UI-tillstånd som inte synkroniseras

## Teknisk Design

### Arkitektur

```
GameLogger (Central Hub)
├── ModuleWrapper - Wrapprar funktionsanrop automatiskt
├── StateTracker - Spårar tillståndsändringar  
├── CallStack - Spårar kedjan av modulanrop
├── TimingAnalyzer - Analyserar delays och race conditions
└── LogExporter - Exporterar loggar för analys
```

### Core Classes

#### GameLogger (Main Class)
```javascript
class GameLogger {
    constructor() {
        this.enabled = true;
        this.sessionId = Date.now();
        this.questionLog = null;
        this.moduleCallStack = [];
        this.stateSnapshots = [];
    }
    
    // Spåra modulanrop: [game.js] → [playerManager] nextTurn()
    logModuleCall(fromModule, toModule, method, params, result)
    
    // Spåra tillståndsändringar: activePlayer: "Anna" → "Bob" 
    logStateChange(module, stateName, oldValue, newValue)
    
    // Ta snapshot av hela spelläget vid kritiska punkter
    captureStateSnapshot(label)
    
    // Wrappa funktion för automatisk loggning
    wrapMethod(module, methodName, originalMethod)
    
    // Exportera loggar som JSON för analys
    exportSession()
}
```

#### ModuleWrapper
```javascript
class ModuleWrapper {
    // Wrappa alla kritiska funktioner i en modul
    static wrapModule(moduleName, moduleInstance, criticalMethods)
    
    // Automatiskt detektera funktioner att wrappa
    static autoWrap(moduleName, moduleInstance)
}
```

#### StateTracker  
```javascript
class StateTracker {
    // Spåra när variabler ändras
    trackVariable(module, varName, value)
    
    // Spåra DOM-ändringar
    trackDOMChange(element, change)
    
    // Jämför tillstånd mellan snapshots
    compareStates(snapshot1, snapshot2)
}
```

## Implementation Plan

### Fas 1: Grundsystem (BL-001a)
```javascript
// Minimal gameLogger.js implementation
- Grundläggande loggning av funktionsanrop
- Console output med färgkodning
- Wrapper för 3-5 kritiska funktioner per modul
```

### Fas 2: Modulintegration (BL-001b)
```javascript
// Integrera med alla moduler
game.js:
- handleOrderClick() / handleBelongsDecision()
- eliminateCurrentPlayer()
- determineNextAction()
- updateGameControls()

playerManager.js:
- nextTurn()
- addPointToCurrentPlayer() 
- isPlayerActive()
- hasActivePlayersInRound()

uiRenderer.js:
- setAllOptionsDisabled()
- updatePlayerDisplay()
- showStopButton() / hideStopButton()

animationEngine.js:
- showSecureAnimation()
- enableNextButtonAfterMistake()
- wakeUpStopButton()
```

### Fas 3: Avancerad analys (BL-001c)
```javascript
// Tillståndsanalys och export
- State snapshots vid kritiska punkter
- Automatisk bugdetektering
- Export till JSON för offline-analys
- Timeline-view av händelseförlopp
```

## Kritiska Loggpunkter

### För Multiplayer Hör-till Buggen:
```javascript
// När spelare elimineras:
GameLogger.logModuleCall('game', 'playerManager', 'eliminateCurrentPlayer', {
    player: 'Spelare1', 
    reason: 'incorrect_answer'
});

// När nästa spelare ska få sin tur:
GameLogger.logModuleCall('playerManager', 'game', 'determineNextAction', {
    activePlayers: ['Spelare2'],
    questionComplete: false
});

// När knappar ska aktiveras:
GameLogger.logModuleCall('game', 'uiRenderer', 'setAllOptionsDisabled', {
    disabled: false,
    reason: 'next_player_turn'
});

// State snapshot för debugging:
GameLogger.captureStateSnapshot('before_eliminate_player', {
    currentPlayer: 'Spelare1',
    activePlayers: ['Spelare1', 'Spelare2'],
    stopButtonEnabled: true,
    questionType: 'hör-till'
});
```

## Console Output Format

```javascript
// Färgkodad output i browser console:
🔵 [game.js→playerManager] nextTurn() → {newPlayer: "Bob", success: true}
🟢 [STATE] playerManager.currentPlayerIndex: 0 → 1  
🟣 [uiRenderer] setAllOptionsDisabled(false) → {buttonsEnabled: 4}
🔴 [ERROR] Expected stop button to be enabled, but found disabled
📸 [SNAPSHOT] multiplayer_turn_change: {players: [...], buttons: [...]}
```

## Filer som påverkas

### Nya filer:
- `js/gameLogger.js` - Huvudsystem
- `docs/GAMELOGGER_SPEC.md` - Denna spec (✓)

### Modifierade filer:
- `index.html` - Lägg till gameLogger.js script (först!)
- `js/game.js` - Wrappa 4-5 kritiska funktioner  
- `js/playerManager.js` - Wrappa 4-5 kritiska funktioner
- `js/uiRenderer.js` - Wrappa 3-4 kritiska funktioner
- `js/animationEngine.js` - Wrappa 2-3 kritiska funktioner

## Acceptanskriterier

### BL-001a: Grundsystem
- [ ] GameLogger class implementerad
- [ ] Fungerar i browser console med färgkodning
- [ ] Kan wrappa minst 3 funktioner per modul
- [ ] Loggar modulanrop: `[från] → [till] funktion()`

### BL-001b: Modulintegration  
- [ ] Alla kritiska funktioner i game.js loggade
- [ ] Alla kritiska funktioner i playerManager.js loggade
- [ ] Alla kritiska funktioner i uiRenderer.js loggade
- [ ] Multiplayer-buggen synlig i loggarna

### BL-001c: Avancerad analys
- [ ] State snapshots fungerar
- [ ] Export till JSON fungerar  
- [ ] Kan identifiera timing-problem
- [ ] Kan identifiera race conditions

## Prestandaimpact

- **Utveckling:** Alltid aktiverat för debugging
- **Produktion:** Kan stängas av via `GameLogger.enabled = false`
- **Minnesfotavtryck:** ~1-2MB för en hel spelsession
- **CPU-påverkan:** Minimal (< 1% overhead)

## Användning

### För utvecklare:
```javascript
// Aktivera extra verbose logging för specific bug
GameLogger.setVerbose(true);
GameLogger.focusOn(['playerManager', 'uiRenderer']);

// Exportera session för analys
const logs = GameLogger.exportSession();
console.log('Session logs:', logs);

// Ta manuell snapshot
GameLogger.captureStateSnapshot('before_problematic_action');
```

### För bug reports:
```javascript
// När bugg upptäcks, exportera loggar:
GameLogger.exportForBugReport('multiplayer-hoer-till-bug');
// Skapar downloadbar JSON-fil med relevant data
```

## Framtida Utbyggnad

### Möjliga förbättringar:
- **Visual Timeline** - Grafisk vy av händelseförlopp
- **Automatisk Regression Detection** - Upptäck när buggar återkommer
- **Performance Profiling** - Identifiera långsamma operationer  
- **A/B Testing Support** - Jämför olika implementationer
- **Remote Logging** - Skicka loggar till utvecklingsteam

---

*Skapad: 2025-08-21*  
*Uppdaterad: 2025-08-21*