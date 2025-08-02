# Ordna Game - Project Documentation

## About the Game
Ett klurigt frågespel där spelare tävlar om vem som vågar chansa mest. Inom varje fråga bygger du upp poäng steg för steg, men ett fel svar ger noll poäng för hela frågan (tidigare intjänade poäng påverkas ej). Två spellägen: singelspelare (visar stjärnor) och multiplayer (spelare turas om). Frågetyper: "Ordna" (sortera alternativ i rätt ordning) och "Hör till" (bedöm vilka alternativ tillhör kategorin).

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
- `js/game.js`: Core game logic and question loading
- `css/styles.css`: All styling including responsive design
- `data/questions-grund.json`: Game questions with pack assignments
- `data/`: Directory for additional question files

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