# Ordna Game - Komplett Spelspecifikation

## Översikt

**Ordna Game** är ett svenskt riskbaserat quiz-spel som kombinerar kunskap med strategiskt risktagande. Spelkonceptet bygger på "push your luck"-mekaniken där spelaren måste balansera potentiell vinst mot risk för förlust.

**Skapad:** 2025-08-05  
**Källa:** Baserat på djup kodanalys och datastruktur  
**Syfte:** Definiera spelets koncept för utveckling och refaktorering  

---

## Grundläggande Spelkoncept

### Kärnmekanik: "Push Your Luck"
Spelet bygger på ett fundamentalt riskdilemma:
- **Varje rätt svar** ökar din "pott" med +1 poäng
- **Du kan när som helst "stanna"** och säkra din pott som permanenta poäng
- **Ett fel svar** nollställer hela potten (men tidigare säkrade poäng behålls)
- **Ju längre du vågar fortsätta, desto mer kan du vinna - eller förlora**

### Spelfilosofi
> "Vem vågar chansa mest? Ett klurigt frågespel där strategiskt risktagande är nyckeln till framgång."

Detta är inte bara ett kunskapsspel - det är ett psykologiskt spel om riskbedömning, självkontroll och strategiskt tänkande.

---

## Frågetyper & Mekanik

### 1. Ordna-frågor (`typ: "ordna"`)

#### Koncept
Spelaren ska klicka på 4 alternativ i korrekt ordning (vanligtvis kronologisk eller storleksordning).

#### Exempel
```json
{
  "fråga": "Ordna dessa revolutioner i kronologisk ordning (äldst först).",
  "alternativ": ["Ryska revolutionen", "Amerikanska revolutionen", "Kulturrevolutionen i Kina", "Franska revolutionen"],
  "rätt_ordning": ["B", "D", "A", "C"]
}
```

#### Spelmekanik
1. **Första klicket:** Om rätt → +1 poäng, nästa alternativ blir klickbart
2. **Andra klicket:** Om rätt → +1 poäng (totalt 2), nästa alternativ blir klickbart  
3. **Fortsätt:** Varje rätt klick → +1 poäng
4. **Fel klick:** Utslaget från rundan, potten går till 0, visa korrekt ordning
5. **Alla rätt:** Automatisk säkring av alla 4 poäng

#### Visuell Feedback
- **Rätt klick:** Grön bakgrund, ordningsnummer (1, 2, 3, 4) visas
- **Fel klick:** Röd markering, spelet stannar
- **Slutresultat:** Alla alternativ visar korrekt ordning med numrering

### 2. Hör Till-frågor (`typ: "hör_till"`)

#### Koncept
Spelaren ska bedöma varje alternativ med "Ja" (hör till kategorin) eller "Nej" (hör inte till). Till skillnad från ordna-frågor får spelaren **själv välja i vilken ordning** alternativen ska bedömas.

#### Exempel
```json
{
  "fråga": "Vilka av dessa romaner är skrivna av Jane Austen?",
  "alternativ": ["Svindlande höjder", "Förnuft och känsla", "Jane Eyre", "Stolthet och fördom"],
  "tillhör_index": [1, 3],
  "kategori": "Jane Austen"
}
```

#### Spelmekanik
1. **Valfri ordning:** Spelaren väljer själv vilket alternativ de vill bedöma härnäst
2. **Varje beslut:** Klicka "Ja" eller "Nej" för valt alternativ
3. **Rätt beslut:** +1 poäng, alternativet markeras som klart
4. **Fel beslut:** Utslaget från rundan, potten går till 0, visa alla rätta svar
5. **Alla beslutade:** Automatisk säkring av alla poäng (som vid ordna-frågor)

#### Visuell Feedback
- **Rätt beslut:** Grön bakgrund på vald knapp (Ja/Nej)
- **Fel beslut:** Röd markering, spelet stannar
- **Slutresultat:** Rätta knappar markeras gröna, obesvarade alternativ highlighted

