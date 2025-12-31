# Sprint 5 Plan - JobStream Company Portal & Job Posting

**Sprint Duration**: 2 weeks
**Sprint Goal**: Company Portal, Credentials System, Job Posting Management, and Production Readiness

---

## Sprint Overview

Sprint 5 builds on the completed Sprint 4 admin workflow by creating the **Company Portal** where approved companies receive credentials, can log in, and create job postings. This sprint also addresses remaining production readiness items from Sprint 4.

---

## ✅ Completed in Sprint 4

### Admin Verification Workflow ✅
- ML Verification integration (.NET ↔ Python FastAPI)
- Admin Dashboard UI with statistics
- Approve/Reject modals with professional design
- ML Results display (Risk Score, Web Intelligence, Recommendations)
- Critical Risk Level with pulse animation
- Audit Log service and database table
- Email service implementation (MockEmailService for dev)
- Approval/Rejection email templates (German)

### Still Pending from Sprint 4 ⚠️
- **Real SMTP Email Testing** - Currently using MockEmailService
- **AuditLog Migration Applied** - Migration created but needs API restart
- **Reject Modal Testing** - Approve workflow tested, reject needs testing
- **Production CSS Budget** - Build warning at 9.31kB vs 8kB limit

---

## 🎯 Sprint 5 Goals - Priority Breakdown

### 🔥 Priority 1: Company Portal & Credentials (30 points)

#### 1. Credentials Generation System (8 points)
**Status**: Not Started
**Dependencies**: User model, JWT authentication

**Tasks**:
- [ ] Extend User model for company accounts
  - CompanyRegistrationId (FK to CompanyRegistration)
  - IsFirstLogin (bool) - Track if user needs to change password
  - PasswordResetToken (string, nullable)
  - PasswordResetTokenExpiry (DateTime?, nullable)
  - CreatedByAdminApproval (bool) - Track auto-generated accounts
- [ ] Create database migration for User model changes
- [ ] Create ICredentialsService interface
  ```csharp
  Task<User> GenerateCompanyCredentialsAsync(Guid registrationId);
  Task<string> GenerateTemporaryPasswordAsync();
  Task SendCredentialsEmailAsync(string email, string temporaryPassword, string companyName);
  Task<bool> ForcePasswordChangeAsync(Guid userId, string newPassword);
  ```
- [ ] Implement CredentialsService
  - Generate secure random temporary password (12 chars, mixed case, numbers, symbols)
  - Create User account linked to CompanyRegistration
  - Hash password with BCrypt
  - Set IsFirstLogin = true
  - Send credentials email
- [ ] Update AdminController.Approve method
  - After approval, automatically generate credentials
  - Call CredentialsService.GenerateCompanyCredentialsAsync
  - Include credentials in approval email OR send separate credentials email
  - Log credentials generation to AuditLog
- [ ] Create credentials email template (German)
  ```
  Subject: Ihre Zugangsdaten für JobStream

  Sehr geehrte/r [CompanyName],

  Ihre Registrierung wurde erfolgreich genehmigt!

  Sie können sich jetzt bei JobStream anmelden:

  Anmelde-URL: https://company.jobstream.com/login
  E-Mail: [CompanyEmail]
  Temporäres Passwort: [GeneratedPassword]

  WICHTIG: Bitte ändern Sie Ihr Passwort bei der ersten Anmeldung.

  Nach dem Login können Sie:
  - Job-Angebote erstellen und verwalten
  - Bewerbungen einsehen
  - Ihr Unternehmensprofil bearbeiten

  Bei Fragen wenden Sie sich bitte an support@jobstream.com

  Mit freundlichen Grüßen,
  Ihr JobStream Team
  ```
- [ ] Create password reset endpoint
  - POST `/api/auth/request-password-reset`
  - POST `/api/auth/reset-password`
  - Email with reset link (expires after 1 hour)
- [ ] Implement first-login password change enforcement
  - Check IsFirstLogin flag on login
  - Force redirect to change-password page
  - Update IsFirstLogin to false after password change
- [ ] Write unit tests for CredentialsService
- [ ] Write integration tests for credentials workflow

**Acceptance Criteria**:
- Credentials generated automatically on approval
- Temporary password is secure and random
- Credentials email sent to company
- Company can log in with temporary credentials
- First login forces password change
- Password reset workflow available

**Deliverables**:
- CredentialsService implementation
- Updated User model + migration
- Credentials email template
- Password reset endpoints
- Tests for credentials generation

---

#### 2. Company Portal - Authentication & Layout (7 points)
**Status**: Not Started
**Dependencies**: JWT authentication, Angular routing

**Tasks**:
- [ ] Create Angular app: `company-portal`
  - `npx nx g @nx/angular:application company-portal`
  - Standalone components (Angular 18+)
  - Routing configured
  - Port: 4201
- [ ] Create shared AuthService for company portal
  - Login method (email + password → JWT)
  - Logout method (clear token)
  - Get current user (from JWT claims)
  - IsAuthenticated observable
  - Auto-refresh token before expiration
  - Store JWT in localStorage (or httpOnly cookie for better security)
- [ ] Create HTTP interceptor
  - Attach JWT to all requests (Authorization: Bearer {token})
  - Handle 401 Unauthorized → redirect to login
  - Handle 403 Forbidden → show error
- [ ] Create login page component
  - Email + password form
  - Validation (required fields, email format)
  - Error messages (invalid credentials, account locked)
  - "Forgot password?" link
  - Loading state during login
  - Redirect to change-password if IsFirstLogin
  - Redirect to dashboard after successful login
- [ ] Create change-password component
  - Current password field (for first login, use temporary password)
  - New password field
  - Confirm new password field
  - Password strength indicator
  - Validation (min 8 chars, uppercase, lowercase, number, match)
  - Error handling
  - Success redirect to dashboard
