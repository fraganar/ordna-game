# Global Dependencies - Ordna Game

## Syfte
Detta dokument kartlägger alla globala funktioner och beroenden mellan moduler för att förhindra framtida buggar som BL-002 där funktioner förväntas vara globalt tillgängliga men inte exponeras korrekt.

## Globala Funktioner Exponerade från game.js

### För eventHandlers.js
Dessa funktioner MÅSTE finnas som `window.functionName` för att event listeners ska fungera:

```javascript
// Exponerade i game.js rad ~1656-1665
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
// Exponerade i game.js rad ~1665
window.updateGameControls = updateGameControls;  // KRITISK för BL-002: UI-tillståndshantering vid spelarbyte
```

### För gameController.js
```javascript
// Exponerade i game.js rad ~1652-1653
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

### BL-002: Multiplayer Hör-till Bugg  
- **Analys #1 (fel):** Trodde det handlade bara om `playerStops` exponering
- **Analys #2 (fel):** Trodde det var `updateGameControls` exponering  
- **VERKLIG rotorsak:** **Script loading race condition** + **UI-objektet inte tillgängligt**
- **Symptom:** Spelare kunde inte klicka "Stanna" efter att annan spelare eliminerats
- **Teknisk förklaring:** 
  - `uiRenderer.js` laddades utan `defer`, andra scripts med `defer`
  - Race condition: `app.js` körde innan `UI` var etablerat
  - PlayerManager.nextTurn() → updateGameControls() → `UI?.configureStopButtonForMultiplayer()` 
  - Men `UI` var `undefined` → "tyst" misslyckande → knappen uppdaterades aldrig
- **DEFINITIV lösning:** 
  - ✅ Lagt till `defer` på uiRenderer.js script-tag
  - ✅ Lagt till UI-tillgänglighets guard i updateGameControls() 
  - ✅ Exponerat alla nödvändiga funktioner globalt
  - ✅ Race condition protection med retry-logik

### Förebyggande Åtgärder
1. **Startup validator** kontrollerar alla beroenden vid uppstart
2. **Detta dokument** kartlägger alla globala beroenden
3. **Klar separation** mellan moduler och globala exponeringar

## Underhåll

### När du lägger till ny funktionalitet:
1. **Ny event listener i eventHandlers.js?** → Exponera funktionen globalt i game.js
2. **Ny modul som andra moduler ska använda?** → Lägg till i startup validator
3. **Ändrar global funktion?** → Uppdatera detta dokument

### När du refaktorerar:
1. **Flyttar funktioner mellan moduler?** → Uppdatera globala exponeringar
2. **Tar bort funktioner?** → Ta bort från startup validator och detta dokument
3. **Testar alltid** startup validator efter ändringar

---

*Senast uppdaterad: 2025-08-22 (efter BL-002 fix)*