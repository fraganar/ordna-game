# Navigation & Meny - Tres Mangos

**Skapad:** 2025-10-04
**Status:** Pågående utvärdering

---

## 📋 Översikt

Detta dokument beskriver olika navigationsförslag för Tres Mangos, inklusive implementationsdetaljer och framtida förbättringar.

---

## 🎯 Design-krav

### Grundläggande behov:
- ✅ **Tillbaka till start** från alla skärmar (med bekräftelse vid aktivt spel)
- ✅ **Byt namn** när som helst
- ✅ **Tillgång till hjälp** (hur det fungerar)
- 📊 **Statistik** (framtida feature)
- ⚙️ **Inställningar** (framtida: ljud, notiser, etc.)

### Design-principer:
1. **Minimal störning** - Ska inte distrahera från spelet
2. **Mango-tema** - Ska passa spelets tropiska design
3. **Responsiv** - Fungera lika bra på mobil och desktop
4. **Tillgänglig** - Tappbara ytor, keyboard shortcuts
5. **Smooth animationer** - Konsekvent med spelets look & feel

---

## 🍔 FÖRSLAG 1: Hamburger-meny (IMPLEMENTERAD)

### Koncept
En mango-färgad hamburger-ikon i övre högra hörnet som expanderar till en full-screen overlay-meny.

### ✅ Implementation

#### **Filer skapade/modifierade:**
- `index.html` - HTML-struktur för meny och dialogs
- `css/styles.css` - Animationer och styling
- `js/mobileNav.js` - Meny-logik och interaktioner

#### **HTML-struktur:**
```html
<!-- Hamburger Button (Fixed position) -->
<button id="hamburger-btn">...</button>

<!-- Menu Overlay -->
<div id="menu-overlay">
  - Tillbaka till start
  - Byt namn
  - Hur det fungerar
  - Statistik (disabled/kommer snart)
</div>

<!-- Confirmation Dialog -->
<div id="confirm-dialog">...</div>
```

