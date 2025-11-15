# Arkiverad Dokumentation

Detta arkiv innehåller historiska dokument från projektets utveckling. Alla viktiga lärdomar och information har flyttats till den aktiva dokumentationen.

## Arkiverade Filer

### BL-014_STATE_CORRUPTION_ANALYSIS.md
**Datum:** 2025-08-23
**Innehåll:** Omfattande debug-analys av state corruption mellan spellägen
**Status:** Problem löst (BL-014, BL-015, BL-016, BL-017 i LOG.md)
**Lärdomar flyttade till:** CLAUDE.md (Code Quality sektion)

### REFACTORING_LESSONS_LEARNED.md
**Datum:** 2025-08-24
**Innehåll:** Lärdomar från refaktorerings-kris med dubbletter av funktioner
**Status:** Lärdomar bevarade
**Lärdomar flyttade till:** CLAUDE.md (Refactoring Guidelines sektion)

### LOCALSTORAGE_FIREBASE_SYNC_PLAN.md
**Innehåll:** Tidig plan för localStorage/Firebase synkronisering
**Status:** Ersatt av FIREBASE_MIGRATION_PLAN.md (mer detaljerad approach)
**Varför arkiverad:** Planen följdes aldrig, annan approach valdes

### test-step0-verification.md
**Innehåll:** Test-instruktioner för Step 0 av Firebase-migreringen
**Status:** Tester genomförda och klara
**Varför arkiverad:** Migration komplett, inga fler tester behövs

### FIREBASE_MIGRATION_PLAN.md
**Datum:** 2024-12-28 (senast uppdaterad)
**Innehåll:** Fullständig dokumentation av Firebase challenge system migration
**Status:** Migration komplett ✅
**Sammanfattning flyttad till:** CLAUDE.md (Firebase Challenge System - Teknisk Översikt)
**Varför arkiverad:** Migration klar, behålls för historisk referens

### FIREBASE_AUTH_INTEGRATION_PLAN_V2.md
**Datum:** 2025-01-12 (v2 - ren lösning)
**Innehåll:** Detaljerad plan för Firebase Authentication integration
**Status:** Implementerad ✅ (BL-023 - Firebase Auth)
**Sammanfattning flyttad till:** CLAUDE.md
**Varför arkiverad:** Implementation komplett, behålls för referens

### PLAYED_PACKS_FEATURE.md
**Datum:** 2025-10-06
**Innehåll:** Feature plan för spelade frågepaket tracking
**Status:** Implementerad ✅
**Varför arkiverad:** Feature implementerad, dokumentation i kod

### NAVIGATION_REDESIGN.md + NAVIGATION_MENU.md
**Datum:** 2025-10-01
**Innehåll:** Navigation redesign (challenge-flöde som primärt)
**Status:** Implementerad ✅ (BL-027)
**Varför arkiverad:** Redesign komplett

### DUMMY_NAME_HANDLING_PLAN.md
**Datum:** 2025-10-03
**Innehåll:** Plan för hantering av dummy-namn i Firebase
**Status:** Implementerad ✅
**Varför arkiverad:** Dummy-namn logik implementerad

## Aktiv Dokumentation

För uppdaterad information, se:
- **CLAUDE.md** - Projektöversikt, arkitekturprinciper, guidelines
- **GAME_SPECIFICATION.md** - Spelmekanik, teknisk spec
- **DEPENDENCIES.md** - Tekniska dependencies
- **STYLING_MAP.md** - CSS-arkitektur
- **BACKLOG.md** - Aktiva uppgifter
- **LOG.md** - Ändringshistorik

---

## Borttagna Filer (2025-11-15)

Följande planer implementerades och togs helt bort (ej arkiverade):
- `REFACTOR_OPPONENT_COMPLETION.md` - Implementerad ✅ (BL-030)
- `CONSOLIDATE_NAVIGATION.md` - Implementerad ✅ (BL-031)
- `REMOVE_ALERT_POPUPS_PLAN.md` + `TESTING.md` - Implementerad ✅
- `FIXED_BOX_IMPLEMENTATION_SPEC.md` - Gammal bugfix, ej längre relevant

---

*Senast uppdaterad: 2025-11-15*