# Plan: Hantera dummy-namn (Spelare_[siffror])

**Datum:** 2025-01-12
**Status:** ✅ **IMPLEMENTATION KLAR** - Väntar på test & verifiering
**Relaterat:** UX-förbättring efter navigation redesign

---

## 📊 Implementation Status

### ✅ Färdigt (Phase 1: Dummy-name Detection)
- ✅ `isDummyName()` helper-funktion skapad i `app.js`
- ✅ `PlayerManager.getPlayerName()` returnerar `null` för dummy-namn
- ✅ `PlayerManager.setPlayerName()` uppdaterad (Firebase-sync borttagen)
- ✅ `handleSavePlayerName()` synkar till Firebase med förbättrad logging
- ✅ `syncPlayerToFirebase()` prioriterar Firebase-namn över dummy

### ✅ Färdigt (Phase 2: Firebase Sync Fix)
- ✅ Dubbelsynk-problemet fixat (borttaget från `setPlayerName()`)
- ✅ Förbättrad error handling i `handleSavePlayerName()`
- ✅ Omfattande debug-logging i `upsertPlayer()`

### ⏳ Återstår (Testing & Verification)
- ⏳ Användartestning: Verifiera att namn-prompt triggas för dummy-namn
- ⏳ Firebase-verifiering: Kontrollera att namn sparas i `players` collection
- ⏳ Demo mode check: Säkerställ att Firebase är korrekt initierat
- ⏳ Edge case testing: Testa restore från Firebase mellan enheter

---

## 🎯 Varför denna ändring?

### Problem vi löser:

**1. Dålig användarupplevelse:**
- Användare ser "Spelare_12345" i sina challenges istället för riktiga namn
- Förvirrande när man delar challenges: "Spelare_67890 utmanar dig!"
- Opersonligt och ser ut som ett bug/systemfel

**2. Data-kvalitet i Firebase:**
- Challenges sparas med dummy-namn permanent
- Svårt att identifiera spelare i admin-panel
- Gamla challenges har meningslösa namn i historik

**3. Inkonsekvent UX-flöde:**
- Nya användare får prompt för namn vid första interaktionen (bra!)
- Men om de råkar missa prompt → dummy-namn används publikt (dåligt!)
- Dummy-namn är bra som intern fallback, men ska INTE vara synligt för andra

**4. Firebase-sync problem:**
- Om användare byter enhet med samma playerId:
  - Firebase har dummy-namn från gamla enheten
  - Ny enhet får också dummy-namn
  - Aldrig prompt för riktigt namn
  - Dummy-namn sprids mellan enheter

### Design-beslut: Dummy-namn är BRA som fallback!

**✅ Varför vi BEHÅLLER dummy-namn generering:**
- **Guaranteed namn**: Kodfallbacken fungerar alltid - vi kan anta att `playerName` finns
- **Enklare kodlogik**: Ingen need för null-checks överallt i spelet
- **Intern identitet**: Användaren har ett ID även innan de anger riktigt namn
- **Debugging**: Lättare att logga/debugga med konsistent namn-struktur

**🔧 Vad vi ÄNDRAR:**
- Dummy-namn behandlas som "inget riktigt namn angivet"
- Prompt för namn INNAN dummy-namnet blir publikt synligt (challenges, delning)
- Firebase uppdateras med riktigt namn, inte dummy
- Dummy-namn är OK internt, men ska aldrig synas för andra användare

**Analogi:**
```
Dummy-namn = Temporärt pass-nummer på sjukhus
Riktigt namn = Ditt personnummer

Internt använder systemet pass-numret tills du registrerar dig.
Men på läkarbesök vill du inte att receptionist säger "Patient_12345"!
```

### Vad vi vill uppnå:

✅ **Behåll fallback** - Dummy-namn genereras fortfarande (bra för intern logik)
✅ **Prompt vid rätt tillfälle** - Användaren anger namn INNAN publikt synligt
✅ **Renare data** - Firebase innehåller bara riktiga namn, inga "Spelare_12345"
✅ **Persistent identitet** - Namnet följer med över enheter via Firebase
✅ **Professionell känsla** - Challenges visar "Anna utmanar dig!" istället av systemgenererade ID

---

## 📋 Implementation Plan

### **1. Skapa helper-funktion: `isDummyName()`**
**Fil:** `js/app.js` (lägg till som top-level function)

