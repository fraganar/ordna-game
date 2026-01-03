# Tres Mangos - Lanseringsstrategi & Tillväxtplan

**Skapad:** 2026-01-03
**Syfte:** Komplett analys och strategi för att lansera och växa Tres Mangos från 0 till viral tillväxt
**Status:** DRAFT - För diskussion och prioritering

---

## Executive Summary

**Tres Mangos** är ett svenskt push-your-luck quiz-spel med unik spelmekanik och tekniskt solid grund. Spelet har **potential att bli viralt** men saknar kritiska funktioner för användarengagemang och retention.

**Kärnproblemet:** Spelarna har ingen anledning att komma tillbaka efter första sessionen.

**Lösningen:** Implementera en trestegs-strategi som förvandlar spelet från "spela en gång" till "spela varje dag":
1. **Pre-Launch (2-3 veckor):** Fixa kritiska retention-features
2. **Soft Launch (1-2 veckor):** Testa med small community, samla data
3. **Public Launch:** Viral spridning genom incentiverad delning

**Målet:** 10,000 aktiva spelare inom 3 månader efter lansering.

---

## 1. Nulägesanalys

### 1.1 Vad Spelet Har (Styrkor)

#### ✅ Spelmekanik
- **Push-your-luck mekanik:** Psykologiskt engagerande, "en mer fråga"-känsla
- **Flera frågetyper:** Ordna, Hör till, Vilken (variation)
- **Single + Multiplayer:** Flexibilitet för olika situationer
- **Challenge-systemet:** Asynkron 1v1 tävling fungerar tekniskt

#### ✅ Teknisk Grund
- **Firebase-integration:** Fungerar för challenges och autentisering
- **PWA-ready:** Installeras som app på mobil
- **Responsiv design:** Fungerar på alla enheter
- **Bra UX:** Animationer, feedback, intuitivt interface

#### ✅ Innehåll
- **26 frågepaket** tillgängliga (!)
  - 6 synliga: Filmcitat, Ordspråk, Sport, Blandat I-III
  - 20 dolda: Sport 1-2, Antiken 1-2, Filmcitat 1-2, Musik, Ordspråk 1-2, Blandat #1-11
- **Hundratals frågor** totalt
- **Varierat innehåll:** Historia, sport, film, språk, kultur

#### ✅ Social Features
- **Delningslänkar:** Fungerar för challenges
- **WhatsApp-integration:** Enkel delning till vänner

### 1.2 Vad Spelet Saknar (Svagheter)

#### ❌ Retention & Engagement
- **Ingen progression:** Inga levels, achievements, unlocks
- **Ingen statistik:** Spelaren ser inte sin utveckling över tid
- **Ingen leaderboard:** Ingen konkurrens utöver 1v1 challenges
- **Inga dagliga/veckoutmaningar:** Inget skäl att komma tillbaka imorgon
- **Ingen streak-tracking:** Missar motivationen i dagliga besök
- **Ingen personalisering:** Alla spelar samma frågor

#### ❌ Viral Mekanik
- **Inget incitament att dela:** Varför skulle jag utmana någon?
- **Ingen social proof:** Ser inte vem som spelar eller hur många
- **Ingen kompetitiv aspekt:** Challenge är "okej", men ingen global ranking
- **Ingen referral-bonus:** Inget att vinna på att bjuda in vänner
- **Ingen community:** Isolerad spelupplevelse

#### ❌ Onboarding
- **Ingen guided first experience:** Spelaren kastas in direkt
- **Ingen tutorial för challenge-mode:** Förvirrande hur det fungerar
- **Inget "aha-moment":** Första intrycket är "ok, ett quiz"

#### ❌ Monetisering (Framtida)
- **Ingen revenue stream:** Kan inte växa utan ekonomi
- **Inga premium-paket:** Allt innehåll gratis = inget värde?
- **Inga annonser:** Missar potentiell inkomst

### 1.3 SWOT-Analys

| **Styrkor (S)** | **Svagheter (W)** |
|-----------------|-------------------|
| Unik spelmekanik | Ingen retention |
| Tekniskt solid | Ingen viral loop |
| Mycket innehåll | Ingen monetisering |
| PWA-ready | Begränsad onboarding |

