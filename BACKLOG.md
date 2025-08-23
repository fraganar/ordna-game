# Ordna Game - Backlog

**OBS: Detta dokument ska hållas kortfattat!** Endast information som behövs för pågående eller kommande arbete ska finnas här. Historisk information finns i LOG.md.

## 📋 Prioritetsordning

### Pågående arbete
*Inget pågående arbete just nu*

### Kommande arbete (sorterat efter stackrank - högst först)

1. **BL-013** (100) - Dubbel totalpoäng-visning i singelspel
2. **BL-006** (90) - Slutskärm till startmeny (multispel)
3. **BL-007** (80) - Revanschknapp utmaning 
4. **BL-008** (70) - Visa poäng i utmaningsresultat
5. **BL-009** (60) - Poänganimering före totalpoäng
6. **BL-010** (50) - Utmana-knapp efter alla spellägen

---

## 📝 Backlog Items

### BL-013: Dubbel totalpoäng-visning i singelspel
- **Kategori:** BUG
- **Stackrank:** 100
- **Beskrivning:** I singelspelläge visas två totalpoäng-element, varav ett alltid visar 0 poäng. Detta är förvirrande för användaren

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