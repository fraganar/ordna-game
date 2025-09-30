# Kartläggning av localStorage och Firebase användning

## Nuvarande implementation

### localStorage skrivningar

#### 1. Spelarinformation
**Moduler:** `app.js`, `playerManager.js`
- `playerId` - Unik identifierare för spelaren (genereras vid första besök)
- `playerName` - Spelarens namn

#### 2. Challenge-data
**Moduler:** `challengeSystem.js`, `game.js`
- `myChallenges` - Array med spelarens utmaningar (som utmanare)
- `challenge_${id}` - Individuella utmaningar med fullständig data
- `expandedChallenges` - UI-state för expanderade utmaningar i listan
- `pendingChallenge` - Temporär lagring för utmaning som ska accepteras
- `lastNotificationCheck` - Tidsstämpel för senaste notifieringskontroll

### Firebase skrivningar

**Modul:** `firebase-config.js`

#### Challenge-operationer i Firestore
- `createChallenge()` - Skapar ny utmaning i 'challenges' collection
- `completeChallenge()` - Uppdaterar utmaning när motståndare spelat klart
- `getChallenge()` - Hämtar utmaningsdata från Firebase
- `getNewCompletedChallenges()` - Kollar nya resultat för notifieringar
- `getMyChallenges()` - Hämtar alla utmaningar för en spelare

## Problem med nuvarande implementation

1. **Data fragmentering**: Viss data finns bara i localStorage, annan bara i Firebase
2. **Ingen persistens**: Om användaren rensar webbläsardata försvinner localStorage
3. **Ingen synkronisering**: localStorage och Firebase är inte synkade
4. **Ingen konflikthantering**: Om data finns i båda, vilken är korrekt?

## Plan för synkronisering

### Fas 1: Skapa synkroniseringslager
**Mål:** Centraliserad datahantering

- Skapa ny modul `js/dataSync.js` som hanterar både localStorage och Firebase
- Implementera wrapper-funktioner som skriver till båda samtidigt
- Lägg till fallback till localStorage om Firebase misslyckas
- Loggning av alla synkroniseringsoperationer

**Funktioner att implementera:**
```javascript
// Exempel på API
DataSync.savePlayerInfo(playerId, playerName)
DataSync.saveChallenge(challengeId, data)
DataSync.getPlayerInfo()
DataSync.getChallenge(challengeId)
DataSync.syncWithFirebase()
```

### Fas 2: Migrera spelarinformation
**Mål:** Persistent spelaridentitet

- Skapa Firebase collection 'users' för spelardata
- Synka `playerId` och `playerName` till Firebase
- Behåll localStorage för snabb laddning vid app-start
- Implementera enkel Firebase Auth för persistent inloggning (anonymous auth)

**Datastruktur i Firebase:**
```javascript
users/{playerId}: {
  playerId: string,
  playerName: string,
  createdAt: timestamp,
  lastSeen: timestamp,
  stats: {
    gamesPlayed: number,
    totalScore: number,
    challengesCreated: number,
    challengesCompleted: number
  }
}
```

### Fas 3: Migrera challenge-data
**Mål:** Fullständig synkronisering av utmaningsdata

- Synka `myChallenges` lista till Firebase user document
- Synka individuella `challenge_${id}` entries
- UI-state (`expandedChallenges`) behålls endast lokalt (inte kritisk data)
- Lägg till metadata för synkroniseringsstatus

**Uppdaterad datastruktur:**
```javascript
challenges/{challengeId}: {
  // Befintlig data...
  localSyncedAt: timestamp,
  lastModified: timestamp
}
```

### Fas 4: Implementera synkroniseringslogik
**Mål:** Automatisk och transparent synkronisering

#### Vid app-start:
1. Ladda från localStorage först (snabb rendering)
2. Parallellt hämta från Firebase
3. Jämför timestamps och uppdatera om Firebase har nyare data
4. Visa synk-indikator i UI

#### Vid skrivning:
1. Skriv till localStorage omedelbart
2. Queue Firebase-skrivning
3. Vid Firebase-fel, markera för retry
4. Notifiera UI om synk-status

#### Konflikthantering:
- Firebase är "source of truth"
- Vid konflikt, använd senaste `lastModified` timestamp
- Logga alla konflikter för debugging

### Fas 5: Lägg till offline-stöd
**Mål:** Fungera även utan internetanslutning

- Implementera operation queue för Firebase-anrop
- Detektera online/offline status
- Synka automatiskt när anslutning återkommer
- Visa offline-indikator i UI
- Använd Firebase offline persistence

**Offline queue struktur:**
```javascript
offlineQueue: {
  operations: [{
    type: 'create' | 'update' | 'delete',
    collection: string,
    documentId: string,
    data: object,
    timestamp: timestamp,
    retryCount: number
  }]
}
```

### Fas 6: Testing och migrering
**Mål:** Säker övergång till nytt system

1. Implementera migrations-script för befintlig data
2. Testa med subset av användare
3. Monitorera synk-fel och prestanda
4. Gradvis utrullning
5. Backup-strategi för rollback

## Tekniska överväganden

### Prestanda
- Använd batch-operationer för Firebase
- Implementera debouncing för frekventa uppdateringar
- Lazy-load Firebase SDK
- Cache Firebase-resultat i minne

### Säkerhet
- Implementera Firebase Security Rules
- Validera all data innan synkronisering
- Kryptera känslig data i localStorage
- Rate-limiting för Firebase-anrop

### Monitorering
- Logga synk-fel till Firebase Analytics
- Track synk-latency
- Monitorera localStorage-storlek
- Alert vid synk-fel över tröskelvärde

## Implementation Timeline

- **Vecka 1-2**: Fas 1 - Synkroniseringslager
- **Vecka 3**: Fas 2 - Spelarinformation
- **Vecka 4-5**: Fas 3 - Challenge-data
- **Vecka 6**: Fas 4 - Synkroniseringslogik
- **Vecka 7**: Fas 5 - Offline-stöd
- **Vecka 8**: Fas 6 - Testing och migrering

## Förväntade fördelar

1. **Persistens**: Data bevaras även om localStorage rensas
2. **Cross-device**: Samma konto på flera enheter
3. **Backup**: Automatisk backup i molnet
4. **Analytics**: Bättre insikt i användardata
5. **Skalbarhet**: Redo för framtida features