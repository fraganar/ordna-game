# Ordna Game - Backlog

**OBS: Detta dokument ska hållas kortfattat!** Endast information som behövs för pågående eller kommande arbete ska finnas här. Historisk information finns i LOG.md.

## 📋 Prioritetsordning

### Pågående arbete
*Inget pågående arbete just nu*

### Kommande arbete (sorterat efter stackrank - högst första)

1. **BL-009** (60) - Poänganimering före totalpoäng
2. **BL-026** (45) - Admin-panel: Manuell playerId-redigering
3. **BL-025** (40) - Account Recovery UI
4. **BL-023** (35) - Säkra Firebase med autentisering
5. **BL-018** (30) - Unificera slutskärmsfunktioner
6. **BL-019** (25) - Duplicerad showChallengeAcceptScreen implementation
7. **BL-020** (20) - Duplicerad difficulty badge implementation
8. **BL-022** (12) - Lägg till browser fallbacks för moderna CSS-effekter
9. **BL-024** (10) - Redesigna "Hör till"-knappar enligt ny mockup

---

## 📝 Backlog Items

### BL-009: Poänganimering före totalpoäng
- **Kategori:** BUG
- **Stackrank:** 60
- **Beskrivning:** Totalpoäng ökar före animationen landar i multi och kanske i singel också

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

### BL-026: Admin-panel - Manuell playerId-redigering för challenges
- **Kategori:** FEATURE
- **Stackrank:** 45
- **Beskrivning:** Lägg till funktion i admin.html för att manuellt lägga till/ändra playerId för challenges
- **Implementation:**
  - Använd `FirebaseAPI.updateChallenge()` (finns redan i firebase-config.js!)
  - UI för att söka challenge och uppdatera playerId-fält
- **Användningsfall:** Återställa gamla challenges genom att manuellt sätta rätt playerId
- **Benefit:** Löser migration-problemet för enskilda användare manuellt
- **Tidsuppskattning:** 30-60 minuter

### BL-025: Account Recovery UI - Återställ konto via playerId
- **Kategori:** FEATURE
- **Stackrank:** 40
- **Beskrivning:** Lägg till funktion för att återställa konto på annan enhet via playerId
- **Implementation:**
  - Använd `FirebaseAPI.verifyPlayerId()` (finns redan i firebase-config.js rad 250-265)
  - Flow: Prompt för playerId → Verifiera mot Firebase → Återställ localStorage → Reload
  - Kan läggas i settings eller som dialog
- **Användningsfall:** Användare byter enhet eller rensar localStorage och vill få tillbaka sitt konto och challenge-historik
- **Benefit:** Löser cross-device-problemet som gjorde migration-modulen omöjlig
- **Tidsuppskattning:** 1-2 timmar

### BL-024: Lägg till subtil färgad ram runt "Hör till"-knappar
- **Kategori:** ENHANCEMENT
- **Stackrank:** 10
- **Beskrivning:** Lägg till en mycket subtil färgad ram runt ja/nej-knapparna enligt mockup
- **Detaljer:**
  - VIKTIGT: Endast en subtil färgändring på ramen runt knapparna
  - Mycket lätt grön ton för ja-knappen
  - Mycket lätt röd ton för nej-knappen
  - Behåll nuvarande layout och struktur - knapparna är redan integrerade
  - Se mockup: `./docs/images/ide_för_hör_till_knappar.png`
- **Fördelar:**
  - Ger lite mer visuell vägledning utan att störa designen
  - Bibehåller den minimalistiska estetiken
- **Nytta:** Subtilt förbättrad tydlighet för "Hör till"-knappar

![Mockup för subtil färg på "Hör till"-knappar](./docs/images/ide_för_hör_till_knappar.png)

### BL-023: Säkra Firebase med autentisering
- **Kategori:** SECURITY
- **Stackrank:** 35
- **Beskrivning:** Implementera Firebase Authentication så bara appen kan läsa/skriva till databasen
- **Problem:**
  - Firebase security rules är för närvarande helt öppna
  - Firebase varnar om osäkra regler och hotar med att stänga databasen
  - Vem som helst kan teoretiskt läsa/skriva data
- **Åtgärd - Firebase Console:**
  1. Gå till Firebase Console → Authentication → Sign-in method
  2. Aktivera "Anonymous" och klicka Save
  3. Gå till Firestore Database → Rules
  4. Ersätt med följande security rules:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```
  5. Klicka "Publish" för att aktivera reglerna
- **Åtgärd - Kodändringar:**
  1. **index.html** (rad 47, efter firebase-firestore script):
     ```html
     <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
     ```
  2. **js/firebase-config.js**:
     - Lägg till variabel efter rad 15: `let authInitialized = false;`
     - Gör `initializeFirebase()` async på rad 17: `async function initializeFirebase() {`
     - Lägg till efter rad 35 (efter `firebaseInitialized = true;`):
       ```javascript
       // Initialize anonymous authentication
       try {
           await firebase.auth().signInAnonymously();
           authInitialized = true;
           console.log('Firebase Auth initialized (anonymous)');
       } catch (authError) {
           console.error('Auth initialization failed:', authError);
       }
       ```
- **Nytta:** Säkrare databas, uppfyller Firebase krav, förhindrar missbruk utan att kräva användarregistrering


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
- BL-021: Komplettera CSS variables implementation ✅
- BL-028: Komprimera poängvisning i "Mina utmaningar" ✅
- BL-010: Utmana-knapp efter alla spellägen ✅
- BL-008: Visa poäng i utmaningsresultat ✅
- BL-027: Omdesigna huvudnavigering - Challenge som primärt spelläge ✅
- BL-007: Revanschknapp utmaning ✅

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