# Ordna Game - Complete Styling Map

## 📋 Översikt
Detta dokument kartlägger all styling i Ordna-spelet. Styling sätts på tre primära sätt:
1. **CSS-filer** (css/styles.css)
2. **Tailwind CSS-klasser** (inline i HTML och via JavaScript)
3. **JavaScript dynamisk styling** (classList, style properties, animations)

---

## 🎨 Färgschema - "Playful Premium" Design (Uppdaterad 2025-08-27)

### NYA Primära färger (CSS Variables)
```css
/* Hero Colors - Huvudfärger */
--color-primary: #7C3AED;        /* Hero Purple */
--color-primary-dark: #6D28D9;   /* Hero Purple Dark */
--color-action: #FB923C;         /* Energy Orange */
--color-action-dark: #EA580C;    /* Energy Orange Dark */
--color-success: #14B8A6;        /* Success Teal */
--color-success-dark: #0D9488;   /* Success Teal Dark */
--color-danger: #F87171;         /* Danger Coral */
--color-danger-dark: #EF4444;    /* Danger Coral Dark */
--color-magic: #EC4899;          /* Magic Pink */
--color-magic-dark: #DB2777;     /* Magic Pink Dark */

/* Bakgrunder & Neutrala */
--color-deep-space: #0F172A;     /* Deep Space */
--color-soft-cloud: #F8FAFC;     /* Soft Cloud */
--color-pearl: #FFFFFF;          /* Pearl White */

/* Legacy colors (för backward compatibility) */
--color-legacy-blue: #3b82f6;    /* Gamla primärblå */
--color-legacy-green: #22c55e;   /* Gamla framgångsgröna */
--color-legacy-red: #ef4444;     /* Gamla felröda */
```

### GAMLA färger (bevarade för referens)
```css
/* Tidigare färgschema - används inte längre aktivt */
#3b82f6 - blue-500 (tidigare primary blue)
#22c55e - green-500 (tidigare success color)
#ef4444 - red-500 (tidigare error color)
#dcfce7 - green-100 (tidigare correct answer bg)
#fee2e2 - red-100 (tidigare incorrect bg)
```

### Färganvändning per kontext (NYA DESIGNEN)
- **Huvudfärg/Aktiv spelare**: Purple (--color-primary, --color-primary-dark)
- **Action/Stanna-knapp**: Orange (--color-action, --color-action-dark) 
- **Rätt svar/Poäng**: Teal (--color-success, --color-success-dark)
- **Fel svar**: Coral (--color-danger, --color-danger-dark)
- **Fortsätt/Nästa fråga**: Pink-Purple gradient (--color-magic + --color-primary)
- **Glassmorfism**: rgba(255, 255, 255, 0.9) med backdrop-filter: blur()
- **Inaktiv/disabled**: Gråskala (behålls från tidigare)

---

## 🔤 Typografi

### Fonter
```css
/* Primär font (body, mest text) */
font-family: 'Inter', sans-serif;

/* Sekundär font (rubriker via .font-poppins) */
font-family: 'Poppins', sans-serif;
```

### Font-storlekar (från CSS och Tailwind)
- **Rubriker**: text-4xl, text-3xl, text-2xl
- **Knappar**: 20px (desktop), 18px (mobile)
- **Normal text**: text-base (16px)
- **Små texter**: text-sm (14px), text-xs (12px)
- **Poäng-animationer**: 24px (flying points)

---

## 🔘 Knappsystem

### 1. Huvudmeny-knappar
**Location**: index.html (Tailwind classes)
```html
<!-- Standard blå knapp -->
class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"

<!-- Sekundär knapp -->
class="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors text-lg font-semibold"
```

### 2. Decision Buttons (Stanna/Fortsätt)
**Location**: css/styles.css (lines 41-320)
```css
.decision-button {
  /* Two-part button container */
  display: flex;
  gap: 12px;
  max-width: 480px;
}

.stop-side {
  /* Grön gradient för "Stanna" */
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
  border: 1px solid #86efac;
  color: #15803d;
}

.next-side {
  /* Blå gradient för "Fortsätt" */
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
```

**States**:
- `.disabled` - Grå, opacity 0.7
- `.has-points` - Enhanced glow
- `.completed` - Säkrad, ej klickbar
- `.attention` - Pulse animation

### 3. Svarsalternativ-knappar
**Location**: Dynamiskt via JavaScript
- **"Ordna" frågor**: Tailwind classes via JS
  ```javascript
  className = "option-btn w-full p-4 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 transition-all cursor-pointer text-left"
  ```
- **"Hör till" frågor**: CSS classes + Tailwind
  ```css
  .belongs-option-container
  .decision-buttons button
  ```

### 4. Large Next Question Button (Multiplayer)
**Location**: css/styles.css (lines 323-352)
```css
.large-next-question-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  /* Stor blå knapp för nästa fråga */
}
```

---

## ✨ Animationer & Övergångar

### CSS Keyframe Animations
**Location**: css/styles.css