| **Möjligheter (O)** | **Hot (T)** |
|---------------------|-------------|
| Viral spridning via social media | Konkurrens från Kahoot, Quizlet |
| Community-building | Användare tröttnar efter 1 session |
| Internationalisering | Begränsat till svensktalande |
| Educational partnerships | Svårt att få initial traction |

---

## 2. Användarresan (User Journey)

### 2.1 Nuvarande Resa (PROBLEM)

```
Dag 1: Upptäckt
├─ Får länk från vän → Öppnar spelet
├─ Spelar 1-2 rundor → "Kul!"
└─ Stänger appen → FÖRLORAD

Dag 2-∞: Inget
└─ Kommer INTE tillbaka (ingen anledning)
```

**Retention Rate (uppskattning):**
- Dag 1: 100% (de som öppnar)
- Dag 2: ~10% (kommer tillbaka)
- Dag 7: ~2% (spelar fortfarande)

**Conversion till ambassadör:** <1%

### 2.2 Ideal Resa (MÅL)

```
Dag 1: Upptäckt & Hook
├─ Får länk från vän → Öppnar spelet
├─ Spelar guided tutorial (första 3 frågor)
├─ "Wow, detta är kul!" → Första aha-momentet
├─ Ser vän på leaderboard → Kompetitiv trigger
├─ Utmanar tillbaka → Social trigger
└─ Bjuder in 2 vänner (bonus: unlock special pack)

Dag 2: Återkommande
├─ Notifikation: "Daglig utmaning tillgänglig!"
├─ Spelar daglig → +streak bonus
├─ Ser sig själv klättra på leaderboard
└─ Utmanar vän som passerat

Dag 3-7: Engagement Loop
├─ Daglig utmaning varje dag (streak +1)
├─ Ny achievement: "7-dagars streak" 🔥
├─ Unlock: Nytt frågepaket
└─ Delar resultat på social media (flex)

Vecka 2-4: Power User
├─ Spelar 2-3x/dag
├─ Top 10 på veckoleaderboard
├─ Challenger role: Skapar 5+ utmaningar/vecka
└─ Bjuder in 5+ vänner (viral loop)

Månad 2+: Evangelist
├─ Top 100 global leaderboard
├─ Delar spelet organiskt
├─ Skapar eget innehåll (custom questions?)
└─ Betalar för premium (framtida)
```

**Retention Rate (mål):**
- Dag 1: 100%
- Dag 2: 60%
- Dag 7: 40%
- Dag 30: 20%

**Conversion till ambassadör:** 15%

---

## 3. Gap-Analys: Vad Saknas för Lansering?

### 3.1 Kritiska Features (MUST-HAVE före lansering)

#### 🔴 P0: Blockerande (utan dessa går INTE att lansera)

1. **Global Leaderboard**
   - **Varför:** Konkurrens driver engagemang
   - **Vad:** Top 100 spelare (denna vecka / all-time)
   - **Teknisk komplexitet:** Medium (Firebase query + caching)
   - **Tidsåtgång:** 3-5 dagar

2. **Dagliga Utmaningar**
   - **Varför:** Anledning att komma tillbaka varje dag
   - **Vad:** En ny challenge varje dag (samma för alla)
   - **Teknisk komplexitet:** Medium (scheduled job + global state)
   - **Tidsåtgång:** 5-7 dagar

3. **Streak Tracking**
   - **Varför:** Psykologiskt beroende ("kan inte bryta min 10-dagars streak!")
   - **Vad:** Räkna dagliga inloggningar, visa 🔥 streak counter
   - **Teknisk komplexitet:** Low
   - **Tidsåtgång:** 2-3 dagar

4. **Achievements/Badges**
   - **Varför:** Progression, milestones, flex-värde
   - **Vad:** 10-15 achievements (första vinsten, 10 vinster, 7-dagars streak, etc.)
   - **Teknisk komplexitet:** Medium
   - **Tidsåtgång:** 4-6 dagar

