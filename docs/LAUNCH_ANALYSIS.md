# Tres Mangos - Lanseringsanalys och Tillväxtstrategi

## Sammanfattning

Tres Mangos är ett tekniskt färdigt och underhållande quiz-spel med en smart "push your luck"-mekanik. Men spelet saknar de kritiska komponenter som gör att spelare återvänder dag efter dag och rekommenderar det till vänner. Denna analys identifierar exakt vad som behövs för en framgångsrik lansering.

---

## Del 1: Spelarresans Analys

### Den Nuvarande Spelarresan

```
Dag 1: Upptäckt
├── Spelare får länk från vän → Spelar utmaning → Har kul
├── Resultat: "Det var roligt!"
└── Sen då? → Ingen anledning att återvända

Dag 2-7: Glömska
├── Ingen påminnelse
├── Ingen belöning för att återvända
├── Ingen progression att fortsätta
└── Resultat: Spelare glömmer spelet

Vecka 2+: Bortfall
└── Spelet existerar inte längre i spelarens medvetande
```

### Den Ideala Spelarresan

```
Dag 1: Hook (Kroken)
├── Spelare får länk → Spelar → Har kul
├── Ser sin ranking: "#847 av 2,431 spelare"
├── Får badge: "Första utmaningen avklarad! 🏆"
└── Ser: "Kom tillbaka imorgon för dagens utmaning!"

Dag 2-3: Investment (Investering)
├── Push-notis: "Dagens utmaning är live!"
├── Spelar dagens utmaning → Klättrar på rankingen
├── Streak börjar: "2 dagar i rad! 🔥"
└── Social proof: "3 vänner spelade idag"

Dag 4-7: Habit (Vana)
├── Rutin etablerad
├── Streak är nu viktig: "6 dagar! 🔥🔥"
├── Konkurrens med vänner: "Du leder mot Erik!"
└── Investerad identitet: "Jag är bra på Tres Mangos"

Vecka 2+: Ambassador (Ambassadör)
├── Delar aktivt med nya vänner
├── Försvarar sin ranking
├── Skapar innehåll/pratar om spelet
└── Identifierar sig som "spelare"
```

---

## Del 2: Psykologiska Principer

### Varför Spelare Återvänder (eller inte)

**1. Variable Reward (Variabel Belöning)**
- Hjärnan älskar osäkerhet om belöning
- "Vad blir dagens frågor?" skapar nyfikenhet
- ❌ Tres Mangos idag: Ingen variation dag till dag

**2. Loss Aversion (Förlust-aversion)**
- Vi hatar att förlora det vi har
- Streaks fungerar för att vi inte vill "förstöra" dem
- ❌ Tres Mangos idag: Inget att förlora

**3. Social Proof (Social Bekräftelse)**
- Vi gör vad andra gör
- "1,247 spelade idag" skapar FOMO
- ❌ Tres Mangos idag: Spelar i isolation

**4. Progress & Mastery (Framsteg & Mästerskap)**
- Vi vill känna att vi blir bättre
- Synlig progression ger motivation
- ❌ Tres Mangos idag: Ingen progression synlig

**5. Identity (Identitet)**
- Vi gör saker som stämmer med vår självbild
- "Jag är en quiz-person" driver beteende
- ❌ Tres Mangos idag: Ingen identitetsbyggnad

---

## Del 3: Kritiska Funktioner för Lansering

### Tier 1: Måste Ha (MVP för Retention)

#### 1. Daglig Utmaning
**Vad:** En ny uppsättning frågor varje dag, samma för alla spelare.

**Varför det fungerar:**
- Skapar anledning att återvända varje dag
- Alla spelar samma frågor = jämförbar ranking
- Tidsbegränsning (24h) skapar urgency

**Implementation:**
```
- Automatiskt genererad frågeuppsättning (seed baserat på datum)
- Deadline: Midnatt svensk tid
- Resultat sparas och rankas mot alla andra
- Visas på startsida: "Dagens utmaning: 4h 23m kvar"
```

**Uppskattad effort:** Medium (2-3 dagar)

---

#### 2. Streak-system
**Vad:** Räkna och visa hur många dagar i rad spelaren spelat.

**Varför det fungerar:**
- Loss aversion: "Jag vill inte förlora min streak"
- Visible progress: "Jag har spelat 14 dagar!"
- Status: Högre streak = högre status

**Implementation:**
```
- localStorage: lastPlayedDate, currentStreak, longestStreak
- Visas på startsida: "🔥 5 dagar i rad"
- Påminnelse om streak riskerar att brytas
- Milestone-firande: 7, 30, 100 dagar
```

**Uppskattad effort:** Låg (1 dag)

---

#### 3. Enkel Statistik-sida
**Vad:** Visa spelarens historik och prestationer.

**Varför det fungerar:**
- Progress visibility: "Jag har förbättrats!"
- Investment: "Jag har spelat 47 spel"
- Sharing: "Kolla min statistik!"