- [ ] Create forgot-password component
  - Email input
  - Submit button
  - Success message: "Password reset link sent"
  - Error handling
- [ ] Create reset-password component
  - Get token from URL query params
  - New password + confirm fields
  - Validation
  - Success redirect to login
- [ ] Create company portal layout component
  - Header with company name + logout button
  - Sidebar navigation (Dashboard, Job Postings, Profile, Settings)
  - Main content area
  - Footer
  - Responsive design (mobile-friendly)
- [ ] Create auth guard
  - Protect routes that require authentication
  - Redirect to login if not authenticated
- [ ] Create route configuration
  - `/login` - LoginComponent (public)
  - `/forgot-password` - ForgotPasswordComponent (public)
  - `/reset-password` - ResetPasswordComponent (public)
  - `/change-password` - ChangePasswordComponent (protected)
  - `/dashboard` - DashboardComponent (protected)
  - `/jobs` - JobListComponent (protected)
  - `/jobs/new` - CreateJobComponent (protected)
  - `/jobs/:id/edit` - EditJobComponent (protected)
  - `/profile` - CompanyProfileComponent (protected)
  - Default redirect: `/dashboard`
- [ ] Write Playwright tests for authentication
  - Test login with valid credentials
  - Test login with invalid credentials
  - Test first-login password change flow
  - Test logout
  - Test forgot password flow

**Acceptance Criteria**:
- Company can log in with email + password
- JWT stored securely and attached to requests
- First login forces password change
- Protected routes require authentication
- Layout is professional and responsive
- Auth guard prevents unauthorized access

**Deliverables**:
- company-portal Angular app
- AuthService + HTTP interceptor
- Login, change-password, forgot-password components
- Company portal layout
- Auth guard + routing configuration
- Playwright tests

---

#### 3. Company Dashboard & Profile (5 points)
**Status**: Not Started
**Dependencies**: Company portal authentication

**Tasks**:
- [ ] Create DashboardComponent
  - Welcome message with company name
  - Summary cards:
    - Total job postings count
    - Active job postings count
    - Draft job postings count
    - Total applications received (future)
  - Quick actions:
    - "Create New Job Posting" button → navigate to `/jobs/new`
    - "View All Jobs" button → navigate to `/jobs`
  - Recent activity timeline (optional):
    - Recent job postings created
    - Recent applications (future)
- [ ] Create API endpoint: GET `/api/company/dashboard/stats`
  - Requires authentication (JWT)
  - Returns:
    - totalJobPostings
    - activeJobPostings
    - draftJobPostings
    - totalApplications (return 0 for now)
  - Filter by current company (get CompanyRegistrationId from JWT claims)
- [ ] Create CompanyProfileComponent
  - Display company information (read-only for now):
    - Legal name
    - Registration number
    - VAT ID
    - Address
    - Industry
    - Company size
    - Description
    - LinkedIn URL
  - "Edit Profile" button (future sprint)