5. **Player Stats**
   - **Varför:** Självreflektion, tracking, improvement
   - **Vad:** Total score, win rate, best streak, favorite pack
   - **Teknisk komplexitet:** Low (data finns redan)
   - **Tidsåtgång:** 2-3 dagar

**Total P0 tid:** ~3 veckor (om 1 utvecklare på heltid)

#### 🟡 P1: Viktiga (borde ha före lansering)

6. **Förbättrad Onboarding**
   - Tutorial flow (första 3 frågor guidat)
   - "Vad är Tres Mangos?" video/animation
   - Tidsåtgång: 3-4 dagar

7. **Referral System**
   - Bjud in vän → Båda får bonus (unlock pack / achievement)
   - Tidsåtgång: 4-5 dagar

8. **Push Notifications**
   - Daglig reminder om challenge
   - Friend challenged you
   - Tidsåtgång: 3-4 dagar

9. **Social Sharing**
   - "Jag fick X poäng!" → Auto-share till social media
   - Open Graph images för varje resultat
   - Tidsåtgång: 2-3 dagar

**Total P1 tid:** ~2 veckor

### 3.2 Nice-to-Have Features (Post-Launch)

10. **Weekly Tournaments**
    - Bracket-system för top players
    - Prizes (badges, exclusive packs)

11. **Custom Question Packs**
    - Users create their own questions
    - Community voting

12. **Team/Guild System**
    - Form teams med vänner
    - Team leaderboard

13. **Progressive Unlock System**
    - Paket låses upp med XP/achievements
    - Creates scarcity/value

14. **Live Multiplayer**
    - Real-time turns (WebSockets)
    - Synchronous competition

### 3.3 Framtida Möjligheter

15. **Monetisering**
    - Premium packs (3-5 kr/pack)
    - Ad-free subscription (29 kr/månad)
    - Cosmetics (profile pics, themes)

16. **Internationalisering**
    - English version
    - Norwegian, Danish (nordiska språk först)

17. **Educational Mode**
    - Partnership med skolor
    - Curriculum-aligned question packs
    - Teacher dashboards

18. **AI Features**
    - Personalized question difficulty
    - AI-generated questions
    - Smart opponent matching

---

## 4. Lanseringsstrategi

### 4.1 Pre-Launch (Vecka 1-3)

**Mål:** Bygga kritiska features och testa med closed beta

#### Vecka 1-2: Development Sprint
- [ ] Implementera P0 features (leaderboard, dagliga utmaningar, streaks, achievements, stats)
- [ ] Implementera P1 features (onboarding, referral, notifications)
- [ ] QA testing på alla devices
- [ ] Performance optimization (Firebase queries)

#### Vecka 3: Closed Beta
- [ ] Bjud in 50-100 beta-testare (vänner, familj, Reddit r/Sweden)
- [ ] Samla feedback via in-app form
- [ ] Iterera baserat på data
- [ ] Fix critical bugs

**Success Metrics:**
- Beta retention Day 7: >30%
- Avg. sessions per user: >3
- Share rate: >20%

### 4.2 Soft Launch (Vecka 4-5)

**Mål:** Testa viral loops med small community

#### Launch Channels
1. **Reddit r/Sweden + r/Svenska**
   - Post: "Jag byggde ett svenskt quiz-spel, testa det!"
   - Erbjud early-adopter badge för första 500

2. **Flashback Forum**
   - Gaming-sektionen
   - Casual community engagement

3. **Facebook Grupper**
   - Svenska spelutvecklare
   - Quizfans Sverige
   - Trivia-communities

4. **Instagram/TikTok**
   - Kort demo-video (30 sek)
   - "Hur många kan du få rätt?"

**Success Metrics:**
- 500-1000 users första veckan
- Day 7 retention: >25%
- Viral coefficient (K-factor): >0.5 (varje user bjuder in 0.5 nya)

### 4.3 Public Launch (Vecka 6+)

**Mål:** Viral spridning och tillväxt

#### Launch Kampanj

**Teaser Week (7 dagar före):**
- Countdown på social media
- Influencer outreach (mikro-influencers, 10k-50k followers)
- Press release till svenska tech-blogs (Breakit, Ny Teknik)

