/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompanyRegistration } from './CompanyRegistration';
export type RegistrationDocument = {
    id?: string;
    companyRegistrationId: string;
    fileName: string;
    fileType: string;
    storagePath: string;
    fileSize?: number;
    documentType: string;
    uploadedAt?: string;
    encryptionKey?: string | null;
    secureUrl?: string | null;
    secureUrlExpiry?: string | null;
    status?: string | null;
    companyRegistration?: CompanyRegistration;
};

