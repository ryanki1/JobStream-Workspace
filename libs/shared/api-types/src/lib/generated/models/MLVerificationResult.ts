/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompanyRegistration } from './CompanyRegistration.js';
import type { RiskLevel } from './RiskLevel.js';
export type MLVerificationResult = {
    id?: string;
    registrationId: string;
    registration?: CompanyRegistration;
    overallRiskScore: number;
    riskLevel: RiskLevel;
    confidence: number;
    webIntelligenceJson?: string | null;
    sentimentAnalysisJson?: string | null;
    riskFlagsJson?: string | null;
    recommendationsJson?: string | null;
    verifiedAt: string;
    processingTimeMs: number;
    riskFlags?: Array<string> | null;
    recommendations?: Array<string> | null;
};