1. **shake** (lines 358-362) - Skakning vid fel svar
2. **slideDown** (lines 135-144) - Slide-in för hints
3. **pulse-glow** (lines 147-156) - Uppmärksamhet
4. **flyToButton** (lines 211-224) - Flygande poäng
5. **pointLanded** (lines 227-237) - Poäng landar
6. **float-up** (lines 526-535) - Poäng flyter upp
7. **wakeUp** (lines 568-580) - Stanna-knapp aktiveras
8. **subtleGlow** (lines 586-593) - Mjuk glöd
9. **optionShimmer** (lines 616-627) - Nya alternativ
10. **pointsDrain** (lines 634-651) - Poäng försvinner
11. **buttonShake** (lines 653-660) - Knapp skakar
12. **darkPulse** (lines 663-673) - Mörk puls
13. **fadeIn** (lines 738-747) - Fade in effekt

### JavaScript Animations
**Location**: js/animationEngine.js
- Flying points animations
- Transform animations
- Opacity transitions
- Custom bezier curves för smooth motion

---

## 📱 Responsiv Design

### Breakpoints
- **Mobile**: max-width: 640px
- **Desktop**: Default

### Mobile anpassningar (css/styles.css)
```css
@media (max-width: 640px) {
  /* Decision buttons */
  .decision-button { max-width: 100%; }
  .stop-side, .next-side { padding: 16px 20px; }
  
  /* Font sizes */
  .decision-action { font-size: 18px; }
  .decision-points { font-size: 14px; }
  
  /* Belongs buttons */
  .decision-buttons button { 
    width: 2.25rem; 
    height: 2.25rem; 
  }
}
```

---

## 🎮 Spelläges-specifik Styling

### Single Player
- Total poäng visas i header
- Ingen spelarram eller highlighting
- Standard decision buttons

### Multiplayer
- **Aktiv spelare**: 
  ```css
  .player-score-card.active-player {
    background-color: #bfdbfe;
    border-color: #3b82f6;
    transform: scale(1.05);
    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.25);
  }
  ```
- **Player status bar**: Visar vems tur
- **Mini scores**: Kompakt poängvisning

### Challenge Mode
- Challenger hint box (blå gradient)
- Expandable challenge list items
- Status badges med olika färger

---

## 💻 JavaScript Dynamisk Styling

### Mest använda classList operations

**js/game.js**:
- `classList.add/remove('hidden')` - Screen management
- `classList.add('correct-step', 'incorrect-step')` - Answer feedback
- `classList.toggle('selected')` - Pack selection

**js/animationEngine.js**:
- Direct style manipulation för animations
- Transform, opacity, position changes
- Dynamic keyframe creation

**js/playerManager.js**:
- `classList.add/remove('active-player')` - Turn highlighting
- `classList.add('completed')` - Eliminated players

**js/gameController.js**:
- Button state classes (disabled, has-points, completed)
- Animation triggers

---

## 🗂️ Fil-struktur för Styling

```
ordna-game/
├── css/
│   └── styles.css          # All custom CSS, animations, overrides
├── index.html              # Tailwind classes inline
├── hur-det-fungerar.html   # Tailwind classes inline
└── js/
    ├── game.js             # Dynamic class manipulation
    ├── animationEngine.js  # Direct style manipulation
    ├── playerManager.js    # Player card styling
    ├── gameController.js   # Button state styling
    └── challengeSystem.js  # Challenge UI styling
```

---

## 🔧 Styling Patterns

### 1. State-based Styling
Komponenter har olika visuella states:
- Default
- Hover
- Active/Selected
- Disabled
- Completed/Secured
- Error/Incorrect

### 2. Gradient Usage
Extensiv användning av linear gradients:
- Buttons: 135deg gradients
- Backgrounds: 145deg gradients
- Info boxes: Subtle gradients

### 3. Shadow Hierarchy
- Small: `0 2px 4px rgba(0, 0, 0, 0.05)`
- Medium: `0 4px 8px rgba(0, 0, 0, 0.1)`
- Large: `0 4px 14px rgba(0, 0, 0, 0.15)`
- Colored: Blue/green shadows för emphasis

### 4. Transition Timing
- Fast: 0.2s (hover states)
- Medium: 0.3s (state changes)
- Slow: 0.5s-1s (animations)
- Easing: mostly `ease`, `ease-in-out`, `ease-out`

---

## 📝 Viktiga Observationer

1. **Hybrid Approach**: Kombination av Tailwind CSS och custom CSS
2. **Gradient Heavy**: Många gradients för modern look
3. **State Feedback**: Tydlig visuell feedback för alla interaktioner
4. **Animation Rich**: 13+ keyframe animations för smooth UX
5. **Color Coding**: Konsekvent färgkodning (grön=rätt, röd=fel, blå=aktiv)
6. **Mobile First**: Responsiv design med mobile breakpoints
7. **Accessibility**: Hover states, contrast ratios maintained

---

## 🚀 Rekommendationer för Styling Update

1. **Centralisera färger**: Skapa CSS variables för färgschema
2. **Konsolidera knappstilar**: Unified button component classes
3. **Standardisera animationer**: Återanvändbara animation classes
4. **Reducera gradient complexity**: Förenkla där möjligt
5. **Öka Tailwind usage**: Minska custom CSS där Tailwind räcker
6. **Dark mode prep**: Strukturera för framtida dark mode
7. **Component isolation**: Separera komponent-specifik styling