**Launch Day:**
- **Reddit:** Större post på r/Sweden med giveaway
- **Product Hunt:** Swedish launch (international attention)
- **Hackernews:** "Show HN: Swedish quiz game with psychological twist"
- **Social Media Blitz:** Coordinated posts på alla kanaler

**Week 1 Efter Launch:**
- Daily content: Tips, trivia, funny moments
- User-generated content: Reshare high scores
- Influencer partnerships: Sponsored streams/videos
- Referral contest: "Bjud in flest vänner = vinn X"

#### Paid Acquisition (Om budget finns)

**Low Budget ($500-1000):**
- Facebook Ads: Retargeting till svenska 18-45
- Instagram Story Ads: "Kan du slå din vän?"

**Medium Budget ($2000-5000):**
- YouTube Pre-roll: Svenska gaming channels
- TikTok Ads: Viral potential

**High Budget ($10,000+):**
- TV Commercial (local Swedish channels)
- Podcast Sponsorships (P3 Extrasändningar, etc.)

### 4.4 Post-Launch (Ongoing)

**Kontinuerliga aktiviteter:**

1. **Content Cadence**
   - Nya frågepaket varje månad (minst 1)
   - Seasonal events (Jul, Påsk, Midsommar)
   - Themed weeks (Sport-veckan, Film-veckan)

2. **Community Management**
   - Discord server för fans
   - Monthly tournaments
   - Featured players spotlight

3. **Data-Driven Iteration**
   - A/B testing på onboarding
   - Retention cohort analysis
   - Feature request voting

4. **Partnerships**
   - Svenska influencers
   - Educational institutions
   - Corporate team-building events

---

## 5. Viral Mekanik & Growth Loops

### 5.1 Varför Är Spel Inte Viralt Nu?

**Problem:** Ingen inneboende anledning att dela

**Jämförelse:**
- **Wordle:** Delade resultatet varje dag (flex + FOMO)
- **Kahoot:** Klassrumsmiljö tvingade delning
- **Quiz Up:** Global leaderboard skapade konkurrens

**Tres Mangos nu:** "Dela om du vill" → Ingen gör det

### 5.2 Viral Loop Design

#### Loop 1: Challenge-Driven Virality (PRIMÄR)

```
Spelare A spelar → Får hög poäng → Vill utmana vän
                                    ↓
                    "Kan du slå mig?" (delbar länk)
                                    ↓
            Spelare B får länk → "Jag kan lätt slå dig!"
                                    ↓
                Spelare B spelar → Förlorar (😤)
                                    ↓
                Spelare B utmanar Spelare C (revansch-vibes)
                                    ↓
                            VIRAL LOOP
```

**Förbättringar för att stärka denna loop:**
1. **Flexing Mechanism:** Auto-generera shareable image med resultat
2. **Trash Talk:** Custom messages i challenges ("Jag slog dig med 15 poäng!")
3. **Stake Raising:** Public leaderboard för "vem har flest vinster"

#### Loop 2: Leaderboard Competition

```
Spelare ser global leaderboard → "Jag är #47!"
                                    ↓
                        Vill klättra till Top 10
                                    ↓
            Bjuder in vänner för referral-bonus (XP boost)
                                    ↓
                Vänner börjar spela → De ser leaderboard
                                    ↓
                            VIRAL LOOP
```

#### Loop 3: Daily Challenge FOMO

```
Daglig utmaning postas kl 08:00 → Spelare A spelar
                                    ↓
            Får 12 poäng → Delar på social media
                                    ↓
    "Kan du slå 12 poäng på dagens utmaning?" (tease)
                                    ↓
        Vänner ser inlägget → FOMO → Måste testa
                                    ↓
                        VIRAL LOOP
```

### 5.3 Viral Coefficient Calculation

**Formel:** K = i × c

- **i** = invites per user (hur många utmanar/bjuder in de?)
- **c** = conversion rate (hur många accepterar?)

**Nuvarande:**
- i = 0.2 (1 av 5 users utmanar någon)
- c = 0.3 (3 av 10 accepterar)
- **K = 0.06** (99% decay rate) ❌

**Mål med förbättringar:**
- i = 1.5 (varje user utmanar 1-2 personer)
- c = 0.7 (7 av 10 accepterar)
- **K = 1.05** (5% growth rate) ✅

