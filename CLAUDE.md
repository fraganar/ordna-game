# Ordna Game - Project Documentation

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
- **Spela själv** - Välj 1 spelare för att spela ensam och samla poäng (visas som "Totalpoäng: X")
- **Spela med vänner** - Välj 2-6 spelare för att tävla mot varandra lokalt
- **Utmana någon** - Skapa en utmaning och bjud in en vän via delbar länk (se Challenge System nedan för detaljer)
- **Mina utmaningar** - Se dina aktiva utmaningar och vem som svarat
- **Välj frågepaket** - Aktivera/avaktivera olika frågepaket för variation (INAKTIVERAD - funktion under utveckling)

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
- **Before committing**: Test both single and multiplayer modes thoroughly
- **Code review question**: Does this change fit the architecture or am I patching?

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
- `planning/GAME_SPECIFICATION.md`: Complete technical game specification

## Challenge System
- **Blind Challenge**: Players compete on same 5 questions without seeing opponent's score
- **Flow**: Challenger plays → Gets shareable link → Opponent plays same questions → Results compared
- **Data**: Firebase stores questions + scores, localStorage tracks user's challenges
- **Views**: Waiting screen (with polling), Result comparison, "My Challenges" list
- **Features**: WhatsApp sharing, 7-day expiration, duplicate play prevention

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

## Detaljerad Dokumentation
För djup teknisk specifikation av spelmekanik, UI-flöden och datastrukturer, se `planning/GAME_SPECIFICATION.md`