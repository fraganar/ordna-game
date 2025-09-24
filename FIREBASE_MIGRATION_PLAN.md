# Firebase Migration Plan - Challenge System

## Översikt
Migrering från localStorage-baserat system till Firebase-centrerat system för challenge-funktionaliteten.

## Mål
- Historik ska överleva localStorage-radering
- Korrekt dubbelspelningsskydd baserat på Firebase
- Enklare kod utan cache och fallbacks
- Bakåtkompatibel med befintliga användare

---

## Steg 0: Etablera Player-system i Firebase

### Syfte
Skapa grunden för hela migreringen genom att:
1. Minimera localStorage till endast `playerId` (och temporärt `playerName`)
2. Etablera `players` collection i Firebase som "single source of truth"
3. Möjliggöra återställning av konto via playerId
4. Säkerställa bakåtkompatibilitet för befintliga användare

### Firebase-struktur för players collection

```javascript
// players/{playerId}
{
  playerId: "player_1234567890_abc123",
  name: "Emma",
  created: timestamp,
  lastSeen: timestamp,
  stats: {
    challengesCreated: 0,
    challengesPlayed: 0,
    totalScore: 0
  }
}
```

### Ändringar

#### firebase-config.js - Nya player-funktioner
```javascript
// Skapa eller uppdatera spelare
async upsertPlayer(playerId, playerName) {
    if (!firebaseInitialized) {
        console.log('Demo mode: Would upsert player', playerId);
        return;
    }

    try {
        const playerRef = db.collection('players').doc(playerId);
        const doc = await playerRef.get();

        if (doc.exists) {
            // Uppdatera befintlig spelare
            await playerRef.update({
                name: playerName,
                lastSeen: new Date()
            });
            console.log('Player updated:', playerId);
        } else {
            // Skapa ny spelare
            await playerRef.set({
                playerId: playerId,
                name: playerName,
                created: new Date(),
                lastSeen: new Date(),
                stats: {
                    challengesCreated: 0,
                    challengesPlayed: 0,
                    totalScore: 0
                }
            });
            console.log('Player created:', playerId);
        }
    } catch (error) {
        console.error('Error upserting player:', error);
        // Inte kritiskt - fortsätt köra även om detta misslyckas
    }
}

// Hämta spelardata
async getPlayer(playerId) {
    if (!firebaseInitialized) {
        return null;
    }

    try {
        const doc = await db.collection('players').doc(playerId).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Error getting player:', error);
        return null;
    }
}

// Verifiera att playerId existerar (för återställning)
async verifyPlayerId(playerId) {
    if (!firebaseInitialized) {
        throw new Error('Firebase är inte tillgängligt');
    }

    try {
        const doc = await db.collection('players').doc(playerId).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('Error verifying player:', error);
        throw error;
    }
}
```

#### app.js - Uppdaterad initializePlayer()
```javascript
async initializePlayer() {
    let playerId = localStorage.getItem('playerId');
    let playerName = localStorage.getItem('playerName');

    if (!playerId) {
        // Ny spelare - generera ID
        playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('playerId', playerId);
        console.log('Generated new playerId:', playerId);
    }

    if (!playerName) {
        playerName = 'Spelare';
        localStorage.setItem('playerName', playerName);
    }

    // Synka med Firebase (bakgrundsjobb - får inte blockera)
    this.syncPlayerToFirebase(playerId, playerName);

    // Rensa gammal localStorage-data (förutom playerId och playerName)
    this.cleanupLocalStorage();

    console.log('Player initialized:', { playerId, playerName });
}

async syncPlayerToFirebase(playerId, playerName) {
    try {
        // Försök hämta från Firebase först
        const firebasePlayer = await FirebaseAPI.getPlayer(playerId);

        if (firebasePlayer) {
            // Spelare finns i Firebase - uppdatera lastSeen
            await FirebaseAPI.upsertPlayer(playerId, firebasePlayer.name || playerName);

            // Uppdatera lokalt namn om det skiljer sig
            if (firebasePlayer.name && firebasePlayer.name !== playerName) {
                localStorage.setItem('playerName', firebasePlayer.name);
                console.log('Updated local name from Firebase:', firebasePlayer.name);
            }
        } else {
            // Ny spelare eller befintlig utan Firebase-data
            await FirebaseAPI.upsertPlayer(playerId, playerName);
            console.log('Created/migrated player in Firebase');
        }
    } catch (error) {
        console.error('Failed to sync player to Firebase:', error);
        // Inte kritiskt - spelet fungerar även utan Firebase-sync
    }
}

cleanupLocalStorage() {
    const keysToKeep = ['playerId', 'playerName', 'selectedPacks'];
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
            keysToRemove.push(key);
        }
    }

    if (keysToRemove.length > 0) {
        console.log(`Rensar ${keysToRemove.length} gamla localStorage-nycklar`);
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}
```

