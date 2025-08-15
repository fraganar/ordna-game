# Ordna Game - Omfattande Testfall

## Bakgrund
Detta dokument innehåller alla testfall för att säkerställa att spelmekaniken fungerar korrekt i alla scenarier. Testfallen utvecklades under refaktoreringen för att säkerställa robust hantering av spelflöden, auto-säkring och facit-visning.

---

## 🎯 Kärnkoncept som testas

### Spelartillstånd (per runda):
- **Aktiv**: Kan göra drag (`completedRound: false`)
- **Stannat**: Säkrat poäng frivilligt (`completionReason: 'stopped'`)
- **Eliminerad**: Svarat fel (`completionReason: 'wrong'`)
- **Färdig**: Alla alternativ besvarade (`completionReason: 'finished'`)

### Frågetillstånd:
- **Pågående**: Minst en spelare aktiv
- **Fysiskt komplett**: Alla alternativ besvarade
- **Logiskt komplett**: Inga aktiva spelare kvar

---

## 🧪 KRITISKA TESTFALL

### **SINGLE-PLAYER TESTFALL**

#### SP-1: Spelare stannar med poäng
**Setup**: Single-player, 3 poäng i potten
**Action**: Klicka "Stanna"
**Förväntat resultat**:
- ✅ Poäng säkras (3p → totalpoäng)
- ✅ Säkringsanimation visas
- ✅ Facit visas efter 2 sekunder
- ✅ Nästa-knapp aktiveras efter 2 sekunder
- ✅ Förklaring visas (om finns)

#### SP-2: Spelare svarar fel
**Setup**: Single-player, 2 poäng i potten
**Action**: Klicka fel alternativ
**Förväntat resultat**:
- ✅ Poäng försvinner (animation av fallande poäng)
- ✅ Facit visas direkt
- ✅ Nästa-knapp aktiveras direkt
- ✅ Stanna-knapp inaktiveras

#### SP-3: Alla alternativ rätt (auto-säkring)
**Setup**: Single-player, svarar rätt på alla alternativ
**Action**: Klicka sista alternativet rätt
**Förväntat resultat**:
- ✅ Auto-säkring av alla poäng
- ✅ Säkringsanimation för alla poäng
- ✅ Facit visas efter 2 sekunder
- ✅ Nästa-knapp aktiveras efter 2 sekunder

#### SP-4: Sista alternativet fel
**Setup**: Single-player, svarat rätt på alla utom sista
**Action**: Klicka sista alternativet fel
**Förväntat resultat**:
- ✅ Alla poäng försvinner
- ✅ Facit visas direkt
- ✅ Nästa-knapp aktiveras direkt

---

### **MULTIPLAYER TESTFALL (2 spelare)**

#### MP-1: Spelare 1 stannar, Spelare 2 fortsätter
**Setup**: S1: 2p, S2: 1p (båda aktiva)
**Action**: S1 klickar "Stanna"
**Förväntat resultat**:
- ✅ S1 säkrar 2p, markeras som "stannat"
- ✅ Tur växlar till S2 efter animation
- ✅ S2 kan fortsätta spela
- ✅ Stanna-knapp uppdateras för S2

#### MP-2: Båda spelare stannar
**Setup**: S1 stannar först, sedan S2
**Action**: S2 klickar "Stanna" (sista aktiva spelaren)
**Förväntat resultat**:
- ✅ S2 säkrar sina poäng
- ✅ Facit visas (alla spelare klara)
- ✅ Nästa-knapp aktiveras
- ✅ Förklaring visas

#### MP-3: Alla alternativ rätt (båda aktiva) - KRITISKT
**Setup**: S1: 3p, S2: 2p (båda aktiva)
**Action**: S2 svarar rätt på sista alternativet
**Förväntat resultat**:
- ✅ BÅDA spelarna auto-säkras (S1: +3p, S2: +2p)
- ✅ Säkringsanimation för båda
- ✅ Facit visas efter 2 sekunder
- ✅ Nästa-knapp aktiveras

#### MP-4: Alla alternativ rätt (S1 stannat, S2 aktiv)
**Setup**: S1 redan stannat, S2: 2p aktiv
**Action**: S2 svarar rätt på sista alternativet
**Förväntat resultat**:
- ✅ Endast S2 auto-säkras (+2p)
- ✅ S1 redan säkrad (ingen extra poäng)
- ✅ Facit visas
- ✅ Nästa-knapp aktiveras

#### MP-5: Sista alternativet fel (S1 aktiv, S2 svarar fel) - EDGE CASE
**Setup**: S1: 3p aktiv, S2: 2p aktiv på sista alternativet
**Action**: S2 svarar FEL på sista alternativet
**Förväntat resultat**:
- ✅ S2 elimineras, förlorar 2p
- ✅ S1 auto-säkras (fick +3p trots att S2 gjorde fel)
- ✅ Facit visas (frågan fysiskt klar)
- ✅ Nästa-knapp aktiveras

