# Admin Dashboard - JobStream

Angular 20 Admin Dashboard für Company Verification basierend auf dem Design-PDF.

## 🎨 Design Implementation

Das Dashboard implementiert das Design aus `Customer Verification Administrator Screen.pdf`:

### Features

✅ **Registration List (Links)**
- Color-coded Status Cards
- 4 Status-Gruppen:
  - 🟠 Email Verification Pending
  - 🟡 Verification Pending
  - 🟢 Verification OK
  - 🔴 Verification Not OK

✅ **Company Details (Rechts)**
- Vollständige Firmeninformationen
- ML Verification Trigger Button
- Risk Score Anzeige
- Accept/Block Action Buttons

✅ **API Integration**
- AdminApiService mit HttpClient
- Vollständige CRUD Operations
- Error Handling
- Loading States

## 🏗️ Struktur

```
apps/admin-dashboard/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── registration-list.component.ts/html/scss
│   │   │   └── company-detail.component.ts/html/scss
│   │   ├── services/
│   │   │   └── admin-api.service.ts
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.scss
│   │   └── app.config.ts
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
└── project.json
```

## 🚀 Starten

```bash
# Im Root des Monorepos
npm run start:frontend

# Oder nur Angular Dashboard
nx serve admin-dashboard
```

Dashboard läuft auf: **http://localhost:4200**

## 🔌 API Endpoints

Das Dashboard verwendet folgende Backend-Endpoints:

### Admin Endpoints
- `GET /api/admin/registrations/pending` - Pending Registrations
- `GET /api/admin/registrations/{id}` - Registration Details
- `POST /api/admin/registrations/{id}/verify-ml` - ML Verification
- `GET /api/admin/registrations/{id}/ml-history` - ML History
- `POST /api/admin/registrations/{id}/approve` - Approve
- `POST /api/admin/registrations/{id}/reject` - Reject
- `GET /api/admin/statistics` - Dashboard Statistics

### API Configuration

In `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 📦 Dependencies

### Shared Library
```typescript
import {
  CompanyRegistration,
  MLVerificationResult,
  RegistrationStatus,
  RiskLevel
} from '@jobstream/api-types';
```

### Angular Standalone Components
- Kein NgModule erforderlich
- Direkte Imports in Components
- Tree-shakeable

## 🎯 Workflow

### 1. Registration anzeigen
```typescript
// AdminApiService lädt pending registrations
getPendingRegistrations() → PaginatedResponse<CompanyRegistration>
```

### 2. Details ansehen
```typescript
// Click auf Card öffnet Details
getRegistrationById(id) → RegistrationDetailResponse
```

### 3. ML Verification triggern
```typescript
// "AI Verify" Button
triggerMLVerification(id) → MLVerificationResult
// Zeigt Risk Score, Confidence, Risk Level
```

### 4. Approve/Reject
```typescript
// Accept Button
approveRegistration(id, notes) → CompanyRegistration

// Block Button
rejectRegistration(id, reason) → CompanyRegistration
```

## 🎨 Styling

### Color Scheme (aus PDF)

```scss
// Email Verification Pending - Orange
background: #ffe4d6;
border: #ff9866;

// Verification Pending - Yellow
background: #fff8dc;
border: #f4d03f;

// Verification OK - Green
background: #d4edda;
border: #28a745;

// Verification Not OK - Red
background: #f8d7da;
border: #dc3545;
```

### Action Buttons

```scss
// Accept Button
background: #ff7043;

// Block Button
background: #e53935;
```

## 🔐 Security

### HttpClient Interceptors (TODO)
- JWT Token Handling
- Error Interception
- CORS Configuration

### API Authorization
- Admin Role erforderlich für alle Endpoints
- JWT Claims Validation

## 📊 ML Verification Display

```typescript
interface MLVerificationDisplay {
  riskScore: number;        // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;       // 0-1 (angezeigt als %)
  recommendations: string[];
  webIntelligence: object;
}
```

### Risk Level Indicators
- **Low**: Green Badge
- **Medium**: Yellow Badge
- **High**: Red Badge

## 🧪 Testing

```bash
# Unit Tests
nx test admin-dashboard

# E2E Tests
nx e2e admin-dashboard-e2e

# Linting
nx lint admin-dashboard
```

## 📱 Responsive Design

- **Desktop**: 2-Column Layout (Liste | Details)
- **Tablet/Mobile**: Single Column (Stacked)
- Breakpoint: 1200px

## 🔄 State Management

Aktuell: **Component State**
- Observable Streams von HttpClient
- Event Emitters für Parent-Child Communication

Future: **NgRx oder Signals**
- Zentraler Store
- Optimistic Updates
- Caching

## 🚧 TODO / Improvements

- [ ] Add Pagination Controls
- [ ] Add Filtering/Search
- [ ] Add Sorting Options
- [ ] Implement Real-time Updates (SignalR)
- [ ] Add Toast Notifications
- [ ] Improve Error Messages
- [ ] Add Confirmation Modals
- [ ] Add Loading Skeletons
- [ ] Add Animation Transitions
- [ ] Add Keyboard Shortcuts

## 📚 Resources

- [Angular 20 Docs](https://angular.dev)
- [Standalone Components](https://angular.dev/guide/components)
- [HttpClient](https://angular.dev/guide/http)
- [Nx Angular](https://nx.dev/nx-api/angular)

---

**Implemented**: 2024-11-18
**Status**: ✅ Ready for Testing
**Design Source**: Customer Verification Administrator Screen.pdf
