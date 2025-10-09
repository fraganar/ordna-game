# Ordna Game - Backlog

**OBS: Detta dokument ska hållas kortfattat!** Endast information som behövs för pågående eller kommande arbete ska finnas här. Historisk information finns i LOG.md.

## 📋 Prioritetsordning

### Pågående arbete
*Inget pågående arbete just nu*

### Kommande arbete (sorterat efter stackrank - högst första)

1. **BL-034** (100) - Identitetsförvirring vid länköppning på samma enhet
2. **BL-009** (60) - Poänganimering före totalpoäng
3. **BL-026** (45) - Admin-panel: Manuell playerId-redigering
4. **BL-025** (40) - Account Recovery UI
5. **BL-023** (35) - Säkra Firebase med autentisering
6. **BL-033** (25) - Progressbar fungerar inte i challenge-läge som opponent
7. **BL-032** (15) - Admin-panel visar inga challenges
8. **BL-022** (12) - Lägg till browser fallbacks för moderna CSS-effekter
9. **BL-024** (10) - Redesigna "Hör till"-knappar enligt ny mockup

---

## 📝 Backlog Items

### BL-009: Poänganimering före totalpoäng
- **Kategori:** BUG
- **Stackrank:** 60
- **Beskrivning:** Totalpoäng ökar före animationen landar i multi och kanske i singel också

### BL-034: Identitetsförvirring vid länköppning på samma enhet
- **Kategori:** BUG
- **Stackrank:** 100 (HÖGSTA PRIORITET)
- **Beskrivning:** Förvirring kring spelaridentitet när man öppnar appen via olika länkar (challenge, normal start) på samma enhet
- **Problem:** Om man först spelar normalt (får playerId A), sedan öppnar en challenge-länk som opponent, kan systemet använda fel identitet
- **Root cause:** localStorage playerId/playerName kan bli ur synk med användarens förväntade identitet
- **Impact:** KRITISK - Challenges sparas med fel playerId, användaren ser inte sina egna challenges
- **Exempel-scenario:**
  1. Användare spelar normalt på sin telefon (blir playerId_123)
  2. Samma användare öppnar challenge-länk från vän på samma telefon
  3. Systemet använder playerId_123 för opponent (fel!)
  4. Challenge registreras med fel opponent-ID
- **Lösningsriktning:** Behöver session-based identity eller explicit "Vem spelar?"-prompt vid challenge-accept

### BL-033: Progressbar fungerar inte i challenge-läge som opponent
- **Kategori:** BUG
- **Stackrank:** 25
- **Beskrivning:** När man spelar som utmanad (opponent) så visas inte progressbaren korrekt under spelet
- **Impact:** Användaren ser inte hur långt hen kommit i utmaningen
- **Note:** Inte en regression - befintlig bug

### BL-032: Admin-panel visar inga challenges
- **Kategori:** BUG
- **Stackrank:** 15
- **Beskrivning:** Admin-panelen (admin.html) visar inte challenges från Firebase trots att de finns i databasen
- **Root cause:** Okänd - inte en regression, har inte fungerat sedan början
- **Impact:** Admin-funktionalitet fungerar inte, men påverkar inte slutanvändare

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
- BL-029: Konsolidera selectedPack till en källa ✅
- BL-020: Duplicerad difficulty badge implementation ✅
- BL-019: Duplicerad showChallengeAcceptScreen implementation ✅
- BL-018: Unificera slutskärmsfunktioner ✅
- BL-031: Konsolidera navigation till start screen ✅
- BL-030: Refaktorera opponent completion till challengeSystem ✅
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

*Senast uppdaterad: 2025-10-09*