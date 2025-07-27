# Ordna - Frågesport

Ett klurigt frågespel där ni tävlar om vem som vågar chansa mest. Spela med vänner och familj i denna interaktiva quiz där strategiskt risktagande är nyckeln till framgång.

## Hur man kör spelet

1. Öppna `index.html` i en webbläsare
2. Välj antal spelare (2-6 personer)
3. Ange spelarnas namn
4. Välj frågepaket (valfritt)
5. Börja spela!

Du kan också starta en lokal server:
```bash
# Med Python 3
python -m http.server 8000

# Med Node.js (om du har http-server installerat)
npx http-server

# Eller bara öppna index.html direkt i webbläsaren
```

## Spelregler

### Grundläggande spelmekanik
- **Turordning**: Spelarna turas om att svara på frågor. Den aktiva spelaren markeras med en blå ram.
- **Poängsamling**: Varje rätt svar bygger upp din personliga pott för rundan.
- **Riskhantering**: Klicka på "Stanna" för att säkra din pott som poäng och stå över resten av rundan.
- **Elimination**: Svarar du fel nollställs din pott och du åker ut ur rundan.

### Frågetyper

**Ordna-frågor**
- Klicka på alternativen i rätt ordning
- Varje rätt steg ger +1 poäng till din pott
- Ett fel eliminerar dig från rundan

**Hör till-frågor**  
- Bedöm varje alternativ med ja/nej
- Varje rätt bedömning ger +1 poäng till din pott
- Ett fel eliminerar dig från rundan

### Strategi
- Ju längre du vågar fortsätta, desto mer kan du vinna
- Men risken ökar - ett fel och allt är förlorat
- Timing är allt - när ska du stanna för att säkra dina poäng?

## Teknologier som används

- **HTML5** - Grundläggande struktur
- **CSS3** - Styling och animationer
- **JavaScript (ES6+)** - Spellogik och interaktivitet
- **Tailwind CSS** - Responsiv design och snabb styling
- **Google Fonts** - Typografi (Inter & Poppins)

## Projektstruktur

```
ordna-game/
├── index.html          # Huvudfilen för spelet
├── css/
│   └── styles.css      # Anpassad CSS och stilar
├── js/
│   └── game.js         # Spellogik och JavaScript
├── assets/             # Bilder och ljud (framtida användning)
├── .gitignore          # Git-ignorerade filer
└── README.md           # Denna fil
```

## Frågepaket

Spelet innehåller flera frågepaket för olika målgrupper:

- **Familjen Normal** - Lagom svåra frågor för en vanlig fredagskväll
- **Plugghästen** - Geografi, kemi och grammatik
- **Nörden** - Superhjältar och programmering
- **Historia** - Från antiken till kalla kriget
- **Filmfantasten** - Repliker och regissörer
- **Galaxhjärnan** - Universum, vetenskap och existens
- **Boomer** - Frågor om "den goda gamla tiden"
- **Gatesmart och depraverad** - Frågor som inte lärs ut i skolan
- Och flera till...

Välj de paket som passar er grupp bäst, eller spela med alla för maximal variation!

## Framtida funktioner

- Fler frågepaket
- Online-multiplayer
- Ljud och musik
- Anpassningsbara spelregler
- Statistik och highscores