#### MP-6: Sista alternativet rätt (båda aktiva)
**Setup**: S1: 3p, S2: 1p (båda aktiva)
**Action**: S2 svarar RÄTT på sista alternativet
**Förväntat resultat**:
- ✅ Båda auto-säkras (S1: +3p, S2: +1p)
- ✅ Facit visas
- ✅ Nästa-knapp aktiveras

#### MP-7: Spelare 1 svarar fel, Spelare 2 fortsätter
**Setup**: S1: 2p, S2: 1p
**Action**: S1 svarar fel
**Förväntat resultat**:
- ✅ S1 elimineras, förlorar 2p
- ✅ Tur växlar till S2
- ✅ S2 kan fortsätta (inga knappar inaktiverade för S2)

#### MP-8: Båda spelare svarar fel
**Setup**: S1 svarar fel först, sedan S2
**Action**: S2 svarar fel (sista aktiva spelaren)
**Förväntat resultat**:
- ✅ S2 elimineras
- ✅ Facit visas (inga aktiva spelare kvar)
- ✅ Nästa-knapp aktiveras

---

### **MULTIPLAYER TESTFALL (3+ spelare)**

#### MP3-1: Sista alternativet med flera aktiva spelare
**Setup**: S1: stannat, S2: 2p aktiv, S3: 1p aktiv
**Action**: S3 svarar rätt på sista alternativet
**Förväntat resultat**:
- ✅ S2 och S3 auto-säkras
- ✅ S1 redan säkrad (ingen förändring)
- ✅ Facit visas
- ✅ Nästa-knapp aktiveras

#### MP3-2: Komplex elimineringsscenario
**Setup**: S1: 3p aktiv, S2: stannat, S3: 1p aktiv
**Action**: S3 svarar fel på sista alternativet
**Förväntat resultat**:
- ✅ S3 elimineras
- ✅ S1 auto-säkras (+3p)
- ✅ S2 redan säkrad
- ✅ Facit visas

---

## 🎮 ANVÄNDARGRÄNSSNITT TESTFALL

### UI-1: Challenger-hint döljs i vanligt spel
**Setup**: Starta vanligt spel (ej challenge-mode)
**Förväntat resultat**:
- ✅ Ingen challenger-hint visas ovanför frågan
- ✅ Hint-elementet har `hidden` klass

### UI-2: Notifications döljs vid app-start
**Setup**: Öppna appen från startsidan
**Förväntat resultat**:
- ✅ Inga notifications visas över första frågan
- ✅ Notifications-area är dold

### UI-3: Spelstatus-uppdatering
**Setup**: Multiplayer, växla mellan spelare
**Förväntat resultat**:
- ✅ Blå ram runt aktiv spelare
- ✅ Korrekt namn i "X spelar" display
- ✅ Rätt poäng i mini-scores

### UI-4: Knapptillstånd
**Setup**: Olika spelarsituationer
**Förväntat resultat**:
- ✅ Stanna-knapp aktiverad endast med poäng i potten
- ✅ Nästa-knapp aktiverad endast när frågan är klar
- ✅ Alternativ inaktiverade för icke-aktiva spelare

---

## 🏆 CHALLENGE-MODE TESTFALL

### CH-1: Challenge skapas korrekt
**Setup**: Skapa ny utmaning
**Förväntat resultat**:
- ✅ 12 slumpmässiga frågor väljs
- ✅ Challenge-ID genereras
- ✅ Firebase-data sparas korrekt

### CH-2: Challenge-hint visas korrekt
**Setup**: Spela emot befintlig challenge
**Förväntat resultat**:
- ✅ Motståndares poäng visas för varje fråga
- ✅ Hint döljs om ingen data finns

### CH-3: Poäng sparas per fråga
**Setup**: Spela challenge-mode
**Förväntat resultat**:
- ✅ Varje frågas poäng sparas separat
- ✅ Totalpoäng beräknas korrekt

---

## 🔄 SPELFLÖDE TESTFALL

### SF-1: Frågerotation (multiplayer)
**Setup**: 3 spelare, flera frågor
**Förväntat resultat**:
- ✅ Startspelare roterar varje fråga
- ✅ Turordning respekteras inom frågor

### SF-2: Spelslut
**Setup**: Sista frågan i spelet
**Förväntat resultat**:
- ✅ Slutskärm visas efter sista frågan
- ✅ Korrekt poängsammanfattning
- ✅ Vinnare utses (multiplayer)

