# Specifikation: Fixera game-container position

## Översikt
Fixa så att den ljusa fokusboxen (`#game-container`) ligger stilla i toppen av skärmen och inte rör sig vertikalt när innehållet ändras mellan olika skärmar/vyer.

## Problem som ska lösas
När användaren navigerar mellan olika skärmar (start → spel → resultat) ändras innehållshöjden i `#game-container`. Med nuvarande `flex items-center` på body blir boxen vertikalt centrerad, vilket gör att den "hoppar" upp eller ner beroende på innehållshöjd.

## Utgångspunkt
Börja från commit: `31a44cd` (innan menysynlighetsexperiment)
```bash
git checkout 31a44cd
git checkout -b fix/stable-container-position
```

## Ändring som ska göras

### Fil: `index.html`

**Hitta rad med body-taggen** (cirka rad 114):
```html
<body class="bg-slate-100 text-slate-800 flex items-center justify-center min-h-screen p-2 sm:p-4">
```

**Ändra till:**
```html
<body class="bg-slate-100 text-slate-800 flex items-start justify-center min-h-screen px-2 sm:px-4 pb-2 sm:pb-4">
```

### Förklaring av ändringar

| Före | Efter | Effekt |
|------|-------|--------|
| `items-center` | `items-start` | Boxen positioneras från toppen istället för centrerad vertikalt |
| `p-2 sm:p-4` | `px-2 sm:px-4 pb-2 sm:pb-4` | Tar bort top-padding, behåller sido- och botten-padding |

**Padding-förändring:**
- **Topp:** 8px/16px → **0px** (borttaget helt)
- **Sidor:** 8px/16px → 8px/16px (behålls)
- **Botten:** 8px/16px → 8px/16px (behålls)

## Resultat

### Före
- ✅ Boxen centrerad vertikalt på alla skärmhöjder
- ❌ Boxen "hoppar" upp/ner när innehåll ändras
- ❌ Position varierar beroende på innehållshöjd

### Efter
- ✅ Boxen ligger stilla vid toppen
- ✅ Ingen vertikal rörelse när innehåll ändras
- ✅ Konsekvent, förutsägbar position
- ✅ Maximal synlighet av innehåll (ligger högst upp)
- ✅ Fortfarande luft på sidorna och botten

## Teknisk bakgrund

### Varför fungerar flex items-center dåligt här?

Flexbox med `items-center` beräknar vertikal centrering baserat på flexbox-barnets höjd:

```
Vertical center = (Container height - Child height) / 2
```

När `#game-container` växer/krymper → centrum förskjuts → boxen flyttas

### Varför items-start löser problemet?

Med `items-start` positioneras barnet alltid från toppen:

```
Top position = 0px (konstant, oavsett höjd)
```

Boxens position beror inte längre på dess höjd → ingen rörelse

## Testplan

Efter ändringen, verifiera:

1. **Startsida:** Boxen ligger vid toppen
2. **Spela spel:** Boxen ligger kvar på samma position (rör sig inte)
3. **Resultatskärm:** Boxen ligger kvar på samma position
4. **Challenge-flöden:** Boxen ligger kvar på samma position
5. **Mobil (< 640px):** Boxen ligger vid toppen utan gap
6. **Desktop (> 640px):** Boxen ligger vid toppen utan gap

### Visuell kontroll
- Öppna DevTools → Element → Markera `<body>`
- Navigera mellan skärmar i spelet
- Kontrollera att `#game-container` har samma `offsetTop` värde genomgående

## Implementation

```bash
# 1. Checkout rätt commit
git checkout 31a44cd

# 2. Skapa ny branch
git checkout -b fix/stable-container-position

# 3. Gör ändringen i index.html (se ovan)

# 4. Testa lokalt
python3 -m http.server 8000
# Öppna http://localhost:8000 och testa alla skärmar

# 5. Commit
git add index.html
git commit -m "fix: Fixera game-container position för att förhindra vertikal rörelse

Ändrar body från vertikal centrering till fast top-position.
Detta förhindrar att fokusboxen 'hoppar' upp och ner när
innehållshöjden ändras mellan olika skärmar.

Före: flex items-center → Boxen centreras vertikalt dynamiskt
Efter: flex items-start → Boxen ligger stilla från toppen

Padding-top tas bort helt (0px) för maximal innehållssynlighet.
Sido- och botten-padding behålls för komfort.

Technical details:
- items-center → items-start
- p-2 sm:p-4 → px-2 sm:px-4 pb-2 sm:pb-4
- Top padding: 8px/16px → 0px
- Result: Static vertical position"

# 6. Merge till main när testad
git checkout main
git merge fix/stable-container-position
```

## Relaterad dokumentation

Se `GAME_SPECIFICATION.md` för mer om UI-layout och responsiv design.

## Anteckningar

- Denna ändring påverkar **INTE** hamburgermenyn (den ligger fixed i hörnet)
- Denna ändring påverkar **INTE** modaler (de ligger fixed med egen centrering)
- Denna ändring påverkar **ENDAST** positionen av `#game-container`
- CSS för `#game-container` behöver **INTE** ändras
- Ingen JavaScript-ändring behövs

## Alternativa lösningar (ej rekommenderade)

### Alternativ 1: CSS transitions
```css
#game-container {
    transition: transform 0.3s ease;
}
```
**Problem:** Gör rörelsen mjukare men tar inte bort den

### Alternativ 2: Fixed height
```css
#game-container {
    height: 100vh;
    overflow-y: auto;
}
```
**Problem:** Funkar dåligt på mobil, forcerar scroll

### Alternativ 3: Position absolute
```css
#game-container {
    position: absolute;
    top: 0;
}
```
**Problem:** Bryter flex-layout, svårt att centrera horisontellt

## Slutsats

Den rekommenderade lösningen (`items-start` + ta bort top-padding) är:
- ✅ Enklast att implementera (en rad ändring)
- ✅ Minst invasiv (påverkar bara body-taggen)
- ✅ Ingen risk för bieffekter
- ✅ Fungerar på alla skärmstorlekar
- ✅ Ingen CSS- eller JS-ändring behövs
