# JobStream Sprint 5 - Projekt-Kontext für Claude Code Assist
## Zusammenfassung der Konversation vom 12-13. Januar 2026

**Zweck:** Diese Datei dokumentiert alle getroffenen Entscheidungen, damit Claude Code Assist die Frontend-Implementation übernehmen kann.

---

## 🎯 Projekt-Übersicht

**JobStream** ist eine blockchain-basierte Job-Posting-Plattform mit **Sprint-basierten Projekten** (nicht Standard Job Board!).

### Tech Stack:
- Backend: .NET Core API + PostgreSQL + Xandeum Blockchain
- Frontend: Angular 18 (Standalone) in Nx Monorepo  
- UI: **Spartan/ng** (Angular Port von shadcn/ui) + Tailwind CSS
- ML: Python FastAPI für Company Verification

### Besonderheit:
Sprint-basierte Projekte mit Milestones, Blockchain-Transparenz, strukturierten Acceptance Criteria.

---

## 📁 Nx Monorepo Struktur

```
jobstream/
├── apps/
│   ├── admin-dashboard/        ✅ Existiert
│   ├── api/                    ✅ .NET Backend (komplett fertig!)
│   ├── ml-service/             ✅ Python FastAPI
│   ├── company-portal/         🆕 ZU ERSTELLEN
│   └── candidate-portal/       🔮 Später
│
└── libs/
    └── shared/                 🆕 ZU ERSTELLEN
        ├── ui/                 Spartan/ng Components
        ├── models/             TypeScript Interfaces
        └── utils/              Utilities
```

---

## ✅ Was bereits fertig ist

### Sprint 5 Tasks 1-5 (30 Punkte) ✅ KOMPLETT
- Credentials System
- Company Authentication (JWT)
- Dashboard & Profile
- **Job Posting Backend API** (alle 9 Endpoints funktionieren!)
- TypeScript Models erstellt

---

## 📋 JobPosting Model (Backend ✅)

**WICHTIG:** Unterscheidet sich von Standard Job Boards!

```csharp
public class JobPosting
{
    // Basic
    public Guid Id;
    public string CompanyId;
    public string Title;                     // max 200
    public string Description;               // max 5000
    public string RequiredSkillsJson;        // JSON array
    public string TechnologyStack;           // max 500
    
    // ⭐ Sprint-Specific (macht JobStream unique!)
    public byte SprintDuration;              // 1-52 Wochen
    public ushort ProjectDuration;           // 1-3650 Tage
    public string PaymentStructureJson;      // JSON Milestones
    public string AcceptanceCriteria;        // max 2000
    
    // Optional (nach Developer Selection)
    public string? RepositoryLink;
    public string? JiraProjectId;
    
    // Blockchain
    public long? BlockchainPostingId;
    public string? CreationTransactionHash;
    public string? PublishTransactionHash;
    public string? CreatedByWalletAddress;
    
    // Status
    public JobPostingStatus Status;          // Draft, Active, Paused, Closed
    public DateTime CreatedAt;
    public DateTime? PublishedAt;
}
```

### JSON Formate:

**PaymentStructureJson:**
```json
{
  "milestones": [
    { "description": "Upfront", "amount": 15000, "percentage": 30 },
    { "description": "Sprint 1-3", "amount": 20000, "percentage": 40 },
    { "description": "Abschluss", "amount": 15000, "percentage": 30 }
  ],
  "totalAmount": 50000,
  "currency": "EUR"
}
```

**RequiredSkillsJson:**
```json
["C#", ".NET Core", "PostgreSQL", "Angular", "Docker"]
```

---

## 🔌 API Endpoints (Backend fertig ✅)

```
GET    /api/company/jobs              Liste + Filter + Pagination
GET    /api/company/jobs/{id}         Details
POST   /api/company/jobs              Erstellen (Draft)
PUT    /api/company/jobs/{id}         Update
POST   /api/company/jobs/{id}/publish Blockchain veröffentlichen
POST   /api/company/jobs/{id}/pause   Pausieren
POST   /api/company/jobs/{id}/resume  Fortsetzen
POST   /api/company/jobs/{id}/close   Schließen
DELETE /api/company/jobs/{id}         Löschen (nur Draft)
```

Authorization: JWT mit `CompanyRegistrationId` Claim

---

## 🎨 Design-Entscheidungen (vereinbart!)

### 1. UI Library: Spartan/ng
- Angular Port von shadcn/ui
- Tailwind CSS
- `ng add @spartan-ng/ui-core`

### 2. Form: Single-Page mit Collapsible Sections

