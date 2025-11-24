# Sprint 4 Plan - JobStream API

**Sprint Duration**: 2 weeks
**Sprint Goal**: Complete Admin Verification Workflow with ML Integration and Production Email Service

---

## Sprint Overview

Sprint 4 focuses on completing the admin verification workflow that was started in Sprint 3. The ML service is already built and tested - now we need to integrate it with the .NET API, build the admin UI, and complete the end-to-end registration approval process.

---

## ✅ Completed in Sprint 3

### Email Verification System ✅
- StartRegistrationComponent (Angular) - Company can start registration
- VerifyEmailComponent (Angular) - Email verification UI
- CompanyRegistrationService (Angular) - API integration service
- SmtpEmailService (ASP.NET) - Email service implementation
- MockEmailService - Development email testing
- 13 Playwright E2E tests for email verification
- Route-based layout switching (admin vs public pages)
- Business email validation (rejects free providers)

### ML Verification Service ✅
- Python FastAPI microservice with PyTorch
- Sentiment analysis using DistilBERT model
- Web intelligence gathering (Handelsregister, VIES, LinkedIn, news)
- Risk scoring algorithm (weighted 0-100 scale)
- Docker containerization
- Comprehensive documentation

### Infrastructure ✅
- PostgreSQL database with migrations
- Document storage (local filesystem)
- Encryption service for sensitive data (IBAN)
- Rate limiting middleware
- Error handling middleware

---

## 🎯 Sprint 4 Goals - Priority Breakdown

### 🔥 Priority 1: Core Admin Workflow (25 points)
**Goal**: Complete end-to-end admin verification and approval workflow

#### 1. ML Integration - .NET API (8 points)
**Status**: Not Started
**Dependencies**: ML Service (✅ Complete)

**Tasks**:
- [ ] Install NuGet packages
  - Microsoft.Extensions.Http.Resilience
  - Microsoft.Extensions.Http.Polly
- [ ] Create MLVerificationResult model
  - RegistrationId (FK to CompanyRegistration)
  - OverallRiskScore (decimal 0-100)
  - RiskLevel (enum: Low/Medium/High/Critical)
  - Confidence (decimal 0-1)
  - WebIntelligenceJson (TEXT) - Handelsregister, VIES, website, LinkedIn results
  - SentimentAnalysisJson (TEXT) - Description sentiment analysis
  - RiskFlagsJson (TEXT) - Array of detected risk factors
  - RecommendationsJson (TEXT) - Array of recommendations
  - VerifiedAt (DateTime)
  - ProcessingTimeMs (int)
- [ ] Create database migration for MLVerificationResult
- [ ] Create IMLVerificationService interface
  ```csharp
  Task<MLVerificationResult> VerifyCompanyAsync(Guid registrationId);
  Task<MLVerificationResult?> GetLatestVerificationAsync(Guid registrationId);
  Task<List<MLVerificationResult>> GetVerificationHistoryAsync(Guid registrationId);
  ```
- [ ] Implement MLVerificationService
  - HttpClient configuration with base URL from appsettings
  - Resilience pipeline (circuit breaker, retry, timeout)
  - Error handling and logging
  - Store results in database
- [ ] Add ML service configuration to appsettings.json
  ```json
  "MLService": {
    "BaseUrl": "http://localhost:8000",
    "TimeoutSeconds": 30,
    "MaxRetries": 3,
    "CircuitBreakerFailureThreshold": 0.5,
    "CircuitBreakerSamplingDuration": 60
  }
  ```
- [ ] Create endpoint: POST `/api/admin/registrations/{id}/verify-ml`
  - Requires admin authorization (temp: hardcoded check)
  - Calls ML service with registration data
  - Stores verification results
  - Returns risk score and recommendations
- [ ] Create endpoint: GET `/api/admin/registrations/{id}/ml-verification`
  - Returns latest ML verification result
  - Returns null if never verified
- [ ] Create endpoint: GET `/api/admin/registrations/{id}/ml-verification/history`
  - Returns all ML verification results for this registration
  - Ordered by VerifiedAt descending
- [ ] Write unit tests for MLVerificationService
- [ ] Write integration tests for ML endpoints

**Acceptance Criteria**:
- .NET API can call Python ML service successfully
- Verification results are stored in database
- Circuit breaker protects against ML service failures
- API returns properly formatted risk scores and recommendations
- Error scenarios are handled gracefully

**Deliverables**:
- MLVerificationResult model + migration
- IMLVerificationService + implementation
- 3 API endpoints working
- Unit + integration tests

---

#### 2. Admin Endpoints - Approve/Reject (8 points)
**Status**: Not Started
**Dependencies**: AuditLog model

