# Tropical Energy Color Palette - TODO & Implementation Status

**Branch**: `feature/tropical-energy-colors`
**Created**: 2025-01-24
**Status**: Partial Implementation - Needs fixes before merge

---

## 📋 Översikt

En uppdatering från "Mango Sunshine" till "Tropical Energy" - en mer balanserad och levande färgpalett med bättre kontrast och tropisk känsla.

---

## ✅ GENOMFÖRT (Committed)

### CSS Variables (`css/styles.css`)
- [x] Nya huvudfärger
  - `--color-primary`: #FF8C00 (Mango Gold - varmare)
  - `--color-primary-light`: #FFB84D (Soft Mango - ny)
  - `--color-success`: #00D084 (Tropical Green - varmare än teal)
  - `--color-danger`: #FF5722 (Hot Coral - mer dramatisk)

- [x] Nya accent-färger
  - `--color-tropical-blue`: #00B4D8 (Tropical Ocean - kompletterande färg)
  - `--color-tropical-blue-dark`: #0096C7 (Deep Ocean)
  - `--color-sunset-pink`: #FF6B9D (Tropical Sunset)
  - `--color-lime`: #C6FF00 (Energetic Lime)
  - `--color-coconut`: #F5F5DC (Soft Coconut Cream)
  - `--color-success-glow`: #7FFF00 (Lime Glow för animationer)

- [x] Glow-effekter
  - `--color-glow-warm`: rgba(255, 140, 0, 0.4)
  - `--color-glow-cool`: rgba(0, 180, 216, 0.3)
  - `--color-glow-success`: rgba(0, 208, 132, 0.5)

### Bakgrund
- [x] 3-färgs body gradient: mint → cream → soft pink
- [x] 4 radiella gradienter med nya färger (tropical-blue, sunset-pink, mango-light, coconut)
- [x] Ökad opacity från 0.08 till 0.12

### Decision Buttons
- [x] Stanna-knapp: Tropical blue gradient (säker känsla)
- [x] Nästa fråga: 3-färgs gradient (primary → sunset-pink → primary)
- [x] Has-points state: Tropical blue glow
- [x] Completed state: Success green
- [x] Large next question button: 3-färgs gradient

### Animationer
- [x] Flying points: Success glow
- [x] Point float banked: Tropical blue
- [x] Subtle glow: Tropical blue
- [x] Correct/incorrect: Nya success/danger färger

---

## ❌ KRITISKA FIXES (Prioritet 1 - MÅSTE göras före merge)

### 1. Tailwind Config - SAKNAR NYA FÄRGER
**Fil**: `index.html` rad 41-63
**Problem**: HTML kan inte använda nya färger i Tailwind-klasser

**Fix**:
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Befintliga...
        'primary-light': 'var(--color-primary-light)',        // LÄGG TILL
        'success-glow': 'var(--color-success-glow)',          // LÄGG TILL
        'tropical-blue': 'var(--color-tropical-blue)',        // LÄGG TILL
        'tropical-blue-dark': 'var(--color-tropical-blue-dark)', // LÄGG TILL
        'sunset-pink': 'var(--color-sunset-pink)',            // LÄGG TILL
        'lime': 'var(--color-lime)',                          // LÄGG TILL
        'coconut': 'var(--color-coconut)'                     // LÄGG TILL
      }
    }
  }
}
```

### 2. Ersätt gamla PURPLE färger (124, 58, 237)
**Filer**: `css/styles.css`

**Platser att fixa**:
- [ ] Rad 89: `#game-container box-shadow` → Använd mango eller tropical-blue
- [ ] Rad 94: `.option-btn:hover box-shadow` → Använd primary eller tropical-blue
- [ ] Rad 120: `.order-selected box-shadow` → Använd primary
- [ ] Rad 525: `.decision-buttons button.selected box-shadow` → Använd primary

**Sök med**: `grep -n "124, 58, 237" css/styles.css`

### 3. "Hör till"-knappar använder gamla TEAL (20, 184, 166)
**Fil**: `css/styles.css` rad 553-556

**Nuvarande**:
```css
.decision-buttons button.correct-selection {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.3) 100%);
    border-color: var(--color-success);
    box-shadow: 0 0 15px rgba(20, 184, 166, 0.4);
}
```

**Ändra till**:
```css
.decision-buttons button.correct-selection {
    background: linear-gradient(135deg, rgba(0, 208, 132, 0.2) 0%, rgba(0, 208, 132, 0.3) 100%);
    border-color: var(--color-success);
    box-shadow: 0 0 15px var(--color-glow-success);
}
```

