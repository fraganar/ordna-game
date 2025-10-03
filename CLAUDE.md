# Tres Mangos - Project Documentation

## About the Game
Ett klurigt frågespel där spelare tävlar om vem som vågar chansa mest. Spela ensam eller med vänner (2-6 spelare) i denna interaktiva quiz där strategiskt risktagande är nyckeln till framgång.

## Hur man spelar

### Starta spelet
1. Öppna `index.html` i en webbläsare (eller kör via lokal server)
2. Välj antal spelare (1 för singelspelare, 2-6 för multiplayer)
3. Ange spelarnamn
4. Välj frågepaket (valfritt)
5. Börja spela!

### Spelregler

**Grundläggande mekanik:**
- **Poängsamling**: Varje rätt svar bygger upp din personliga pott för rundan
- **Riskhantering**: Klicka på "Stanna" för att säkra din pott som poäng och stå över resten av rundan
- **Elimination**: Ett fel svar nollställs din pott och du åker ut ur rundan (tidigare intjänade poäng behålls)
- **Turordning** (endast multiplayer): Spelarna turas om, aktiv spelare markeras med blå ram

**Frågetyper:**
- **"Ordna"**: Klicka på alternativen i rätt ordning (t.ex. sortera länder efter storlek)
- **"Hör till"**: Bedöm varje alternativ med ja/nej (t.ex. vilka är huvudstäder?)

**Känsla:**
Vågar du chansa? Stanna eller fortsätt - valet är ditt! Ett fel och rundans poäng är förlorade!

### Valmöjligheter i spelet

**Från huvudmenyn kan användaren:**
- **🥭 Spela nu (Primärt)** - Spela 12 frågor i challenge-format. Efter spelet kan du välja att dela länken för att utmana någon, eller bara behålla dina poäng för dig själv
- **⚡ Fler spellägen (Sekundärt)** - Lokal multiplayer för 2-4 spelare samtidigt på samma enhet (bra för storbildsskärm eller att spela tillsammans)
- **Mina utmaningar** - Se dina aktiva utmaningar och vem som svarat

**Navigation Redesign (BL-027):**
Challenge-flödet är nu det primära sättet att spela. Single-player och challenge har integrerats - du spelar alltid samma 12 frågor, men kan välja om du vill dela länken efteråt eller inte. Lokal multiplayer (2-4 spelare) är nu bakom en toggle för användare som vill spela tillsammans på samma enhet.

## Tech Stack
- Frontend: Vanilla JavaScript (ES6+), HTML5, CSS3
- Data: JSON files in `/data/` directory
- Hosting: Netlify with GitHub integration
- Local server: Python HTTP server

## Commands
- `python3 -m http.server 8000`: Start local development server
- `git add . && git commit -m "message"`: Commit changes
- `git push`: Deploy to production (automatic via Netlify)
- `./deploy.sh`: Quick deploy script (commit + push)
- **Before committing**: Test both single and multiplayer modes thoroughly, including elimination scenarios
- **Code review question**: Does this change fit the architecture or am I patching? Are animations coordinated with state changes?

## Challenge System Architecture Principle
**Viktig separation of concerns för att undvika hybrid-system buggar:**

- **localStorage** = Persistent Identity
  - `playerId`: Unik identifierare per enhet
  - `playerName`: Användarens valda namn
  - **Använd för**: Skapa challenges, identifiera spelare i Firebase

- **PlayerManager** = Game State (temporary)
  - Active player, turn order, round scores
  - **Använd för**: Spellogik, turordning, rundpoäng
  - **Använd INTE för**: Persistent data som sparas till Firebase

- **Firebase** = Challenge Data (persistent)
  - Questions, scores, status, player records
  - **Använd för**: Dela challenges mellan enheter

**Regel:** Använd ALDRIG PlayerManager för persistent data som player names i challenges. Hämta alltid identitet från localStorage när du skapar Firebase-records.

**Varför?** PlayerManager innehåller temporär spelstatus som kan ändras under spel. Detta skapade buggar där fel spelarnamn sparades i challenges (se docs/archive/FIREBASE_MIGRATION_PLAN.md rad 997-1040).

## Refactoring Guidelines

**Innan refaktorering:**
1. Dokumentera nuvarande state - vilka funktioner finns var
2. Definiera målarkitektur - vad ska ägas av vad
3. Skapa migreringsplan - steg-för-steg
4. Skriv tester för kritiska flöden

**Under refaktorering:**
1. En förändring i taget - flytta/ersätt en funktion
2. Testa efter varje steg
3. Ta bort gamla funktioner efter nya bekräftats fungera
4. Commit ofta med tydliga meddelanden

**Efter refaktorering:**
1. Validera alla användarflöden
2. Uppdatera dokumentation
3. Kör code review agent

**Varning:** Dubbletter av funktioner (gamla + nya) skapar förvirring. Ersätt, integrera inte.

## Firebase Challenge System - Teknisk Översikt

**Implementation Status:** ✅ Komplett (Se docs/archive/FIREBASE_MIGRATION_PLAN.md för full historik)

**Arkitektur:**
- **players collection**: Spelaridentitet synkas från localStorage till Firebase
- **challenges collection**: Challenge-data (questions, scores, status)
- **Cache**: 5 min TTL i minnet för prestanda
- **Error handling**: Minimal (user-friendly meddelanden på kritiska ställen)
- **Demo mode**: Fungerar offline när Firebase ej tillgänglig