---

## Frågedata & Kategorisering

### Datastruktur
Varje fråga innehåller:
```json
{
  "typ": "ordna" | "hör_till",
  "svårighetsgrad": "lätt" | "medel" | "svår", 
  "fråga": "Frågtext",
  "alternativ": ["Alt 1", "Alt 2", "Alt 3", "Alt 4"],
  "rätt_ordning": ["B", "D", "A", "C"], // Endast ordna-frågor
  "tillhör_index": [1, 3], // Endast hör till-frågor
  "kategori": "Beskrivande kategori", // Endast hör till-frågor
  "förklaring": "Förklaring av rätt svar"
}
```

### Svårighetsgrader
- **Lätt:** Allmänkunskap, uppenbara svar
- **Medel:** Kräver specifik kunskap men rimlig gissning möjligt
- **Svår:** Specialkunskap eller mycket specifika fakta

### Frågepaket (Packs)
Frågor organiseras i tematiska paket som väljs före spelstart:

**Tillgängliga paket:**
- **Grund:** Allmänna kunskapsfrågor (32 frågor) - INKLUDERAT
- **Boomer:** Nostalgi från 70-80-90-talet (6 frågor) - GRATIS

**Kommande paket:**
- Nörden, Boksmart och kultiverad, Gatesmart och depraverad
- Filmfantasten, Familjen Normal, Familjen Hurtig, Familjen Ullared
- Plugghästen, Galaxhjärnan, True Crime, Historia

*Spelaren väljer vilket paket att spela före spelstart*

---

## Spellägen

### 1. Single Player Mode

#### Målsättning
Samla så många poäng som möjligt över flera frågor genom att balansera risk mot belöning.

#### Poängsystem
```javascript
// Aktuell fråga
currentQuestionScore = 0; // Räknas upp för varje rätt svar (+1)

// Totala säkrade poäng  
totalScore = 0; // Ökas när spelaren "stannar" och säkrar sin pott
```

#### Spelflöde
1. **Ny fråga laddas** → `currentQuestionScore = 0`
2. **Första rätta svaret** → `currentQuestionScore = 1`, "wake up" stanna-knapp
3. **Varje ytterligare rätt svar** → `currentQuestionScore++`
4. **Spelaren väljer:**
   - **"Stanna":** `totalScore += currentQuestionScore`, flying animation, säkrat!
   - **"Fortsätt":** Chansa på nästa svar för mer poäng
5. **Fel svar:** `currentQuestionScore = 0`, visa rätt svar, nästa fråga
6. **Alla alternativ rätt:** Automatisk säkring (som att klicka "Stanna")

#### Animationer & UX (Rik visuell feedback)
- **Flying Points to Button:** Vid rätt svar flyger "+1" från svarsalternativ till decision button
- **Button Wake-up:** Stanna-sidan "vaknar" vid första poängen med glow-effekt
- **Flying Points to Total:** Vid säkring flyger poäng från decision button till total score
- **Transform Animation:** Stanna-sidan förvandlas till "✅ Säkrat" vid säkring
- **Point Drain:** Vid fel svar räknas poängen ner från X till 0 med röd pulseffekt
- **Progress Bar:** Visuell indikation av hur långt spelaren kommit

#### UI-komponenter
- **Decision Button:** Tvådelad knapp som kombinerar Stanna/Fortsätt funktionalitet
  - **Vänster sida (Stanna):** Visar `+Xp`, blir aktiv vid poäng > 0, "vaknar" med glow-effekt
  - **Höger sida (Fortsätt):** Alltid klickbar för att gå vidare till nästa del av frågan
- **Total Score:** Visas som `Totalpoäng: X` i header (inte stjärnor längre)
- **Question Progress:** Progressbar som visar spelframsteg
- **Feedback Area:** Visar rätt svar vid fel eller säkring

### 2. Multiplayer Mode (2-6 spelare)

#### Målsättning
Ha högst total score när alla frågor är klara genom strategisk risktagning och turplanering.

