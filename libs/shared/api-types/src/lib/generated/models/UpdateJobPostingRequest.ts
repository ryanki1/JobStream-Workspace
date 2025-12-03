/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentStructureDto } from './PaymentStructureDto.js';
export type UpdateJobPostingRequest = {
    title?: string | null;
    description?: string | null;
    requiredSkills?: Array<string> | null;
    technologyStack?: string | null;
    sprintDuration?: number | null;
    projectDuration?: number | null;
    paymentStructure?: PaymentStructureDto;
    acceptanceCriteria?: string | null;
};

