# Testplan: Alert Popup Removal

**Branch**: `feature/remove-alert-popups`
**Testare**: Manual testing required
**Plattformar**: Desktop + Mobile

---

## Förberedelser

1. Starta lokal server: `python3 -m http.server 8000`
2. Öppna `http://localhost:8000` i webbläsare
3. Öppna DevTools Console (F12) för att se eventuella errors
4. Ha en annan enhet/webbläsare redo för challenge-testning

---

## Test 1: Toast-notifikation vid feedback

**Scenario**: Användare skickar feedback
**Förväntat**: Toast-notifikation dyker upp nere till höger, försvinner efter 3 sek

### Steg:
1. Öppna hamburger-menyn (≡)
2. Klicka "Rapportera problem"
3. Skriv ett testmeddelande
4. Klicka "Skicka"

### Validering:
- [ ] ✅ Toast-notifikation visas nere till höger med texten "Tack för din feedback!"
- [ ] ✅ Toast försvinner automatiskt efter ~3 sekunder
- [ ] ✅ Ingen `alert()` popup dyker upp
- [ ] ✅ Feedback-modal stängs korrekt
- [ ] ✅ Toast har snygg fade-in/fade-out animation

---

## Test 2: Inloggning (ny användare)

**Scenario**: Ny användare skapar konto
**Förväntat**: Ingen alert efter inloggning, prompt ersatt med inline input

### Steg:
1. Rensa localStorage: DevTools → Application → Clear all
2. Ladda om sidan (anonym användare skapas)
3. Klicka "Spela nu" → "Skapa konto"
4. Klicka "Sign in with email"
5. Ange ny email + lösenord (minst 6 tecken)
6. Klicka "Sign Up"

### Validering:
- [ ] ✅ Ingen `alert('Konto skapat!')` dyker upp
- [ ] ✅ Namn-input ruta visas INUTI auth-modal (inte prompt)
- [ ] ✅ Efter att ha angett namn: Sidan reloadar automatiskt
- [ ] ✅ Efter reload: Användaren är inloggad (ser sitt namn i UI)

---

## Test 3: Inloggning (befintlig användare)

**Scenario**: Befintlig användare loggar in
**Förväntat**: Ingen alert efter inloggning

### Steg:
1. Logga ut (hamburger-meny → Logga ut)
2. Bekräfta logout i confirm-dialog (denna ska finnas kvar!)
3. Klicka "Spela nu" → "Logga in"
4. Ange samma email + lösenord som tidigare
5. Klicka "Sign In"

### Validering:
- [ ] ✅ Ingen `alert('Inloggad! Välkommen tillbaka')` dyker upp
- [ ] ✅ Sidan reloadar automatiskt
- [ ] ✅ Efter reload: Användaren är inloggad

---

## Test 4: Utloggning

**Scenario**: Användare loggar ut
**Förväntat**: Confirm dialog (behålls), ingen alert efter utloggning

### Steg:
1. Öppna hamburger-menyn (≡)
2. Klicka "Logga ut"
3. Bekräfta i confirm-dialog (klicka OK)

### Validering:
- [ ] ✅ Confirm-dialog visas (denna ska finnas kvar!)
- [ ] ✅ Ingen `alert('Utloggad!')` efter bekräftelse
- [ ] ✅ Sidan reloadar automatiskt
- [ ] ✅ Efter reload: Användaren är anonym igen

---

## Test 5: Auth errors - Inline display

**Scenario**: Olika inloggningsfel
**Förväntat**: Fel visas INUTI auth-modal, ingen alert

### Test 5A: Fel lösenord
1. Klicka "Spela nu" → "Logga in"
2. Ange befintlig email + FELAKTIGT lösenord
3. Klicka "Sign In"

**Validering:**
- [ ] ✅ Inline error-box visas i auth-modal med texten "Fel lösenord"
- [ ] ✅ Ingen `alert()` popup
- [ ] ✅ Auth-modal stängs INTE (användaren kan försöka igen)
- [ ] ✅ Error-box har röd bakgrund (styling)

### Test 5B: Email används redan
1. Försök skapa nytt konto med email som redan finns
2. Klicka "Sign Up"

**Validering:**
- [ ] ✅ Inline error-box: "Den emailen används redan..."
- [ ] ✅ Ingen `alert()` popup

### Test 5C: Svagt lösenord
1. Försök skapa konto med lösenord < 6 tecken
2. Klicka "Sign Up"

**Validering:**
- [ ] ✅ Inline error-box: "Lösenordet är för svagt..."
- [ ] ✅ Ingen `alert()` popup

### Test 5D: Ogiltig email
1. Försök med ogiltig email (t.ex. "test" utan @)
2. Klicka "Sign In"

**Validering:**
- [ ] ✅ Inline error-box: "Ogiltig email-adress"
- [ ] ✅ Ingen `alert()` popup

