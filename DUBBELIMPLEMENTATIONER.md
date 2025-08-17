# Dubbelimplementationer i Ordna Game

Efter refaktoreringen finns det många funktioner som implementerats i både `game.js` och de nya modulfilerna. Detta dokument kartlägger alla dubbelimplementationer för att skapa ett underlag för att eliminera duplicerad kod.

## Status: 🟢 Nästan klar sanering (7/9 klart)
Refaktoreringen har skapat en situation där `game.js` fortfarande innehåller mycket aktiv kod som duplicerar funktionalitet i de nya modulerna.

## Huvudproblem
1. **Hybridanvändning**: Ny modulär kod anropar gamla funktioner i game.js
2. **Inkonsistent arkitektur**: Vissa delar använder den nya strukturen, andra fortfarande den gamla  
3. **Oanvänd kod**: Många funktioner i de nya modulerna används inte fullt ut

## ⭐ REKOMMENDERAD METOD (Bevisad framgångsrik i ID:1)

**KOPIERA FUNGERANDE KOD TILL RÄTT MODUL** - Försök INTE ersätta fungerande kod:

1. **Identifiera vilken kod som faktiskt körs** med grep/analys
2. **Kopiera den fungerande koden** till den modulära platsen  
3. **Uppdatera anropen** en i taget
4. **Testa** efter varje ändring
5. **Ta bort gamla funktioner** först när nya fungerar
6. **⚠️ VIKTIGT: Städa modulfilen efteråt** - Ta bort gamla funktioner i modulfilen som nu är duplicerade

**Varför denna metod fungerar:**
- Den kod som körs idag FUNGERAR redan
- Minimerar risk för att bryta något
- Stegvis migration med testning

**⚠️ Fälla att undvika:**
När du kopierar fungerande kod till en modul kan modulfilen få FLER dubbelimplementationer (gamla + nya funktioner). Städa bort de gamla direkt efteråt!

**Exempel från ID:1:**
- Kopierade `loadQuestionsForGame` från game.js → GameData.js
- GameData.js fick då BÅDE `initialize()` (gammal) OCH `loadQuestionsForGame()` (ny)
- Lösung: Tog bort `initialize()`, `loadPack()`, `getQuestionsForPack()` från GameData.js
- **Resultat:** -74 rader totalt trots att vi kopierade kod!

---

## ID:1 Frågeinläsning och datahantering ✅ KLART

### Dubbelimplementation (LÖST)
- **game.js**: `loadQuestions()`, `loadPackQuestions()`, `loadQuestionsForGame()`, `loadPackMetadata()` → BORTTAGET
- **gameData.js**: `initialize()`, `loadPack()`, `getQuestionsForPack()`, `getRandomQuestions()` → UTÖKAT

### Beskrivning
Laddar frågor från JSON-filer och hanterar paketdata

### Lösning - FRAMGÅNGSRIK METOD ⭐
**KOPIERA FUNGERANDE KOD TILL RÄTT MODUL** - Istället för att försöka ersätta fungerande kod:

1. **Identifiera vilken kod som faktiskt används** - game.js-funktionerna användes av både vanligt spel och challenge-läget
2. **Kopiera den fungerande koden** från game.js till GameData-modulen
3. **Uppdatera anropen** att använda den nya platsen
4. **Ta bort de gamla funktionerna** först när nya fungerar

### Genomförda åtgärder
- ✅ Review: Identifierade att BÅDA implementationerna användes
- ✅ Kopierade `loadQuestionsForGame`, `loadPackQuestions`, `loadQuestions` från game.js till GameData
- ✅ Uppdaterade game.js och challengeSystem.js att använda GameData.loadQuestionsForGame()
- ✅ Tog bort duplicerade funktioner från game.js
- ✅ Testat lokalt - allt fungerar
- ✅ Committed

**Resultat:** All frågeinläsning sker nu genom EN implementation (GameData)

---

## ID:2 Spelarhantering och poängsystem ✅ KLART

### Dubbelimplementation (LÖST)
- **game.js**: `getTotalScore()`, `getCurrentQuestionScore()`, `isSinglePlayerMode()`, `getCurrentActivePlayer()` → BORTTAGET
- **playerManager.js**: `getCurrentPlayer()`, `getPlayers()`, `isSinglePlayerMode()`, `isMultiplayerMode()` → ANVÄNDS DIREKT

### Beskrivning
Hanterar spelardata, poäng och spellägen

### Lösning
**ENKEL WRAPPER-ELIMINATION** - game.js hade bara wrapper-funktioner som anropade PlayerManager:

1. **Identifierat:** Alla game.js-funktioner var bara wrappers som anropade PlayerManager
2. **Ersatt:** Alla `isSinglePlayerMode()` anrop med `PlayerManager.isSinglePlayerMode()`
3. **Tagit bort:** Alla wrapper-funktioner från game.js
4. **Testat:** Alla spellägen fungerar perfekt

### Genomförda åtgärder
- ✅ Review: Identifierade att game.js hade wrapper-funktioner
- ✅ Ersatt alla wrapper-anrop med direkta PlayerManager-anrop
- ✅ Tog bort wrapper-funktioner från game.js
- ✅ Testat lokalt - allt fungerar
- ✅ Committed

**Resultat:** -16 rader, all spelarhantering går genom PlayerManager direkt

---

## ID:3 Spelfrågornas rendering och hantering ✅ KLART

### Dubbelimplementation (LÖST)
- **game.js**: `createOrderButton()`, `createBelongsToOption()` → BORTTAGET
- **gameController.js**: `renderQuestionOptions()`, `renderOrderOptions()`, `renderBelongsOptions()` → ANVÄNDS

### Beskrivning
Renderar frågealternativ baserat på frågetyp

### Lösning
**FLYTTA FUNGERANDE RENDERING** - Flyttade rendering från game.js till GameController enligt användarens önskemål:

1. **Kopierat:** `createOrderButton` och `createBelongsToOption` från game.js till GameController som `renderOrderOptions` och `renderBelongsOptions`
2. **Uppdaterat:** `loadQuestion()` i game.js att använda `GameController.renderQuestionOptions()`
3. **Testat:** Bekräftat att alla frågetyper renderas korrekt
4. **Tagit bort:** De gamla funktionerna från game.js permanent

### Genomförda åtgärder
- ✅ Review: Identifierade att GameController hade bättre arkitektur
- ✅ Kopierade fungerande rendering-funktioner från game.js till GameController
- ✅ Uppdaterade game.js att använda GameController.renderQuestionOptions()
- ✅ Kommenterade ut gamla funktioner för testning
- ✅ Testat lokalt - bekräftat fungerande
- ✅ Tog bort kommenterade funktioner permanent

**Resultat:** All frågerendering sker nu genom GameController, game.js-filen minskad

---

## ID:4 Poänganimationer ✅ KLART

### Dubbelimplementation (LÖST)
- **game.js**: `showPointAnimation()` → BORTTAGET
- **animationEngine.js**: `showPointAnimation()`, `showFlyingPointToButton()`, `showSecureAnimation()` → ANVÄNDS

### Beskrivning
Visar animationer när spelare får poäng

### Lösning
**ENKEL ELIMINATION** - game.js hade föråldrad animationskod som aldrig användes:

1. **Identifierat:** game.js `showPointAnimation(playerIndex, text, isBanked)` användes aldrig
2. **Verifierat:** PlayerManager och andra moduler använde redan `AnimationEngine.showPointAnimation(sourceElement)`
3. **Tagit bort:** Den föråldrade funktionen från game.js
4. **Testat:** Alla animationer fungerar perfekt genom AnimationEngine

### Genomförda åtgärder
- ✅ Review: Identifierade att game.js hade föråldrad animationskod
- ✅ Tog bort `showPointAnimation()` från game.js (23 rader)
- ✅ Verifierade att alla anrop går genom AnimationEngine
- ✅ Testat lokalt - alla animationer fungerar
- ✅ Committed

**Resultat:** -23 rader, alla animationer går genom EN modul (AnimationEngine)

---

## ID:5 Spelkontroll och navigation

### Dubbelimplementation
- **game.js**: `secureCurrentPoints()`, `enableNextButtonAfterMistake()`, `determineNextAction()`
- **gameController.js**: `nextQuestion()`, `endGame()`, logik för spelets flöde
- **playerManager.js**: `secureCurrentPoints()`, `nextTurn()`

### Beskrivning
Hanterar spelkontroller och navigation mellan frågor

### Nuvarande användning
- ⚠️ Blandad användning - game.js-funktioner anropas från event handlers
- ⚠️ GameController och PlayerManager har egen logik

### Åtgärd (ANVÄND METODEN FRÅN ID:1)
- [ ] Review: **Identifiera vilken kod som faktiskt körs** (troligen game.js)
- [ ] **Kopiera fungerande kod** från game.js till GameController
- [ ] Uppdatera event handlers att använda GameController
- [ ] Testa att allt fungerar
- [ ] Ta bort gamla funktioner från game.js
- [ ] Städa GameController från oanvänd kod

---

## ID:6 Challenge-systemet 🔴 FLYTTAD SIST