#### Poängsystem per spelare
```javascript
players[i] = {
  name: "Spelarnamn",
  score: 0,              // Totala säkrade poäng (som totalScore)
  roundPot: 0,           // Poäng under aktuell fråga (som currentQuestionScore)
  completedRound: false,    // Klar med aktuell frågerunda
  completionReason: null    // 'stopped', 'wrong', 'finished'
}
```

#### Turordning & State
```javascript
currentPlayerIndex = 0;        // Vilken spelare som är aktiv (0-5)
questionStarterIndex = 0;      // Vem som börjar nästa fråga (roterar)
```

#### Spelflöde per frågerunda
1. **Fråga startar** → Alla spelare: `completedRound = false`, `roundPot = 0`
2. **Aktiv spelare** → Fortsätter där föregående spelare slutade (samma fråga, samma läge)
3. **Vid rätt svar:** `roundPot++`, spelaren väljer:
   - **"Stanna":** `score += roundPot`, `completedRound = true`, nästa spelare
   - **"Fortsätt":** Turen går vidare till nästa spelare  
4. **Vid fel svar:** `roundPot = 0`, `completedRound = true`, nästa spelare
5. **Alla alternativ rätt:** Automatisk säkring för aktiv spelare
6. **Alla spelare klara:** Rundan avslutas:
   - **Aktiva spelare** får sina pottar automatiskt säkrade
   - **Spelare som redan är klara** får inga ytterligare poäng från rundan
   - Visa rätt svar, rotera startspelare, nästa fråga

**Viktigt:** Om en spelare är sist kvar när alla andra är klara med rundan, får den spelaren automatiskt sin pott säkrad - även om inte alla alternativ besvarats!

#### Turhantering
- **nextTurn():** Byter till nästa aktiv spelare (som inte är klar med rundan)
- **concludeQuestionRound():** Avslutar frågerunda när alla spelare är klara:
  - Säkrar automatiskt poäng för alla som fortfarande är kvar
  - Detta gäller även om spelaren inte hunnit svara på alla alternativ
- **Startspelare roterar:** `questionStarterIndex++` för rättvisa

#### Animationer & UX (Enklare än single player)
- **Point Animation:** Enkel "+1" popup vid poäng
- **Scoreboard Updates:** Real-time uppdatering av alla spelares status
- **Turn Indicator:** Aktiv spelare markerad med blå ram
- **Completion Feedback:** Tydlig indikation när spelaren är klar med rundan

#### UI-komponenter
- **Scoreboard:** Visar alla spelare, deras poäng och status
- **Turn Indicator:** Blå ram runt aktiv spelare
- **Decision Button:** Visar "Spelarnamn +Xp" på stanna-sidan
- **Completion Status:** Visar varför spelare är klar (stannat/fel/slutfört)

### 3. Challenge Mode

#### Koncept
Asynkron tävling mellan två spelare på exakt samma 5 frågor. En "blind" tävling där spelarna inte ser varandras resultat förrän båda spelat klart.

#### Teknisk Implementation
- **Firebase Integration:** Lagrar challenge-data i molnet
- **5 Slumpmässiga Frågor:** `challengeQuestions` array med fasta frågor för fairness
- **Delbar Länk:** Unik URL som opponent kan använda

#### Spelflöde
1. **Challenger Spelar:**
   - Spelar 5 frågor i single player-läge
   - `challengeQuestionScores` array lagrar poäng per fråga
   - Firebase lagrar: frågor, poäng, challenger-data

2. **Utmaning Skapas:**
   - Unik challenge-ID genereras
   - Delbar länk med WhatsApp-integration
   - "Väntar på svar"-skärm för challenger

3. **Opponent Spelar:**
   - Samma 5 frågor laddas från Firebase
   - Spelar i single player-läge
   - Kan inte se challenger's resultat

4. **Resultat Jämförs:**
   - Båda spelares poäng visas
   - Vinnare utses (högst total score)
   - Breakdown per fråga möjlig