```
┌────────────────────────────────────────────┐
│ [← Zurück] Neue Stellenanzeige            │
├────────────────────────────────────────────┤
│                                            │
│ ▼ 📋 Grundinformationen                   │
│   - Titel * (max 200)                     │
│   - Beschreibung * (max 5000, Textarea)   │
│                                            │
│ ▼ 🔧 Technologie & Skills                 │
│   - Tech Stack * (max 500)                │
│   - Skills * (Tags + Autocomplete)        │
│                                            │
│ ▼ ⏱️ Sprint & Timeline                    │
│   - Sprint Duration (Slider 1-52)         │
│   - Project Duration (Input 1-3650)       │
│   - Calculator: Zeigt Sprints, End-Datum  │
│                                            │
│ ▼ 💰 Payment                              │
│   - Milestones (dynamisch)                │
│     • Beschreibung, Betrag, % (auto)      │
│   - Total Amount & % (muss 100%)          │
│                                            │
│ ▼ ✅ Acceptance Criteria                  │
│   - Checkbox Liste (dynamisch)            │
│   - Standard Template laden               │
│                                            │
│ [Als Entwurf] [Blockchain veröffentlichen]│
└────────────────────────────────────────────┘
```

### 3. Job List: Card Layout

```
┌────────────────────────────────────────────┐
│ Stellenanzeigen         [+ Neue Stelle]   │
├────────────────────────────────────────────┤
│ [Alle] [Entwürfe] [Aktiv] [Pausiert]      │← Tabs
├────────────────────────────────────────────┤
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 🟢 AKTIV  Senior Developer         ⋮│   │
│ │ 🔧 .NET / PostgreSQL / Angular      │   │
│ │ ⏱️ Sprint: 2W | Projekt: 90T        │   │
│ │ 💰 €50k in 3 Milestones            │   │
│ │ 👁️ 145 | 📨 12 | 🔗 0x8f3a...2b4c │   │
│ │ Veröffentlicht: 15.12.2025          │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ ⚫ ENTWURF Product Manager         ⋮│   │
│ │ Erstellt: 10.01.2026                │   │
│ │ [Bearbeiten] [Veröffentlichen]      │   │
│ └──────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

**Status Colors:**
- 🟢 Aktiv = green
- ⚫ Entwurf = gray
- 🟡 Pausiert = orange
- 🔴 Geschlossen = red

---

## 🔧 Spartan/ng Components

```typescript
// Basis
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmTextareaDirective } from '@spartan-ng/ui-textarea-helm';

// Form
import { HlmSelectDirective } from '@spartan-ng/ui-select-helm';
import { HlmSliderDirective } from '@spartan-ng/ui-slider-helm';

// Advanced
import { HlmBadgeDirective } from '@spartan-ng/ui-badge-helm';
import { HlmCommandDirective } from '@spartan-ng/ui-command-helm';      // Skills Autocomplete
import { HlmDialogComponent } from '@spartan-ng/ui-dialog-helm';        // Blockchain Modal
import { HlmToastComponent } from '@spartan-ng/ui-toast-helm';
import { HlmCollapsibleDirective } from '@spartan-ng/ui-collapsible-helm';

// Icons
import { lucideChevronDown, lucidePlus, lucideX, lucideCheck } from '@ng-icons/lucide';
```

---

## 💡 UI Details (vereinbart)

### Skills Input:
- Tag Input mit Autocomplete (Command Component)
- Badges mit × zum Entfernen
- Vorschläge: C#, .NET, Angular, PostgreSQL, Docker, etc.
- Min 1 Skill required

### Sprint Duration:
- Slider (1-52 Wochen)
- Calculator zeigt:
  - Anzahl Sprints: `(ProjectDuration / 7) / SprintDuration`
  - End-Datum: `Heute + ProjectDuration`
  - Arbeitswochen: `ProjectDuration / 7`

### Payment Structure:
- Dynamische Milestone-Liste
- Felder: Beschreibung, Betrag, Prozent (auto)
- [+ Milestone] Button
- Validierung: Total = 100%

### Acceptance Criteria:
- Checkbox-Liste (dynamisch)
- [+ Kriterium] Button
- Standard Template:
  - "Alle Unit Tests bestehen"
  - "Code Coverage > 80%"
  - "Code Review abgeschlossen"
  - "Dokumentation vollständig"
  - "Deployment erfolgreich"

### Blockchain UI:
**Wallet Status (Header):**
```
🦊 MetaMask verbunden
0x742d...9aB3
```

**Transaction Modal:**
```
┌────────────────────────────┐
│ Blockchain-Transaktion     │
│ ⏳ Pending / ✅ Success / ❌ Error
│ TX: 0x8f3a...2b4c         │
│ [Block Explorer →]        │
└────────────────────────────┘
```

---

## 📱 Responsive

- Desktop (>1024px): 2-Spalten Cards
- Tablet (768-1024px): 1-Spalte breit
- Mobile (<768px): Kompakt, weniger Details

---

## 🔐 Validierung

### Required:
- Title (5-200), Description (50-5000), Tech Stack (max 500)
- Skills (min 1), Sprint (1-52), Project (1-3650)
- Payment (min 1 Milestone, Total = 100%)
- Criteria (min 1)

### Error Handling:
- Inline validation unter Feldern
- Toast für Success/Error
- Blockchain Errors im Modal

---

## 🚀 User Flows

**1. Draft erstellen:**
- Form ausfüllen → "Als Entwurf" → POST `/api/company/jobs` → Toast → Redirect List

**2. Auf Blockchain:**
- Form ausfüllen → Wallet connect → "Veröffentlichen" → Modal (TX) → POST `/publish` → Success → List

**3. Bearbeiten:**
- List → "Bearbeiten" → Form mit Daten → Ändern → "Speichern" → PUT `/api/company/jobs/{id}` → Toast

**4. Status ändern:**
- List → Action (⋮) → "Pausieren/Fortsetzen/Schließen" → POST `/pause|resume|close` → Toast

---

## 📊 Daten-Mapping

### Form → Backend:
```typescript
// Skills Array → JSON String
requiredSkillsJson: JSON.stringify(selectedSkills)