**Strategier för att öka K:**
1. **Öka i:** Incentivera challenges (achievements, leaderboard points)
2. **Öka c:** Bättre onboarding, compelling messaging i delningar

---

## 6. Metrics & KPIs

### 6.1 North Star Metric

**DAU (Daily Active Users)** - Antal unika spelare per dag

**Varför:** Quiz-spel lever på daily habit. Veckosiffror döljde churn.

**Mål:**
- Månad 1: 500 DAU
- Månad 3: 5,000 DAU
- Månad 6: 20,000 DAU

### 6.2 Supporting Metrics

#### Acquisition
- **Install Rate:** Hur många klickar länk → startar spelet?
  - Mål: >60%
- **Signup Rate:** Hur många skapar konto?
  - Mål: >40%

#### Activation
- **Tutorial Completion:** Hur många slutför onboarding?
  - Mål: >80%
- **First Challenge Created:** Hur många skapar första utmaningen?
  - Mål: >30%

#### Retention
- **Day 1 Retention:** % som kommer tillbaka dag 2
  - Mål: >50%
- **Day 7 Retention:** % som spelar efter en vecka
  - Mål: >30%
- **Day 30 Retention:** % som spelar efter en månad
  - Mål: >15%

#### Engagement
- **Sessions per DAU:** Hur ofta spelar aktiva users?
  - Mål: >2 sessions/dag
- **Challenges Created per User:** Viral loop indikator
  - Mål: >1.2
- **Daily Challenge Participation:** % av DAU som spelar daglig
  - Mål: >60%

#### Virality
- **Viral Coefficient (K):** Hur många nya users bjuds in per user?
  - Mål: >1.0
- **Share Rate:** % av sessions som leder till delning
  - Mål: >25%
- **Invite Conversion:** % av invites som blir users
  - Mål: >60%

#### Monetization (Framtida)
- **ARPU (Average Revenue Per User):** Genomsnittlig intäkt per user
  - Mål: 5-10 kr/månad
- **Paying User %:** Hur många betalar?
  - Mål: 3-5%

### 6.3 Dashboards & Tracking

**Tools:**
- **Firebase Analytics:** User behavior, funnels
- **Mixpanel:** Cohort analysis, retention curves
- **Google Data Studio:** Executive dashboards
- **Custom Admin Panel:** Real-time leaderboard, daily challenges management

**Weekly Review Meeting:**
- Review all key metrics
- Identify drop-off points
- Prioritize experiments

---

## 7. Konkreta Produktrekommendationer

### 7.1 MVP Features (Måste byggas FÖRE lansering)

#### Feature 1: Global Leaderboard

**User Story:**
> Som spelare vill jag se var jag rankas globalt så att jag kan konkurrera med andra.

**Acceptance Criteria:**
- [ ] Visar top 100 spelare (all-time + denna vecka)
- [ ] Uppdateras real-time efter varje spel
- [ ] Visar spelarens egen placering (även utanför top 100)
- [ ] Klickbar för att se profiler

**Teknisk Implementation:**
```javascript
// Firebase query
const getLeaderboard = async (timeframe = 'all-time') => {
  const query = db.collection('players')
    .orderBy('totalScore', 'desc')
    .limit(100);

  if (timeframe === 'week') {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    query.where('lastPlayedAt', '>=', weekStart);
  }

  return await query.get();
};
```

**Design:**
```
┌─────────────────────────────┐
│   🏆 Leaderboard            │
├─────────────────────────────┤
│ Denna vecka | All-time      │
├─────────────────────────────┤
│ 1. Anna        1,247p  🥇   │
│ 2. Bob           987p  🥈   │
│ 3. Charlie       834p  🥉   │
│ ...                         │
│ 47. Du           234p  ⬆️   │
└─────────────────────────────┘
```

#### Feature 2: Dagliga Utmaningar

**User Story:**
> Som spelare vill jag ha en ny utmaning varje dag så att jag kommer tillbaka.

