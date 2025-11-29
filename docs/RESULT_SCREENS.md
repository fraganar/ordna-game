# Resultatskärmar - Komplett kartläggning

## Arkitektur (uppdaterad 2025-01)

**Centraliserad rendering via `ResultScreenRenderer`** (`js/resultScreenRenderer.js`)

All HTML-generering för resultatskärmar sker nu via en gemensam modul. Detta löser tidigare problem med:
- Duplicerad HTML på 5+ ställen
- Inkonsekvent styling mellan mobil/desktop
- Svårt att underhålla och uppdatera

## Översikt

Det finns **4 aktiva resultatskärmar** i spelet:

| Skärm | När den visas | Renderer-metod | Anropas från |
|-------|---------------|----------------|--------------|
| 1. Challenge Waiting | Singelspel avslutas (inloggad) | `renderSinglePlayerResult({isLoggedIn: true})` | challengeSystem.js |
| 2. Post-Game Share | Singelspel avslutas (anonym) | `renderSinglePlayerResult({isLoggedIn: false})` | game.js |
| 3. Challenge Result | Opponent avslutar utmaning | `renderChallengeResult()` | challengeSystem.js |
| 5. Multiplayer Result | Multiplayer-spel (2-4 spelare) | `renderMultiplayerResult()` | game.js |

**Legacy (borttagen):**
- Skärm #4 (`showSinglePlayerResultScreen()`) - ej längre i koden

---

## Nuvarande spelflöden

### Primärt flöde: "Spela nu" (singelspel med challenge)

```
Användare klickar "Spela nu"
    │
    └─ Spelar 12 frågor (challenge skapas automatiskt)
        │
        ├─ Inloggad användare
        │   └─ Skärm #1: Challenge Waiting
        │       └─ Kan dela länk för att utmana någon
        │
        └─ Anonym användare
            └─ Skärm #2: Post-Game Share
                └─ Uppmanas logga in för att dela
```

### Sekundärt flöde: "Fler spellägen" (lokal multiplayer)

```
Användare klickar "Fler spellägen"
    │
    └─ Väljer 2-4 spelare (1 spelare är INTE längre ett val)
        │
        └─ Spelar multiplayer på samma enhet
            │
            └─ Skärm #5: Multiplayer Result (medaljer)
```

### Challenge-flöde: Acceptera utmaning

```
Användare klickar på delad challenge-länk
    │
    └─ Spelar samma 12 frågor som challenger
        │
        └─ Skärm #3: Challenge Result (jämförelse)
```

---

## Jämförelse: Skärm #1 vs Skärm #2 (Nuläge)

Båda skärmarna visas efter singelspel via "Spela nu", men skiljer sig beroende på inloggningsstatus:

| Aspekt | Skärm #1 (inloggad) | Skärm #2 (anonym) | Skillnad viktig? |
|--------|---------------------|-------------------|------------------|
| **Rubrik** | "Bra kämpat!" | "Bra jobbat!" | Nej - kan vara samma |
| **Undertitel** | (ingen) | "Du klarade alla 12 frågor" | Nej |
| **Poängvisning** | Cirkel-badge | Stor text (ingen cirkel) | Nej - bör vara samma |
| **Delning** | Direkt länk + knappar | "Dela utmaning" → kräver login | **JA - funktionell skillnad** |
| **Info-ruta** | Nej | "För att dela... behöver du logga in" | **JA - förklarar varför login krävs** |
| **Sekundär knapp** | "Tillbaka till start" | "🔄 Spela igen" | Nej - bör vara "Tillbaka till start" |
| **HTML-källa** | `#end-screen` (modifierad) | `#post-game-share` (separat) | Teknisk skillnad |

**Observationer:**
- Många skillnader är onödiga och skapar inkonsekvent UX
- Den viktiga skillnaden är funktionell: inloggade kan dela direkt, anonyma måste logga in först
- "Spela igen" vs "Tillbaka till start" är inkonsekvent - bör harmoniseras

---

## Responsiv design: Mobil vs Desktop

### Strategi

Kodbasen använder **Tailwind CSS responsive klasser** för alla mobil/desktop-skillnader. Det finns **ingen JavaScript-detektering** av skärmstorlek (`window.innerWidth`, `matchMedia`, etc.).