### SF-3: Tillbaka till meny
**Setup**: Från slutskärm eller under spel
**Förväntat resultat**:
- ✅ Spelstatus nollställs
- ✅ Startsida visas korrekt
- ✅ Nya spel kan startas

---

## 🧩 FRÅGETYP-SPECIFIKA TESTFALL

### ORD-1: Ordna-frågor korrekt ordning
**Setup**: Ordna-fråga med 4 alternativ
**Action**: Klicka i rätt ordning (1,2,3,4)
**Förväntat resultat**:
- ✅ Varje korrekt klick ger +1 poäng
- ✅ Numrering (1,2,3,4) visas på knappar
- ✅ Knappar blir gröna och inaktiverade

### ORD-2: Ordna-frågor fel ordning
**Setup**: Ordna-fråga
**Action**: Klicka fel knapp
**Förväntat resultat**:
- ✅ Spelare elimineras
- ✅ Knapp blir röd
- ✅ I multiplayer: andra spelare kan försöka samma knapp

### HÖR-1: Hör-till-frågor alla rätt
**Setup**: Hör-till-fråga med 4 alternativ
**Action**: Bedöm alla korrekt (ja/nej)
**Förväntat resultat**:
- ✅ Varje rätt bedömning ger +1 poäng
- ✅ Gröna/röda markeringar på alternativ
- ✅ Auto-säkring när alla bedömda

### HÖR-2: Hör-till-frågor fel bedömning
**Setup**: Hör-till-fråga
**Action**: Bedöm ett alternativ fel
**Förväntat resultat**:
- ✅ Spelare elimineras
- ✅ Korrekt/fel markering visas

---

## 🎯 PRESTANDATESTFALL

### PERF-1: Stora frågemängder
**Setup**: Spel med många frågor
**Förväntat resultat**:
- ✅ Ingen märkbar fördröjning
- ✅ Minne används effektivt

### PERF-2: Snabba klick
**Setup**: Klicka mycket snabbt på alternativ
**Förväntat resultat**:
- ✅ Dubbelklick förhindras
- ✅ Poäng räknas korrekt
- ✅ Animationer störs inte

---

## 📱 RESPONSIVITET TESTFALL

### RESP-1: Mobil viewport
**Setup**: Testa på mobil (375px bred)
**Förväntat resultat**:
- ✅ Alla knappar klickbara
- ✅ Text läsbar
- ✅ Animationer fungerar

### RESP-2: Desktop viewport
**Setup**: Testa på desktop (1200px+)
**Förväntat resultat**:
- ✅ Layout centrerad
- ✅ Inte för bred text
- ✅ Knappar lämplig storlek

---

## 🚨 EDGE CASE TESTFALL

### EDGE-1: Nätverksavbrott under challenge
**Setup**: Challenge-mode, koppla från internet
**Förväntat resultat**:
- ✅ Spel fortsätter lokalt
- ✅ Felmeddelande vid sync-försök
- ✅ Data sparas lokalt

### EDGE-2: Samtidiga klick (multiplayer)
**Setup**: Två spelare klickar samtidigt
**Förväntat resultat**:
- ✅ Endast aktiv spelares klick registreras
- ✅ Ingen korruption av spelstatus

### EDGE-3: Sida laddas om under spel
**Setup**: Reload sida mitt under fråga
**Förväntat resultat**:
- ✅ Återgår till startsida
- ✅ Ingen korrupt data kvar

---

## 🔧 TESTINSTRUKTIONER

### Manuell testning:
1. **Förberedelse**: Starta lokal server (`python3 -m http.server 8000`)
2. **Systematisk genomgång**: Testa varje kategori metodiskt
3. **Dokumentation**: Notera avvikelser från förväntat resultat
4. **Återtest**: Verifiera fixar efter kod-ändringar

### Automatiserad testning (framtida):
- Enhetstest för spellogik-funktioner
- Integration-test för Firebase-operationer
- End-to-end test för kritiska användarflöden

---

## 📊 TESTRESULTAT

| Testfall | Status | Senast testad | Kommentarer |
|----------|---------|---------------|-------------|
| SP-1 till SP-4 | ✅ PASS | 2025-01-15 | Alla single-player fall fungerar |
| MP-1 till MP-8 | ✅ PASS | 2025-01-15 | Multiplayer auto-säkring fixad |
| MP3-1, MP3-2 | ✅ PASS | 2025-01-15 | 3+ spelare scenarios |
| UI-1, UI-2 | ✅ PASS | 2025-01-15 | Challenger-hint och notifications fix |
| UI-3, UI-4 | ⏳ TODO | - | Behöver verifieras |
| CH-1 till CH-3 | ⏳ TODO | - | Challenge-mode testning |

---

**Total täckning**: 14 kritiska testfall verifierade ✅  
**Nästa steg**: Automatisera de mest kritiska testfallen