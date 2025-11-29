# Skärmdokumentation

## Om detta dokument

- Varje skärm har ett **unikt ID** (#1, #2, etc)
- ID:n **återanvänds ALDRIG** - även borttagna skärmar behåller sitt ID
- Status: `AKTIV` | `LEGACY` | `BORTTAGEN`
- Nästa lediga ID: **#6**

---

## Skärmöversikt (Snabbreferens)

| ID | Namn | Typ | Status | Visas när |
|----|------|-----|--------|-----------|
| #1 | Challenge Waiting | Resultat | AKTIV | Singelspel avslutas (inloggad) |
| #2 | Post-Game Share | Resultat | AKTIV | Singelspel avslutas (anonym) |
| #3 | Challenge Result | Resultat | AKTIV | Opponent avslutar utmaning |
| #4 | Single Player Result | Resultat | LEGACY | Ej nåbar via UI |
| #5 | Multiplayer Result | Resultat | AKTIV | Multiplayer-spel (2-4 spelare) |

---

## Resultatskärmar

### #1: Challenge Waiting

**Status:** AKTIV

**Visas när:** Inloggad användare avslutar singelspel via "Spela nu"

**Syfte:** Visa poäng och ge möjlighet att dela utmaningslänk

**Implementation:**
- **Renderer:** `ResultScreenRenderer._renderChallengeWaiting()`
- **Fil:** [resultScreenRenderer.js](../js/resultScreenRenderer.js)
- **Anropas från:** `ChallengeSystem.showWaitingForOpponentView()` i [challengeSystem.js](../js/challengeSystem.js)

**UI-element:**
- Rubrik: "Bra kämpat!"
- Poäng i cirkel-badge
- Challenge-länk (readonly input)
- Knappar: "Kopiera länk" (turkos), "Dela" (orange)
- "Tillbaka till start" (vit)

**Button IDs:**
- `#copy-link-created` - Kopiera länk
- `#share-created` - Dela via Web Share API
- `#restart-btn` - Tillbaka till start

---

### #2: Post-Game Share

**Status:** AKTIV

**Visas när:** Anonym användare avslutar singelspel via "Spela nu"

**Syfte:** Visa poäng och uppmana till inloggning för att dela

**Implementation:**
- **Renderer:** `ResultScreenRenderer._renderPostGameShare()`
- **Fil:** [resultScreenRenderer.js](../js/resultScreenRenderer.js)
- **Anropas från:** `showPostGameShareScreen()` i [game.js](../js/game.js)

**UI-element:**
- Rubrik: "Bra kämpat!"
- Poäng i cirkel-badge
- Info-text om att skapa konto
- Knappar: "Skapa konto / logga in" (gradient), "Tillbaka till start" (vit)

**Button IDs:**
- `#share-challenge-btn` - Triggar login-flöde
- `#post-game-play-again-btn` - Tillbaka till start

---

### #3: Challenge Result

**Status:** AKTIV

**Visas när:** Opponent avslutar en utmaning (via delad länk)

**Syfte:** Visa jämförelse mellan challenger och opponent

**Implementation:**
- **Renderer:** `ResultScreenRenderer.renderChallengeResult()`
- **Fil:** [resultScreenRenderer.js](../js/resultScreenRenderer.js)
- **Anropas från:** `ChallengeSystem.showChallengeResultView()` i [challengeSystem.js](../js/challengeSystem.js)

**UI-element:**
- Rubrik: "Utmaning avslutad!"
- Två-kolumners jämförelse (namn, poäng, per-fråga-poäng)
- Vinnarmeddelande med emoji
- Knappar beroende på inloggningsstatus

**Button IDs (anonym):**
- `#opponent-result-login-btn` - Logga in och spara
- `#opponent-result-back-btn` - Tillbaka (visar bekräftelsedialog)

**Button IDs (inloggad):**
- `#back-to-start-result` - Tillbaka till start

---

### #4: Single Player Result

**Status:** LEGACY (ej nåbar via UI)

**Visades när:** Singelspel via "Fler spellägen" → 1 spelare (detta alternativ finns inte längre i UI)

**Syfte:** Visa poäng efter singelspel utan challenge-systemet

**Implementation:**
- **Funktion:** `showSinglePlayerResultScreen()`
- **Fil:** [game.js](../js/game.js)
- **Koden finns kvar** men kan inte triggas via användargränssnittet

**Anledning till LEGACY:** Singelspel går nu alltid via "Spela nu" som skapar challenge. Alternativet "1 spelare" under "Fler spellägen" togs bort.

---

### #5: Multiplayer Result

**Status:** AKTIV

**Visas när:** Multiplayer-spel (2-4 spelare) avslutas

**Syfte:** Visa rankinglista med medaljer

**Implementation:**
- **Renderer:** `ResultScreenRenderer.renderMultiplayerResult()`
- **Fil:** [resultScreenRenderer.js](../js/resultScreenRenderer.js)
- **Anropas från:** `endMultiplayerGame()` i [game.js](../js/game.js)

**UI-element:**
- Rubrik: "Spelet är slut!"
- Undertitel: "Bra kämpat allihopa!"
- Rankinglista med medaljer (🥇🥈🥉)
- "Tillbaka till start" knapp

**Button IDs:**
- `#back-to-start-final` - Tillbaka till start

---

## Navigeringsskärmar

*(Läggs till i framtida uppdatering)*

---

## Historik

- Skärm #4 markerad som LEGACY (singelspel utan challenge ej längre nåbar)
- Dokument skapat med resultatskärmar #1-#5
