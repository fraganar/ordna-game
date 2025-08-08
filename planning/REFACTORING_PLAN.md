# Ordna Game - Refaktoreringplan

## Översikt

Denna dokumentation innehåller en komplett plan för refaktorering av `game.js` baserat på djup analys av spelmekanik och kodstruktur. Planen fokuserar på att eliminera verkliga problem utan att överabstrakta avsiktliga designskillnader.

**Skapad:** 2025-08-05  
**Status:** Klar för implementation  
**Beräknad tid:** 2.5 timmar totalt  

---

## Spelspecifikation & Arkitekturanalys

### Spelkoncept
**Ordna Game** är ett riskbaserat quiz-spel med "push your luck"-mekanik. Spelaren samlar poäng genom rätta svar men riskerar att förlora allt vid fel svar.

### Frågetyper

#### 1. "Ordna"-frågor (`typ: "ordna"`)
- **Uppgift:** Klicka på 4 alternativ i rätt ordning
- **Exempel:** "Ordna dessa planeter efter storlek (minst till störst)"
- **Mekanik:** Varje rätt klick = +1 poäng, fel klick = eliminering
- **Data:** `rätt_ordning` array med korrekt ordning

#### 2. "Hör till"-frågor (`typ: "hör_till"`)
- **Uppgift:** Bedöm varje alternativ med Ja/Nej
- **Exempel:** "Vilka av dessa är Jane Austen-romaner?"
- **Mekanik:** Varje rätt beslut = +1 poäng, fel beslut = eliminering
- **Data:** `tillhör_index` array anger vilka alternativ som hör till

### Spellägen

#### Single Player Mode
**Målsättning:** Samla så många poäng som möjligt över flera frågor

**Poängsystem:**
```javascript
currentQuestionScore  // Poäng under pågående fråga (visas på stanna-knapp)
totalScore           // Totala säkrade poäng (visas som stjärnor)
```

**Spelflöde:**
1. **Svara:** Varje rätt svar → `currentQuestionScore++`
2. **Beslut:** "Stanna" (säkra poäng) eller "Fortsätt" (chansa mer)
3. **Fel svar:** `currentQuestionScore = 0`, visa rätt svar, nästa fråga
4. **Alla rätt:** Automatisk säkring (som att klicka "Stanna")

#### Multiplayer Mode (2-6 spelare)
**Målsättning:** Ha högst totalpoäng när alla frågor är slut

**Poängsystem per spelare:**
```javascript
roundPot           // Poäng under pågående fråga (som currentQuestionScore)
score             // Totala säkrade poäng (som totalScore)
eliminatedInRound // true/false - utslagna från aktuell fråga
eliminationReason // 'stopped', 'wrong', 'finished'
```

**Turordning:**
```javascript
currentPlayerIndex    // Vilken spelare som är aktiv
questionStarterIndex  // Vem som börjar nästa fråga (roterar)
```

**Spelflöde per fråga:**
1. **Spelare 1:** Svarar, samlar poäng i `roundPot`
2. **Beslut:** "Stanna" (säkra + elimineras) eller "Fortsätt" (nästa spelare)
3. **Fel svar:** Elimineras, `roundPot = 0`, nästa spelare
4. **Alla ute:** Rätt svar visas, nästa fråga, rotera startspelare

#### Challenge Mode
**Målsättning:** Tävla mot vän på samma 5 frågor

**Flöde:**
1. Challenger spelar → lagra resultat i Firebase
2. Skapa delbar länk
3. Opponent spelar samma frågor
4. Jämför resultat

---

## Problemanalys

### Kritiska Problem (måste fixas)

#### 1. Race Conditions
**Problem:** Processing-flaggor kan fastna, gör knappar oanvändbara
```javascript
// Exempel från recent bugg
if (stopSide.dataset.processing === 'true') return;
stopSide.dataset.processing = 'true';
// Flaggan återställs inte alltid korrekt vid turbyten
```

#### 2. Null Access Crashes
**Problem:** Kod assumerar att arrays/objekt finns
```javascript
// Potentiell crash
const question = questionsToPlay[currentQuestionIndex];
if (userOrder.length === 4) { ... } // Hårkodad 4!
```

#### 3. Duplicerad Poäng-logik
**Problem:** Samma `+1` logik kopierad överallt
```javascript
// Single player (förekommer 8+ ställen)
currentQuestionScore++;
updateSinglePlayerDisplay();

// Multiplayer (förekommer 8+ ställen)  
players[currentPlayerIndex].roundPot++;
updateScoreboard();
```

