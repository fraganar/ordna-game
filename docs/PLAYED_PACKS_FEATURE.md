# Spelade Frågepaket - Feature Plan

## Översikt
Spelare ska kunna se vilka frågepaket de har spelat. Detta visas via hamburgermenyn i en modal-dialog (liknande "Hur det fungerar").

**Framtida användning:** Förhindra att spelare väljer paket de redan spelat.

## Designbeslut

### Varför endast playerId (inte namn) i player-collection?
- ✅ **playerId är immutable** - ändras aldrig, perfekt som nyckel
- ✅ **Namn kan ändras** - spelare byter namn via hamburgermenyn
- ✅ **Enklare datamodell** - mindre redundans
- ✅ **Privacy** - inget namn lagrat i pakethistorik

**Namn hanteras separat:**
- Namn sparas i `localStorage` (primärt)
- Synkas till Firebase players-collection för cross-device (sekundärt)
- Pakethistoriken bryr sig bara om playerId

### UI-flow: Modal istället för direkt i menyn
**Hamburgermenyn:**
```
┌─────────────────────────────────┐
│  [Tillbaka till start]          │
│  [Byt namn]                     │
│  [Hur det fungerar]             │
│  [Mina frågepaket]          ← NY│  ← Öppnar modal
├─────────────────────────────────┤
│  [Statistik (kommer snart)]     │
└─────────────────────────────────┘
```

**Modal som öppnas:**
```
┌───────────────────────────────────┐
│  ×                                │
│  Mina Frågepaket                  │
│                                   │
│  ✅ Frågepaket 1                 │
│     Senast spelad: 2025-01-15    │
│     Bästa poäng: 12              │
│                                   │
│  ✅ Frågepaket 2                 │
│     Senast spelad: 2025-01-14    │
│     Bästa poäng: 8               │
│                                   │
│  ⬜ Frågepaket 3                 │
│     Inte spelad ännu             │
│                                   │
│  ...                              │
│                                   │
│  [Stäng]                          │
└───────────────────────────────────┘
```

**Fördelar med modal:**
- ✅ Konsekvent med "Hur det fungerar" och "Byt namn"
- ✅ Mer utrymme för information (datum, poäng)
- ✅ Scrollbar om många paket
- ✅ Håller hamburgermenyn kompakt

## Firebase Datamodell

### players/{playerId}
```javascript
{
  playerId: "abc123",
  playedPacks: {
    "fragepaket-1.json": {
      playedAt: Timestamp,       // Senaste gången
      timesPlayed: 3,             // Antal gånger totalt
      bestScore: 12               // Högsta poäng
    },
    "fragepaket-2.json": {
      playedAt: Timestamp,
      timesPlayed: 1,
      bestScore: 8
    }
  }
}
```

**Notera:**
- Inget `name` field längre - bara `playerId`
- `playedPacks` är en map (lätt att uppdatera)
- Varje packId (t.ex. "fragepaket-1.json") har egen sub-object

## Implementation

### 1. Firebase API (firebase-config.js)

**Ny funktion:**
```javascript
async updatePlayedPack(playerId, packId, score) {
    if (!firebaseInitialized) return;

    const playerRef = db.collection('players').doc(playerId);
    const packRef = playerRef.collection('playedPacks').doc(packId);

    const doc = await packRef.get();

    if (doc.exists) {
        // Update existing
        const data = doc.data();
        await packRef.update({
            playedAt: new Date(),
            timesPlayed: data.timesPlayed + 1,
            bestScore: Math.max(data.bestScore, score)
        });
    } else {
        // Create new
        await packRef.set({
            playedAt: new Date(),
            timesPlayed: 1,
            bestScore: score
        });
    }
}

async getPlayedPacks(playerId) {
    if (!firebaseInitialized) return {};

    const snapshot = await db.collection('players')
        .doc(playerId)
        .collection('playedPacks')
        .get();

    const playedPacks = {};
    snapshot.forEach(doc => {
        playedPacks[doc.id] = doc.data();
    });

    return playedPacks;
}
```

### 2. Tracking när spel avslutas

