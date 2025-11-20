// Re-export generated types from OpenAPI
import type {
  CompanyRegistration as GeneratedCompanyRegistration,
  RegistrationDocument as GeneratedRegistrationDocument,
  MLVerificationResult as GeneratedMLVerificationResult,
  ApproveRegistrationRequest as GeneratedApproveRegistrationRequest,
  RejectRegistrationRequest as GeneratedRejectRegistrationRequest,
} from './generated/index.js';

export type CompanyRegistration = GeneratedCompanyRegistration;
export type RegistrationDocument = GeneratedRegistrationDocument;
export type MLVerificationResult = GeneratedMLVerificationResult;
export type ApproveRegistrationRequest = GeneratedApproveRegistrationRequest;
export type RejectRegistrationRequest = GeneratedRejectRegistrationRequest;

// Keep our own enums for better developer experience
// These match the string values from the .NET API
export enum RegistrationStatus {
  Initiated = 'Initiated',
  EmailVerified = 'EmailVerified',
  DetailsSubmitted = 'DetailsSubmitted',
  DocumentsUploaded = 'DocumentsUploaded',
  FinancialSubmitted = 'FinancialSubmitted',
  PendingReview = 'PendingReview',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

// Additional response types
export interface RegistrationDetailResponse {
  registration: CompanyRegistration;
  mlVerifications: MLVerificationResult[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStatistics {
  totalRegistrations: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  emailVerifiedCount: number;
  averageReviewTimeHours?: number;
}

export interface MLVerificationHistoryResponse {
  registrationId: string;
  verificationCount: number;
  verifications: MLVerificationResult[];
}

// Job Posting Models (for future use)
export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string;
  compensation: string;
  location?: string;
  isRemote: boolean;
  category: string;
  status: JobPostingStatus;
  walletAddress: string;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export enum JobPostingStatus {
  Draft = 'Draft',
  Published = 'Published',
  Closed = 'Closed',
  Cancelled = 'Cancelled'
}

// Error Response
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: any;
}