**Tasks**:
- [ ] Create AuditLog model
  - Id (Guid, PK)
  - CompanyRegistrationId (Guid, FK)
  - Action (enum: RegistrationStarted, EmailVerified, DetailsSubmitted, DocumentsUploaded, FinancialSubmitted, MLVerificationRequested, MLVerificationCompleted, AdminReviewStarted, RegistrationApproved, RegistrationRejected, StatusChanged, NotesAdded)
  - Timestamp (DateTime)
  - PerformedBy (string) - Admin email, "System", or "Company"
  - DetailsJson (TEXT) - Additional context
  - PreviousStatus (string, nullable)
  - NewStatus (string, nullable)
  - IpAddress (string, nullable)
  - UserAgent (string, nullable)
- [ ] Create database migration for AuditLog
- [ ] Create IAuditLogService interface
  ```csharp
  Task LogActionAsync(Guid registrationId, AuditAction action, string performedBy, object? details = null);
  Task LogStatusChangeAsync(Guid registrationId, string previousStatus, string newStatus, string performedBy);
  Task<List<AuditLog>> GetRegistrationHistoryAsync(Guid registrationId);
  ```
- [ ] Implement AuditLogService
  - Save audit entries to database
  - Include HttpContext info (IP, User-Agent) when available
  - Serialize details to JSON
- [ ] Create AdminController
  - Temporary admin check: `X-Admin-Key` header matches config value
  - Add to appsettings: `"AdminApiKey": "TEMP_ADMIN_KEY_CHANGE_ME"`
- [ ] Implement GET `/api/admin/registrations`
  - Returns all registrations with pagination
  - Query params: status, page, pageSize
  - Include: CompanyEmail, PrimaryContactName, Status, CreatedAt, SubmittedAt
  - Order by: SubmittedAt descending (null last)
- [ ] Implement GET `/api/admin/registrations/pending`
  - Returns only PendingReview registrations
  - Include: Basic info + latest ML verification result
  - Order by: SubmittedAt ascending (oldest first)
- [ ] Implement GET `/api/admin/registrations/{id}`
  - Returns full registration details
  - Include: All fields, documents list, ML verification results
  - Include: Audit log history
- [ ] Implement POST `/api/admin/registrations/{id}/approve`
  - Request body: `{ "notes": "string (optional)" }`
  - Updates Status to Approved
  - Sets ReviewedAt, ReviewedBy, ReviewNotes
  - Logs action to audit log
  - Sends approval email (via IEmailService)
  - Returns updated registration
- [ ] Implement POST `/api/admin/registrations/{id}/reject`
  - Request body: `{ "reason": "string (required)" }`
  - Updates Status to Rejected
  - Sets ReviewedAt, ReviewedBy, ReviewNotes
  - Logs action to audit log
  - Sends rejection email with reason (via IEmailService)
  - Returns updated registration
- [ ] Implement GET `/api/admin/statistics`
  - Total registrations count
  - Pending count
  - Approved count
  - Rejected count
  - Average review time (from SubmittedAt to ReviewedAt)
  - Today's registrations count
- [ ] Add IEmailService methods for approval/rejection emails
  - SendApprovalEmailAsync(string toEmail, string companyName, string? notes)
  - SendRejectionEmailAsync(string toEmail, string companyName, string reason)
- [ ] Create email templates (German)
  - Approval notification
  - Rejection notification with reason
- [ ] Write unit tests for AdminController
- [ ] Write integration tests for admin workflow

**Acceptance Criteria**:
- Admin can view all registrations (paginated)
- Admin can view pending queue (oldest first)
- Admin can view full registration details with history
- Admin can approve with optional notes
- Admin can reject with required reason
- All actions are logged to audit trail
- Emails are sent on approve/reject
- Statistics endpoint provides useful metrics

**Deliverables**:
- AuditLog model + migration + service
- AdminController with 6 endpoints
- Email templates for approval/rejection
- Unit + integration tests

---

#### 3. Admin Dashboard UI - ML Integration (9 points)
**Status**: Not Started
**Dependencies**: ML API endpoints, Admin API endpoints

**Tasks**:
- [ ] Update AdminApiService (Angular)
  - Add methods for all admin endpoints
  - Type definitions for all request/response DTOs
- [ ] Create ML verification result display component
  - Risk score visualization (color-coded: green < 30, yellow 30-70, red > 70)
  - Risk level badge (Low/Medium/High/Critical)
  - Confidence indicator (progress bar or percentage)
  - Web intelligence summary (collapsible sections)
    - Handelsregister verification result
    - VIES VAT validation result
    - Website accessibility check
    - LinkedIn presence
    - News mentions summary
  - Sentiment analysis display
    - Overall sentiment score
    - Positive/negative/neutral breakdown
    - Key phrases extracted
  - Risk flags list (red warning badges)
  - Recommendations list (actionable items for admin)
  - Processing time display
  - Timestamp of verification
- [ ] Add "AI Verify" button to CompanyDetailComponent
  - Only visible for EmailVerified, DetailsSubmitted, DocumentsUploaded, FinancialSubmitted, PendingReview statuses
  - Disabled if ML verification is in progress
  - Loading spinner during verification
  - Success/error notifications
- [ ] Implement ML verification trigger
  - Call POST `/api/admin/registrations/{id}/verify-ml`
  - Handle loading state
  - Display results in modal or expandable panel
  - Store in component state
  - Allow re-verification (shows history)