### Responsiva mönster på resultatskärmarna

| Element | Mobil (default) | Desktop (sm: 640px+) | Större (lg: 1024px+) |
|---------|-----------------|----------------------|----------------------|
| **Padding** | `p-6` (24px) | `sm:p-8` (32px) | `lg:p-12` (48px) |
| **Rubrik** | `text-3xl` (30px) | `sm:text-4xl` (36px) | - |
| **Undertitel** | `text-base` (16px) | `sm:text-lg` (18px) | - |
| **Knapp-text** | `text-lg` (18px) | `sm:text-xl` (20px) | - |
| **Mellanrum** | `space-y-3` (12px) | `sm:space-y-4` (16px) | - |
| **Medalj-emoji** | `text-2xl` (24px) | `sm:text-3xl` (28px) | - |

### Var finns responsiva klasser?

**index.html:**
- `#end-screen` (rad 722): `p-6 sm:p-8 lg:p-12`
- `#post-game-share` (rad 743): `p-6 sm:p-8 lg:p-12`
- Rubriker: `text-3xl sm:text-4xl`
- Underrubriker: `text-base sm:text-lg`

**game.js:**
- `showSinglePlayerResultScreen()` (rad 660): `p-6 sm:p-8 lg:p-12`
- `endMultiplayerGame()` (rad 1560-1587): `p-3 sm:p-4`, `text-2xl sm:text-3xl`

**challengeSystem.js:**
- `showChallengeResultView()` (rad 840): `p-6 sm:p-8 lg:p-12`, `text-2xl sm:text-3xl`

### CSS Media Queries (styles.css)

Relevanta för resultatskärmar:

| Query | Rad | Påverkar |
|-------|-----|----------|
| `@media (max-width: 640px)` | 276-299 | Decision buttons (padding, gap, font-size) |
| `@media (max-width: 640px)` | 463-468 | Large next button (padding, font-size) |
| `@media (max-width: 640px)` | 1172-1183 | Hamburger button (position, size) |
| `@media (max-width: 640px)` | 1335-1338 | Rating stars (font-size) |

### Potentiella problem

1. **Challenge result grid** (`showChallengeResultView` rad 840):
   - Använder alltid `grid-cols-2` även på små skärmar
   - Kan bli trångt på mycket smala enheter
   - Möjlig förbättring: `grid-cols-1 sm:grid-cols-2`

2. **Inkonsekvent responsivitet mellan skärmar:**
   - Skärm #1 och #2 har samma responsiva padding
   - Skärm #3 har annan padding-struktur
   - Skärm #5 har samma som #1/#2

---

## Kodflöden - Beslutträd

```
endSinglePlayerGame() [game.js:745-855] anropas
    │
    ├─ window.ischallengeMode === true && !window.challengeId [rad 762]
    │   │   (startade via "Spela nu", skapar ny utmaning)
    │   │
    │   ├─ isAnonymous === true [rad 764] (EJ inloggad)
    │   │   └─ showPostGameShareScreen() [rad 770] → Skärm #2
    │   │
    │   └─ isAnonymous === false (inloggad)
    │       └─ completeChallenge() [rad 778] → showWaitingForOpponentView() → Skärm #1
    │
    ├─ window.challengeId && !window.isChallenger [rad 795]
    │   │   (accepterar utmaning via delad länk)
    │   │
    │   └─ acceptChallenge() [rad 817] → showChallengeResultView() → Skärm #3
    │
    └─ else [rad 838] (LEGACY - inte längre nåbar via UI)
        │
        └─ showSinglePlayerResultScreen() [rad 845] → Skärm #4
```

**Multiplayer** (2-4 spelare via "Fler spellägen") hanteras separat via `endMultiplayerGame()` → Skärm #5

---

## Skärm #4: Legacy-kod (bör tas bort)

**Status:** Koden finns kvar men är inte längre nåbar via UI.

**Bakgrund:** Tidigare kunde man välja "Fler spellägen" → 1 spelare för att spela utan challenge-systemet. Detta alternativ har tagits bort - singelspel går nu alltid via "Spela nu" som skapar en challenge.