#### Challenge Management
- **"Mina Utmaningar":** Lista över aktiva challenges
- **Status Tracking:** Väntar/Spelat/Avslutad
- **7-dagars Expiration:** Gamla challenges rensas automatiskt
- **Duplicate Prevention:** En spelare kan bara spela varje challenge en gång

#### UI-flöden
- **Create Challenge:** Single player → Share link
- **Accept Challenge:** Follow link → Play same questions  
- **Results View:** Head-to-head comparison
- **My Challenges:** Overview of active challenges

---

## Poängsystem & Riskmekanik

### Grundläggande Poänglogik
**All poängtilldelning följer samma mönster:**
- ✅ **Rätt svar = +1 poäng till potten** (oavsett frågetyp, spelläge)
- ❌ **Fel svar = förlora hela potten** (osäkrade poäng går förlorade)
- 🏦 **Säkrade poäng behålls alltid** (tidigare intjänade poäng påverkas inte)
- 🎯 **Stanna när som helst** för att säkra din pott som permanenta poäng

### Riskmatriser

#### Single Player Risk/Reward
```
Aktuell pott → Fortsätt? → Potentiell vinst vs förlust
1 poäng     → Ja        → +1 vs -1 (låg risk)
2 poäng     → Ja        → +1 vs -2 (medium risk)  
3 poäng     → Ja        → +1 vs -3 (hög risk)
4 poäng     → Nej       → Automatisk säkring
```

#### Multiplayer Strategisk Komplexitet
```
Scenario: Du har 2 poäng, nästa spelare har 0 säkrat
- Stanna nu: +2 säkra poäng, nästa spelare får ny chans
- Fortsätt: Risk -2, men nästa spelare får svårare utgångsläge
- Strategisk dimension: Förhindra andra från att bygga stora pottar

Speciellt scenario: Sist kvar
- Om alla andra är klara får du din pott automatiskt
- Detta skapar incitament att "överleva" snarare än maximera poäng
- En spelare med 1 poäng som överlever får den säkrad!
```

### Psykologiska Aspekter
- **Loss Aversion:** Rädsla för att förlora befintlig pott
- **Risk Escalation:** Svårare att stanna ju större potten blir
- **Competitive Pressure:** Multiplayer tvingar större risktagning
- **Sunk Cost:** "Jag har redan kommit så här långt..."

---

## UI/UX Flöden & Användarinteraktion

### Huvudmeny & Navigation
```
Huvudmeny
├── Spela själv (1 spelare) → Single Player Game
├── Spela med vänner (2-6) → Multiplayer Setup  
├── Utmana någon → Challenge Creation
├── Mina utmaningar → Challenge Management
└── Välj frågepaket → Pack Selection
```

### Game Flow States

#### Single Player Journey
```
Start → Load Question → Answer → Decision Point → Outcome
                        ↓              ↓
                   [Right/Wrong]  [Stay/Continue]
                        ↓              ↓  
                   +1 Score      [Secure/Risk]
                        ↓              ↓
                   Decision      Next Question
```

#### Multiplayer Journey  
```
Setup → Players → Question → Turn Loop → Round End → Next Question
  ↓       ↓         ↓          ↓           ↓           ↓
Names   Order    P1 Plays   P2 Plays   Results    Rotate Start
```

### Beslutspunkter (Critical UX Moments)

#### Stanna eller Fortsätt? (Kärninteraktion)
**Context:** Spelare har poäng i potten, måste välja nästa steg

**Single Player UI:**
```
┌─────────────────────────────────┐
│  [Stanna +3p] │ [Fortsätt] ⚡    │  
│      💰       │    🎲          │
└─────────────────────────────────┘
```

**Multiplayer UI:**
```  
┌─────────────────────────────────┐
│ [Anna +2p] │ [Fortsätt] →       │
│     💰     │    🎯              │  
└─────────────────────────────────┘
```