---

## ⚠️ REKOMMENDERADE FÖRBÄTTRINGAR (Prioritet 2)

### 1. Skapa variables för återstående hårdkodade rgba
**Lägg till i `:root`**:
```css
--color-glow-cool-strong: rgba(0, 180, 216, 0.5);
--color-glow-cool-border: rgba(0, 180, 216, 0.4);
--color-glow-sunset: rgba(255, 107, 157, 0.3);
```

**Ersätt**:
- Rad 169: `rgba(0, 180, 216, 0.4)` → `var(--color-glow-cool-border)`
- Rad 358: `rgba(0, 180, 216, 0.5)` → `var(--color-glow-cool-strong)`
- Rad 193, 453: `rgba(255, 107, 157, 0.3)` → `var(--color-glow-sunset)`

### 2. Uppdatera PWA-färger
**Filer som behöver manuell uppdatering**:

**manifest.json**:
```json
{
  "theme_color": "#E0F7FA",
  "background_color": "#FFE0B2"
}
```

**index.html** (meta tag):
```html
<meta name="theme-color" content="#E0F7FA">
```

### 3. Testa på olika enheter
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet
- [ ] Ljus miljö (utomhus)
- [ ] Mörk miljö (kväll)

---

## 💡 FRAMTIDA FÖRBÄTTRINGAR (Prioritet 3)

### 1. Dark Mode Prep
Förbereda för framtida dark mode genom att strukturera färgvariablerna:
```css
/* Light mode (default) */
:root {
  --bg-primary: var(--color-soft-cloud);
  --text-primary: var(--color-deep-space);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--color-deep-space);
    --text-primary: var(--color-soft-cloud);
  }
}
```

### 2. Dokumentera i STYLING_MAP.md
- [ ] Uppdatera färgschema-sektion med Tropical Energy
- [ ] Dokumentera design-filosofin bakom färgvalen
- [ ] Skapa före/efter jämförelse

### 3. Accessibility Check
- [ ] Kontrollera kontrast-ratios (WCAG AA standard)
- [ ] Testa med colorblindness simulators
- [ ] Verifiera att alla färger är tydligt åtskiljbara

---

## 📊 CHECKLISTA FÖR MERGE

Innan denna branch mergas till `main`:

- [ ] **Kritiska fixes genomförda** (Prioritet 1)
  - [ ] Tailwind config uppdaterad
  - [ ] Alla purple färger ersatta
  - [ ] "Hör till"-knappar uppdaterade

- [ ] **Testning slutförd**
  - [ ] Single player mode (12 frågor)
  - [ ] Multiplayer mode (2-4 spelare)
  - [ ] Challenge mode
  - [ ] Mobile responsiveness
  - [ ] Alla animationer fungerar

- [ ] **Code review genomförd**
  - [ ] Inga console errors
  - [ ] Inga visuella buggar
  - [ ] Prestanda påverkas ej negativt

- [ ] **Dokumentation uppdaterad**
  - [ ] STYLING_MAP.md (om tillämpligt)
  - [ ] CLAUDE.md (om färgfilosofin ändrats)

---

## 🎨 DESIGN-FILOSOFI

**Tropical Energy vs Mango Sunshine**:

| Aspekt | Mango Sunshine (Före) | Tropical Energy (Efter) |
|--------|----------------------|------------------------|
| Känsla | Varmt, ensidigt orange | Tropiskt, balanserat, energiskt |
| Kontrast | Lägre | Högre |
| Komplexitet | 2-färgs gradients | 3-färgs gradients |
| Kompletterande färger | Ingen | Tropical blue (cyan) |
| Accenter | Begränsade | Rika (pink, lime, coconut) |
| Visuell feedback | Bra | Excellent (starkare färger) |

**Nyckelförbättringar**:
1. **Stanna-knapp blå**: Psykologiskt mer "säker" än orange
2. **3-färgs gradients**: Mer energi och rörelse
3. **Tropical blue**: Balanserar det varma mangostemat
4. **Hetare coral**: Tydligare fel-feedback
5. **Tropisk himmel**: Bakgrund känns mindre klinisk

---

## 🔗 RELATERADE FILER

- `css/styles.css` - Huvudfil för alla ändringar
- `index.html` - Tailwind config behöver uppdatering
- `manifest.json` - PWA-färger (framtida uppdatering)
- `STYLING_MAP.md` - Dokumentation att uppdatera

---

**Skapad av**: Claude Code
**Datum**: 2025-01-24
**Status**: Väntar på Prioritet 1 fixes