**Innehåll:**
```
- Totalt antal spel
- Vinst/förlust-ratio i challenges
- Favoritpaket
- Bästa poäng
- Streak-historik
- Snitt poäng per fråga
```

**Uppskattad effort:** Medium (2 dagar)

---

#### 4. Vecko-leaderboard
**Vad:** Ranking av alla spelare baserat på veckans prestationer.

**Varför det fungerar:**
- Competition: "Jag vill slå de andra"
- Social proof: "X spelare denna vecka"
- Fresh start: Nya chanser varje vecka

**Implementation:**
```
- Firebase aggregate query
- Poängsystem: Daglig utmaning + challenge-vinster
- Top 100 visas publikt
- Din position visas alltid
- Återställs varje måndag
```

**Uppskattad effort:** Medium (2-3 dagar)

---

### Tier 2: Bör Ha (För tillväxt)

#### 5. Achievement-system (Badges)
**Vad:** Visuella märken för prestationer.

**Exempel-badges:**
```
🥇 Första vinsten - Vinn din första challenge
🔥 Vecko-streck - Spela 7 dagar i rad
🏆 Challenge Champion - Vinn 10 challenges
🧠 Quiz Master - Få 12/12 i en omgång
⚡ Speedster - Klara en fråga på under 5 sekunder
🌟 Perfectionist - Betygsätt 50 frågor
```

**Uppskattad effort:** Medium (2-3 dagar)

---

#### 6. Referral-system
**Vad:** Belöna spelare som bjuder in vänner.

**Mekanik:**
```
- "Bjud in vän → Du får X poäng när de spelar"
- Unik referral-länk per spelare
- Visuell tracker: "Du har bjudit in 3 vänner"
- Milestone-belöningar: 5 vänner = speciellt badge
```

**Uppskattad effort:** Medium-Hög (3-4 dagar)

---

#### 7. Head-to-head Historik
**Vad:** Se din historik mot specifika vänner.

**Innehåll:**
```
- "Du vs Erik: 5-3"
- Senaste matcherna
- "Revenge"-knapp för att utmana igen
```

**Uppskattad effort:** Låg (1-2 dagar)

---

### Tier 3: Trevligt att Ha (Långsiktig)

#### 8. Säsonger/Events
- Tema-veckor med specialfrågor
- Säsongsrankings med priser
- Högtids-events (Jul-quiz, Midsommar-quiz)

#### 9. Frågepakets-progression
- Lås upp nya paket genom att spela
- "Klara Blandat I för att låsa upp Blandat II"

#### 10. Push-notifikationer
- Daglig påminnelse om utmaning
- "Din streak är i fara!"
- "Erik utmanade dig!"

---

## Del 4: Lanseringsplan

### Fas 1: Förberedelse (1-2 veckor)

**Tekniskt:**
- [ ] Implementera Daglig Utmaning
- [ ] Implementera Streak-system
- [ ] Implementera Statistik-sida
- [ ] Implementera Vecko-leaderboard
- [ ] Bugfixar och polish

**Innehåll:**
- [ ] Granska och kvalitetssäkra alla frågepaket
- [ ] Skapa "launch week" specialpaket
- [ ] Förbereda 30 dagars dagliga utmaningar

**Marknadsföring:**
- [ ] Skapa enkel landningssida
- [ ] Förbereda delningstexter
- [ ] Identifiera 10-20 "seed users" (vänner/familj)

---

### Fas 2: Soft Launch (1-2 veckor)

**Mål:** Validera retention med liten grupp

**Aktiviteter:**
1. Bjud in 20-50 personer (vänner, familj, kollegor)
2. Be dem spela dagligen i en vecka
3. Samla feedback aktivt
4. Mät Day 1, Day 3, Day 7 retention
5. Iterera baserat på data

**Success-kriterier:**
- Day 7 retention > 20%
- Minst 30% skapar challenges
- NPS > 30

---

### Fas 3: Public Launch (Vecka 3-4)

**Strategi: Word-of-mouth fokus**

**Kanaler (i prioritetsordning):**

1. **WhatsApp-grupper**
   - Skicka i vängrupper: "Vi har gjort ett spel, prova!"
   - Be folk utmana sina vänner
   - Organisk spridning

2. **LinkedIn**
   - Dela "vi lanserade ett projekt"
   - Be kontakter testa och ge feedback
   - Professionell trovärdighet

3. **Twitter/X**
   - Dela utvecklingsresan
   - Engage med svensk gaming/quiz-community

4. **Reddit**
   - r/sweden - "Vi gjorde ett quiz-spel"
   - r/indiegaming - "Launch story"

5. **Facebook-grupper**
   - Svenska quiz-grupper
   - Lokala community-grupper

**Timing:**
- Måndag morgon = Bäst för arbetsplats-spridning
- Undvik helger initialt

---

### Fas 4: Tillväxt (Månad 2+)

**Organisk tillväxt:**
- Daglig utmaning driver återbesök
- Challenge-system driver nya spelare
- Leaderboard driver konkurrens

