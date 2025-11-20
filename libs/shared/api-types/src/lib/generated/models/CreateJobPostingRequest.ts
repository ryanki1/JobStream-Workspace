/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentStructureDto } from './PaymentStructureDto';
export type CreateJobPostingRequest = {
    companyId: string;
    title: string;
    description: string;
    requiredSkills: Array<string>;
    technologyStack: string;
    sprintDuration?: number;
    projectDuration?: number;
    paymentStructure: PaymentStructureDto;
    acceptanceCriteria: string;
    walletAddress?: string | null;
};