- [ ] Add ML verification results to registration detail view
  - Auto-fetch latest verification on load
  - Display inline with registration details
  - Expand/collapse functionality
  - Show verification history (if multiple verifications exist)
- [ ] Create approve/reject buttons in CompanyDetailComponent
  - Only visible for PendingReview status
  - Approve button: Opens confirmation modal with optional notes field
  - Reject button: Opens modal with required reason field (textarea)
  - Disable buttons during API call
  - Show success/error notifications
  - Refresh registration list on success
- [ ] Implement approve workflow
  - Confirmation modal with optional notes textarea
  - Call POST `/api/admin/registrations/{id}/approve`
  - Show success message: "Registration approved. Email sent to company."
  - Update UI to reflect new status
  - Clear selected registration
- [ ] Implement reject workflow
  - Modal with required reason textarea (min 20 chars)
  - Validation: reason cannot be empty
  - Call POST `/api/admin/registrations/{id}/reject`
  - Show success message: "Registration rejected. Email sent to company."
  - Update UI to reflect new status
  - Clear selected registration
- [ ] Add statistics dashboard card
  - Display counts from GET `/api/admin/statistics`
  - Total, Pending, Approved, Rejected
  - Average review time
  - Auto-refresh every 30 seconds
- [ ] Add audit log history panel
  - Display audit trail from registration details
  - Timeline view with icons for each action
  - Show: timestamp, action, performed by, details
  - Collapsible panel at bottom of detail view
- [ ] Add filtering to registration list
  - Filter by status (All, Pending, Approved, Rejected)
  - Filter by date range (optional)
  - Search by company email or name
- [ ] Polish admin UI styling
  - Consistent color scheme (purple accent)
  - Professional card layouts
  - Responsive design
  - Loading skeletons
  - Empty states
  - Error states
- [ ] Write Playwright tests for admin workflow
  - Test ML verification trigger
  - Test approve workflow
  - Test reject workflow
  - Test filtering and search
  - Test statistics display

**Acceptance Criteria**:
- Admin can trigger ML verification with one click
- ML results are displayed in user-friendly format
- Risk scores are color-coded for quick assessment
- Admin can approve with optional notes
- Admin can reject with required reason
- Audit history is visible for each registration
- Statistics dashboard shows key metrics
- UI is polished and professional
- E2E tests cover critical workflows

**Deliverables**:
- ML verification result display component
- Updated CompanyDetailComponent with approve/reject
- Statistics dashboard
- Audit log timeline component
- Playwright E2E tests

---

### 🟡 Priority 2: Production Readiness (15 points)

#### 4. Production Email Service (5 points)
**Status**: Not Started
**Current**: Using MockEmailService

**Tasks**:
- [ ] Choose email provider
  - **Option A**: AWS SES (Recommended)
    - Cost: $0 for first 62,000 emails/month (when called from EC2)
    - Cost: $0.10 per 1,000 emails after free tier
    - Pros: Lowest cost, high deliverability, integrated with AWS
    - Cons: Requires domain verification, starts in sandbox mode
  - **Option B**: SendGrid
    - Cost: $0 for 100 emails/day (3,000/month)
    - Cost: $19.95/month for 50,000 emails
    - Pros: Easy setup, good free tier for development
    - Cons: More expensive at scale
  - **Option C**: Fix Gmail SMTP Authentication
    - Cost: $0
    - Pros: No setup required
    - Cons: Failed in Sprint 3, not recommended for production
- [ ] Set up chosen email provider
  - Register account
  - Verify domain (noreply@jobstream.com)
  - Get API credentials or SMTP settings
  - Configure SPF, DKIM, DMARC records
  - Request production access (if AWS SES)
- [ ] Create production email service implementation
  - **If AWS SES**: Create AwsSesEmailService
    - Install AWSSDK.SimpleEmail NuGet package
    - Use AmazonSimpleEmailServiceClient
    - Implement IEmailService interface
  - **If SendGrid**: Create SendGridEmailService
    - Install SendGrid NuGet package
    - Use SendGridClient
    - Implement IEmailService interface
- [ ] Update email templates with professional HTML
  - Email verification (existing)
  - Registration approval
  - Registration rejection
  - Stake deposit confirmation (future)
  - Use responsive email template framework (MJML or Foundation for Emails)
  - Include JobStream branding
  - Add footer with unsubscribe link (compliance)
- [ ] Implement environment-based email service selection
  - Add to appsettings.json: `"Email": { "Provider": "Mock|Smtp|AwsSes|SendGrid" }`
  - Update Program.cs to register correct service based on config
  - Keep MockEmailService for development
- [ ] Implement email queuing for reliability
  - Create EmailQueue table
    - Id, ToAddress, Subject, BodyHtml, Status (Pending/Sent/Failed), CreatedAt, SentAt, ErrorMessage, RetryCount
  - Create background service to process queue
  - Implement retry logic (3 attempts with exponential backoff)
  - Log failures to database
