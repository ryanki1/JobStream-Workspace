# Sprint 3 - JIRA Import Format

## Epic 1: Blockchain Stake Management
**Story Points**: 5
**Priority**: Must Have
**Status**: To Do

### User Stories:

#### SCRUM-5: Create StakeManager Smart Contract
**Story Points**: 2
**Acceptance Criteria**:
- [ ] Smart contract implements deposit function with €2,500 validation
- [ ] Stake locking mechanism (6 months) implemented
- [ ] Refund logic after good standing period works
- [ ] Events emitted for deposits and refunds
- [ ] Unit tests pass with 80%+ coverage

**Tasks**:
- Create `StakeManager.sol` smart contract
- Implement deposit function with amount validation
- Add stake locking mechanism (6 months)
- Implement refund logic after good standing period
- Add events for deposits and refunds
- Write Hardhat tests

---

#### SCRUM-6: Deploy StakeManager to Testnet
**Story Points**: 1
**Acceptance Criteria**:
- [ ] Contract deployed to Polygon Amoy testnet
- [ ] Contract address documented
- [ ] Deployment script works reliably
- [ ] Contract verified on PolygonScan

**Tasks**:
- Deploy StakeManager to Polygon Amoy testnet
- Verify contract on PolygonScan
- Document contract address in BLOCKCHAIN_SETUP.md

---

#### SCRUM-7: Integrate Stake Management with .NET API
**Story Points**: 2
**Acceptance Criteria**:
- [ ] CompanyRegistration model tracks stake status
- [ ] POST `/api/company/register/{id}/deposit-stake` endpoint works
- [ ] GET `/api/company/register/{id}/stake-status` returns correct status
- [ ] Transaction hash stored in database
- [ ] Integration tests pass

**Tasks**:
- Update CompanyRegistration model to track stake status
  - Add `StakeAmount` field
  - Add `StakeTransactionHash` field
  - Add `StakeDepositedAt` timestamp
  - Add `StakeStatus` enum (None, Deposited, Locked, Refunded, Forfeited)
- Create API endpoint for stake deposit workflow
  - POST `/api/company/register/{id}/deposit-stake`
  - Integration with PolygonBlockchainService
- Implement stake status checking
  - GET `/api/company/register/{id}/stake-status`
- Test with real Polygon Amoy testnet (switch `USE_MOCK_BLOCKCHAIN=false`)
- Create database migration

---

## Epic 2: Authentication & Authorization
**Story Points**: 5
**Priority**: Must Have
**Status**: To Do

### User Stories:

#### SCRUM-8: Implement JWT Authentication
**Story Points**: 3
**Acceptance Criteria**:
- [ ] Users can register and login
- [ ] JWT tokens are generated with correct claims
- [ ] Access tokens expire after 15 minutes
- [ ] Refresh tokens work for 7 days
- [ ] Passwords are hashed with BCrypt

**Tasks**:
- Install required NuGet packages
  - Microsoft.AspNetCore.Authentication.JwtBearer
  - System.IdentityModel.Tokens.Jwt
  - BCrypt.Net-Next
- Create User model and migration
- Implement JWT token generation
  - Configure JWT settings in appsettings.json
  - Add claims (userId, email, role, companyId)
  - Set expiration (15 minutes for access, 7 days for refresh)
- Create AuthController with endpoints:
  - POST `/api/auth/register` - User registration
  - POST `/api/auth/login` - User login
  - POST `/api/auth/refresh` - Token refresh
- Add password hashing service using BCrypt
- Add JWT authentication middleware to Program.cs

---

#### SCRUM-9: Implement Role-Based Authorization
**Story Points**: 2
**Acceptance Criteria**:
- [ ] Role-based access control works
- [ ] Protected endpoints require valid tokens
- [ ] Admin-only endpoints blocked for non-admins
- [ ] No hardcoded company IDs remain in codebase

**Tasks**:
- Implement role-based authorization
  - Create roles: Company, Admin, Freelancer
  - Add [Authorize] attributes to controllers
  - Create custom authorization policies
- Replace all hardcoded company IDs with JWT claims
  - JobPostingController (3 locations)
  - CompanyRegistrationController
- Write integration tests for auth flows

---

## Epic 3: ML-Powered Company Verification
**Story Points**: 10
**Priority**: Must Have
**Status**: In Progress (ML Service Complete ✅)

### User Stories:

#### SCRUM-10: Build Python ML Verification Service
**Story Points**: 5
**Status**: ✅ DONE
**Acceptance Criteria**:
- [x] Python FastAPI service running
- [x] PyTorch DistilBERT sentiment analysis working
- [x] Web intelligence gathering implemented
- [x] Risk scoring algorithm calculating correctly
- [x] Docker containerization complete

