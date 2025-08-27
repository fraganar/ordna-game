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
6. **BL-019** (25) - Duplicerad showChallengeAcceptScreen implementation
7. **BL-020** (20) - Duplicerad difficulty badge implementation
8. **BL-021** (15) - Komplettera CSS variables implementation
9. **BL-022** (12) - Lägg till browser fallbacks för moderna CSS-effekter

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
- **Beskrivning:** Förvirrande namn på `showGameResultScreen` som låter generell men används bara för normal singleplayer
- **Egentliga problemet:** Namnet är missvisande - strukturen är faktiskt ganska symmetrisk som den är
- **Nuvarande struktur:**
  - `endSinglePlayerGame()` → `showGameResultScreen()` för normal, ChallengeSystem för utmaningar
  - `endMultiplayerGame()` → genererar HTML direkt
- **Förslag:** 
  - Alt 1: Byt namn till `showSinglePlayerResultScreen` för tydlighet
  - Alt 2: Behåll som det är men dokumentera bättre vad funktionen gör
- **Nytta:** Mindre förvirring kring vad funktionerna faktiskt gör

### BL-019: Duplicerad showChallengeAcceptScreen implementation
- **Kategori:** REFACTOR
- **Stackrank:** 25
- **Beskrivning:** Tre olika implementationer av showChallengeAcceptScreen finns i kodbasen
- **Problem:**
  - `game.js:433` - Global async funktion (används ej)
  - `app.js` - App-klassens metod (detta är den som används)
  - `uiRenderer.js` - UIRenderer metod (används ej)
- **Åtgärd:**
  - Ta bort de oanvända versionerna i game.js och uiRenderer.js
  - Behåll endast app.js versionen som faktiskt används
- **Nytta:** Minskar förvirring, tar bort död kod, tydligare ansvarsseparation

### BL-020: Duplicerad difficulty badge implementation
- **Kategori:** REFACTOR
- **Stackrank:** 20
- **Beskrivning:** Tre olika funktioner för att uppdatera difficulty badge
- **Problem:**
  - `setDifficultyBadge(difficulty)` i game.js - global funktion som anropar UI.updateDifficultyBadge
  - `UI.updateDifficultyBadge(difficulty)` i uiRenderer.js - huvudimplementationen
  - `UI.updateDifficultyBadgeText(difficulty)` i uiRenderer.js - ytterligare en variant
  - Onödig indirektion: game.js anropar UI-metoden via wrapper-funktion
- **Åtgärd:**
  - Ta bort `setDifficultyBadge` från game.js
  - Använd `UI.updateDifficultyBadge` direkt överallt
  - Undersök om `updateDifficultyBadgeText` behövs eller kan slås ihop
- **Nytta:** Enklare kodflöde, mindre förvirring

### BL-021: Komplettera CSS variables implementation
- **Kategori:** REFACTOR
- **Stackrank:** 15
- **Beskrivning:** Vissa CSS-delar använder fortfarande hårdkodade färger istället för CSS variables
- **Problem:**
  - Rad 425-465 i styles.css har hårdkodade färger (#4b5563, #f3f4f6 etc.)
  - Inkonsekvent användning av CSS variables vs rgba() värden
  - Blandat 12px och 16px border-radius utan tydligt mönster
- **Åtgärd:**
  - Migrera alla hårdkodade färger till CSS variables
  - Standardisera border-radius värden (skapa variables för dessa)
  - Gå igenom hela styles.css och säkerställ konsekvent användning
- **Nytta:** Enklare underhåll, konsekvent design, lättare att ändra tema

### BL-022: Lägg till browser fallbacks för moderna CSS-effekter
- **Kategori:** ENHANCEMENT
- **Stackrank:** 12
- **Beskrivning:** backdrop-filter och andra moderna effekter saknar fallbacks för äldre browsers
- **Problem:**
  - backdrop-filter stöds inte i Firefox < v103
  - Kan ge dålig upplevelse i äldre browsers
  - Ingen graceful degradation implementerad
- **Åtgärd:**
  - Lägg till @supports queries för backdrop-filter
  - Skapa fallback-styles för äldre browsers
  - Testa i olika browsers och versioner
- **Nytta:** Bättre browser-kompatibilitet, fungerar för fler användare


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

*Senast uppdaterad: 2025-08-27*