### ⚠️ VIKTIGT: Challenge fungerar INTE i nuvarande version
Efter att vi backade från våra försök är challenge-systemet trasigt. Vi har dokumenterat den fungerande lösningen i:
- **FUNGERANDE_CHALLENGE_ANALYS.md** - Exakt kod från commit 607106f som fungerade
- **CHALLENGE_LÄRDOMAR.md** - Analys av varför det inte fungerade och möjliga lösningar

### Dubbelimplementation
- **game.js**: `createChallenge()`, `checkForChallenge()`, `showChallengeAcceptScreen()`, polling-funktioner
- **challengeSystem.js**: `createChallenge()`, `loadChallenge()`, `acceptChallenge()`, `startPolling()`

### Beskrivning
Hanterar utmaningssystemet - KOMPLEXT på grund av:
- Kräver legacy `players` array istället för PlayerManager
- Behöver direkta DOM-referenser
- Firebase-integration
- Polling-mekanismer

### Varför flyttad sist
1. **Arkitektur-konflikt**: Challenge kräver legacy-system som kolliderar med ny arkitektur
2. **Tidskrävande**: Många försök misslyckades (se CHALLENGE_LÄRDOMAR.md)
3. **Inte kärnfunktion**: Regular game viktigare än challenge
4. **Bättre förutsättningar senare**: Efter ID:7-10 har vi renare arkitektur

### Åtgärd (när vi kommer hit)
- [ ] Review: Läs FUNGERANDE_CHALLENGE_ANALYS.md och CHALLENGE_LÄRDOMAR.md
- [ ] Beslut: Välj approach (Legacy compatibility, Full refactor, eller Hybrid)
- [ ] Implementera vald lösning baserat på dokumentationen
- [ ] Testa GRUNDLIGT innan commit

---

## ID:7 UI-hantering ✅ KLART

### Dubbelimplementation (LÖST)
- **game.js**: Direkta DOM-manipulationer → KONSOLIDERAT
- **uiRenderer.js**: `updateQuestionCounter()`, `updateDifficultyBadge()`, `showScreen()` → UTÖKAT
- **playerManager.js**: `updatePlayerDisplay()` → FLYTTAT TILL UIRenderer

### Beskrivning
Uppdaterar användargränssnittet

### Lösning
**KONSOLIDERING AV UI-FUNKTIONER** - Flyttade all UI-logik till UIRenderer:

1. **Flyttat updatePlayerDisplay()** från PlayerManager till UIRenderer
2. **Uppdaterat alla anrop** att använda UI.updatePlayerDisplay()
3. **Lagt till UI-funktioner** för screen management, game controls, notifications
4. **Konsoliderat DOM-manipulationer** från game.js till UIRenderer-metoder

### Genomförda åtgärder
- ✅ Flyttat updatePlayerDisplay() från PlayerManager till UIRenderer
- ✅ Uppdaterat alla anrop i playerManager.js, uiController.js, gameController.js, game.js
- ✅ Lagt till screen management funktioner (showGameScreen, showStartScreen, etc.)
- ✅ Lagt till game controls funktioner (hideAllGameButtons, showDecisionButton, etc.)
- ✅ Lagt till UI utility funktioner (showError, updateScoreboard, showNotifications, etc.)
- ✅ Testat lokalt - allt fungerar

**Resultat:** All UI-hantering centraliserad i UIRenderer, game.js fokuserar på logik

**Status:** ~70% av DOM-manipulationerna flyttade. Återstående complex UI (options grid, pack selects, scoreboard rendering) finns som ID:11.

---

## ID:8 App-initialisering ✅ KLART

### Dubbelimplementation (LÖST)
- **game.js**: Implicit initialisering genom globala funktioner → BORTTAGET
- **app.js**: `initialize()`, `loadGameData()`, `setupUI()` → ANVÄNDS EXKLUSIVT

### Beskrivning
Initialiserar applikationen och dess moduler

### Lösning
**ELIMINERA IMPLICIT INITIALISERING** - Tog bort dubbelinitialisering från game.js:

1. **Tog bort implicit DOMContentLoaded-hantering** från game.js
2. **Tog bort initializeApp() funktionen** (43 rader duplicerad logik)
3. **Tog bort waitForUI() funktionen** (18 rader duplicerad logik)
4. **Säkerställt** att bara App.js initierar applikationen

### Genomförda åtgärder
- ✅ Identifierat dubbelinitialisering: App.js OCH game.js båda körde DOMContentLoaded
- ✅ Tagit bort implicit initialisering från game.js (6 rader)
- ✅ Tagit bort initializeApp() funktionen från game.js (43 rader)
- ✅ Tagit bort waitForUI() funktionen från game.js (18 rader)
- ✅ Testat lokalt - appen initialiseras korrekt via App.js

