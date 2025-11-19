# Question Ratings System - Specifikation

## Översikt
System för att låta användare betygsätta frågor på en skala 1-10. Data sparas i Firebase och visas i admin-panelen för kvalitetsanalys.

---

## Användarflöde (Frontend)

### 1. När ska betygsättning visas?
- **Efter varje besvarad fråga** i single-player mode
- **Inte i multiplayer mode** (2+ spelare på samma enhet)
- **Okej i challenge mode** (användaren spelar ensam även om det senare delas)

### 2. Var ska betygsättningen visas?
- I `#rating-container` div (placerad efter `#footer-area` i `#game-screen`)
- Visas EFTER att frågan är helt besvarad (alla alternativ klickade)
- Visas med ~800ms delay för att låta animationer slutföras först

### 3. UI-design
```
┌─────────────────────────────────────────┐
│  Hur tycker du om denna fråga?          │
│                                         │
│  [1] [2] [3] [4] [5] [6] [7] [8] [9] [10] │
│                                         │
│  Dålig                          Utmärkt │
└─────────────────────────────────────────┘
```

**Styling:**
- Gradient purple bakgrund (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)
- Vita knappar med hover-effekt (skala upp till 1.1)
- Hover-highlight: Alla knappar upp till den hovrade lyser upp
- Responsiv: Mindre knappar på mobil (36px vs 45px)

### 4. Beteende

**Om användaren INTE redan betygsatt frågan:**
- Visa 10 klickbara knappar (1-10)
- När användaren klickar: Spara betyg till Firebase
- Visa success-meddelande: "✅ Tack för ditt betyg! Du gav: 7/10 • Genomsnitt: 7.2/10 (15 röster)"
- Auto-dölj efter 3 sekunder

**Om användaren REDAN betygsatt frågan:**
- Visa meddelande: "Du har redan betygsatt denna fråga: 7/10"
- Inga knappar (spam-skydd)

**När användaren går till nästa fråga:**
- Dölj rating-container

---

## Teknisk Implementation

### Firebase Collection Structure
```
questionRatings/{questionId}
  ├── ratings: [
  │    {playerId: "RD0Sd8ph...", rating: 7, timestamp: Timestamp},
  │    {playerId: "xyz123...", rating: 9, timestamp: Timestamp}
  │   ]
  ├── averageRating: 8.0
  ├── totalRatings: 2
  ├── ratingDistribution: {1: 0, 2: 0, ..., 7: 1, 8: 0, 9: 1, 10: 0}
  └── lastUpdated: Timestamp
```

**Viktigt:** Endast ratings och statistik sparas i Firebase. Ingen frågedata dupliceras (single source of truth = JSON-filer).

### Firebase API-metoder (js/firebase-config.js)

```javascript
// Lägg till betyg (1-10)
await FirebaseAPI.rateQuestion(questionId, playerId, rating);
// Returns: {averageRating: 7.5, totalRatings: 42}

// Kolla om användaren redan betygsatt
await FirebaseAPI.hasUserRatedQuestion(questionId, playerId);
// Returns: {hasRated: true, rating: 7}

// Hämta statistik för en fråga
await FirebaseAPI.getQuestionRating(questionId);
// Returns: {averageRating: 7.5, totalRatings: 42, ratingDistribution: {...}}

// Hämta alla betyg (för admin-panel)
await FirebaseAPI.getAllQuestionRatings();
// Returns: [{questionId: "xxx", averageRating: 7.5, ...}, ...]
```

**Spam-skydd:**
- Innan betyg sparas: Kolla om `playerId` redan finns i `ratings[]`
- Om ja: Kasta error "Du har redan betygsatt denna fråga"

### UI-komponent (js/questionRating.js)

```javascript
// Visa rating-prompt
window.QuestionRating.showRatingPrompt(question, 'rating-container');

// Dölj rating-prompt
window.QuestionRating.hide('rating-container');
```

