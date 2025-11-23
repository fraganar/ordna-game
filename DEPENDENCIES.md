# Global Dependencies - Ordna Game

## Syfte
Detta dokument kartlägger alla globala funktioner och beroenden mellan moduler för att förhindra framtida buggar som BL-002 där funktioner förväntas vara globalt tillgängliga men inte exponeras korrekt.

## Globala Funktioner Exponerade från game.js

### För eventHandlers.js
Dessa funktioner MÅSTE finnas som `window.functionName` för att event listeners ska fungera:

```javascript
// Exponerade i game.js rad ~1671-1681
window.playerStops = playerStops;          // KRITISK för BL-002 fix
window.showPlayerSetup = showPlayerSetup;
window.createPlayerInputs = createPlayerInputs;
window.initializeGame = initializeGame;
window.restartGame = restartGame;
window.loadQuestion = loadQuestion;
window.openPackShop = openPackShop;
window.closePackShop = closePackShop;
window.startChallengeGame = startChallengeGame;
```

### För playerManager.js
```javascript
// Exponerade i game.js rad ~1680
window.updateGameControls = updateGameControls;  // KRITISK för BL-002: UI-tillståndshantering vid spelarbyte
```

### För gameController.js
```javascript
// Exponerade i game.js rad ~1667-1668
window.handleOrderClick = handleOrderClick;
window.handleBelongsDecision = handleBelongsDecision;
```

## Modelberoenden

### Globala Moduler (window.ModuleName)
Dessa moduler MÅSTE finnas globalt för korsreferenser:

- **window.PlayerManager** - Spelarhantering, poäng, lägen
- **window.GameData** - Frågeinläsning, pakethantering
- **window.GameController** - Spellogik, rendering
- **window.UI** - DOM-manipulation, skärmhantering
- **window.AnimationEngine** - Poänganimationer
- **window.ChallengeSystem** - Utmaningssystem
- **window.FirebaseAPI** - Firebase-kommunikation

### Globala Variabler
```javascript
window.currentQuestionIndex = 0;     // Synkroniserad mellan moduler
window.challengeId = null;           // Challenge-system
window.ischallengeMode = false;      // Challenge-läge flagga
```

## Event Handler Dependencies

### Modul-specifika globala beroenden:

#### eventHandlers.js använder dessa globala funktioner:
| Funktion | Används av | Syfte |
|----------|------------|-------|
| `playerStops` | stopBtn, stopSide listeners | Spelare väljer att stanna och säkra poäng |
| `showPlayerSetup` | showPlayerSetupBtn | Visa spelarnamn-setup |
| `createPlayerInputs` | playerCountSelect change | Skapa spelarinput-fält |
| `initializeGame` | startGameBtn | Starta nytt spel |
| `restartGame` | restartBtn | Starta om spelet |
| `loadQuestion` | nextSide, nextQuestionBtn | Ladda nästa fråga |
| `openPackShop` | openPackShopBtn | Öppna paketshop |
| `closePackShop` | closePackShopBtn, confirmPacksBtn | Stäng paketshop |
| `startChallengeGame` | acceptChallengeBtn context | Starta challenge efter accept |

#### playerManager.js använder dessa globala funktioner:
| Funktion | Används av | Syfte |
|----------|------------|-------|
| `updateGameControls` | nextTurn() rad 284 | **KRITISK för BL-002**: Uppdaterar UI-tillstånd vid spelarbyte |

## Startup Validation

En validator i `app.js:validateDependencies()` kontrollerar vid uppstart att alla nödvändiga funktioner finns. Denna körs automatiskt och loggar varningar för saknade beroenden.

```javascript
// Exempel konsol-output vid lyckad validering:
// ✅ All required global functions are available
// Available modules: ['PlayerManager', 'GameData', 'UI', ...]

// Exempel vid fel:
// 🚨 CRITICAL: Missing required global functions: ['playerStops']
```

## Historik och Lärdomar

### BL-002: Multiplayer Hör-till Bugg (KOMPLETT ANALYS - 7 FÖRSÖK)
- **Analys #1-6 (fel):** Trodde det var globala funktioner, script loading, race conditions
- **Analys #7 (VERKLIG rotorsak):** **AnimationEngine setTimeout konflikt med PlayerManager state changes**
- **Symptom:** Spelare kunde inte klicka "Stanna" efter att annan spelare eliminerats
- **Teknisk rotorsakskedja (SLUTGILTIG):** 
  - Player elimineras → `AnimationEngine.enableNextButtonAfterMistake()` anropas
  - AnimationEngine sätter setTimeout för att disabla knapp EFTER animation
  - Men PlayerManager.nextTurn() sker parallellt → updateGameControls() kallas
  - AnimationEngine setTimeout triggar EFTER spelarbyte → disablar knapp för ny spelare