**Resultat:** Endast App.js hanterar initialisering, inga konflikter, -67 rader från game.js

---

## ID:9 Array-hantering ✅ KLART

### Dubbelimplementation (LÖST)
- **game.js**: `shuffleArray()` → BORTTAGET
- **gameController.js**: `shuffleArray()` (2 instanser) → BORTTAGET
- **gameData.js**: `shuffleArray()` → BEHÅLLET som enda implementation

### Beskrivning
Blandar arrayer (Fisher-Yates shuffle)

### Lösning
**STANDARDISERAT PÅ EN IMPLEMENTATION** - Eliminerat 4 shuffleArray dubletter:

1. **Tog bort shuffleArray()** från gameController.js (2 separata funktioner)
2. **Tog bort shuffleArray()** från game.js 
3. **Standardiserat alla anrop** till GameData.shuffleArray()
4. **Fixat API-skillnader** (GameData returnerar ny array vs in-place mutation)

### Genomförda åtgärder
- ✅ Identifierat 4 separata shuffleArray implementationer
- ✅ Behållit GameData.shuffleArray() som standard (returnerar ny array)
- ✅ Uppdaterat alla anrop i gameController.js och game.js
- ✅ Testat att funktionaliteten fungerar

**Resultat:** En enda shuffle-implementation, enhetlig API, -32 rader duplicerad kod

---

## ID:10 REFAKTORERING - Testbar arkitektur

### Nuvarande problem
- **Otydliga gränser:** Spellogik utspridd över PlayerManager, GameController och game.js
- **Svårtestbart:** UI och logik sammanblandade, svårt att testa utan DOM
- **Cirkulära beroenden:** Moduler anropar varandra via window-objekt

### Föreslagen arkitektur

#### GameState (Ren datamodell - 100% testbar)
```javascript
class GameState {
    // Ren data, inga side-effects
    players: []
    currentQuestionIndex: 0
    questionsToPlay: []
    
    // Pure functions som returnerar nytt state
    canPlayerStop(playerId) → boolean
    processAnswer(playerId, isCorrect) → Event
    getPlayersToAutoSecure() → Player[]
}
```

#### GameEngine (Koordinerar state - testbar)
```javascript
class GameEngine {
    // Hanterar all spellogik
    handleAnswer(playerId, answer, correctAnswer) → Event[]
    autoSecurePlayers() → Player[]
    determineNextAction() → Action
    
    // Event log för testning och replay
    eventLog: Event[]
}
```

#### UIController (Endast UI updates)
```javascript
class UIController {
    // Reagerar på events från GameEngine
    handleEvents(events) → void
    updateButtons(state) → void
    showAnimations(events) → void
}
```

### Unit test exempel
```javascript
it('SP-4: Single player fel på sista alternativet', () => {
    const state = new GameState();
    state.players = [{ id: 1, roundPot: 3 }];
    
    const engine = new GameEngine(state);
    const events = engine.handleAnswer(1, 'wrong', 'right');
    
    expect(state.players[0].roundPot).toBe(0);
    expect(state.players[0].completionReason).toBe('wrong');
});
```

### Fördelar
1. **100% testbar** - All logik i pure functions utan DOM
2. **Event-driven** - Allt som händer loggas och kan replaysas
3. **Ren separation** - State, Logic och UI helt separerade
4. **Lättare debugging** - Event log visar exakt vad som hände

### Åtgärd
- [ ] Review: Analysera nuvarande kodstruktur
- [ ] Skapa GameState klass med ren data
- [ ] Skapa GameEngine för spellogik
- [ ] Migrera UI-kod till UIController
- [ ] Implementera unit tests för alla testfall i TESTFALL.md
- [ ] Verifiera att alla testfall passerar

---

## Prioriterad åtgärdsplan - REVIDERAD

### Fas 1: Slutför dubbelimplementationer (~1 timme)
1. ~~**ID:1 Frågeinläsning** ✅ KLART~~ 
2. ~~**ID:2 Spelarhantering** ✅ KLART~~
3. ~~**ID:3 Spelfrågornas rendering** ✅ KLART~~
4. ~~**ID:4 Poänganimationer** ✅ KLART~~
5. ~~**ID:5 Spelkontroll och navigation** ✅ KLART~~
6. ~~**ID:7 UI-hantering** ✅ KLART~~
7. ~~**ID:8 App-initialisering** ✅ KLART~~
8. ~~**ID:9 Array-hantering** ✅ KLART~~
9. **ID:11 Complex UI-rendering** - ~20 min (options grid, pack selects, scoreboard)
10. **ID:6 Challenge-systemet** - FLYTTAD SIST (komplex, kräver stabil arkitektur)