**I gameController.js (single-player/local multiplayer):**
```javascript
async endGame() {
    // ... existing code ...

    // Track played pack
    const playerId = localStorage.getItem('playerId');
    const packId = this.selectedPack; // t.ex. "fragepaket-1.json"
    const finalScore = PlayerManager.getCurrentPlayer().score;

    if (playerId && packId && window.FirebaseAPI) {
        await FirebaseAPI.updatePlayedPack(playerId, packId, finalScore);
    }
}
```

**I challengeSystem.js (challenge mode):**
```javascript
async completeChallenge() {
    // ... existing code ...

    // Track played pack
    const playerId = localStorage.getItem('playerId');
    const packId = challengeData.packId; // Hämta från challenge
    const finalScore = PlayerManager.getCurrentPlayer().score;

    if (playerId && packId && window.FirebaseAPI) {
        await FirebaseAPI.updatePlayedPack(playerId, packId, finalScore);
    }
}
```

### 3. UI - Hamburgermenyn (index.html)

**Lägg till knapp i hamburgermenyn:**
```html
<button id="menu-packs-btn" class="w-full bg-white hover:bg-slate-50 text-slate-800 font-semibold py-4 px-6 rounded-xl border-2 border-slate-200 hover:border-primary transition-all duration-300 flex items-center justify-between group">
    <span class="flex items-center">
        <svg class="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Mina frågepaket
    </span>
    <svg class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
    </svg>
</button>
```

**Modal för paketlista:**
```html
<!-- Packs Modal -->
<div id="packs-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fadeIn">
        <button id="close-packs-btn" class="float-right text-slate-400 hover:text-slate-600 transition-colors mb-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>

        <h2 class="font-poppins text-3xl font-bold text-primary mb-6 clear-both">Mina Frågepaket</h2>

        <div id="packs-list" class="space-y-3">
            <!-- Populated dynamically via JavaScript -->
        </div>

        <div class="text-center mt-6">
            <button id="close-packs-bottom-btn" class="bg-gradient-to-r from-magic to-primary text-white font-bold py-3 px-6 rounded-lg hover:from-primary hover:to-magic-dark transition-colors">
                Stäng
            </button>
        </div>
    </div>
</div>
```

### 4. Logik i hamburgerNav.js

**Lägg till i constructor:**
```javascript
this.packsModal = document.getElementById('packs-modal');
this.packsBtn = document.getElementById('menu-packs-btn');
this.closePacksBtn = document.getElementById('close-packs-btn');
this.closePacksBottomBtn = document.getElementById('close-packs-bottom-btn');
this.packsList = document.getElementById('packs-list');
```

**Event listeners:**
```javascript
this.packsBtn.addEventListener('click', () => this.openPacksModal());
this.closePacksBtn.addEventListener('click', () => this.closePacksModal());
this.closePacksBottomBtn.addEventListener('click', () => this.closePacksModal());
```

**Ny metod:**
```javascript
async openPacksModal() {
    this.closeMenu();

    setTimeout(async () => {
        // Load all packs from packs.json
        const allPacks = await window.GameData.loadAvailablePacks();

        // Load played packs from Firebase
        const playerId = localStorage.getItem('playerId');
        const playedPacks = await window.FirebaseAPI.getPlayedPacks(playerId);

        // Render list
        this.renderPacksList(allPacks, playedPacks);

        // Open modal
        this.packsModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }, 350);
}

renderPacksList(allPacks, playedPacks) {
    this.packsList.innerHTML = '';

    allPacks.forEach(pack => {
        const isPlayed = playedPacks[pack.id];
        const packItem = document.createElement('div');
        packItem.className = 'bg-slate-50 border border-slate-200 rounded-lg p-4';

        packItem.innerHTML = `
            <div class="flex items-start">
                <div class="mr-3 mt-1">
                    ${isPlayed ?
                        '<svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
                        '<svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
                    }
                </div>
                <div class="flex-1">
                    <h3 class="font-semibold text-slate-800 ${!isPlayed ? 'text-slate-400' : ''}">${pack.name}</h3>
                    <p class="text-sm text-slate-600 ${!isPlayed ? 'text-slate-400' : ''}">${pack.description}</p>
                    ${isPlayed ? `
                        <div class="mt-2 text-xs text-slate-500">
                            <p>Spelat ${playedPacks[pack.id].timesPlayed} gång(er)</p>
                            <p>Bästa poäng: ${playedPacks[pack.id].bestScore}</p>
                            <p>Senast: ${new Date(playedPacks[pack.id].playedAt.toDate()).toLocaleDateString('sv-SE')}</p>
                        </div>
                    ` : `
                        <p class="mt-2 text-xs text-slate-400 italic">Inte spelad ännu</p>
                    `}
                </div>
            </div>
        `;

        this.packsList.appendChild(packItem);
    });
}

closePacksModal() {
    this.packsModal.classList.add('hidden');
    document.body.style.overflow = '';
}
```