**Completed Tasks**:
- ✅ Design ML verification service architecture and API contract
- ✅ Create Python FastAPI microservice project structure
- ✅ Build sentiment analysis with PyTorch model
- ✅ Implement web intelligence gathering (Handelsregister, VIES, website, LinkedIn, news)
- ✅ Create risk scoring algorithm (weighted 0-100 scale)
- ✅ Add .env configuration for ML service
- ✅ Create docker-compose for ML service
- ✅ Test ML service locally

---

#### SCRUM-11: Integrate ML Service with .NET API
**Story Points**: 3
**Status**: To Do
**Acceptance Criteria**:
- [ ] .NET API can call ML service with resilience pipeline
- [ ] Rate limiting prevents overwhelming ML service (10 req/min)
- [ ] Circuit breaker protects against failures
- [ ] Retry policy handles transient errors
- [ ] Verification results stored in database

**Tasks**:
- Install required NuGet packages
  - Microsoft.Extensions.Http.Resilience
  - Microsoft.Extensions.Http.Polly
- Create MLVerificationService with resilience pipeline
  - Implement IMLVerificationService interface
  - Configure HttpClient with resilience pipeline
  - Add rate limiting (10 req/min to ML service)
  - Add retry policy (3 attempts, exponential backoff)
  - Add circuit breaker (50% failure threshold)
  - Add timeout (10 seconds)
- Add ML service configuration to appsettings.json
- Create endpoint: POST `/api/admin/registrations/{id}/verify-ml`
  - Triggered manually by admin
  - Calls Python ML service
  - Stores verification results in database
- Add MLVerificationResult model to database
  - RegistrationId (FK)
  - OverallRiskScore (decimal)
  - RiskLevel (enum: Low/Medium/High)
  - Confidence (decimal)
  - WebIntelligence (JSON)
  - SentimentAnalysis (JSON)
  - RiskFlags (JSON array)
  - Recommendations (JSON array)
  - VerifiedAt (DateTime)
  - ProcessingTimeMs (int)
- Create database migration

---

#### SCRUM-12: Add AI Verification to Admin Dashboard
**Story Points**: 2
**Status**: To Do
**Acceptance Criteria**:
- [ ] "AI Verify" button visible for Pending registrations
- [ ] Loading state shown during verification
- [ ] Results displayed with color-coded risk score
- [ ] Verification history tracked
- [ ] Previous results viewable

**Tasks**:
- Add "AI Verify" button to registration detail view
  - Only visible for Pending registrations
  - Shows loading state during verification
  - Displays results in modal/panel
- Display ML verification results
  - Risk score visualization (color-coded: green <30, yellow 30-60, red >60)
  - Web intelligence summary
  - Sentiment analysis
  - Recommendations list
  - Confidence indicator
- Store verification history
  - Allow re-running verification
  - Show previous verification results
  - Track changes over time

---

## Epic 4: Traditional Business Verification APIs
**Story Points**: 5
**Priority**: Must Have
**Status**: To Do

### User Stories:

#### SCRUM-13: Implement VIES VAT Verification
**Story Points**: 2
**Acceptance Criteria**:
- [ ] EU VAT numbers validated via VIES REST API
- [ ] Results cached to avoid repeated calls
- [ ] Validation results stored in database
- [ ] Format validation for different countries

**Tasks**:
- Create direct VIES API endpoint for manual checks
  - Endpoint: POST `/api/verification/vat`
  - Use VIES REST API (free)
  - Cache results to avoid repeated calls
- Add to company-details workflow (optional manual trigger)
- Create VatVerificationResult model
- Write integration tests

---

#### SCRUM-14: Implement Bank Account Verification
**Story Points**: 3
**Acceptance Criteria**:
- [ ] Micro-deposit amounts generated and sent
- [ ] User can enter amounts for verification
- [ ] Max 3 attempts enforced
- [ ] Bank details encrypted at rest
- [ ] Verification status tracked

**Tasks**:
- Implement manual micro-deposit verification
  - Generate 2 random amounts (€0.01-0.50)
  - Send via bank transfer (manual process documented)
  - Add verification endpoint: POST `/api/verification/bank-verify`
  - User enters amounts to confirm
  - Max 3 attempts
- Add encrypted storage for bank details
- Document process in admin guide
- Create BankVerification model and migration

---

## Epic 5: Real Email Service Integration
**Story Points**: 3
**Priority**: Must Have
**Status**: To Do

### User Stories:

#### SCRUM-15: Configure AWS SES Email Service
**Story Points**: 1
**Acceptance Criteria**:
- [ ] AWS SES account configured
- [ ] Domain verified
- [ ] SMTP credentials obtained
- [ ] Test emails send successfully

**Tasks**:
- Choose email provider (AWS SES recommended for cost)
- Create email service account
  - AWS SES: Register, verify domain, get SMTP credentials
  - OR SendGrid: Register, verify sender, get API key
- Configure AWS SES in appsettings.json
- Test email sending

---

#### SCRUM-16: Build Production Email Service
**Story Points**: 2
**Acceptance Criteria**:
- [ ] All registration emails work (verification, approval, rejection)
- [ ] Email delivery failures queued and retried
- [ ] Bounced emails tracked
- [ ] Dev environment still uses MockEmailService
- [ ] Email templates professional and branded

**Tasks**:
- Create production email service implementation
  - Implement IEmailService interface
  - Add configuration to appsettings.json
  - Add email templates directory
- Create email templates
  - Email verification (existing mock)
  - Registration approval notification
  - Registration rejection notification
  - Stake deposit confirmation
  - Document upload confirmation
- Replace MockEmailService with production service
  - Update dependency injection in Program.cs
  - Add environment-based switching (mock for dev, real for prod)
- Implement email queuing for reliability
  - Create EmailQueue table
  - Background service to process queue
  - Retry logic for failures
- Add email bounce handling
  - Configure webhook for bounces
  - Mark emails as invalid in database
- Test all email flows end-to-end

---

## Epic 6: Admin Dashboard Endpoints
**Story Points**: 5
**Priority**: Must Have
**Status**: To Do

### User Stories:

#### SCRUM-17: Build Admin Registration Management
**Story Points**: 3
**Acceptance Criteria**:
- [ ] Admins can view pending registration queue
- [ ] Full registration details viewable
- [ ] Pagination works for large lists
- [ ] All verification results included

**Tasks**:
- Create AdminController with authorization
  - Require [Authorize(Roles = "Admin")]
- GET `/api/admin/registrations/pending` - Pending registrations queue
  - Include all registration details
  - Sort by submission date
  - Pagination support
- GET `/api/admin/registrations/{id}` - Full registration details
  - Include all documents
  - Include verification results (VIES, ML, bank)
  - Include stake status

---

#### SCRUM-18: Implement Approval/Rejection Workflow
**Story Points**: 2
**Acceptance Criteria**:
- [ ] Admins can approve registrations with notes
- [ ] Admins can reject with required reason
- [ ] Email notifications sent on decision
- [ ] All actions logged in audit trail
- [ ] Dashboard statistics accurate

**Tasks**:
- POST `/api/admin/registrations/{id}/approve` - Approve registration
  - Require admin notes (optional)
  - Update status to Approved
  - Send approval email
  - Log action in audit table
- POST `/api/admin/registrations/{id}/reject` - Reject registration
  - Require rejection reason
  - Update status to Rejected
  - Send rejection email with reason
  - Log action in audit table
- GET `/api/admin/statistics` - Dashboard statistics
  - Total registrations
  - Pending count
  - Approved count
  - Rejected count
  - Average review time
- Create AuditLog table and service
  - Track all admin actions
  - Include timestamp, admin user, action, details
- Add admin action logging middleware

---

## Epic 7: Enhanced Security (Priority 2)
**Story Points**: 3
**Priority**: Should Have
**Status**: To Do

### User Stories:

#### SCRUM-19: Implement Rate Limiting & CAPTCHA
**Story Points**: 2
**Acceptance Criteria**:
- [ ] Registration endpoints rate-limited (100 req/min/IP)
- [ ] Login endpoints rate-limited (10 req/min/IP)
- [ ] CAPTCHA prevents automated submissions
- [ ] Rate limit exceeded returns 429 status

**Tasks**:
- Implement rate limiting per IP/user
  - Install AspNetCoreRateLimit NuGet package
  - Configure rate limits in appsettings.json
  - Apply to registration and login endpoints
- Add Google reCAPTCHA v3
  - Register site with Google reCAPTCHA
  - Add reCAPTCHA to registration start endpoint
  - Validate token server-side

---

#### SCRUM-20: Enhanced Document Security
**Story Points**: 1
**Acceptance Criteria**:
- [ ] All documents encrypted at rest
- [ ] Document downloads require authentication
- [ ] Download URLs expire after 1 hour
- [ ] Security audit checklist completed

**Tasks**:
- Enhance document encryption
  - Encrypt all uploaded documents at rest
  - Currently only IBAN is encrypted