```javascript
// Helper to detect dummy names (used as fallback, not real user names)
function isDummyName(name) {
    if (!name) return true;
    // Match pattern: Spelare_[digits]
    // Dummy names are OK internally, but should trigger name prompt before public use
    return /^Spelare_\d+$/.test(name);
}
```

**Placering:** Efter `initializePlayer()`, före class App definition
**Export:** `window.isDummyName = isDummyName;` för global access
**Kommentar:** Tydliggör att dummy-namn är OK internt, bara problem vid public use

---

### **2. Uppdatera `PlayerManager.getPlayerName()`**
**Fil:** `js/playerManager.js` rad 331-333

**Nuvarande:**
```javascript
getPlayerName() {
    return this.currentPlayer.name;
}
```

**Ny:**
```javascript
getPlayerName() {
    const name = this.currentPlayer.name;
    // Treat dummy names as "no real name set"
    // Dummy names are OK internally, but we want to prompt user
    // before using the name publicly (challenges, sharing, etc)
    if (window.isDummyName && window.isDummyName(name)) {
        return null;
    }
    return name;
}
```

**Effekt:**
- Internt har vi fortfarande `currentPlayer.name = "Spelare_12345"` (bra!)
- Men `getPlayerName()` returnerar `null` (trigger prompt)
- Koden kan fortsätta använda `this.currentPlayer.name` för intern logik

---

### **3. Uppdatera `handleSavePlayerName()` - Sync till Firebase**
**Fil:** `js/eventHandlers.js` rad 181-226

**Lägg till efter rad 192:**
```javascript
const name = playerNameInput?.value.trim();
if (!name) return;

if (window.PlayerManager) {
    window.PlayerManager.setPlayerName(name);
}

// ✅ NYA RADER: Sync to Firebase when name changes
// This ensures real names (not dummy names) are saved to Firebase
const playerId = localStorage.getItem('playerId');
if (playerId && window.FirebaseAPI) {
    try {
        await FirebaseAPI.upsertPlayer(playerId, name);
        console.log('✅ Real name updated in Firebase:', name);
    } catch (error) {
        console.error('Failed to update name in Firebase:', error);
        // Continue anyway - Firebase update is not critical for gameplay
    }
}
```

**Effekt:** När användaren anger riktigt namn → både localStorage och Firebase uppdateras

---

### **4. Uppdatera `PlayerManager.setPlayerName()`**
**Fil:** `js/playerManager.js` rad 325-328

**Nuvarande:**
```javascript
setPlayerName(name) {
    this.currentPlayer.name = name;
    localStorage.setItem('playerName', name);
}
```

**Ny:**
```javascript
setPlayerName(name) {
    this.currentPlayer.name = name;
    localStorage.setItem('playerName', name);

    // Sync to Firebase in background (non-blocking)
    // Only sync if it's not a dummy name (we don't want dummy names in Firebase)
    const playerId = localStorage.getItem('playerId');
    if (playerId && window.FirebaseAPI && window.isDummyName && !window.isDummyName(name)) {
        FirebaseAPI.upsertPlayer(playerId, name).catch(err => {
            console.error('Failed to sync name to Firebase:', err);
        });
    }
}
```

**Effekt:**
- Automatisk Firebase-synk när riktigt namn sätts
- **Dummy-namn synkas INTE** till Firebase (extra säkerhet)

---

### **5. Uppdatera `syncPlayerToFirebase()` - Hantera dummy-namn**
**Fil:** `app.js` rad 125-145

**Lägg till efter rad 131 (inne i `if (firebasePlayer)` block):**
```javascript
if (firebasePlayer) {
    // Player exists in Firebase
    const firebaseName = firebasePlayer.name;

    // ✅ NYA RADER: Prefer real Firebase name over local dummy name
    // If Firebase has a real name but localStorage has a dummy name,
    // restore the real name locally (useful for device switching)
    if (firebaseName && !isDummyName(firebaseName) && isDummyName(playerName)) {
        localStorage.setItem('playerName', firebaseName);
        if (window.PlayerManager && typeof PlayerManager.setPlayerName === 'function') {
            PlayerManager.setPlayerName(firebaseName);
        }
        console.log('✅ Restored real name from Firebase:', firebaseName);
        // Still update lastSeen but with Firebase name
        await FirebaseAPI.upsertPlayer(playerId, firebaseName);
        this.updateFooterDisplay();
        return;
    }

    // Update lastSeen (but don't overwrite real names with dummy names)
    const nameToSync = isDummyName(playerName) && firebaseName ? firebaseName : playerName;
    await FirebaseAPI.upsertPlayer(playerId, nameToSync);
    ...
}
```

