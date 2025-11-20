/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentStructureDto } from './PaymentStructureDto';
export type JobPostingResponse = {
    id?: string;
    blockchainPostingId?: number | null;
    companyId?: string | null;
    title?: string | null;
    description?: string | null;
    requiredSkills?: Array<string> | null;
    technologyStack?: string | null;
    sprintDuration?: number;
    projectDuration?: number;
    paymentStructure?: PaymentStructureDto;
    acceptanceCriteria?: string | null;
    repositoryLink?: string | null;
    jiraProjectId?: string | null;
    status?: string | null;
    createdByWalletAddress?: string | null;
    creationTransactionHash?: string | null;
    publishTransactionHash?: string | null;
    createdAt?: string;
    publishedAt?: string | null;
    updatedAt?: string | null;
};

