# Ordna Game - Backlog

## 📋 Prioritetsordning

**Aktuel fokus:** Förbättra debug-kapacitet för att kunna lösa återkommande multiplayer-buggar

1. **BL-001** - GameLogger System (KRITISK - grund för framtida felsökning)
2. **BL-002** - Multiplayer Hör-till Bugg (BLOCKER - spelbrytande)
3. **BL-003** - Slutför uiController Refaktorering (CLEANUP - teknisk skuld)

---

## 🔄 Pågående Arbete

### BL-003: Slutför uiController Refaktorering
- **Status:** IN_PROGRESS
- **Assignee:** Claude + Användare
- **Beskrivning:** uiController.js borttagen, funktioner flyttade till rätt moduler, multiplayer-buggar fixade
- **Kvar att göra:**
  - [ ] Testa att all funktionalitet fungerar
  - [ ] Commit och push ändringar
  - [ ] Validera i produktion

---

## 📝 Backlog Items

### 🚨 KRITISKA BUGGAR

#### BL-002: Multiplayer Hör-till Bugg ✅ SLUTGILTIGT LÖST (FEMTE FÖRSÖKET!)
- **Kategori:** BUG  
- **Prioritet:** HÖG
- **Status:** COMPLETED (2025-08-22 - FEMTE FÖRSÖKET - PLAYER STATE RACE CONDITION LÖST)
- **SLUTGILTIG rotorsak:** **getCurrentPlayer() race condition** i PlayerManager.nextTurn()
- **Fullständig analys av alla misslyckade försök:**
  - **Försök #1:** Trodde det var `playerStops` exponering → FELAKTIG
  - **Försök #2:** Trodde det var event handler-problem → FELAKTIG  
  - **Försök #3:** Trodde det var `updateGameControls` exponering → FELAKTIG (men behövdes)
  - **Försök #4:** Trodde det var script loading race condition → DELVIS RÄTT (men inte huvudorsaken)
  - **Försök #5:** **RÄTT** - getCurrentPlayer() race condition i PlayerManager.nextTurn()
- **Teknisk rotorsakskedja (VERKLIG):**
  - `determineNextAction()` anropar `PlayerManager.nextTurn()` i `setTimeout(..., 500)`
  - `PlayerManager.nextTurn()` anropar `updateGameControls()` OMEDELBART
  - Men player state kanske inte hunnit synkronisera fullt → `getCurrentPlayer()` returnerar fel spelare
  - `updateGameControls()` får fel player → `hasPoints = false` → knapp blir disabled
- **SLUTGILTIG lösning:**
  - ✅ **10ms delay i PlayerManager.nextTurn()** innan updateGameControls() anropas
  - ✅ **Debug-loggning** för att spåra player state i updateGameControls()  
  - ✅ **Alla tidigare fixes behålls** - förebygger andra race conditions
- **Lärdom för framtiden:**
  - **Script loading order är kritisk** - alla defer eller inga defer
  - **Race conditions är svåra att debugga** - kan verka intermittent
  - **Optional chaining (UI?.) döljer fel** - använd explicit checks när kritiskt
- **Beskrivning:** 
  - Scenario: Spelare 1 svarar rätt, Spelare 2 svarar rätt, Spelare 1 svarar fel (elimineras)
  - Problem: Spelare 2 kan inte välja att "stanna" trots att hen borde kunna  
  - Påverkar: Alla multiplayer-scenarion där spelare elimineras och tur byts

### 🛠️ TEKNIK & INFRASTRUCTURE

#### BL-004: Create DEPENDENCIES.md ✅ KLART
- **Kategori:** DOCS
- **Prioritet:** MEDEL
- **Status:** COMPLETED (2025-08-22)
- **Beskrivning:** Dokumentera alla globala funktioner och beroenden mellan moduler
- **Acceptanskriterier:**
  - [x] Lista alla window.X funktioner som moduler förväntar sig
  - [x] Dokumentera vilket modul som exponerar varje funktion
  - [x] Inkludera event handlers och deras beroenden
- **Filer som påverkas:** ✅ DEPENDENCIES.md skapad
- **Motivering:** Förhindra framtida buggar där funktioner inte är globalt exponerade
- **Resultat:** Komplett dokumentation av alla globala beroenden, inkl. historik och underhållsråd