#### eventHandlers.js - Uppdatera handleSavePlayerName()
```javascript
async function handleSavePlayerName() {
    const playerNameInput = UI.get('playerNameInput');
    const name = playerNameInput?.value.trim();
    if (!name) return;

    // Spara lokalt
    localStorage.setItem('playerName', name);

    // Uppdatera Firebase
    const playerId = localStorage.getItem('playerId');
    if (playerId) {
        try {
            await FirebaseAPI.upsertPlayer(playerId, name);
            console.log('Player name updated in Firebase');
        } catch (error) {
            console.error('Failed to update name in Firebase:', error);
            // Inte kritiskt - fortsätt ändå
        }
    }

    // ... rest av funktionen
}
```

#### Ny funktion för återställning (kan läggas i settings eller egen dialog)
```javascript
async function restorePlayerAccount() {
    const input = prompt('Ange ditt Player ID för att återställa ditt konto:');
    if (!input || !input.startsWith('player_')) {
        alert('Ogiltigt Player ID');
        return;
    }

    try {
        const playerData = await FirebaseAPI.verifyPlayerId(input);

        if (playerData) {
            // Återställ konto
            localStorage.setItem('playerId', playerData.playerId);
            localStorage.setItem('playerName', playerData.name);

            alert(`Konto återställt! Välkommen tillbaka ${playerData.name}!`);

            // Ladda om för att uppdatera allt
            window.location.reload();
        } else {
            alert('Player ID hittades inte. Kontrollera att du skrivit rätt.');
        }
    } catch (error) {
        alert('Kunde inte ansluta till servern. Försök igen senare.');
    }
}
```

### Test för Steg 0

1. **Ny användare:**
   - Rensa localStorage helt
   - Öppna spelet → nytt playerId genereras
   - Verifiera i Firebase Console att player-dokument skapas
   - Ange namn → verifiera att det uppdateras i Firebase

2. **Befintlig användare (bakåtkompatibilitet):**
   - Sätt manuellt `localStorage.setItem('playerId', 'player_old_123')`
   - Sätt manuellt `localStorage.setItem('playerName', 'Gammal Spelare')`
   - Öppna spelet → player ska skapas i Firebase automatiskt
   - Verifiera att gamla challenge_* tas bort från localStorage

3. **Återställning:**
   - Notera ett existerande playerId från Firebase
   - Rensa localStorage
   - Kör restorePlayerAccount() med det noterade ID:t
   - Verifiera att konto återställs korrekt

4. **Firebase offline:**
   - Stäng av internet
   - Öppna spelet → ska fungera ändå
   - Sätt på internet → verifiera att sync sker vid nästa tillfälle

5. **localStorage cleanup:**
   - Skapa flera nycklar i localStorage: `challenge_*`, `expandedChallenges`, `myChallenges`, etc.
   - Ladda om sidan
   - Verifiera att endast playerId, playerName och selectedPacks finns kvar
   - All UI-state (expandedChallenges) och challenge-data ska vara borta

### Fördelar med detta steg

1. **Minimal localStorage** - Endast essentiell data sparas lokalt
2. **Firebase som källa** - All speldata finns säkert i molnet
3. **Återställningsbar** - Användare kan få tillbaka sitt konto
4. **Bakåtkompatibel** - Gamla användare migreras automatiskt
5. **Resilient** - Fungerar även om Firebase är nere

### Varning
Efter detta steg kommer följande att tas bort permanent från localStorage:
- Alla `challenge_*` entries (challenge-data flyttas till Firebase)
- `expandedChallenges` (UI-state som inte bevaras mellan enheter)
- `myChallenges` (ersätts av Firebase-queries)
- `hasSeenResult` (inte kritisk information som inte bevaras)

Detta innebär:
- Challenge-historik hämtas alltid från Firebase
- UI återställs till standardläge vid byte av enhet
- "Sett/osett"-status återställs vid localStorage-rensning

---

## Steg 1: Uppdatera Firebase-datastruktur

### Syfte
Lägga till `playerId` i Firebase för att kunna koppla challenges till specifika användare/enheter.

### Ändringar

#### firebase-config.js - createChallenge()
**Rad 48-86:** Lägg till `challengerId` i challenge-dokumentet
```javascript
const challengeData = {
    id: challengeId,
    created: created,
    expires: expires,
    status: 'pending',
    questions: questions,
    challenger: {
        playerId: challengerId,  // NYTT FÄLT
        name: challengerName,
        completedAt: created,
        totalScore: challengerScore,
        questionScores: questionScores
    },
    opponent: null
};
```

#### firebase-config.js - completeChallenge()
**Rad 116-138:** Lägg till `playerId` för opponent
```javascript
async completeChallenge(challengeId, playerId, playerName, playerScore, questionScores) {
    // ...
    await db.collection('challenges').doc(challengeId).update({
        status: 'completed',
        opponent: {
            playerId: playerId,  // NYTT FÄLT
            name: playerName,
            completedAt: new Date(),
            totalScore: playerScore,
            questionScores: questionScores
        }
    });
}
```

#### firebase-config.js - Ny funktion för att hämta användarens challenges
```javascript
async getUserChallenges(playerId) {
    if (!firebaseInitialized) {
        throw new Error('Firebase är inte tillgängligt');
    }

    try {
        // Hämta där jag är challenger
        const challengerQuery = await db.collection('challenges')
            .where('challenger.playerId', '==', playerId)
            .get();

        // Hämta där jag är opponent
        const opponentQuery = await db.collection('challenges')
            .where('opponent.playerId', '==', playerId)
            .get();

        const challenges = [];

        challengerQuery.forEach(doc => {
            challenges.push({ ...doc.data(), role: 'challenger' });
        });

        opponentQuery.forEach(doc => {
            challenges.push({ ...doc.data(), role: 'opponent' });
        });

        // Sortera efter datum
        challenges.sort((a, b) => {
            const aDate = a.created || a.opponent?.completedAt;
            const bDate = b.created || b.opponent?.completedAt;
            return new Date(bDate) - new Date(aDate);
        });

        return challenges;
    } catch (error) {
        console.error('Error getting user challenges:', error);
        throw error;
    }
}
```

### Test
1. Skapa en ny utmaning och verifiera att `challenger.playerId` sparas i Firebase Console
2. Acceptera en utmaning och verifiera att `opponent.playerId` sparas
3. Testa getUserChallenges() med ett känt playerId

---

## Steg 2: Implementera dubbelspelningsskydd

### Syfte
Förhindra att samma person spelar en utmaning flera gånger, baserat på Firebase-data istället för localStorage.

### Ändringar

#### app.js - showChallengeAcceptScreen()
**Rad ~230:** Lägg till kontroll av challenge-status
```javascript
async showChallengeAcceptScreen() {
    try {
        // Hämta challenge från Firebase (redan gjort i loadChallenge)
        const challenge = window.ChallengeSystem.challengeData;

        // Kontrollera om utmaningen redan är slutförd
        if (challenge.status === 'completed') {
            // Visa meddelande istället för accept-skärm
            const startScreen = UI.get('startScreen');
            const challengeAccept = UI.get('challengeAccept');

            if (challengeAccept) challengeAccept.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');

            UI.showMessage('Denna utmaning är redan slutförd!');

            // Visa resultat om jag var med i utmaningen
            const myPlayerId = localStorage.getItem('playerId');
            if (challenge.challenger?.playerId === myPlayerId ||
                challenge.opponent?.playerId === myPlayerId) {
                setTimeout(() => {
                    window.ChallengeSystem.showChallengeResultView(window.challengeId);
                }, 2000);
            }
            return;
        }

        // Kontrollera om jag är challengern (kan inte spela min egen utmaning)
        const myPlayerId = localStorage.getItem('playerId');
        if (challenge.challenger?.playerId === myPlayerId) {
            const startScreen = UI.get('startScreen');
            const challengeAccept = UI.get('challengeAccept');

            if (challengeAccept) challengeAccept.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');

            UI.showMessage('Du kan inte spela din egen utmaning!');
            return;
        }

        // Visa normal accept-skärm
        const startScreen = UI.get('startScreen');
        const challengeAccept = UI.get('challengeAccept');
        const challengerDisplayName = UI.get('challengerDisplayName');

        if (startScreen) startScreen.classList.add('hidden');
        if (challengeAccept) challengeAccept.classList.remove('hidden');
        if (challengerDisplayName && challenge.challenger) {
            challengerDisplayName.textContent = challenge.challenger.name;
        }

    } catch (error) {
        console.error('Failed to show challenge accept screen:', error);
        UI.showError('Kunde inte ladda utmaning');
    }
}
```

#### game.js - startChallengeGame()
**Rad 559-567:** Ta bort localStorage-check, använd Firebase istället
```javascript
// Ta bort detta block helt:
// const storedChallenge = localStorage.getItem(`challenge_${window.challengeId}`);
// if (storedChallenge) { ... }

// Dubbelspelningsskydd hanteras nu i showChallengeAcceptScreen()
```

### Test
1. Skapa en utmaning och försök acceptera den med samma användare → ska få felmeddelande
2. Slutför en utmaning och försök spela den igen → ska visa "redan slutförd"
3. Öppna en slutförd utmanings länk → ska visa resultat direkt om du var deltagare

---

## Steg 3: Firebase-baserad loadMyChallenges()

### Syfte
Hämta användarens challenge-historik från Firebase istället för localStorage.

### Ändringar

