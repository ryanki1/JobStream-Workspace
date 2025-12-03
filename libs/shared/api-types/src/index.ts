export * from './lib/api-types.js';
export * from './lib/models.js';

// Export services and non-conflicting types from generated code
export { AuthService } from './lib/generated/services/AuthService.js';
export { AdminService } from './lib/generated/services/AdminService.js';
export { CompanyRegistrationService } from './lib/generated/services/CompanyRegistrationService.js';
export { HealthService } from './lib/generated/services/HealthService.js';
export { JobPostingService } from './lib/generated/services/JobPostingService.js';

export type { LoginRequest } from './lib/generated/models/LoginRequest.js';
export type { RegisterRequest } from './lib/generated/models/RegisterRequest.js';
export type { PasswordResetRequest } from './lib/generated/models/PasswordResetRequest.js';
export type { PasswordResetConfirm } from './lib/generated/models/PasswordResetConfirm.js';
export type { UserRole } from './lib/generated/models/UserRole.js';
export type { VerifyEmailRequest } from './lib/generated/models/VerifyEmailRequest.js';
export type { VerifyEmailResponse } from './lib/generated/models/VerifyEmailResponse.js';
export type { StartRegistrationRequest } from './lib/generated/models/StartRegistrationRequest.js';
export type { StartRegistrationResponse } from './lib/generated/models/StartRegistrationResponse.js';
export type { SubmitRegistrationRequest } from './lib/generated/models/SubmitRegistrationRequest.js';
export type { SubmitRegistrationResponse } from './lib/generated/models/SubmitRegistrationResponse.js';
export type { UploadDocumentResponse } from './lib/generated/models/UploadDocumentResponse.js';
export type { RegistrationStatusResponse } from './lib/generated/models/RegistrationStatusResponse.js';
export type { CreateJobPostingRequest } from './lib/generated/models/CreateJobPostingRequest.js';
export type { UpdateJobPostingRequest } from './lib/generated/models/UpdateJobPostingRequest.js';
export type { JobPostingResponse } from './lib/generated/models/JobPostingResponse.js';
export type { JobPostingActionResponse } from './lib/generated/models/JobPostingActionResponse.js';
export type { ErrorResponse } from './lib/generated/models/ErrorResponse.js';
export type { ErrorDetails } from './lib/generated/models/ErrorDetails.js';
export type { ProblemDetails } from './lib/generated/models/ProblemDetails.js';

export { ApiError } from './lib/generated/core/ApiError.js';
export { CancelablePromise, CancelError } from './lib/generated/core/CancelablePromise.js';
export { OpenAPI } from './lib/generated/core/OpenAPI.js';
export type { OpenAPIConfig } from './lib/generated/core/OpenAPI.js';
