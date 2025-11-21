import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Service for Company Registration Flow (Public API)
 * Handles registration, email verification, and submission steps
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyRegistrationService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || 'http://localhost:5000/api';

  /**
   * Step 1: Start Registration
   * POST /api/company/register/start
   */
  startRegistration(request: StartRegistrationRequest): Observable<StartRegistrationResponse> {
    return this.http.post<StartRegistrationResponse>(
      `${this.baseUrl}/company/register/start`,
      request
    );
  }

  /**
   * Step 2: Verify Email
   * POST /api/company/register/verify-email
   */
  verifyEmail(registrationId: string, verificationToken: string): Observable<VerifyEmailResponse> {
    return this.http.post<VerifyEmailResponse>(
      `${this.baseUrl}/company/register/verify-email`,
      {
        registrationId,
        verificationToken
      }
    );
  }

  /**
   * Step 3: Update Company Details
   * PUT /api/company/register/{registrationId}/company-details
   */
  updateCompanyDetails(
    registrationId: string,
    details: UpdateCompanyDetailsRequest
  ): Observable<UpdateCompanyDetailsResponse> {
    return this.http.put<UpdateCompanyDetailsResponse>(
      `${this.baseUrl}/company/register/${registrationId}/company-details`,
      details
    );
  }

  /**
   * Step 4: Upload Document
   * POST /api/company/register/{registrationId}/documents
   */
  uploadDocument(
    registrationId: string,
    file: File,
    documentType: string
  ): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.http.post<UploadDocumentResponse>(
      `${this.baseUrl}/company/register/${registrationId}/documents`,
      formData
    );
  }

  /**
   * Step 5: Submit Financial Verification
   * POST /api/company/register/{registrationId}/financial-verification
   */
  submitFinancialVerification(
    registrationId: string,
    request: FinancialVerificationRequest
  ): Observable<FinancialVerificationResponse> {
    return this.http.post<FinancialVerificationResponse>(
      `${this.baseUrl}/company/register/${registrationId}/financial-verification`,
      request
    );
  }

  /**
   * Step 6: Submit for Review
   * POST /api/company/register/{registrationId}/submit
   */
  submitForReview(
    registrationId: string,
    request: SubmitRegistrationRequest
  ): Observable<SubmitRegistrationResponse> {
    return this.http.post<SubmitRegistrationResponse>(
      `${this.baseUrl}/company/register/${registrationId}/submit`,
      request
    );
  }

  /**
   * Get Registration Status
   * GET /api/company/register/{registrationId}/status
   */
  getRegistrationStatus(registrationId: string): Observable<RegistrationStatusResponse> {
    return this.http.get<RegistrationStatusResponse>(
      `${this.baseUrl}/company/register/${registrationId}/status`
    );
  }
}

// ===== Request/Response Types =====

export interface StartRegistrationRequest {
  companyEmail: string;
  primaryContactName: string;
}

export interface StartRegistrationResponse {
  registrationId: string;
  status: string;
  expiresAt: string;
}

export interface VerifyEmailResponse {
  verified: boolean;
  nextStep: string;
}

export interface UpdateCompanyDetailsRequest {
  legalName: string;
  registrationNumber: string;
  vatId: string;
  linkedInUrl?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  industry: string;
  companySize: string;
  description: string;
}

export interface UpdateCompanyDetailsResponse {
  saved: boolean;
  validationErrors: string[];
  nextStep: string;
}

export interface UploadDocumentResponse {
  documentId: string;
  fileName: string;
  uploadedAt: string;
  status: string;
}

export interface FinancialVerificationRequest {
  bankName: string;
  iban: string;
  accountHolderName: string;
  balanceProofDocumentId: string;
}

export interface FinancialVerificationResponse {
  verified: boolean;
  status: string;
  estimatedReviewTime: string;
}

export interface SubmitRegistrationRequest {
  termsAccepted: boolean;
  walletAddress: string;
  stakeAmount: number;
}

export interface SubmitRegistrationResponse {
  submitted: boolean;
  reviewQueuePosition: number;
  estimatedReviewTime: string;
  smartContractAddress?: string;
  nextSteps: string;
}

export interface RegistrationStatusResponse {
  registrationId: string;
  currentStep: string;
  completedSteps: string[];
  status: string;
  lastUpdated: string;
  expiresAt: string;
}