- **SLUTGILTIG lösning (2025-08-22):** 
  - ✅ **Animation Callback Pattern**: `enableNextButtonAfterMistake(points, onComplete)`
  - ✅ **Sequential Flow**: Elimination → Animation → Callback → State Change → UI Update
  - ✅ **Visual Feedback First**: Knapp blir grå omedelbart, grön efter spelarbyte
  - ✅ **Eliminerar timing conflicts**: Inga parallella setTimeout, allt sekventiellt

### Förebyggande Åtgärder
1. **Startup validator** kontrollerar alla beroenden vid uppstart
2. **Detta dokument** kartlägger alla globala beroenden
3. **Klar separation** mellan moduler och globala exponeringar
4. **Animation Callback Pattern** förhindrar timing conflicts mellan animationer och state changes

## Animation Coordination Architecture
*Utvecklad under BL-002 fix och UX-förbättringar.*

### Callback-baserade Animationer
```javascript
// NYTT PATTERN: Animationer med completion callbacks
AnimationEngine.enableNextButtonAfterMistake(pointsToLose, onComplete)
AnimationEngine.showSecureAnimation(points, onComplete)  // Framtida utbyggnad
```

### UX Timing Coordination Principles
1. **Visual Feedback First**: Disable buttons immediately för omedelbar feedback
2. **Sequential Flow**: Animation → Callback → State Change → UI Update
3. **No Parallel setTimeout**: Undvik parallella timers, använd callbacks
4. **State Protection**: Animationer får inte störa state changes

### Implementation Pattern
```javascript
function eliminateCurrentPlayer() {
    // 1. Update state immediately
    completePlayerRound(currentPlayer, 'wrong', 0);
    
    // 2. Visual feedback first (gray button)
    // 3. Animation with callback
    AnimationEngine.enableNextButtonAfterMistake(pointsToLose, () => {
        // 4. State change AFTER animation
        determineNextAction(); // → PlayerManager.nextTurn() → updateGameControls()
    });
}
```

### Animation Dependencies (Nya sedan BL-002 fix)
- `eliminateCurrentPlayer()` → `AnimationEngine.enableNextButtonAfterMistake(points, callback)`
- `callback` → `determineNextAction()` → `PlayerManager.nextTurn()` → `updateGameControls()`
- **Kritiskt**: UI state changes måste vänta på animation completion

## Timeout Management Pattern
*Utvecklad för att lösa orphaned timeout race conditions (BL-018, 2025-11-23)*

### Problem
setTimeout callbacks från gamla questions fortsatte köra på nya questions, vilket skapade race conditions:
- Facit visades innan spelaren svarat
- Alternativ var pre-markerade vid laddning
- Intermittent beteende på olika frågetyper

### Lösning: Timeout Registry (game.js)
Alla setTimeout i game.js wrappas med `registerTimeout()` och rensas i `loadQuestion()`.

### Scope Decision
**ENDAST game.js använder detta pattern**

Varför INTE andra moduler:
- **animationEngine.js**: Timeouts är för UI-animationer (slutförs innan loadQuestion() kan anropas)
- **playerManager.js**: Timeouts är state transitions som MÅSTE slutföras (nextTurn, concludeQuestion)
- Att rensa dessa skulle skapa buggar, inte förhindra dem

Se [game.js:16-32](js/game.js) för implementation och detaljerad kommentar.

## Underhåll

### När du lägger till ny funktionalitet:
1. **Ny event listener i eventHandlers.js?** → Exponera funktionen globalt i game.js
2. **Ny modul som andra moduler ska använda?** → Lägg till i startup validator
3. **Ändrar global funktion?** → Uppdatera detta dokument
4. **Ny animation som påverkar state?** → Använd callback pattern, dokumentera i Animation Dependencies

### När du refaktorerar:
1. **Flyttar funktioner mellan moduler?** → Uppdatera globala exponeringar
2. **Tar bort funktioner?** → Ta bort från startup validator och detta dokument
3. **Ändrar animation timing?** → Verifiera callback coordination fungerar
4. **Testar alltid** startup validator efter ändringar

### Animation Coordination Guidelines:
1. **Nya animationer**: Lägg till optional `onComplete` parameter om de påverkar game state
2. **State changes under animation**: Använd callbacks, aldrig parallella setTimeout
3. **Visual feedback**: Disable UI immediately, re-enable via callback efter state change
4. **Testing**: Testa elimination scenarios i både single och multiplayer

---

*Senast uppdaterad: 2025-11-23 (efter Timeout Management Pattern tillägg)*