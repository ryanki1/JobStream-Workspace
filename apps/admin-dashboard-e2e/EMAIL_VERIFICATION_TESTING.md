# E-Mail-Verifizierung - Testing Guide

Dieser Guide beschreibt, wie Sie die E-Mail-Verifizierungs-Komponente testen können.

## Übersicht

Die E-Mail-Verifizierung ist der zweite Schritt im Registrierungsprozess:

1. **Benutzer startet Registrierung** → E-Mail mit Verifizierungslink wird gesendet
2. **Benutzer klickt auf Link** → Wird zu `/register/verify?id={registrationId}&token={token}` weitergeleitet
3. **Komponente verifiziert E-Mail** → API-Aufruf an `/api/company/register/verify-email`
4. **Erfolg** → Benutzer kann mit Schritt 3 (Unternehmensdaten) fortfahren

## Komponenten-Struktur

```
apps/admin-dashboard/src/app/components/
├── verify-email.component.ts         # TypeScript Logic
├── verify-email.component.html       # HTML Template
└── verify-email.component.scss       # Styles

apps/admin-dashboard/src/app/services/
└── company-registration.service.ts   # API Service

apps/admin-dashboard-e2e/src/
└── email-verification.spec.ts        # Playwright E2E Tests
```

## Manuelle Tests

### 1. Frontend starten

```bash
# Terminal 1: Admin Dashboard starten
cd /Users/kieryan/Downloads/Nächste\ Stelle/project/jobstream-workspace
npx nx serve admin-dashboard
```

Die Anwendung läuft auf: http://localhost:4200

### 2. Backend API starten

```bash
# Terminal 2: API starten
cd apps/api
dotnet run
```

Die API läuft auf: http://localhost:5000

### 3. Erfolgreiche Verifizierung testen

**Schritt 1: Registrierung starten**

```bash
curl -X POST http://localhost:5000/api/company/register/start \
  -H "Content-Type: application/json" \
  -d '{
    "companyEmail": "test@example-company.com",
    "primaryContactName": "Max Mustermann"
  }'
```

**Response:**
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "initiated",
  "expiresAt": "2025-11-28T10:00:00Z"
}
```

**Schritt 2: Verifizierungstoken aus Logs holen**

Im API-Terminal sollten Sie sehen:
```
MockEmailService: Sending email verification to test@example-company.com
Verification URL: http://localhost:4200/register/verify?token=ABC123...&id=123e4567...
```

**Schritt 3: URL im Browser öffnen**

Kopieren Sie die Verification URL aus den Logs und öffnen Sie sie im Browser.

**Erwartetes Ergebnis:**
- ✅ Spinner erscheint kurz
- ✅ Grünes Häkchen-Icon wird angezeigt
- ✅ "E-Mail erfolgreich bestätigt!" Nachricht
- ✅ Liste der nächsten Schritte
- ✅ Button "Weiter zur Registrierung →"

### 4. Fehlerszenarien testen

#### Abgelaufener Token

```bash
# Öffnen Sie im Browser:
http://localhost:4200/register/verify?id=123e4567-e89b-12d3-a456-426614174000&token=expired-token
```

**Erwartetes Ergebnis:**
- ❌ Rotes X-Icon
- ❌ "Verifizierung fehlgeschlagen" Nachricht
- ❌ Liste möglicher Gründe
- ❌ Button "Neuen Verifizierungslink anfordern"

#### Fehlende Parameter

```bash
# Öffnen Sie im Browser (ohne Query-Parameter):
http://localhost:4200/register/verify
```

**Erwartetes Ergebnis:**
- ⚠️ Gelbes Warnsymbol
- ⚠️ "Ungültiger Link" Nachricht
- ⚠️ Button "Zur Startseite"

## Automatisierte Tests (Playwright)

### Tests ausführen

```bash
# Alle E2E Tests ausführen
npx nx e2e admin-dashboard-e2e

# Nur Email Verification Tests
npx nx e2e admin-dashboard-e2e --spec=email-verification.spec.ts

# Tests im headed mode (sichtbarer Browser)
npx nx e2e admin-dashboard-e2e --headed

# Tests in einem bestimmten Browser
npx nx e2e admin-dashboard-e2e --project=chromium
npx nx e2e admin-dashboard-e2e --project=firefox
npx nx e2e admin-dashboard-e2e --project=webkit

