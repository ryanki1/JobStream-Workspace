/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancialVerificationRequest } from '../models/FinancialVerificationRequest.js';
import type { FinancialVerificationResponse } from '../models/FinancialVerificationResponse.js';
import type { RegistrationStatusResponse } from '../models/RegistrationStatusResponse.js';
import type { StartRegistrationRequest } from '../models/StartRegistrationRequest.js';
import type { StartRegistrationResponse } from '../models/StartRegistrationResponse.js';
import type { SubmitRegistrationRequest } from '../models/SubmitRegistrationRequest.js';
import type { SubmitRegistrationResponse } from '../models/SubmitRegistrationResponse.js';
import type { UpdateCompanyDetailsRequest } from '../models/UpdateCompanyDetailsRequest.js';
import type { UpdateCompanyDetailsResponse } from '../models/UpdateCompanyDetailsResponse.js';
import type { UploadDocumentResponse } from '../models/UploadDocumentResponse.js';
import type { VerifyEmailRequest } from '../models/VerifyEmailRequest.js';
import type { VerifyEmailResponse } from '../models/VerifyEmailResponse.js';
import type { CancelablePromise } from '../core/CancelablePromise.js';
import { OpenAPI } from '../core/OpenAPI.js';
import { request as __request } from '../core/request.js';
export class CompanyRegistrationService {
    /**
     * @returns StartRegistrationResponse Created
     * @throws ApiError
     */
    public static postApiCompanyRegisterStart({
        requestBody,
    }: {
        requestBody?: StartRegistrationRequest,
    }): CancelablePromise<StartRegistrationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/company/register/start',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                409: `Conflict`,
            },
        });
    }
    /**
     * @returns VerifyEmailResponse Success
     * @throws ApiError
     */
    public static postApiCompanyRegisterVerifyEmail({
        requestBody,
    }: {
        requestBody?: VerifyEmailRequest,
    }): CancelablePromise<VerifyEmailResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/company/register/verify-email',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns UpdateCompanyDetailsResponse Success
     * @throws ApiError
     */
    public static putApiCompanyRegisterCompanyDetails({
        registrationId,
        requestBody,
    }: {
        registrationId: string,
        requestBody?: UpdateCompanyDetailsRequest,
    }): CancelablePromise<UpdateCompanyDetailsResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/company/register/{registrationId}/company-details',
            path: {
                'registrationId': registrationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns UploadDocumentResponse Created
     * @throws ApiError
     */
    public static postApiCompanyRegisterDocuments({
        registrationId,
        formData,
    }: {
        registrationId: string,
        formData?: {
            ContentType?: string;
            ContentDisposition?: string;
            Headers?: Record<string, Array<string>>;
            Length?: number;
            Name?: string;
            FileName?: string;
            documentType?: string;
        },
    }): CancelablePromise<UploadDocumentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/company/register/{registrationId}/documents',
            path: {
                'registrationId': registrationId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                413: `Client Error`,
            },
        });
    }
    /**
     * @returns FinancialVerificationResponse Success
     * @throws ApiError
     */
    public static postApiCompanyRegisterFinancialVerification({
        registrationId,
        requestBody,
    }: {
        registrationId: string,
        requestBody?: FinancialVerificationRequest,
    }): CancelablePromise<FinancialVerificationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/company/register/{registrationId}/financial-verification',
            path: {
                'registrationId': registrationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns RegistrationStatusResponse Success
     * @throws ApiError
     */
    public static getApiCompanyRegisterStatus({
        registrationId,
    }: {
        registrationId: string,
    }): CancelablePromise<RegistrationStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/company/register/{registrationId}/status',
            path: {
                'registrationId': registrationId,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns SubmitRegistrationResponse Success
     * @throws ApiError
     */
    public static postApiCompanyRegisterSubmit({
        registrationId,
        requestBody,
    }: {
        registrationId: string,
        requestBody?: SubmitRegistrationRequest,
    }): CancelablePromise<SubmitRegistrationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/company/register/{registrationId}/submit',
            path: {
                'registrationId': registrationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
}