#### 4. Komplex Knapphantering
**Problem:** 5 olika knappar med inkonsekvent show/hide-logik
```javascript
// Förekommer på 15+ ställen med variationer
decisionButton.classList.remove('hidden');
stopBtn.classList.add('hidden');
nextQuestionBtn.classList.add('hidden');
largeNextQuestionBtn.classList.add('hidden');
```

### Vad som INTE är problem

#### ✅ Olika flöden mellan spellägen
Single player och multiplayer har **avsiktligt** olika flöden:
- **Turordning:** Ingen vs komplex rotation
- **Animationer:** Rica vs minimala  
- **Elimination:** Boolean flag vs player state
- **Säkring:** Direkt vs via turhantering

**Att försöka unifiera detta skulle skapa värre kod med massor av if-satser.**

---

## Refaktoreringsstrategi

### Principer
1. **Förstärk istället för omstrukturera** - Fixa verkliga problem, bevara fungerande design
2. **Unififera gemensam logik** - Samma operations-logik kan delas
3. **Bevara avsiktliga skillnader** - Olika flöden ska förbli olika
4. **Minimal risk** - Små, testbara steg

### Prioriterad Plan

---

## PRIO 1: Kritiska Säkerhetsåtgärder

**Tidsåtgång:** 20 minuter (10 kodning + 10 testning)  
**Risk:** Mycket låg  
**Nytta:** Eliminerar crashes och race conditions  

### Åtgärder

#### 1.1 Null-Safety
```javascript
// FÖRE - kan krasha
const question = questionsToPlay[currentQuestionIndex];
question.alternativ.forEach(...);

// EFTER - säker
const question = questionsToPlay?.[currentQuestionIndex];
if (!question) return;
question.alternativ.forEach(...);
```

**Platser att fixa:**
- `loadQuestion()` - rad ~1777
- `handleOrderClick()` - flera ställen
- `handleBelongsDecision()` - flera ställen
- `showCorrectAnswers()` - rad ~2187

#### 1.2 Magic Numbers
```javascript
// FÖRE - hårdkodat
if (userOrder.length === 4) {

// EFTER - dynamiskt  
if (userOrder.length === question.alternativ.length) {
```

**Platser att fixa:**
- `handleOrderClick()` - rad ~1921
- Eventuellt andra ställen med hårdkodad 4

#### 1.3 Processing-flagga Säkerhet
```javascript
// FÖRE - kan fastna för evigt
stopSide.dataset.processing = 'true';

// EFTER - med timeout-säkerhet
stopSide.dataset.processing = 'true';
setTimeout(() => {
    if (stopSide.dataset.processing === 'true') {
        console.warn('Processing flag stuck, resetting');
        stopSide.dataset.processing = 'false';
    }
}, 5000); // Säkerhetsnät
```

### Testning PRIO 1
- [ ] Spamma alla knappar snabbt
- [ ] Ladda spel utan frågor laddade  
- [ ] Browser refresh mitt i spel
- [ ] Verifiera inga console errors

---

## PRIO 2: Unifierad Poäng-tilldelning

**Tidsåtgång:** 30 minuter (15 kodning + 15 testning)  
**Risk:** Låg (ändrar inte flöden)  
**Nytta:** Eliminerar 150+ rader duplicerad kod  

### Åtgärd

#### 2.1 Skapa Gemensam Poäng-funktion
```javascript
/**
 * Lägger till 1 poäng till aktuell spelare/fråga
 * Hanterar både single player och multiplayer
 */
function addPointToCurrentPlayer() {
    if (isSinglePlayer || ischallengeMode) {
        currentQuestionScore++;
        updateSinglePlayerDisplay();
        
        // Uppdatera stanna-knappen med nya poäng
        updateStopButtonPoints();
        
        // Wake up stop button vid första poängen
        if (currentQuestionScore === 1) {
            wakeUpStopButton();
        }
    } else {
        // Multiplayer
        const player = players[currentPlayerIndex];
        player.roundPot++;
        showPointAnimation(currentPlayerIndex, "+1");
        updateScoreboard();
        updateGameControls(); // Uppdatera stanna-knapp med spelarnamn
    }
}
```

#### 2.2 Ersätt Alla Duplicerade Anrop
**Platser att ersätta:**
- `handleOrderClick()` - minst 3 ställen
- `handleBelongsDecision()` - minst 3 ställen  
- Eventuellt andra ställen med poäng-logik