# Debug-Modus mit Playwright Inspector
npx nx e2e admin-dashboard-e2e --debug
```

### Test-Abdeckung

Die Playwright-Tests decken folgende Szenarien ab:

✅ **Erfolgreiche Verifizierung:**
- Loading-State wird angezeigt
- API wird mit korrekten Parametern aufgerufen
- Success-State wird angezeigt
- Registration ID wird in Session Storage gespeichert
- Navigation zu company-details funktioniert

✅ **Fehlerbehandlung:**
- Abgelaufener Token
- Ungültiger Token
- Registrierung nicht gefunden (404)
- Fehlende Query-Parameter
- Fehlende Registration ID
- Fehlender Token
- Netzwerk-Fehler

✅ **UI/UX:**
- Responsive Design (Mobile)
- Button-Interaktionen
- Navigation funktioniert
- Info-Footer wird angezeigt

### Test-Reports

Nach dem Ausführen der Tests wird ein Report generiert:

```bash
# Report im Browser öffnen
npx playwright show-report
```

### Screenshots

Screenshots werden automatisch bei Fehlern erstellt und im `test-results` Ordner gespeichert.

Manuell Screenshots erstellen:

```bash
# Im Test-Code ist bereits ein Mobile-Screenshot implementiert:
test('should be responsive on mobile devices', ...)
# Screenshot wird gespeichert unter: screenshots/email-verification-mobile-success.png
```

## API-Endpoints

### POST /api/company/register/start

Startet den Registrierungsprozess und sendet Verifizierungs-E-Mail.

**Request:**
```json
{
  "companyEmail": "test@example-company.com",
  "primaryContactName": "Max Mustermann"
}
```

**Response (201 Created):**
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "initiated",
  "expiresAt": "2025-11-28T10:00:00Z"
}
```

### POST /api/company/register/verify-email

Verifiziert die E-Mail-Adresse.

**Request:**
```json
{
  "registrationId": "123e4567-e89b-12d3-a456-426614174000",
  "verificationToken": "abc123..."
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "nextStep": "company-details"
}
```

**Error Response (400 Bad Request):**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Verification token has expired"
}
```

## Troubleshooting

### Problem: "Connection refused" beim Test

**Ursache:** Frontend oder Backend läuft nicht.

**Lösung:**
```bash
# Prüfen, ob Services laufen
lsof -i :4200  # Frontend
lsof -i :5000  # Backend

# Services starten
npx nx serve admin-dashboard
cd apps/api && dotnet run
```

### Problem: Tests schlagen fehl mit "Timeout"

**Ursache:** API antwortet zu langsam oder ist nicht erreichbar.

**Lösung:**
1. Prüfen Sie die Netzwerk-Logs im Test
2. Erhöhen Sie das Timeout in der Test-Config:
   ```typescript
   await expect(page.locator('.verification-success'))
     .toBeVisible({ timeout: 15000 }); // 15 Sekunden statt 10
   ```

### Problem: "Element not found"

**Ursache:** Selektoren stimmen nicht mit dem HTML überein.

**Lösung:**
1. Öffnen Sie den Test im Debug-Modus:
   ```bash
   npx nx e2e admin-dashboard-e2e --debug
   ```
2. Verwenden Sie den Playwright Inspector zum Inspizieren der Elemente
3. Passen Sie die Selektoren im Test an

### Problem: E-Mail wird nicht versendet

**Ursache:** SMTP ist nicht konfiguriert (normal im Development).

**Erwartetes Verhalten:** Mock Email Service loggt E-Mails in die Console.

**Lösung:**
- Prüfen Sie die API-Console-Logs
- Sie sollten "MockEmailService: Sending email verification..." sehen
- Die Verification URL steht in den Logs

## Nächste Schritte

Nach erfolgreicher E-Mail-Verifizierung:

1. ✅ E-Mail verifiziert
2. 🔄 **Schritt 3**: Unternehmensdaten eingeben
3. 🔄 **Schritt 4**: Dokumente hochladen
4. 🔄 **Schritt 5**: Finanzielle Verifizierung
5. 🔄 **Schritt 6**: Zur Überprüfung einreichen

## Weitere Ressourcen

- [Playwright Dokumentation](https://playwright.dev/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [E-Mail Service Setup Guide](../../apps/api/EMAIL_SERVICE_SETUP.md)

---

**Erstellt**: 2025-11-21
**Autor**: Claude Code
**Version**: 1.0