**Rekommendation:** Överväg att ta bort `showSinglePlayerResultScreen()` och relaterad kod för att minska komplexitet. Alternativt behåll som fallback.

---

## När visas vilken skärm? (Snabbreferens)

| Hur du startar spelet | Inloggad? | Resultatskärm | Nuvarande styling |
|-----------------------|-----------|---------------|-------------------|
| "Spela nu" (huvudknappen) | Ja | #1 Challenge Waiting | Cirkel-badge + delningsknappar |
| "Spela nu" (huvudknappen) | Nej | #2 Post-Game Share | Stor text + inloggningsuppmaning |
| Klickar på delad challenge-länk | - | #3 Challenge Result | Jämförelsevy (två kolumner) |
| "Fler spellägen" → 2-4 spelare | - | #5 Multiplayer | Medaljer (🥇🥈🥉) |

**OBS:** "Fler spellägen" → 1 spelare är inte längre tillgängligt i UI.

---

## Skärm 1: Challenge Waiting (Singelspel, inloggad)

**Fil:** `challengeSystem.js` rad 1148-1221 (`showWaitingForOpponentView`)

**Visar:**
- "Bra kämpat!" rubrik
- Poäng i cirkel-badge (använder `#single-player-final` från index.html)
- "Utmana någon!" sektion med länk
- Knappar: "Kopiera länk" (blå) + "Dela" (orange gradient)
- "Tillbaka till start" knapp (vit)

**HTML-källa:**
- Statisk bas från `index.html` rad 722-740 (`#end-screen`)
- Visar `#single-player-final` (rad 727-730)
- Lägger till dynamisk `.challenge-share-container` (rad 1175-1212)

**Nuvarande styling:**
- Cirkel-badge med `score-circle-badge` klass
- `text-7xl font-bold text-primary` för poängen

**DOM-element:**
- `#end-screen` - Huvudcontainer
- `#end-screen-subtitle` - Undertitel (ändras till "")
- `#single-player-final` - Poängsektion (visas)
- `#single-final-score` - Poängvärdet
- `#final-scoreboard` - Döljs
- `#restart-btn` - Ändras till "Tillbaka till start"
- `.challenge-share-container` - Dynamiskt tillagd

---

## Skärm 2: Post-Game Share (Singelspel, anonym)

**Fil:** `game.js` rad 858-887 (`showPostGameShareScreen`) + `index.html` rad 743-778 (`#post-game-share`)

**Visar:**
- "Bra jobbat!" rubrik
- "Du klarade alla 12 frågor" undertitel
- Poäng (stor text, ingen cirkel-badge)
- Info-ruta: "Vill du utmana en vän?" med inloggningsinfo
- Knappar: "Dela utmaning och utmana vän" (primär) + "🔄 Spela igen" (sekundär)
- Tips om senare inloggning

**HTML-källa:** Statisk i index.html (helt separat element från `#end-screen`)

**Nuvarande styling:**
- `text-7xl font-bold text-primary` för poängen
- Info-ruta: `bg-info-light border-l-4 border-info`