#### **Styling highlights:**
```css
/* Hamburger med mango-gradient */
background: linear-gradient(135deg, var(--color-magic), var(--color-primary));
backdrop-filter: blur(10px);

/* Stagger animation på menyalternativ */
animation-delay: 0.05s, 0.1s, 0.15s, etc.

/* Bounce-in dialog */
cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### **Funktionalitet:**
- ✅ Öppna/stäng meny med click
- ✅ ESC-tangent stänger meny
- ✅ Click utanför stänger meny
- ✅ Bekräftelse-dialog vid aktivt spel
- ✅ Body scroll-lock när meny öppen
- ✅ Responsiv (mindre knapp på mobil)

### 🚀 Framtida förbättringar för Förslag 1

#### **Polish & Animationer:**
1. **Pulse-animation** på hamburger när användaren är fast/inaktiv länge
   ```css
   @keyframes gentlePulse {
     0%, 100% { transform: scale(1); }
     50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255, 152, 0, 0.5); }
   }
   ```

2. **Swipe-gesture** (mobil) - Swipe från höger kant öppnar menyn
   ```javascript
   // Touch handlers för swipe detection
   touchStartX, touchEndX → calculate swipe direction
   ```

3. **Haptic feedback** (iOS/Android) - Vibration vid meny-öppning
   ```javascript
   if (navigator.vibrate) navigator.vibrate(10);
   ```

4. **Blur-effekt på bakgrund** - Game-container blurras när meny öppen
   ```css
   #game-container.menu-open { filter: blur(8px); }
   ```

5. **Sound effects** (optional) - Subtil "whoosh" när meny öppnas
   ```javascript
   const menuSound = new Audio('/sounds/menu-open.mp3');
   menuSound.volume = 0.3;
   ```

#### **Funktionalitet:**
6. **Snabbtangenter** - Keyboard shortcuts för power users
   - `H` → Home (tillbaka till start)
   - `N` → Name (byt namn)
   - `?` → Help (hur det fungerar)

7. **Breadcrumbs** i menyn - Visa var användaren är
   ```
   Start > Spel > Fråga 5/12
   ```

8. **Kontextberoende alternativ** - Visa olika alternativ baserat på skärm:
   - I spel: "Avsluta spel", "Pausa"
   - På resultat: "Dela resultat", "Spela igen"
   - På start: Bara "Byt namn", "Hjälp"

9. **Statistik-panel** - När statistik implementeras:
   - Total poäng
   - Bästa resultat
   - Antal spelade omgångar
   - Win rate (multiplayer)

10. **Teman/Inställningar** - Framtida expansion:
    - 🌙 Dark mode toggle
    - 🔊 Ljud på/av
    - 🔔 Notiser på/av
    - 🌍 Språkval

---

## 🎈 FÖRSLAG 2: Floating Action Button (FAB)

### Koncept
En rund mango-knapp i nedre högra hörnet som expanderar till en radial submeny.

### Design-specifikation

#### **Position & Stil:**
```css
#fab-menu {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-magic), var(--color-primary));
  box-shadow: 0 6px 24px rgba(255, 152, 0, 0.4);
  z-index: 50;
}
```

#### **Expansion-animation:**
```javascript
// Radial menu - submeny-knappar expanderar uppåt/vänster
const positions = [
  { x: -80, y: -20 },   // Option 1
  { x: -60, y: -80 },   // Option 2
  { x: -20, y: -120 },  // Option 3
];
```

#### **Interaktion:**
- Click på FAB → Submeny expanderar
- Hover visa labels på submeny-knappar
- Click utanför → Collapse
- Mobile: Long-press för alternativ meny

### Status: EJ IMPLEMENTERAD (Nästa att utvärdera)

---

## 📊 Jämförelse: Förslag 1 vs 2

| Feature | Hamburger (F1) | FAB (F2) |
|---------|----------------|----------|
| **Visuell störning** | Minimal (övre hörn) | Mycket minimal (nedre hörn) |
| **Touch target** | Medium | Stor |
| **Expanderbart** | Overlay (mycket utrymme) | Radial (begränsat) |
| **Lekfull design** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bekant pattern** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Desktop-vänlig** | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Framtida expansion** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🛠️ Implementation Checklist

### Förslag 1 (Hamburger) - KLAR ✅
- [x] HTML-struktur
- [x] CSS-styling och animationer
- [x] JavaScript-funktionalitet
- [x] Bekräftelse-dialog
- [x] Responsiv design
- [x] Keyboard shortcuts (ESC)
- [ ] Swipe-gesture (framtida)
- [ ] Pulse-animation (framtida)
- [ ] Sound effects (framtida)

### Förslag 2 (FAB) - NÄSTA
- [ ] HTML-struktur
- [ ] CSS-styling och animationer
- [ ] JavaScript-funktionalitet
- [ ] Radial submenu expansion
- [ ] Labels on hover
- [ ] Responsiv design

---

## 🎨 Design Assets

### Färger (från STYLING_MAP.md)
```css
--color-primary: #FF9800        /* Deep Mango Orange */
--color-magic: #FFB74D           /* Warm Mango */
--color-success: #14B8A6         /* Success Teal */
--color-danger: #F87171          /* Danger Coral */
```

### Ikoner (används i menyn)
- 🏠 Home - Tillbaka till start
- 👤 User - Byt namn
- ❓ Help - Hur det fungerar
- 📊 Chart - Statistik
- ⚙️ Settings - Inställningar

---

## 📝 Anteckningar

### Beslut att ta:
1. ✅ Hamburger eller FAB som primär navigation?
2. ⏳ Ska båda finnas? (Hamburger huvudmeny + FAB för quick actions?)
3. ⏳ Vilka features ska prioriteras först?

### Tekniska överväganden:
- MobileNav-klassen är modulär och kan återanvändas
- CSS-animationer är performance-optimerade (GPU-accelerated)
- Meny-state kan integreras med GameController för spelstatus

### Framtida integrations:
- Firebase för statistik
- PWA för notifikationer
- Service Worker för offline-support

---

## 🔗 Relaterade filer
- `STYLING_MAP.md` - Komplett färg- och stilguide
- `GAME_SPECIFICATION.md` - Spellogik och flöden
- `CLAUDE.md` - Projektinstruktioner

---

**Nästa steg:** Utvärdera Förslag 2 (FAB) och jämför UX med Hamburger-menyn.