```javascript
// FÖRE - duplicerat
if (isSinglePlayer) {
    currentQuestionScore++;
    updateSinglePlayerDisplay();
    updateStopButtonPoints();
    if (currentQuestionScore === 1) wakeUpStopButton();
} else {
    players[currentPlayerIndex].roundPot++;
    showPointAnimation(currentPlayerIndex, "+1");
    updateScoreboard();
    updateGameControls();
}

// EFTER - en rad
addPointToCurrentPlayer();
```

### Testning PRIO 2
- [ ] Spela igenom single player - jämför poäng före/efter
- [ ] Spela igenom multiplayer (2-6 spelare) - jämför poäng före/efter  
- [ ] Challenge mode - verifiera poäng fungerar
- [ ] Kontrollera att animationer och UI-uppdateringar fungerar korrekt

---

## PRIO 3: Förenklad Knapphantering

**Tidsåtgång:** 45 minuter (25 kodning + 20 testning)  
**Risk:** Medium (UI-förändringar)  
**Nytta:** Centraliserad, förutsägbar knapplogik  

### Åtgärd

#### 3.1 Skapa Button State Manager
```javascript
/**
 * Centraliserad hantering av alla spelknappar  
 * @param {string} state - 'active', 'finished', 'mistake', 'roundComplete', 'disabled'
 */
function updateGameButtons(state) {
    const hasPoints = isSinglePlayer ? currentQuestionScore > 0 : 
                      players[currentPlayerIndex]?.roundPot > 0;
    
    const config = {
        showDecision: state === 'active' && hasPoints,
        showNext: state === 'finished' || state === 'mistake',
        showLargeNext: state === 'roundComplete',
        enableDecision: state === 'active' && hasPoints
    };
    
    // Uppdatera alla knappar baserat på konfiguration
    decisionButton.classList.toggle('hidden', !config.showDecision);
    stopBtn.classList.toggle('hidden', true); // Alltid dold (legacy)
    nextQuestionBtn.classList.toggle('hidden', !config.showNext);
    largeNextQuestionBtn.classList.toggle('hidden', !config.showLargeNext);
    
    // Säkerställ processing flag är korrekt
    if (config.showDecision) {
        stopSide.dataset.processing = 'false';
    }
    
    // Uppdatera decision button innehåll för multiplayer
    if (!isSinglePlayer && config.showDecision) {
        const player = players[currentPlayerIndex];
        const pointsText = document.querySelector('#stop-side .decision-points');
        if (pointsText && player) {
            pointsText.textContent = `${player.name} +${player.roundPot}p`;
        }
    }
}
```

#### 3.2 Ersätt Befintlig Knapplogik
**Platser att ersätta:**
- `updateGameControls()` - helt ersätta med anrop till `updateGameButtons()`
- `loadQuestion()` - ersätt knapp-hantering
- `enableNextButton()` - ersätt med `updateGameButtons('finished')`
- `enableNextButtonAfterMistake()` - ersätt med `updateGameButtons('mistake')`
- Andra ställen med knapp show/hide

#### 3.3 Definiera State Transitions
```javascript
// Exempel på när olika states används:
// 'active' - spelare kan göra val, har poäng att säkra
// 'finished' - fråga klar, visa nästa-knapp  
// 'mistake' - fel svar, visa nästa-knapp
// 'roundComplete' - alla spelare ute, visa stor nästa-knapp
// 'disabled' - ingen interaktion möjlig
```

### Testning PRIO 3
- [ ] Gå igenom hela spelflödet i single player
- [ ] Gå igenom hela spelflödet i multiplayer (2+ spelare)  
- [ ] Verifiera rätt knappar visas vid rätt tillfällen
- [ ] Testa alla knappar fungerar (klickbara när visade)
- [ ] Kontrollera turbyten visar rätt spelarnamn på knappar

---

## PRIO 4: Unifierad Answer Validation (Endast om PRIO 1-3 perfekt)

**Tidsåtgång:** 60 minuter (35 kodning + 25 testning)  
**Risk:** Hög (rör kärnlogik)  
**Nytta:** Eliminerar duplicerad valideringslogik  

### Åtgärd

#### 4.1 Skapa Gemensam Validator
```javascript
/**
 * Validerar om ett svar är korrekt
 * @param {Object} question - Frågobjekt
 * @param {string} questionType - 'ordna' eller 'hör_till'  
 * @param {any} userAnswer - Användarens svar
 * @param {number} answerIndex - Index för ordna-frågor
 * @returns {boolean} - true om korrekt svar
 */
function validateAnswer(question, questionType, userAnswer, answerIndex = null) {
    if (questionType === 'ordna') {
        // Kontrollera om klick är rätt i ordningen
        const correctNext = question.rätt_ordning[answerIndex];
        return userAnswer === correctNext;
    } else if (questionType === 'hör_till') {
        // Kontrollera om ja/nej-beslut är korrekt
        const optionIndex = question.alternativ.indexOf(userAnswer.optionText);
        const shouldBelong = question.tillhör_index.includes(optionIndex);
        return (userAnswer.decision === 'yes') === shouldBelong;
    }
    return false;
}
```