- [ ] Implement email bounce handling
  - Configure webhook for bounce notifications (AWS SNS or SendGrid webhook)
  - Create endpoint to receive bounce notifications
  - Mark email addresses as invalid in database
  - Add EmailBounces table to track bounced emails
- [ ] Add email rate limiting
  - Prevent abuse (max 10 emails per company per hour)
  - Add EmailRateLimit table or use in-memory cache
- [ ] Test all email flows end-to-end
  - Registration verification email
  - Approval email
  - Rejection email
  - Verify delivery in inbox (not spam)
  - Test on multiple email providers (Gmail, Outlook, Yahoo)
- [ ] Update documentation
  - EMAIL_SERVICE_SETUP.md with chosen provider
  - Configuration instructions
  - Troubleshooting guide

**Acceptance Criteria**:
- Production email service sends emails successfully
- Emails are delivered to inbox (not spam)
- Email queue handles failures gracefully
- Bounced emails are tracked
- Rate limiting prevents abuse
- All templates are professional and branded
- Documentation is complete

**Deliverables**:
- Production email service implementation
- Email queue + background processor
- Bounce handling webhook
- Professional HTML email templates
- Updated documentation

---

#### 5. Authentication & Authorization (JWT) (5 points)
**Status**: Not Started
**Current**: Using hardcoded admin check via X-Admin-Key header

**Tasks**:
- [ ] Install NuGet packages
  - Microsoft.AspNetCore.Authentication.JwtBearer
  - Microsoft.AspNetCore.Identity.EntityFrameworkCore
  - BCrypt.Net-Next
- [ ] Create User model
  - Id (Guid)
  - Email (string, unique)
  - PasswordHash (string)
  - Role (enum: Admin, Company, Freelancer)
  - CompanyRegistrationId (Guid?, nullable, FK)
  - CreatedAt (DateTime)
  - LastLoginAt (DateTime?)
  - IsActive (bool)
  - EmailVerified (bool)
- [ ] Create database migration for Users table
- [ ] Create AuthController
  - POST `/api/auth/register` - Create user account
  - POST `/api/auth/login` - Login and get JWT
  - POST `/api/auth/refresh` - Refresh JWT token
  - POST `/api/auth/change-password` - Change password
- [ ] Implement JWT token generation
  - Add JWT settings to appsettings.json
    ```json
    "Jwt": {
      "Secret": "GENERATE_LONG_RANDOM_SECRET_MIN_256_BITS",
      "Issuer": "JobStreamApi",
      "Audience": "JobStreamClient",
      "AccessTokenExpirationMinutes": 15,
      "RefreshTokenExpirationDays": 7
    }
    ```
  - Create JwtService
  - Generate access token with claims: userId, email, role, companyId (if applicable)
  - Generate refresh token (store in database)
- [ ] Add JWT authentication middleware
  - Configure in Program.cs
  - Validate tokens on protected endpoints
- [ ] Implement role-based authorization
  - [Authorize(Roles = "Admin")] for admin endpoints
  - [Authorize(Roles = "Company")] for company endpoints
  - Custom policies for complex authorization
- [ ] Create user registration flow for companies
  - After admin approval, company receives email with registration link
  - Company creates account (email + password)
  - Link account to CompanyRegistration via CompanyRegistrationId
- [ ] Replace hardcoded admin checks with JWT auth
  - Remove X-Admin-Key header checks
  - Use [Authorize(Roles = "Admin")] attribute
  - Get admin email from JWT claims for audit logging
- [ ] Implement password security
  - Hash passwords with BCrypt (work factor 12)
  - Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  - Rate limit login attempts (max 5 per 15 minutes per email)
  - Account lockout after 5 failed attempts (30 min cooldown)
- [ ] Create admin user seed data
  - Add initial admin user in migration or startup
  - Email: admin@jobstream.com
  - Password: Prompt to set on first run
- [ ] Update Angular frontend for authentication
  - Create AuthService
  - Store JWT in localStorage (or httpOnly cookie for better security)
  - Add HTTP interceptor to attach JWT to requests
  - Implement login page
  - Implement logout
  - Handle token refresh
  - Redirect to login on 401 Unauthorized
- [ ] Write tests for authentication
  - Unit tests for JwtService
  - Integration tests for auth endpoints
  - Test authorization on protected endpoints

**Acceptance Criteria**:
- Users can register and login
- JWT tokens are generated and validated
- Protected endpoints require valid tokens
- Role-based access control works (Admin vs Company)
- Passwords are hashed securely
- Login rate limiting prevents brute force
- Frontend integrates with authentication
- All hardcoded admin checks are removed

**Deliverables**:
- User model + migration
- AuthController with 4 endpoints
- JwtService
- Angular AuthService + HTTP interceptor
- Login page (Angular)
- Tests for authentication

---

#### 6. Display Statistics in Admin Dashboard (2 points)
**Status**: API exists, UI missing
**Dependencies**: Admin endpoints complete

