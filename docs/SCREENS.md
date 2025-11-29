# Skärmdokumentation

## Om detta dokument

- Varje skärm har ett **unikt ID** (#1, #2, etc)
- ID:n **återanvänds ALDRIG** - även borttagna skärmar behåller sitt ID
- Status: `AKTIV` | `LEGACY` | `BORTTAGEN`
- Nästa lediga ID: **#22**

---

## Skärmöversikt (Snabbreferens)

| Typ | ID | Namn | Status | Visas när |
|-----|----|----- |--------|-----------|
| Resultat | #1 | Challenge Waiting | AKTIV | Singelspel avslutas (inloggad) |
| Resultat | #2 | Post-Game Share | AKTIV | Singelspel avslutas (anonym) |
| Resultat | #3 | Challenge Result | AKTIV | Avslutad challenge visas |
| Resultat | #4 | Single Player Result | LEGACY | Ej nåbar via UI |
| Resultat | #5 | Multiplayer Result | AKTIV | Multiplayer-spel (2-4 spelare) |
| Navigation | #6 | Start Screen | AKTIV | App startar |
| Spel | #7 | Game Screen | AKTIV | Spel pågår |
| Challenge | #8 | Challenge Accept | AKTIV | Öppnar challenge-länk |
| Challenge | #9 | Challenge Blocked | AKTIV | Challenge redan spelad/utgången |
| Setup | #10 | Player Setup | AKTIV | Väljer antal spelare (multiplayer) |
| Setup | #11 | Player Name Setup | AKTIV | Första besök, ange namn |
| Modal | #12 | Menu Overlay | AKTIV | Hamburgermenyn öppnas |
| Modal | #13 | Help Modal | AKTIV | Klickar "Hur det fungerar" |
| Modal | #14 | Change Name Modal | AKTIV | Klickar "Byt namn" |
| Modal | #15 | Auth Modal | AKTIV | Login/registrering |
| Modal | #16 | Logout Modal | AKTIV | Klickar "Logga ut" |
| Modal | #17 | Pack Shop Modal | AKTIV | Väljer frågepaket |
| Modal | #18 | Packs Modal | AKTIV | Klickar "Mina frågepaket" |
| Modal | #19 | Feedback Modal | AKTIV | Klickar "Rapportera problem" |
| Dialog | #20 | Confirm Dialog | AKTIV | Avbryter pågående spel |
| Dialog | #21 | Challenge Result Back Dialog | AKTIV | Går tillbaka utan att spara |

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

**Visas när:** Resultat för en avslutad challenge visas

**Triggas av:**
- Opponent spelar klart en utmaning (via delad länk)
- Challenger klickar på sin egen challenge-länk efter att opponent spelat ("Visa resultat")
- Klick på notifikation om avslutad challenge

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

### #6: Start Screen

**Status:** AKTIV

**Visas när:** App startar, eller efter "Tillbaka till start"

**Syfte:** Huvudmeny med spelval

**Implementation:**
- **Element:** `#start-screen`
- **Fil:** [index.html](../index.html)
- **Navigation:** `NavigationManager.resetToStartScreen()`

**UI-element:**
- Logotyp och välkomsttext
- "Spela nu" knapp (primär)
- "Fler spellägen" toggle
- "Mina utmaningar" sektion

---

### #7: Game Screen

**Status:** AKTIV

**Visas när:** Spel startas (singelspel eller multiplayer)

**Syfte:** Visa frågor och hantera spellogik

**Implementation:**
- **Element:** `#game-screen`
- **Fil:** [index.html](../index.html)
- **Controller:** `GameController` i [gameController.js](../js/gameController.js)

**UI-element:**
- Frågetext och svarsalternativ
- Spelarpoäng och rundinfo
- "Stanna" och "Fortsätt" knappar
- Hamburgermenyn

---

## Challenge-skärmar

### #8: Challenge Accept

**Status:** AKTIV

**Visas när:** Användare öppnar en challenge-länk

**Syfte:** Visa utmaningsinformation och låta användare acceptera

**Implementation:**
- **Element:** `#challenge-accept`
- **Fil:** [index.html](../index.html)
- **Triggas av:** `app.js` vid URL-parsing

**UI-element:**
- Utmanarens namn
- "Acceptera utmaning" knapp
- "Tillbaka" knapp

---

### #9: Challenge Blocked

**Status:** AKTIV

**Visas när:** Challenge är ogiltig (redan spelad, utgången, etc.)

**Syfte:** Informera användare om varför challenge inte kan spelas

**Implementation:**
- **Element:** `#challenge-blocked`
- **Fil:** [index.html](../index.html)
- **Triggas av:** `app.js` vid URL-parsing

**UI-element:**
- Felmeddelande
- "Tillbaka till start" knapp

---

## Setup-skärmar

### #10: Player Setup

**Status:** AKTIV

**Visas när:** Användare väljer "Fler spellägen" för multiplayer

**Syfte:** Välja antal spelare och ange spelarnamn

**Implementation:**
- **Element:** `#player-setup`
- **Fil:** [index.html](../index.html)
- **Visas via:** `eventHandlers.js`

**UI-element:**
- Antal spelare (2-4)
- Namnfält för varje spelare
- "Starta spel" knapp

---

### #11: Player Name Setup

**Status:** AKTIV

**Visas när:** Första besök, användare behöver ange namn

**Syfte:** Samla in spelarnamn för challenge-systemet

**Implementation:**
- **Element:** `#player-name-setup`
- **Fil:** [index.html](../index.html)
- **Triggas av:** `handleSavePlayerName()` i [eventHandlers.js](../js/eventHandlers.js)

**UI-element:**
- Namnfält
- "Spara" knapp

---

## Modaler

### #12: Menu Overlay

**Status:** AKTIV

**Visas när:** Användare klickar hamburgermenyn

**Syfte:** Navigeringsmeny med spelarinformation

**Implementation:**
- **Element:** `#menu-overlay`
- **Fil:** [index.html](../index.html)

**UI-element:**
- Spelarinfo (namn, inloggningsstatus)
- Menyalternativ (Tillbaka, Byt namn, Hur det fungerar, etc.)
- Logga in/ut knapp

---

### #13: Help Modal

**Status:** AKTIV

**Visas när:** Användare klickar "Hur det fungerar"

**Syfte:** Förklara spelregler detaljerat

**Implementation:**
- **Element:** `#help-modal`
- **Fil:** [index.html](../index.html)

**UI-element:**
- Detaljerade spelregler
- Frågetypsförklaringar
- Stäng-knapp

---

### #14: Change Name Modal

**Status:** AKTIV

**Visas när:** Användare klickar "Byt namn"

**Syfte:** Låta användare ändra sitt spelarnamn

**Implementation:**
- **Element:** `#change-name-modal`
- **Fil:** [index.html](../index.html)

**UI-element:**
- Namnfält
- "Spara" och "Avbryt" knappar

---

### #15: Auth Modal

**Status:** AKTIV

**Visas när:** Användare behöver logga in eller registrera sig

**Syfte:** Firebase-autentisering

**Implementation:**
- **Element:** `#auth-modal`
- **Fil:** [index.html](../index.html)
- **Integration:** Firebase Auth UI

**UI-element:**
- FirebaseUI container
- Inloggningsformulär
- Felmeddelanden

---

### #16: Logout Modal

**Status:** AKTIV

**Visas när:** Användare klickar "Logga ut"

**Syfte:** Bekräfta utloggning

**Implementation:**
- **Element:** `#logout-modal`
- **Fil:** [index.html](../index.html)

**UI-element:**
- Bekräftelsetext
- "Logga ut" och "Avbryt" knappar

---

### #17: Pack Shop Modal

**Status:** AKTIV

**Visas när:** Användare väljer frågepaket

**Syfte:** Visa tillgängliga frågepaket

**Implementation:**
- **Element:** `#pack-shop-modal`
- **Fil:** [index.html](../index.html)
- **Controller:** `GameData.populatePackSelectors()`

**UI-element:**
- Grid med paketkort
- Paketinfo (namn, antal frågor)
- Välj-knapp

---

### #18: Packs Modal

**Status:** AKTIV

**Visas när:** Användare klickar "Mina frågepaket"

**Syfte:** Visa användarens sparade frågepaket

**Implementation:**
- **Element:** `#packs-modal`
- **Fil:** [index.html](../index.html)

**UI-element:**
- Lista över sparade paket
- Stäng-knapp

---

### #19: Feedback Modal

**Status:** AKTIV

**Visas när:** Användare klickar "Rapportera problem"

**Syfte:** Samla in feedback och buggrapporter

**Implementation:**
- **Element:** `#feedback-modal`
- **Fil:** [index.html](../index.html)

**UI-element:**
- Kategoriväljare (Bug, Fråga, Förslag, Annat)
- Meddelandefält
- "Skicka" knapp

---

## Dialogs

### #20: Confirm Dialog

**Status:** AKTIV

**Visas när:** Användare försöker avbryta pågående spel

**Syfte:** Bekräfta att användaren vill avbryta

**Implementation:**
- **Element:** `#confirm-dialog`
- **Fil:** [index.html](../index.html)

**UI-element:**
- "Avbryta spelet?" text
- "Ja" och "Nej" knappar

---

### #21: Challenge Result Back Dialog

**Status:** AKTIV

**Visas när:** Anonym användare går tillbaka från challenge-resultat

**Syfte:** Varna att resultat inte sparas

**Implementation:**
- **Element:** `#challenge-result-back-dialog`
- **Fil:** [index.html](../index.html)

**UI-element:**
- Varningstext om att resultat går förlorat
- "Bekräfta" och "Avbryt" knappar

**Button IDs:**
- `#challenge-result-back-confirm-btn` - Bekräfta tillbaka
- `#challenge-result-back-cancel-btn` - Avbryt

---

## Historik

- Lagt till alla skärmar #6-#21 (navigation, challenge, setup, modaler, dialogs)
- Skärm #4 markerad som LEGACY (singelspel utan challenge ej längre nåbar)
- Dokument skapat med resultatskärmar #1-#5