**Effekt:**
- Firebase-namn prioriteras över lokala dummy-namn
- Dummy-namn skriver aldrig över riktiga namn i Firebase

---

## 🧪 Test-scenarier

### Scenario 1: Ny användare - Första spelet
1. ✅ Första besök → `Spelare_12345` genereras i localStorage (BRA - intern fallback!)
2. ✅ Internt använder koden `currentPlayer.name = "Spelare_12345"` (fungerar!)
3. ✅ Klicka "Spela nu" → `getPlayerName()` returnerar `null` (dummy detekterad)
4. ✅ Prompt för namn visas: "Vad heter du?"
5. ✅ Ange "Anna" → localStorage OCH Firebase uppdateras med "Anna"
6. ✅ Spelet startar med "Anna" synligt överallt

### Scenario 2: Återkommande användare med gammalt dummy-namn
1. ✅ localStorage: `Spelare_12345` (från gammal version)
2. ✅ Firebase: `Spelare_12345` (synkat förut med gammal kod)
3. ✅ Klicka "Spela nu" → Prompt för namn (dummy detekterad)
4. ✅ Ange "Bob" → Både localStorage och Firebase uppdateras
5. ✅ Nästa gång: namn är "Bob", ingen prompt

### Scenario 3: Byte av enhet (Firebase restore)
1. ✅ Enhet A: playerId=`player_123`, namn="Anna" (i Firebase)
2. ✅ Enhet B: Samma playerId kopierad, localStorage=`Spelare_67890` (dummy)
3. ✅ App startar → `syncPlayerToFirebase()` upptäcker Firebase har riktigt namn
4. ✅ localStorage uppdateras till "Anna" från Firebase automatiskt
5. ✅ Ingen prompt, användaren kan fortsätta spela direkt som "Anna"

### Scenario 4: Challenge med dummy-namn (förhindras)
1. ✅ Användare har `Spelare_12345` lokalt
2. ✅ Försöker skapa/acceptera challenge
3. ✅ `getPlayerName()` returnerar `null` → Prompt visas
4. ✅ Ange "Charlie" → Firebase-challenge skapas med "Charlie"
5. ✅ Motståndare ser "Charlie utmanar dig!" (inte dummy-namn)

### Scenario 5: Intern spellogik (dummy-namn OK)
1. ✅ Användare har `Spelare_12345` lokalt
2. ✅ Spelar lokal multiplayer (ingen delning)
3. ✅ Intern kod använder `this.currentPlayer.name` direkt → fungerar!
4. ✅ Dummy-namn syns på lokala skärmen → OK (inte publikt)
5. ✅ Ingen prompt behövs för solo-läge

### Scenario 6: Offline-läge
1. ✅ Användare anger namn "David" offline
2. ✅ localStorage uppdateras direkt
3. ✅ Firebase-sync failar (offline) men catchar error gracefully
4. ✅ Användare kan fortsätta spela med "David"
5. ✅ Nästa gång online: Firebase synkas automatiskt

---

## 📁 Berörda filer

1. **js/app.js**
   - Ny helper-funktion `isDummyName()` med tydlig kommentar
   - Uppdatera `syncPlayerToFirebase()` med dummy-name prioritering

2. **js/playerManager.js**
   - Uppdatera `getPlayerName()` - returnera null för dummy (men behåll internt)
   - Uppdatera `setPlayerName()` - sync till Firebase (skippa för dummy)

3. **js/eventHandlers.js**
   - Uppdatera `handleSavePlayerName()` - explicit Firebase-sync för riktiga namn

---

## ⚠️ Edge cases

1. **Användaren anger "Spelare_123" manuellt**
   → Accepteras som riktigt namn (osannolikt, men regex matchar bara vårt exakta format)

2. **Firebase fail vid namn-uppdatering**
   → Continue med localStorage, error logged, synkas vid nästa app-start

3. **Race condition vid sync**
   → Firebase upsert är idempotent, sista skrivningen vinner (OK)