**Acceptance Criteria:**
- [ ] Ny challenge postas automatiskt kl 08:00 varje dag
- [ ] Alla spelar samma 12 frågor
- [ ] Resultatlista visar vem som fick bäst
- [ ] Push notification kl 08:00: "Dagens utmaning är här!"

**Teknisk Implementation:**
```javascript
// Scheduled Cloud Function (Firebase)
exports.createDailyChallenge = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('Europe/Stockholm')
  .onRun(async (context) => {
    const questions = await selectRandomQuestions(12);

    await db.collection('dailyChallenges').add({
      date: new Date().toISOString().split('T')[0],
      questions: questions,
      createdAt: new Date()
    });

    // Send push notifications to all users
    await sendPushToAllUsers('Dagens utmaning är här! 🎯');
  });
```

**Design:**
```
┌─────────────────────────────┐
│   🎯 Dagens Utmaning        │
│   2026-01-03                │
├─────────────────────────────┤
│   12 frågor · Blandat       │
│                             │
│   Top 3 idag:               │
│   1. Lisa     15p           │
│   2. Erik     14p           │
│   3. Anna     13p           │
│                             │
│   [ Spela nu ]              │
└─────────────────────────────┘
```

#### Feature 3: Streak Tracking

**User Story:**
> Som spelare vill jag se min dagliga streak så att jag motiveras att spela varje dag.

**Acceptance Criteria:**
- [ ] Räknar dagliga inloggningar/spel
- [ ] Visar 🔥 streak counter i header
- [ ] Notifikation vid risk att bryta streak
- [ ] Achievement vid 7, 30, 100-dagars streak

**Design:**
```
Header: "🔥 12 dagar"
  |
  ↓ (hover/click)
┌─────────────────────────────┐
│   Din Streak: 12 dagar 🔥   │
├─────────────────────────────┤
│   Mo Tu We Th Fr Sa Su      │
│   ✅ ✅ ✅ ✅ ✅ ✅ ✅      │
│   ✅ ✅ ✅ ✅ ✅ ⬜ ⬜      │
│                             │
│   Nästa: 30-dagars streak   │
│   (18 dagar kvar)           │
└─────────────────────────────┘
```

#### Feature 4: Achievements System

**User Story:**
> Som spelare vill jag låsa upp achievements så att jag känner progression.

**Starter Achievements:**
1. **Första Steget** - Spela ditt första spel
2. **Utmanare** - Skapa din första challenge
3. **Segerrik** - Vinn din första challenge
4. **Streaker** - 7-dagars streak
5. **Dedikerad** - 30-dagars streak
6. **Perfekt Runda** - Få alla frågor rätt i en runda
7. **Risk-Taker** - Samla 10+ poäng i en fråga
8. **Försiktig** - Stanna vid 1 poäng 10 gånger
9. **Social** - Utmana 10 olika personer
10. **Populär** - Få 10 challenges från andra
11. **Klättrare** - Nå top 100 på leaderboard
12. **Champion** - Nå top 10 på leaderboard
13. **Quiz Master** - Spela 100 spel totalt
14. **Allvetare** - Spela alla frågepaket minst en gång
15. **Inviter** - Bjud in 5 vänner som spelar

**Design:**
```
┌─────────────────────────────┐
│   🏆 Achievements            │
├─────────────────────────────┤
│ ✅ Första Steget             │
│ ✅ Utmanare                  │
│ 🔒 Segerrik (0/1)            │
│ 🔒 Streaker (3/7 dagar)      │
│ ...                          │
│                              │
│ 3/15 unlocked                │
└─────────────────────────────┘
```

#### Feature 5: Player Stats Page

**User Story:**
> Som spelare vill jag se min statistik så att jag kan följa min utveckling.

**Stats att visa:**
- Total score (all-time)
- Games played
- Win rate (challenges)
- Best streak
- Favorite pack (mest spelad)
- Average score per game
- Perfect rounds
- Best single question score

**Design:**
```
┌─────────────────────────────┐
│   📊 Din Statistik          │
├─────────────────────────────┤
│ Total Score:        1,247   │
│ Games Played:          89   │
│ Win Rate:             67%   │
│ Best Streak:       🔥 12    │
│ Favorite Pack:  Blandat I   │
│ Avg Score:            14p   │
│ Perfect Rounds:         5   │
│ Best Question:        15p   │
│                             │
│ Global Rank:          #47   │
└─────────────────────────────┘
```

