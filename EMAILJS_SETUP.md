# EmailJS Setup för Ordna Game Challenge Feature

För att aktivera automatisk e-postutskick för challenge-funktionen behöver du konfigurera EmailJS.

## Steg 1: Skapa EmailJS Konto

1. Gå till [EmailJS.com](https://www.emailjs.com/)
2. Registrera ett gratis konto
3. Bekräfta din e-postadress

## Steg 2: Konfigurera Email Service

1. I EmailJS dashboard, gå till "Email Services"
2. Klicka "Add New Service"
3. Välj din e-postleverantör (Gmail, Outlook, etc.)
4. Följ instruktionerna för att koppla ditt e-postkonto
5. Kopiera Service ID

## Steg 3: Skapa Email Templates

### Template 1: Challenge Invitation
1. Gå till "Email Templates"
2. Klicka "Create New Template"
3. Använd denna mall:

```
Subject: {{challenger_name}} utmanar dig till {{game_name}}!

Hej!

{{challenger_name}} har utmanat dig till en runda {{game_name}}!

{{personal_message}}

Klicka här för att acceptera utmaningen:
{{challenge_url}}

Lycka till!

---
Detta meddelande skickades automatiskt från {{game_name}}
```

4. Kopiera Template ID

### Template 2: Result Notification
1. Skapa en andra template med ID "result_template_id"
2. Använd denna mall:

```
Subject: {{challenger_name}} slutförde din utmaning i {{game_name}}!

Hej!

{{challenger_name}} har slutfört din utmaning i {{game_name}}!

Resultat:
- Slutpoäng: {{friend_score}} poäng
- Antal frågor: {{total_questions}}

Vill du utmana tillbaka? Spela här: [Din spelwebbplats URL]

---
Detta meddelande skickades automatiskt från {{game_name}}
```

## Steg 4: Konfigurera Spelet

1. Öppna `js/game.js`
2. Hitta `EMAILJS_CONFIG` objektet
3. Ersätt placeholders med dina värden:

```javascript
const EMAILJS_CONFIG = {
    serviceId: 'din_service_id',        // Från steg 2
    templateId: 'din_template_id',      // Från steg 3, template 1
    publicKey: 'din_public_key'         // Från Account settings
};
```

## Steg 5: Hämta Public Key

1. I EmailJS dashboard, gå till "Account"
2. Kopiera din Public Key
3. Klistra in i konfigurationen

## Testning

1. Efter konfiguration, testa challenge-funktionen
2. Skicka en utmaning till dig själv
3. Kontrollera att både invite och result emails fungerar

## Felsökning

- **Email skickas inte**: Kontrollera att alla IDs är korrekta
- **Template fel**: Se till att template variablerna matchar kod
- **Service fel**: Verifiera att e-posttjänsten är korrekt konfigurerad

## Säkerhet

- Public Key är säker att exponera i frontend-kod
- Service ID och Template ID är också säkra
- Behöver inte dölja dessa värden

## Kostnad

- EmailJS Free tier: 200 emails/månad
- För mer trafik, uppgradera till betald plan

## Backup Solution

Om EmailJS inte konfigureras kommer spelet att:
- Visa en delbar länk istället för att skicka e-post
- Logga resultat till konsolen
- Fortsätta fungera i "demo mode"