**Tasks**:
- [ ] Create StatisticsCardComponent (Angular)
  - Display total registrations
  - Display pending count (highlight if > 0)
  - Display approved count
  - Display rejected count
  - Display average review time (format: "2.5 days")
  - Display today's registrations count
- [ ] Add statistics to admin dashboard header
  - Fetch from GET `/api/admin/statistics`
  - Auto-refresh every 30 seconds
  - Loading skeleton
  - Error state
- [ ] Add visual indicators
  - Color-coded cards (green for approved, yellow for pending, red for rejected)
  - Icons for each metric
  - Trend indicators (if possible: up/down arrows)
- [ ] Make cards interactive
  - Click on "Pending" card to filter list to pending registrations
  - Click on "Approved" to filter to approved
  - Click on "Rejected" to filter to rejected
- [ ] Write Playwright tests
  - Test statistics display
  - Test auto-refresh
  - Test interactive filtering

**Acceptance Criteria**:
- Statistics are displayed prominently in admin dashboard
- Cards are color-coded and professional
- Auto-refresh keeps data current
- Interactive cards filter the registration list
- Tests cover statistics display

**Deliverables**:
- StatisticsCardComponent
- Integration with admin dashboard
- Playwright tests

---

#### 7. Enhanced Security (3 points)
**Status**: Not Started

**Tasks**:
- [ ] Implement rate limiting per IP/user
  - Already have RateLimitingMiddleware
  - Enhance to support per-user limits (not just per-IP)
  - Add rate limits to sensitive endpoints:
    - Login: 5 requests per 15 minutes per email
    - Registration start: 3 requests per hour per IP
    - Email verification resend: 3 requests per hour per registration
  - Return 429 Too Many Requests with Retry-After header
- [ ] Add request validation middleware
  - Validate all input DTOs with FluentValidation
  - Return consistent 400 Bad Request responses
  - Log validation failures
- [ ] Enhance document security
  - Encrypt all uploaded documents at rest (currently only IBAN is encrypted)
  - Generate signed URLs for document downloads
  - Signed URLs expire after 1 hour
  - Require authentication to download documents
  - Log all document access attempts
- [ ] Add security headers middleware
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: max-age=31536000; includeSubDomains
  - Content-Security-Policy (for admin dashboard)
- [ ] Implement CORS properly
  - Only allow specific origins (admin dashboard URL)
  - Only allow specific methods (GET, POST, PUT, DELETE)
  - Only allow specific headers
  - Don't use `AllowAnyOrigin()` in production
- [ ] Add SQL injection prevention review
  - Verify all Entity Framework queries use parameterization
  - No raw SQL queries without parameters
  - Code review checklist
- [ ] Add XSS prevention review
  - Verify all user input is escaped in Angular templates
  - Use Angular's built-in sanitization
  - No `bypassSecurityTrust*` methods without justification
- [ ] Implement audit trail for security events
  - Failed login attempts
  - Account lockouts
  - Password changes
  - Document access
  - Admin actions (already covered in AuditLog)
- [ ] Security testing
  - Run OWASP ZAP scan
  - Review for OWASP Top 10 vulnerabilities
  - Penetration testing (manual)

**Acceptance Criteria**:
- Rate limiting prevents abuse on sensitive endpoints
- All documents are encrypted at rest
- Signed URLs protect document downloads
- Security headers are properly configured
- CORS is restrictive (production-ready)
- No SQL injection vulnerabilities
- No XSS vulnerabilities
- Security audit trail captures critical events
- OWASP scan shows no critical issues

**Deliverables**:
- Enhanced rate limiting
- Document encryption + signed URLs
- Security headers middleware
- CORS configuration
- Security audit report

---

### 🔵 Priority 3: Nice to Have (10 points)

#### 8. Blockchain Stake Management (5 points)
**Status**: Not Started
**Dependencies**: Smart contract development

**Note**: Can be deferred to Sprint 5 if time is limited. Core workflow can function without stakes initially.

**Tasks**:
- [ ] Create StakeManager.sol smart contract
  - Deposit function (accepts POL, validates minimum amount)
  - Stake locking mechanism (6 months timelock)
  - Refund function (after timelock + good standing verification)
  - Forfeit function (admin can forfeit stake for violations)
  - Events: StakeDeposited, StakeRefunded, StakeForfeited
- [ ] Deploy StakeManager to Polygon Amoy testnet
  - Update BLOCKCHAIN_SETUP.md with contract address
- [ ] Update CompanyRegistration model
  - StakeAmount (decimal)
  - StakeTransactionHash (string)
  - StakeDepositedAt (DateTime?)
  - StakeStatus (enum: None, Deposited, Locked, Refunded, Forfeited)
- [ ] Create database migration for stake fields
- [ ] Implement stake deposit API
  - POST `/api/company/register/{id}/deposit-stake`
  - Request: { walletAddress, transactionHash }
  - Verify transaction on blockchain
  - Update registration with stake details
  - Send confirmation email
- [ ] Implement stake status check
  - GET `/api/company/register/{id}/stake-status`
  - Returns: amount, status, depositedAt, unlockDate