### Test 5E: Inget konto hittat
1. Logga in med email som inte finns
2. Klicka "Sign In"

**Validering:**
- [ ] ✅ Inline error-box: "Inget konto hittat..."
- [ ] ✅ Ingen `alert()` popup

---

## Test 6: Challenge blockerad - Egen utmaning

**Scenario**: Användare försöker spela sin egen challenge
**Förväntat**: Snygg dialog, ingen alert-fallback

### Steg:
1. Logga in som användare A
2. Klicka "Spela nu"
3. Spela spelet och slutför
4. Klicka "Dela utmaning" → Kopiera länk
5. Öppna länken i SAMMA webbläsare (som användare A)

### Validering:
- [ ] ✅ `#challenge-blocked-own` dialog visas (snygg modal)
- [ ] ✅ Ingen `alert('Du kan inte spela din egen utmaning!')` popup
- [ ] ✅ Dialog har text: "Du kan inte spela din egen utmaning!"
- [ ] ✅ "Tillbaka till start" knapp fungerar

---

## Test 7: Challenge blockerad - Redan spelad

**Scenario**: Användare försöker spela challenge två gånger
**Förväntat**: Snygg dialog, ingen alert-fallback

### Steg:
1. Logga in som användare A, skapa challenge
2. Kopiera länk
3. Öppna länk i annan webbläsare som användare B
4. Spela och slutför challenge
5. Försök öppna samma länk igen som användare B

### Validering:
- [ ] ✅ `#challenge-blocked-completed` dialog visas
- [ ] ✅ Ingen `alert('Denna utmaning är redan slutförd!')` popup
- [ ] ✅ Dialog visar korrekt text
- [ ] ✅ "Se resultat" eller "Tillbaka till start" knapp fungerar

---

## Test 8: Kritiska fel (ska INTE ändras)

**Scenario**: Verifiera att kritiska alerts fortfarande fungerar
**Förväntat**: Alert dyker upp (dessa behålls)

### Test 8A: Logout confirmation
1. Klicka "Logga ut"

**Validering:**
- [ ] ✅ `confirm()` dialog visas fortfarande
- [ ] ✅ Text: "Är du säker på att du vill logga ut?"

### Test 8B: Provider conflict (svår att testa, skippa om nödvändigt)
*Detta scenario är sällsynt och svårt att framkalla manuellt*

---

## Regression Testing

Verifiera att inga befintliga funktioner påverkats:

### Grundläggande spelflöde:
- [ ] ✅ Single-player fungerar normalt
- [ ] ✅ Local multiplayer (2-4 spelare) fungerar
- [ ] ✅ Challenge-system: Skapa, dela, spela fungerar
- [ ] ✅ Feedback-formulär skickar data till Firebase
- [ ] ✅ Auth: Inloggning/utloggning fungerar
- [ ] ✅ Hamburger-meny: Alla funktioner fungerar

### UI/Animation:
- [ ] ✅ Inga konsol-errors i DevTools
- [ ] ✅ Modaler öppnas/stängs korrekt
- [ ] ✅ Animationer ser normala ut
- [ ] ✅ Toast-notifikation interfererar inte med spelet

---

## Mobile Testing

**VIKTIGT**: Testa på riktig mobil enhet!

### Steg:
1. Merge till staging branch
2. Push till GitHub
3. Öppna staging-URL på mobil: `staging--luminous-griffin-0807ba.netlify.app`
4. Upprepa Test 1-7 på mobil

### Extra mobile validering:
- [ ] ✅ Toast-notifikation syns korrekt på liten skärm
- [ ] ✅ Inline error-box i auth-modal är läsbar
- [ ] ✅ Name-input form fungerar på mobil keyboard
- [ ] ✅ Inga layout-problem

---

## Deployment Checklist

Efter alla tester:
- [ ] ✅ Alla tester passerade
- [ ] ✅ Inga konsol-errors
- [ ] ✅ Testat på desktop + mobil
- [ ] ✅ Code review (kör agent om nödvändigt)
- [ ] ✅ Merge till `staging`
- [ ] ✅ Test på staging-URL
- [ ] ✅ Merge till `main`
- [ ] ✅ Publish på Netlify

---

## Snabb Smoke Test (30 sekunder)

Om du har bråttom, kör denna:

1. ✅ Skicka feedback → Toast visas (ingen alert)
2. ✅ Logga in → Ingen alert efter inloggning
3. ✅ Logga ut → Confirm visas (ingen alert efter)
4. ✅ Försök fel lösenord → Inline error (ingen alert)
5. ✅ Spela egen challenge → Dialog (ingen alert)

---

## Resultat

**Datum testat**: ___________
**Testare**: ___________
**Status**: ⬜ Godkänd / ⬜ Behöver fixar

**Anteckningar**:
