# E-Mail Service Konfiguration

Dieser Leitfaden beschreibt die Einrichtung des E-Mail-Services für die E-Mail-Verifizierung bei der Unternehmensregistrierung.

## Übersicht

Das System unterstützt zwei E-Mail-Service-Modi:

1. **Mock Email Service** (Standard, Development)
   - E-Mails werden in die Konsole geloggt, aber nicht versendet
   - Perfekt für lokale Entwicklung und Tests
   - Keine SMTP-Konfiguration erforderlich

2. **SMTP Email Service** (Production)
   - Echte E-Mails werden über einen SMTP-Server versendet
   - Unterstützt alle gängigen SMTP-Provider (Gmail, Outlook, SendGrid, etc.)
   - Professionelle HTML-E-Mail-Templates in Deutsch

## E-Mail-Templates

Das System versendet folgende E-Mails:

### 1. E-Mail-Verifizierung
- **Trigger**: Beim Start der Registrierung (`POST /api/company/register/start`)
- **Inhalt**: Verifizierungslink mit 24h Gültigkeit
- **Design**: Moderne HTML-E-Mail mit Gradient-Header und CTA-Button

### 2. Registrierungs-Bestätigung
- **Trigger**: Nach erfolgreicher Einreichung zur Überprüfung
- **Inhalt**: Bestätigung der Einreichung mit Registrierungs-ID und nächsten Schritten
- **Design**: Success-Theme mit Timeline der nächsten Schritte

### 3. Status-Update
- **Trigger**: Bei Änderung des Registrierungsstatus (Genehmigt/Abgelehnt)
- **Inhalt**: Neuer Status mit optionalen Anmerkungen
- **Design**: Dynamische Farben basierend auf Status

## Konfiguration

### Option 1: Mock Email Service (Development)

Standardmäßig aktiviert. Keine Konfiguration erforderlich!

```bash
# In .env oder als Umgebungsvariable
USE_MOCK_EMAIL_SERVICE=true
```

**Vorteile:**
- ✅ Keine SMTP-Credentials erforderlich
- ✅ Schnelles Testen ohne echte E-Mails
- ✅ E-Mail-Inhalte in Console-Logs sichtbar

### Option 2: SMTP Email Service (Production)

#### Gmail Konfiguration (Empfohlen für Tests)

1. **Google-Konto vorbereiten:**
   - Aktivieren Sie die 2-Faktor-Authentifizierung: https://myaccount.google.com/security
   - Erstellen Sie ein App-Passwort: https://myaccount.google.com/apppasswords
   - Notieren Sie das 16-stellige App-Passwort

2. **Umgebungsvariablen konfigurieren:**

```bash
# .env Datei
USE_MOCK_EMAIL_SERVICE=false

EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=ihre-email@gmail.com
EMAIL_SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-stelliges App-Passwort
EMAIL_SMTP_ENABLE_SSL=true

EMAIL_FROM_ADDRESS=noreply@ihredomain.com
EMAIL_FROM_NAME=JobStream

EMAIL_VERIFICATION_URL_BASE=https://ihredomain.com/register/verify
```

3. **Application starten:**

```bash
cd apps/api
dotnet run
```

**Konsolen-Output:**
```
Using SmtpEmailService - SMTP Host: smtp.gmail.com
```

#### Andere SMTP-Provider

##### Microsoft Outlook/Office 365

```bash
EMAIL_SMTP_HOST=smtp.office365.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=ihre-email@outlook.com
EMAIL_SMTP_PASSWORD=ihr-passwort
EMAIL_SMTP_ENABLE_SSL=true
```

##### SendGrid (Professioneller E-Mail-Service)

```bash
EMAIL_SMTP_HOST=smtp.sendgrid.net
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=apikey
EMAIL_SMTP_PASSWORD=SG.ihre-sendgrid-api-key
EMAIL_SMTP_ENABLE_SSL=true
```

**Vorteile von SendGrid:**
- ✅ Bessere Zustellbarkeit
- ✅ E-Mail-Analytics
- ✅ Keine Daily Limits wie bei Gmail
- ✅ Free Tier: 100 E-Mails/Tag

Anmeldung: https://signup.sendgrid.com/

##### Mailgun

```bash
EMAIL_SMTP_HOST=smtp.mailgun.org
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=postmaster@ihre-domain.mailgun.org
EMAIL_SMTP_PASSWORD=ihre-mailgun-smtp-password
EMAIL_SMTP_ENABLE_SSL=true
```

##### Amazon SES (AWS Simple Email Service)

```bash
EMAIL_SMTP_HOST=email-smtp.eu-central-1.amazonaws.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=ihre-aws-smtp-username
EMAIL_SMTP_PASSWORD=ihre-aws-smtp-password
EMAIL_SMTP_ENABLE_SSL=true
```

## Konfiguration über appsettings.json

Alternativ zur .env-Datei können Sie auch `appsettings.json` verwenden:

```json
{
  "Email": {
    "FromAddress": "noreply@jobstream.com",
    "FromName": "JobStream",
    "VerificationUrlBase": "https://ihredomain.com/register/verify",
    "Smtp": {
      "Host": "smtp.gmail.com",
      "Port": 587,
      "Username": "ihre-email@gmail.com",
      "Password": "xxxx-xxxx-xxxx-xxxx",
      "EnableSsl": true
    },
    "UseMockService": false
  }
}
```

## Testen der E-Mail-Funktionalität

### 1. Mit Mock Service (Development)

