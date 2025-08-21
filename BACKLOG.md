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

#### BL-002: Multiplayer Hör-till Bugg
- **Kategori:** BUG
- **Prioritet:** HÖG
- **Beroenden:** BL-001 (GameLogger för bättre felsökning)
- **Beskrivning:** 
  - Scenario: Spelare 1 svarar rätt, Spelare 2 svarar rätt, Spelare 1 svarar fel (elimineras)
  - Problem: Spelare 2 kan inte välja att "stanna" trots att hen borde kunna
  - Påverkar: Multiplayer hör-till frågor
- **Reproduktion:**
  ```
  1. Starta 2-spelare spel
  2. Välj hör-till fråga
  3. Spelare 1: Klicka rätt alternativ
  4. Spelare 2: Klicka rätt alternativ
  5. Spelare 1: Klicka fel alternativ (elimineras)
  6. BUG: Spelare 2 kan inte stanna
  ```

### 🛠️ TEKNIK & INFRASTRUCTURE

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