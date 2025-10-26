# Plan: Ta bort/ersätt `alert()` popups

**Branch**: `feature/remove-alert-popups`
**Datum**: 2025-01-25
**Mål**: Förbättra UX genom att ta bort störande alert-popups och ersätta med moderna UI-lösningar

---

## Fokus: Endast alert() som påverkar normal användarupplevelse

Vi ignorerar:
- ✅ Befintliga snygga modaler (challenge-blocked, auth-modal, etc.)
- ✅ Kritiska databasfel som användaren inte kan göra något åt
- ✅ Viktiga bekräftelser (logout, provider conflicts)

---

## 🟢 **Ta bort helt** (4 alerts)

### 1. "Konto skapat!" (`authUI.js:48`)
```javascript
alert('✅ Konto skapat! Nu kan du dela din utmaning.');
```
**Varför**: Sidan reloadar direkt efter → användaren ser automatiskt att de är inloggade.

### 2. "Inloggad! Välkommen tillbaka" (`authUI.js:50`)
```javascript
alert('✅ Inloggad! Välkommen tillbaka.');
```
**Varför**: Page reload visar tydligt att inloggning lyckades.

### 3. "Utloggad!" (`authUI.js:233`)
```javascript
alert('✅ Utloggad! Du kommer automatiskt bli inloggad anonymt igen.');
```
**Varför**: Sidan reloadar → användaren ser att de loggats ut.

### 4. Feedback submitted (`feedbackForm.js:95`)
```javascript
alert('✅ Tack för din feedback! Vi läser alla meddelanden.');
```
**Ersätt med**: Toast-notifikation (liten popup nere till höger, försvinner efter 3 sek)

---

## 🟡 **Ta bort fallback-alerts** (3 alerts)

### 5-6. Challenge blockerad fallbacks (`app.js:444, 446`)
```javascript
alert('Du kan inte spela din egen utmaning!');
alert('Denna utmaning är redan slutförd!');
```
**Varför**: Snygg `#challenge-blocked` dialog finns redan. Fallbacks kommer aldrig köras.

### 7. Generic challenge error (`app.js:489-491`)
```javascript
alert(message);
```
**Varför**: Onödig fallback som aldrig ska köras.

---

## 🟠 **Ersätt med inline error-text** (7 alerts)

### 8-14. Auth-fel (`authUI.js:87, 98, 100, 102, 104, 106, 108`)
```javascript
alert('Använd en annan email-adress eller logga in med rätt metod.');
alert('⚠️ Den emailen används redan. Försök logga in istället...');
alert('❌ Fel lösenord. Försök igen.');
alert('❌ Inget konto hittat med den emailen...');
alert('❌ Lösenordet är för svagt. Använd minst 6 tecken.');
alert('❌ Ogiltig email-adress.');
alert('❌ Inloggning misslyckades: ' + error.message);
```
**Lösning**: Lägg till `<div id="auth-error">` INUTI auth-modal som visas/döljs med felmeddelande.

---

## 🔵 **Ersätt prompt med inline input** (1 prompt)

### 15. "Vad heter du?" (`authUI.js:32`)
```javascript
const name = prompt('Vad heter du?');
```
**Lösning**: Visa extra steg i auth-modal där användaren anger namn efter lyckad inloggning (innan page reload).

---

## 🔴 **BEHÅLL** (ignorera dessa)

**Kritiska databasfel** - användaren kan inte fortsätta:
- `game.js:849, 856` - Kunde inte ladda frågepaket
- `challengeSystem.js:853, 859, 864` - Kunde inte ladda frågor
- `app.js:91` - Firebase Auth init-fel
- `authUI.js:172` - Firebase UI kunde inte laddas
- `challengeSystem.js:802` - Auth dialog fallback
- `authUI.js:92` - Provider check error

**Viktiga bekräftelser**:
- `authUI.js:221` - Logout confirmation (rensar localStorage!)
- `authUI.js:73-76` - Provider conflict confirmation

---

## Implementation Steps

1. ✅ Skapa branch `feature/remove-alert-popups`
2. ⬜ **Skapa toast-system** för notifikationer
3. ⬜ **Ta bort 4 bekräftelse-alerts** (authUI.js rad 48, 50, 233 + feedbackForm.js rad 95)
4. ⬜ **Ta bort 3 fallback-alerts** (app.js rad 444, 446, 489-491)
5. ⬜ **Lägg till error-div i auth-modal** (index.html)
6. ⬜ **Uppdatera authUI.js** för inline errors
7. ⬜ **Ersätt namn-prompt** med inline input i auth-modal
8. ⬜ **Testa alla scenarier** (se TESTING.md)
9. ⬜ Merge till staging → Test på mobil
10. ⬜ Merge till main

**Total reduktion**: 15 av 23 alerts tas bort/förbättras!

---

## Teknisk Design

### Toast System
Skapa enkel toast-komponent:
- Position: `fixed bottom-4 right-4`
- Auto-dölj efter 3 sekunder
- Enkel fade-in/fade-out animation
- Kan återanvändas för framtida notifikationer

### Auth Error Display
Lägg till i `#auth-modal`:
```html
<div id="auth-error" class="hidden bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
    <p class="text-red-800 text-sm" id="auth-error-message"></p>
</div>
```

### Name Input Flow
Efter lyckad inloggning (för nya användare):
1. Visa `#firebaseui-container` (dölj FirebaseUI)
2. Visa name-input form
3. Submit → spara namn → reload

---

## Test Plan
Se `docs/REMOVE_ALERT_POPUPS_TESTING.md` för komplett testplan.