### 5. Styling (styles.css)

```css
/* Packs Modal - uses same scrollbar styling as help modal */
#packs-modal .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

#packs-modal .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
}

#packs-modal .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

#packs-modal .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

#packs-modal .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
```

## Framtida användning

### Förhindra val av spelade paket

**När feature aktiveras:**

1. **I pack-dropdown:** Filtrera bort spelade paket
```javascript
async populatePackSelectors() {
    const allPacks = await this.loadAvailablePacks();
    const playerId = localStorage.getItem('playerId');
    const playedPacks = await FirebaseAPI.getPlayedPacks(playerId);

    // Filter out played packs
    const availablePacks = allPacks.filter(pack => !playedPacks[pack.id]);

    // Populate dropdown with only unplayed packs
    // ...
}
```

2. **Visa meddelande:** Om alla paket är spelade
```javascript
if (availablePacks.length === 0) {
    // Show message: "Du har spelat alla frågepaket! Gratulerar!"
    // Option to "Spela om" (reset playedPacks)
}
```

3. **Pack reset:** Admin-funktion eller användar-val
```javascript
async resetPlayedPacks(playerId) {
    await db.collection('players')
        .doc(playerId)
        .collection('playedPacks')
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => doc.ref.delete());
        });
}
```

## Testplan

### Manuella tester
1. ✅ Spela ett spel med Frågepaket 1 → Se att det markeras som spelat
2. ✅ Spela samma paket igen → Se att "timesPlayed" ökar
3. ✅ Få högre poäng → Se att "bestScore" uppdateras
4. ✅ Öppna på annan enhet → Se samma spelade paket (via playerId)
5. ✅ Byt namn → Verifiera att spelade paket inte påverkas
6. ✅ Testa alla modalens stäng-alternativ (X, Stäng, ESC, click outside)

### Edge cases
- ⚠️ Firebase offline → Visa cached data eller felmeddelande
- ⚠️ Inget paket valt (blandat) → Tracka inte (eller tracka som "Blandat")
- ⚠️ Challenge-mode → Säkerställ att packId finns i challenge-data

## Filer som ändras

1. `js/firebase-config.js` - updatePlayedPack(), getPlayedPacks()
2. `js/hamburgerNav.js` - openPacksModal(), renderPacksList(), closePacksModal()
3. `js/gameController.js` - Tracking vid spelslut (single-player)
4. `js/challengeSystem.js` - Tracking vid challenge-slut
5. `index.html` - Meny-knapp + packs-modal
6. `css/styles.css` - Modal scrollbar styling
7. `docs/PLAYED_PACKS_FEATURE.md` - Denna fil (dokumentation)

## Milestones

- [ ] Milestone 1: Firebase API (updatePlayedPack, getPlayedPacks)
- [ ] Milestone 2: Tracking vid spelslut (gameController + challengeSystem)
- [ ] Milestone 3: UI (hamburgermenyn knapp + modal)
- [ ] Milestone 4: Logik (ladda & rendera paketlista)
- [ ] Milestone 5: Styling & polish
- [ ] Milestone 6: Testing & bugfixing
- [ ] Milestone 7: Deploy to staging for mobile testing
- [ ] Milestone 8: Merge to main (production)
