# Ordna Game - Backlog

**OBS: Detta dokument ska hållas kortfattat!** Endast information som behövs för pågående eller kommande arbete ska finnas här. Historisk information finns i LOG.md.

## 📋 Prioritetsordning

### Pågående arbete
*Inget pågående arbete just nu*

### Kommande arbete (sorterat efter stackrank - högst första)

1. **BL-015** (120) - State Corruption mellan spellägen
2. **BL-016** (115) - UI Cleanup mellan spellägen  
3. **BL-017** (105) - Challenge State Persistence Bug
4. **BL-006** (90) - Slutskärm till startmeny (multispel)
5. **BL-007** (80) - Revanschknapp utmaning 
6. **BL-008** (70) - Visa poäng i utmaningsresultat
7. **BL-009** (60) - Poänganimering före totalpoäng
8. **BL-010** (50) - Utmana-knapp efter alla spellägen

---

## 📝 Backlog Items

### BL-015: State Corruption mellan spellägen
- **Kategori:** BUG
- **Stackrank:** 120
- **Beskrivning:** State från tidigare spellägen (challenge/singelspel) visas i multiplayer-resultat
- **Symptom:** Multiplayer visar namn och poäng från tidigare challenge eller singelspel-UI
- **Root cause:** Challenge state och UI-element rensas aldrig mellan spellägen
- **Åtgärd:** Implementera proper state cleanup vid övergång mellan spellägen
- **Dokumentation:** Se BL-014_STATE_CORRUPTION_ANALYSIS.md för fullständig analys

### BL-016: UI Cleanup mellan spellägen
- **Kategori:** BUG  
- **Stackrank:** 115
- **Beskrivning:** UI-element från olika spellägen staplas på varandra istället för att ersättas
- **Symptom:** Challenge-UI synlig under multiplayer, singelspel-UI synlig under multiplayer
- **Åtgärd:** Force hide konkurrerande UI-element i början av endMultiplayerGame() och endSinglePlayerGame()

### BL-017: Challenge State Persistence Bug  
- **Kategori:** BUG
- **Stackrank:** 105 
- **Beskrivning:** Challenge skapas med 0 poäng och hoppar direkt till resultat
- **Symptom:** Vid challenge-skapande: "Should end? true" från första frågan
- **Root cause:** Game state inte korrekt rensat från föregående spel

### BL-006: Slutskärm till startmeny (multispel)
- **Kategori:** BUG
- **Stackrank:** 90
- **Beskrivning:** Knappen på sista skärmen efter multiplayer-läget går inte tillbaka till startskärmen

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
- BL-012: Code Review Regression Guard Agent ✅
- BL-013: Dubbel totalpoäng-visning i singelspel ✅
- BL-014: Teknisk skuld - Duplicerad singelspel-uppdatering och död kod ✅

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

*Senast uppdaterad: 2025-08-23*