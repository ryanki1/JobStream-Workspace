/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApproveRegistrationRequest } from '../models/ApproveRegistrationRequest.js';
import type { CompanyRegistration } from '../models/CompanyRegistration.js';
import type { MLVerificationResult } from '../models/MLVerificationResult.js';
import type { RejectRegistrationRequest } from '../models/RejectRegistrationRequest.js';
import type { CancelablePromise } from '../core/CancelablePromise.js';
import { OpenAPI } from '../core/OpenAPI.js';
import { request as __request } from '../core/request.js';
export class AdminService {
    /**
     * @returns CompanyRegistration Success
     * @throws ApiError
     */
    public static getApiAdminRegistrationsPending({
        page = 1,
        pageSize = 20,
    }: {
        page?: number,
        pageSize?: number,
    }): CancelablePromise<Array<CompanyRegistration>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/registrations/pending',
            query: {
                'page': page,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiAdminRegistrations({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/registrations/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns MLVerificationResult Success
     * @throws ApiError
     */
    public static postApiAdminRegistrationsVerifyMl({
        id,
    }: {
        id: string,
    }): CancelablePromise<MLVerificationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/registrations/{id}/verify-ml',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                503: `Server Error`,
            },
        });
    }
    /**
     * @returns MLVerificationResult Success
     * @throws ApiError
     */
    public static getApiAdminRegistrationsMlHistory({
        id,
    }: {
        id: string,
    }): CancelablePromise<Array<MLVerificationResult>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/registrations/{id}/ml-history',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiAdminStatistics(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/statistics',
        });
    }
    /**
     * @returns CompanyRegistration Success
     * @throws ApiError
     */
    public static postApiAdminRegistrationsApprove({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: ApproveRegistrationRequest,
    }): CancelablePromise<CompanyRegistration> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/registrations/{id}/approve',
            path: {
                'id': id,
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
     * @returns CompanyRegistration Success
     * @throws ApiError
     */
    public static postApiAdminRegistrationsReject({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: RejectRegistrationRequest,
    }): CancelablePromise<CompanyRegistration> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/registrations/{id}/reject',
            path: {
                'id': id,
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