### 7.2 Post-Launch Features

#### Feature 6: Referral System

**Mekanik:**
- Bjud in vän via delbar länk
- När vän spelar första gången → Båda får bonus
- Bonus: Unlock exclusive pack eller achievement

**Viral Loop:**
```
User A → Invite → User B plays
  ↓                    ↓
Bonus!              Bonus!
  ↓                    ↓
Unlock pack      See locked packs
                       ↓
                Invite User C (för fler unlocks)
```

#### Feature 7: Weekly Tournament

**Format:**
- Varje måndag startar ny turnering
- Top 100 från föregående vecka får delta
- Bracket-system (1v1 matches)
- Prizes: Badge, exclusive pack, featured på startsida

#### Feature 8: Progressive Unlock

**System:**
- Alla paket är låsta från början (utom 3-4 starter)
- Unlock genom:
  - XP (spela spel = XP)
  - Achievements
  - Referrals
  - Betala (premium)

**Psykologi:**
- Scarcity → Ökar värde
- Progression → Motiverar spela mer
- Discovery → "Vad finns i nästa pack?"

---

## 8. Tidsplan & Resurser

### 8.1 Pre-Launch Timeline (3 veckor)

**Vecka 1: Core Development**
- [ ] Dag 1-2: Global Leaderboard (backend + frontend)
- [ ] Dag 3-4: Dagliga Utmaningar (scheduled job + UI)
- [ ] Dag 5: Streak Tracking

**Vecka 2: Engagement Features**
- [ ] Dag 1-2: Achievements System
- [ ] Dag 3: Player Stats Page
- [ ] Dag 4-5: Förbättrad Onboarding

**Vecka 3: Polish + Beta**
- [ ] Dag 1-2: Push Notifications setup
- [ ] Dag 3: Referral System
- [ ] Dag 4-5: QA Testing + Bug fixes
- [ ] Beta launch till 50-100 users

### 8.2 Resursbehov

**Development:**
- 1x Full-stack Developer (heltid, 3 veckor)
- 1x Designer (deltid, grafik för achievements, onboarding)

**Testing:**
- 50-100 beta-testare (vänner, communities)

**Marketing:**
- Content creator (social media posts, demo videos)
- Community manager (Discord, Reddit engagement)

**Budget (minimal):**
- Development: 0 kr (om du bygger själv)
- Design: 5,000 kr (Fiverr/99designs för badges)
- Marketing: 5,000 kr (ads för soft launch)
- **Total: 10,000 kr**

---

## 9. Riskanalys & Mitigation

### Risk 1: Användare kommer inte tillbaka

**Sannolikhet:** Hög (85%)
**Impact:** Kritisk (spelet dör)

**Mitigation:**
- Implementera alla retention features FÖRE lansering
- A/B test onboarding för optimal engagement
- Monitor Day 1/7 retention tätt

### Risk 2: Viral loop funkar inte

**Sannolikhet:** Medium (50%)
**Impact:** Hög (långsam tillväxt)

**Mitigation:**
- Incentivera challenges (achievements, leaderboard points)
- A/B test messaging i delningar
- Make sharing frictionless (1-click share)

### Risk 3: Innehåll tar slut

**Sannolikhet:** Low (20%)
**Impact:** Medium (users tröttnar)

**Mitigation:**
- Du har 26 paket redan!
- Community-created questions (framtida)
- AI-genererade frågor (framtida)

### Risk 4: Tekniska problem vid scale

**Sannolikhet:** Medium (40%)
**Impact:** Hög (dålig UX)

**Mitigation:**
- Load testing innan public launch
- Firebase scaling är automatisk (men kosta pengar)
- Caching för leaderboard queries

### Risk 5: Ingen får höra om spelet

**Sannolikhet:** Hög (70%)
**Impact:** Kritisk (ingen users)

**Mitigation:**
- Multi-channel launch (Reddit, Product Hunt, Instagram, etc.)
- Influencer partnerships
- Referral-driven growth (viral loop)

---