**DOM-element:**
- `#post-game-share` - Huvudcontainer (separat från #end-screen)
- `#post-game-final-score` - Poängvärdet
- `#share-challenge-btn` - Dela-knapp
- `#post-game-play-again-btn` - Spela igen-knapp

---

## Skärm 3: Challenge Result (Opponent)

**Fil:** `challengeSystem.js` rad 788-937 (`showChallengeResultView`)

**Visar:**
- "Utmaning avslutad!" rubrik
- Två-kolumners jämförelse:
  - Vänster: Din data (namn, totalpoäng, poäng per fråga)
  - Höger: Motståndarens data
- Poäng per fråga visas som färgkodade celler (12 st)
- Vinnarmeddelande: "🏆 Du vann!" / "😔 Du förlorade!" / "🤝 Oavgjort!"
- Om anonym: "Logga in och spara resultat" + "Tillbaka" med bekräftelsedialog
- Om inloggad: "Tillbaka till start"

**HTML-källa:** Helt dynamiskt genererad i JS (ersätter `#end-screen` innerHTML)

**Nuvarande styling:**
- Grid med `grid-cols-2` för jämförelse
- Färgkodade poängceller (grön = bättre, röd = sämre)
- Vinnartext med emojis och färger

**DOM-element (dynamiskt skapade):**
- `#opponent-result-login-btn` - Logga in (endast anonym)
- `#opponent-result-back-btn` - Tillbaka (endast anonym)
- `#back-to-start-result` - Tillbaka (autentiserad)
- `#challenge-result-back-dialog` - Bekräftelsedialog (index.html:261)

---

## Skärm 4: Single Player Result (LEGACY - ej längre nåbar)

**Fil:** `game.js` rad 655-709 (`showSinglePlayerResultScreen`)

**Status:** LEGACY - Koden finns kvar men kan inte längre nås via UI.

**Visar (om den skulle triggas):**
- "Spelet är slut!" rubrik
- "Bra kämpat!" undertitel
- Lila ruta med:
  - Paketnamn (gameType)
  - Antal frågor
  - Poäng (stor text)
  - "poäng" label
- "Tillbaka till start" knapp

**HTML-källa:** Dynamiskt genererad i JS (ersätter `#end-screen` innerHTML via `UI.setEndScreenContent()`)

**Nuvarande styling:**
- Lila ruta: `bg-purple-100 text-purple-800 rounded-lg p-6 mb-8`
- Poäng: `text-6xl font-bold`
- Knapp: Gradient `from-magic to-primary`

---

## Skärm 5: Multiplayer Result

**Fil:** `game.js` rad 1551-1623 (`endMultiplayerGame`)

**Visar:**
- "Spelet är slut!" rubrik
- "Bra kämpat allihopa!" undertitel
- Rankningslista sorterad efter poäng:
  - 🥇 Plats 1: Guld-styling (`border-amber-400 bg-amber-50`)
  - 🥈 Plats 2: Silver-styling (`border-slate-300 bg-slate-50`)
  - 🥉 Plats 3: Brons-styling (`border-amber-700 bg-orange-50`)
  - 4+: Enkel numrering
- "Tillbaka till start" knapp

**HTML-källa:** Dynamiskt genererad i JS (ersätter `#end-screen` innerHTML via `UI.setEndScreenContent()`)

**Nuvarande styling:**
- Medaljer + färgkodade ramar och bakgrunder
- Flexbox för spelarnamn och poäng

---

## Var finns resultat-HTML? (Sammanfattning)

### Statisk HTML (index.html)

| Element | Rad | Används av |
|---------|-----|------------|
| `#end-screen` | 722-740 | Skärm #1 (bas) |
| `#single-player-final` | 727-730 | Skärm #1 (poängvisning) |
| `#final-scoreboard` | 733-735 | Skärm #5 (placeholder) |
| `#post-game-share` | 743-778 | Skärm #2 (helt separat) |
| `#challenge-result-back-dialog` | 261-280 | Skärm #3 (bekräftelsedialog) |

### Dynamiskt genererad HTML (JavaScript)

| Funktion | Fil:rad | Genererar för | Status |
|----------|---------|---------------|--------|
| `showWaitingForOpponentView()` | challengeSystem.js:1148-1221 | Skärm #1 | AKTIV |
| `showPostGameShareScreen()` | game.js:858-887 | Skärm #2 (visar bara) | AKTIV |
| `showChallengeResultView()` | challengeSystem.js:788-937 | Skärm #3 | AKTIV |
| `showSinglePlayerResultScreen()` | game.js:655-709 | Skärm #4 | LEGACY |
| `endMultiplayerGame()` | game.js:1551-1623 | Skärm #5 | AKTIV |
| `restartGame()` | game.js:1625-1682 | Återställer #end-screen | AKTIV |

---

## restartGame() - Återställer HTML

**Fil:** `game.js` rad 1625-1682

Denna funktion **återställer hela `#end-screen` innerHTML** till standardstruktur (rad 1640-1660).

**Vad den återställer:**
- Rubrik: "Spelet är slut!"
- Undertitel: "Bra kämpat allihopa!"
- `#single-player-final` container (dold)
- `#final-scoreboard` container (tom)
- `#restart-btn` med "Spela igen" text

**Kritiskt:** Om vi ändrar styling för skärm #1 eller #5 måste vi också uppdatera `restartGame()` så nästa spelomgång får rätt design.

---

## Viktiga beslutspunkter i koden

### endSinglePlayerGame() - Huvudförgreningen

```javascript
// game.js rad 762
if (window.ChallengeSystem && window.ischallengeMode && !window.challengeId) {
    // Challenge-skapare (Skärm #1 eller #2)
    const isAnonymous = window.isAnonymousUser && window.isAnonymousUser();
    if (isAnonymous) {
        showPostGameShareScreen(finalScore);  // → Skärm #2
    } else {
        window.ChallengeSystem.completeChallenge();  // → Skärm #1
    }
}
// game.js rad 795
else if (window.challengeId && !window.isChallenger) {
    // Opponent accepterar challenge → Skärm #3
    await window.ChallengeSystem.acceptChallenge(...);
}
// game.js rad 838
else {
    // LEGACY fallback → Skärm #4 (inte längre nåbar via UI)
    showSinglePlayerResultScreen(...);
}
```

### Multiplayer hanteras separat

```javascript
// game.js rad 1551
function endMultiplayerGame() {
    // Alltid → Skärm #5
}
```

---

## CSS-klasser som används

### Poängvisning
- `text-7xl font-bold text-primary` - Stor orange poängtext
- `text-6xl font-bold` - Något mindre poängtext
- `score-circle-badge` - Cirkel-badge (om definierad i CSS)

### Containers
- `bg-purple-100 text-purple-800` - Lila ruta (Skärm #4 - LEGACY)
- `bg-info-light border-l-4 border-info` - Info-ruta (Skärm #2)
- `bg-amber-50 border-amber-400` - Guld-medalj (Skärm #5)
- `bg-slate-50 border-slate-300` - Silver-medalj (Skärm #5)
- `bg-orange-50 border-amber-700` - Brons-medalj (Skärm #5)

### Knappar
- `bg-gradient-to-r from-magic to-primary` - Primär knapp (orange gradient)
- `bg-tropical-500` - Blå knapp (Kopiera länk)
- `bg-slate-200 text-slate-800` - Sekundär knapp (grå)
- `bg-white border border-slate-300` - Tertiär knapp (vit med ram)

---

## Refaktoreringsmöjligheter

### 1. Ta bort legacy-kod (Skärm #4)

`showSinglePlayerResultScreen()` och relaterad kod kan tas bort då den inte längre är nåbar via UI. Detta minskar komplexitet och underhållsbörda.

**Filer att rensa:**
- `game.js:655-709` - Ta bort funktionen
- `game.js:838-845` - Ta bort else-grenen (eller gör om till error-hantering)

### 2. Harmonisera Skärm #1 och #2

Många skillnader mellan skärmarna är onödiga:
- Rubrik: Använd samma ("Bra kämpat!" eller "Bra jobbat!")
- Poängvisning: Använd samma styling (cirkel-badge)
- Sekundär knapp: Båda bör ha "Tillbaka till start" istället för "Spela igen"

**Viktiga skillnader att behålla:**
- Skärm #1: Direkt delningslänk (inloggad)
- Skärm #2: "Dela utmaning" knapp som kräver login + info-ruta

### 3. Konsolidera poängvisning

Poängvisning genereras på **3 aktiva ställen** med liknande men inte identisk styling:
1. `index.html:727-730` - text-7xl (Skärm #1)
2. `index.html:749-750` - text-7xl (Skärm #2)
3. `game.js:1646-1650` - restartGame() default

### Möjlig lösning: Gemensam funktion

```javascript
function generateScoreDisplayHTML(score, options = {}) {
    const { showLabel = true, size = '6xl' } = options;
    return `
        <div class="py-5 mb-5">
            ${showLabel ? '<p class="text-base text-slate-600 mb-3">Din slutpoäng:</p>' : ''}
            <div class="score-circle-badge mx-auto">
                <p class="text-${size} font-bold text-primary">${score}</p>
            </div>
        </div>
    `;
}
```

**Prioritet:** Bör göras i samband med design-uppdatering för att undvika ytterligare duplicering.