- [ ] Create API endpoint: GET `/api/company/profile`
  - Requires authentication
  - Returns CompanyRegistration data for current company
  - Filter sensitive fields (don't return encrypted IBAN, documents, etc.)
- [ ] Create CompanyApiService (Angular)
  - getDashboardStats()
  - getProfile()
  - Type definitions for responses
- [ ] Add welcome email after first password change (optional)
  - Subject: "Willkommen bei JobStream!"
  - Include getting started guide
  - Links to create first job posting
- [ ] Write Playwright tests
  - Test dashboard displays correct stats
  - Test profile displays company info
  - Test navigation to job posting creation

**Acceptance Criteria**:
- Dashboard shows company statistics
- Profile displays company information
- Quick actions navigate correctly
- API endpoints are protected by JWT
- Company can only see their own data

**Deliverables**:
- DashboardComponent + CompanyProfileComponent
- 2 API endpoints for dashboard and profile
- CompanyApiService
- Playwright tests

---

#### 4. Job Posting Model & Database (5 points)
**Status**: Partially complete (model exists, needs review)
**Dependencies**: CompanyRegistration model

**Tasks**:
- [ ] Review existing JobPosting model (apps/api/Models/JobPosting.cs)
  - Verify all required fields exist
  - Add/update fields as needed:
    - Id (Guid, PK)
    - CompanyRegistrationId (Guid, FK)
    - Title (string, required, max 200)
    - Description (string, required, max 10,000) - Rich text HTML
    - Location (string, required, max 200) - e.g., "Berlin, Germany" or "Remote"
    - JobType (enum: FullTime, PartTime, Contract, Freelance)
    - ExperienceLevel (enum: Entry, Mid, Senior, Lead, Executive)
    - SalaryMin (decimal?, nullable) - Optional salary range
    - SalaryMax (decimal?, nullable)
    - SalaryCurrency (string, nullable, default "EUR")
    - RequiredSkills (JSON array) - e.g., ["C#", "Angular", "PostgreSQL"]
    - PreferredSkills (JSON array, nullable)
    - Benefits (JSON array, nullable) - e.g., ["Remote work", "Health insurance"]
    - ApplicationDeadline (DateTime?, nullable)
    - Status (enum: Draft, Active, Paused, Closed, Expired)
    - CreatedAt (DateTime)
    - UpdatedAt (DateTime?)
    - PublishedAt (DateTime?, nullable) - When status changed to Active
    - ExpiresAt (DateTime?, nullable) - Auto-close date
    - ViewCount (int, default 0) - Track views
    - ApplicationCount (int, default 0) - Track applications
- [ ] Create JobPostingStatus enum if not exists
  - Draft - Not visible to public
  - Active - Published and accepting applications
  - Paused - Temporarily not accepting applications (still visible)
  - Closed - No longer accepting applications (archived)
  - Expired - Auto-closed after expiration date
- [ ] Create database migration for JobPosting table
  - Include foreign key to CompanyRegistration
  - Add indexes on: CompanyRegistrationId, Status, PublishedAt, ExpiresAt
- [ ] Create JobApplication model (basic, for future sprints)
  - Id (Guid, PK)
  - JobPostingId (Guid, FK)
  - FreelancerId (Guid, FK, nullable for now)
  - ApplicantEmail (string)
  - ApplicantName (string)
  - CoverLetter (string)
  - ResumeUrl (string)
  - Status (enum: Pending, Reviewing, Shortlisted, Rejected, Accepted)
  - AppliedAt (DateTime)
- [ ] Create database migration for JobApplication table
- [ ] Seed sample job postings for development (optional)
  - Create 3-5 sample jobs for testing
  - Different statuses (Draft, Active, Closed)
  - Different job types and experience levels
- [ ] Apply migrations to database
- [ ] Write unit tests for JobPosting model validation

**Acceptance Criteria**:
- JobPosting model has all required fields
- Database migrations applied successfully
- Indexes created for query optimization
- Enums defined for status, type, experience level
- JobApplication model ready for future sprints

**Deliverables**:
- JobPosting model (reviewed/updated)
- JobPostingStatus enum
- JobApplication model (basic)
- Database migrations
- Unit tests

---

#### 5. Job Posting API Endpoints (5 points)
**Status**: Not Started
**Dependencies**: JobPosting model, JWT authentication

**Tasks**:
- [ ] Create IJobPostingService interface
  ```csharp
  Task<JobPosting> CreateAsync(Guid companyId, CreateJobPostingDto dto);
  Task<JobPosting> UpdateAsync(Guid id, Guid companyId, UpdateJobPostingDto dto);
  Task<JobPosting?> GetByIdAsync(Guid id, Guid companyId);
  Task<List<JobPosting>> GetAllByCompanyAsync(Guid companyId, JobPostingStatus? status = null);
  Task<JobPosting> PublishAsync(Guid id, Guid companyId);
  Task<JobPosting> PauseAsync(Guid id, Guid companyId);
  Task<JobPosting> CloseAsync(Guid id, Guid companyId);
  Task DeleteAsync(Guid id, Guid companyId);
  ```
- [ ] Implement JobPostingService
  - Validate company ownership (companyId from JWT must match JobPosting.CompanyRegistrationId)
  - Validate required fields
  - Set timestamps (CreatedAt, UpdatedAt, PublishedAt)
  - Update status
  - Log actions to AuditLog
- [ ] Create JobPostingController
  - [Authorize(Roles = "Company")] - Only companies can manage jobs
  - Extract CompanyRegistrationId from JWT claims
- [ ] Implement GET `/api/company/jobs`
  - Query params: status (optional filter)
  - Returns all job postings for current company
  - Order by: UpdatedAt descending
  - Pagination (page, pageSize)
- [ ] Implement GET `/api/company/jobs/{id}`
  - Returns single job posting
  - Validate ownership
  - Return 404 if not found or not owned by company
- [ ] Implement POST `/api/company/jobs`
  - Request body: CreateJobPostingDto
    - Title, Description, Location, JobType, ExperienceLevel
    - SalaryMin, SalaryMax, SalaryCurrency (optional)
    - RequiredSkills, PreferredSkills, Benefits (optional)
    - ApplicationDeadline (optional)
  - Validation: Required fields, max lengths
  - Create job with status = Draft
  - Return created job posting
- [ ] Implement PUT `/api/company/jobs/{id}`
  - Request body: UpdateJobPostingDto (same fields as Create)
  - Validate ownership
  - Update job posting
  - Update UpdatedAt timestamp
  - Return updated job posting
- [ ] Implement POST `/api/company/jobs/{id}/publish`
  - Change status from Draft → Active
  - Set PublishedAt timestamp
  - Calculate ExpiresAt (optional, e.g., 30 days from publish)
  - Return updated job posting
- [ ] Implement POST `/api/company/jobs/{id}/pause`
  - Change status from Active → Paused
  - Return updated job posting
- [ ] Implement POST `/api/company/jobs/{id}/close`
  - Change status to Closed
  - Return updated job posting
- [ ] Implement DELETE `/api/company/jobs/{id}`
  - Validate ownership
  - Only allow deletion of Draft jobs
  - Return 400 if job is Active/Paused/Closed
  - Soft delete (set IsDeleted flag) or hard delete
- [ ] Add validation with FluentValidation
  - CreateJobPostingValidator
  - UpdateJobPostingValidator
  - Validate title length, description length, skills array, etc.
- [ ] Write unit tests for JobPostingService
- [ ] Write integration tests for JobPostingController

**Acceptance Criteria**:
- Companies can create job postings (draft)
- Companies can edit their own job postings
- Companies can publish drafts to make them active
- Companies can pause/close active jobs
- Companies can only manage their own jobs
- API returns 404/403 for unauthorized access
- Validation errors return 400 with clear messages

**Deliverables**:
- IJobPostingService + implementation
- JobPostingController with 8 endpoints
- DTOs for Create/Update
- FluentValidation validators
- Unit + integration tests

---

### 🟡 Priority 2: Job Posting UI (20 points)

#### 6. Job Posting List Component (5 points)
**Status**: Not Started
**Dependencies**: Job Posting API endpoints

**Tasks**:
- [ ] Create JobListComponent (Angular)
  - Display all job postings for current company
  - Tabs for filtering: All, Draft, Active, Paused, Closed
  - Each job card shows:
    - Title
    - Location
    - Job type badge (Full-time, Part-time, etc.)
    - Status badge (color-coded)
    - Published date (if published)
    - View count + Application count
    - Action buttons: View, Edit, Publish (if draft), Pause/Resume, Close
  - Empty state: "No job postings yet. Create your first job posting!"
  - Loading skeleton
  - Error state
- [ ] Create JobPostingService (Angular)
  - getAllJobs(status?: string)
  - getJobById(id: string)
  - createJob(dto: CreateJobPostingDto)
  - updateJob(id: string, dto: UpdateJobPostingDto)
  - publishJob(id: string)
  - pauseJob(id: string)
  - closeJob(id: string)
  - deleteJob(id: string)
  - Type definitions for all DTOs
- [ ] Add status badge component
  - Draft: gray badge
  - Active: green badge
  - Paused: yellow badge
  - Closed: red badge
  - Expired: dark gray badge
- [ ] Add action menu dropdown for each job
  - View details
  - Edit
  - Publish (if draft)
  - Pause (if active)
  - Resume (if paused)
  - Close (if active/paused)
  - Delete (if draft, with confirmation modal)
- [ ] Implement filtering by status
  - Click tab to filter jobs
  - Update query params in URL (e.g., `/jobs?status=active`)
  - Load filtered jobs from API
- [ ] Add search functionality (optional)
  - Search by title or description (client-side filter)
  - Debounce search input
- [ ] Add pagination
  - Page size: 10 jobs per page
  - Previous/Next buttons
  - Page number display
- [ ] Write Playwright tests
  - Test job list displays correctly
  - Test filtering by status
  - Test action menu (view, edit, delete)
  - Test empty state

**Acceptance Criteria**:
- Job list displays all company jobs
- Filtering by status works
- Status badges are color-coded
- Action menu allows view/edit/publish/pause/close/delete
- Pagination works correctly
- Empty state is user-friendly

**Deliverables**:
- JobListComponent
- JobPostingService (Angular)
- Status badge component
- Pagination component
- Playwright tests

---

#### 7. Create Job Posting Form (7 points)
**Status**: Not Started
**Dependencies**: Job Posting API endpoints

**Tasks**:
- [ ] Create CreateJobComponent (Angular)
  - Reactive form with validation
  - Fields:
    - Title (required, max 200 chars)
    - Description (required, rich text editor, max 10,000 chars)
    - Location (required, max 200 chars, autocomplete suggested)
    - Job Type (dropdown: Full-time, Part-time, Contract, Freelance)
    - Experience Level (dropdown: Entry, Mid, Senior, Lead, Executive)
    - Salary Range (optional):
      - Min salary (number input)
      - Max salary (number input)
      - Currency (dropdown, default EUR)
    - Required Skills (multi-select or tag input)
    - Preferred Skills (multi-select or tag input, optional)
    - Benefits (tag input, optional)
    - Application Deadline (date picker, optional)
  - Two action buttons:
    - "Save as Draft" - Creates job with status=Draft
    - "Publish Now" - Creates job and immediately publishes (status=Active)
  - Form validation:
    - Required field validation
    - Max length validation
    - Salary min < max validation
    - At least 1 required skill
  - Loading state during API call
  - Success notification: "Job posting created successfully!"
  - Error handling with clear messages
  - Redirect to job list after success
- [ ] Integrate rich text editor for description
  - Use Quill, TinyMCE, or Angular equivalent
  - Support: Bold, italic, underline, lists, links
  - Prevent XSS (sanitize HTML on backend)
- [ ] Create skills autocomplete/tag input
  - Predefined skill suggestions (fetch from API or hardcode common skills)
  - Allow custom skills
  - Chip/tag display for selected skills
  - Remove skill by clicking X
- [ ] Add location autocomplete (optional)
  - Suggest common locations (Berlin, Munich, Remote, etc.)
  - Allow custom input
- [ ] Add form auto-save to localStorage (optional)
  - Save draft every 30 seconds
  - Restore from localStorage if page is refreshed
  - Clear localStorage after successful submission
- [ ] Create preview mode (optional)
  - "Preview" button shows how job will look to applicants
  - Modal or side panel with formatted job description
- [ ] Write unit tests for form validation
- [ ] Write Playwright tests
  - Test create job as draft
  - Test publish job immediately
  - Test form validation errors
  - Test rich text editor
  - Test skills tag input

**Acceptance Criteria**:
- Form has all required fields with validation
- Rich text editor works for description
- Skills can be added as tags
- Save as draft creates job with Draft status
- Publish now creates and publishes job (Active status)
- Form validation prevents invalid submissions
- Auto-save prevents data loss (optional)

**Deliverables**:
- CreateJobComponent
- Rich text editor integration
- Skills tag input component
- Form validation
- Unit + Playwright tests

---

#### 8. Edit Job Posting Form (5 points)
**Status**: Not Started
**Dependencies**: Create job form

**Tasks**:
- [ ] Create EditJobComponent (Angular)
  - Reuse CreateJobComponent form (shared component)
  - Load existing job data on init
  - Populate form fields with job data
  - Disable fields if job is Active/Closed (optional: allow editing paused jobs)
  - Action buttons:
    - "Save Changes" - Update job
    - "Cancel" - Navigate back to job list
    - "Publish" - If job is draft, publish it
    - "Pause" - If job is active, pause it
    - "Resume" - If job is paused, resume it
    - "Close" - If job is active/paused, close it
  - Validation (same as create form)
  - Loading state
  - Success notification: "Job posting updated successfully!"
  - Error handling
- [ ] Add confirmation modal for destructive actions
  - "Are you sure you want to close this job posting?"
  - "Are you sure you want to delete this job posting?"
- [ ] Create shared JobFormComponent (optional)
  - Extract common form logic from Create and Edit
  - Accept @Input() for mode: 'create' | 'edit'
  - Accept @Input() for initial job data (for edit mode)
  - Emit @Output() on submit
- [ ] Add route guard for edit page
  - Verify job exists and belongs to current company
  - Redirect to 404 if job not found or unauthorized
- [ ] Write Playwright tests
  - Test edit job form loads with existing data
  - Test save changes updates job
  - Test publish/pause/close actions
  - Test cancel navigation

**Acceptance Criteria**:
- Edit form loads with existing job data
- Changes can be saved
- Status can be changed (publish, pause, close)
- Form validation works same as create
- Confirmation modals prevent accidental actions
- Unauthorized access is blocked

**Deliverables**:
- EditJobComponent (or shared JobFormComponent)
- Confirmation modals
- Route guard
- Playwright tests

---

#### 9. Job Details View Component (3 points)
**Status**: Not Started
**Dependencies**: Job Posting model

**Tasks**:
- [ ] Create JobDetailsComponent (Angular)
  - Display full job posting details:
    - Title
    - Company name (from CompanyRegistration)
    - Location
    - Job type badge
    - Experience level
    - Status badge
    - Salary range (if provided)
    - Required skills (as badges/chips)
    - Preferred skills (if provided)
    - Benefits (if provided)
    - Full description (render rich HTML safely)
    - Application deadline (if provided)
    - Published date
    - View count
    - Application count
  - Action buttons (for company view):
    - "Edit Job" - Navigate to edit page
    - "Pause/Resume" - Change status
    - "Close Job" - Close job
    - "View Applications" - Navigate to applications (future)
  - Read-only view (for public/applicants in future sprints)
- [ ] Add social sharing buttons (optional)
  - Share on LinkedIn
  - Share on Twitter/X
  - Copy link to clipboard
- [ ] Add "Apply Now" button (for future public view)
  - Disabled for company view
  - Enabled for freelancer/public view
- [ ] Style job details page professionally
  - Clean typography
  - Skill badges with colors
  - Responsive layout
  - Print-friendly CSS (optional)
- [ ] Write Playwright tests
  - Test job details display correctly
  - Test action buttons work
  - Test responsive layout

**Acceptance Criteria**:
- Job details display all information clearly
- Rich HTML description renders safely
- Action buttons work correctly
- Page is professional and readable
- Responsive design works on mobile

**Deliverables**:
- JobDetailsComponent
- Professional styling
- Playwright tests

---

### 🔵 Priority 3: Production Readiness (15 points)

#### 10. Real SMTP Email Testing & Configuration (5 points)
**Status**: Sprint 4 carryover
**Current**: Using MockEmailService

**Tasks**:
- [ ] Choose email provider (final decision)
  - **Recommended**: AWS SES
    - Cost: $0 for first 62,000 emails/month (when called from EC2)
    - Professional deliverability
  - **Alternative**: SendGrid
    - Cost: $0 for 100 emails/day (dev), $19.95/month for 50k (production)
- [ ] Set up email provider account
  - Register for AWS SES or SendGrid
  - Verify domain (e.g., noreply@jobstream.com)
  - Configure SPF, DKIM, DMARC records for domain
  - Request production access (AWS SES sandbox removal)
- [ ] Implement production email service
  - Create AwsSesEmailService or SendGridEmailService
  - Install required NuGet packages
  - Implement IEmailService interface
  - Add configuration to appsettings.json
- [ ] Update appsettings.json
  ```json
  "Email": {
    "Provider": "AwsSes",  // or "SendGrid" or "Mock"
    "From": "noreply@jobstream.com",
    "FromName": "JobStream",
    "AwsSes": {
      "Region": "eu-central-1",
      "AccessKey": "ENV:AWS_SES_ACCESS_KEY",
      "SecretKey": "ENV:AWS_SES_SECRET_KEY"
    },
    "SendGrid": {
      "ApiKey": "ENV:SENDGRID_API_KEY"
    }
  }
  ```
- [ ] Update Program.cs to use environment-based email service
  - If development → MockEmailService (logs to console)
  - If production → AwsSesEmailService or SendGridEmailService
- [ ] Test all email templates in real email client
  - Email verification
  - Approval notification
  - Rejection notification
  - Credentials email
  - Password reset
  - Test in Gmail, Outlook, Apple Mail
  - Verify emails don't land in spam
  - Check formatting, links, images
- [ ] Update EMAIL_SERVICE_SETUP.md documentation
  - Configuration instructions
  - Environment variable setup
  - Troubleshooting guide
  - DNS record setup (SPF, DKIM, DMARC)
- [ ] Monitor email deliverability
  - Set up bounce handling
  - Track open rates (optional)
  - Track click rates (optional)

**Acceptance Criteria**:
- Production email service configured
- Emails delivered successfully to inbox (not spam)
- All templates tested in multiple email clients
- Documentation updated
- Environment-based service selection works

**Deliverables**:
- Production email service implementation
- Updated appsettings.json
- Tested email templates
- EMAIL_SERVICE_SETUP.md updated

---

#### 11. Apply AuditLog Migration & Complete Testing (3 points)
**Status**: Sprint 4 carryover
**Migration created but not applied**

**Tasks**:
- [ ] Restart API to apply AuditLog migration
  - Stop API
  - Verify migration files exist in Migrations folder
  - Run `dotnet ef database update` (if not auto-applied)
  - Start API
  - Verify AuditLog table exists in database
- [ ] Test AuditLog functionality
  - Trigger admin approve action
  - Check AuditLog table for new entry
  - Verify fields: Action, Timestamp, PerformedBy, DetailsJson, IP, UserAgent
  - Trigger admin reject action
  - Verify audit log entry
- [ ] Test Reject Modal workflow
  - Open reject modal
  - Test validation (reason required, min 10 chars)
  - Submit rejection
  - Verify rejection email sent (check console logs or real email)
  - Verify status updated to Rejected
  - Verify audit log entry created
- [ ] Add AuditLog display to admin dashboard
  - Show recent admin actions
  - Timeline view (similar to company detail page)
  - Filter by action type (optional)
- [ ] Write Playwright test for reject workflow
  - Test reject modal opens
  - Test validation errors
  - Test successful rejection

**Acceptance Criteria**:
- AuditLog table exists in database
- All admin actions are logged
- Reject modal workflow tested and working
- Audit log displayed in admin dashboard

**Deliverables**:
- AuditLog migration applied
- Reject workflow tested
- Playwright test for reject
- Audit log display component

---

#### 12. Production Build & CSS Budget Fix (2 points)
**Status**: Sprint 4 carryover
**Current**: Build warning at 9.31kB vs 8kB limit

**Tasks**:
- [ ] Review admin dashboard CSS bundle size
  - Run `npx nx build admin-dashboard --configuration=production`
  - Check bundle sizes in output
  - Identify large CSS files
- [ ] Optimize CSS bundle
  - Option 1: Increase budget in project.json
    ```json
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "500kb",
        "maximumError": "1mb"
      },
      {
        "type": "anyComponentStyle",
        "maximumWarning": "10kb",  // Increase from 8kb
        "maximumError": "15kb"
      }
    ]
    ```
  - Option 2: Split large component styles into separate files
  - Option 3: Remove unused CSS (PurgeCSS)
  - Option 4: Use SCSS mixins to reduce repetition
- [ ] Test production build
  - Build admin dashboard
  - Build company portal (new app)
  - Verify no errors or warnings
  - Test in production mode locally
- [ ] Update build documentation
  - Add build instructions to README
  - Document budget configuration

**Acceptance Criteria**:
- Production build completes without warnings
- CSS bundle within acceptable size
- All apps build successfully

**Deliverables**:
- Updated budget configuration
- Optimized CSS (if needed)
- Build documentation

---

#### 13. JWT Authentication Security Hardening (5 points)
**Status**: Sprint 4 partially complete
**Need to verify security best practices**

**Tasks**:
- [ ] Review JWT configuration
  - Verify secret key is strong (min 256 bits)
  - Verify secret is stored in environment variable (not hardcoded)
  - Verify access token expiration (15 minutes recommended)
  - Verify refresh token expiration (7 days recommended)
- [ ] Implement refresh token rotation
  - Store refresh tokens in database (RefreshToken table)
  - Fields: Token, UserId, ExpiresAt, IsRevoked, CreatedAt
  - On token refresh, revoke old token and issue new one
  - Prevent token reuse
- [ ] Add token revocation on logout
  - Create POST `/api/auth/logout` endpoint
  - Revoke refresh token
  - Clear token from client
- [ ] Implement token blacklist (optional)
  - Store revoked access tokens in cache (Redis or in-memory)
  - Check blacklist on every request
  - Tokens expire from blacklist after expiration time
- [ ] Add rate limiting to auth endpoints
  - Login: 5 attempts per 15 minutes per email
  - Password reset: 3 attempts per hour per email
  - Token refresh: 10 attempts per hour per user
- [ ] Add account lockout after failed logins
  - Lock account for 30 minutes after 5 failed attempts
  - Send email notification on lockout
  - Admin can unlock account
- [ ] Add password complexity validation
  - Min 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (optional)
- [ ] Add HTTPS enforcement
  - Redirect HTTP to HTTPS in production
  - Add HSTS header (Strict-Transport-Security)
- [ ] Security audit
  - Run OWASP ZAP scan
  - Review for OWASP Top 10 vulnerabilities
  - Test with invalid/expired tokens
  - Test with malformed tokens
- [ ] Write security tests
  - Test login rate limiting
  - Test account lockout
  - Test token expiration
  - Test token refresh
  - Test unauthorized access to protected endpoints

**Acceptance Criteria**:
- JWT secret is strong and stored securely
- Refresh token rotation works
- Logout revokes tokens
- Rate limiting prevents brute force
- Account lockout protects against attacks
- Password complexity enforced
- HTTPS enforced in production
- Security audit passes

**Deliverables**:
- RefreshToken table + migration
- Token revocation on logout
- Rate limiting on auth endpoints
- Account lockout mechanism
- Security audit report
- Security tests

---

### 🟢 Priority 4: Nice to Have (10 points)

#### 14. Job Posting Analytics (3 points)
**Status**: Not Started
**Future enhancement**

**Tasks**:
- [ ] Add view tracking to job postings
  - Increment ViewCount on job details page load
  - Prevent duplicate counts (use IP + session)
  - Track views over time (JobPostingView table)
- [ ] Add analytics dashboard for companies
  - Chart: Views per day (last 30 days)
  - Chart: Applications per day
  - Top performing jobs (by views/applications)
  - Conversion rate (views to applications)
- [ ] Add job posting performance score
  - Score based on: views, applications, time to first application
  - Suggestions to improve score (e.g., "Add salary range to increase applications")
- [ ] Create analytics API endpoint
  - GET `/api/company/jobs/{id}/analytics`
  - Returns: views, applications, conversion rate, performance score

**Acceptance Criteria**:
- View tracking works
- Analytics dashboard displays metrics
- Performance score provides useful insights

**Deliverables**:
- View tracking implementation
- Analytics dashboard component
- Performance score algorithm

---

#### 15. Job Posting Templates (2 points)
**Status**: Not Started
**Future enhancement**

**Tasks**:
- [ ] Create job posting templates
  - Predefined templates for common job types:
    - Software Engineer
    - Product Manager
    - Designer
    - Marketing Manager
    - Sales Representative
  - Each template includes:
    - Sample title
    - Sample description
    - Common required skills
    - Common benefits
- [ ] Add "Use Template" button in create job form
  - Modal with template selection
  - Preview template
  - Apply template to form
- [ ] Allow companies to save custom templates
  - "Save as Template" button in create/edit form
  - Manage templates page
  - Edit/delete custom templates
- [ ] Create JobPostingTemplate model
  - Id, CompanyRegistrationId, Name, Title, Description, RequiredSkills, etc.
  - IsPublic (bool) - Share template with other companies

**Acceptance Criteria**:
- Templates speed up job creation
- Companies can create custom templates
- Templates are editable after applying

**Deliverables**:
- Predefined templates
- Template selection modal
- Custom template management

---

#### 16. Email Notification Preferences (2 points)
**Status**: Not Started
**Future enhancement**

**Tasks**:
- [ ] Add email preferences to User model
  - EmailNotifications (JSON object)
    - newApplication: true
    - applicationStatusChange: true
    - weeklyDigest: true
    - systemUpdates: true
- [ ] Create email preferences page
  - Toggle switches for each notification type
  - Save preferences button
- [ ] Create API endpoint: PUT `/api/company/preferences/email`
  - Update email preferences
- [ ] Respect preferences when sending emails
  - Check preferences before sending
  - Skip email if disabled (except critical emails like password reset)
- [ ] Add unsubscribe link to all emails
  - Token-based unsubscribe (no login required)
  - Unsubscribe page: "You've been unsubscribed from [email type]"

**Acceptance Criteria**:
- Companies can control which emails they receive
- Preferences are respected
- Unsubscribe link works without login

**Deliverables**:
- Email preferences page
- API endpoint for preferences
- Unsubscribe functionality

---

#### 17. Multi-language Support (German/English) (3 points)
**Status**: Not Started
**Future enhancement**

**Tasks**:
- [ ] Add i18n to company portal
  - Install @angular/localize
  - Extract translatable strings
  - Create translation files (en.json, de.json)
- [ ] Translate all UI text
  - Navigation, buttons, labels, error messages
  - Job posting form fields
  - Dashboard text
- [ ] Add language switcher to header
  - Dropdown: English / Deutsch
  - Save preference to localStorage
  - Reload page with new language
- [ ] Add language preference to User model
  - PreferredLanguage (string, default "de")
- [ ] Send emails in user's preferred language
  - Create email templates in both languages
  - Select template based on user preference
  - Fallback to German if preference not set

**Acceptance Criteria**:
- UI available in German and English
- Language switcher works
- Email language matches user preference

**Deliverables**:
- i18n configuration
- Translation files
- Language switcher
- Multilingual email templates

---

## 📅 Sprint Timeline (2 Weeks)

### Week 1: Company Portal & Credentials

**Day 1-2: Credentials System**
- Extend User model
- CredentialsService implementation
- Update approve workflow to generate credentials
- Credentials email template
- Password reset endpoints

**Day 3-4: Company Portal Authentication**
- Create company-portal Angular app
- AuthService + HTTP interceptor
- Login, change-password, forgot-password components
- Layout component
- Auth guard + routing

**Day 5: Dashboard & Profile**
- DashboardComponent
- CompanyProfileComponent
- API endpoints for dashboard stats and profile
- Navigation integration

### Week 2: Job Posting Management

**Day 6-7: Job Posting Backend**
- Review/update JobPosting model
- JobPostingService implementation
- JobPostingController (8 endpoints)
- Database migrations
- Unit + integration tests

**Day 8-9: Job Posting UI - Part 1**
- JobListComponent with filtering
- JobPostingService (Angular)
- CreateJobComponent with rich text editor
- Skills tag input
- Form validation

**Day 10-11: Job Posting UI - Part 2**
- EditJobComponent
- JobDetailsComponent
- Confirmation modals
- Styling and polish
- Playwright tests

**Day 12: Production Readiness**
- Real SMTP email testing
- Apply AuditLog migration
- Test reject workflow
- Production build & CSS budget fix

**Day 13-14: Security & Polish**
- JWT security hardening
- Security audit
- Bug fixes
- Documentation updates
- Demo preparation
- Sprint review & retrospective

---

## 📊 Sprint Metrics

### Story Points
- **Priority 1 (Must Complete)**: 30 points
  - Credentials System: 8 points
  - Company Portal Auth: 7 points
  - Dashboard & Profile: 5 points
  - Job Posting Model: 5 points
  - Job Posting API: 5 points
- **Priority 2 (Should Complete)**: 20 points
  - Job List Component: 5 points
  - Create Job Form: 7 points
  - Edit Job Form: 5 points
  - Job Details View: 3 points
- **Priority 3 (Production Readiness)**: 15 points
  - Real SMTP Email: 5 points
  - AuditLog & Testing: 3 points
  - Production Build: 2 points
  - JWT Security: 5 points
- **Priority 4 (Nice to Have)**: 10 points
  - Analytics: 3 points
  - Templates: 2 points
  - Email Preferences: 2 points
  - Multi-language: 3 points

**Total**: 75 points
**Target**: Complete Priority 1 (30 points) + Priority 2 (20 points) + Priority 3 (15 points) = 65 points

### Success Criteria

**By End of Sprint:**
- ✅ Approved companies receive credentials automatically
- ✅ Company portal app created with authentication
- ✅ Companies can log in and change password
- ✅ Company dashboard displays statistics
- ✅ Job posting model and database ready
- ✅ Companies can create job postings (draft)
- ✅ Companies can edit and publish job postings
- ✅ Companies can manage job status (pause, close)
- ✅ Job list with filtering and pagination
- ✅ Real SMTP email service configured
- ✅ All Sprint 4 carryover items completed
- ✅ JWT security hardened
- ✅ E2E workflow tested and demo-ready

**Demo-Ready Features:**
1. Admin approves company registration
2. Company receives credentials email
3. Company logs in with temporary password
4. Company forced to change password on first login
5. Company sees dashboard with statistics
6. Company creates new job posting (draft)
7. Company edits job posting
8. Company publishes job posting (Active)
9. Company views job list with status filtering
10. Company pauses/resumes/closes job posting
11. All actions logged to audit trail
12. Real emails sent via SMTP

### Key Performance Indicators (KPIs)
- API response time: <500ms for 95th percentile
- Job creation time: <2s from submit to database
- Email delivery rate: >95%
- Code coverage: >80%
- Zero critical security vulnerabilities
- Company can create first job posting in <5 minutes

---

## 🔒 Security Checklist

### Authentication & Authorization
- [x] JWT tokens use strong secret (min 256 bits)
- [x] Access tokens expire after 15 minutes
- [ ] Refresh tokens stored securely in database with rotation
- [x] Passwords hashed with BCrypt (work factor 12)
- [x] Password requirements enforced
- [ ] Login rate limiting (5 attempts per 15 min)
- [ ] Account lockout after 5 failed attempts
- [ ] Token revocation on logout
- [ ] HTTPS enforced in production

### API Security
- [ ] All endpoints validate input with FluentValidation
- [ ] Rate limiting on auth endpoints
- [ ] Companies can only access their own data (enforced by CompanyRegistrationId)
- [ ] Job postings ownership validated on all actions
- [ ] Sensitive data not exposed in API responses
- [ ] CORS configured restrictively

### Data Security
- [x] Passwords hashed (not stored in plain text)
- [x] Sensitive data (IBAN) encrypted in database
- [ ] Audit trail for all company actions
- [ ] PII handled according to GDPR

---

## 📝 Documentation Updates Needed

### Developer Documentation
- [ ] Update README with Sprint 5 changes
- [ ] Document company portal setup
- [ ] Document job posting API
- [ ] Update Swagger/OpenAPI documentation
- [ ] Create COMPANY_PORTAL_SETUP.md

### User Documentation
- [ ] Company onboarding guide (after approval)
- [ ] Job posting creation guide
- [ ] Job management guide
- [ ] FAQ for companies

### Deployment Documentation
- [ ] Update DOCKER_DEPLOYMENT.md for company-portal app
- [ ] Environment variables reference for credentials system
- [ ] Email service configuration (real SMTP)

---

## ⚠️ Risks & Mitigation

### High Priority Risks

**Risk**: Credentials email not delivered (spam, incorrect email)
**Mitigation**: Use real SMTP with proper SPF/DKIM/DMARC, provide admin interface to resend credentials, allow admin to manually share credentials

**Risk**: Companies forget to change password on first login
**Mitigation**: Enforce password change with auth guard, send reminder email, lock account after 7 days without password change

**Risk**: Rich text editor allows XSS attacks
**Mitigation**: Sanitize HTML on backend, use Angular's built-in sanitization, whitelist allowed HTML tags, test with malicious inputs

### Medium Priority Risks

**Risk**: Job posting creation too complex (high drop-off rate)
**Mitigation**: Use templates, save drafts automatically, provide help text and examples, progressive disclosure (required fields first)

**Risk**: Time pressure to complete all Priority 1 + 2 tasks
**Mitigation**: Focus on Priority 1 first (30 points), defer Priority 4 to Sprint 6, simplify UI if needed

### Low Priority Risks

**Risk**: Migration conflicts (AuditLog + JobPosting + User changes)
**Mitigation**: Apply migrations incrementally, test in dev environment first, backup database before applying

---

## 🎯 Definition of Done

For each feature to be considered complete:
- [ ] Code written following C# and TypeScript best practices
- [ ] Unit tests written (>80% coverage for new code)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user workflows (Playwright)
- [ ] Code reviewed
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] Deployed to dev environment
- [ ] Manual testing completed
- [ ] No critical bugs remaining
- [ ] Acceptance criteria met

