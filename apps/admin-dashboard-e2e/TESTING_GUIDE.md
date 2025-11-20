# E2E Testing Guide - Admin AI Verification

Schnellstart-Anleitung für das Ausführen der Playwright E2E-Tests.

## ✅ Voraussetzungen

1. **Playwright Browser installiert** ✅ (Bereits erledigt!)
   - Chromium ✅
   - Firefox ✅
   - WebKit ✅

2. **Admin Dashboard muss laufen**
   ```bash
   npm run start:frontend
   ```
   Dies startet die App auf `http://localhost:4200`

## 🚀 Tests ausführen

### Option 1: UI Mode (Empfohlen für Development)
```bash
npm run test:e2e:ui
```

**Vorteile:**
- Visuelles Interface
- Test-Explorer
- Step-by-Step Debugging
- Live-Vorschau
- Screenshot/Video-Aufnahmen

### Option 2: Headed Mode (Browser sichtbar)
```bash
npm run test:e2e:headed
```
Sie können den Browser während der Tests sehen.

### Option 3: Headless Mode (für CI/CD)
```bash
npm run test:e2e
```
Tests laufen im Hintergrund ohne UI.

### Option 4: Debug Mode
```bash
npm run test:e2e:debug
```
Pausiert bei jedem Schritt - ideal zum Debuggen.

## 📋 Verfügbare Test-Suites

### 1. **admin-ai-report-pom.spec.ts** ⭐ (Main Suite - Page Object Model)
6 Tests für den Happy Path mit sauberem POM-Pattern:
```bash
npx playwright test admin-ai-report-pom
```

**Tests:**
- ✅ Complete AI Verification Report Flow (Low risk)
- ✅ AI Verify Button Interaction
- ✅ Risk Level Color Coding
- ✅ Recommendations Section Visibility
- ✅ Web Intelligence Items Display
- ✅ Sprint Plan Requirements Validation

**Empfohlen für:** Schnelle Validierung der Kernfunktionalität

### 2. **admin-ai-edge-cases.spec.ts** 🔍 (Edge Cases & Error Handling)
7 Tests für spezielle Szenarien:
```bash
npx playwright test admin-ai-edge-cases
```

**Tests:**
- ✅ Medium Risk Level Display & Styling
- ✅ High Risk Level Display & Styling
- ✅ Missing Recommendations Handling
- ✅ Missing Web Intelligence Handling
- ✅ Empty Web Intelligence Object
- ✅ Report Persistence
- ✅ Re-verification Updates

**Empfohlen für:** Umfassende Validierung inkl. Fehlerbehandlung

### 3. **quick-test.spec.ts** 🚀 (Smoke Test)
1 Test zum schnellen Setup-Check:
```bash
npx playwright test quick-test
```

**Empfohlen für:** Prüfen ob Playwright korrekt konfiguriert ist

## 🎯 Was wird getestet?

### Sprint 3 Requirements (100% Coverage)
- ✅ **Risk Score with color coding**
  - Low (Grün), Medium (Gelb), High (Rot)
- ✅ **Recommendations List**
  - Alle Empfehlungen vom ML-Service
- ✅ **Web Intelligence Summary**
  - Handelsregister
  - VAT Validation
  - Website Accessibility
  - LinkedIn Presence
  - News Mentions
- ✅ **Confidence Indicator**
  - Als Prozentsatz angezeigt

## 🔧 API Mocking

Die Tests verwenden **vollständig gemockte APIs**:

### Gemockte Endpunkte:
1. `GET /api/admin/registrations/pending` → Registrierungsliste
2. `GET /api/admin/registrations/{id}` → Details + ML-Ergebnisse
3. `POST /api/admin/registrations/{id}/verify-ml` → Neue ML-Verifikation

### Mock-Daten enthalten:
- Vollständige Company Registration
- ML Verification Results mit allen Feldern
- Web Intelligence (alle 5 Datenquellen)
- Recommendations (3 Beispiele)

**Sie brauchen KEINE echte API für die Tests!** ✅

## 🐛 Troubleshooting

### Problem: "Failed to load registrations"
**Lösung:** Die API-Mocks wurden aktualisiert. Stellen Sie sicher, dass Sie die neueste Version der Test-Dateien verwenden.

### Problem: "Selector not found"
**Lösung:** Warten Sie darauf, dass die Angular-App vollständig geladen ist. Die Tests haben bereits Timeouts von 10 Sekunden.

### Problem: Browser startet nicht
**Lösung:** Playwright Browser neu installieren:
```bash
npx playwright install chromium
```

### Problem: Port 4200 bereits belegt
**Lösung:**
1. Stoppen Sie andere Prozesse auf Port 4200
2. Oder ändern Sie den Port in `playwright.config.ts`

## 📊 Test Reports

### HTML Report anzeigen:
```bash
npx playwright show-report
```

### Trace Viewer (für fehlgeschlagene Tests):
```bash
npx playwright show-trace trace.zip
```

## 💡 Best Practices

1. **UI Mode verwenden** während der Entwicklung
2. **Headed Mode** zum Debuggen verwenden
3. **Headless Mode** für CI/CD
4. Tests **isoliert** ausführen können
5. **Screenshots** bei Fehlern werden automatisch erstellt

## 🎥 Nützliche Befehle

### Spezifischen Test ausführen:
```bash
npx playwright test -g "Complete AI Verification Report Flow"
```

### Nur einen Browser verwenden:
```bash
npx playwright test --project=chromium
```

### Mit Video-Aufnahme:
```bash
npx playwright test --video=on
```

### Parallele Ausführung deaktivieren (für Debugging):
```bash
npx playwright test --workers=1
```

## 📈 CI/CD Integration

Beispiel für GitHub Actions:
```yaml
- name: Install Playwright Browsers
  run: npx playwright install chromium

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Playwright Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🔗 Verwandte Dokumentation

- [README.md](./README.md) - Vollständige Test-Dokumentation
- [SPRINT-3.md](../../apps/api/SPRINT-3.md) - Sprint Plan mit Requirements
- [Playwright Docs](https://playwright.dev)

## ✅ Schneller Erfolg

Führen Sie dies aus für einen sofortigen Test:

```bash
# Terminal 1: Frontend starten
npm run start:frontend

# Terminal 2: Tests mit UI ausführen
npm run test:e2e:ui
```

Wählen Sie den Test "Complete AI Verification Report Flow" und klicken Sie auf ▶️ Play!

Die Tests laufen vollständig mit Mocks - **keine Backend-API nötig!** 🎉