- [ ] Create stake deposit UI (Angular)
  - Display minimum stake amount (€2,500 equivalent in POL)
  - MetaMask integration for deposit
  - Transaction status monitoring
  - Success/error notifications
- [ ] Write tests
  - Hardhat tests for StakeManager contract
  - Unit tests for stake API endpoints
  - E2E tests for stake deposit flow
- [ ] Test with real Polygon Amoy testnet
  - Switch `UseMockService: false` in Blockchain config
  - Get testnet POL from faucet
  - Execute full stake deposit flow

**Acceptance Criteria**:
- Smart contract locks stakes for 6 months
- API verifies stake transactions on blockchain
- Companies can deposit stake via UI
- Stake status is tracked in database
- Refund mechanism works after timelock

**Deliverables**:
- StakeManager.sol smart contract
- Stake API endpoints
- Stake deposit UI component
- Hardhat + integration tests

---

#### 9. Real-Time Progress Tracking (3 points)
**Status**: Not Started

**Tasks**:
- [ ] Add progress tracking fields to CompanyRegistration
  - CurrentStep (enum matching RegistrationStatus)
  - CompletedSteps (JSON array of completed steps)
  - StepCompletionTimestamps (JSON object: { "EmailVerified": "2024-01-15T...", ... })
- [ ] Update each registration endpoint to track progress
  - Mark step complete when endpoint succeeds
  - Update CurrentStep
  - Add timestamp to StepCompletionTimestamps
- [ ] Create progress endpoint
  - GET `/api/company/register/{id}/progress`
  - Returns: currentStep, completedSteps, stepTimestamps, percentComplete
- [ ] Create progress indicator component (Angular)
  - Stepper UI showing all registration steps
  - Highlight completed steps (green checkmark)
  - Highlight current step (blue)
  - Disabled future steps (gray)
  - Show estimated time remaining
- [ ] Add progress indicator to company registration flow
  - Display at top of each registration page
  - Allow clicking on completed steps to go back
  - Prevent skipping steps
- [ ] (Optional) Implement SignalR for real-time updates
  - Install Microsoft.AspNetCore.SignalR
  - Create ProgressHub
  - Push updates when status changes
  - Connect from Angular using @microsoft/signalr
  - Auto-update progress without refresh

**Acceptance Criteria**:
- Registration progress is tracked in database
- API returns current step and completion percentage
- UI displays progress stepper
- Users can navigate to completed steps
- (Optional) Real-time updates work via SignalR

**Deliverables**:
- Progress tracking in backend
- Progress API endpoint
- Progress stepper component (Angular)
- (Optional) SignalR integration

---

#### 10. Integration Testing & E2E Tests (2 points)
**Status**: Partial (13 Playwright tests for email verification)

**Tasks**:
- [ ] Write integration tests for admin workflow
  - Full flow: Start registration → Email verify → Submit details → Upload docs → Submit financial → Admin verify ML → Approve
  - Test rejection flow
  - Test multiple registrations in queue
- [ ] Write Playwright E2E tests for admin dashboard
  - Admin login (once JWT is implemented)
  - View pending registrations
  - Trigger ML verification
  - View ML results
  - Approve registration
  - Reject registration
  - View statistics
  - View audit history
- [ ] Write integration tests for email service
  - Test email queue processing
  - Test retry logic
  - Test bounce handling
- [ ] Write integration tests for ML service integration
  - Test ML service call with mock responses
  - Test circuit breaker behavior
  - Test timeout handling
  - Test retry logic
- [ ] Performance testing
  - Use k6 or Apache JMeter
  - Test registration endpoint under load
  - Test admin dashboard under load
  - Identify bottlenecks
  - Target: <500ms response time for 95th percentile
- [ ] Set up CI/CD pipeline (GitHub Actions or GitLab CI)
  - Run unit tests on every commit
  - Run integration tests on PR
  - Run E2E tests before merge to main
  - Generate code coverage report
  - Fail build if coverage <80%

**Acceptance Criteria**:
- Integration tests cover full registration flow
- E2E tests cover admin workflow
- Performance tests confirm API can handle load
- CI/CD pipeline runs all tests automatically
- Code coverage >80%

**Deliverables**:
- Integration tests for admin workflow
- Playwright E2E tests for admin dashboard
- Performance test scripts
- CI/CD pipeline configuration

---

## 📅 Sprint Timeline (2 Weeks)

### Week 1: Core Admin Workflow

**Day 1-2: ML Integration (.NET)**
- Set up MLVerificationService
- Create database models and migrations
- Implement API endpoints
- Unit tests

**Day 3-4: Admin Endpoints**
- AuditLog model and service
- AdminController implementation
- Approve/reject logic
- Email templates
- Integration tests

**Day 5: Admin Dashboard UI - Part 1**
- Update AdminApiService
- ML verification result display component
- Trigger ML verification from UI

### Week 2: Production Readiness & Polish

**Day 6-7: Admin Dashboard UI - Part 2**
- Approve/reject UI
- Statistics dashboard
- Audit log timeline
- Filtering and search
- E2E tests