---

## 🔄 Rollover to Sprint 6 (If Needed)

If not completed in Sprint 5, these tasks will roll over:

### Priority 4 Tasks (Nice to Have)
- Job posting analytics (3 points)
- Job posting templates (2 points)
- Email notification preferences (2 points)
- Multi-language support (3 points)

### Potential Sprint 6 Features
- Job application form (for freelancers/job seekers)
- Application management UI (for companies)
- Applicant tracking system (ATS) features
- Freelancer profile creation
- Job search and filtering (public job board)
- Advanced search (location, skills, salary)
- Job recommendations (ML-based matching)
- Messaging system (company ↔ applicant)
- Interview scheduling
- Video interview integration

---

## 📞 Support & Resources

### Technical Resources
- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core
- **Angular**: https://angular.dev
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Rich Text Editors**: Quill (https://quilljs.com/), TinyMCE (https://www.tiny.cloud/)

### Email Service
- **AWS SES**: https://docs.aws.amazon.com/ses/
- **SendGrid**: https://docs.sendgrid.com/

---

## 📊 Sprint Review & Retrospective

### Sprint Review (End of Week 2)
- Demo complete company portal workflow
- Demo job posting creation and management
- Review completed vs planned work
- Update product backlog
- Gather stakeholder feedback

### Sprint Retrospective Questions
1. What went well in Sprint 5?
2. Was the credentials system easy to understand for companies?
3. How can we improve the job posting creation UX?
4. Did the real SMTP email integration go smoothly?
5. Which tasks took longer than estimated?

### Continuous Improvement Actions
- Refine story point estimates based on actual velocity
- Improve onboarding documentation based on user feedback
- Identify UI/UX improvements for Sprint 6
- Plan for job application workflow in next sprint

---

**Sprint Start Date**: [To be filled]
**Sprint End Date**: [To be filled]
**Sprint Lead**: [Your Name]
**Product Owner**: [To be filled]

---

## Quick Reference - Priority 1 Tasks (Must Complete)

1. **Credentials System** - 8 points
   - Extend User model
   - CredentialsService
   - Update approve workflow
   - Credentials email
   - Password reset

2. **Company Portal Auth** - 7 points
   - Create company-portal app
   - AuthService + interceptor
   - Login, change-password, forgot-password
   - Layout + auth guard

3. **Dashboard & Profile** - 5 points
   - DashboardComponent
   - CompanyProfileComponent
   - 2 API endpoints

4. **Job Posting Model** - 5 points
   - Review/update JobPosting model
   - Database migrations
   - JobApplication model (basic)

5. **Job Posting API** - 5 points
   - JobPostingService
   - JobPostingController (8 endpoints)
   - Tests

**Total Priority 1: 30 points**

Focus: Complete credentials + auth in Week 1, job posting in Week 2, production readiness throughout!
