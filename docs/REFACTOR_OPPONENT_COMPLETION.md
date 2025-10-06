# Plan: Refaktorera opponent challenge completion till challengeSystem

## Mål
Flytta opponent completion-logik från `game.js` till `challengeSystem.js` för bättre arkitektur och ta bort duplicerad kod.

## Bakgrund
**Nuvarande problem:**
- `game.js` hanterar opponent completion direkt (rad 769-809)
- `challengeSystem.js:acceptChallenge()` finns men anropas aldrig (död kod)
- Duplicerad tracking-logik på två ställen

**Efter refaktorering:**
- All challenge-logik ligger i `challengeSystem.js`
- `game.js` delegerar till `ChallengeSystem.acceptChallenge()`
- Enklare att underhålla och testa

## Ändringar

### 1. Uppdatera `challengeSystem.js:acceptChallenge()`
**Fil:** `/home/ema/ordna-game/js/challengeSystem.js` (rad 223-254)

**Nuvarande signatur:**
```javascript
async acceptChallenge(challengeId, playerName, scores, totalScore)
```

**Ny signatur:**
```javascript
async acceptChallenge(challengeId, playerId, playerName, playerScore, questionScores)
```

**Ny implementation:**
```javascript
async acceptChallenge(challengeId, playerId, playerName, playerScore, questionScores) {
    try {
        // Save to Firebase
        await FirebaseAPI.completeChallenge(challengeId, playerId, playerName, playerScore, questionScores);

        // Track played pack for opponent
        try {
            const challengeData = await FirebaseAPI.getChallenge(challengeId);
            const packId = challengeData.packId;

            if (!packId) {
                console.error('Challenge missing packId - cannot track played pack');
            } else if (playerId && window.FirebaseAPI) {
                await window.FirebaseAPI.updatePlayedPack(playerId, packId, playerScore);
            }
        } catch (error) {
            console.error('Failed to track played pack for opponent:', error);
            // Non-blocking error - game continues normally
        }

        // Show result comparison view
        await this.showChallengeResultView(challengeId);

        return true;
    } catch (error) {
        console.error('Failed to accept challenge:', error);
        throw error;
    }
}
```

### 2. Förenkla `game.js:endSinglePlayerGame()`
**Fil:** `/home/ema/ordna-game/js/game.js` (rad 769-816)

**Ersätt:**
```javascript
else if (ischallengeMode && window.challengeId && !window.isChallenger) {
    try {
        // Säkerställ att globala variabler är synkade
        const player = window.PlayerManager?.getCurrentPlayer();
        if (player) {
            currentPlayer = player;
            players = window.PlayerManager.getPlayers();
        }

        const playerName = player?.name || currentPlayer?.name || 'Unknown';
        const playerScore = player?.score || 0;
        const playerId = localStorage.getItem('playerId') || 'unknown_player';

        await FirebaseAPI.completeChallenge(...);
        // Track played pack for opponent
        try {
            const challengeData = await FirebaseAPI.getChallenge(window.challengeId);
            const packId = challengeData.packId;
            ...
        } catch (error) {
            ...
        }
        await window.ChallengeSystem.showChallengeResultView(window.challengeId);

    } catch (error) {
        console.error('Failed to complete challenge:', error);
        UI?.showError('Kunde inte spara resultat. Försök igen.');
        UI?.showEndScreen();
        ...
    }
}
```

**Med:**
```javascript
else if (ischallengeMode && window.challengeId && !window.isChallenger) {
    try {
        // Säkerställ att globala variabler är synkade
        const player = window.PlayerManager?.getCurrentPlayer();
        if (player) {
            currentPlayer = player;
            players = window.PlayerManager.getPlayers();
        }

        const playerName = player?.name || currentPlayer?.name || 'Unknown';
        const playerScore = player?.score || 0;
        const playerId = localStorage.getItem('playerId') || 'unknown_player';

        // Delegate all challenge completion to ChallengeSystem
        await window.ChallengeSystem.acceptChallenge(
            window.challengeId,
            playerId,
            playerName,
            playerScore,
            challengeQuestionScores
        );

    } catch (error) {
        console.error('Failed to complete challenge:', error);
        UI?.showError('Kunde inte spara resultat. Försök igen.');
        UI?.showEndScreen();

        const player = window.PlayerManager?.getCurrentPlayer();
        const errorFallbackScore = player?.score || 0;
        UI?.setFinalScore(errorFallbackScore);
    }
}
```

## Testplan

### Kritiska scenarion att testa:
1. **Opponent accepterar challenge:**
   - Skapa challenge från enhet A
   - Acceptera på enhet B
   - Verifiera: Resultat visas korrekt
   - Verifiera: Paketet markeras som spelat för opponent

2. **Challenger skapar challenge:**
   - Skapa challenge
   - Verifiera: Fungerar som tidigare (ingen ändring)
   - Verifiera: Paketet markeras som spelat för challenger

3. **Felhantering:**
   - Simulera Firebase-fel (koppla ur nätet)
   - Verifiera: Felmeddelande visas
   - Verifiera: Spelet kraschar inte

## Workflow

1. **Skapa feature branch från `main`:**
   ```bash
   git checkout -b feature/refactor-opponent-completion
   ```

2. **Gör ändringar:**
   - Uppdatera `challengeSystem.js:acceptChallenge()`
   - Förenkla `game.js` opponent completion block

3. **Testa lokalt:**
   - Starta lokal server
   - Testa alla 3 scenarion ovan

4. **Commit:**
   ```
   refactor: Move opponent completion logic to challengeSystem

   - Update challengeSystem.acceptChallenge() to handle full opponent flow
   - Delegate from game.js to ChallengeSystem.acceptChallenge()
   - Remove duplicated tracking code in game.js
   - Cleaner architecture: all challenge logic in challengeSystem
   ```

5. **Merge till staging för testning**

6. **Merge till main**

## Risknivå: LOW-MEDIUM

**Låg risk eftersom:**
- Ändrar bara opponent-flödet (challenger orörd)
- Flyttar befintlig fungerande kod (inte ny logik)
- Enkel att testa (acceptera en challenge)

**Medium risk eftersom:**
- Påverkar kritiskt challenge-flöde
- Ändrar error handling-path

## Tidsuppskattning
- Kodändringar: 5-10 minuter
- Testning: 10-15 minuter
- **Totalt: ~20-25 minuter**

## Varför göra detta?

**Fördelar:**
- **Bättre separation of concerns** - All challenge-logik i challengeSystem.js
- **Mindre duplicerad kod** - Tracking finns bara på ett ställe
- **Enklare att underhålla** - En funktion att uppdatera istället för två
- **Tydligare ansvar** - game.js delegerar till rätt modul

**Kod före (game.js 40+ rader):**
```javascript
await FirebaseAPI.completeChallenge(...);
try {
    const challengeData = await FirebaseAPI.getChallenge(...);
    const packId = challengeData.packId;
    if (!packId) {
        console.error(...);
    } else if (playerId && window.FirebaseAPI) {
        await window.FirebaseAPI.updatePlayedPack(...);
    }
} catch (error) {
    console.error(...);
}
await window.ChallengeSystem.showChallengeResultView(...);
```

**Kod efter (game.js 5 rader):**
```javascript
await window.ChallengeSystem.acceptChallenge(
    window.challengeId,
    playerId,
    playerName,
    playerScore,
    challengeQuestionScores
);
```

**Resultat:** Renare kod, lättare att läsa, enklare att testa.
