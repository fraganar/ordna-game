# Plan: Konsolidera navigation till start screen

## Problem

**3 olika implementationer av "tillbaka till start"-funktionalitet:**

1. **Challenge result "Tillbaka"-knapp** (`challengeSystem.js` rad 776-808)
2. **Hamburger "Tillbaka till start"** (`hamburgerNav.js` rad 202-243)
3. **restartGame()** (`game.js` rad 1570-1651)

**Konsekvenser:**
- ❌ Kod-duplicering (~100 rader duplicerad logik)
- ❌ Inkonsekvent beteende (olika implementationer glömmer olika saker)
- ❌ Buggar (t.ex. challenge accept-dialog visades felaktigt)
- ❌ Svårt att underhålla (måste ändra på 3 ställen)

**Exempel på inkonsistens:**
- Challenge result-knappen gömmer `challengeAccept` explicit
- Hamburger-menyn gömmer `challengeAccept` explicit (efter bugfix)
- `restartGame()` gömmer `challengeAccept` explicit (efter bugfix)
- Alla gör samma sak men på olika sätt med olika detaljer

## Mål

Skapa EN central funktion som alla "tillbaka till start"-flöden använder.

## Lösning

### 1. Skapa central navigationsfunktion

**Fil:** `/home/ema/ordna-game/js/navigationManager.js` (ny fil)

```javascript
// Central navigation manager for consistent screen transitions
class NavigationManager {

    // Reset to start screen - THE definitive implementation
    static resetToStartScreen() {
        // 1. Stop any challenge polling
        if (window.ChallengeSystem?.stopPolling) {
            window.ChallengeSystem.stopPolling();
        }

        // 2. Clear URL parameters
        const url = new URL(window.location);
        url.searchParams.delete('challenge');
        window.history.pushState({}, '', url);

        // 3. Clear challenge state
        window.challengeId = null;

        // 4. Hide all screens explicitly
        const screensToHide = [
            'gameScreen',
            'endScreen',
            'playerSetup',
            'challengeForm',
            'challengeAccept',
            'challengeBlocked'
        ];

        screensToHide.forEach(screenId => {
            const screen = window.UI?.get(screenId);
            if (screen) screen.classList.add('hidden');
        });

        // 5. Show start screen
        const startScreen = window.UI?.get('startScreen');
        const startMain = window.UI?.get('startMain');
        if (startScreen) startScreen.classList.remove('hidden');
        if (startMain) startMain.classList.remove('hidden');

        // 6. Reset challenge system state
        if (window.ChallengeSystem) {
            window.ChallengeSystem.reset();
            window.ChallengeSystem.invalidateCache();
            window.ChallengeSystem.loadMyChallenges();
        }
    }
}

// Export globally
window.NavigationManager = NavigationManager;
```

### 2. Uppdatera alla användare

#### A. Challenge result "Tillbaka"-knapp
**Fil:** `challengeSystem.js` rad ~776

**Ersätt:**
```javascript
backToStartBtn.addEventListener('click', () => {
    this.stopPolling();
    const url = new URL(window.location);
    url.searchParams.delete('challenge');
    window.history.pushState({}, '', url);
    // ... 30+ rader kod ...
});
```

**Med:**
```javascript
backToStartBtn.addEventListener('click', () => {
    window.NavigationManager.resetToStartScreen();
});
```

#### B. Hamburger "Tillbaka till start"
**Fil:** `hamburgerNav.js` rad ~202

**Ersätt:**
```javascript
goToStart() {
    if (window.ChallengeSystem && window.ChallengeSystem.stopPolling) {
        window.ChallengeSystem.stopPolling();
    }
    // ... 40+ rader kod ...
}
```

**Med:**
```javascript
goToStart() {
    window.NavigationManager.resetToStartScreen();
}
```

#### C. restartGame()
**Fil:** `game.js` rad ~1570