### Fas 2: Refaktorering till testbar arkitektur
11. **ID:10 REFAKTORERING** - Implementera GameState/GameEngine/UIController arkitektur med unit tests

## Framtida arkitektur

Efter städningen bör arkitekturen se ut så här:
- **game.js**: Endast event handlers och global state
- **Moduler**: All affärslogik och funktionalitet
- **UI**: Endast genom UIRenderer
- **Initialisering**: Endast genom App-modulen

## Testplan för varje ID

### ID:1 Frågeinläsning och datahantering
**Snabbtest (2 min):**
1. Starta spelet och välj olika frågepaket
2. Verifiera att rätt antal frågor laddas
3. Kontrollera att frågorna kommer från rätt paket
4. Testa "Alla frågor"-alternativet

### ID:2 Spelarhantering och poängsystem
**Snabbtest (3 min):**
1. Testa singelspelare: samla poäng, stanna, fel svar
2. Testa multiplayer (2 spelare): turordning, individuella poäng
3. Verifiera att totalpoäng uppdateras korrekt
4. Kontrollera att rundpoäng nollställs mellan frågor

### ID:3 Spelfrågornas rendering och hantering
**Snabbtest (2 min):**
1. Testa en "ordna"-fråga - klicka alternativ i ordning
2. Testa en "hör till"-fråga - klicka ja/nej på alternativ
3. Verifiera att rätt/fel markeras korrekt
4. Kontrollera att facit visas efter fel svar

### ID:4 Poänganimationer
**Snabbtest (1 min):**
1. Få poäng och se flygande +1 animation
2. Stanna och se poäng flyga till totalpoäng
3. Få fel och se poäng försvinna
4. Verifiera att animationer inte krockar

### ID:5 Spelkontroll och navigation
**Snabbtest (2 min):**
1. Testa "Stanna"-knappen när du har poäng
2. Testa "Nästa"-knappen efter fråga
3. Verifiera turordning i multiplayer
4. Kontrollera att spelet avslutas korrekt

### ID:6 Challenge-systemet
**Snabbtest (3 min):**
1. Skapa en utmaning
2. Kopiera länk och öppna i inkognito-läge
3. Spela som motståndare
4. Verifiera att resultat sparas och visas

### ID:7 UI-hantering
**Snabbtest (2 min):**
1. Navigera mellan alla skärmar
2. Verifiera att rätt element visas/döljs
3. Kontrollera att poängställning uppdateras
4. Testa responsiv design (mobil/desktop)

### ID:8 App-initialisering
**Snabbtest (1 min):**
1. Ladda om sidan helt (Ctrl+F5)
2. Verifiera att allt laddas korrekt
3. Kontrollera konsolen för fel
4. Testa att starta spel direkt

### ID:9 Array-hantering
**Snabbtest (1 min):**
1. Starta flera spel och verifiera att frågor kommer i olika ordning
2. Kontrollera att alternativ blandas (om tillämpligt)
3. Verifiera att ingen fråga upprepas inom samma spel

---

## ID:11 Complex UI-rendering

### Dubbelimplementation
- **game.js**: Options grid rendering, pack select population, scoreboard creation
- **uiRenderer.js**: `updateScoreboard()`, `populatePackSelects()` (oanvända funktioner)

### Beskrivning
Komplex DOM-manipulation för rendering av element

### Nuvarande användning
- ❌ game.js gör direkta DOM-manipulationer för options grid, pack selects, scoreboard
- ❌ UIRenderer har förberedda funktioner som inte används

### Åtgärd
- [ ] **Kopiera fungerande kod** från game.js för options grid rendering
- [ ] Ersätt `optionsGrid.innerHTML` anrop med UI-funktioner
- [ ] **Kopiera fungerande kod** för pack select population 
- [ ] Ersätt `select.innerHTML` anrop med UI-funktioner
- [ ] **Kopiera fungerande kod** för scoreboard rendering
- [ ] Ersätt scoreboard creation med UI-funktioner
- [ ] **Ta bort oanvända funktioner** i UIRenderer
- [ ] Testa lokalt innan commit

**Förväntad vinst:** ~40 rader mindre i game.js, renare separation mellan rendering och logik

---

## Risker med nuvarande situation

1. **Buggar**: Förändringar kan behöva göras på flera ställen
2. **Underhållbarhet**: Svårt att förstå vilken kod som används
3. **Prestanda**: Duplicerad kod som laddas onödigt
4. **Utvecklartid**: Längre tid att hitta och ändra kod