**Kritiska buggar som lösts:**
- Fel challenger-namn (hybrid-system problem) - rad 154 & 788 i challengeSystem.js
- Cache uppdateras inte direkt - invalidering i completeChallenge()
- localStorage/Firebase migration - borttagen pga per-device limitation
- window.FirebaseAPI export saknades - gjorde att namn inte sparades (2025-01-12)

**Design-beslut:**
- localStorage = Persistent identity (playerId, playerName)
- Firebase = Challenge data + player records
- Ingen retry-logik (Firebase är extremt pålitlig)

## Player Name Management

**Design-princip:**
- Dummy-namn genereras automatiskt vid första besök (`Spelare_12345`)
- Dummy-namn är OK internt men triggar prompt vid publika funktioner (challenges)
- Riktiga namn synkas omedelbart till Firebase när användaren anger dem
- Firebase-restore prioriterar riktiga namn över dummy-namn (för device switching)

**Implementation:**
- `isDummyName(name)` - Helper för att detektera dummy-namn (app.js rad 3-7)
- `window.FirebaseAPI` - Global export för Firebase-operationer (firebase-config.js rad 390)
- `PlayerManager.getPlayerName()` - Returnerar null för dummy-namn → triggar prompt
- `PlayerManager.setPlayerName(name)` - Synkar automatiskt till Firebase
- `handleSavePlayerName()` - Explicit Firebase-sync när användare anger namn (eventHandlers.js)

**Namn-flöde:**
1. Ny användare → Dummy-namn skapas lokalt (`Spelare_xxxxx`)
2. Användare klickar "Spela nu" → Prompt visas (getPlayerName() returnerar null)
3. Användare anger "Anna" → Sparas till localStorage + Firebase
4. Vid nästa besök → "Anna" laddas från Firebase om localStorage rensats

**Viktigt:**
- Dummy-namn sparas i både localStorage OCH Firebase (temporärt)
- Firebase-namn uppdateras när användare anger riktigt namn
- Internt kan kod använda `currentPlayer.name` direkt (alltid definierad)
- Publikt använd `getPlayerName()` (returnerar null för dummy)

## Local Development
1. Start local server: `python3 -m http.server 8000`
2. Open browser: `http://localhost:8000`
3. Test both single player and multiplayer modes
4. Check browser console for any errors

## Deployment Workflow
1. Make changes locally
2. Test with local server (http://localhost:8000)
3. Run `./deploy.sh` or manually:
   - `git add .`
   - `git commit -m "descriptive message"`
   - `git push`
4. Netlify automatically builds and deploys (1-2 minutes)
5. Check live site at your Netlify URL

## Project Structure
- `index.html`: Main entry point
- `hur-det-fungerar.html`: Detailed help page explaining game mechanics
- `js/game.js`: Core game logic and question loading
- `css/styles.css`: All styling including responsive design
- `data/questions-grund.json`: Game questions with pack assignments
- `data/`: Directory for additional question files
- `GAME_SPECIFICATION.md`: Complete technical game specification with critical test scenarios

## Challenge System
- **Blind Challenge**: Players compete on same 12 questions without seeing opponent's score
- **Flow**: Challenger plays → Gets shareable link → Opponent plays same questions → Results compared
- **Data**: Firebase stores questions + scores, localStorage tracks user's challenges
- **Views**: Waiting screen (with polling), Result comparison, "My Challenges" list
- **Features**: WhatsApp sharing, 7-day expiration, duplicate play prevention

## Admin Panel
Admin-panelen (`admin.html` och `js/adminPanel.js`) är designad som en separat modul från huvudspelet.

**Designval:**
- Admin-sidan har sin egen arkitektur och behöver inte följa spelets patterns
- Den laddas bara från `admin.html` och påverkar inte spelupplevelsen
- Kan växa och utvecklas självständigt för debugging och dataanalys
- Prioriterar funktionalitet och insyn över kodelegans

Detta är ett medvetet val för att hålla admin-funktionalitet helt separerad från spelkoden.

## Important Notes
- App requires HTTP server (not file://) for JSON loading
- Questions are loaded asynchronously via fetch API
- CSS includes fixes for green line bug in decision buttons
- Game supports both single player and multiplayer modes

## Code Style
- Use ES6+ features (const/let, arrow functions, async/await)
- Keep functions focused and well-named
- Maintain separation between data (JSON) and logic (JS)
- Use semantic HTML and responsive CSS

## Code Quality & Technical Debt Prevention
- **Think before you patch**: Consider if your change fits the existing architecture
- **Refactor when adding features**: Don't just add code, improve what's there
- **Keep functions focused**: One responsibility per function
- **Use unified architecture**: Leverage the player-based system for both single/multiplayer
- **Avoid quick fixes**: Short-term patches often become long-term technical debt
- **For technical architecture patterns**: See `DEPENDENCIES.md` for animation coordination, callback patterns, and debugging insights

## Före commit - Kritisk checklista
**Se "⚠️ Kritiska scenarier" i GAME_SPECIFICATION.md** - dessa 5 scenarier måste alltid testas.

Speciellt viktigt vid ändringar i:
- `playerManager.js` - turordning och spelarstate
- `animationEngine.js` - animation callbacks
- `gameController.js` - elimination och auto-säkring

Snabbtest multiplayer: Kan spelare 2 fortsätta efter att spelare 1 eliminerats?

## Detaljerad Dokumentation
- **Spelspecifikation**: För djup teknisk specifikation av spelmekanik, UI-flöden och datastrukturer, se `GAME_SPECIFICATION.md`
- **Styling & Design**: För komplett styling-dokumentation, färgschema och CSS-arkitektur, se `STYLING_MAP.md`