#### challengeSystem.js - loadMyChallenges()
**Rad 391-698:** Ersätt hela funktionen
```javascript
async loadMyChallenges() {
    const myChallengesSection = document.getElementById('my-challenges-section');
    const myChallengesList = document.getElementById('my-challenges-list');

    // Hämta playerId från localStorage
    const myPlayerId = localStorage.getItem('playerId');

    if (!myPlayerId) {
        // Ingen playerId = inga challenges att visa
        if (myChallengesSection) myChallengesSection.classList.add('hidden');
        return;
    }

    try {
        // Hämta challenges från Firebase
        const allChallenges = await FirebaseAPI.getUserChallenges(myPlayerId);

        if (allChallenges.length === 0) {
            if (myChallengesSection) myChallengesSection.classList.add('hidden');
            return;
        }

        // Visa sektionen
        if (myChallengesSection) {
            myChallengesSection.classList.remove('hidden');
        }

        // Rensa listan
        if (myChallengesList) {
            myChallengesList.innerHTML = '';

            // Visa max 5 senaste
            for (const challenge of allChallenges.slice(0, 5)) {
                const item = document.createElement('div');
                item.className = 'challenge-list-item bg-slate-50 border border-slate-200 rounded-lg overflow-hidden transition-all duration-300';

                // Bestäm status och visa
                const isComplete = challenge.status === 'completed';
                const isChallenger = challenge.role === 'challenger';

                if (isComplete) {
                    // Utmaning är klar - visa resultat
                    const myData = isChallenger ? challenge.challenger : challenge.opponent;
                    const opponentData = isChallenger ? challenge.opponent : challenge.challenger;

                    const myScore = myData.totalScore;
                    const oppScore = opponentData.totalScore;
                    const resultEmoji = myScore > oppScore ? '🏆' : myScore < oppScore ? '' : '🤝';

                    item.innerHTML = `
                        <div class="p-3 cursor-pointer" data-challenge-id="${challenge.id}">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <p class="font-semibold text-slate-800">
                                        ${isChallenger ? 'Utmanade' : 'Utmanad av'} ${opponentData.name}
                                    </p>
                                    <p class="text-sm text-slate-600 font-medium mt-1">
                                        Du: ${myScore}p vs ${opponentData.name}: ${oppScore}p ${resultEmoji}
                                    </p>
                                    <p class="text-xs text-slate-500 mt-1">${this.getTimeAgo(challenge.created)}</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded">Klar</span>
                                </div>
                            </div>
                        </div>
                    `;

                    // Klickhandler för att visa detaljer
                    item.addEventListener('click', () => {
                        window.ChallengeSystem.showChallengeResultView(challenge.id);
                    });

                } else {
                    // Väntar på motståndare
                    item.innerHTML = `
                        <div class="p-3">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <p class="font-semibold text-slate-800">Väntar på motståndare</p>
                                    <p class="text-sm text-slate-500">${this.getTimeAgo(challenge.created)}</p>
                                </div>
                                <div class="flex items-center">
                                    <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Väntar</span>
                                    <button class="share-challenge-btn ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                            data-challenge-id="${challenge.id}">
                                        Dela
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;

                    // Dela-knapp handler
                    const shareBtn = item.querySelector('.share-challenge-btn');
                    if (shareBtn) {
                        shareBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}${window.location.pathname}?challenge=${challenge.id}`;
                            // ... delningslogik
                        });
                    }
                }

                myChallengesList.appendChild(item);
            }
        }

    } catch (error) {
        console.error('Failed to load challenges from Firebase:', error);
        // Visa felmeddelande istället för att tyst misslyckas
        if (myChallengesSection) myChallengesSection.classList.add('hidden');
        console.log('Kunde inte hämta utmaningar från servern');
    }
}
```

### Test
1. Radera localStorage helt och ladda om → ska inte visa några challenges
2. Logga in med känt playerId → ska visa dina challenges från Firebase
3. Testa utan internetanslutning → ska få felmeddelande, inte visa gammal data

---

## Steg 4: Uppdatera challenge-skapande och accepterande

### Syfte
Se till att playerId alltid skickas med när challenges skapas eller accepteras.

### Ändringar

#### challengeSystem.js - completeChallenge()
**Rad 161-169:** Skicka med playerId
```javascript
const newChallengeId = await FirebaseAPI.createChallenge(
    playerName,
    playerId,  // redan implementerat
    window.challengeQuestions,
    finalScore,
    completeScores,
    window.selectedPack
);
```

#### game.js - endGame() för opponent mode
**Rad ~780:** Skicka med playerId när opponent slutför
```javascript
if (window.challengeId && !isChallenger) {
    const playerId = localStorage.getItem('playerId');
    const playerName = players[0].name;
    const totalScore = players[0].score;

    await FirebaseAPI.completeChallenge(
        window.challengeId,
        playerId,  // NYTT
        playerName,
        totalScore,
        window.challengeQuestionScores
    );
}
```

### Test
1. Skapa ny utmaning → verifiera challenger.playerId i Firebase
2. Acceptera utmaning → verifiera opponent.playerId i Firebase
3. Kontrollera att båda kan se utmaningen i sin historik

---

## Steg 5: Bakåtkompatibilitet och migration

### Syfte
Migrera befintlig data från localStorage till Firebase vid första körningen.

### Ändringar