- Implement signed URLs for document downloads
  - Generate time-limited download URLs
  - Expire after 1 hour
  - Require authentication
- Security audit checklist
  - SQL injection prevention review
  - XSS prevention review
  - CSRF protection review
  - Sensitive data exposure review

---

## Epic 8: Real-Time Progress Tracking (Priority 2)
**Story Points**: 3
**Priority**: Should Have
**Status**: To Do

### User Stories:

#### SCRUM-21: Add Registration Progress Tracking
**Story Points**: 3
**Acceptance Criteria**:
- [ ] Registration progress tracked in database
- [ ] API returns current registration step
- [ ] Frontend can query progress at any time
- [ ] Users can resume from any completed step
- [ ] SignalR real-time updates work (optional)

**Tasks**:
- Add registration step tracking to database
  - Current step enum
  - Completed steps array
  - Step completion timestamps
- Update each endpoint to track progress
  - Mark step complete when endpoint succeeds
- Create progress endpoint
  - GET `/api/company/register/{id}/progress`
  - Returns current step and completed steps
- Consider SignalR for real-time updates (optional)
  - Install Microsoft.AspNetCore.SignalR
  - Create progress hub
  - Push updates to connected clients

---

## Epic 9: Testing & Quality Assurance (Priority 2)
**Story Points**: 5
**Priority**: Should Have
**Status**: To Do

### User Stories:

#### SCRUM-22: Integration & E2E Testing
**Story Points**: 3
**Acceptance Criteria**:
- [ ] Integration tests cover all critical paths
- [ ] Full registration flow tested end-to-end
- [ ] E2E tests work with real testnet
- [ ] All tests pass consistently

**Tasks**:
- Write integration tests for registration flow
  - Full flow from start to approval
  - Test all validation rules
  - Test error scenarios
- Write integration tests for job posting flow
  - Create draft → Publish → Retrieve
  - Test with mock blockchain
- E2E tests with real blockchain (testnet)
  - Test stake deposit
  - Test job posting publishing
  - Verify on PolygonScan

---

#### SCRUM-23: Load & Security Testing
**Story Points**: 2
**Acceptance Criteria**:
- [ ] Load tests confirm API handles 100 concurrent users
- [ ] Security scan reveals no critical vulnerabilities
- [ ] Smart contracts pass automated security analysis
- [ ] Performance bottlenecks identified

**Tasks**:
- Load testing for API endpoints
  - Use k6 or Apache JMeter
  - Test registration endpoint
  - Test job posting endpoints
  - Identify performance bottlenecks
- Security testing
  - Use OWASP ZAP for vulnerability scanning
  - Test authentication endpoints
  - Test file upload security
- Smart contract testing
  - Use Slither for static analysis
  - Use Mythril for security analysis
  - Write additional Hardhat tests

---

## Sprint Metrics

**Total Story Points**: 52
- Priority 1 (Must Have): 41 points
- Priority 2 (Should Have): 11 points

**Sprint Capacity**: 25-30 points (realistic for 2 weeks)

**Completed**: 5 points (ML Service ✅)
**Remaining**: 47 points

**Cost**: $0-15/month total

**Sprint Goal**: Complete all Priority 1 tasks (41 points) with focus on authentication, ML integration, and admin workflows.

---

## Import Instructions for JIRA

1. **Create Epics First**:
   - Epic 1: Blockchain Stake Management
   - Epic 2: Authentication & Authorization
   - Epic 3: ML-Powered Company Verification
   - Epic 4: Traditional Business Verification APIs
   - Epic 5: Real Email Service Integration
   - Epic 6: Admin Dashboard Endpoints
   - Epic 7: Enhanced Security
   - Epic 8: Real-Time Progress Tracking
   - Epic 9: Testing & Quality Assurance

2. **Create Stories** under each Epic with story points assigned

3. **Create Tasks** under each Story (subtasks in JIRA)

4. **Set Sprint**: Sprint 3 (2 weeks)

5. **Set Priority**:
   - Epics 1-6: Must Have
   - Epics 7-9: Should Have

6. **Mark SCRUM-10 as DONE** (ML Service complete)

7. **Assign Labels**:
   - `backend` for .NET tasks
   - `ml-service` for Python tasks
   - `blockchain` for smart contract tasks
   - `security` for auth/encryption tasks
   - `testing` for QA tasks

8. **Dependencies**:
   - SCRUM-11 depends on SCRUM-10 (ML integration needs ML service)
   - SCRUM-12 depends on SCRUM-11 (Dashboard needs API integration)
   - SCRUM-18 depends on SCRUM-9 (Approval workflow needs auth)