// Milestones → JSON String  
paymentStructureJson: JSON.stringify({
  milestones: paymentMilestones,
  totalAmount: totalAmount,
  currency: 'EUR'
})

// Criteria Array → String
acceptanceCriteria: criteria.map(c => `- ${c.text}`).join('\n')
```

### Backend → Form:
```typescript
selectedSkills = JSON.parse(job.requiredSkillsJson)
paymentMilestones = JSON.parse(job.paymentStructureJson).milestones
criteria = job.acceptanceCriteria.split('\n').map(line => ({
  text: line.replace(/^- /, ''),
  checked: false
}))
```

---

## 🎯 Tasks für Claude Code Assist

### Task 6: Job List (5 Punkte)
- Nx App `company-portal` erstellen
- Spartan/ng + Tailwind setup
- Job List Component (Card Layout)
- Status Filter Tabs
- Action Menu (⋮) context-sensitive
- Loading & Error States
- Responsive

### Task 7: Create Job Form (7 Punkte)
- Create Component
- 5 Collapsible Sections
- Skills Autocomplete (Command)
- Slider + Calculator
- Dynamic Milestones
- Criteria mit Template
- Validation
- "Draft" + "Blockchain Publish"
- Transaction Modal
- Toast Notifications

### Task 8: Edit Job (5 Punkte)
- Edit Component (kann Create wiederverwenden)
- Load & Parse existing data
- Status-based Actions

### Task 9: Job Details (3 Punkte)
- Read-only View
- Formatierte Anzeige
- Blockchain Info (TX Hash, Explorer Link)
- Action Buttons

---

## 🚫 Out of Scope

- ❌ Applications Management
- ❌ Candidate Portal
- ❌ LinkedIn OAuth
- ❌ Real Blockchain (Mock OK)
- ❌ File Upload
- ❌ Rich Text Editor (Textarea OK)
- ❌ Advanced Search
- ❌ Email Notifications
- ❌ Analytics

---

## 📝 Wichtige Hinweise

1. **Model ist speziell!** Sprint-Felder essentiell, nicht Standard Job Board
2. **Backend fertig!** API funktioniert, nur Frontend bauen
3. **Spartan/ng!** Nicht Material, nicht PrimeNG
4. **Nx Commands:**
   ```bash
   npx nx g @nx/angular:application company-portal
   npx nx g @nx/angular:library ui --directory=libs/shared/ui
   npx nx serve company-portal
   ```
5. **Blockchain:** Mock Service OK für jetzt, UI Flow wichtig
6. **Struktur:**
   ```
   apps/company-portal/src/app/
   ├── components/ (job-list, create-job, edit-job, job-details)
   ├── services/ (job-posting, blockchain, auth)
   ├── models/ (job-posting.interface.ts)
   └── app.routes.ts
   ```

---

## ✨ Zusammenfassung

**Existiert:**
- ✅ Backend komplett (API, Models, Validation)
- ✅ TypeScript Interfaces
- ✅ Nx Monorepo

**Zu bauen:**
- 🆕 `company-portal` App
- 🆕 Shared UI Library (Spartan/ng)
- 🆕 4 Components (List, Create, Edit, Details)
- 🆕 Services (JobPosting, Blockchain)
- 🆕 Routing & Guards

**Design:**
- Spartan/ng (shadcn/ui Style)
- Tailwind CSS
- Single-Page Form, Collapsible
- Card-Based List
- Sprint-focused!
- Blockchain UI

**Zeit:** 1-2 Tage

---

**Ende** - Claude Code Assist hat jetzt alle Infos! 🚀