**Day 8-9: Production Email Service**
- Set up AWS SES or SendGrid
- Email queue implementation
- Professional email templates
- Bounce handling

**Day 10: Authentication & Authorization**
- JWT implementation
- User model and auth endpoints
- Frontend auth integration
- Replace hardcoded admin checks

**Day 11-12: Security & Testing**
- Enhanced security features
- Security audit
- Integration tests
- E2E tests
- Performance testing

**Day 13-14: Buffer & Polish**
- Bug fixes
- Documentation updates
- Demo preparation
- Sprint review & retrospective

---

## 📊 Sprint Metrics

### Story Points
- **Priority 1 (Must Have)**: 25 points
  - ML Integration: 8 points
  - Admin Endpoints: 8 points
  - Admin Dashboard UI: 9 points
- **Priority 2 (Should Have)**: 15 points
  - Production Email: 5 points
  - JWT Auth: 5 points
  - Statistics UI: 2 points
  - Enhanced Security: 3 points
- **Priority 3 (Nice to Have)**: 10 points
  - Blockchain Stakes: 5 points
  - Progress Tracking: 3 points
  - Testing: 2 points

**Total**: 50 points
**Target**: Complete all Priority 1 (25 points) + most of Priority 2 (15 points) = 40 points

### Success Criteria

**By End of Sprint:**
- ✅ ML service integrated with .NET API
- ✅ Admin can trigger AI verification from dashboard
- ✅ Admin can approve/reject registrations
- ✅ All admin actions logged to audit trail
- ✅ Approval/rejection emails sent automatically
- ✅ Statistics displayed in admin dashboard
- ✅ Production email service configured (AWS SES or SendGrid)
- ✅ JWT authentication implemented
- ✅ Security headers and rate limiting configured
- ✅ Complete E2E workflow tested
- ✅ Documentation updated

**Demo-Ready Features:**
1. Company starts registration (email + name)
2. Company verifies email via link
3. Company submits details, documents, financials
4. Admin views pending queue
5. Admin triggers AI verification → sees risk score, recommendations, web intelligence
6. Admin approves or rejects based on ML insights
7. Company receives professional email notification
8. Audit trail shows complete history
9. Statistics dashboard shows metrics

### Key Performance Indicators (KPIs)
- API response time: <500ms for 95th percentile
- ML verification time: <5s for 95th percentile
- Email delivery rate: >95%
- Code coverage: >80%
- Zero critical security vulnerabilities
- Admin can process a registration in <2 minutes

---

## 💰 Cost Analysis

### Current Monthly Cost: $0

| Service | Provider | Monthly Cost | Notes |
|---------|----------|--------------|-------|
| **ML Service Hosting** | AWS EC2 t2.micro | $0 (12 months free) | After free tier: ~$8/month |
| **Email Service** | AWS SES | $0 (62,000 emails/month from EC2) | $0.10 per 1,000 after |
| **Email Service (Alt)** | SendGrid | $0 (100/day) or $19.95 | Free tier sufficient for dev |
| **Database** | PostgreSQL (self-hosted) | $0 | Running locally/on same EC2 |
| **Blockchain (testnet)** | Polygon Amoy | $0 | Testnet is free |
| **File Storage** | Local filesystem | $0 | Can migrate to S3 later |

**Total Sprint 4 Cost: $0/month** (using free tiers)

### Future Production Costs (Estimated)
- AWS EC2 t2.micro: $8/month
- AWS SES: $10/month (100,000 emails)
- AWS S3: $5/month (100GB storage)
- Polygon Mainnet: ~$0.01-0.10 per transaction
- **Total: ~$25-30/month** for production

---

## 🔒 Security Checklist

### Authentication & Authorization
- [ ] JWT tokens use strong secret (min 256 bits)
- [ ] Access tokens expire after 15 minutes
- [ ] Refresh tokens stored securely in database
- [ ] Passwords hashed with BCrypt (work factor 12)
- [ ] Password requirements enforced (min 8 chars, complexity)
- [ ] Login rate limiting (5 attempts per 15 min)
- [ ] Account lockout after 5 failed attempts

### API Security
- [ ] All endpoints validate input with FluentValidation
- [ ] Rate limiting on all public endpoints
- [ ] CORS configured restrictively (no AllowAnyOrigin)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] HTTPS enforced in production
- [ ] SQL injection prevented (Entity Framework parameterized queries)
- [ ] XSS prevented (Angular built-in sanitization)

### Data Security
- [ ] All documents encrypted at rest
- [ ] Sensitive data (IBAN) encrypted in database
- [ ] Document downloads require authentication
- [ ] Signed URLs expire after 1 hour
- [ ] Audit trail for all security events
- [ ] PII handled according to GDPR requirements

### Smart Contract Security
- [ ] Use Slither for static analysis
- [ ] Use Mythril for security scanning
- [ ] Test on testnet before mainnet deployment
- [ ] Use OpenZeppelin contracts where possible
- [ ] Implement reentrancy guards
- [ ] Professional audit before mainnet (future)