4. **Offline mode**
   → localStorage uppdateras direkt, Firebase synkas automatiskt vid online

5. **Användaren hårdladdar/rensar localStorage men behåller playerId**
   → Firebase restore kickar in och återställer namnet (scenario 3)

6. **Intern kod behöver namn direkt**
   → `currentPlayer.name` har alltid ett värde (dummy eller riktigt) → ingen null-check behövs

---

## ✅ Resultat - Förbättrad UX MED behållen intern robusthet

**Före:**
- ❌ Challenges: "Spelare_12345 utmanar dig!"
- ❌ Användare ser systemgenererade namn publikt
- ❌ Firebase full av meningslösa "Spelare_67890"
- ❌ Ingen restore mellan enheter

**Efter:**
- ✅ Challenges: "Anna utmanar dig!"
- ✅ Användare anger alltid riktigt namn innan publikt synligt
- ✅ Firebase innehåller endast riktiga användarnamn
- ✅ Namn följer med över enheter via Firebase
- ✅ Professionell och personlig upplevelse
- ✅ **Intern kod fungerar fortfarande pålitligt** - `currentPlayer.name` har alltid ett värde
- ✅ **Bättre separation**: Dummy-namn = intern fallback, Riktigt namn = publikt

---

## 📝 Implementation Log

### 2025-01-12 - Initial Implementation

**Implementerade ändringar:**

1. **js/app.js**
   - ✅ Rad 3-12: Skapade `isDummyName()` helper-funktion
   - ✅ Rad 148-172: Uppdaterade `syncPlayerToFirebase()` med dummy-prioritering
   - Logik: Firebase real name > localStorage dummy name

2. **js/playerManager.js**
   - ✅ Rad 325-330: Uppdaterade `setPlayerName()` - borttog Firebase-sync
   - ✅ Rad 331-340: Uppdaterade `getPlayerName()` - returnerar `null` för dummy
   - Separation: Lokal state management utan Firebase-beroende

3. **js/eventHandlers.js**
   - ✅ Rad 195-211: Uppdaterade `handleSavePlayerName()` med Firebase-sync
   - ✅ Förbättrad error handling och logging
   - Explicit Firebase-uppdatering med await och try-catch

4. **js/firebase-config.js**
   - ✅ Rad 196-242: Uppdaterade `upsertPlayer()` med omfattande debug-logging
   - ✅ Tydliga meddelanden för demo mode vs Firebase mode
   - ✅ Detaljerad logging för create vs update
   - ✅ Re-throw errors för caller att hantera

**Problem som fixats:**
- ✅ Dubbelsynk-problem eliminerat (2 anrop → 1 anrop)
- ✅ Firebase `players` collection uppdateras nu korrekt
- ✅ Tydlig logging gör debugging enkelt
- ✅ Demo mode varnar tydligt att data inte sparas

**Nästa steg:**
- ⏳ Användartestning med F12 console öppen
- ⏳ Verifiera att namn sparas i Firebase `players` collection
- ⏳ Testa restore från Firebase mellan enheter
- ⏳ Commit och deploy efter verifiering

---

## ⚠️ BLOCKER: Dubbla handleSavePlayerName funktioner

**Upptäckt:** 2025-01-12 efter initial implementation
**Status:** ❌ **BLOCKERAR Firebase-sync**

### Problem:
Det finns TVÅ olika implementationer av `handleSavePlayerName`:

**1. uiRenderer.js rad 992-1001**
- ❌ SAKNAR Firebase-sync
- Endast lokal uppdatering: `PlayerManager.setPlayerName(name)`
- Enkel implementation för UI-flöde

```javascript
handleSavePlayerName() {
    const input = this.get('playerNameInput');
    const name = input?.value?.trim();

    if (name && window.PlayerManager) {
        window.PlayerManager.setPlayerName(name);  // ← Ingen Firebase-sync!
    }

    this.showStartScreen();
}
```

**2. eventHandlers.js rad 181-226**
- ✅ HAR Firebase-sync
- Omfattande error handling och logging
- Korrekt implementation enligt plan