#### app.js - initializePlayer()
**Rad 69-85:** Lägg till migration av gamla challenges
```javascript
initializePlayer() {
    let playerId = localStorage.getItem('playerId');
    let playerName = localStorage.getItem('playerName');

    if (!playerId) {
        playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('playerId', playerId);
    }

    if (!playerName) {
        playerName = 'Spelare';
        localStorage.setItem('playerName', playerName);
    }

    // Migration: Ta bort gamla challenge_* från localStorage
    // (endast om vi vet att Firebase fungerar)
    this.migrateOldChallenges(playerId);

    console.log('Player initialized:', { playerId, playerName });
}

async migrateOldChallenges(playerId) {
    try {
        // Hitta alla gamla challenge_* i localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('challenge_')) {
                keysToRemove.push(key);
            }
        }

        if (keysToRemove.length > 0) {
            console.log(`Migrerar ${keysToRemove.length} gamla challenges från localStorage`);

            // Ta bort alla gamla challenge_* entries
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log('Migration klar - gamla challenges borttagna från localStorage');
        }
    } catch (error) {
        console.error('Migration misslyckades:', error);
        // Fortsätt köra även om migration misslyckas
    }
}
```

### Test
1. Skapa några challenge_* entries i localStorage manuellt
2. Ladda om sidan → ska tas bort automatiskt
3. Verifiera att endast playerId och playerName finns kvar i localStorage

---

## Steg 6: Felhantering

### Syfte
Visa tydliga felmeddelanden när Firebase inte är tillgängligt.

### Ändringar

#### Alla Firebase-anrop
Lägg till try-catch med tydliga felmeddelanden:
```javascript
try {
    // Firebase-anrop
} catch (error) {
    if (!navigator.onLine) {
        UI.showError('Ingen internetanslutning. Försök igen när du är online.');
    } else {
        UI.showError('Kunde inte ansluta till servern. Försök igen senare.');
    }
    // Gå tillbaka till start eller annan säker vy
}
```

### Test
1. Stäng av internet och försök skapa utmaning → tydligt felmeddelande
2. Stäng av internet och försök ladda historik → tydligt felmeddelande
3. Simulera Firebase-fel → tydligt felmeddelande

---

## Testplan för hela migreringen

### Innan deployment
1. **Skapa ny utmaning** → Verifiera att challenger.playerId sparas
2. **Acceptera utmaning** → Verifiera att opponent.playerId sparas
3. **Försök spela samma utmaning två gånger** → Ska blockeras
4. **Radera localStorage** → Historik ska försvinna
5. **Ange samma playerId igen** → Historik ska komma tillbaka
6. **Testa utan internet** → Tydliga felmeddelanden

### Efter deployment
1. Befintliga användare ska behålla sitt playerId
2. Gamla challenge_* ska tas bort från localStorage
3. Alla nya challenges ska sparas med playerId
4. Historik ska fungera även efter localStorage-radering

---

## Rollback-plan

Om något går fel:
1. Firebase-strukturen är bakåtkompatibel (nya fält ignoreras av gammal kod)
2. Spara en backup av nuvarande kod innan deployment
3. Testa grundligt i utvecklingsmiljö först
4. Deploy i steg och övervaka felloggar

---

## Tidsuppskattning

- **Steg 1:** 1-2 timmar (Firebase-struktur)
- **Steg 2:** 2-3 timmar (Dubbelspelningsskydd)
- **Steg 3:** 2-3 timmar (loadMyChallenges)
- **Steg 4:** 1 timme (Uppdatera skapande/accepterande)
- **Steg 5:** 1 timme (Migration)
- **Steg 6:** 1 timme (Felhantering)
- **Testning:** 2-3 timmar

**Total:** 10-15 timmar

---

## Framtida förbättringar

Efter denna migration kan vi överväga:
1. Möjlighet att ange playerId manuellt för att återställa historik
2. Export/import av playerId för backup
3. Koppla playerId till e-post för enklare återställning
4. Cache med TTL för bättre prestanda (om behövs)