**Input:**
- `question` = Hela fråge-objektet från `getCurrentQuestion()` (behöver `question.id`)
- `containerId` = ID på HTML-elementet där UI ska renderas

### Integration i spelflödet

**Triggers för att visa rating:**
1. När `handleQuestionFullyCompleted()` anropas (alla alternativ besvarade)
2. Check: `PlayerManager.isSinglePlayerMode()` === true
3. Hämta aktuell fråga via `window.getCurrentQuestion()`
4. Anropa `QuestionRating.showRatingPrompt(question, 'rating-container')`

**Triggers för att dölja rating:**
1. När `nextQuestion()` anropas (användaren går vidare)
2. När spelet avslutas (`endGame()`)

**Var finns logiken?**
- `game.js`: Exporterar `getCurrentQuestion()` till `window`
- `gameController.js`: Anropar rating-prompt i `handleQuestionFullyCompleted()`
- Event handlers för frågor finns i `handleBelongsDecision()`, `handleOrderClick()` etc. i `game.js`

---

## Admin-panel

### UI (admin.html)
Ny sektion "Frågebetyg (Question Ratings)" med:
- Knapp: "🔄 Ladda betyg"
- Tabell med kolumner:
  - **Betyg** (genomsnitt, färgkodat: <4=röd, <7=orange, ≥7=grön)
  - **Fråga** (frågetext från JSON)
  - **Pack** (vilket frågepaket)
  - **Typ** (ordna/hör_till med emoji)
  - **Svårighet** (lätt/medel/svår med emoji)
  - **Kategori**
  - **Antal röster**
  - **Distribution** (1: 0, 2: 1, 3: 5, ...)

### Logik (js/adminPanel.js)

```javascript
async loadQuestionRatings() {
    // 1. Hämta alla ratings från Firebase
    const ratings = await FirebaseAPI.getAllQuestionRatings();

    // 2. Ladda alla frågor från JSON-filer
    const allQuestions = await this.loadAllQuestionsFromJSON();

    // 3. Matcha ratings med frågor (lookup på ID)
    const matched = ratings.map(rating => {
        const question = allQuestions.find(q => q.id === rating.questionId);
        return question ? {...rating, ...question} : {...rating, exists: false};
    });

    // 4. Sortera efter lägst betyg först (hitta dåliga frågor)
    matched.sort((a, b) => a.averageRating - b.averageRating);

    // 5. Rendera tabell
    this.renderQuestionRatings(matched);
}
```

**Borttagna frågor:**
- Om `questionId` inte hittas i JSON → Markera som "⚠️ BORTTAGEN"
- Visa fortfarande i tabellen men med opacity 0.5

---

## Filer som ska skapas/ändras

### Nya filer:
- ✅ `js/questionRating.js` - UI-komponent för betygsättning
- ✅ `QUESTION_RATINGS_SPEC.md` - Denna spec

### Ändringar i befintliga filer:
- ✅ `js/firebase-config.js` - Lägg till API-metoder (4 st)
- ✅ `css/styles.css` - Lägg till rating-widget styling
- ✅ `index.html` - Lägg till `<div id="rating-container">` och script-tag
- ✅ `admin.html` - Lägg till ny sektion "Question Ratings"
- ✅ `js/adminPanel.js` - Lägg till metoder för att ladda/visa ratings
- ❌ `js/gameController.js` - Integration med spelflödet (PROBLEM)
- ❌ `js/game.js` - Export av `getCurrentQuestion()` (PROBLEM)

---

## Kända problem (2025-01-16)

### Problem 1: handleQuestionFullyCompleted() anropas inte
**Symptom:** Rating-prompten visas aldrig efter besvarad fråga.

**Orsak:** Kodflödet är förvirrande mellan `game.js` och `gameController.js`:
- Event handlers (`handleBelongsDecision`) finns i `game.js`
- Rating-logik finns i `gameController.js`
- `handleQuestionFullyCompleted()` anropas från `game.js` men loggen syns inte