**Psykologisk Design:**
- **Stanna = Säkerhet** (💰 ikon, grön färg, spelarnamn)
- **Fortsätt = Risk** (🎲⚡ ikoner, blå färg, action-känsla)

#### Fel Svar (Failure State)
**Visuell Sekvens:**
1. **Röd flash** på fel alternativ
2. **Point drain animation** (-X poäng försvinner)
3. **Reveal correct answers** (gröna markeringar)
4. **"Nästa fråga"** knapp erscheint

### Animationer som Storytelling

#### Single Player Animations (Rica & Belönande)
- **Wake Up Stop Button:** Knappen "vaknar" vid första poängen med glow
- **Flying Points:** Poäng flyger från knapp till total score
- **Button Transform:** Stanna-knapp morphar till "Säkrat!" 
- **Star Explosion:** Nya stjärnor exploderar in i total score
- **Point Landing:** Partiklar när poäng landar

#### Multiplayer Animations (Snabba & Funktionella)
- **+1 Popup:** Enkel siffra hoppar upp vid poäng
- **Scoreboard Highlight:** Uppdaterade poäng blinkar kort
- **Turn Transition:** Blå ram glider mellan spelare
- **Completion Fade:** Spelare som är klara bleknar

### Responsive Design & Accessibility
- **Mobile First:** Touch-optimized buttons, läsbar text
- **Desktop Enhanced:** Hover states, keyboard shortcuts
- **Screen Readers:** Proper ARIA labels för spelstatus
- **Color Blind Safe:** Färger kompletterade med ikoner/former

---

## Challenge System (Asynkron Multiplayer)

### Teknisk Arkitektur

#### Firebase Integration
```javascript
// Challenge data structure i Firebase
{
  challengeId: "unique-id",
  challenger: {
    name: "Alice",
    totalScore: 12,
    questionScores: [3, 0, 4, 2, 3]
  },
  opponent: {
    name: "Bob", 
    totalScore: 8,
    questionScores: [2, 1, 0, 3, 2]
  },
  questions: [...], // Samma 5 frågor för båda
  status: "completed",
  createdAt: timestamp,
  expiresAt: timestamp + 7days
}
```

#### Local Storage Tracking
```javascript
// Användarens challenges i localStorage
myChallenges = [
  {
    challengeId: "abc123",
    role: "challenger", // eller "opponent"
    status: "waiting",  // "completed", "expired"
    opponentName: "Bob",
    createdAt: timestamp
  }
]
```

### Challenge Lifecycle

#### 1. Creation Phase
```
Alice spelar → 5 frågor → 12 poäng → Skapa utmaning
                                          ↓
Firebase: Lagra questions + Alice's score
                                          ↓  
Unique link: https://game.com/challenge/abc123
                                          ↓
Share: WhatsApp, kopiera länk, etc.
```

#### 2. Waiting Phase  
```
Alice ser: "Väntar på Bob..." 
           [Polling Firebase for updates]
           
Bob öppnar länken → Ser: "Alice utmanar dig!" 
                           "Spela samma 5 frågor"
```

#### 3. Playing Phase
```
Bob spelar → Samma 5 frågor → 8 poäng → Automatisk submission
                                              ↓
Firebase: Uppdatera med Bob's score
                                              ↓
Alice får notification: "Bob har svarat!"
```

#### 4. Results Phase
```
Båda ser resultat:
┌──────────────────────────┐
│  🏆 Alice: 12p (Vinnare) │
│     Bob:   8p            │  
│                          │
│  Fråga 1: 3p vs 2p      │
│  Fråga 2: 0p vs 1p      │
│  etc...                  │
└──────────────────────────┘
```

### Challenge Management

#### "Mina Utmaningar" Interface
```
Aktiva Utmaningar:
┌─────────────────────────────────┐
│ 🔄 vs Bob     | Väntar svar... │
│ ✅ vs Charlie | Du vann 15-12!  │  
│ ❌ vs Diana   | Du förlorade    │
│ ⏰ vs Erik    | Utgått          │
└─────────────────────────────────┘

[Skapa ny utmaning] [Uppdatera]
```