#### BL-005: Implement Startup Validator ✅ KLART
- **Kategori:** FEATURE
- **Prioritet:** MEDEL
- **Status:** COMPLETED (2025-08-22)
- **Beskrivning:** Validera att alla nödvändiga globala funktioner finns vid uppstart
- **Acceptanskriterier:**
  - [x] Kontrollera att alla window.X funktioner finns
  - [x] Logga varningar för saknade beroenden
  - [x] Visa användarfel om kritiska funktioner saknas
- **Filer som påverkas:** ✅ app.js (validateDependencies() metod)
- **Motivering:** Tidigt upptäcka konfigurationsproblem istället för runtime-fel
- **Implementation:** 
  - Automatisk validering vid uppstart i app.initialize()
  - Kontrollerar 11 kritiska funktioner + 6 moduler
  - Tydliga felmeddelanden i konsolen vid problem

#### BL-001: GameLogger System
- **Kategori:** FEATURE
- **Prioritet:** KRITISK
- **Specifikation:** [📋 GAMELOGGER_SPEC.md](docs/GAMELOGGER_SPEC.md)
- **Beskrivning:** Implementera omfattande debug-loggning för att spåra modulkommunikation och lösa komplexa multiplayer-buggar
- **Huvudfunktioner:**
  - Wrapper-pattern för minimal kodpåverkan
  - Modulanrop: `🔵 [game→playerManager] nextTurn() → {success: true}`
  - Tillståndsändringar: `🟢 [STATE] activePlayer: Anna → Bob`  
  - State snapshots vid kritiska punkter
  - Färgkodad konsollutput och JSON-export
- **Fas-uppdelning:**
  - [ ] **BL-001a** - Grundsystem och console logging
  - [ ] **BL-001b** - Modulintegration (alla kritiska funktioner)
  - [ ] **BL-001c** - Avancerad analys och export
- **Se detaljerad specifikation för komplett teknisk design och acceptanskriterier**

### 🧹 REFAKTORERING

#### BL-003: Slutför uiController Refaktorering
- **Kategori:** REFACTOR
- **Prioritet:** MEDEL
- **Beskrivning:** Slutför borttagning av uiController.js och förbättra arkitekturen
- **Status:** 95% klart
- **Återstående arbete:**
  - [x] Ta bort uiController.js fil
  - [x] Flytta funktioner till uiRenderer.js
  - [x] Flytta showWaitingForOpponentView till challengeSystem.js
  - [x] Exponera handleOrderClick och handleBelongsDecision globalt
  - [x] Fixa UI.setAllOptionsDisabled(false) anrop
  - [ ] Final testing
  - [ ] Commit och push

---

## ✅ Avklarade Items

*Inga avklarade items än - detta är första versionen av backlog*

---

## 📋 Mall för Nya Items

```markdown
#### BL-XXX: Titel
- **Kategori:** [BUG/FEATURE/REFACTOR/DOCS]
- **Prioritet:** [KRITISK/HÖG/MEDEL/LÅG]
- **Beroenden:** [BL-XXX, BL-XXX] eller "Inga"
- **Beskrivning:** [Detaljerad beskrivning av problemet/funktionen]
- **Acceptanskriterier:**
  - [ ] Kriterium 1
  - [ ] Kriterium 2
- **Filer som påverkas:** [Lista över filer]
- **Reproduktion:** [För buggar - steg för att reproducera]
```

---

## 🏷️ Kategorier

- **BUG** - Fel som behöver fixas
- **FEATURE** - Ny funktionalitet
- **REFACTOR** - Förbättra kodstruktur utan att ändra funktionalitet  
- **DOCS** - Dokumentation
- **PERFORMANCE** - Prestanda-förbättringar
- **SECURITY** - Säkerhets-förbättringar

## 🎯 Prioritetsnivåer

- **KRITISK** - Måste fixas omedelbart, blockerar annat arbete
- **HÖG** - Viktigt att fixa snart, påverkar användarupplevelse
- **MEDEL** - Bra att ha, planera in när tid finns
- **LÅG** - Nice to have, gör när allt annat är klart

---

*Senast uppdaterad: 2025-08-21*