#### 4.2 Uppdatera Answer Handlers (FÖRSIKTIGT)
Detta är den riskfyllda delen - kräver extremt noggrann testning.

**VARNING:** Implementera bara om PRIO 1-3 fungerar perfekt och du har tid för omfattande testning.

### Testning PRIO 4
- [ ] **KRITISKT:** Spela igenom alla kombinationer mycket noggrant
- [ ] Ordna-frågor: Single player, Multiplayer, Challenge
- [ ] Hör till-frågor: Single player, Multiplayer, Challenge  
- [ ] Fel svar i alla lägen - kontrollera korrekt beteende
- [ ] Rätt svar i alla lägen - kontrollera korrekt beteende
- [ ] Jämför beteende före/efter mycket noggrant

---

## Implementation Guidelines

### Säkerhet
1. **Gör alltid backup** innan du börjar (git commit/branch)
2. **En PRIO åt gången** - testa ordentligt innan nästa
3. **Inga ändringar om tester misslyckas**
4. **Dokumentera alla förändringar** i commit-meddelanden

### Testning
Varje PRIO måste passera dessa grundläggande tester:
- [ ] Single player fungerar identiskt med före
- [ ] Multiplayer 2-6 spelare fungerar identiskt med före  
- [ ] Challenge mode fungerar identiskt med före
- [ ] Inga console errors
- [ ] Inga visuella regressions

### Rollback Plan
Om något går fel:
1. **PRIO 1-2:** Låg risk, enkla att rulla tillbaka
2. **PRIO 3:** Medium risk - använd git för att återställa UI-ändringar
3. **PRIO 4:** Hög risk - ha backup av `handleOrderClick`/`handleBelongsDecision`

---

## Förväntade Resultat

### Efter PRIO 1-2 (50 minuter)
- ✅ Inga crashes från null-access  
- ✅ Inga race conditions med processing-flaggor
- ✅ Magic numbers eliminerade (dynamisk storlek)
- ✅ 150+ rader duplicerad poäng-kod → 1 funktion
- ✅ Framtida poäng-ändringar kräver bara 1 ställe

### Efter PRIO 3 (95 minuter)  
- ✅ Knapplogi centraliserad och förutsägbar
- ✅ Nya UI-states enkla att lägga till
- ✅ Färre buggar när knappar ska visas/döljas
- ✅ Konsekvent beteende mellan spellägen

### Efter PRIO 4 (155 minuter) - Endast om allt annat perfekt
- ✅ Answer validation centraliserad
- ✅ Enklare att lägga till nya frågetyper
- ✅ Mindre duplicering i answer handlers

### Vad som förblir komplext (AVSIKTLIGT)
- ✅ Turordning i multiplayer (ska vara komplext)
- ✅ Animationer i single player (ska vara olika)
- ✅ Challenge mode integration (separat funktion)  
- ✅ Elimination logic (olika beteenden är korrekt)

---

## Viktiga Arkitektur-insikter

### Bra Refaktorering
Tar bort **oavsiktlig komplexitet:**
- Race conditions från dålig state management
- Duplicerad kod från copy-paste
- Magic numbers från lat programmering  
- Inkonsekvent UI från ad-hoc lösningar

### Dålig Refaktorering  
Försöker abstrakta bort **avsiktlig komplexitet:**
- Olika spellägen (de SKA vara olika)
- Rich animations (single player feature)
- Turn management (multiplayer behov)
- Olika elimination logic (korrekt design)

### Nyckelprincip
**Förstärk det som fungerar, fixa det som är trasigt, bevara det som är avsiktligt.**

---

## Nästa Steg

1. **Läs igenom hela planen** och förstå resonemangen
2. **Börja med PRIO 1** - 20 minuter för säkerhet
3. **Testa ordentligt** efter varje PRIO
4. **Stoppa om något går fel** - bättre delvis färdigt än trasigt
5. **Dokumentera resultatet** - uppdatera denna fil med utfall

Lycka till! 🚀

---

**Senast uppdaterad:** 2025-08-05  
**Status:** Klar för implementation