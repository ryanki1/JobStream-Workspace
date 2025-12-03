/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest.js';
import type { PasswordResetConfirm } from '../models/PasswordResetConfirm.js';
import type { PasswordResetRequest } from '../models/PasswordResetRequest.js';
import type { RegisterRequest } from '../models/RegisterRequest.js';
import type { CancelablePromise } from '../core/CancelablePromise.js';
import { OpenAPI } from '../core/OpenAPI.js';
import { request as __request } from '../core/request.js';
export class AuthService {
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiAuthRegister({
        requestBody,
    }: {
        requestBody?: RegisterRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiAuthLogin({
        requestBody,
    }: {
        requestBody?: LoginRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiAuthPasswordResetRequest({
        requestBody,
    }: {
        requestBody?: PasswordResetRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Auth/password-reset/request',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiAuthPasswordResetConfirm({
        requestBody,
    }: {
        requestBody?: PasswordResetConfirm,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Auth/password-reset/confirm',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