```bash
# Terminal 1: API starten
cd apps/api
dotnet run

# Terminal 2: Test-Request
curl -X POST http://localhost:5000/api/company/register/start \
  -H "Content-Type: application/json" \
  -d '{
    "companyEmail": "test@example-company.com",
    "primaryContactName": "Max Mustermann"
  }'
```

**Erwartetes Ergebnis:** E-Mail-Inhalt erscheint in den Console-Logs

### 2. Mit SMTP Service (Production)

```bash
# .env konfigurieren
USE_MOCK_EMAIL_SERVICE=false
EMAIL_SMTP_USERNAME=ihre-email@gmail.com
EMAIL_SMTP_PASSWORD=ihr-app-password

# API starten
dotnet run

# Test-Request mit echter E-Mail
curl -X POST http://localhost:5000/api/company/register/start \
  -H "Content-Type: application/json" \
  -d '{
    "companyEmail": "ihr-test-account@gmail.com",
    "primaryContactName": "Test User"
  }'
```

**Erwartetes Ergebnis:**
- HTTP 201 Created Response
- E-Mail landet im Posteingang von `ihr-test-account@gmail.com`

## Troubleshooting

### Problem: "SMTP error: Authentication failed"

**Lösung für Gmail:**
- Prüfen Sie, ob 2-Faktor-Authentifizierung aktiviert ist
- Verwenden Sie ein **App-Passwort**, nicht Ihr normales Gmail-Passwort
- App-Passwort erstellen: https://myaccount.google.com/apppasswords

### Problem: "SMTP error: Connection timeout"

**Mögliche Ursachen:**
- Firewall blockiert Port 587
- SMTP_HOST ist falsch
- ISP blockiert ausgehende SMTP-Verbindungen

**Lösungen:**
- Port 587 (TLS) oder 465 (SSL) verwenden
- Alternativen Port 2525 testen (SendGrid)
- VPN oder anderen Netzwerk-Provider verwenden

### Problem: E-Mails landen im Spam

**Lösungen:**
- Verwenden Sie einen professionellen E-Mail-Service (SendGrid, Mailgun)
- Konfigurieren Sie SPF, DKIM und DMARC DNS-Records
- Verwenden Sie eine verifizierte Domain als FROM-Adresse
- Fügen Sie eine Abmelde-Link hinzu (für Newsletter)

### Problem: "Rate limit exceeded" (Gmail)

**Gmail Limits:**
- 500 E-Mails/Tag für kostenlose Accounts
- 2000 E-Mails/Tag für Google Workspace

**Lösung:**
- Wechseln zu SendGrid (100 E-Mails/Tag kostenlos)
- Oder Mailgun, Amazon SES für höhere Volumes

## Best Practices

### Sicherheit

1. **Niemals Passwörter in appsettings.json committen**
   ```bash
   # Verwenden Sie .env Dateien (bereits in .gitignore)
   cp .env.example .env
   # Tragen Sie Ihre Credentials in .env ein
   ```

2. **App-Passwörter verwenden** (Gmail, Outlook)
   - Nicht Ihr Haupt-Passwort verwenden
   - App-Passwörter können einzeln widerrufen werden

3. **Umgebungsvariablen in Production**
   ```bash
   # Docker
   docker run -e EMAIL_SMTP_PASSWORD=secret ...

   # Kubernetes
   kubectl create secret generic email-credentials \
     --from-literal=password='secret'
   ```

### Performance

1. **Async E-Mail-Versand** (bereits implementiert)
   - E-Mails werden asynchron versendet
   - API-Response wartet nicht auf E-Mail-Versand

2. **Background Jobs für große Volumes** (optional)
   - Für > 1000 E-Mails/Tag: Hangfire oder Azure Functions verwenden
   - E-Mails in Queue packen und asynchron verarbeiten

### Monitoring

```csharp
// Logs überprüfen
dotnet run | grep "Sending email"

// Erfolgreiche E-Mails
dotnet run | grep "Email sent successfully"

// Fehler
dotnet run | grep "SMTP error"
```

## E-Mail-Template Anpassungen

Die E-Mail-Templates befinden sich in:
```
apps/api/Services/SmtpEmailService.cs
```

### Template-Features:

- ✅ Responsive Design (Mobile & Desktop)
- ✅ Inline CSS (kompatibel mit allen E-Mail-Clients)
- ✅ Gradient-Header mit Firmenbranding
- ✅ CTA-Buttons mit Hover-Effekten
- ✅ Fallback für Nur-Text-E-Mails
- ✅ Deutsche Sprache
- ✅ Professionelles Layout

### Template anpassen:

```csharp
// In SmtpEmailService.cs, Methode SendEmailVerificationAsync
var htmlBody = $@"
<!DOCTYPE html>
<html lang=""de"">
<head>
    <meta charset=""UTF-8"">
    <title>Ihre Custom-Subject</title>
</head>
<body style=""..."">
    <!-- Ihr Custom HTML hier -->
</body>
</html>";
```

## Nächste Schritte

1. ✅ Mock Email Service testen (bereits konfiguriert)
2. ✅ SMTP-Credentials für Production bereitstellen
3. ✅ E-Mail-Versand in Production testen
4. 📧 SPF/DKIM/DMARC für eigene Domain konfigurieren (Optional)
5. 📊 E-Mail-Analytics einrichten (SendGrid Dashboard)

## Support

Bei Fragen oder Problemen:
- Logs prüfen: `dotnet run | grep -i email`
- SMTP-Verbindung testen: `telnet smtp.gmail.com 587`
- Dokumentation: https://learn.microsoft.com/en-us/dotnet/api/system.net.mail

---

**Erstellt**: 2025-11-21
**Letzte Aktualisierung**: 2025-11-21
**Version**: 1.0