**Uppdatera:**
```javascript
async function restartGame() {
    // Use central navigation
    window.NavigationManager.resetToStartScreen();

    // Game-specific cleanup (only things NOT handled by NavigationManager)
    currentQuestionIndex = 0;
    window.currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    questionStarterIndex = 0;
    selectedPack = null;

    // Hide player status bar
    const playerStatusBar = document.getElementById('player-status-bar');
    if (playerStatusBar) {
        playerStatusBar.classList.add('hidden');
    }

    // Restore endScreen HTML (game-specific)
    const endScreen = document.getElementById('end-screen');
    if (endScreen) {
        endScreen.innerHTML = `...`; // Keep existing HTML restoration
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', restartGame);
        }
    }

    // Update element references (game-specific)
    endScreenSubtitle = document.getElementById('end-screen-subtitle');
    singlePlayerFinal = document.getElementById('single-player-final');
    singleFinalScore = document.getElementById('single-final-score');
    finalScoreboard = document.getElementById('final-scoreboard');

    singlePlayerFinal.classList.add('hidden');
    finalScoreboard.classList.remove('hidden');
}
```

### 3. Lägg till i index.html

**Fil:** `index.html`

Lägg till script-tag före andra moduler:
```html
<script src="js/navigationManager.js"></script>
```

## Fördelar

**Före:**
- 3 implementationer × ~40 rader = ~120 rader duplicerad kod
- Måste ändra 3 filer för varje navigation-ändring
- Risk för inkonsistens och buggar

**Efter:**
- 1 implementation × 50 rader = 50 rader
- 3 användare × 1 rad = 3 rader
- **Total:** ~53 rader vs ~120 rader (56% mindre kod)
- Ändringar görs på ETT ställe
- Garanterat konsekvent beteende

**Exempel på kodminskning:**

| Fil | Före | Efter | Sparad |
|-----|------|-------|--------|
| challengeSystem.js | 35 rader | 1 rad | -34 rader |
| hamburgerNav.js | 42 rader | 1 rad | -41 rader |
| game.js | 82 rader | 35 rader | -47 rader |
| **Total** | **159 rader** | **37 rader** | **-122 rader** |

## Testplan

### Kritiska scenarion att testa:

1. **Challenge result "Tillbaka"**
   - Spela challenge → Se resultat → Klicka "Tillbaka"
   - Verifiera: Start screen visas, inga challenge-dialogs synliga

2. **Hamburger "Tillbaka till start"**
   - Spela challenge → Öppna hamburger → "Tillbaka till start"
   - Verifiera: Start screen visas, inga challenge-dialogs synliga

3. **"Ny utmaning"-knapp**
   - Skapa challenge → Klicka "Ny utmaning"
   - Verifiera: Start screen → Challenge form öppnas

4. **Error fallback**
   - Simulera Firebase-fel vid challenge result
   - Verifiera: Går tillbaka till start korrekt

5. **Restart game (normal flow)**
   - Spela normal single-player → Klicka "Spela igen"
   - Verifiera: Fungerar som tidigare

## Workflow

1. **Skapa navigationManager.js**
   - Implementera `NavigationManager.resetToStartScreen()`
   - Exportera globalt

2. **Lägg till i index.html**
   - Script-tag före andra moduler

3. **Uppdatera challengeSystem.js**
   - Ersätt challenge result button-logik

4. **Uppdatera hamburgerNav.js**
   - Ersätt `goToStart()`-implementation

5. **Uppdatera game.js**
   - Uppdatera `restartGame()` att använda NavigationManager
   - Behåll bara game-specifik logik

6. **Testa alla scenarion**

7. **Ta bort gamla kommentarer**
   - Rensa bort kommentarer som nu är obsolete

## Risknivå: MEDIUM

**Risk:**
- Påverkar kritiska navigationsflöden
- Många användare (3 olika platser)
- Måste fungera perfekt för bra UX

**Mitigering:**
- Noggrann testning av alla 5 scenarion
- Baserad på befintlig fungerande kod (challenge result-knappen)
- Kan enkelt revertas om problem uppstår

## Tidsuppskattning

- Skapa navigationManager.js: 15 min
- Uppdatera 3 användare: 20 min
- Testning: 20 min
- **Total: ~55 minuter**

## Framtida utökningar

När NavigationManager finns kan fler navigationsflöden konsolideras:
- `showStartScreen()` duplicering (finns i uiRenderer.js × 2)
- Screen transitions generellt
- URL parameter management

## Varför göra detta?

**Nu (efter bugfix):** Kod fungerar men är duplikerad och skör.

**Framtid:** När vi lägger till nya features (t.ex. tutorial, achievements) behöver vi modifiera navigation. Då är det kritiskt att ha EN implementation.

**Kodkvalitet:** Detta är klassisk refaktorering - gör koden lättare att underhålla utan att ändra beteende.