#### Status Indicators
- **🔄 Väntar:** Opponent har inte spelat än
- **✅ Vunnit:** Du hade högre poäng  
- **❌ Förlorat:** Opponent hade högre poäng
- **🤝 Oavgjort:** Samma poäng
- **⏰ Utgått:** 7 dagar passerat utan svar

### Sharing & Social Features

#### WhatsApp Integration
```
Automatisk meddelande-mall:
"Hej! Jag utmanar dig i Ordna Game! 
Klicka här för att spela samma 5 frågor: 
https://game.com/challenge/abc123

Lycka till! 🎯"
```

#### Other Sharing Options
- **Kopiera länk:** För andra messaging-appar
- **QR-kod:** För delning IRL
- **Social Media:** Twitter, Facebook integration möjlig

---

## Teknisk Implementation & Dataflöde

### Game State Management

#### Global Variables (Current Architecture)
```javascript
// Core game state
let questionsToPlay = [];       // Frågor för aktuellt spel
let currentQuestionIndex = 0;   // Vilken fråga som visas
let userOrder = [];            // Spelares klick-ordning (ordna-frågor)

// Single player state  
let totalScore = 0;            // Säkrade poäng
let currentQuestionScore = 0;  // Pott under aktuell fråga
let mistakeMade = false;       // Fel svar gjort

// Multiplayer state
let players = [];              // Array med spelarobjekt
let currentPlayerIndex = 0;    // Aktiv spelare (0-5)
let questionStarterIndex = 0;  // Vem börjar nästa fråga

// Challenge state
let ischallengeMode = false;   // Challenge-läge aktivt
let challengeQuestions = [];   // 5 fasta frågor för challenge
let challengeQuestionScores = []; // Poäng per fråga i challenge

// UI state  
let isSinglePlayer = false;    // Spelläge-flagga
```

### Question Loading Pipeline

#### 1. Data Sources
```javascript
// Frågepaket laddas från JSON
await fetch('/data/questions-grund.json')
await fetch('/data/questions-boomer.json')
// etc...
```

#### 2. Pack Selection & Filtering
```javascript
// Användaren väljer aktiva paket
activePacks = ['Grund', 'Boomer'];

// Filtrera frågor baserat på aktiva paket  
availableQuestions = allQuestions.filter(q => 
  activePacks.includes(q.pack)
);
```

#### 3. Game Mode Preparation
```javascript
// Single Player: Alla tillgängliga frågor
questionsToPlay = shuffle(availableQuestions);

// Challenge: 5 slumpmässiga frågor
challengeQuestions = shuffle(availableQuestions).slice(0, 5);
questionsToPlay = challengeQuestions;

// Multiplayer: Alla tillgängliga frågor  
questionsToPlay = shuffle(availableQuestions);
```

### Answer Processing Pipeline

#### 1. User Input Capture
```javascript
// Ordna-frågor: Klick på alternativ
button.addEventListener('click', () => 
  handleOrderClick(button, optionText)
);

// Hör till-frågor: Ja/Nej knappar
yesBtn.addEventListener('click', () =>
  handleBelongsDecision('yes', container, yesBtn, noBtn)
);
```

#### 2. Answer Validation
```javascript
// Ordna: Kontrollera mot rätt_ordning
const correctNext = question.rätt_ordning[userOrder.length];
const isCorrect = (optionText === correctNext);

// Hör till: Kontrollera mot tillhör_index  
const optionIndex = question.alternativ.indexOf(optionText);
const shouldBelong = question.tillhör_index.includes(optionIndex);
const isCorrect = (decision === 'yes') === shouldBelong;
```

#### 3. Score & State Updates
```javascript
if (isCorrect) {
  addPointToCurrentPlayer(); // +1 poäng
  checkQuestionComplete();   // Alla alternativ klara?
} else {
  handleIncorrectAnswer();   // Nollställ pott, markera som klar
}
```

