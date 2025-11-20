/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateJobPostingRequest } from '../models/CreateJobPostingRequest';
import type { JobPostingActionResponse } from '../models/JobPostingActionResponse';
import type { JobPostingResponse } from '../models/JobPostingResponse';
import type { UpdateJobPostingRequest } from '../models/UpdateJobPostingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JobPostingService {
    /**
     * @returns JobPostingActionResponse Created
     * @throws ApiError
     */
    public static postApiV1JobpostingsDraft({
        requestBody,
    }: {
        requestBody?: CreateJobPostingRequest,
    }): CancelablePromise<JobPostingActionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/jobpostings/draft',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Server Error`,
            },
        });
    }
    /**
     * @returns JobPostingActionResponse Success
     * @throws ApiError
     */
    public static putApiV1JobpostingsPublish({
        postingId,
    }: {
        postingId: string,
    }): CancelablePromise<JobPostingActionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/jobpostings/{postingId}/publish',
            path: {
                'postingId': postingId,
            },
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Server Error`,
            },
        });
    }
    /**
     * @returns JobPostingActionResponse Success
     * @throws ApiError
     */
    public static putApiV1Jobpostings({
        postingId,
        requestBody,
    }: {
        postingId: string,
        requestBody?: UpdateJobPostingRequest,
    }): CancelablePromise<JobPostingActionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/jobpostings/{postingId}',
            path: {
                'postingId': postingId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Server Error`,
            },
        });
    }
    /**
     * @returns JobPostingResponse Success
     * @throws ApiError
     */
    public static getApiV1Jobpostings({
        postingId,
    }: {
        postingId: string,
    }): CancelablePromise<JobPostingResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/jobpostings/{postingId}',
            path: {
                'postingId': postingId,
            },
            errors: {
                404: `Not Found`,
                500: `Server Error`,
            },
        });
    }
    /**
     * @returns JobPostingResponse Success
     * @throws ApiError
     */
    public static getApiV1JobpostingsLive(): CancelablePromise<Array<JobPostingResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/jobpostings/live',
            errors: {
                500: `Server Error`,
            },
        });
    }
    /**
     * @returns JobPostingResponse Success
     * @throws ApiError
     */
    public static getApiV1JobpostingsCompany({
        companyId,
    }: {
        companyId: string,
    }): CancelablePromise<Array<JobPostingResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/jobpostings/company/{companyId}',
            path: {
                'companyId': companyId,
            },
            errors: {
                500: `Server Error`,
            },
        });
    }
    /**
     * @returns JobPostingResponse Success
     * @throws ApiError
     */
    public static getApiV1JobpostingsDrafts(): CancelablePromise<Array<JobPostingResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/jobpostings/drafts',
            errors: {
                500: `Server Error`,
            },
        });
    }
}