**Experiment att testa:**
- Influencer-partnerskap (quiz/gaming-profiler)
- Företagsutmaningar (team-building)
- Skolsamarbeten (pedagogiskt värde)

---

## Del 5: Framgångsmått

### Nyckeltal att Mäta

**Retention:**
| Mått | Mål (Soft Launch) | Mål (6 månader) |
|------|-------------------|-----------------|
| Day 1 → Day 2 | 40% | 50% |
| Day 1 → Day 7 | 20% | 30% |
| Day 1 → Day 30 | 10% | 15% |

**Engagement:**
| Mått | Mål |
|------|-----|
| Spel per användare/vecka | 4+ |
| Challenges skapade/användare | 0.5+ |
| Daglig utmaning completion | 60% |

**Tillväxt:**
| Mått | Mål |
|------|-----|
| Viral koefficient (K) | 0.3+ |
| Organisk tillväxt/månad | 20%+ |

---

## Del 6: Risker och Motåtgärder

### Risk 1: Låg Retention
**Symptom:** Spelare spelar en gång och återvänder aldrig
**Motåtgärd:**
- Prioritera streak-system och daglig utmaning
- A/B-testa olika påminnelse-strategier
- Intervjua churned users

### Risk 2: Ingen Viral Spridning
**Symptom:** Spelare skapar inte challenges
**Motåtgärd:**
- Förbättra share-UX
- Incentivera delning (referral rewards)
- Gör resultatskärmen mer "skrytvänlig"

### Risk 3: Innehållsbrist
**Symptom:** Spelare ser samma frågor
**Motåtgärd:**
- Tracking av visade frågor per spelare
- Community-genererat innehåll (framtida)
- Partnerskap för frågeinnehåll

### Risk 4: Tekniska Problem vid Skala
**Symptom:** Firebase-kostnader skenar, prestanda försämras
**Motåtgärd:**
- Optimera queries tidigt
- Sätt budget-alerts i Firebase
- Caching-strategier

---

## Del 7: Specifika Ändringar i Spelet

### Måste Ändras Före Lansering

#### 1. Startsida-redesign
**Nuvarande:** Fokus på "Spela nu"
**Ändras till:**
```
┌─────────────────────────────────┐
│  🔥 Din streak: 5 dagar         │
│                                 │
│  ⏰ Dagens Utmaning             │
│  [4h 23m kvar]                  │
│  [SPELA NU]                     │
│                                 │
│  📊 Din veckoranking: #147      │
│  🏆 Dina challenges: 3 aktiva   │
│                                 │
│  [Utmana en vän]  [Statistik]   │
└─────────────────────────────────┘
```

#### 2. Resultatskärm-förbättring
**Nuvarande:** Visar poäng och "Utmana någon"
**Ändras till:**
```
┌─────────────────────────────────┐
│  Ditt resultat: 47 poäng        │
│  🔥 6 dagar i rad!              │
│                                 │
│  📈 Din bästa: 52 poäng         │
│  📊 Snitt idag: 38 poäng        │
│  🏆 Din ranking: #89            │
│                                 │
│  [Utmana en vän]                │
│  [Dela på WhatsApp]             │
│  [Se leaderboard]               │
└─────────────────────────────────┘
```

#### 3. Ny "Mina Statistik"-skärm
**Innehåll:**
- Total antal spel
- Vinst/förlust i challenges
- Längsta streak
- Favoritpaket
- Poänghistorik (graf)
- Badges

#### 4. Leaderboard-skärm
**Innehåll:**
- Veckoranking (top 100 + din position)
- All-time ranking
- Vänner-ranking (de du utmanat)
- Filter: Denna vecka / Denna månad / All-time

---

## Del 8: Prioriterad Implementationsordning

### Sprint 1 (Vecka 1)
1. ✅ Streak-system (localStorage + UI)
2. ✅ Statistik-grundstruktur (Firebase)
3. ✅ Uppdaterad startsida

### Sprint 2 (Vecka 2)
4. ✅ Daglig Utmaning (backend + UI)
5. ✅ Vecko-leaderboard
6. ✅ Resultatskärm-förbättring

### Sprint 3 (Vecka 3)
7. ✅ Achievement-system (badges)
8. ✅ Statistik-skärm (full)
9. ✅ Polish och bugfixar

### Sprint 4 (Vecka 4)
10. Soft launch
11. Feedback-iteration
12. Public launch

---

## Slutsats

Tres Mangos har en solid spelkärna. Utmaningen är inte att göra spelet roligare i stunden - det är redan roligt. Utmaningen är att ge spelare **anledningar att återvända** och **verktyg för att sprida**.

De fyra kritiska funktionerna är:
1. **Daglig Utmaning** - Anledning att återvända
2. **Streak-system** - Förlust-aversion driver vana
3. **Leaderboard** - Social konkurrens
4. **Synlig statistik** - Känsla av progression

Med dessa på plats transformeras Tres Mangos från "ett roligt spel jag spelade en gång" till "mitt dagliga quiz-spel".

---

*Dokumentet uppdaterat: 2026-01-03*