#### 4. UI Updates
```javascript
updateDisplay();        // Scoreboard/total score
updateGameControls();   // Visa/dölj knappar
showVisualFeedback();   // Animationer, färger
```

### Turn Management (Multiplayer)

#### Player Rotation Logic
```javascript
function nextTurn() {
  // Hitta nästa aktiv spelare
  let nextIndex = (currentPlayerIndex + 1) % players.length;
  while(players[nextIndex].completedRound) {
    nextIndex = (nextIndex + 1) % players.length;
  }
  currentPlayerIndex = nextIndex;
  
  updateScoreboard();     // Ny aktiv spelare
  updateGameControls();   // Rätt knappar för ny spelare
}
```

#### Round Conclusion
```javascript
function concludeQuestionRound() {
  // Säkra poäng för alla kvarvarande spelare
  players.forEach(player => {
    if (!player.completedRound) {
      player.score += player.roundPot;
      player.roundPot = 0;
    }
  });
  
  // Rotera startspelare för nästa fråga
  questionStarterIndex = (questionStarterIndex + 1) % players.length;
  
  showCorrectAnswers();
  // Fortsätt till nästa fråga...
}
```

---

## Framtida Utvecklingsmöjligheter

### Kort Sikt (1-3 månader)
- **Förbättrade Animationer:** Mer fluid feedback i multiplayer
- **Sound Effects:** Audio-feedback för actions och outcomes  
- **Mobile PWA:** Installbar som app på telefon
- **Nya Frågepaket:** Sport, Film, Geografi, etc.
- **Statistik:** Spara prestationsdata lokalt

### Medium Sikt (3-6 månader)  
- **Online Multiplayer:** Real-time turtagning via WebSockets
- **Tournament Mode:** Bracket-system för flera spelare
- **Custom Questions:** Användare kan skapa egna frågor
- **Achievement System:** Badges för milstolpar
- **Leaderboards:** Global/lokal ranking

### Lång Sikt (6+ månader)
- **AI Question Generation:** Automatiska frågor baserade på Wikipedia/data
- **Video Questions:** Videoklipp som måste ordnas kronologiskt
- **Team Mode:** 2v2 eller lag-baserat spel
- **Educational Integration:** Koppling till kursmaterial
- **Multiple Languages:** Internationalisering

### Tekniska Förbättringar
- **TypeScript Migration:** Bättre type safety
- **Component Architecture:** Modularisera UI-komponenter  
- **State Management:** Redux eller liknande för komplex state
- **Testing Framework:** Automated testing av spellogik
- **Performance Optimization:** Lazy loading, caching, etc.

---

## Slutsats

**Ordna Game** är ett sofistikerat spelkoncept som kombinerar kunskap, strategi och psikologi. Det grundläggande "push your luck"-mekaniken är tidlös och engagerande, medan de olika spellägena (single, multiplayer, challenge) erbjuder varierande upplevelser för olika situationer.

### Kärnstyrkor
- **Universellt Tiltalande:** Fungerar för alla åldrar och kunskapsnivåer
- **Strategisk Djup:** Enkla regler, komplex beslutsfattning
- **Social Dimension:** Multiplayer och challenges skapar interaktion
- **Skalbarhet:** Enkelt att lägga till nya frågor och features

### Teknisk Mognad
Spelet har en solid grund med fungerande single player, multiplayer och challenge-system. Den nuvarande koden fungerar men kan förbättras avseende struktur och konsistens mellan spellägen.

### Utvecklingspotential  
Med rätt refaktorering och fortsatt utveckling kan detta bli ett riktigt starkt quiz-spel som står sig mot kommersiella alternativ. Fokus bör ligga på att behålla kärnmekanikens elegans medan teknisk kvalitet och användarupplevelse förbättras.

---

**Detta dokument utgör grunden för all framtida utveckling och refaktorering av Ordna Game.**

---

**Senast uppdaterad:** 2025-08-05  
**Version:** 1.0  
**Status:** Komplett specifikation baserad på kodanalys