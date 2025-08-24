# Ordna Game - Backlog

**OBS: Detta dokument ska hållas kortfattat!** Endast information som behövs för pågående eller kommande arbete ska finnas här. Historisk information finns i LOG.md.

## 📋 Prioritetsordning

### Pågående arbete
*Inget pågående arbete just nu*

### Kommande arbete (sorterat efter stackrank - högst första)

1. **BL-007** (80) - Revanschknapp utmaning 
2. **BL-008** (70) - Visa poäng i utmaningsresultat
3. **BL-009** (60) - Poänganimering före totalpoäng
4. **BL-010** (50) - Utmana-knapp efter alla spellägen
5. **BL-018** (30) - Unificera slutskärmsfunktioner

---

## 📝 Backlog Items

### BL-007: Revanschknapp utmaning
- **Kategori:** BUG  
- **Stackrank:** 80
- **Beskrivning:** Revanschknappen fungerar inte för utmaning

### BL-008: Visa poäng i utmaningsresultat
- **Kategori:** FEATURE
- **Stackrank:** 70
- **Beskrivning:** Man ser inte poängen för den som tog emot utmaningen i visning av resultat
- **Fråga:** Ska poäng för varje fråga visas? Tillför det något?

### BL-009: Poänganimering före totalpoäng
- **Kategori:** BUG
- **Stackrank:** 60
- **Beskrivning:** Totalpoäng ökar före animationen landar i multi och kanske i singel också

### BL-010: Utmana-knapp efter alla spellägen
- **Kategori:** FEATURE
- **Stackrank:** 50
- **Beskrivning:** Utmana borde man alltid få välja i slutet på alla spel, singelspel och kanske multispel också

### BL-018: Unificera slutskärmsfunktioner
- **Kategori:** REFACTOR
- **Stackrank:** 30
- **Beskrivning:** Inkonsekvent namngivning och parameterhantering för slutskärmsfunktioner
- **Problem:** 
  - `showGameResultScreen()` tar parametrar, `end*Game()` använder global state
  - Olika namnkonventioner för liknande funktioner (Verb+Objekt vs Verb+Spelläge)
  - Duplicerad logik mellan funktionerna
- **Förslag:** 
  - Alt 1: Unificera till en funktion `showEndScreen(gameMode, players, config)`
  - Alt 2: Konsekvent namngivning `showSinglePlayerEndScreen()`, `showMultiplayerEndScreen()`
  - Använd konsekvent antingen parametrar eller state-hämtning
- **Nytta:** Enklare att underhålla, mer förutsägbar kod

### BL-012: Code Review Regression Guard Agent
- **Kategori:** FEATURE
- **Stackrank:** 40
- **Beskrivning:** Agent för kodgranskning med fokus på regressionsrisker och design-konsistens
- **Status:** ✅ COMPLETED 2025-08-23
- **Detaljer:** Agenten skapad och testad framgångsrikt

---

## ✅ Slutförda Items (endast rubriker)

Se LOG.md för detaljer om slutförda items:
- BL-002: Multiplayer Hör-till Bugg ✅
- BL-003: Slutför uiController Refaktorering ✅
- BL-004: Create DEPENDENCIES.md ✅
- BL-005: Implement Startup Validator ✅
- BL-006: Slutskärm till startmeny (multispel) ✅
- BL-012: Code Review Regression Guard Agent ✅
- BL-013: Dubbel totalpoäng-visning i singelspel ✅
- BL-014: Teknisk skuld - Duplicerad singelspel-uppdatering och död kod ✅
- BL-015: State Corruption mellan spellägen ✅
- BL-016: UI Cleanup mellan spellägen ✅
- BL-017: Challenge State Persistence Bug ✅

## ❌ Kasserade Items (endast rubriker)

Se LOG.md för detaljer om kasserade items:
- BL-001: GameLogger System ❌

---

## 📋 Mall för Nya Items

```markdown
### BL-XXX: Titel
- **Kategori:** [BUG/FEATURE/REFACTOR/DOCS]
- **Stackrank:** [Högre nummer = högre prioritet, använd 10-steg för flexibilitet]
- **Beskrivning:** [Kort beskrivning av problemet/funktionen]
```

---

*Senast uppdaterad: 2025-08-24*