# ID:7 UI-hantering - Implementeringsplan

## Nuvarande problem
- UI-logik spridd över flera filer
- Direkta DOM-manipulationer i game.js (27 st)
- updatePlayerDisplay() ligger i PlayerManager (borde vara i UIRenderer)
- Blandad användning av UI.get() och document.getElementById()

## Åtgärder

### Steg 1: Flytta updatePlayerDisplay från PlayerManager till UIRenderer
- Kopiera funktionen till UIRenderer
- Uppdatera alla anrop
- Ta bort från PlayerManager

### Steg 2: Identifiera och migrera DOM-manipulationer från game.js
Huvudsakliga områden:
- showCorrectAnswers() - visar facit
- showExplanation() / hideExplanation() - förklaringar
- feedbackBelongsTo() - visar rätt svar för hör-till
- endSinglePlayerGame() - visar slutskärm
- showGameResultScreen() - visar resultat
- restartGame() - återställer UI
- populatePackShop() - fyller pack-butiken
- createPlayerInputs() - skapar spelarinmatningar

### Steg 3: Konsolidera alla UI-metoder i UIRenderer
- Alla show/hide operationer
- Alla textuppdateringar
- Alla CSS-klassändringar
- Alla element-skapanden

### Förväntad vinst
- All UI-logik på ett ställe
- Lättare att testa och underhålla
- Tydlig separation mellan logik och presentation
- ~100-150 rader kod kan tas bort från game.js