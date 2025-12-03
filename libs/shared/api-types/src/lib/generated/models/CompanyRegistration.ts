/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address.js';
import type { RegistrationDocument } from './RegistrationDocument.js';
import type { RegistrationStatus } from './RegistrationStatus.js';
export type CompanyRegistration = {
    id?: string;
    companyEmail: string;
    primaryContactName: string;
    emailVerificationToken?: string | null;
    emailVerified?: boolean;
    emailVerificationTokenExpiry?: string | null;
    legalName?: string | null;
    registrationNumber?: string | null;
    vatId?: string | null;
    linkedInUrl?: string | null;
    addressJson?: string | null;
    address?: Address;
    industry?: string | null;
    companySize?: string | null;
    description?: string | null;
    bankName?: string | null;
    encryptedIban?: string | null;
    accountHolderName?: string | null;
    balanceProofDocumentId?: string | null;
    walletAddress?: string | null;
    stakeAmount?: number | null;
    smartContractAddress?: string | null;
    status: RegistrationStatus;
    createdAt?: string;
    updatedAt?: string | null;
    expiresAt?: string | null;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    reviewNotes?: string | null;
    reviewedBy?: string | null;
    reviewQueuePosition?: number | null;
    termsAccepted?: boolean;
    termsAcceptedAt?: string | null;
    documents?: Array<RegistrationDocument> | null;
};