**Möjliga orsaker:**
1. `window.GameController` är inte definierat när anropet görs
2. `handleQuestionFullyCompleted()` anropas men med fel `this`-context
3. Funktionen anropas men `getCurrentQuestion()` returnerar `null`
4. Timing-issue med setTimeout

### Problem 2: getCurrentQuestion() inte exporterad
**Status:** Fixad genom att lägga till `window.getCurrentQuestion = getCurrentQuestion;` i game.js

### Problem 3: Fel metod-namn i PlayerManager
**Status:** Fixad genom att ändra från `getPlayerCount()` till `isSinglePlayerMode()`

---

## Debug-strategi för nästa session

1. **Verifiera GameController finns:**
   ```javascript
   console.log('GameController exists?', !!window.GameController);
   console.log('Type:', typeof window.GameController);
   ```

2. **Verifiera getCurrentQuestion fungerar:**
   ```javascript
   const q = window.getCurrentQuestion();
   console.log('Current question:', q?.id, q?.fråga);
   ```

3. **Lägg till debug i handleQuestionFullyCompleted:**
   ```javascript
   console.log('🎯 handleQuestionFullyCompleted called');
   console.log('isSinglePlayer:', PlayerManager?.isSinglePlayerMode());
   console.log('getCurrentQuestion exists:', !!window.getCurrentQuestion);
   ```

4. **Testa i olika modes:**
   - Lokal single-player (från "Fler spellägen")
   - Challenge mode (från "Spela nu")
   - Lokal multiplayer (ska INTE visa rating)

---

## Alternativ lösning om integration inte fungerar

**Enklare approach:** Lägg hela rating-logiken direkt i `game.js` istället för GameController:

```javascript
// I handleBelongsDecision() - efter rad 1359
if (isCurrentQuestionFullyAnswered()) {
    // Secure points (befintlig kod)...

    // LÄGG TILL: Visa rating prompt
    if (window.PlayerManager?.isSinglePlayerMode()) {
        setTimeout(() => {
            const question = getCurrentQuestion();
            if (question && window.QuestionRating) {
                window.QuestionRating.showRatingPrompt(question, 'rating-container');
            }
        }, 800);
    }

    setTimeout(() => {
        showCorrectAnswers();
        // ...
    }, 2000);
}
```

Detta hoppar över GameController helt och lägger logiken där event handlers faktiskt finns.

---

## Testplan

### Manuellt test (när funktionen fungerar):
1. ✅ Starta spel i challenge mode (single-player)
2. ✅ Besvara en hör_till-fråga helt
3. ✅ Rating-prompt ska visas efter 800ms
4. ✅ Klicka på betyg 7/10
5. ✅ Success-meddelande ska visas med genomsnitt
6. ✅ Gå till nästa fråga → Rating ska döljas
7. ✅ Besvara samma fråga igen → "Du har redan betygsatt" ska visas
8. ✅ Öppna admin-panel → Betyget ska synas i tabellen

### Edge cases:
- Multiplayer mode → Ingen rating ska visas
- Firebase nere → Visa felmeddelande (inte krascha)
- Dubbelklick på rating-knapp → Bara ett betyg sparas

---

## Framtida förbättringar (ej i första versionen)

1. **Filtrera i admin-panel:**
   - Visa bara frågor från specifikt pack
   - Visa bara frågor med betyg <5

2. **Genomsnittsbetyg per pack:**
   - Vilket frågepaket har bäst/sämst betyg?

3. **Radera gamla ratings:**
   - Om en fråga ändras (får nytt ID) → Radera gamla ratings automatiskt

4. **Export till CSV:**
   - Exportera all rating-data för Excel-analys

5. **Anonymiserad feedback:**
   - Låt användare kommentera varför de gav lågt betyg