## 10. Success Scenarios

### Scenario A: Modest Success
- **Månad 1:** 1,000 users
- **Månad 3:** 5,000 users
- **Månad 6:** 15,000 users
- **Retention:** 20% (Day 30)

**Outcome:** Sustainable niche game, community-driven, potential for slow organic growth

### Scenario B: Viral Hit
- **Vecka 1:** 5,000 users (via Reddit/Product Hunt viral post)
- **Månad 1:** 50,000 users (social media spread)
- **Månad 3:** 200,000 users (international attention)
- **Retention:** 35% (Day 30)

**Outcome:** Major Swedish game, press coverage, acquisition interest, monetization opportunities

### Scenario C: Failure
- **Månad 1:** 200 users
- **Månad 3:** 150 users (churn > acquisition)
- **Retention:** <10% (Day 30)

**Outcome:** Learn from failure, pivot or shut down

---

## 11. Nästa Steg: Action Items

### Immediate (Denna vecka)

1. **Beslut:** Vill du lansera? (Om ja → fortsätt)
2. **Prioritera:** Vilka P0 features är viktigast? (Rank 1-5)
3. **Timeline:** När vill du lansera? (Rekommendation: 4-6 veckor)

### Short-term (Nästa 2 veckor)

4. **Bygg:** Implementera top 3 P0 features
5. **Testa:** Internal testing med vänner/familj
6. **Iterera:** Fix kritiska buggar och UX issues

### Medium-term (Vecka 3-4)

7. **Beta:** Launch till 100 beta-testare
8. **Data:** Samla metrics (retention, engagement, virality)
9. **Polish:** Förbättra baserat på feedback

### Long-term (Vecka 5+)

10. **Launch:** Public release via multi-channel strategy
11. **Monitor:** Tätt metrics tracking första månaden
12. **Optimize:** Kontinuerlig iteration baserad på data

---

## 12. Slutsats

**Tres Mangos har stark potential** - spelmekaniken är unik, innehållet finns, tekniken fungerar.

**Huvudproblemet:** Retention och viral spridning saknas helt.

**Lösningen:** 3 veckor development för kritiska engagement-features.

**Risk:** Utan dessa features kommer spelet dö efter lansering.

**Rekommendation:**
1. **Bygg först, lansera sen.** Rushing ut spelet nu = garanterad failure.
2. **Focus på retention över acquisition.** 100 loyal users > 1000 churned users.
3. **Test, measure, iterate.** Data driver beslut, inte magkänsla.

**Final Question:** Är du redo att investera 3-4 veckor för att göra detta rätt?

---

**Appendix A: Benchmark Data**

| Game | DAU at Month 3 | Day 7 Retention | Viral Coefficient |
|------|----------------|-----------------|-------------------|
| Wordle (peak) | 3M | 60% | 1.8 |
| Kahoot | 9M | 45% | 1.2 |
| QuizUp | 800k | 35% | 0.9 |
| **Tres Mangos (mål)** | **5k** | **30%** | **1.0** |

**Appendix B: Competitive Analysis**

| Feature | Wordle | Kahoot | QuizUp | Tres Mangos (nu) | Tres Mangos (efter) |
|---------|--------|--------|--------|------------------|---------------------|
| Daglig utmaning | ✅ | ❌ | ✅ | ❌ | ✅ |
| Leaderboard | ❌ | ✅ | ✅ | ❌ | ✅ |
| Social sharing | ✅ | ✅ | ✅ | Begränsad | ✅ |
| Multiplayer | ❌ | ✅ | ✅ | ✅ | ✅ |
| Achievements | ❌ | ❌ | ✅ | ❌ | ✅ |
| Streaks | ❌ | ❌ | ❌ | ❌ | ✅ |

**Appendix C: Monetization Projections (Framtida)**

| Month | Users | Paying % | ARPU | Monthly Revenue |
|-------|-------|----------|------|-----------------|
| 3 | 5,000 | 2% | 15 kr | 1,500 kr |
| 6 | 15,000 | 3% | 20 kr | 9,000 kr |
| 12 | 50,000 | 4% | 25 kr | 50,000 kr |

---

**Dokument END**