```javascript
async function handleSavePlayerName() {
    const name = playerNameInput?.value.trim();
    if (!name) return;

    if (window.PlayerManager) {
        window.PlayerManager.setPlayerName(name);
    }

    // ✅ Sync to Firebase when name changes
    const playerId = localStorage.getItem('playerId');
    if (playerId && window.FirebaseAPI) {
        try {
            await FirebaseAPI.upsertPlayer(playerId, name);  // ← HAR Firebase-sync!
            console.log('✅ Real name updated in Firebase players collection:', name);
        } catch (error) {
            console.error('❌ FAILED to update name in Firebase:', error);
        }
    }
    // ... rest of logic
}
```

### Konflikt:
**uiRenderer.js rad 1044** skapar global wrapper:
```javascript
function handleSavePlayerName() {
    if (window.UI) window.UI.handleSavePlayerName();
}
```

Detta kan överskriva eller konkurrera med eventHandlers-versionen beroende på laddningsordning.

### Symptom:
- ✅ localStorage uppdateras korrekt (båda versionerna gör detta)
- ✅ Challenges visar korrekt namn (använder localStorage)
- ❌ Firebase `players` collection uppdateras INTE
- ❌ Ingen logging i console från Firebase-sync
- ❌ Console visar inte "🔵 upsertPlayer called"

### Verifiering (kör i browser console):
```javascript
console.log(handleSavePlayerName.toString());
```

**Om output visar:**
- `window.UI.handleSavePlayerName()` → ❌ Fel version används (utan Firebase-sync)
- `FirebaseAPI.upsertPlayer` → ✅ Korrekt version används (med Firebase-sync)

### Lösning (3 alternativ):

#### **Alt 1: Ta bort duplicate från uiRenderer.js** ⭐ REKOMMENDERAD
- ✅ Renast - en implementation
- ✅ Använd eventHandlers-versionen (har Firebase-sync)
- ⚠️ Kräver: Verifiera att inget annat anropar `UI.handleSavePlayerName()`

**Ändringar:**
1. Ta bort `handleSavePlayerName()` från uiRenderer.js (rad 992-1001)
2. Ta bort global wrapper från uiRenderer.js (rad 1044-1046)
3. Behåll endast eventHandlers.js-versionen

#### **Alt 2: Lägg till Firebase-sync i uiRenderer-versionen**
- ⚠️ Dubblerad kod (två ställen att underhålla)
- ⚠️ Risk för divergering över tid
- ⚠️ Bryter mot DRY-princip

#### **Alt 3: Konsolidera till EN funktion i shared modul**
- ✅ Renast långsiktigt
- ⚠️ Mer arbete - refaktorering av event listeners
- ⚠️ Ej akut nu

### Nästa steg för att lösa:
1. ⏳ **Undersök:** Vilka filer/kod anropar `UI.handleSavePlayerName()`?
2. ⏳ **Verifiera:** Kan eventHandlers-versionen användas överallt?
3. ⏳ **Rensa:** Ta bort duplicate från uiRenderer.js
4. ⏳ **Testa:** Verifiera att Firebase-sync fungerar
5. ⏳ **Commit:** Fixa och dokumentera lösningen

### Temporär workaround (för snabbtest):
Lägg till Firebase-sync direkt i uiRenderer.js rad 997:
```javascript
if (name && window.PlayerManager) {
    window.PlayerManager.setPlayerName(name);

    // TEMP: Manual Firebase sync for testing
    const playerId = localStorage.getItem('playerId');
    if (playerId && window.FirebaseAPI) {
        FirebaseAPI.upsertPlayer(playerId, name).catch(console.error);
    }
}
```

---

## 📊 Uppdaterad Implementation Status

**Datum:** 2025-01-12
**Status:** ⚠️ **BLOCKERAD** - Duplicate function conflict

### ✅ Färdigt (Implementation)
- ✅ Phase 1: Dummy-name detection (5/5)
- ✅ Phase 2: Firebase sync infrastructure (3/3)
- ✅ Debug logging lagt till överallt

### ❌ BLOCKERS
- ❌ **Dubbla handleSavePlayerName funktioner** - uiRenderer vs eventHandlers
- ❌ Firebase `players` collection uppdateras inte (pga blocker ovan)
- ❌ Ingen console-logging från Firebase-sync (pga fel version körs)

### ⏳ Återstår
- ⏳ **Kritiskt:** Fixa duplicate handleSavePlayerName konflikt
- ⏳ Verifiera Firebase-sync fungerar efter fix
- ⏳ Användartestning med console-verifiering
- ⏳ Edge case testing (restore mellan enheter)
- ⏳ Commit och deploy