---

## 📝 Documentation Updates Needed

### Developer Documentation
- [ ] Update README with Sprint 4 changes
- [ ] Document ML integration setup
- [ ] Document JWT authentication setup
- [ ] Document email service configuration (AWS SES or SendGrid)
- [ ] Update API documentation (Swagger)
- [ ] Create ADMIN_GUIDE.md for admin users

### User Documentation
- [ ] Registration process guide
- [ ] Email verification instructions
- [ ] Account creation instructions (after approval)
- [ ] FAQ for common issues

### Deployment Documentation
- [ ] Update DOCKER_DEPLOYMENT.md
- [ ] Create AWS deployment guide (if using AWS SES + EC2)
- [ ] Create environment variables reference
- [ ] Create troubleshooting guide

---

## ⚠️ Risks & Mitigation

### High Priority Risks

**Risk**: ML service downtime breaks admin workflow
**Mitigation**: Circuit breaker pattern, graceful degradation, allow manual approval without ML verification

**Risk**: Email deliverability issues (spam folder)
**Mitigation**: Proper SPF/DKIM/DMARC configuration, verify domain, monitor bounce rates, test with multiple providers

**Risk**: JWT token security vulnerabilities
**Mitigation**: Follow OWASP best practices, use strong secrets, short expiration, secure storage, regular security audits

### Medium Priority Risks

**Risk**: ML verification takes too long (>10s)
**Mitigation**: Async processing, status polling, background jobs, progress indicators

**Risk**: Database performance degrades with many registrations
**Mitigation**: Proper indexing, pagination, query optimization, consider caching

**Risk**: Time pressure to complete all Priority 1 + 2 tasks
**Mitigation**: Focus on Priority 1 first (25 points), defer Priority 3 to Sprint 5 if needed

### Low Priority Risks

**Risk**: Third-party API changes (VIES, Handelsregister)
**Mitigation**: Error handling, fallback to manual verification, monitoring

---

## 🎯 Definition of Done

For each feature to be considered complete:
- [ ] Code written following C# and TypeScript best practices
- [ ] Unit tests written (>80% coverage for new code)
- [ ] Integration tests for critical paths
- [ ] E2E tests for user workflows (Playwright)
- [ ] Code reviewed (by peer or AI)
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] Deployed to dev environment
- [ ] Manual testing completed
- [ ] No critical bugs remaining
- [ ] Acceptance criteria met

---

## 🔄 Rollover to Sprint 5 (If Needed)

If not completed in Sprint 4, these tasks will roll over:

### Priority 3 Tasks
- Blockchain stake management (5 points) - Can function without stakes initially
- Real-time progress tracking (3 points) - Nice to have, not critical
- Additional testing (2 points) - Can continue in Sprint 5

### Potential New Sprint 5 Features
- Company details submission UI (after email verification)
- Document upload UI
- Financial details submission UI
- Company dashboard (view registration status)
- Freelancer registration workflow
- Job posting UI for companies
- Advanced ML models (profile photo verification, etc.)

---

## 📞 Support & Resources

### Technical Resources
- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core
- **Angular**: https://angular.dev
- **PostgreSQL**: https://www.postgresql.org/docs/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

### Email Service Documentation
- **AWS SES**: https://docs.aws.amazon.com/ses/
- **SendGrid**: https://docs.sendgrid.com/

### ML Service
- **ML Service Documentation**: See ML_SERVICE_SUMMARY.md
- **PyTorch**: https://pytorch.org/docs/
- **FastAPI**: https://fastapi.tiangolo.com/

---

## 📊 Sprint Review & Retrospective

### Sprint Review (End of Week 2)
- Demo complete admin verification workflow
- Review completed vs planned work
- Update product backlog
- Gather stakeholder feedback

### Sprint Retrospective Questions
1. What went well in Sprint 4?
2. What challenges did we face?
3. What can we improve in Sprint 5?
4. Which technical decisions paid off?
5. Which tasks took longer than estimated?

### Continuous Improvement Actions
- Refine story point estimates based on actual velocity
- Identify recurring blockers
- Improve development workflow
- Update documentation templates

---

**Sprint Start Date**: [To be filled]
**Sprint End Date**: [To be filled]
**Sprint Lead**: [Your Name]
**Product Owner**: [To be filled]

---

## Quick Reference - Priority 1 Tasks (Must Complete)

1. **ML Integration (.NET)** - 8 points
   - MLVerificationResult model + migration
   - MLVerificationService with resilience
   - 3 API endpoints
   - Tests

2. **Admin Endpoints** - 8 points
   - AuditLog model + service
   - AdminController (6 endpoints)
   - Approve/reject logic
   - Email templates
   - Tests

3. **Admin Dashboard UI** - 9 points
   - ML verification display
   - Trigger ML verification
   - Approve/reject UI
   - Statistics dashboard
   - Audit history timeline
   - E2E tests

**Total Priority 1: 25 points**

Focus: Complete Priority 1 in Week 1, then tackle Priority 2 in Week 2!
